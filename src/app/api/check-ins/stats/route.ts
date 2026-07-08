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

    const rangeDaysRaw = parseIntParam(url.searchParams.get("range"), 7);
    const now = new Date();
    const isPremium =
      user.subscriptionStatus === "premium" ||
      (user.subscriptionExpiresAt !== null && user.subscriptionExpiresAt > now);
    const maxRange = isPremium ? 365 : 7;
    const rangeDays = Math.min(maxRange, Math.max(1, rangeDaysRaw));
    const endUtc = addDaysUtc(startOfLocalDay(now, tzOffsetMinutes), 1);
    const startUtc = addDaysUtc(endUtc, -rangeDays);

    const tzParam = sql.param(tzOffsetMinutes);
    const shifted = sql`(${checkInEntries.createdAt} - (${tzParam} * interval '1 minute'))`;
    const dayKeyExpr = sql<string>`COALESCE(
      ${checkInEntries.checkInDate}::text,
      (${shifted}::date)::text
    )`.as("dayKey");

    const rows = await db
      .select({
        dayKey: dayKeyExpr,
        energyLevel: checkInEntries.energyLevel,
        symptoms: checkInEntries.symptoms,
      })
      .from(checkInEntries)
      .where(
        and(
          eq(checkInEntries.userId, user.id),
          gte(checkInEntries.createdAt, startUtc),
          lt(checkInEntries.createdAt, endUtc),
        ),
      )
      .orderBy(checkInEntries.createdAt);

    // Build ordered days array and index map
    const days: string[] = [];
    for (let i = 0; i < rangeDays; i++) {
      const dUtc = addDaysUtc(startUtc, i);
      const local = new Date(dUtc.getTime() - tzOffsetMinutes * 60_000);
      days.push(local.toISOString().slice(0, 10));
    }
    const dayIndexMap = new Map(days.map((d, i) => [d, i]));

    const entries = rows
      .filter((r) => dayIndexMap.has(r.dayKey))
      .map((r) => ({
        dayKey: r.dayKey,
        dayIndex: dayIndexMap.get(r.dayKey)!,
        energyLevel: Number(r.energyLevel),
        symptoms: r.symptoms ?? [],
      }));

    return NextResponse.json({
      success: true,
      data: {
        rangeDays,
        startUtc: startUtc.toISOString(),
        endUtc: endUtc.toISOString(),
        days,
        entries,
      },
    });
  } catch (err: any) {
    console.error("[api/check-ins/stats GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
