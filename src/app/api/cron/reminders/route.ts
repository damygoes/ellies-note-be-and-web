import { db } from "@/db";
import { notificationSettings } from "@/db/schema/notificationSettings";
import { pushTokens } from "@/db/schema/pushTokens";
import { reminderSends } from "@/db/schema/reminderSends";
import { users } from "@/db/schema/user";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type SendArgs = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

async function sendExpoPush(expoPushToken: string, payload: SendArgs) {
  const message = {
    to: expoPushToken,
    sound: "default",
    priority: "high",
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
  };

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(`Expo push failed: ${res.status}`);
  }

  if (json?.data?.status === "error") {
    console.warn("[sendExpoPush] Expo ticket error:", json.data);
  } else {
    console.log("[sendExpoPush] Ticket OK:", json?.data);
  }

  return json;
}

async function runReminderNotifications() {
  const now = new Date();
  console.log("[cron/reminders] Running at", now.toISOString());

  // DISTINCT ON users.id ordered by most-recent token ensures we send to the
  // newest registered token even if stale rows exist from prior installs.
  const rows = await db
    .selectDistinctOn([users.id], {
      userId: users.id,
      timezone: users.timezone,
      expoPushToken: pushTokens.expoPushToken,
      settings: notificationSettings.settings,
    })
    .from(users)
    .innerJoin(
      notificationSettings,
      eq(notificationSettings.userId, users.id),
    )
    .innerJoin(pushTokens, eq(pushTokens.userId, users.id))
    .where(eq(notificationSettings.enabled, true))
    .orderBy(users.id, desc(pushTokens.updatedAt));

  console.log(`[cron/reminders] Eligible users with tokens: ${rows.length}`);

  if (rows.length === 0) {
    console.log(
      "[cron/reminders] No eligible users — check that notification_settings.enabled=true and push_tokens row exists",
    );
  }

  let sentCount = 0;

  for (const row of rows) {
    const timezone = row.timezone ?? "";
    console.log(
      `[cron/reminders] User ${row.userId} | timezone="${timezone}" | token="${row.expoPushToken.slice(0, 30)}..."`,
    );

    if (!timezone) {
      console.log(`[cron/reminders]   ↳ Skipped — no timezone set`);
      continue;
    }

    const { morningMinute, eveningMinute } = row.settings as {
      morningMinute: number;
      eveningMinute: number;
    };
    console.log(
      `[cron/reminders]   Settings: morningMinute=${morningMinute} (${minuteToTime(morningMinute)}), eveningMinute=${eveningMinute} (${minuteToTime(eveningMinute)})`,
    );

    const slots = [morningMinute, eveningMinute];
    const due = getDueSlotMinute({ now, timezone, slots, windowMinutes: 3 });

    if (!due) {
      let localMinute: number | undefined;
      try {
        const parts = getLocalParts(now, timezone);
        localMinute = parts.localMinuteOfDay;
      } catch {
        // ignore
      }
      console.log(
        `[cron/reminders]   ↳ Not in window. Local time: ${localMinute !== undefined ? minuteToTime(localMinute) : "unknown"} — slots fire at ${slots.map(minuteToTime).join(", ")} (±3 min)`,
      );
      continue;
    }

    console.log(
      `[cron/reminders]   ↳ Due slot: ${minuteToTime(due.minuteOfDay)} on ${due.localDate}`,
    );

    try {
      await db.insert(reminderSends).values({
        userId: row.userId,
        localDate: due.localDate,
        minuteOfDay: due.minuteOfDay,
      });
    } catch {
      console.log(
        `[cron/reminders]   ↳ Skipped — already sent for ${due.localDate} at minute ${due.minuteOfDay}`,
      );
      continue;
    }

    const isMorning = due.minuteOfDay < 12 * 60;
    console.log(
      `[cron/reminders]   ↳ Sending ${isMorning ? "morning" : "evening"} notification...`,
    );

    await sendExpoPush(row.expoPushToken, {
      title: isMorning ? "Morning check-in" : "Evening check-in",
      body: isMorning
        ? "How are you feeling this morning? A quick log helps spot patterns."
        : "How was your energy today? Take a moment to log your check-in.",
      data: {
        kind: "check_in_reminder",
        url: "/(app)/(protected)/(tabs)/log",
      },
    });

    sentCount += 1;
    console.log(`[cron/reminders]   ↳ Sent OK`);
  }

  console.log(`[cron/reminders] Done. sentCount=${sentCount}`);
  return { sentCount };
}

// QStash-only handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = verifySignatureAppRouter(async (_req: Request) => {
  try {
    const result = await runReminderNotifications();
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("[cron/reminders] ERROR:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
});

// Manual trigger — requires Authorization: Bearer <CRON_SECRET>
// Set CRON_SECRET in your env file, then:
//   curl -X GET https://<your-domain>/api/cron/reminders \
//     -H "Authorization: Bearer <CRON_SECRET>"
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET env var not set" },
      { status: 403 },
    );
  }

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runReminderNotifications();
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("[cron/reminders] ERROR:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

function minuteToTime(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  const period = h < 12 ? "AM" : "PM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${String(m).padStart(2, "0")} ${period}`;
}

function getLocalParts(now: Date, timezone: string) {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  const y = get("year");
  const mo = get("month");
  const d = get("day");
  const h = get("hour");
  const mi = get("minute");

  if (!y || !mo || !d || !h || !mi) {
    throw new Error("Failed to compute local parts");
  }

  const localDate = `${y}-${mo}-${d}`;
  // hour12: false can return "24" at midnight in some environments — clamp to 0
  const localMinuteOfDay = (Number(h) % 24) * 60 + Number(mi);

  return { localDate, localMinuteOfDay };
}

function getDueSlotMinute({
  now,
  timezone,
  slots,
  windowMinutes = 3,
}: {
  now: Date;
  timezone: string;
  slots: number[]; // minute-of-day values
  windowMinutes?: number;
}): { localDate: string; minuteOfDay: number } | null {
  const { localDate, localMinuteOfDay } = getLocalParts(now, timezone);

  const sorted = [...slots].sort((a, b) => a - b);

  for (const slot of sorted) {
    if (localMinuteOfDay >= slot && localMinuteOfDay < slot + windowMinutes) {
      return { localDate, minuteOfDay: slot };
    }
  }

  return null;
}
