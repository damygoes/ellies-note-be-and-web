import { and, eq, gte, lt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkInEntries } from "@/db/schema/checkInEntry";
import { requireClerkUserId } from "@/lib/serverAuth";
import { addDaysUtc } from "@/utils/date/addDaysUtc";
import { isoDayKey } from "@/utils/date/isoDayKey";
import { startOfLocalDay } from "@/utils/date/startOfLocalDay";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { parseIntParam } from "@/utils/parseIntParam";

type Bucket = "day" | "week" | "month";

function parseBucket(value: string | null): Bucket {
  if (value === "week" || value === "month" || value === "day") return value;
  return "day";
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
    const tzParam = sql.param(tzOffsetMinutes);

    const shifted = sql`(${checkInEntries.createdAt} - (${tzParam} * interval '1 minute'))`;

    // bucket=day
    const bucketExpr = sql`date_trunc('day', ${shifted})`;

    const rangeDaysRaw = parseIntParam(url.searchParams.get("range"), 7);
    const rangeDays = Math.min(365, Math.max(1, rangeDaysRaw));

    const bucket = parseBucket(url.searchParams.get("bucket"));

    const now = new Date();
    const endUtc = addDaysUtc(startOfLocalDay(now, tzOffsetMinutes), 1); // tomorrow local start (UTC)
    const startUtc = addDaysUtc(endUtc, -rangeDays); // rangeDays back

    // Shift timestamps into "local time" for grouping, using tzOffsetMinutes.
    // localTs = createdAt - tzOffsetMinutes minutes
    const localTs = sql`(${checkInEntries.createdAt} - (${tzOffsetMinutes} * interval '1 minute'))`;

    const rows = await db
      .select({
        bucketStart: bucketExpr,
        count: sql<number>`count(*)`,
        energyAvg: sql<number | null>`avg(${checkInEntries.energyLevel})`,
        painAvg: sql<number | null>`avg(${checkInEntries.painLevel})`,
      })
      .from(checkInEntries)
      .where(
        and(
          eq(checkInEntries.userId, user.id),
          gte(checkInEntries.createdAt, startUtc),
          lt(checkInEntries.createdAt, endUtc)
        )
      )
      .groupBy(bucketExpr)
      .orderBy(bucketExpr);

    /**
     * Output format:
     * - bucketStart is returned as ISO.
     * - NOTE: bucketStart is a "local-frame" timestamp produced by shifting createdAt and truncating.
     *   That’s fine for display buckets; the client can label as needed.
     */
    const series = rows.map((row) => ({
      bucketStart: new Date(row.bucketStart as unknown as Date).toISOString(),
      count: row.count,
      energyAvg: row.energyAvg,
      painAvg: row.painAvg,
    }));

    /**
     * For day bucket, it’s usually helpful to fill missing days so charts don’t “break”.
     * We’ll fill only for bucket=day.
     */
    if (bucket === "day") {
      const map = new Map<string, (typeof series)[number]>();
      for (const s of series) map.set(isoDayKey(new Date(s.bucketStart)), s);

      const filled: (typeof series)[number][] = [];
      // We want rangeDays buckets ending at endUtc (exclusive)
      // Build local day keys by stepping startUtc..endUtc
      for (let i = 0; i < rangeDays; i++) {
        const d = addDaysUtc(startUtc, i);
        const k = isoDayKey(d);
        const existing = map.get(k);

        filled.push(
          existing ?? {
            bucketStart: d.toISOString(),
            count: 0,
            energyAvg: null,
            painAvg: null,
          }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          bucket,
          rangeDays,
          startUtc: startUtc.toISOString(),
          endUtc: endUtc.toISOString(),
          series: filled,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        bucket,
        rangeDays,
        startUtc: startUtc.toISOString(),
        endUtc: endUtc.toISOString(),
        series,
      },
    });
  } catch (err: any) {
    console.error("[api/check-ins/stats GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
