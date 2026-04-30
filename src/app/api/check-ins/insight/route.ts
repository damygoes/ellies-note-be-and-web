import { and, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkInEntries } from "@/db/schema/checkInEntry";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { parseIntParam } from "@/utils/parseIntParam";

type InsightApi = { message: string | null };

export async function GET(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const url = new URL(req.url);
    parseIntParam(url.searchParams.get("tzOffsetMinutes"), 0);

    const rangeDays = Math.min(
      90,
      Math.max(7, parseIntParam(url.searchParams.get("rangeDays"), 14)),
    );

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - rangeDays);

    const rows = await db
      .select({
        energyLevel: checkInEntries.energyLevel,
        symptoms: checkInEntries.symptoms,
      })
      .from(checkInEntries)
      .where(
        and(
          eq(checkInEntries.userId, user.id),
          gte(checkInEntries.createdAt, since),
        ),
      );

    if (rows.length < 6) {
      const data: InsightApi = { message: null };
      return NextResponse.json({ success: true, data });
    }

    const agg = new Map<string, { sum: number; count: number }>();

    for (const row of rows) {
      const energy = Number(row.energyLevel);
      if (!Number.isFinite(energy)) continue;

      for (const symptom of row.symptoms ?? []) {
        const key = symptom.trim();
        if (!key) continue;

        const cur = agg.get(key) ?? { sum: 0, count: 0 };
        cur.sum += energy;
        cur.count += 1;
        agg.set(key, cur);
      }
    }

    const candidates = [...agg.entries()]
      .filter(([, value]) => value.count >= 3)
      .map(([symptom, value]) => ({
        symptom,
        avg: value.sum / value.count,
        count: value.count,
      }))
      .sort((a, b) => a.avg - b.avg); // lowest energy first (symptoms correlate with low energy)

    if (candidates.length === 0) {
      const data: InsightApi = { message: null };
      return NextResponse.json({ success: true, data });
    }

    const worst = candidates[0]!;

    const data: InsightApi = {
      message: `Your energy tends to be lower on days with "${worst.symptom}". Consider pacing more on those days.`,
    };

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("[api/check-ins/insight GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
