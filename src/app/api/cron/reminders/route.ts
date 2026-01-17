import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema/user';
import { notificationSettings } from '@/db/schema/notificationSettings';
import { pushTokens } from '@/db/schema/pushTokens';
import { reminderSends } from '@/db/schema/reminderSends';

type ScheduleTime = { hour: number; minute: number };

type SendArgs = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

async function sendExpoPush(expoPushToken: string, payload: SendArgs) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
  };

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  const json = await res.json().catch(() => null);

  // Expo returns 200 even for some token errors; check payload for status
  if (!res.ok) {
    throw new Error(`Expo push failed: ${res.status}`);
  }

  // If desired: handle "DeviceNotRegistered" by deleting the token row later.
  return json;
}

// QStash-only handler
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

    console.log('[cron/reminders] rows:', rows.length);

    for (const row of rows) {
      const timezone = row.timezone ?? '';
      if (!timezone) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const schedule = (row.settings as any)?.checkIns?.schedule;
      console.log('[cron/reminders] user', row.userId, {
        token: row.expoPushToken?.slice(0, 20) + '...',
        timezone: row.timezone,
        times: schedule?.times,
      });
      const times: ScheduleTime[] = schedule?.times ?? [];
      if (!Array.isArray(times) || times.length === 0) continue;

      const due = getDueSlotMinute({ now, timezone, times, windowMinutes: 1 });
      console.log('[cron/reminders] due?', row.userId, due);
      if (!due) continue;

      // Dedupe: only send once per user per local day per slot-minute
      // Insert will fail with unique constraint if already sent.
      try {
        await db.insert(reminderSends).values({
          userId: row.userId,
          localDate: due.localDate,
          minuteOfDay: due.minuteOfDay,
        });
      } catch {
        // already sent
        continue;
      }

      const expoRes = await sendExpoPush(row.expoPushToken, {
        title: 'Time for a check-in',
        body: 'A 30-second check-in helps spot patterns.',
        data: { kind: 'check_in_reminder' },
      });
      console.log('[cron/reminders] expo response', row.userId, expoRes);

      sentCount += 1;
    }

    return NextResponse.json({ success: true, sentCount });
  } catch (e) {
    console.error('[cron/reminders] ERROR:', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
});

function isValidTime(t: ScheduleTime) {
  return (
    Number.isInteger(t.hour) &&
    Number.isInteger(t.minute) &&
    t.hour >= 0 &&
    t.hour <= 23 &&
    t.minute >= 0 &&
    t.minute <= 59
  );
}

function minuteOfDay(t: ScheduleTime) {
  return t.hour * 60 + t.minute;
}

function getLocalParts(now: Date, timezone: string) {
  // Produces stable local parts using IANA timezone
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = dtf.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  const y = get('year');
  const mo = get('month');
  const d = get('day');
  const h = get('hour');
  const mi = get('minute');

  if (!y || !mo || !d || !h || !mi) {
    throw new Error('Failed to compute local parts');
  }

  const localDate = `${y}-${mo}-${d}`; // ISO date key in local tz
  const localMinuteOfDay = Number(h) * 60 + Number(mi);

  return { localDate, localMinuteOfDay };
}

/**
 * Returns the scheduled minute-of-day if "due now" (within window), else null.
 * Window is important because cron might drift a bit.
 */
function getDueSlotMinute({
  now,
  timezone,
  times,
  windowMinutes = 1,
}: {
  now: Date;
  timezone: string;
  times: ScheduleTime[];
  windowMinutes?: number;
}): { localDate: string; minuteOfDay: number } | null {
  if (!timezone) return null;

  const { localDate, localMinuteOfDay } = getLocalParts(now, timezone);

  // normalize + sort times
  const cleaned = times.filter(isValidTime).map((t) => minuteOfDay(t));
  cleaned.sort((a, b) => a - b);

  for (const slot of cleaned) {
    const diff = Math.abs(localMinuteOfDay - slot);
    if (diff <= windowMinutes) {
      return { localDate, minuteOfDay: slot };
    }
  }

  return null;
}
