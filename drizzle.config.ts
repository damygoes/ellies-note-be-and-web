import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is missing for drizzle-kit");

export default defineConfig({
  out: "./src/db/drizzle",
  schema: "./src/db/schema/*",
  dialect: "postgresql",
  dbCredentials: {
    url,
    ssl: "require",
  },
  // verbose: true,
  strict: true,
});
