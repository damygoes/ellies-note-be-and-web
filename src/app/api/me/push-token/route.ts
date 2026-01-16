import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { pushTokens } from '@/db/schema/pushTokens';
import { users } from '@/db/schema/user';
import { requireClerkUserId } from '@/lib/serverAuth';
import { getAppUserByClerkId } from '@/utils/getAppUserIdByClerkId';
import { jsonError } from '@/utils/jsonError';
import { allowlistAndSanitize } from '@/utils/validateRequestBody';

type Body = {
  expoPushToken: string;
  platform?: string;
  deviceId?: string;
  timezone?: string; // IANA timezone, e.g. "Europe/Berlin"
};

function isLikelyExpoPushToken(token: string) {
  // Expo tokens typically look like:
  // ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
  // ExpoPushToken[xxxxxxxxxxxxxxxxxxxxxx]
  return (
    token.startsWith('ExponentPushToken[') ||
    token.startsWith('ExpoPushToken[') ||
    token.includes('PushToken[')
  );
}

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
      timezone: { kind: 'string', optional: true, sanitize: (s) => s.trim() },
    } as const);

    if (!parsed.ok) return jsonError(400, parsed.message);

    const { expoPushToken, platform, deviceId, timezone } = parsed.data;

    if (!isLikelyExpoPushToken(expoPushToken)) {
      return jsonError(400, 'Invalid Expo push token');
    }

    // Update user's timezone (if provided)
    if (timezone && timezone.length > 0) {
      await db
        .update(users)
        .set({ timezone, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    // Prefer upsert by deviceId (most stable on mobile)
    if (deviceId) {
      const existingByDevice = await db
        .select()
        .from(pushTokens)
        .where(
          and(eq(pushTokens.userId, user.id), eq(pushTokens.deviceId, deviceId))
        )
        .limit(1);

      if (existingByDevice[0]) {
        const updated = await db
          .update(pushTokens)
          .set({
            expoPushToken, // refresh token for this device
            platform: platform ?? existingByDevice[0].platform,
            updatedAt: new Date(),
          })
          .where(eq(pushTokens.id, existingByDevice[0].id))
          .returning();

        return NextResponse.json({ success: true, data: updated[0] });
      }

      // No row for this device yet -> insert
      const inserted = await db
        .insert(pushTokens)
        .values({
          userId: user.id,
          expoPushToken,
          platform: platform ?? null,
          deviceId,
          updatedAt: new Date(),
        })
        .returning();

      return NextResponse.json(
        { success: true, data: inserted[0] },
        { status: 201 }
      );
    }

    // Fallback: upsert by (userId, expoPushToken)
    const existingByToken = await db
      .select()
      .from(pushTokens)
      .where(
        and(
          eq(pushTokens.userId, user.id),
          eq(pushTokens.expoPushToken, expoPushToken)
        )
      )
      .limit(1);

    if (existingByToken[0]) {
      const updated = await db
        .update(pushTokens)
        .set({
          platform: platform ?? existingByToken[0].platform,
          deviceId: deviceId ?? existingByToken[0].deviceId,
          updatedAt: new Date(),
        })
        .where(eq(pushTokens.id, existingByToken[0].id))
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
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      { success: true, data: inserted[0] },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('[api/me/push-token POST] ERROR:', err);
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return jsonError(401, 'Unauthorized');
    }
    return jsonError(500, 'Internal server error');
  }
}
