import { db } from "@/db";
import { users } from "@/db/schema/user";
import { eq } from "drizzle-orm";

export async function getAppUserByClerkId(clerkUserId: string) {
  const row = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  return row[0] ?? null;
}
