import { serverEnv } from "@/lib/env.server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/user";

const ENV = serverEnv.NODE_ENV;
const DATABASE_URL =
  ENV === "production"
    ? serverEnv.DATABASE_URL_PROD
    : serverEnv.DATABASE_URL_DEV;

const sql = neon(DATABASE_URL);
export const db = drizzle({ client: sql, schema: schema });
