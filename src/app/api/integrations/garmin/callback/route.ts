import { NextResponse } from "next/server";

import { jsonError } from "@/utils/jsonError";

// Garmin OAuth 1.0a callback — not yet implemented
export async function GET() {
  try {
    return NextResponse.json(
      { success: false, error: "Garmin OAuth not yet implemented" },
      { status: 501 },
    );
  } catch {
    return jsonError(500, "Internal server error");
  }
}
