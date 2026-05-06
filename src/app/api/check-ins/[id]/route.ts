import { db } from "@/db";
import { checkInEntries, SYMPTOM_VALUES } from "@/db/schema/checkInEntry";
import { requireClerkUserId } from "@/lib/serverAuth";
import { getAppUserByClerkId } from "@/utils/getAppUserIdByClerkId";
import { isIntegerInRange } from "@/utils/isIntegerInRange";
import { jsonError } from "@/utils/jsonError";
import { allowlistAndSanitize } from "@/utils/validateRequestBody";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, "User not found");

    const body = await req.json();
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
    } as const);

    if (!parsed.ok) return jsonError(400, parsed.message);

    const { energyLevel, notes } = parsed.data;
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

    const [updated] = await db
      .update(checkInEntries)
      .set({ energyLevel, symptoms: validSymptoms, notes: notes ?? null })
      .where(and(eq(checkInEntries.id, id), eq(checkInEntries.userId, user.id)))
      .returning();

    if (!updated) return jsonError(404, "Entry not found");

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("[api/check-ins/[id] PATCH] ERROR:", err);
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
