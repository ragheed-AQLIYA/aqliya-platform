export interface Logger {
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

function formatLog(level: string, name: string, msg: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] [${name}] ${msg}${metaStr}`;
}

export function createLogger(name: string): Logger {
  return {
    info(msg: string, meta?: Record<string, unknown>): void {
      console.log(formatLog('info', name, msg, meta));
    },
    warn(msg: string, meta?: Record<string, unknown>): void {
      console.warn(formatLog('warn', name, msg, meta));
    },
    error(msg: string, meta?: Record<string, unknown>): void {
      console.error(formatLog('error', name, msg, meta));
    },
  };
}
