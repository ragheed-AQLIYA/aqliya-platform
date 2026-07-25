import { describe, expect, it, jest, beforeEach, afterEach } from "@jest/globals";

// Mock the OTel modules before importing the module under test
jest.mock("@opentelemetry/sdk-trace-node", () => {
  const addSpanProcessor = jest.fn();
  const register = jest.fn();
  const shutdown = jest.fn(() => Promise.resolve());
  return {
    NodeTracerProvider: jest.fn().mockImplementation(() => ({
      addSpanProcessor,
      register,
      shutdown,
    })),
  };
});

jest.mock("@opentelemetry/sdk-trace-base", () => ({
  BatchSpanProcessor: jest.fn().mockImplementation(() => ({})),
  SimpleSpanProcessor: jest.fn().mockImplementation(() => ({})),
  ConsoleSpanExporter: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@opentelemetry/resources", () => ({
  Resource: jest.fn().mockImplementation((attrs: Record<string, string>) => ({
    attributes: attrs,
  })),
}));

jest.mock("@opentelemetry/instrumentation", () => ({
  registerInstrumentations: jest.fn(),
}));

jest.mock("@opentelemetry/instrumentation-http", () => ({
  HttpInstrumentation: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@opentelemetry/instrumentation-pg", () => ({
  PgInstrumentation: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@opentelemetry/exporter-trace-otlp-http", () => ({
  OTLPTraceExporter: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@opentelemetry/api", () => {
  const noopFn = () => {};
  return {
    trace: {
      setGlobalTracerProvider: noopFn,
      getActiveSpan: jest.fn().mockReturnValue(null),
    },
    context: {
      setGlobalContextManager: noopFn,
    },
    diag: {
      setLogger: noopFn,
    },
    DiagLogLevel: {
      NONE: 0,
      ERROR: 30,
      WARN: 50,
      INFO: 60,
      DEBUG: 70,
    },
  };
});

describe("tracing", () => {
  beforeEach(() => {
    jest.resetModules();
    // Reset env vars
    delete process.env.OTEL_SERVICE_NAME;
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    delete process.env.OTEL_CONSOLE_EXPORTER;
    delete process.env.OTEL_LOG_LEVEL;
    delete process.env.OTEL_SAMPLING_RATIO;
    delete process.env.OTEL_SERVICE_VERSION;
  });

  afterEach(() => {
    delete process.env.OTEL_SERVICE_NAME;
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    delete process.env.OTEL_CONSOLE_EXPORTER;
  });

  it("getTracingConfig returns defaults when no env vars set", async () => {
    const { getTracingConfig } = await import("../tracing");
    const config = getTracingConfig();
    expect(config.serviceName).toBe("aqliya-platform");
    expect(config.serviceVersion).toBe("0.1.0");
    expect(config.otlpEndpoint).toBeNull();
    expect(config.consoleExporter).toBe(false);
    expect(config.samplingRatio).toBe(1.0);
  });

  it("getTracingConfig reads from env vars", async () => {
    process.env.OTEL_SERVICE_NAME = "custom-service";
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
    process.env.OTEL_CONSOLE_EXPORTER = "true";
    process.env.OTEL_SERVICE_VERSION = "2.0.0";
    process.env.OTEL_SAMPLING_RATIO = "0.5";

    const { getTracingConfig } = await import("../tracing");
    const config = getTracingConfig();
    expect(config.serviceName).toBe("custom-service");
    expect(config.otlpEndpoint).toBe("http://localhost:4318");
    expect(config.consoleExporter).toBe(true);
    expect(config.serviceVersion).toBe("2.0.0");
    expect(config.samplingRatio).toBe(0.5);
  });

  it("isTracingInitialized returns false before init", async () => {
    const { isTracingInitialized } = await import("../tracing");
    expect(isTracingInitialized()).toBe(false);
  });

  it("getTracerProvider returns null before init", async () => {
    const { getTracerProvider } = await import("../tracing");
    expect(getTracerProvider()).toBeNull();
  });

  it("getTracingStatus returns correct default state", async () => {
    const { getTracingStatus } = await import("../tracing");
    const status = getTracingStatus();
    expect(status.initialized).toBe(false);
    expect(status.serviceName).toBe("aqliya-platform");
    expect(status.otlpEndpoint).toBeNull();
    expect(status.otlpConfigured).toBe(false);
    expect(status.exporterStatus).toBe("disabled");
  });

  it("getTracingStatus reports configured when OTLP endpoint set", async () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
    const { getTracingStatus } = await import("../tracing");
    const status = getTracingStatus();
    expect(status.otlpConfigured).toBe(true);
    expect(status.exporterStatus).toBe("configured");
  });

  it("getTracingStatus reports console-only when console exporter enabled", async () => {
    process.env.OTEL_CONSOLE_EXPORTER = "true";
    const { getTracingStatus } = await import("../tracing");
    const status = getTracingStatus();
    expect(status.otlpConfigured).toBe(false);
    expect(status.exporterStatus).toBe("console-only");
  });
});
