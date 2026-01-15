import { boolean, jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user";

export const notificationSettings = pgTable("notification_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),

  enabled: boolean("enabled").notNull().default(true),

  // JSONB allows future expansion without migrations every time
  settings: jsonb("settings")
    .$type<{
      checkIns: {
        schedule: {
          frequency: "twice_daily" | "custom";
          times: { hour: number; minute: number }[];
        };
      };
      delivery: { sound: boolean; vibration: boolean };
      digest: { enabled: boolean; cadence: "weekly" };
    }>()
    .notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
