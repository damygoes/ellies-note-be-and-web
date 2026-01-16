import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { users } from "@/db/schema/user";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { allowlistAndSanitize } from "@/utils/validateRequestBody";

type UpdateMeBody = Partial<{
  firstName: string;
  lastName: string;
  username: string;
  image: string;
}>;

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const row = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId))
      .limit(1);

    if (!row[0]) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: row[0] });
  } catch (err) {
    console.error("[api/me] ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const body = (await req.json()) as UpdateMeBody;

    const parsed = allowlistAndSanitize(body, {
      firstName: { kind: "string", optional: true, sanitize: (s) => s.trim() },
      lastName: { kind: "string", optional: true, sanitize: (s) => s.trim() },
      username: { kind: "string", optional: true, sanitize: (s) => s.trim() },
      image: { kind: "string", optional: true, sanitize: (s) => s.trim() },
    } as const);

    if (!parsed.ok) return jsonError(400, parsed.message);

    const updates = parsed.data;

    // enforce "at least one field" for PATCH
    if (Object.keys(updates).length === 0) {
      return jsonError(400, "No valid fields to update");
    }

    const updatedRows = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json({ success: true, data: updatedRows[0] });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}

export async function DELETE() {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    // Single delete – cascades to notification_settings
    await db.delete(users).where(eq(users.id, user.id));

    // Clerk deletion (admin API)
    const client = await clerkClient();
    await client.users.deleteUser(clerkUserId);

    return NextResponse.json({ success: true, data: null });
  } catch (err: any) {
    console.error("[api/me DELETE] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
