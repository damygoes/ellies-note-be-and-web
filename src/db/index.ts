import { serverEnv } from "@/lib/env.server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as checkInEntrySchema from "./schema/checkInEntry";
import * as healthMetricsSchema from "./schema/healthMetrics";
import * as notificationSettingsSchema from "./schema/notificationSettings";
import * as pushTokensSchema from "./schema/pushTokens";
import * as reminderSendsSchema from "./schema/reminderSends";
import * as userSchema from "./schema/user";
import * as wearableConnectionsSchema from "./schema/wearableConnections";

const schema = {
  ...userSchema,
  ...checkInEntrySchema,
  ...notificationSettingsSchema,
  ...pushTokensSchema,
  ...reminderSendsSchema,
  ...wearableConnectionsSchema,
  ...healthMetricsSchema,
};

const sql = neon(serverEnv.DATABASE_URL);
export const db = drizzle({ client: sql, schema });
