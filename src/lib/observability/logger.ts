// Structured Logger for AQLIYA Observability
// Replaces console.log/console.error in critical paths with JSON-structured entries.
// Ownership: src/lib/platform/monitoring/**

type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
  product?: string;
  action?: string;
  userId?: string;
  organizationId?: string;
  requestId?: string;
};

type LogData = Record<string, unknown>;

function log(level: LogLevel, message: string, data: LogData): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  };

  const json = JSON.stringify(entry);

  if (level === "error") {
    console.error(json);
  } else if (level === "warn") {
    console.warn(json);
  } else {
    console.log(json);
  }
}

/**
 * Creates a logger bound to a specific context.
 *
 * Usage:
 *   const logger = createLogger({ product: "ai_orchestrator", action: "generate" });
 *   logger.info("Generation started", { taskType: "audit_review" });
 *   logger.error("Provider failed", error, { providerId: "openai" });
 */
export function createLogger(context: LogContext) {
  return {
    debug: (message: string, data?: LogData) =>
      log("debug", message, { ...context, ...data }),
    info: (message: string, data?: LogData) =>
      log("info", message, { ...context, ...data }),
    warn: (message: string, data?: LogData) =>
      log("warn", message, { ...context, ...data }),
    error: (message: string, error?: Error, data?: LogData) =>
      log("error", message, { ...context, ...data, stack: error?.stack }),
  };
}
