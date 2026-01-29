import { serverEnv } from "@/lib/env.server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/user";

const DATABASE_URL = serverEnv.DATABASE_URL;

// ✅ Log the host the DB CLIENT is built with (not in the webhook)
console.log("[db] init host =", new URL(DATABASE_URL).host);

const sql = neon(DATABASE_URL);
export const db = drizzle({ client: sql, schema: schema });
