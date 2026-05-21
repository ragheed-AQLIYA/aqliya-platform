type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  module?: string;
  data?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === "production" ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatLog(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const moduleTag = entry.module ? ` [${entry.module}]` : "";
  const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : "";
  return `${prefix}${moduleTag} ${entry.message}${dataStr}`;
}

function log(
  level: LogLevel,
  message: string,
  module?: string,
  data?: Record<string, unknown>,
) {
  if (!shouldLog(level)) return;
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    module,
    data,
  };
  const formatted = formatLog(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, module?: string, data?: Record<string, unknown>) =>
    log("debug", message, module, data),
  info: (message: string, module?: string, data?: Record<string, unknown>) =>
    log("info", message, module, data),
  warn: (message: string, module?: string, data?: Record<string, unknown>) =>
    log("warn", message, module, data),
  error: (message: string, module?: string, data?: Record<string, unknown>) =>
    log("error", message, module, data),
};
