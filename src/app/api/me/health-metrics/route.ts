import { and, desc, eq, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import {
  healthMetrics,
  HEALTH_METRIC_TYPES,
} from "@/db/schema/healthMetrics";
import { WEARABLE_PROVIDERS } from "@/db/schema/wearableConnections";
import { requireClerkUserId } from "@/lib/serverAuth";
import { parseDateParam } from "@/utils/date/parseDateParam";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { parseIntParam } from "@/utils/parseIntParam";

type CreateHealthMetricDTO = {
  provider: string;
  metricType: string;
  value: number;
  unit: string;
  measuredAt: string;
};

export async function GET(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const url = new URL(req.url);
    const metricType = url.searchParams.get("metricType");
    const fromDate = parseDateParam(url.searchParams.get("from"));
    const toDate = parseDateParam(url.searchParams.get("to"));
    const limit = Math.min(
      200,
      Math.max(1, parseIntParam(url.searchParams.get("limit"), 50)),
    );

    if (metricType && !(HEALTH_METRIC_TYPES as readonly string[]).includes(metricType)) {
      return jsonError(400, `metricType must be one of: ${HEALTH_METRIC_TYPES.join(", ")}`);
    }

    const whereParts = [eq(healthMetrics.userId, user.id)];
    if (metricType) whereParts.push(eq(healthMetrics.metricType, metricType));
    if (fromDate) whereParts.push(gte(healthMetrics.measuredAt, fromDate));
    if (toDate) whereParts.push(lte(healthMetrics.measuredAt, toDate));

    const rows = await db
      .select()
      .from(healthMetrics)
      .where(and(...whereParts))
      .orderBy(desc(healthMetrics.measuredAt))
      .limit(limit);

    return NextResponse.json({ success: true, data: rows });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return jsonError(401, "Unauthorized");
    }
    return jsonError(500, "Internal server error");
  }
}

export async function POST(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const body: CreateHealthMetricDTO = await req.json();
    const { provider, metricType, value, unit, measuredAt } = body ?? {};

    if (!(WEARABLE_PROVIDERS as readonly string[]).includes(provider)) {
      return jsonError(400, `provider must be one of: ${WEARABLE_PROVIDERS.join(", ")}`);
    }

    if (!(HEALTH_METRIC_TYPES as readonly string[]).includes(metricType)) {
      return jsonError(400, `metricType must be one of: ${HEALTH_METRIC_TYPES.join(", ")}`);
    }

    if (typeof value !== "number" || !Number.isFinite(value)) {
      return jsonError(400, "value must be a finite number");
    }

    if (!unit || typeof unit !== "string") {
      return jsonError(400, "unit is required");
    }

    const measuredAtDate = new Date(measuredAt);
    if (!measuredAt || Number.isNaN(measuredAtDate.getTime())) {
      return jsonError(400, "measuredAt must be a valid ISO date");
    }

    const inserted = await db
      .insert(healthMetrics)
      .values({
        userId: user.id,
        provider,
        metricType,
        value,
        unit,
        measuredAt: measuredAtDate,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: inserted[0] },
      { status: 201 },
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return jsonError(401, "Unauthorized");
    }
    return jsonError(500, "Internal server error");
  }
}
