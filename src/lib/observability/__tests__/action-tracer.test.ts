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
};

const mockTracer = {
  startActiveSpan: jest.fn().mockImplementation(
    (_name: string, _opts: unknown, fn: (span: typeof mockSpan) => unknown) =>
      fn(mockSpan),
  ),
};

jest.mock("@opentelemetry/api", () => ({
  trace: {
    getTracer: jest.fn().mockReturnValue(mockTracer),
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

describe("action-tracer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTracedAction", () => {
    it("wraps an async action with tracing", async () => {
      const { createTracedAction } = await import("../action-tracer");
      const myAction = createTracedAction("test.action", async (input: string) => {
        return `result:${input}`;
      });

      const result = await myAction("hello");

      expect(result.result).toBe("result:hello");
      expect(result.success).toBe(true);
      expect(result.traceId).toBe("abc123def456abc123def456abc123de");
      expect(result.spanId).toBe("12345678");
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: "OK" });
      expect(mockSpan.setAttributes).toHaveBeenCalledWith(
        expect.objectContaining({ "aqliya.action.success": true }),
      );
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it("records errors on failure", async () => {
      const { createTracedAction } = await import("../action-tracer");
      const failingAction = createTracedAction("test.fail", async () => {
        throw new Error("action failed");
      });

      const result = await failingAction(undefined as never);

      expect(result.success).toBe(false);
      expect(result.result).toBeUndefined();
      expect(mockSpan.setStatus).toHaveBeenCalledWith({
        code: "ERROR",
        message: "action failed",
      });
      expect(mockSpan.recordException).toHaveBeenCalled();
      expect(mockSpan.end).toHaveBeenCalled();
    });

    it("includes action name in span attributes", async () => {
      const { createTracedAction } = await import("../action-tracer");
      const myAction = createTracedAction("engagement.create", async () => "ok");

      await myAction(undefined as never);

      expect(mockTracer.startActiveSpan).toHaveBeenCalledWith(
        "action.engagement.create",
        expect.objectContaining({
          attributes: expect.objectContaining({
            "aqliya.action.name": "engagement.create",
          }),
        }),
        expect.any(Function),
      );
    });

    it("includes custom attributes in span", async () => {
      const { createTracingAction } = await import("../action-tracer");
      // Use the actual function name from the module
      const mod = await import("../action-tracer");
      const myAction = mod.createTracedAction(
        "test.custom",
        async () => "ok",
        { attributes: { "custom.key": "custom.value" } },
      );

      await myAction(undefined as never);

      expect(mockTracer.startActiveSpan).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          attributes: expect.objectContaining({
            "custom.key": "custom.value",
          }),
        }),
        expect.any(Function),
      );
    });
  });

  describe("createTracedActionSync", () => {
    it("wraps a sync action with tracing", () => {
      const { createTracedActionSync } = require("../action-tracer");
      const syncAction = createTracedActionSync("test.sync", (input: number) => {
        return input * 2;
      });

      const result = syncAction(5);

      expect(result.result).toBe(10);
      expect(result.success).toBe(true);
      expect(result.traceId).toBe("abc123def456abc123def456abc123de");
      expect(result.spanId).toBe("12345678");
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(mockSpan.end).toHaveBeenCalled();
    });
  });
});
