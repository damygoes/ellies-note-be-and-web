import { db } from "@/db";
import { users } from "@/db/schema/user";
import { serverEnv } from "@/lib/env.server";
import type { WebhookEvent } from "@clerk/backend"; // optional typing; you can also define your own
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const secret = serverEnv.CLERK_WEBHOOK_SECRET;

  if (!secret)
    return NextResponse.json(
      { error: "Missing CLERK_WEBHOOK_SECRET" },
      { status: 500 },
    );

  // IMPORTANT: use raw body text for signature verification
  const payload = await req.text();

  const h = await headers();
  const svixId = h.get("svix-id") ?? "";
  const svixTimestamp = h.get("svix-timestamp") ?? "";
  const svixSignature = h.get("svix-signature") ?? "";

  let evt: WebhookEvent;

  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (evt.type === "user.created") {
    const data: any = evt.data;

    const clerkUserId: string = data.id;
    const email: string | undefined = data.email_addresses?.[0]?.email_address;
    const firstName: string | undefined = data.first_name ?? undefined;
    const lastName: string | undefined = data.last_name ?? undefined;
    const image: string | undefined = data.profile_image_url ?? undefined;

    await db
      .insert(users)
      .values({
        clerkUserId,
        email,
        firstName,
        lastName,
        image,
      })
      .onConflictDoNothing({ target: users.clerkUserId });

    const count = await db.execute(
      sql`select count(*)::int as count from public.users`,
    );

    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    return NextResponse.json({ ok: true, user: row });
  }

  if (evt.type === "user.deleted") {
    const data: any = evt.data;
    const clerkUserId: string = data.id;

    // Delete app user row by clerkUserId
    await db.delete(users).where(eq(users.clerkUserId, clerkUserId));

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
