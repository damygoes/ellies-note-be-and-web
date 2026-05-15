import { db } from "@/db";
import { notificationSettings } from "@/db/schema/notificationSettings";
import { eq } from "drizzle-orm";
import { DEFAULT_EVENING_MINUTE, DEFAULT_MORNING_MINUTE } from "./constants";
import type {
  NotificationPreferences,
  UpdateNotificationPreferences,
} from "./types";

export function defaultNotificationPreferences(): NotificationPreferences {
  return {
    morningMinute: DEFAULT_MORNING_MINUTE,
    eveningMinute: DEFAULT_EVENING_MINUTE,
  };
}

export function validateMinuteOfDay(minute: unknown): minute is number {
  return (
    Number.isInteger(minute) &&
    (minute as number) >= 0 &&
    (minute as number) <= 1439
  );
}

// Rows created before the minutes migration stored { morningHour, eveningHour }.
// Convert them on read so the rest of the code only deals with minutes.
function normalizeSettings(raw: unknown): NotificationPreferences {
  if (!raw || typeof raw !== "object") return defaultNotificationPreferences();
  const obj = raw as Record<string, unknown>;

  if (
    typeof obj.morningMinute === "number" &&
    typeof obj.eveningMinute === "number"
  ) {
    return {
      morningMinute: obj.morningMinute,
      eveningMinute: obj.eveningMinute,
    };
  }

  // Legacy format: { morningHour, eveningHour }
  if (
    typeof obj.morningHour === "number" &&
    typeof obj.eveningHour === "number"
  ) {
    return {
      morningMinute: obj.morningHour * 60,
      eveningMinute: obj.eveningHour * 60,
    };
  }

  return defaultNotificationPreferences();
}

export async function getOrCreateSettingsRow(userId: string) {
  const existing = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, userId))
    .limit(1);

  if (existing[0]) {
    // Normalize in case row was written in the old hours format
    const normalized = normalizeSettings(existing[0].settings);
    return { ...existing[0], settings: normalized };
  }

  const defaults = defaultNotificationPreferences();

  const inserted = await db
    .insert(notificationSettings)
    .values({
      userId,
      enabled: false,
      settings: defaults,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return inserted[0]!;
}

export function computeNextReminderAtUtc(opts: {
  nowUtc: Date;
  tzOffsetMinutes: number;
  morningMinute: number;
  eveningMinute: number;
}): Date | null {
  const { nowUtc, tzOffsetMinutes, morningMinute, eveningMinute } = opts;

  const slots = [morningMinute, eveningMinute].sort((a, b) => a - b);

  // Work in "local frame" by shifting UTC by the offset
  const nowLocalFrame = new Date(nowUtc.getTime() - tzOffsetMinutes * 60_000);
  const y = nowLocalFrame.getUTCFullYear();
  const mo = nowLocalFrame.getUTCMonth();
  const d = nowLocalFrame.getUTCDate();
  const nowLocalMinute =
    nowLocalFrame.getUTCHours() * 60 + nowLocalFrame.getUTCMinutes();

  for (const slot of slots) {
    if (slot > nowLocalMinute) {
      const candidateLocal = new Date(
        Date.UTC(y, mo, d, Math.floor(slot / 60), slot % 60, 0, 0),
      );
      return new Date(candidateLocal.getTime() + tzOffsetMinutes * 60_000);
    }
  }

  // All slots passed today — return first slot tomorrow
  const first = slots[0]!;
  const tomorrowLocal = new Date(
    Date.UTC(y, mo, d + 1, Math.floor(first / 60), first % 60, 0, 0),
  );
  return new Date(tomorrowLocal.getTime() + tzOffsetMinutes * 60_000);
}

export function mergePreferences(
  current: NotificationPreferences,
  updates: UpdateNotificationPreferences,
): NotificationPreferences {
  const morningMinute = updates.morningMinute ?? current.morningMinute;
  const eveningMinute = updates.eveningMinute ?? current.eveningMinute;

  if (!validateMinuteOfDay(morningMinute)) throw new Error("INVALID_MORNING_MINUTE");
  if (!validateMinuteOfDay(eveningMinute)) throw new Error("INVALID_EVENING_MINUTE");

  return { morningMinute, eveningMinute };
}
