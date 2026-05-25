import * as Sentry from "@sentry/nextjs";

// Only initialize when DSN is configured
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",

    // Capture 100% of transactions in dev, 10% in prod
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Replay only on errors
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.0,

    debug: false,
  });
}
