import { describe, expect, it, jest, beforeEach, afterEach } from "@jest/globals";
import { createLogger } from "../logger";

describe("createLogger", () => {
  let logSpy: jest.SpiedFunction<typeof console.log>;
  let warnSpy: jest.SpiedFunction<typeof console.warn>;
  let errorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    jest.restoreAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a logger with context", () => {
    const logger = createLogger({ product: "test_product" });
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  it("logs at info level via console.log", () => {
    const logger = createLogger({ product: "test" });
    logger.info("test message");

    expect(logSpy).toHaveBeenCalledTimes(1);
    const output = JSON.parse(logSpy.mock.calls[0]![0] as string) as Record<string, unknown>;
    expect(output.level).toBe("info");
    expect(output.message).toBe("test message");
  });

  it("logs at debug level via console.log", () => {
    const logger = createLogger({ product: "test" });
    logger.debug("debug message");

    expect(logSpy).toHaveBeenCalledTimes(1);
    const output = JSON.parse(logSpy.mock.calls[0]![0] as string) as Record<string, unknown>;
    expect(output.level).toBe("debug");
    expect(output.message).toBe("debug message");
  });

  it("logs at warn level via console.warn", () => {
    const logger = createLogger({ product: "test" });
    logger.warn("warning message");

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const output = JSON.parse(warnSpy.mock.calls[0]![0] as string) as Record<string, unknown>;
    expect(output.level).toBe("warn");
    expect(output.message).toBe("warning message");
  });

  it("logs at error level via console.error", () => {
    const logger = createLogger({ product: "test" });
    logger.error("error message");

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const output = JSON.parse(errorSpy.mock.calls[0]![0] as string) as Record<string, unknown>;
    expect(output.level).toBe("error");
    expect(output.message).toBe("error message");
  });

  it("includes an ISO timestamp in every log entry", () => {
    const logger = createLogger({ product: "test" });
    logger.info("timestamp test");

    const output = JSON.parse(logSpy.mock.calls[0]![0] as string) as Record<string, unknown>;
    expect(typeof output.timestamp).toBe("string");
    // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
    expect(output.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it("merges context data into log entries", () => {
    const logger = createLogger({
      product: "ai_orchestrator",
      action: "generate",
      userId: "user-123",
    });
    logger.info("test merge", { taskType: "audit_review", extra: 42 });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const output = JSON.parse(logSpy.mock.calls[0]![0] as string) as Record<string, unknown>;
    expect(output.product).toBe("ai_orchestrator");
    expect(output.action).toBe("generate");
    expect(output.userId).toBe("user-123");
    expect(output.taskType).toBe("audit_review");
    expect(output.extra).toBe(42);
  });

  it("error includes stack trace when Error is provided", () => {
    const logger = createLogger({ product: "test" });
    const error = new Error("test failure");
    logger.error("something broke", error, { requestId: "req-1" });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const output = JSON.parse(errorSpy.mock.calls[0]![0] as string) as Record<string, unknown>;
    expect(output.level).toBe("error");
    expect(output.message).toBe("something broke");
    expect(typeof output.stack).toBe("string");
    expect(output.stack).toContain("Error: test failure");
    expect(output.requestId).toBe("req-1");
  });
});
