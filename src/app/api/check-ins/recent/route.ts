import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { checkInEntries } from "@/db/schema/checkInEntry";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { parseLimit } from "@/utils/parseLimit";

export async function GET(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const url = new URL(req.url);
    const limit = parseLimit(url);

    const rows = await db
      .select({
        id: checkInEntries.id,
        createdAt: checkInEntries.createdAt,
        energyLevel: checkInEntries.energyLevel,
        painLevel: checkInEntries.painLevel,
        influencedBy: checkInEntries.influencedBy,
        note: checkInEntries.note,
      })
      .from(checkInEntries)
      .where(eq(checkInEntries.userId, user.id))
      .orderBy(desc(checkInEntries.createdAt))
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        energyLevel: Number(r.energyLevel),
        painLevel: Number(r.painLevel),
        influencedBy: (r.influencedBy ?? []) as string[],
        note: r.note ?? null,
      })),
    });
  } catch (err: any) {
    console.error("[api/check-ins/recent GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
