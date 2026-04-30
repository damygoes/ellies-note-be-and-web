import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const WEARABLE_PROVIDERS = ["apple_health", "garmin"] as const;
export type WearableProvider = (typeof WEARABLE_PROVIDERS)[number];

export const wearableConnections = pgTable(
  "wearable_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    provider: text("provider").notNull(),

    // Garmin OAuth 1.0a credentials (null for Apple Health — device-side only)
    accessToken: text("access_token"),
    accessTokenSecret: text("access_token_secret"),
    providerUserId: text("provider_user_id"),

    isActive: boolean("is_active").notNull().default(true),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),

    connectedAt: timestamp("connected_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("wearable_connections_user_provider_idx").on(
      table.userId,
      table.provider,
    ),
  ],
);

export type WearableConnectionRow = typeof wearableConnections.$inferSelect;
export type NewWearableConnection = typeof wearableConnections.$inferInsert;
