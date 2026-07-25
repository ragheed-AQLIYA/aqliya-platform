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
    getActiveSpan: jest.fn().mockReturnValue(mockSpan),
    getTracer: jest.fn().mockReturnValue({
      startActiveSpan: jest.fn().mockImplementation(
        (_name: string, _opts: unknown, fn: (span: typeof mockSpan) => unknown) => fn(mockSpan),
      ),
    }),
    setSpan: jest.fn().mockReturnValue({}),
    activeContext: jest.fn().mockReturnValue({}),
    setSpanContext: jest.fn(),
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

describe("trace-context", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTraceId", () => {
    it("returns trace ID when active span exists", async () => {
      const { getTraceId } = await import("../trace-context");
      const traceId = getTraceId();
      expect(traceId).toBe("abc123def456abc123def456abc123de");
    });

    it("returns null when no active span", async () => {
      const { trace } = await import("@opentelemetry/api");
      (trace.getActiveSpan as jest.Mock).mockReturnValueOnce(null);
      const { getTraceId } = await import("../trace-context");
      const traceId = getTraceId();
      expect(traceId).toBeNull();
    });
  });

  describe("getSpanId", () => {
    it("returns span ID when active span exists", async () => {
      const { getSpanId } = await import("../trace-context");
      const spanId = getSpanId();
      expect(spanId).toBe("12345678");
    });

    it("returns null when no active span", async () => {
      const { trace } = await import("@opentelemetry/api");
      (trace.getActiveSpan as jest.Mock).mockReturnValueOnce(null);
      const { getSpanId } = await import("../trace-context");
      const spanId = getSpanId();
      expect(spanId).toBeNull();
    });
  });

  describe("createSpan", () => {
    it("creates a span and executes the function", async () => {
      const { createSpan } = await import("../trace-context");
      const result = await createSpan("test.span", async (span) => {
        expect(span).toBe(mockSpan);
        return "hello";
      });
      expect(result).toBe("hello");
      expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: "OK" });
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it("records error and re-throws on failure", async () => {
      const { createSpan } = await import("../trace-context");
      const testError = new Error("test failure");

      await expect(
        createSpan("test.span", async () => {
          throw testError;
        }),
      ).rejects.toThrow("test failure");

      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: "ERROR",
        message: "test failure",
      });
      expect(mockSpan.recordException).toHaveBeenCalledWith(testError);
      expect(mockSpan.end).toHaveBeenCalled();
    });
  });

  describe("addSpanAttributes", () => {
    it("sets attributes on active span", async () => {
      const { addSpanAttributes } = await import("../trace-context");
      addSpanAttributes({ "test.key": "test.value" });
      expect(mockSpan.setAttributes).toHaveBeenCalledWith({ "test.key": "test.value" });
    });

    it("does not throw when no active span", async () => {
      const { trace } = await import("@opentelemetry/api");
      (trace.getActiveSpan as jest.Mock).mockReturnValueOnce(null);
      const { addSpanAttributes } = await import("../trace-context");
      expect(() => addSpanAttributes({ "test.key": "test.value" })).not.toThrow();
    });
  });

  describe("recordSpanError", () => {
    it("records error on active span", async () => {
      const { recordSpanError } = await import("../trace-context");
      const error = new Error("test error");
      recordSpanError(error);
      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: "ERROR",
        message: "test error",
      });
      expect(mockSpan.recordException).toHaveBeenCalledWith(error);
    });

    it("does not throw when no active span", async () => {
      const { trace } = await import("@opentelemetry/api");
      (trace.getActiveSpan as jest.Mock).mockReturnValueOnce(null);
      const { recordSpanError } = await import("../trace-context");
      expect(() => recordSpanError(new Error("test"))).not.toThrow();
    });
  });

  describe("getTraceContextHeader", () => {
    it("returns W3C traceparent header", async () => {
      const { getTraceContextHeader } = await import("../trace-context");
      const header = getTraceContextHeader();
      expect(header).toBe(
        "00-abc123def456abc123def456abc123de-12345678-01",
      );
    });
  });

  describe("setSpanName", () => {
    it("updates span name", async () => {
      const { setSpanName } = await import("../trace-context");
      setSpanName("new.name");
      expect(mockSpan.updateName).toHaveBeenCalledWith("new.name");
    });
  });
});
