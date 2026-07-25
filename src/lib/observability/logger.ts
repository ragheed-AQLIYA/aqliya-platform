// Structured Logger for AQLIYA Observability
// Replaces console.log/console.error in critical paths with JSON-structured entries.
// Auto-injects trace context (traceId, spanId) from OpenTelemetry when available.
// Ownership: src/lib/platform/monitoring/**

import { trace } from "@opentelemetry/api";

type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
  product?: string;
  action?: string;
  userId?: string;
  organizationId?: string;
  requestId?: string;
};

type LogData = Record<string, unknown>;

/**
 * Extract trace context from the active OTel span, if available.
 * Returns empty object when tracing is not initialized or no span is active.
 */
function getTraceContext(): { traceId?: string; spanId?: string } {
  try {
    const span = trace.getActiveSpan();
    if (!span) return {};
    const ctx = span.spanContext();
    const hasTraceId = ctx.traceId && ctx.traceId !== "00000000000000000000000000000000";
    const hasSpanId = ctx.spanId && ctx.spanId !== "00000000";
    if (!hasTraceId && !hasSpanId) return {};
    return {
      ...(hasTraceId ? { traceId: ctx.traceId } : {}),
      ...(hasSpanId ? { spanId: ctx.spanId } : {}),
    };
  } catch {
    // OTel not available or not initialized — return empty
    return {};
  }
}

function log(level: LogLevel, message: string, data: LogData): void {
  const traceCtx = getTraceContext();
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...traceCtx,
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
 *
 * Every log entry automatically includes traceId and spanId when OTel tracing
 * is active, enabling correlation between logs and distributed traces.
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
