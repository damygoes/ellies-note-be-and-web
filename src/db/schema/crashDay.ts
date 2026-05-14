import { date, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user";

export const crashDays = pgTable("crash_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  date: date("date").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CrashDayRow = typeof crashDays.$inferSelect;
export type NewCrashDay = typeof crashDays.$inferInsert;
