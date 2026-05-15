import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { notificationSettings } from "@/db/schema/notificationSettings";
import {
  getOrCreateSettingsRow,
  mergePreferences,
  validateMinuteOfDay,
} from "@/features/notifications/utils";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";

export async function GET() {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const row = await getOrCreateSettingsRow(user.id);

    return NextResponse.json({
      success: true,
      data: {
        enabled: row.enabled,
        morningMinute: row.settings.morningMinute,
        eveningMinute: row.settings.eveningMinute,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return jsonError(401, "Unauthorized");
    }
    return jsonError(500, "Internal server error");
  }
}

export async function PUT(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const body: {
      enabled?: boolean;
      morningMinute?: number;
      eveningMinute?: number;
    } = await req.json();

    if (body.morningMinute !== undefined && !validateMinuteOfDay(body.morningMinute)) {
      return jsonError(400, "morningMinute must be an integer between 0 and 1439");
    }

    if (body.eveningMinute !== undefined && !validateMinuteOfDay(body.eveningMinute)) {
      return jsonError(400, "eveningMinute must be an integer between 0 and 1439");
    }

    const row = await getOrCreateSettingsRow(user.id);

    let nextPreferences = row.settings;
    try {
      nextPreferences = mergePreferences(row.settings, {
        morningMinute: body.morningMinute,
        eveningMinute: body.eveningMinute,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return jsonError(400, "Invalid minute value");
      }
      throw error;
    }

    const enabled = body.enabled ?? row.enabled;

    const updated = await db
      .update(notificationSettings)
      .set({ enabled, settings: nextPreferences, updatedAt: new Date() })
      .where(eq(notificationSettings.userId, user.id))
      .returning();

    const saved = updated[0]!;
    return NextResponse.json({
      success: true,
      data: {
        enabled: saved.enabled,
        morningMinute: saved.settings.morningMinute,
        eveningMinute: saved.settings.eveningMinute,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return jsonError(401, "Unauthorized");
    }
    return jsonError(500, "Internal server error");
  }
}
