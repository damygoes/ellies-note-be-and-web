import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkInEntries } from "@/db/schema/checkInEntry";
import { requireClerkUserId } from "@/lib/serverAuth";
import { addLocalDays } from "@/utils/date/addLocalDays";
import { getLocalTodayDateKey } from "@/utils/date/getLocalTodayDateKey";
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

    const tzParam = sql.param(tzOffsetMinutes);
    const shifted = sql`(${checkInEntries.createdAt} - (${tzParam} * interval '1 minute'))`;

    // alias required for subquery references
    const localDay = sql`${shifted}::date`.as("day");

    const base = db
      .select({ day: localDay })
      .from(checkInEntries)
      .where(eq(checkInEntries.userId, user.id))
      .as("base");

    const rows = await db
      .select({ day: base.day })
      .from(base)
      .groupBy(base.day)
      .orderBy(desc(base.day))
      .limit(366);

    const set = new Set(
      rows.map((row) => {
        const v: any = row.day;
        const d = v instanceof Date ? v : new Date(String(v));
        return d.toISOString().slice(0, 10);
      })
    );

    const todayKey = getLocalTodayDateKey(new Date(), tzOffsetMinutes);

    let streak = 0;
    for (;;) {
      const expected = addLocalDays(todayKey, -streak);
      if (!set.has(expected)) break;
      streak += 1;
    }

    return NextResponse.json({
      success: true,
      data: { streakDays: streak, todayKey },
    });
  } catch (err: any) {
    console.error("[api/check-ins/streak GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
