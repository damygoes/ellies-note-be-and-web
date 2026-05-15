import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { wearableConnections } from "@/db/schema/wearableConnections";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import type { IntegrationsStatus } from "@/features/wearables/types";

export async function GET() {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const connections = await db
      .select()
      .from(wearableConnections)
      .where(
        and(
          eq(wearableConnections.userId, user.id),
          eq(wearableConnections.isActive, true),
        ),
      );

    const garmin = connections.find((c) => c.provider === "garmin");
    const appleHealth = connections.find((c) => c.provider === "apple_health");

    const data: IntegrationsStatus = {
      garmin: {
        connected: !!garmin,
        lastSyncAt: garmin?.lastSyncAt?.toISOString() ?? null,
      },
      appleHealth: {
        connected: !!appleHealth,
      },
    };

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return jsonError(401, "Unauthorized");
    }
    return jsonError(500, "Internal server error");
  }
}
