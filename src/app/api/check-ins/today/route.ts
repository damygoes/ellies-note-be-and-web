import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkInEntries } from "@/db/schema/checkInEntry";
import { requireClerkUserId } from "@/lib/serverAuth";
import { startOfLocalDay } from "@/utils/date/startOfLocalDay";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { parseIntParam } from "@/utils/parseIntParam";

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
      },
    });
  } catch (err: any) {
    console.error("[api/check-ins/today GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
