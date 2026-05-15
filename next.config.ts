import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["suppressive-jayne-flouncily.ngrok-free.dev"],
};

export default withSentryConfig(nextConfig, {
  org: "damilola-bada",
  project: "elliesnote-web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    treeshake: { removeDebugLogging: true },
  },
});
