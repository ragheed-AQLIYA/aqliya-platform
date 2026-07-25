// Request-level tracing utilities for AQLIYA Next.js routes.
// Adds X-Trace-ID to responses, records timing, and creates root spans.
// Ownership: src/lib/platform/monitoring/**

import { trace, SpanStatusCode, SpanKind, context } from "@opentelemetry/api";
import type { Span, Attributes } from "@opentelemetry/api";
import { NextRequest, NextResponse } from "next/server";

const TRACER_NAME = "aqliya-platform.http";

/** Metadata captured for each traced request. */
export interface TraceRequestMeta {
  traceId: string | null;
  spanId: string | null;
  startTime: number;
  /** Internal: reference to the span for ending it. */
  _span: Span | null;
}

/**
 * Start a trace span for an incoming HTTP request.
 * Returns metadata including trace/span IDs for attaching to the response.
 *
 * Usage in route handlers:
 *   const meta = traceRequest("GET", "/api/engagements");
 *   try {
 *     // ... handle request
 *     return NextResponse.json(result);
 *   } finally {
 *     endTraceRequest(meta, 200);
 *   }
 */
export function traceRequest(
  method: string,
  path: string,
  attributes?: Attributes,
): TraceRequestMeta {
  const tracer = trace.getTracer(TRACER_NAME);
  const startTime = Date.now();

  const span = tracer.startSpan(
    `${method} ${path}`,
    {
      kind: SpanKind.SERVER,
      attributes: {
        "http.method": method,
        "http.url": path,
        ...attributes,
      },
    },
  );

  const spanContext = span.spanContext();

  return {
    traceId:
      spanContext.traceId !== "00000000000000000000000000000000"
        ? spanContext.traceId
        : null,
    spanId:
      spanContext.spanId !== "00000000" ? spanContext.spanId : null,
    startTime,
    _span: span,
  };
}

/**
 * Execute a function within the span context of a traced request.
 * Use this when downstream code needs to create child spans.
 */
export function withTraceContext<T>(
  meta: TraceRequestMeta,
  fn: () => T,
): T {
  if (!meta._span) return fn();
  const ctx = trace.setSpan(context.active(), meta._span);
  return context.with(ctx, fn);
}

/**
 * End a request trace span and record final status.
 * Always call this in a finally block to ensure spans are closed.
 */
export function endTraceRequest(
  meta: TraceRequestMeta,
  statusCode: number,
): void {
  if (!meta._span) return;

  const durationMs = Date.now() - meta.startTime;
  meta._span.setAttributes({
    "http.status_code": statusCode,
    "http.response_time_ms": durationMs,
  });

  if (statusCode >= 400) {
    meta._span.setStatus({
      code: SpanStatusCode.ERROR,
      message: `HTTP ${statusCode}`,
    });
  } else {
    meta._span.setStatus({ code: SpanStatusCode.OK });
  }

  meta._span.end();
}

/**
 * Attach trace context to a NextResponse.
 * Adds X-Trace-ID and X-Span-ID headers so the client/frontend
 * can correlate errors and logs with the server trace.
 */
export function attachTraceHeaders(
  response: NextResponse,
  meta: TraceRequestMeta,
): NextResponse {
  if (meta.traceId) {
    response.headers.set("X-Trace-ID", meta.traceId);
  }
  if (meta.spanId) {
    response.headers.set("X-Span-ID", meta.spanId);
  }
  return response;
}

/**
 * Create a traced wrapper for Next.js route handler GET/POST/etc.
 * Wraps the handler with span creation, timing, and error recording.
 *
 * Usage:
 *   export const GET = createTracedRouteHandler("engagement.list", async (req) => {
 *     return NextResponse.json(data);
 *   });
 */
export function createTracedRouteHandler(
  routeName: string,
  handler: (
    req: NextRequest,
    meta: TraceRequestMeta,
  ) => Promise<NextResponse>,
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const method = req.method;
    const path = req.nextUrl.pathname;

    const meta = traceRequest(method, path, {
      "aqliya.route.name": routeName,
    });

    try {
      const response = await withTraceContext(meta, () => handler(req, meta));
      endTraceRequest(meta, response.status);
      attachTraceHeaders(response, meta);
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (meta._span) {
        meta._span.setStatus({
          code: SpanStatusCode.ERROR,
          message: err.message,
        });
        meta._span.recordException(err);
      }
      endTraceRequest(meta, 500);
      throw error;
    }
  };
}
