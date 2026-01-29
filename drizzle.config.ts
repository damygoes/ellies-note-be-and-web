import { serverEnv } from "@/lib/env.server";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/drizzle",
  schema: "./src/db/schema/*",
  dialect: "postgresql",
  dbCredentials: {
    host: serverEnv.DATABASE_HOST,
    port: serverEnv.DATABASE_PORT,
    user: serverEnv.DATABASE_USERNAME,
    password: serverEnv.DATABASE_PASSWORD,
    database: serverEnv.DATABASE_NAME,
    ssl: "require",
  },
  // verbose: true,
  strict: true,
});
