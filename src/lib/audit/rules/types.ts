/**
 * IFRS Rules Engine — types (AuditOS 2.0 Phase 6)
 */

export type IfrsRuleStatus =
  | "pass"
  | "fail"
  | "warning"
  | "advisory"
  | "skipped";

export interface IfrsKnowledgeRule {
  ruleId: string;
  paragraphReference: string;
  ruleText: string;
  topic: string;
  standardCode: string;
  versionLabel?: string;
  confidenceScore?: number;
}

export interface IfrsRuleEvaluation {
  ruleId: string;
  standardCode: string;
  paragraphReference: string;
  topic: string;
  status: IfrsRuleStatus;
  messageAr: string;
  messageEn: string;
  linkedStatementTypes?: string[];
}

export interface DisclosureTrigger {
  suggestedTitle: string;
  suggestedNoteType: string;
  ruleId: string;
  standardCode: string;
  reasonAr: string;
  reasonEn: string;
  priority: "high" | "medium" | "low";
}

export interface IfrsRulesRunResult {
  engagementId: string;
  passed: boolean;
  ruleCount: number;
  failedCount: number;
  warningCount: number;
  evaluations: IfrsRuleEvaluation[];
  disclosureTriggers: DisclosureTrigger[];
  runAt: string;
}

/** Topics with deterministic runtime checks in Phase 6 */
export const EXECUTABLE_IFRS_TOPICS = new Set([
  "complete-set",
  "going-concern",
  "no-offsetting",
  "materiality-presentation",
  "note-disclosure",
  "oci-presentation",
  "five-step-model",
  "contract-identification",
  "definition",
  "initial-measurement",
  "initial-recognition",
  "depreciation",
  "lease-liability-measurement",
  "rou-asset-measurement",
  "lease-definition",
  "classification",
  "operating-method",
]);

/** SOCPA overlay — AuditOS 2.0 Phase 7 */
export type SocpaRuleStatus = IfrsRuleStatus;

export interface SocpaKnowledgeRule {
  ruleId: string;
  paragraphReference: string;
  ruleText: string;
  topic: string;
  standardCode: string;
  versionLabel?: string;
  confidenceScore?: number;
  jurisdiction?: string;
}

export interface SocpaRuleEvaluation {
  ruleId: string;
  standardCode: string;
  paragraphReference: string;
  topic: string;
  status: SocpaRuleStatus;
  messageAr: string;
  messageEn: string;
  linkedStatementTypes?: string[];
}

export interface SocpaDisclosureTrigger {
  suggestedTitle: string;
  suggestedNoteType: string;
  ruleId: string;
  standardCode: string;
  reasonAr: string;
  reasonEn: string;
  priority: "high" | "medium" | "low";
}

export interface SocpaRulesRunResult {
  engagementId: string;
  jurisdictionApplicable: boolean;
  passed: boolean;
  ruleCount: number;
  failedCount: number;
  warningCount: number;
  evaluations: SocpaRuleEvaluation[];
  disclosureTriggers: SocpaDisclosureTrigger[];
  runAt: string;
}

export const EXECUTABLE_SOCPA_TOPICS = new Set([
  "framework-scope",
  "fair-presentation",
  "framework-disclosure",
  "full-ifrs",
  "ifrs-smes-eligibility",
  "supplementary-disclosure",
  "zakat-presentation",
  "separate-disclosure",
  "reconciliation",
  "ias12-overlay",
  "overlay-principle",
  "routing-gate",
  "lineage-required",
]);

/** ISA knowledge runtime — Tier 2 IC-P3-02 */
export type IsaRuleStatus = IfrsRuleStatus;

export interface IsaKnowledgeRule {
  ruleId: string;
  paragraphReference: string;
  ruleText: string;
  topic: string;
  standardCode: string;
  versionLabel?: string;
  confidenceScore?: number;
}

export interface IsaRuleEvaluation {
  ruleId: string;
  standardCode: string;
  paragraphReference: string;
  topic: string;
  status: IsaRuleStatus;
  messageAr: string;
  messageEn: string;
}

export interface IsaRulesRunResult {
  engagementId: string;
  passed: boolean;
  ruleCount: number;
  failedCount: number;
  warningCount: number;
  evaluations: IsaRuleEvaluation[];
  runAt: string;
}

export const EXECUTABLE_ISA_TOPICS = new Set([
  "risk-assessment",
  "understanding-entity",
  "identify-risks",
  "pervasive-risks",
  "engagement-partner",
  "competence",
  "direction-supervision",
  "report-responsibility",
]);
