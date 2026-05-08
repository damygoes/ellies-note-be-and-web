import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import {
  HEALTH_METRIC_TYPES,
  METRIC_UNITS,
  healthMetrics,
  type HealthMetricType,
} from "@/db/schema/healthMetrics";
import { wearableConnections } from "@/db/schema/wearableConnections";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";

type SnapshotItem = {
  metricType: HealthMetricType;
  value: number;
  measuredAt: string;
};

function isValidItem(s: unknown): s is SnapshotItem {
  if (!s || typeof s !== "object") return false;
  const item = s as Record<string, unknown>;
  return (
    typeof item.metricType === "string" &&
    (HEALTH_METRIC_TYPES as readonly string[]).includes(item.metricType) &&
    typeof item.value === "number" &&
    Number.isFinite(item.value) &&
    item.value >= 0 &&
    typeof item.measuredAt === "string"
  );
}

export async function POST(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    if (user.subscriptionStatus !== "premium") return jsonError(403, "Premium required");

    const body = await req.json();
    const raw: unknown[] = Array.isArray(body?.snapshots) ? body.snapshots : [];
    const valid = raw.filter(isValidItem);

    if (valid.length === 0) {
      return NextResponse.json({ success: true, data: { synced: 0 } });
    }

    // Delete any existing rows for each (user, metricType, date) before re-inserting
    await Promise.all(
      valid.map((item) => {
        const dateStr = item.measuredAt.slice(0, 10);
        return db.delete(healthMetrics).where(
          and(
            eq(healthMetrics.userId, user.id),
            eq(healthMetrics.metricType, item.metricType),
            sql`${healthMetrics.measuredAt}::date = ${dateStr}::date`,
          ),
        );
      }),
    );

    await db.insert(healthMetrics).values(
      valid.map((item) => ({
        userId: user.id,
        provider: "apple_health",
        metricType: item.metricType,
        value: item.value,
        unit: METRIC_UNITS[item.metricType],
        measuredAt: new Date(item.measuredAt),
      })),
    );

    // Record the apple_health connection (upsert by unique userId+provider index)
    const now = new Date();
    await db
      .insert(wearableConnections)
      .values({
        userId: user.id,
        provider: "apple_health",
        isActive: true,
        lastSyncAt: now,
        connectedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [wearableConnections.userId, wearableConnections.provider],
        set: { isActive: true, lastSyncAt: now, updatedAt: now },
      });

    return NextResponse.json({ success: true, data: { synced: valid.length } });
  } catch (err: any) {
    console.error("[api/health-metrics/sync POST] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
