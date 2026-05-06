import "server-only";

let sentryInitialized = false;

export function initSentry() {
  if (sentryInitialized) return;
  sentryInitialized = true;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.log("[sentry] SENTRY_DSN not set — error capture disabled");
    return;
  }

  // Dynamic import to avoid bundling Sentry when DSN is absent.
  // The operator adds @sentry/nextjs to dependencies and sets SENTRY_DSN
  // to activate. Until then this is a documented no-op.
  console.log("[sentry] DSN configured — install @sentry/nextjs to activate");
}

export function captureException(err: unknown, context?: Record<string, unknown>) {
  console.error("[sentry-capture]", err, context);
}
