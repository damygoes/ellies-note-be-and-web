import type { HEALTH_METRIC_TYPES } from "@/db/schema/healthMetrics";
import type { WEARABLE_PROVIDERS } from "@/db/schema/wearableConnections";

export type WearableProvider = (typeof WEARABLE_PROVIDERS)[number];
export type HealthMetricType = (typeof HEALTH_METRIC_TYPES)[number];

export type HealthMetric = {
  id: string;
  userId: string;
  provider: WearableProvider;
  metricType: HealthMetricType;
  value: number;
  unit: string;
  measuredAt: string;
  createdAt: string;
};

export type WearableConnectionStatus = {
  connected: boolean;
  lastSyncAt: string | null;
};

export type IntegrationsStatus = {
  garmin: WearableConnectionStatus;
  appleHealth: Pick<WearableConnectionStatus, "connected">;
};
