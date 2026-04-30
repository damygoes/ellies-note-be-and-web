import { db } from "@/db";
import { notificationSettings } from "@/db/schema/notificationSettings";
import { eq } from "drizzle-orm";
import { DEFAULT_EVENING_HOUR, DEFAULT_MORNING_HOUR } from "./constants";
import type {
  NotificationPreferences,
  UpdateNotificationPreferences,
} from "./types";

export function defaultNotificationPreferences(): NotificationPreferences {
  return {
    morningHour: DEFAULT_MORNING_HOUR,
    eveningHour: DEFAULT_EVENING_HOUR,
  };
}

export function validateHour(hour: unknown): hour is number {
  return Number.isInteger(hour) && (hour as number) >= 0 && (hour as number) <= 23;
}

export async function getOrCreateSettingsRow(userId: string) {
  const existing = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, userId))
    .limit(1);

  if (existing[0]) return existing[0];

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

  return inserted[0];
}

export function mergePreferences(
  current: NotificationPreferences,
  updates: UpdateNotificationPreferences,
): NotificationPreferences {
  const morningHour = updates.morningHour ?? current.morningHour;
  const eveningHour = updates.eveningHour ?? current.eveningHour;

  if (!validateHour(morningHour)) throw new Error("INVALID_MORNING_HOUR");
  if (!validateHour(eveningHour)) throw new Error("INVALID_EVENING_HOUR");

  return { morningHour, eveningHour };
}

export function computeNextReminderAtUtc(opts: {
  nowUtc: Date;
  tzOffsetMinutes: number;
  morningHour: number;
  eveningHour: number;
}): Date | null {
  const { nowUtc, tzOffsetMinutes, morningHour, eveningHour } = opts;

  const times = [
    { hour: morningHour, minute: 0 },
    { hour: eveningHour, minute: 0 },
  ].sort((a, b) => a.hour - b.hour);

  // Convert now into "local-frame" time by subtracting offset minutes
  const nowLocalFrame = new Date(nowUtc.getTime() - tzOffsetMinutes * 60_000);

  const y = nowLocalFrame.getUTCFullYear();
  const m = nowLocalFrame.getUTCMonth();
  const d = nowLocalFrame.getUTCDate();

  for (const t of times) {
    const candidateLocal = new Date(Date.UTC(y, m, d, t.hour, t.minute, 0, 0));
    if (candidateLocal.getTime() > nowLocalFrame.getTime()) {
      return new Date(candidateLocal.getTime() + tzOffsetMinutes * 60_000);
    }
  }

  // All times passed today — return first slot tomorrow
  const first = times[0]!;
  const tomorrowLocal = new Date(
    Date.UTC(y, m, d + 1, first.hour, first.minute, 0, 0),
  );
  return new Date(tomorrowLocal.getTime() + tzOffsetMinutes * 60_000);
}
