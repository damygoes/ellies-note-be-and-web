import { z } from "zod";

const serverEnvSchema = z.object({
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  NODE_ENV: z.string().optional(),

  DATABASE_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => Number.isFinite(val) && val > 0),

  DATABASE_USERNAME: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DATABASE_HOST: z.string().min(1),

  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  QSTASH_CURRENT_SIGNING_KEY: z.string().min(1),
  QSTASH_NEXT_SIGNING_KEY: z.string().min(1),
  QSTASH_TOKEN: z.string().min(1),
  QSTASH_URL: z.string().min(1),

  VERCEL_OIDC_TOKEN: z.string().min(1).optional(),
});

export const serverEnv = serverEnvSchema.parse(process.env);
