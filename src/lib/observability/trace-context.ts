// Trace context utilities for AQLIYA.
// Provides helpers to extract and manipulate distributed trace context.
// Gracefully returns empty values when OTel is not initialized.
// Ownership: src/lib/platform/monitoring/**

import { trace, context, SpanStatusCode, SpanKind } from "@opentelemetry/api";
import type { Span, Attributes } from "@opentelemetry/api";

/**
 * Get the current trace ID from the active span context.
 * Returns null if no active span or tracing not initialized.
 */
export function getTraceId(): string | null {
  const span = trace.getActiveSpan();
  if (!span) return null;
  const spanContext = span.spanContext();
  return spanContext.traceId !== "00000000000000000000000000000000"
    ? spanContext.traceId
    : null;
}

/**
 * Get the current span ID from the active span context.
 * Returns null if no active span or tracing not initialized.
 */
export function getSpanId(): string | null {
  const span = trace.getActiveSpan();
  if (!span) return null;
  const spanContext = span.spanContext();
  return spanContext.spanId !== "00000000"
    ? spanContext.spanId
    : null;
}

/**
 * Create a child span and execute a function within it.
 * The span is automatically ended when the function completes.
 * Errors are recorded on the span before re-throwing.
 *
 * @param name - Span name (use dot-notation like "aqliya.engagement.create")
 * @param fn - Async function to execute within the span
 * @param attributes - Optional initial attributes for the span
 */
export async function createSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Attributes,
): Promise<T> {
  const tracer = trace.getTracer("aqliya-platform");
  return tracer.startActiveSpan(
    name,
    { kind: SpanKind.INTERNAL, attributes },
    async (span) => {
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : String(error),
        });
        span.recordException(
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error;
      } finally {
        span.end();
      }
    },
  );
}

/**
 * Synchronous variant of createSpan for non-async contexts.
 *
 * @param name - Span name
 * @param fn - Synchronous function to execute within the span
 * @param attributes - Optional initial attributes for the span
 */
export function createSpanSync<T>(
  name: string,
  fn: (span: Span) => T,
  attributes?: Attributes,
): T {
  const tracer = trace.getTracer("aqliya-platform");
  return tracer.startActiveSpan(
    name,
    { kind: SpanKind.INTERNAL, attributes },
    (span) => {
      try {
        const result = fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : String(error),
        });
        span.recordException(
          error instanceof Error ? error : new Error(String(error)),
        );
        throw error;
      } finally {
        span.end();
      }
    },
  );
}

/**
 * Add attributes to the currently active span.
 * No-op if no active span exists.
 */
export function addSpanAttributes(attrs: Attributes): void {
  const span = trace.getActiveSpan();
  if (!span) return;
  span.setAttributes(attrs);
}

/**
 * Record an error on the currently active span.
 * No-op if no active span exists.
 */
export function recordSpanError(error: Error | unknown): void {
  const span = trace.getActiveSpan();
  if (!span) return;
  const err = error instanceof Error ? error : new Error(String(error));
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: err.message,
  });
  span.recordException(err);
}

/**
 * Get trace context as W3C TraceContext header string.
 * Useful for propagating trace context across service boundaries.
 * Returns null if no active span.
 */
export function getTraceContextHeader(): string | null {
  const span = trace.getActiveSpan();
  if (!span) return null;
  const spanContext = span.spanContext();
  if (spanContext.traceId === "00000000000000000000000000000000") return null;
  return `00-${spanContext.traceId}-${spanContext.spanId}-01`;
}

/**
 * Set the current active span name.
 * Useful for renaming spans based on runtime context.
 */
export function setSpanName(name: string): void {
  const span = trace.getActiveSpan();
  if (!span) return;
  span.updateName(name);
}
