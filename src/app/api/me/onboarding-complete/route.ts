import { requireClerkUserId } from "@/lib/serverAuth";
import { jsonError } from "@/utils/jsonError";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const clerkUserId = await requireClerkUserId();
    const client = await clerkClient();

    const u = await client.users.getUser(clerkUserId);

    await client.users.updateUser(clerkUserId, {
      publicMetadata: {
        ...(u.publicMetadata ?? {}),
        onboardingComplete: true,
        onboardingVersion: 1,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED") return jsonError(401, "Unauthorized");
    return jsonError(500, "Internal server error");
  }
}
