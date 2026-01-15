import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { notificationSettings } from "@/db/schema/notificationSettings";
import { users } from "@/db/schema/user";
import { requireClerkUserId } from "@/lib/serverAuth";

type NotificationFrequency = "twice_daily" | "custom";
type NotificationTime = { hour: number; minute: number };

type NotificationSchedule = {
  frequency: NotificationFrequency;
  customTimes?: NotificationTime[];
};

type NotificationSettingsDTO = {
  enabled: boolean;
  schedule: NotificationSchedule;
  sound: boolean;
  vibration: boolean;
  checkInReminders: boolean;
  insightsDigest: boolean;
};

type UpdateNotificationSettingsDTO = Partial<NotificationSettingsDTO>;

function jsonError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}

function defaultSchedule(): NotificationSchedule {
  return {
    frequency: "twice_daily",
    customTimes: [
      { hour: 9, minute: 0 },
      { hour: 21, minute: 0 },
    ],
  };
}

function validateTime(t: NotificationTime) {
  return (
    Number.isInteger(t.hour) &&
    Number.isInteger(t.minute) &&
    t.hour >= 0 &&
    t.hour <= 23 &&
    t.minute >= 0 &&
    t.minute <= 59
  );
}

function normalizeSchedule(
  schedule?: NotificationSchedule
): NotificationSchedule | null {
  if (!schedule) return null;

  if (schedule.frequency !== "twice_daily" && schedule.frequency !== "custom") {
    return null;
  }

  if (schedule.frequency === "twice_daily") {
    return {
      frequency: "twice_daily",
      customTimes: [
        { hour: 9, minute: 0 },
        { hour: 21, minute: 0 },
      ],
    };
  }

  // custom
  const times = schedule.customTimes ?? [];
  const validTimes = times.filter(validateTime);

  // allow empty (full removal capability)
  // de-dupe + sort
  const deduped = validTimes.filter(
    (t, i, arr) =>
      i === arr.findIndex((x) => x.hour === t.hour && x.minute === t.minute)
  );

  deduped.sort((a, b) =>
    a.hour !== b.hour ? a.hour - b.hour : a.minute - b.minute
  );

  return {
    frequency: "custom",
    customTimes: deduped,
  };
}

async function getAppUserIdByClerkId(clerkUserId: string) {
  const row = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  return row[0]?.id ?? null;
}

async function getOrCreateSettings(userId: string) {
  const existing = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, userId))
    .limit(1);

  if (existing[0]) return existing[0];

  const inserted = await db
    .insert(notificationSettings)
    .values({
      userId,
      enabled: true,
      sound: true,
      vibration: true,
      checkInReminders: true,
      insightsDigest: true,
      schedule: defaultSchedule(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return inserted[0];
}

export async function GET() {
  try {
    const clerkUserId = await requireClerkUserId();
    const userId = await getAppUserIdByClerkId(clerkUserId);
    if (!userId) return jsonError(404, "User not found");

    const settings = await getOrCreateSettings(userId);
    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}

export async function PUT(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const userId = await getAppUserIdByClerkId(clerkUserId);
    if (!userId) return jsonError(404, "User not found");

    const current = await getOrCreateSettings(userId);
    const body = (await req.json()) as UpdateNotificationSettingsDTO;

    const scheduleUpdate = normalizeSchedule(body.schedule);
    if (body.schedule && !scheduleUpdate) {
      return jsonError(400, "Invalid schedule payload");
    }

    // Merge (server-authoritative)
    let next: NotificationSettingsDTO = {
      enabled: body.enabled ?? current.enabled,
      schedule: scheduleUpdate ?? (current.schedule as any),
      sound: body.sound ?? current.sound,
      vibration: body.vibration ?? current.vibration,
      checkInReminders: body.checkInReminders ?? current.checkInReminders,
      insightsDigest: body.insightsDigest ?? current.insightsDigest,
    };

    // If enabled is false, force all feature toggles off
    if (body.enabled === false || next.enabled === false) {
      next = {
        ...next,
        enabled: false,
        sound: false,
        vibration: false,
        checkInReminders: false,
        insightsDigest: false,
      };
    }

    const updated = await db
      .update(notificationSettings)
      .set({
        ...next,
        updatedAt: new Date(),
      })
      .where(eq(notificationSettings.userId, userId))
      .returning();

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
