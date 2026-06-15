/**
 * Audit Intelligence Layer — types (AuditOS 2.0 Phase 9)
 */

import type { RuleCitation } from "@/lib/audit/notes/disclosure-types";

export interface DisclosureEnrichmentInput {
  noteId: string;
  noteTitle: string;
  noteType: string;
  existingContent: string;
  citations: RuleCitation[];
  engagementLabel: string;
}

export interface DisclosureEnrichmentResult {
  noteId: string;
  noteTitle: string;
  enrichedSection: string;
  providerId: string;
  modelVersion: string;
  confidence: number;
  warnings: string[];
}

export interface AuditIntelligenceRunResult {
  engagementId: string;
  notesScanned: number;
  notesEnriched: number;
  notesSkipped: number;
  enrichments: DisclosureEnrichmentResult[];
  checkedAt: string;
}

export const INTELLIGENCE_ENRICHMENT_MARKER = "<!-- intelligence-enriched -->";

export function hasIntelligenceEnrichment(content: string): boolean {
  return content.includes(INTELLIGENCE_ENRICHMENT_MARKER);
}
