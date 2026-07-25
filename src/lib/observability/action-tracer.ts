// Server Action tracing wrapper for AQLIYA.
// Wraps server actions with distributed trace spans and timing metrics.
// Ownership: src/lib/platform/monitoring/**

import { trace, SpanStatusCode, SpanKind, context } from "@opentelemetry/api";
import type { Attributes } from "@opentelemetry/api";

const TRACER_NAME = "aqliya-platform.action";

/** Result of a traced action execution. */
export interface TracedActionResult<T> {
  result: T;
  traceId: string | null;
  spanId: string | null;
  durationMs: number;
  success: boolean;
}

/**
 * Wrap a server action with tracing.
 * Creates a span named "action.{name}", records duration and outcome,
 * and attaches trace IDs for correlation.
 *
 * Usage:
 *   export const createEngagement = createTracedAction(
 *     "engagement.create",
 *     async (input: CreateEngagementInput) => {
 *       // ... server action logic
 *       return { id: engagement.id };
 *     },
 *   );
 */
export function createTracedAction<TInput, TOutput>(
  name: string,
  fn: (input: TInput) => Promise<TOutput>,
  options?: {
    /** Additional attributes to attach to every span. */
    attributes?: Attributes;
  },
): (input: TInput) => Promise<TracedActionResult<TOutput>> {
  return async (input: TInput): Promise<TracedActionResult<TOutput>> => {
    const tracer = trace.getTracer(TRACER_NAME);
    const startTime = Date.now();

    const result = await tracer.startActiveSpan(
      `action.${name}`,
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          "aqliya.action.name": name,
          ...options?.attributes,
        },
      },
      async (span) => {
        try {
          const output = await fn(input);
          span.setStatus({ code: SpanStatusCode.OK });
          span.setAttributes({ "aqliya.action.success": true });

          const spanContext = span.spanContext();
          return {
            result: output,
            traceId:
              spanContext.traceId !== "00000000000000000000000000000000"
                ? spanContext.traceId
                : null,
            spanId:
              spanContext.spanId !== "00000000"
                ? spanContext.spanId
                : null,
            durationMs: Date.now() - startTime,
            success: true,
          };
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: err.message,
          });
          span.recordException(err);
          span.setAttributes({ "aqliya.action.success": false });

          const spanContext = span.spanContext();
          return {
            result: undefined as TOutput,
            traceId:
              spanContext.traceId !== "00000000000000000000000000000000"
                ? spanContext.traceId
                : null,
            spanId:
              spanContext.spanId !== "00000000"
                ? spanContext.spanId
                : null,
            durationMs: Date.now() - startTime,
            success: false,
          };
        } finally {
          span.end();
        }
      },
    );

    return result;
  };
}

/**
 * Create a synchronous traced action wrapper.
 * For server actions that don't need async.
 */
export function createTracedActionSync<TInput, TOutput>(
  name: string,
  fn: (input: TInput) => TOutput,
  options?: {
    attributes?: Attributes;
  },
): (input: TInput) => TracedActionResult<TOutput> {
  return (input: TInput): TracedActionResult<TOutput> => {
    const tracer = trace.getTracer(TRACER_NAME);
    const startTime = Date.now();

    return tracer.startActiveSpan(
      `action.${name}`,
      {
        kind: SpanKind.INTERNAL,
        attributes: {
          "aqliya.action.name": name,
          ...options?.attributes,
        },
      },
      (span) => {
        try {
          const output = fn(input);
          span.setStatus({ code: SpanStatusCode.OK });
          span.setAttributes({ "aqliya.action.success": true });

          const spanContext = span.spanContext();
          return {
            result: output,
            traceId:
              spanContext.traceId !== "00000000000000000000000000000000"
                ? spanContext.traceId
                : null,
            spanId:
              spanContext.spanId !== "00000000"
                ? spanContext.spanId
                : null,
            durationMs: Date.now() - startTime,
            success: true,
          };
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: err.message,
          });
          span.recordException(err);

          const spanContext = span.spanContext();
          return {
            result: undefined as TOutput,
            traceId:
              spanContext.traceId !== "00000000000000000000000000000000"
                ? spanContext.traceId
                : null,
            spanId:
              spanContext.spanId !== "00000000"
                ? spanContext.spanId
                : null,
            durationMs: Date.now() - startTime,
            success: false,
          };
        } finally {
          span.end();
        }
      },
    );
  };
}
