import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// NOTE: cacheComponents is intentionally OFF for v1.
// Use unstable_cache + revalidateTag (previous model).
// See: node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 (replace ACCOUNT_ID with your actual account ID)
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      // Optional: custom domain on R2 bucket
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
            },
          ]
        : []),
    ],
  },

  // Turbopack is default for dev and build in Next 16.
  // Do NOT add webpack config — it will fail the build.

  experimental: {
    // instrumentationHook is enabled by default in Next 16
  },
};

// Only wrap with Sentry when DSN is configured (keeps local dev clean)
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;

export default sentryDsn
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true, // suppress CLI output in CI
      disableLogger: true,
      widenClientFileUpload: true,
    })
  : nextConfig;
