import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { users } from "@/db/schema/user";

// RevenueCat event types that affect subscription status
const ACTIVATING_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "SUBSCRIPTION_EXTENDED",
]);

const DEACTIVATING_EVENTS = new Set([
  "EXPIRATION",
  "CANCELLATION",
  "SUBSCRIBER_ALIAS",
]);

type RevenueCatEvent = {
  type: string;
  app_user_id: string; // set to Clerk user ID via Purchases.logIn()
  expiration_at_ms?: number | null;
};

type RevenueCatPayload = {
  event: RevenueCatEvent;
};

export async function POST(req: Request) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (secret) {
    const auth = req.headers.get("Authorization");
    if (auth !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = (await req.json()) as RevenueCatPayload;
    const { event } = body;

    if (!event?.type || !event?.app_user_id) {
      return NextResponse.json({ ok: true });
    }

    const clerkUserId = event.app_user_id;

    if (ACTIVATING_EVENTS.has(event.type)) {
      const expiresAt = event.expiration_at_ms
        ? new Date(event.expiration_at_ms)
        : null;

      await db
        .update(users)
        .set({
          subscriptionStatus: "premium",
          subscriptionExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId, clerkUserId));
    } else if (DEACTIVATING_EVENTS.has(event.type)) {
      await db
        .update(users)
        .set({
          subscriptionStatus: "free",
          subscriptionExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId, clerkUserId));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhooks/revenuecat POST] ERROR:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
