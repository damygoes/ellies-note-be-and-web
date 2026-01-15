import { boolean, jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user";

export const notificationSettings = pgTable("notification_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),

  enabled: boolean("enabled").notNull().default(true),
  sound: boolean("sound").notNull().default(true),
  vibration: boolean("vibration").notNull().default(true),
  checkInReminders: boolean("check_in_reminders").notNull().default(true),
  insightsDigest: boolean("insights_digest").notNull().default(true),

  // schedule stored as jsonb for flexibility:
  schedule: jsonb("schedule")
    .$type<{
      frequency: "twice_daily" | "custom";
      customTimes?: { hour: number; minute: number }[];
    }>()
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
