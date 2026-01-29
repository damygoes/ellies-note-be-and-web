import { serverEnv } from "@/lib/env.server";
import "server-only";

export function logEnvFingerprint(context: string) {
  const vercelEnv = process.env.VERCEL_ENV ?? "unknown";
  const nodeEnv = process.env.NODE_ENV ?? "unknown";

  let dbHost = "unknown";
  let dbUrl = "";
  try {
    dbHost = new URL(serverEnv.DATABASE_URL).host;
  } catch {}

  // Never log full DATABASE_URL. Host is usually safe.
  console.log(
    `[env] ${context} vercel=${vercelEnv} node=${nodeEnv} dbHost=${dbHost}`,
  );
}
