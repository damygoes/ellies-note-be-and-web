import {
  date,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const SYMPTOM_VALUES = [
  "fatigue",
  "brain_fog",
  "headache",
  "muscle_pain",
  "joint_pain",
  "sleep_disturbance",
  "dizziness",
  "nausea",
] as const;

export type Symptom = (typeof SYMPTOM_VALUES)[number];

export const checkInEntries = pgTable("check_in_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  checkInDate: date("check_in_date"),
  energyLevel: smallint("energy_level").notNull(),
  symptoms: text("symptoms").array().notNull().default([]),
  notes: text("notes"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CheckInEntryRow = typeof checkInEntries.$inferSelect;
export type NewCheckInEntry = typeof checkInEntries.$inferInsert;
