import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load env files in the same priority order Next.js uses.
// dotenv.config() is a no-op for keys that are already set, so the first
// file that defines a variable wins (highest priority first).
const nodeEnv = process.env.NODE_ENV ?? "development";
dotenv.config({ path: `.env.${nodeEnv}.local` });
dotenv.config({ path: `.env.local` });
dotenv.config({ path: `.env.${nodeEnv}` });
dotenv.config({ path: `.env` });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is missing — check your .env files");

export default defineConfig({
  out: "./src/db/drizzle",
  schema: "./src/db/schema/*",
  dialect: "postgresql",
  dbCredentials: {
    url,
    ssl: "require",
  },
  strict: true,
});
