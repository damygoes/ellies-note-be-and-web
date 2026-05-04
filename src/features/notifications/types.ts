export type NotificationPreferences = {
  morningMinute: number; // minute-of-day 0-1439
  eveningMinute: number; // minute-of-day 0-1439
};

export type UpdateNotificationPreferences = Partial<NotificationPreferences>;
