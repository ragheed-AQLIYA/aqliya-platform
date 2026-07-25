// Re-export canonical structured logger from observability module.
// This file exists for backward compatibility with existing imports.
export { createLogger } from "@/lib/observability/logger";
export type { LogContext } from "@/lib/observability/logger";
