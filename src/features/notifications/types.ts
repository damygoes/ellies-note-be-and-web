export type NotificationFrequency = 'twice_daily' | 'custom';
export type NotificationTime = { hour: number; minute: number };

export type NotificationSettings = {
  enabled: boolean;
  checkIns: {
    schedule: {
      frequency: NotificationFrequency;
      times: NotificationTime[];
    };
  };
  delivery: {
    sound: boolean;
    vibration: boolean;
  };
  digest: {
    enabled: boolean;
    cadence: 'weekly';
  };
};

export type UpdateNotificationSettings = Partial<NotificationSettings>;

export type UnknownRecord = Record<string, unknown>;
