import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { pushTokens } from '@/db/schema/pushTokens';
import { requireClerkUserId } from '@/lib/serverAuth';
import { getAppUserByClerkId } from '@/utils/getAppUserIdByClerkId';
import { jsonError } from '@/utils/jsonError';
import { allowlistAndSanitize } from '@/utils/validateRequestBody';

type Body = {
  expoPushToken: string;
  platform?: string;
  deviceId?: string;
};

export async function POST(req: Request) {
  try {
    const clerkUserId = await requireClerkUserId();
    const user = await getAppUserByClerkId(clerkUserId);
    if (!user) return jsonError(404, 'User not found');

    const body = (await req.json()) as Body;

    const parsed = allowlistAndSanitize(body, {
      expoPushToken: { kind: 'string', sanitize: (s) => s.trim() },
      platform: { kind: 'string', optional: true, sanitize: (s) => s.trim() },
      deviceId: { kind: 'string', optional: true, sanitize: (s) => s.trim() },
    } as const);

    if (!parsed.ok) return jsonError(400, parsed.message);

    const { expoPushToken, platform, deviceId } = parsed.data;

    // Minimal validation: Expo tokens start with "ExponentPushToken[" or "ExpoPushToken["
    if (!expoPushToken.includes('PushToken')) {
      return jsonError(400, 'Invalid Expo push token');
    }

    // Upsert by (userId + expoPushToken) OR by (userId + deviceId) if you prefer
    const existing = await db
      .select()
      .from(pushTokens)
      .where(
        and(
          eq(pushTokens.userId, user.id),
          eq(pushTokens.expoPushToken, expoPushToken)
        )
      )
      .limit(1);

    if (existing[0]) {
      const updated = await db
        .update(pushTokens)
        .set({
          platform: platform ?? existing[0].platform,
          deviceId: deviceId ?? existing[0].deviceId,
          updatedAt: new Date(),
        })
        .where(eq(pushTokens.id, existing[0].id))
        .returning();

      return NextResponse.json({ success: true, data: updated[0] });
    }

    const inserted = await db
      .insert(pushTokens)
      .values({
        userId: user.id,
        expoPushToken,
        platform: platform ?? null,
        deviceId: deviceId ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      { success: true, data: inserted[0] },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('[api/me/push-token POST] ERROR:', err);
    if (err instanceof Error && err.message === 'UNAUTHORIZED')
      return jsonError(401, 'Unauthorized');
    return jsonError(500, 'Internal server error');
  }
}
