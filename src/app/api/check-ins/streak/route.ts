import { eq, sql } from "drizzle-orm";
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
    // One param object reused everywhere (same $1)
    const tzParam = sql.param(tzOffsetMinutes);

    // One shifted expression reused everywhere
    const shifted = sql`(${checkInEntries.createdAt} - (${tzParam} * interval '1 minute'))`;
    // Convert createdAt into local-date keys in SQL:
    // local_date = (created_at - offset minutes)::date
    const localDateExpr = sql`${shifted}::date`;

    // Pull distinct local dates with at least one check-in.
    // Limit lookback to 366 days to keep it cheap (streaks beyond that are rare and can be extended later)
    const rows = await db
      .select({ day: localDateExpr })
      .from(checkInEntries)
      .where(eq(checkInEntries.userId, user.id))
      .groupBy(localDateExpr)
      .orderBy(sql`${localDateExpr} desc`)
      .limit(366);

    const set = new Set<string>(
      rows.map((r) => {
        // drizzle returns Date for ::date in many setups; normalize either way
        const v: any = r.day;
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
      data: {
        streakDays: streak,
        todayKey,
      },
    });
  } catch (err: any) {
    console.error("[api/check-ins/streak GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
