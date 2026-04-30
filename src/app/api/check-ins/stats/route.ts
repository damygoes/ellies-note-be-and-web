import { and, eq, gte, lt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkInEntries } from "@/db/schema/checkInEntry";
import { requireClerkUserId } from "@/lib/serverAuth";
import { addDaysUtc } from "@/utils/date/addDaysUtc";
import { startOfLocalDay } from "@/utils/date/startOfLocalDay";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { parseIntParam } from "@/utils/parseIntParam";

type Bucket = "day" | "week" | "month";

function parseBucket(v: string | null): Bucket {
  if (v === "week" || v === "month" || v === "day") return v;
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
      0,
    );
    const bucket = parseBucket(url.searchParams.get("bucket"));

    const rangeDaysRaw = parseIntParam(url.searchParams.get("range"), 7);
    const rangeDays = Math.min(365, Math.max(1, rangeDaysRaw));

    const now = new Date();
    const endUtc = addDaysUtc(startOfLocalDay(now, tzOffsetMinutes), 1);
    const startUtc = addDaysUtc(endUtc, -rangeDays);

    const tzParam = sql.param(tzOffsetMinutes);
    const shifted = sql`(${checkInEntries.createdAt} - (${tzParam} * interval '1 minute'))`;

    const dayKeyExpr = sql<string>`(${shifted}::date)::text`.as("dayKey");

    const bucketStartExpr =
      bucket === "month"
        ? sql`date_trunc('month', ${shifted})`
        : bucket === "week"
          ? sql`date_trunc('week', ${shifted})`
          : sql`date_trunc('day', ${shifted})`;

    const bucketStart = bucketStartExpr.as("bucketStart");

    const base = db
      .select({
        bucketStart,
        dayKey: dayKeyExpr,
        energyLevel: checkInEntries.energyLevel,
      })
      .from(checkInEntries)
      .where(
        and(
          eq(checkInEntries.userId, user.id),
          gte(checkInEntries.createdAt, startUtc),
          lt(checkInEntries.createdAt, endUtc),
        ),
      )
      .as("base");

    const rows = await db
      .select({
        bucketStart: base.bucketStart,
        dayKey: base.dayKey,
        count: sql<number>`count(*)`,
        energyAvg: sql<number | null>`avg(${base.energyLevel})`,
      })
      .from(base)
      .groupBy(base.bucketStart, base.dayKey)
      .orderBy(base.bucketStart);

    const series = rows.map((row) => ({
      bucketStart: new Date(row.bucketStart as unknown as Date).toISOString(),
      dayKey: row.dayKey,
      count: row.count,
      energyAvg: row.energyAvg,
    }));

    if (bucket === "day") {
      const map = new Map<string, (typeof series)[number]>();
      for (const s of series) map.set(s.dayKey, s);

      const filled: (typeof series)[number][] = [];
      for (let i = 0; i < rangeDays; i++) {
        const dUtc = addDaysUtc(startUtc, i);
        const local = new Date(dUtc.getTime() - tzOffsetMinutes * 60_000);
        const dayKey = local.toISOString().slice(0, 10);

        const existing = map.get(dayKey);
        filled.push(
          existing ?? {
            bucketStart: dUtc.toISOString(),
            dayKey,
            count: 0,
            energyAvg: null,
          },
        );
      }

      return NextResponse.json({
        success: true,
        data: { bucket, rangeDays, startUtc: startUtc.toISOString(), endUtc: endUtc.toISOString(), series: filled },
      });
    }

    return NextResponse.json({
      success: true,
      data: { bucket, rangeDays, startUtc: startUtc.toISOString(), endUtc: endUtc.toISOString(), series },
    });
  } catch (err: any) {
    console.error("[api/check-ins/stats GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
