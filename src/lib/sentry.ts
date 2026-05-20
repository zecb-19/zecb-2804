import "server-only";

import * as Sentry from "@sentry/nextjs";

let initialized = false;

export function initSentry() {
  if (initialized) return;
  initialized = true;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.log("[sentry] SENTRY_DSN not set — error capture disabled");
    return;
  }

  Sentry.init({
    dsn,
    release: process.env.SENTRY_RELEASE || "zecb-dev",
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    beforeSend(event) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[sentry] Would send event:", event.exception?.values?.[0]?.value);
      }
      return event;
    },
  });

  console.log("[sentry] Initialized — errors will be captured");
}

export function captureException(err: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(err, { extra: context });
}
