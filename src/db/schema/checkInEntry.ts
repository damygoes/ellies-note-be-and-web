import {
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const checkInEntries = pgTable("check_in_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  energyLevel: smallint("energy_level").notNull(),
  painLevel: smallint("pain_level").notNull(),

  influencedBy: jsonb("influenced_by").$type<string[]>().notNull().default([]),
  note: text("note"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CheckInEntryRow = typeof checkInEntries.$inferSelect;
export type NewCheckInEntry = typeof checkInEntries.$inferInsert;
