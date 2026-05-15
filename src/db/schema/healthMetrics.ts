import {
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const HEALTH_METRIC_TYPES = [
  "heart_rate",
  "resting_heart_rate",
  "hrv",
  "steps",
  "sleep_duration",
  "sleep_quality",
  "stress_level",
] as const;

export type HealthMetricType = (typeof HEALTH_METRIC_TYPES)[number];

export const METRIC_UNITS: Record<HealthMetricType, string> = {
  heart_rate: "bpm",
  resting_heart_rate: "bpm",
  hrv: "ms",
  steps: "steps",
  sleep_duration: "minutes",
  sleep_quality: "score",
  stress_level: "score",
};

export const healthMetrics = pgTable(
  "health_metrics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    provider: text("provider").notNull(),
    metricType: text("metric_type").notNull(),
    value: doublePrecision("value").notNull(),
    unit: text("unit").notNull(),
    measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("health_metrics_user_metric_time_idx").on(
      table.userId,
      table.metricType,
      table.measuredAt,
    ),
    index("health_metrics_user_time_idx").on(table.userId, table.measuredAt),
  ],
);

export type HealthMetricRow = typeof healthMetrics.$inferSelect;
export type NewHealthMetric = typeof healthMetrics.$inferInsert;
