import dotenv from "dotenv";

const nodeEnv = process.env.NODE_ENV ?? "development";
dotenv.config({ path: `.env.${nodeEnv}.local` });
dotenv.config({ path: `.env.local` });
dotenv.config({ path: `.env.${nodeEnv}` });
dotenv.config({ path: `.env` });

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const sql = neon(url);

async function migrate() {
  console.log("Running migration...\n");

  // 1. check_in_entries: drop old columns
  await sql`ALTER TABLE check_in_entries DROP COLUMN IF EXISTS pain_level`;
  console.log("✓ Dropped pain_level");

  await sql`ALTER TABLE check_in_entries DROP COLUMN IF EXISTS influenced_by`;
  console.log("✓ Dropped influenced_by");

  // 2. check_in_entries: rename note → notes
  // Guard: only rename if note exists and notes does not
  const hasNote = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'check_in_entries' AND column_name = 'note'
  `;
  const hasNotes = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'check_in_entries' AND column_name = 'notes'
  `;
  if (hasNote.length > 0 && hasNotes.length === 0) {
    await sql`ALTER TABLE check_in_entries RENAME COLUMN note TO notes`;
    console.log("✓ Renamed note → notes");
  } else {
    console.log("– note → notes: skipped (already done or column absent)");
  }

  // 3. check_in_entries: add new columns
  await sql`
    ALTER TABLE check_in_entries
    ADD COLUMN IF NOT EXISTS check_in_date date
  `;
  console.log("✓ Added check_in_date");

  await sql`
    ALTER TABLE check_in_entries
    ADD COLUMN IF NOT EXISTS symptoms text[] NOT NULL DEFAULT '{}'
  `;
  console.log("✓ Added symptoms");

  // 4. wearable_connections table
  await sql`
    CREATE TABLE IF NOT EXISTS wearable_connections (
      id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id             uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider            text        NOT NULL,
      access_token        text,
      access_token_secret text,
      provider_user_id    text,
      is_active           boolean     NOT NULL DEFAULT true,
      last_sync_at        timestamptz,
      connected_at        timestamptz NOT NULL DEFAULT now(),
      updated_at          timestamptz NOT NULL DEFAULT now()
    )
  `;
  console.log("✓ Created wearable_connections");

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS wearable_connections_user_provider_idx
    ON wearable_connections(user_id, provider)
  `;
  console.log("✓ Created wearable_connections unique index");

  // 5. health_metrics table
  await sql`
    CREATE TABLE IF NOT EXISTS health_metrics (
      id          uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     uuid             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider    text             NOT NULL,
      metric_type text             NOT NULL,
      value       double precision NOT NULL,
      unit        text             NOT NULL,
      measured_at timestamptz      NOT NULL,
      created_at  timestamptz      NOT NULL DEFAULT now()
    )
  `;
  console.log("✓ Created health_metrics");

  await sql`
    CREATE INDEX IF NOT EXISTS health_metrics_user_metric_time_idx
    ON health_metrics(user_id, metric_type, measured_at)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS health_metrics_user_time_idx
    ON health_metrics(user_id, measured_at)
  `;
  console.log("✓ Created health_metrics indexes");

  console.log("\nMigration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
