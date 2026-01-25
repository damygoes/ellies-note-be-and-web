import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/drizzle",
  schema: "./src/db/schema/*",
  dialect: "postgresql",
  dbCredentials: {
    host:
      process.env.NODE_ENV === "production"
        ? process.env.DATABASE_HOST_PROD!
        : process.env.DATABASE_HOST_DEV!,
    port: parseInt(process.env.DATABASE_PORT!),
    user: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    ssl: "require",
  },
  // verbose: true,
  strict: true,
});
