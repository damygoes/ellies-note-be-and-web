import { and, desc, eq, lt } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkInEntries } from "@/db/schema/checkInEntry";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { parseIntParam } from "@/utils/parseIntParam";

const PAGE_SIZE = 30;

export async function GET(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const url = new URL(req.url);
    const limit = Math.min(
      100,
      Math.max(1, parseIntParam(url.searchParams.get("limit"), PAGE_SIZE)),
    );

    const cursorRaw = url.searchParams.get("cursor");
    const cursor = cursorRaw ? new Date(cursorRaw) : null;

    const where = and(
      eq(checkInEntries.userId, user.id),
      cursor ? lt(checkInEntries.createdAt, cursor) : undefined,
    );

    const rows = await db
      .select({
        id: checkInEntries.id,
        checkInDate: checkInEntries.checkInDate,
        createdAt: checkInEntries.createdAt,
        energyLevel: checkInEntries.energyLevel,
        symptoms: checkInEntries.symptoms,
        notes: checkInEntries.notes,
      })
      .from(checkInEntries)
      .where(where)
      .orderBy(desc(checkInEntries.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);
    const nextCursor = hasMore
      ? data[data.length - 1]!.createdAt.toISOString()
      : null;

    return NextResponse.json({
      success: true,
      data: data.map((r) => ({
        id: r.id,
        checkInDate: r.checkInDate ?? null,
        createdAt: r.createdAt.toISOString(),
        energyLevel: Number(r.energyLevel),
        symptoms: r.symptoms ?? [],
        notes: r.notes ?? null,
      })),
      meta: { hasMore, nextCursor },
    });
  } catch (err: any) {
    console.error("[api/check-ins/recent GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
