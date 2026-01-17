import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { checkInEntries } from '@/db/schema/checkInEntry';
import { notificationSettings } from '@/db/schema/notificationSettings';
import { requireClerkUserId } from '@/lib/serverAuth';
import { startOfLocalDay } from '@/utils/date/startOfLocalDay';
import { getAppUserByClerkId } from '@/utils/getAppUserIdByClerkId';
import { jsonError } from '@/utils/jsonError';
import { parseIntParam } from '@/utils/parseIntParam';
import {
  computeNextReminderAtUtc,
  normalizeSchedule,
} from '@/features/notifications/utils';

type TodayResponse = {
  dayStartUtc: string;
  dayEndUtc: string;
  count: number;
  energyAvg: number | null;
  painAvg: number | null;
  lastCheckIn: null | { createdAt: string };
  nextReminderAt: string | null; // ISO UTC
  target: number;
};

export async function GET(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, 'User not found');

    const url = new URL(req.url);
    const tzOffsetMinutes = parseIntParam(
      url.searchParams.get('tzOffsetMinutes'),
      0,
    );

    const now = new Date();
    const startUtc = startOfLocalDay(now, tzOffsetMinutes);
    const endUtc = new Date(startUtc);
    endUtc.setUTCDate(endUtc.getUTCDate() + 1);

    const [agg] = await db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
        energyAvg: sql<
          number | null
        >`avg(${checkInEntries.energyLevel})`.mapWith((value) =>
          value == null ? null : Number(value),
        ),
        painAvg: sql<number | null>`avg(${checkInEntries.painLevel})`.mapWith(
          (value) => (value == null ? null : Number(value)),
        ),
      })
      .from(checkInEntries)
      .where(
        and(
          eq(checkInEntries.userId, user.id),
          gte(checkInEntries.createdAt, startUtc),
          lt(checkInEntries.createdAt, endUtc),
        ),
      );

    const last = await db
      .select({
        createdAt: checkInEntries.createdAt,
      })
      .from(checkInEntries)
      .where(
        and(
          eq(checkInEntries.userId, user.id),
          gte(checkInEntries.createdAt, startUtc),
          lt(checkInEntries.createdAt, endUtc),
        ),
      )
      .orderBy(desc(checkInEntries.createdAt))
      .limit(1);

    const notificationRow = await db
      .select({
        enabled: notificationSettings.enabled,
        settings: notificationSettings.settings,
      })
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, user.id))
      .limit(1);

    let nextReminderAt: string | null = null;

    // Product rule: default target is 2 check-ins/day.
    // If you want target=0 when reminders are disabled, set target=0 when !enabled.
    let target = 2;

    if (notificationRow[0]?.enabled) {
      // JSONB comes back as unknown; normalizeSchedule handles both schema shapes.
      const settings: unknown = notificationRow[0].settings;

      const schedule = normalizeSchedule(settings);
      const times = schedule.times;

      // target logic:
      // - twice_daily => 2
      // - custom => at least 2 (or use times.length directly if you want)
      if (schedule.frequency === 'custom') {
        target = Math.max(2, times.length);
      } else {
        target = 2;
      }

      const next = computeNextReminderAtUtc({
        nowUtc: now,
        tzOffsetMinutes,
        times,
      });

      nextReminderAt = next ? next.toISOString() : null;
    }

    const payload: TodayResponse = {
      dayStartUtc: startUtc.toISOString(),
      dayEndUtc: endUtc.toISOString(),
      count: agg?.count ?? 0,
      energyAvg: agg?.energyAvg ?? null,
      painAvg: agg?.painAvg ?? null,
      lastCheckIn: last[0]
        ? { createdAt: last[0].createdAt.toISOString() }
        : null,
      nextReminderAt,
      target,
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (err: unknown) {
    console.error('[api/check-ins/today GET] ERROR:', err);
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return jsonError(401, 'Unauthorized');
    }
    return jsonError(500, 'Internal server error');
  }
}
