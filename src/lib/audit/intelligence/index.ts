import "server-only";

import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { runAuditIntelligenceWithAuditLog } from "./intelligence-engine";

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
    console.error("[Audit Intelligence] enrichment failed (non-blocking):", err);
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
