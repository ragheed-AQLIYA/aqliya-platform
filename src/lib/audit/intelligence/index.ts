import "server-only";
import { createLogger } from "@/lib/observability/logger";

import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { runAuditIntelligenceWithAuditLog } from "./intelligence-engine";


const logger = createLogger({ product: "platform", action: "unknown" });

export function isAuditIntelligenceEnabled(): boolean {
  return isEnabled("audit.intelligence");
}

/** Non-blocking hook after disclosure auto-generation */
export async function maybeRunAuditIntelligenceAfterDisclosure(
  engagementId: string,
  organizationId?: string,
): Promise<void> {
  if (!isAuditIntelligenceEnabled()) return;

  try {
    await runAuditIntelligenceWithAuditLog(engagementId, organizationId);
  } catch (err) {
    logger.error("[Audit Intelligence] enrichment failed (non-blocking):", err instanceof Error ? err : undefined);
  }
}

export {
  runAuditIntelligenceForEngagement,
  runAuditIntelligenceWithAuditLog,
  enrichDisclosureNote,
} from "./intelligence-engine";
export type {
  AuditIntelligenceRunResult,
  DisclosureEnrichmentResult,
} from "./types";
