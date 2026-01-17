import { db } from '@/db';
import { notificationSettings } from '@/db/schema/notificationSettings';
import { eq } from 'drizzle-orm';
import type {
  NotificationFrequency,
  NotificationSettings,
  NotificationTime,
  UnknownRecord,
  UpdateNotificationSettings,
} from './types';
import { DEFAULT_TWICE_DAILY } from './constants';

export function defaultNotificationSettings(): NotificationSettings {
  return {
    enabled: true,
    checkIns: {
      schedule: {
        frequency: 'twice_daily',
        times: DEFAULT_TWICE_DAILY,
      },
    },
    delivery: { sound: true, vibration: true },
    digest: { enabled: true, cadence: 'weekly' },
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

export function isValidTime(value: unknown): value is NotificationTime {
  if (!isRecord(value)) return false;

  const hour = getNested(value, 'hour');
  const minute = getNested(value, 'minute');

  return (
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    (hour as number) >= 0 &&
    (hour as number) <= 23 &&
    (minute as number) >= 0 &&
    (minute as number) <= 59
  );
}

/**
 * Normalizes a schedule-like object into a concrete schedule.
 * - Accepts either the schedule itself, or a larger settings object that contains it.
 * - If frequency is "twice_daily" but times are missing, defaults are injected.
 */
export function normalizeSchedule(input: unknown): {
  frequency: NotificationFrequency;
  times: NotificationTime[];
} {
  const scheduleLike = extractScheduleLike(input);

  const scheduleObj = isRecord(scheduleLike) ? scheduleLike : null;

  const frequency = parseFrequency(
    scheduleObj ? getNested(scheduleObj, 'frequency') : null,
  );

  const rawTimes = scheduleObj ? getNested(scheduleObj, 'times') : null;
  const timesFromInput = Array.isArray(rawTimes)
    ? rawTimes.filter(isValidTime)
    : [];

  // If twice_daily but times missing, provide defaults
  if (frequency === 'twice_daily') {
    return {
      frequency,
      times: timesFromInput.length ? timesFromInput : DEFAULT_TWICE_DAILY,
    };
  }

  // custom: use whatever they configured (may be empty)
  return { frequency, times: timesFromInput };
}

/**
 * Normalize a schedule PATCH payload into a server-safe schedule.
 *
 * Key rule:
 * - frequency="twice_daily" => ensure defaults if times missing/empty
 * - frequency="custom"      => allow empty times (user can choose none)
 */
export function normalizeScheduleUpdate(input: {
  frequency?: NotificationFrequency;
  times?: NotificationTime[];
}): { frequency: NotificationFrequency; times: NotificationTime[] } {
  const frequency: NotificationFrequency =
    input.frequency === 'custom' ? 'custom' : 'twice_daily';

  const rawTimes = input.times ?? [];
  const times = Array.isArray(rawTimes)
    ? sortTimes(rawTimes.filter(validateTime))
    : [];

  if (frequency === 'twice_daily') {
    // If twice_daily but times missing, provide defaults
    return {
      frequency,
      times: times.length ? times : DEFAULT_TWICE_DAILY,
    };
  }

  // custom: use whatever they configured (may be empty)
  return { frequency, times };
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
  updates: UpdateNotificationSettings,
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
    const normalized = normalizeScheduleUpdate({
      frequency: updates.checkIns.schedule.frequency,
      times: updates.checkIns.schedule.times,
    });

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

export function computeNextReminderAtUtc(opts: {
  nowUtc: Date;
  tzOffsetMinutes: number; // JS getTimezoneOffset() convention
  times: NotificationTime[];
}): Date | null {
  const { nowUtc, tzOffsetMinutes } = opts;
  const times = [...opts.times].sort((a, b) =>
    a.hour !== b.hour ? a.hour - b.hour : a.minute - b.minute,
  );

  if (times.length === 0) return null;

  // Convert now into "local-frame" time by subtracting offset minutes
  const nowLocalFrame = new Date(nowUtc.getTime() - tzOffsetMinutes * 60_000);

  // Build local "today" components in UTC fields (because we're using a shifted frame)
  const y = nowLocalFrame.getUTCFullYear();
  const m = nowLocalFrame.getUTCMonth();
  const d = nowLocalFrame.getUTCDate();

  // Find next scheduled time today (in local-frame)
  for (const t of times) {
    const candidateLocal = new Date(Date.UTC(y, m, d, t.hour, t.minute, 0, 0));
    if (candidateLocal.getTime() > nowLocalFrame.getTime()) {
      // Convert candidate back to UTC
      return new Date(candidateLocal.getTime() + tzOffsetMinutes * 60_000);
    }
  }

  // Otherwise tomorrow at earliest time
  const first = times[0];
  const tomorrowLocal = new Date(
    Date.UTC(y, m, d + 1, first.hour, first.minute, 0, 0),
  );
  return new Date(tomorrowLocal.getTime() + tzOffsetMinutes * 60_000);
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function getNested(obj: UnknownRecord, key: string): unknown {
  return obj[key];
}

function parseFrequency(value: unknown): NotificationFrequency {
  return value === 'custom' ? 'custom' : 'twice_daily';
}

function extractScheduleLike(input: unknown): unknown {
  // Handle both shapes (your settings JSON may be nested depending on migrations/seed)
  if (!isRecord(input)) return null;

  const checkIns = getNested(input, 'checkIns');
  if (isRecord(checkIns)) {
    const schedule = getNested(checkIns, 'schedule');
    if (schedule != null) return schedule;
  }

  const maybeSettings = getNested(input, 'settings');
  if (isRecord(maybeSettings)) {
    const nestedCheckIns = getNested(maybeSettings, 'checkIns');
    if (isRecord(nestedCheckIns)) {
      const nestedSchedule = getNested(nestedCheckIns, 'schedule');
      if (nestedSchedule != null) return nestedSchedule;
    }
  }

  return null;
}

function sortTimes(times: NotificationTime[]) {
  return [...times].sort((a, b) =>
    a.hour !== b.hour ? a.hour - b.hour : a.minute - b.minute,
  );
}
