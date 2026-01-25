import { z } from "zod";

const common = {
  NODE_ENV: z.enum(["development", "production"]),

  DATABASE_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => Number.isFinite(val) && val > 0),

  DATABASE_USERNAME: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),

  CLERK_WEBHOOK_SECRET: z.string().min(1),
};

const serverEnvSchema = z.discriminatedUnion("NODE_ENV", [
  z.object({
    ...common,
    NODE_ENV: z.literal("development"),
    DATABASE_URL_DEV: z.string().min(1),
    DATABASE_HOST_DEV: z.string().min(1),

    // allow prod vars to be absent in dev
    DATABASE_URL_PROD: z.string().optional(),
    DATABASE_HOST_PROD: z.string().optional(),
  }),
  z.object({
    ...common,
    NODE_ENV: z.literal("production"),
    DATABASE_URL_PROD: z.string().min(1),
    DATABASE_HOST_PROD: z.string().min(1),

    // allow dev vars to be absent in prod
    DATABASE_URL_DEV: z.string().optional(),
    DATABASE_HOST_DEV: z.string().optional(),
  }),
]);

export const serverEnv = serverEnvSchema.parse(process.env);
