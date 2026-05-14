import { db } from "@/db";
import { crashDays } from "@/db/schema/crashDay";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const [deleted] = await db
      .delete(crashDays)
      .where(and(eq(crashDays.id, id), eq(crashDays.userId, user.id)))
      .returning();

    if (!deleted) return jsonError(404, "Crash day not found");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/crash-days/[id] DELETE] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
