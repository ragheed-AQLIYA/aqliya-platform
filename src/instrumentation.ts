import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize OpenTelemetry tracing before any other imports.
    // This ensures HTTP/PG auto-instrumentation hooks are in place
    // before the rest of the application loads.
    const { initTracing } = await import("./lib/observability/tracing");
    initTracing();

    const { logStartupEnvWarnings } =
      await import("./lib/platform/runtime-env-check");
    logStartupEnvWarnings();
    const { warmAuthConfig } = await import("./lib/auth-config");
    await warmAuthConfig();
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
