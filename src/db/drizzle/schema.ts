import { pgTable, unique, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clerkUserId: text("clerk_user_id").notNull(),
	email: text(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	username: text(),
}, (table) => [
	unique("users_clerk_user_id_unique").on(table.clerkUserId),
	unique("users_username_unique").on(table.username),
]);
