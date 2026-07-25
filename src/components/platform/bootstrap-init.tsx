// ─── Bootstrap Initializer — Server Component ───
// Imports and triggers platform bootstrap at app startup.
// Renders nothing — pure side-effect.

import { bootstrap } from "@/lib/platform/bootstrap";
import { createLogger } from "@/lib/observability/logger";


const logger = createLogger({ product: "platform", action: "unknown" });

// Run bootstrap at module import time (Server Component)
bootstrap().catch((err) =>
  logger.error("[BootstrapInit] Bootstrap failed:", err instanceof Error ? err : undefined),
);

export function BootstrapInit() {
  // This component renders nothing — it exists only to import the module
  // and trigger bootstrap initialization on the server side.
  return null;
}
