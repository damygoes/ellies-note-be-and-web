import { and, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkInEntries } from "@/db/schema/checkInEntry";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { parseIntParam } from "@/utils/parseIntParam";

type InsightApi = { message: string | null };

// assumes checkInEntries has influencedBy/tags column you store (array/json)
// adjust field name to match your schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTags(row: any): string[] {
  const raw = row.influencedBy ?? row.tags ?? [];
  if (Array.isArray(raw)) return raw.map(String);
  return [];
}

export async function GET(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const url = new URL(req.url);
    parseIntParam(url.searchParams.get("tzOffsetMinutes"), 0); // optional for future use

    const rangeDays = Math.min(
      90,
      Math.max(7, parseIntParam(url.searchParams.get("rangeDays"), 14)),
    );

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - rangeDays);

    const rows = await db
      .select({
        energyLevel: checkInEntries.energyLevel,
        influencedBy: checkInEntries.influencedBy,
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

    // tag -> { sumEnergy, count }
    const agg = new Map<string, { sum: number; count: number }>();

    for (const row of rows) {
      const energy = Number(row.energyLevel);
      if (!Number.isFinite(energy)) continue;

      const tags = extractTags(row);
      for (const tag of tags) {
        const key = tag.trim();
        if (!key) continue;

        const cur = agg.get(key) ?? { sum: 0, count: 0 };
        cur.sum += energy;
        cur.count += 1;
        agg.set(key, cur);
      }
    }

    const candidates = [...agg.entries()]
      .filter(([, value]) => value.count >= 3) // avoid noisy singletons
      .map(([tag, value]) => ({
        tag,
        avg: value.sum / value.count,
        count: value.count,
      }))
      .sort((a, b) => b.avg - a.avg);

    if (candidates.length === 0) {
      const data: InsightApi = { message: null };
      return NextResponse.json({ success: true, data });
    }

    const best = candidates[0];

    const data: InsightApi = {
      message: `Your energy tends to be higher when you tag “${best.tag}”. Consider repeating that routine.`,
    };

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("[api/check-ins/insight GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
