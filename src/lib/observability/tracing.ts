// OpenTelemetry Distributed Tracing for AQLIYA Platform
// Initializes NodeTracerProvider with HTTP and PostgreSQL instrumentations.
// Configurable via environment variables. Gracefully degrades when OTEL is unavailable.
// Ownership: src/lib/platform/monitoring/**

import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { createLogger } from "@/lib/observability/logger";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { trace, context, diag, DiagLogLevel } from "@opentelemetry/api";
import { resourceFromAttributes } from "@opentelemetry/resources";

const logger = createLogger({ product: "platform", action: "unknown" });

/** Configuration for the AQLIYA tracing subsystem. */
export interface TracingConfig {
  serviceName: string;
  serviceVersion: string;
  otlpEndpoint: string | null;
  consoleExporter: boolean;
  samplingRatio: number;
}

/** Reads tracing configuration from environment variables. */
export function getTracingConfig(): TracingConfig {
  return {
    serviceName: process.env.OTEL_SERVICE_NAME ?? "aqliya-platform",
    serviceVersion: process.env.OTEL_SERVICE_VERSION ?? "0.1.0",
    otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? null,
    consoleExporter: process.env.OTEL_CONSOLE_EXPORTER === "true",
    samplingRatio: parseFloat(process.env.OTEL_SAMPLING_RATIO ?? "1.0"),
  };
}

let provider: NodeTracerProvider | null = null;
let initialized = false;

/**
 * Returns the singleton tracer provider, or null if not initialized.
 */
export function getTracerProvider(): NodeTracerProvider | null {
  return provider;
}

/**
 * Returns whether tracing was successfully initialized.
 */
export function isTracingInitialized(): boolean {
  return initialized;
}

/**
 * Returns a diagnostic status summary for the health endpoint.
 */
export function getTracingStatus(): {
  initialized: boolean;
  serviceName: string;
  otlpEndpoint: string | null;
  otlpConfigured: boolean;
  exporterStatus: "configured" | "console-only" | "disabled";
} {
  const config = getTracingConfig();
  return {
    initialized,
    serviceName: config.serviceName,
    otlpEndpoint: config.otlpEndpoint,
    otlpConfigured: config.otlpEndpoint !== null,
    exporterStatus: config.otlpEndpoint
      ? "configured"
      : config.consoleExporter
        ? "console-only"
        : "disabled",
  };
}

/**
 * Initialize the OpenTelemetry tracing provider.
 * Safe to call multiple times — only the first call takes effect.
 *
 * Must be called during Next.js instrumentation register() under NEXT_RUNTIME=nodejs.
 */
export function initTracing(): void {
  if (initialized) return;

  const config = getTracingConfig();

  // Configure diagnostic logging based on env
  const diagLevel =
    process.env.OTEL_LOG_LEVEL === "debug"
      ? DiagLogLevel.DEBUG
      : process.env.OTEL_LOG_LEVEL === "info"
        ? DiagLogLevel.INFO
        : process.env.OTEL_LOG_LEVEL === "warn"
          ? DiagLogLevel.WARN
          : process.env.OTEL_LOG_LEVEL === "error"
            ? DiagLogLevel.ERROR
            : DiagLogLevel.WARN;
  diag.setLogger(
    {
      error: (msg) => logger.error(`[OTel] ${msg}`),
      warn: (msg) => logger.warn(`[OTel] ${msg}`),
      info: (msg) => logger.info(`[OTel] ${msg}`),
      debug: (msg) => logger.info(`[OTel:debug] ${msg}`),
      verbose: (msg) => logger.info(`[OTel:verbose] ${msg}`),
    },
    diagLevel,
  );

  try {
    // Build resource with service identity
    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: config.serviceName,
      [ATTR_SERVICE_VERSION]: config.serviceVersion,
    });

    // Build span processors based on configuration
    const spanProcessors = [];

    // Set up OTLP exporter if endpoint configured
    if (config.otlpEndpoint) {
      const otlpExporter = new OTLPTraceExporter({
        url: `${config.otlpEndpoint}/v1/traces`,
      });
      // BatchSpanProcessor buffers and sends in batches — production default
      spanProcessors.push(new BatchSpanProcessor(otlpExporter));
    }

    if (config.consoleExporter) {
      // SimpleSpanProcessor for dev — sends each span immediately to console
      spanProcessors.push(
        new SimpleSpanProcessor(new ConsoleSpanExporter()),
      );
    }

    // Create provider with resource and span processors
    provider = new NodeTracerProvider({
      resource,
      spanProcessors,
    });

    // Register HTTP and PostgreSQL instrumentations.
    // These hook into the respective modules and create spans automatically.
    registerInstrumentations({
      instrumentations: [
        new HttpInstrumentation({
          // Don't trace health checks and static assets to reduce noise
          ignoreIncomingRequestHook: (request) => {
            const url = request.url ?? "";
            return (
              url.includes("/api/platform/health") ||
              url.includes("/_next/") ||
              url.includes("/favicon")
            );
          },
        }),
        new PgInstrumentation(),
      ],
    });

    // Register as global provider so @opentelemetry/api calls find it
    provider.register();

    initialized = true;

    logger.info(
      `[OTel] Tracing initialized — service: ${config.serviceName}, ` +
        `exporter: ${config.otlpEndpoint ? "otlp" : config.consoleExporter ? "console" : "none"}`,
    );
  } catch (error) {
    // Graceful degradation — tracing is optional
    logger.warn("[OTel] Failed to initialize tracing — continuing without distributed traces:", { error: error instanceof Error ? error.message : String(error), });
    provider = null;
    initialized = false;
  }
}

/**
 * Gracefully shut down the tracer provider.
 * Flushes any buffered spans before exiting.
 */
export async function shutdownTracing(): Promise<void> {
  if (!provider) return;
  try {
    await provider.shutdown();
    logger.info("[OTel] Tracing shut down gracefully");
  } catch (error) {
    logger.warn("[OTel] Error during tracing shutdown:", { error: error instanceof Error ? error.message : String(error), });
  } finally {
    provider = null;
    initialized = false;
  }
}

