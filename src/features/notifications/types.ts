export type NotificationPreferences = {
  morningHour: number;
  eveningHour: number;
};

export type UpdateNotificationPreferences = Partial<NotificationPreferences>;
