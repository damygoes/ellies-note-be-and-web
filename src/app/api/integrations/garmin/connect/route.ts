import { NextResponse } from "next/server";

import { requireClerkUserId } from "@/lib/serverAuth";
import { jsonError } from "@/utils/jsonError";

// Garmin OAuth 1.0a initiation — not yet implemented
export async function GET() {
  try {
    await requireClerkUserId();

    return NextResponse.json(
      { success: false, error: "Garmin OAuth not yet implemented" },
      { status: 501 },
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return jsonError(401, "Unauthorized");
    }
    return jsonError(500, "Internal server error");
  }
}
