import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["suppressive-jayne-flouncily.ngrok-free.dev"],
};

export default withSentryConfig(nextConfig, {
  org: "damilola-bada",
  project: "elliesnote-web",
  // This org is hosted on Sentry's EU region; the default https://sentry.io/
  // API is the US region and returns "Project not found" for EU orgs/tokens.
  sentryUrl: "https://de.sentry.io/",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    treeshake: { removeDebugLogging: true },
  },
});
