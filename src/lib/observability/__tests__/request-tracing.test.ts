import { describe, expect, it, jest, beforeEach } from "@jest/globals";

const mockSpan = {
  spanContext: jest.fn().mockReturnValue({
    traceId: "abc123def456abc123def456abc123de",
    spanId: "12345678",
    traceFlags: 1,
  }),
  setAttributes: jest.fn(),
  setStatus: jest.fn(),
  recordException: jest.fn(),
  end: jest.fn(),
  updateName: jest.fn(),
};

jest.mock("@opentelemetry/api", () => ({
  trace: {
    getTracer: jest.fn().mockReturnValue({
      startSpan: jest.fn().mockReturnValue(mockSpan),
    }),
    setSpan: jest.fn().mockReturnValue({}),
    activeContext: jest.fn().mockReturnValue({}),
    setSpanContext: jest.fn(),
    getActiveSpan: jest.fn().mockReturnValue(mockSpan),
  },
  context: {
    active: jest.fn().mockReturnValue({}),
    with: jest.fn().mockImplementation((_ctx: unknown, fn: () => unknown) => fn()),
  },
  SpanStatusCode: {
    OK: "OK",
    ERROR: "ERROR",
  },
  SpanKind: {
    INTERNAL: 0,
    SERVER: 1,
  },
}));

describe("request-tracing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("traceRequest", () => {
    it("creates a span for a request and returns metadata", async () => {
      const { traceRequest } = await import("../request-tracing");
      const meta = traceRequest("GET", "/api/test");

      expect(meta.traceId).toBe("abc123def456abc123def456abc123de");
      expect(meta.spanId).toBe("12345678");
      expect(meta.startTime).toBeGreaterThan(0);
      expect(meta._span).toBe(mockSpan);
    });
  });

  describe("endTraceRequest", () => {
    it("ends span and sets success status for 2xx", async () => {
      const { traceRequest, endTraceRequest } = await import("../request-tracing");
      const meta = traceRequest("GET", "/api/test");
      endTraceRequest(meta, 200);

      expect(mockSpan.setAttributes).toHaveBeenCalledWith(
        expect.objectContaining({ "http.status_code": 200 }),
      );
      expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: "OK" });
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it("sets error status for 4xx/5xx", async () => {
      const { traceRequest, endTraceRequest } = await import("../request-tracing");
      const meta = traceRequest("POST", "/api/test");
      endTraceRequest(meta, 500);

      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: "ERROR",
        message: "HTTP 500",
      });
    });

    it("calculates duration", async () => {
      const { traceRequest, endTraceRequest } = await import("../request-tracing");
      const meta = traceRequest("GET", "/api/test");
      endTraceRequest(meta, 200);

      expect(mockSpan.setAttributes).toHaveBeenCalledWith(
        expect.objectContaining({
          "http.response_time_ms": expect.any(Number),
        }),
      );
    });
  });

  describe("attachTraceHeaders", () => {
    it("adds X-Trace-ID and X-Span-ID headers", async () => {
      const { traceRequest, attachTraceHeaders } = await import("../request-tracing");
      const { NextResponse } = await import("next/server");
      const meta = traceRequest("GET", "/api/test");
      const response = NextResponse.json({});
      const result = attachTraceHeaders(response, meta);

      expect(result.headers.get("X-Trace-ID")).toBe(
        "abc123def456abc123def456abc123de",
      );
      expect(result.headers.get("X-Span-ID")).toBe("12345678");
    });
  });

  describe("createTracedRouteHandler", () => {
    it("wraps a route handler with tracing", async () => {
      const { createTracedRouteHandler } = await import("../request-tracing");
      const handler = createTracedRouteHandler("test.route", async (_req, meta) => {
        const { NextResponse } = await import("next/server");
        return NextResponse.json({ ok: true });
      });

      const mockReq = {
        method: "GET",
        nextUrl: { pathname: "/api/test" },
      } as never;

      const response = await handler(mockReq);
      expect(response).toBeDefined();
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it("records errors on handler failure", async () => {
      const { createTracedRouteHandler } = await import("../request-tracing");
      const handler = createTracedRouteHandler("test.fail", async () => {
        throw new Error("handler failed");
      });

      const mockReq = {
        method: "POST",
        nextUrl: { pathname: "/api/fail" },
      } as never;

      await expect(handler(mockReq)).rejects.toThrow("handler failed");
      expect(mockSpan.recordException).toHaveBeenCalled();
      expect(mockSpan.end).toHaveBeenCalled();
    });
  });
});
