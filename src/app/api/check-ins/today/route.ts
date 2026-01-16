import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkInEntries } from "@/db/schema/checkInEntry";
import { notificationSettings } from "@/db/schema/notificationSettings";
import { requireClerkUserId } from "@/lib/serverAuth";
import { startOfLocalDay } from "@/utils/date/startOfLocalDay";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { parseIntParam } from "@/utils/parseIntParam";

type NotificationTime = { hour: number; minute: number };

function computeNextReminderAtUtc(opts: {
  nowUtc: Date;
  tzOffsetMinutes: number; // JS getTimezoneOffset() convention
  times: NotificationTime[];
}): Date | null {
  const { nowUtc, tzOffsetMinutes } = opts;
  const times = [...opts.times].sort((a, b) =>
    a.hour !== b.hour ? a.hour - b.hour : a.minute - b.minute
  );

  if (times.length === 0) return null;

  // Convert now into "local-frame" time by subtracting offset minutes
  const nowLocalFrame = new Date(nowUtc.getTime() - tzOffsetMinutes * 60_000);

  // Build local "today" components in UTC fields (because we're using a shifted frame)
  const y = nowLocalFrame.getUTCFullYear();
  const m = nowLocalFrame.getUTCMonth();
  const d = nowLocalFrame.getUTCDate();

  // Find next scheduled time today (in local-frame)
  for (const t of times) {
    const candidateLocal = new Date(Date.UTC(y, m, d, t.hour, t.minute, 0, 0));
    if (candidateLocal.getTime() > nowLocalFrame.getTime()) {
      // Convert candidate back to UTC
      return new Date(candidateLocal.getTime() + tzOffsetMinutes * 60_000);
    }
  }

  // Otherwise tomorrow at earliest time
  const first = times[0];
  const tomorrowLocal = new Date(
    Date.UTC(y, m, d + 1, first.hour, first.minute, 0, 0)
  );
  return new Date(tomorrowLocal.getTime() + tzOffsetMinutes * 60_000);
}

function isValidTime(t: any): t is NotificationTime {
  return (
    t &&
    Number.isInteger(t.hour) &&
    Number.isInteger(t.minute) &&
    t.hour >= 0 &&
    t.hour <= 23 &&
    t.minute >= 0 &&
    t.minute <= 59
  );
}

export async function GET(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const url = new URL(req.url);
    const tzOffsetMinutes = parseIntParam(
      url.searchParams.get("tzOffsetMinutes"),
      0
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
        >`avg(${checkInEntries.energyLevel})`.mapWith((v) =>
          v == null ? null : Number(v)
        ),
        painAvg: sql<number | null>`avg(${checkInEntries.painLevel})`.mapWith(
          (v) => (v == null ? null : Number(v))
        ),
      })
      .from(checkInEntries)
      .where(
        and(
          eq(checkInEntries.userId, user.id),
          gte(checkInEntries.createdAt, startUtc),
          lt(checkInEntries.createdAt, endUtc)
        )
      );

    const last = await db
      .select({
        id: checkInEntries.id,
        createdAt: checkInEntries.createdAt,
        energyLevel: checkInEntries.energyLevel,
        painLevel: checkInEntries.painLevel,
      })
      .from(checkInEntries)
      .where(
        and(
          eq(checkInEntries.userId, user.id),
          gte(checkInEntries.createdAt, startUtc),
          lt(checkInEntries.createdAt, endUtc)
        )
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

    if (notificationRow[0]?.enabled) {
      const settings: any = notificationRow[0].settings;

      const timesRaw: unknown =
        settings?.checkIns?.schedule?.times ??
        settings?.settings?.checkIns?.schedule?.times;

      const times: NotificationTime[] = Array.isArray(timesRaw)
        ? timesRaw.filter(isValidTime)
        : [];

      const next = computeNextReminderAtUtc({
        nowUtc: now,
        tzOffsetMinutes,
        times,
      });

      nextReminderAt = next ? next.toISOString() : null;
    }

    return NextResponse.json({
      success: true,
      data: {
        dayStartUtc: startUtc.toISOString(),
        dayEndUtc: endUtc.toISOString(),
        count: agg?.count ?? 0,
        energyAvg: agg?.energyAvg ?? null,
        painAvg: agg?.painAvg ?? null,
        lastCheckIn: last[0]
          ? {
              id: last[0].id,
              createdAt: last[0].createdAt.toISOString(),
              energyLevel: Number(last[0].energyLevel),
              painLevel: Number(last[0].painLevel),
            }
          : null,
        nextReminderAt,
      },
    });
  } catch (err: any) {
    console.error("[api/check-ins/today GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
