import { db } from "@/db";
import { users } from "@/db/schema/user";
import { eq } from "drizzle-orm";

export async function getAppUserIdByClerkId(clerkUserId: string) {
  const row = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);

  return row[0]?.id ?? null;
}
