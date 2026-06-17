type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  module?: string;
  action?: string;
  userId?: string;
  organizationId?: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
  const parts: string[] = [base];
  if (entry.module) parts.push(`module=${entry.module}`);
  if (entry.action) parts.push(`action=${entry.action}`);
  if (entry.userId) parts.push(`userId=${entry.userId}`);
  if (entry.organizationId) parts.push(`orgId=${entry.organizationId}`);
  if (entry.duration !== undefined) parts.push(`duration=${entry.duration}ms`);
  if (entry.error) parts.push(`error=${entry.error}`);
  return parts.join(" ");
}

function log(level: LogLevel, message: string, meta?: Partial<LogEntry>): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const formatted = formatLog(entry);

  switch (level) {
    case "error":
      console.error(formatted, meta?.metadata || "");
      break;
    case "warn":
      console.warn(formatted, meta?.metadata || "");
      break;
    default:
      console.log(formatted, meta?.metadata || "");
  }
}

export const logger = {
  debug: (message: string, meta?: Partial<LogEntry>) => log("debug", message, meta),
  info: (message: string, meta?: Partial<LogEntry>) => log("info", message, meta),
  warn: (message: string, meta?: Partial<LogEntry>) => log("warn", message, meta),
  error: (message: string, meta?: Partial<LogEntry>) => log("error", message, meta),
};
