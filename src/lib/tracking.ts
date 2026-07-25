import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "platform", action: "unknown" });

const isBrowser = typeof window !== "undefined";

export function trackEvent(event: string, data?: Record<string, string>) {
  if (!isBrowser) return;

  const payload = {
    event,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (process.env.NODE_ENV === "development") {
    logger.info("[AQLIYA]", { payload });
  }
}
