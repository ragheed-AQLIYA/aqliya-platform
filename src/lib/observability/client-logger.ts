/**
 * Client-side logger for error boundaries and React components.
 * Uses structured logging in production, human-readable console in development.
 *
 * Mirrors the server-side createLogger() API from logger.ts but operates
 * entirely in the browser — no server-only imports, no OTel dependencies.
 */

type LogLevel = "error" | "warn" | "info";

interface ClientLogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
  timestamp: string;
  url?: string;
}

function buildEntry(
  level: LogLevel,
  context: string,
  message: string,
  error?: Error,
  data?: Record<string, unknown>,
): ClientLogEntry {
  return {
    level,
    message,
    context: { ...{ boundary: context }, ...data },
    error: error
      ? { name: error.name, message: error.message, stack: error.stack }
      : undefined,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : undefined,
  };
}

/**
 * Creates a client-side logger bound to a context string (usually the
 * error-boundary component name or feature area).
 *
 * Usage:
 *   const logger = createClientLogger("AuditOS ErrorBoundary");
 *   logger.error("Failed to render engagement", error, { engagementId });
 */
export function createClientLogger(context: string) {
  return {
    error(
      message: string,
      error?: Error,
      data?: Record<string, unknown>,
    ) {
      const entry = buildEntry("error", context, message, error, data);
      if (process.env.NODE_ENV === "development") {
        console.error(`[${context}] ${message}`, error ?? "", data ?? "");
      } else {
        console.error(JSON.stringify(entry));
      }
    },
    warn(message: string, data?: Record<string, unknown>) {
      const entry = buildEntry("warn", context, message, undefined, data);
      if (process.env.NODE_ENV === "development") {
        console.warn(`[${context}] ${message}`, data ?? "");
      } else {
        console.warn(JSON.stringify(entry));
      }
    },
    info(message: string, data?: Record<string, unknown>) {
      const entry = buildEntry("info", context, message, undefined, data);
      if (process.env.NODE_ENV === "development") {
        console.log(`[${context}] ${message}`, data ?? "");
      } else {
        console.log(JSON.stringify(entry));
      }
    },
  };
}

/**
 * Default singleton client logger for error boundaries.
 * Import and use directly without instantiation:
 *   import { clientLogger } from "@/lib/observability/client-logger";
 *   clientLogger.error("Something failed", error);
 */
export const clientLogger = createClientLogger("ErrorBoundary");

export type { ClientLogEntry, LogLevel };
