import { serverEnv } from "@/lib/env.server";
import { NextResponse } from "next/server";
import "server-only";

export async function GET() {
  const vercelEnv = process.env.VERCEL_ENV ?? "unknown";
  const nodeEnv = process.env.NODE_ENV ?? "unknown";
  const dbHost = new URL(serverEnv.DATABASE_URL).host;

  console.log(`[health] vercel=${vercelEnv} node=${nodeEnv} dbHost=${dbHost}`);

  // Return non-sensitive info only
  return NextResponse.json({ ok: true, vercelEnv, nodeEnv, dbHost });
}
