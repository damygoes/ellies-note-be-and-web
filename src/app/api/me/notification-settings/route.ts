import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { notificationSettings } from "@/db/schema/notificationSettings";
import {
  getOrCreateSettingsRow,
  mergePreferences,
  validateHour,
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
        morningHour: row.settings.morningHour,
        eveningHour: row.settings.eveningHour,
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

    const body: { enabled?: boolean; morningHour?: number; eveningHour?: number } =
      await req.json();

    if (
      body.morningHour !== undefined &&
      !validateHour(body.morningHour)
    ) {
      return jsonError(400, "morningHour must be an integer between 0 and 23");
    }

    if (
      body.eveningHour !== undefined &&
      !validateHour(body.eveningHour)
    ) {
      return jsonError(400, "eveningHour must be an integer between 0 and 23");
    }

    const row = await getOrCreateSettingsRow(user.id);

    let nextPreferences = row.settings;
    try {
      nextPreferences = mergePreferences(row.settings, {
        morningHour: body.morningHour,
        eveningHour: body.eveningHour,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return jsonError(400, "Invalid hour value");
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
        morningHour: saved.settings.morningHour,
        eveningHour: saved.settings.eveningHour,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return jsonError(401, "Unauthorized");
    }
    return jsonError(500, "Internal server error");
  }
}
