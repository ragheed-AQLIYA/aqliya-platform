import { logger, type LogLevel } from "@/lib/platform/logger";

export function lcosLog(
  level: LogLevel,
  message: string,
  module: string,
  meta?: Record<string, unknown>,
): void {
  logger[level](message, {
    module,
    format: "json",
    ...meta,
  } as Record<string, unknown>);
}

export function lcosInfo(message: string, module: string, meta?: Record<string, unknown>) {
  return lcosLog("info", message, module, meta);
}

export function lcosError(message: string, module: string, meta?: Record<string, unknown>) {
  return lcosLog("error", message, module, meta);
}

export function lcosWarn(message: string, module: string, meta?: Record<string, unknown>) {
  return lcosLog("warn", message, module, meta);
}

export function lcosDebug(message: string, module: string, meta?: Record<string, unknown>) {
  return lcosLog("debug", message, module, meta);
}
