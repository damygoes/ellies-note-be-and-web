import { db } from "@/db";
import { checkInEntries, SYMPTOM_VALUES } from "@/db/schema/checkInEntry";
import { requireClerkUserId } from "@/lib/serverAuth";
import { parseDateParam } from "@/utils/date/parseDateParam";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { isIntegerInRange } from "@/utils/isIntegerInRange";
import { jsonError } from "@/utils/jsonError";
import { parseIntParam } from "@/utils/parseIntParam";
import { allowlistAndSanitize } from "@/utils/validateRequestBody";
import { and, desc, eq, gte, lt, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type CreateCheckInDTO = {
  energyLevel: number;
  symptoms?: string[];
  notes?: string;
  checkInDate?: string;
  createdAt?: string;
};

export async function GET(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const url = new URL(req.url);

    const limit = Math.min(
      50,
      Math.max(1, parseIntParam(url.searchParams.get("limit"), 20)),
    );

    const cursorDate = parseDateParam(url.searchParams.get("cursor"));
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
      symptoms: {
        kind: "array",
        optional: true,
        sanitizeItem: (v) => String(v).trim(),
        maxLength: SYMPTOM_VALUES.length,
      },
      notes: {
        kind: "string",
        optional: true,
        sanitize: (input) => input.trim().slice(0, 2000),
      },
      checkInDate: {
        kind: "string",
        optional: true,
        sanitize: (input) => input.trim(),
      },
      createdAt: {
        kind: "string",
        optional: true,
        sanitize: (input) => input.trim(),
      },
    } as const);

    if (!parsed.ok) return jsonError(400, parsed.message);

    const { energyLevel, notes, checkInDate, createdAt } = parsed.data;
    const rawSymptoms = (parsed.data.symptoms ?? []) as unknown[];

    if (!isIntegerInRange(energyLevel, 1, 5)) {
      return jsonError(400, "energyLevel must be an integer between 1 and 5");
    }

    const validSymptoms = rawSymptoms
      .map((s) => String(s))
      .filter((s) => (SYMPTOM_VALUES as readonly string[]).includes(s));

    if (rawSymptoms.length > 0 && validSymptoms.length !== rawSymptoms.length) {
      return jsonError(400, `symptoms must be one of: ${SYMPTOM_VALUES.join(", ")}`);
    }

    if (checkInDate !== undefined && !DATE_RE.test(checkInDate)) {
      return jsonError(400, "checkInDate must be in YYYY-MM-DD format");
    }

    let createdAtDate: Date | undefined;

    if (createdAt) {
      createdAtDate = new Date(createdAt);

      if (Number.isNaN(createdAtDate.getTime())) {
        return jsonError(400, "createdAt must be a valid ISO date");
      }

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      if (createdAtDate > now) {
        return jsonError(400, "createdAt cannot be in the future");
      }

      if (createdAtDate < sevenDaysAgo) {
        return jsonError(400, "Backfilled entries can only be up to 7 days old");
      }
    }

    const inserted = await db
      .insert(checkInEntries)
      .values({
        userId: user.id,
        checkInDate: checkInDate ?? null,
        energyLevel,
        symptoms: validSymptoms,
        notes,
        createdAt: createdAtDate ?? new Date(),
      })
      .returning();

    return NextResponse.json(
      { success: true, data: inserted[0] },
      { status: 201 },
    );
  } catch (err) {
    console.error("[api/check-ins POST] ERROR:", err);
    return jsonError(500, "Internal server error");
  }
}
