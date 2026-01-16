import {
  pgTable,
  timestamp,
  uuid,
  text,
  integer,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './user';

export const reminderSends = pgTable(
  'reminder_sends',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // local date in user timezone, like "2026-01-16"
    localDate: text('local_date').notNull(),

    // 0..1439, local minute-of-day the reminder corresponds to
    minuteOfDay: integer('minute_of_day').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('reminder_sends_user_date_minute_unique').on(
      t.userId,
      t.localDate,
      t.minuteOfDay
    ),
  ]
);
