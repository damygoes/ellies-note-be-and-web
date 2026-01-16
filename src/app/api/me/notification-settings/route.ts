import { db } from "@/db";
import { notificationSettings } from "@/db/schema/notificationSettings";
import {
  NotificationSettings,
  UpdateNotificationSettings,
} from "@/features/notifications/types";
import {
  getOrCreateSettingsRow,
  mergeSettings,
} from "@/features/notifications/utils";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const row = await getOrCreateSettingsRow(user.id);

    // row.settings is stored as JSONB, return it as the API shape
    return NextResponse.json({ success: true, data: row.settings });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}

export async function PUT(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const row = await getOrCreateSettingsRow(user.id);

    const body = (await req.json()) as UpdateNotificationSettings;

    const current = row.settings as NotificationSettings;

    let next: NotificationSettings;
    try {
      next = mergeSettings(current, body);
    } catch (e: any) {
      if (e?.message === "INVALID_SCHEDULE") {
        return jsonError(400, "Invalid schedule payload");
      }
      throw e;
    }

    const updated = await db
      .update(notificationSettings)
      .set({
        enabled: next.enabled,
        settings: next,
        updatedAt: new Date(),
      })
      .where(eq(notificationSettings.userId, user.id))
      .returning();

    return NextResponse.json({ success: true, data: updated[0].settings });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
