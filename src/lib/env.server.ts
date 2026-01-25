import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  DATABASE_HOST_DEV: z.string().min(1),
  DATABASE_HOST_PROD: z.string().min(1),
  DATABASE_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0),
  DATABASE_USERNAME: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),

  CLERK_WEBHOOK_SECRET: z.string().min(1),
});

export const serverEnv = serverEnvSchema.parse(process.env);
