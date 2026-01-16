import { db } from "@/db";
import { checkInEntries } from "@/db/schema/checkInEntry";
import { requireClerkUserId } from "@/lib/serverAuth";
import { parseDateParam } from "@/utils/date/parseDateParam";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { isIntegerInRange } from "@/utils/isIntegerInRange";
import { jsonError } from "@/utils/jsonError";
import { parseIntParam } from "@/utils/parseIntParam";
import { allowlistAndSanitize } from "@/utils/validateRequestBody";
import { and, desc, eq, gte, lt, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

type CreateCheckInDTO = {
  energyLevel: number;
  painLevel: number;
  influencedBy?: string[];
  note?: string;
};

export async function GET(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const url = new URL(req.url);

    const limit = Math.min(
      50,
      Math.max(1, parseIntParam(url.searchParams.get("limit"), 20))
    );

    // Cursor pagination: return entries older than this timestamp
    const cursorDate = parseDateParam(url.searchParams.get("cursor"));

    // Optional range filter
    const fromDate = parseDateParam(url.searchParams.get("from"));
    const toDate = parseDateParam(url.searchParams.get("to"));

    const whereParts = [eq(checkInEntries.userId, user.id)];

    if (cursorDate) whereParts.push(lt(checkInEntries.createdAt, cursorDate));
    if (fromDate) whereParts.push(gte(checkInEntries.createdAt, fromDate));
    if (toDate) whereParts.push(lte(checkInEntries.createdAt, toDate));

    const rows = await db
      .select()
      .from(checkInEntries)
      .where(and(...whereParts))
      .orderBy(desc(checkInEntries.createdAt))
      .limit(limit);

    // Next cursor: oldest item returned (use its createdAt)
    const nextCursor =
      rows.length > 0 ? rows[rows.length - 1]!.createdAt.toISOString() : null;

    return NextResponse.json({
      success: true,
      data: rows,
      meta: { limit, nextCursor },
    });
  } catch (err: any) {
    console.error("[api/check-ins GET] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}

export async function POST(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const body = (await req.json()) as CreateCheckInDTO;

    const parsed = allowlistAndSanitize(body, {
      energyLevel: { kind: "number" },
      painLevel: { kind: "number" },
      influencedBy: {
        kind: "array",
        optional: true,
        sanitizeItem: (v) => String(v).trim(),
        maxLength: 20,
      },
      note: {
        kind: "string",
        optional: true,
        sanitize: (input) => input.trim().slice(0, 2000),
      },
    } as const);

    if (!parsed.ok) return jsonError(400, parsed.message);

    const { energyLevel, painLevel, influencedBy, note } = parsed.data;

    if (!isIntegerInRange(energyLevel, 1, 10))
      return jsonError(400, "energyLevel must be an integer between 1 and 10");
    if (!isIntegerInRange(painLevel, 1, 10))
      return jsonError(400, "painLevel must be an integer between 1 and 10");

    const tags = (influencedBy ?? [])
      .map((tag) => String(tag).trim())
      .filter(Boolean)
      .slice(0, 20);

    const inserted = await db
      .insert(checkInEntries)
      .values({
        userId: user.id,
        energyLevel,
        painLevel,
        influencedBy: tags,
        note,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: inserted[0] },
      { status: 201 }
    );
  } catch (err) {
    console.error("[api/check-ins POST] ERROR:", err);
    return jsonError(500, "Internal server error");
  }
}
