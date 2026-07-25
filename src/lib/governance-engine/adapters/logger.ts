import { createLogger as createObsLogger, type LogContext } from "@/lib/observability/logger";

export { createLogger } from "@/lib/observability/logger";

export interface Logger {
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

export function createAdapterLogger(name: string): Logger {
  const logger = createObsLogger({ product: "governance-engine", action: name });
  return {
    info(msg: string, meta?: Record<string, unknown>): void {
      logger.info(msg, meta);
    },
    warn(msg: string, meta?: Record<string, unknown>): void {
      logger.warn(msg, meta);
    },
    error(msg: string, meta?: Record<string, unknown>): void {
      logger.error(msg, undefined, meta);
    },
  };
}
