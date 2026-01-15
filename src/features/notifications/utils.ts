import { db } from "@/db";
import { notificationSettings } from "@/db/schema/notificationSettings";
import { eq } from "drizzle-orm";
import type {
  NotificationFrequency,
  NotificationSettings,
  NotificationTime,
  UpdateNotificationSettings,
} from "./types";

export function defaultNotificationSettings(): NotificationSettings {
  return {
    enabled: true,
    checkIns: {
      schedule: {
        frequency: "twice_daily",
        times: [
          { hour: 9, minute: 0 },
          { hour: 18, minute: 0 },
        ],
      },
    },
    delivery: { sound: true, vibration: true },
    digest: { enabled: true, cadence: "weekly" },
  };
}

export function validateTime(t: NotificationTime) {
  return (
    Number.isInteger(t.hour) &&
    Number.isInteger(t.minute) &&
    t.hour >= 0 &&
    t.hour <= 23 &&
    t.minute >= 0 &&
    t.minute <= 59
  );
}

export function normalizeSchedule(input?: {
  frequency?: unknown;
  times?: unknown;
}): { frequency: NotificationFrequency; times: NotificationTime[] } | null {
  if (!input) return null;

  const frequency = input.frequency;
  if (frequency !== "twice_daily" && frequency !== "custom") return null;

  if (frequency === "twice_daily") {
    return {
      frequency: "twice_daily",
      times: [
        { hour: 9, minute: 0 },
        { hour: 18, minute: 0 },
      ],
    };
  }

  // custom
  const timesRaw = Array.isArray(input.times) ? input.times : [];
  const validTimes = timesRaw
    .filter((t): t is NotificationTime => {
      if (!t || typeof t !== "object") return false;
      const hour = (t as any).hour;
      const minute = (t as any).minute;
      return validateTime({ hour, minute });
    })
    .map((t: any) => ({ hour: t.hour, minute: t.minute }));

  // allow empty custom (full removal capability)
  const deduped = validTimes.filter(
    (t, i, arr) =>
      i === arr.findIndex((x) => x.hour === t.hour && x.minute === t.minute)
  );

  deduped.sort((a, b) =>
    a.hour !== b.hour ? a.hour - b.hour : a.minute - b.minute
  );

  return { frequency: "custom", times: deduped };
}

export async function getOrCreateSettingsRow(userId: string) {
  const existing = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, userId))
    .limit(1);

  if (existing[0]) return existing[0];

  const defaults = defaultNotificationSettings();

  const inserted = await db
    .insert(notificationSettings)
    .values({
      userId,
      enabled: defaults.enabled,
      settings: defaults,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return inserted[0];
}

/**
 * Merge partial updates into current settings, server-authoritative.
 * Also enforces: if enabled === false => delivery + digest disabled (but we keep schedule).
 */
export function mergeSettings(
  current: NotificationSettings,
  updates: UpdateNotificationSettings
): NotificationSettings {
  const next: NotificationSettings = {
    enabled: updates.enabled ?? current.enabled,

    checkIns: {
      schedule: {
        ...current.checkIns.schedule,
      },
    },

    delivery: {
      ...current.delivery,
      ...(updates.delivery ?? {}),
    },

    digest: {
      ...current.digest,
      ...(updates.digest ?? {}),
    },
  };

  // schedule update (validated/normalized)
  if (updates.checkIns?.schedule) {
    const normalized = normalizeSchedule(updates.checkIns.schedule as any);
    if (!normalized) {
      throw new Error("INVALID_SCHEDULE");
    }
    next.checkIns.schedule = normalized;
  }

  // enforce master switch
  if (next.enabled === false) {
    next.delivery.sound = false;
    next.delivery.vibration = false;
    next.digest.enabled = false;
  }

  return next;
}
