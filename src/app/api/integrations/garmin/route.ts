import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { wearableConnections } from "@/db/schema/wearableConnections";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";

export async function DELETE() {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    await db
      .update(wearableConnections)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(wearableConnections.userId, user.id),
          eq(wearableConnections.provider, "garmin"),
        ),
      );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return jsonError(401, "Unauthorized");
    }
    return jsonError(500, "Internal server error");
  }
}
