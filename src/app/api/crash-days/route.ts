import { db } from "@/db";
import { crashDays } from "@/db/schema/crashDay";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { jsonError } from "@/utils/jsonError";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const rows = await db
      .select()
      .from(crashDays)
      .where(eq(crashDays.userId, user.id))
      .orderBy(desc(crashDays.date));

    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    console.error("[api/crash-days GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}

export async function POST(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const body = await req.json();
    const { date } = body as { date?: string };

    if (!date || !DATE_RE.test(date)) {
      return jsonError(400, "date must be in YYYY-MM-DD format");
    }

    const [inserted] = await db
      .insert(crashDays)
      .values({ userId: user.id, date })
      .returning();

    return NextResponse.json({ success: true, data: inserted }, { status: 201 });
  } catch (err: any) {
    console.error("[api/crash-days POST] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
