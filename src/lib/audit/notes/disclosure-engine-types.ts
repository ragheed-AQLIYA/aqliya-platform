/**
 * Disclosure Engine v2 — types (AuditOS 2.0 Phase 8)
 */

import type { RuleDisclosureSource } from "./disclosure-types";

export interface UnifiedDisclosureTrigger {
  ruleId: string;
  standardCode: string;
  noteType: string;
  noteTitle: string;
  noteTitleAr: string;
  reasonAr: string;
  reasonEn: string;
  source: RuleDisclosureSource;
}

export interface RuleTriggeredDraftNote {
  noteNumber: string;
  title: string;
  noteType: string;
  content: string;
  missingInformation: string[];
  ruleCitations: Array<{
    ruleId: string;
    standardCode: string;
    source: RuleDisclosureSource;
  }>;
}

export interface DisclosureAutoRunResult {
  engagementId: string;
  triggersCollected: number;
  triggersDeduped: number;
  notesCreated: number;
  notesUpdated: number;
  notesSkipped: number;
  runAt: string;
}
