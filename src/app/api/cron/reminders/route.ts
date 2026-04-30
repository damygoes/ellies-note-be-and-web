import { db } from "@/db";
import { notificationSettings } from "@/db/schema/notificationSettings";
import { pushTokens } from "@/db/schema/pushTokens";
import { reminderSends } from "@/db/schema/reminderSends";
import { users } from "@/db/schema/user";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type ScheduleTime = { hour: number; minute: number };

type SendArgs = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

async function sendExpoPush(expoPushToken: string, payload: SendArgs) {
  const message = {
    to: expoPushToken,
    sound: "default",
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

  return json;
}

// QStash-only handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = verifySignatureAppRouter(async (_req: Request) => {
  try {
    const now = new Date();

    const rows = await db
      .select({
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
      .where(eq(notificationSettings.enabled, true));

    let sentCount = 0;

    for (const row of rows) {
      const timezone = row.timezone ?? "";
      if (!timezone) continue;

      const { morningHour, eveningHour } = row.settings;
      const times: ScheduleTime[] = [
        { hour: morningHour, minute: 0 },
        { hour: eveningHour, minute: 0 },
      ];

      const due = getDueSlotMinute({ now, timezone, times, windowMinutes: 1 });
      if (!due) continue;

      try {
        await db.insert(reminderSends).values({
          userId: row.userId,
          localDate: due.localDate,
          minuteOfDay: due.minuteOfDay,
        });
      } catch {
        // already sent this slot
        continue;
      }

      await sendExpoPush(row.expoPushToken, {
        title: "Time for a check-in",
        body: "A 30-second check-in helps spot patterns.",
        data: { kind: "check_in_reminder" },
      });

      sentCount += 1;
    }

    return NextResponse.json({ success: true, sentCount });
  } catch (e) {
    console.error("[cron/reminders] ERROR:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
});

function minuteOfDay(t: ScheduleTime) {
  return t.hour * 60 + t.minute;
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
  const localMinuteOfDay = Number(h) * 60 + Number(mi);

  return { localDate, localMinuteOfDay };
}

function getDueSlotMinute({
  now,
  timezone,
  times,
  windowMinutes = 3,
}: {
  now: Date;
  timezone: string;
  times: ScheduleTime[];
  windowMinutes?: number;
}): { localDate: string; minuteOfDay: number } | null {
  const { localDate, localMinuteOfDay } = getLocalParts(now, timezone);

  const slots = times.map(minuteOfDay).sort((a, b) => a - b);

  for (const slot of slots) {
    if (localMinuteOfDay >= slot && localMinuteOfDay < slot + windowMinutes) {
      return { localDate, minuteOfDay: slot };
    }
  }

  return null;
}
