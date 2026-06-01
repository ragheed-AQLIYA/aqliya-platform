// ─── SalesOS domain types (Core foundation, no schema migration) ───
// Governed revenue intelligence — not a CRM clone.

export const SALES_RECORD_SOURCES = [
  "manual",
  "import",
  "ai_draft",
  "integration",
  "seed",
] as const;
export type SalesRecordSource = (typeof SALES_RECORD_SOURCES)[number];

export const SALES_ENTITY_STATUSES = ["active", "archived", "draft"] as const;
export type SalesEntityStatus = (typeof SALES_ENTITY_STATUSES)[number];

export interface SalesAIConfidence {
  score: number;
  rationale: string;
  generatedAt: string;
  outputStatus: "draft" | "recommendation";
}

export interface SalesEvidenceLinkage {
  evidenceIds?: string[];
  proofAssetIds?: string[];
  notes?: string;
}

export const SALES_ACCOUNT_STATUSES = [
  "prospect",
  "qualified",
  "active",
  "dormant",
  "archived",
] as const;
export type SalesAccountStatus = (typeof SALES_ACCOUNT_STATUSES)[number];

/** v0.1 pipeline stage labels (UI / seed). */
export const SALES_OPPORTUNITY_STAGES_V01 = [
  "New",
  "Qualified",
  "Discovery",
  "Proposal",
  "Pilot",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
] as const;
export type SalesOpportunityStageV01 =
  (typeof SALES_OPPORTUNITY_STAGES_V01)[number];

/** Legacy stages retained for backward compatibility with existing routes/data. */
export const SALES_OPPORTUNITY_STAGES_LEGACY = [
  "Draft",
  "Qualification",
  "InReview",
  "Approved",
  "Rejected",
  "ClosedWon",
  "ClosedLost",
  "Archived",
] as const;
export type SalesOpportunityStageLegacy =
  (typeof SALES_OPPORTUNITY_STAGES_LEGACY)[number];

/** Pipeline board stage labels (UI). */
export const PIPELINE_STAGE_LABELS: Record<
  string,
  { ar: string; en?: string }
> = {
  Draft: { ar: "مسودة", en: "Draft" },
  Qualification: { ar: "تأهيل", en: "Qualification" },
  InReview: { ar: "قيد المراجعة", en: "In review" },
  Approved: { ar: "معتمد", en: "Approved" },
  ClosedWon: { ar: "فوز", en: "Closed won" },
  ClosedLost: { ar: "خسارة", en: "Closed lost" },
  Rejected: { ar: "مرفوض", en: "Rejected" },
  Archived: { ar: "مؤرشف", en: "Archived" },
};

export const SALES_OPPORTUNITY_STAGES = [
  ...SALES_OPPORTUNITY_STAGES_V01,
  ...SALES_OPPORTUNITY_STAGES_LEGACY,
] as const;
export type SalesOpportunityStage = (typeof SALES_OPPORTUNITY_STAGES)[number];

export const SALES_CANONICAL_STAGES = [
  "new",
  "qualified",
  "discovery",
  "proposal",
  "pilot",
  "negotiation",
  "closed_won",
  "closed_lost",
  "in_review",
] as const;
export type SalesCanonicalStage = (typeof SALES_CANONICAL_STAGES)[number];

const STAGE_TO_CANONICAL: Record<string, SalesCanonicalStage> = {
  New: "new",
  Draft: "new",
  Qualified: "qualified",
  Qualification: "qualified",
  Discovery: "discovery",
  Proposal: "proposal",
  Approved: "proposal",
  Pilot: "pilot",
  Negotiation: "negotiation",
  InReview: "in_review",
  "Closed Won": "closed_won",
  ClosedWon: "closed_won",
  "Closed Lost": "closed_lost",
  ClosedLost: "closed_lost",
  Rejected: "closed_lost",
  Archived: "closed_lost",
};

export function canonicalizeOpportunityStage(
  stage: SalesOpportunityStage | string,
): SalesCanonicalStage {
  return STAGE_TO_CANONICAL[stage] ?? "new";
}

export function normalizeOpportunityStage(
  stage: SalesOpportunityStage,
): SalesOpportunityStageV01 {
  const canonical = canonicalizeOpportunityStage(stage);
  const map: Record<SalesCanonicalStage, SalesOpportunityStageV01> = {
    new: "New",
    qualified: "Qualified",
    discovery: "Discovery",
    proposal: "Proposal",
    pilot: "Pilot",
    negotiation: "Negotiation",
    closed_won: "Closed Won",
    closed_lost: "Closed Lost",
    in_review: "Proposal",
  };
  return map[canonical];
}

export function isClosedOpportunityStage(stage: SalesOpportunityStage): boolean {
  const c = canonicalizeOpportunityStage(stage);
  return c === "closed_won" || c === "closed_lost";
}

export const SALES_LEAD_SOURCES = [
  "inbound",
  "referral",
  "event",
  "partner",
  "outbound",
  "other",
] as const;
export type SalesLeadSource = (typeof SALES_LEAD_SOURCES)[number];

export interface SalesAccount {
  id: string;
  organizationId: string;
  name: string;
  nameAr?: string;
  status: SalesAccountStatus;
  industry?: string;
  ownerId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  source?: SalesRecordSource;
  icpFitScore?: number;
  confidence?: SalesAIConfidence;
  evidenceLinkage?: SalesEvidenceLinkage;
}

export interface SalesContact {
  id: string;
  accountId: string;
  organizationId: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  sensitivityLevel: "standard" | "restricted" | "confidential";
  ownerId: string;
  createdById: string;
  createdAt?: string;
  updatedAt?: string;
  status?: SalesEntityStatus;
  source?: SalesRecordSource;
}

export interface SalesLead {
  id: string;
  organizationId: string;
  accountId?: string;
  source: SalesLeadSource;
  status: "new" | "contacted" | "qualified" | "disqualified";
  ownerId: string;
  createdById: string;
  notes?: string;
}

export interface SalesOpportunity {
  id: string;
  organizationId: string;
  accountId: string;
  name: string;
  stage: SalesOpportunityStage;
  valueEstimate?: number;
  currency?: string;
  qualificationScore?: number;
  probability?: number;
  expectedCloseDate?: string;
  risks?: string[];
  winLossReason?: string;
  ownerId: string;
  createdById: string;
  createdAt?: string;
  updatedAt?: string;
  reviewStatus?: string;
  approvalStatus?: string;
  source?: SalesRecordSource;
  confidence?: SalesAIConfidence;
  evidenceLinkage?: SalesEvidenceLinkage;
}

export interface SalesActivity {
  id: string;
  organizationId: string;
  accountId: string;
  opportunityId?: string;
  contactId?: string;
  type: "call" | "email" | "meeting" | "note" | "task" | "other";
  summary: string;
  loggedAt: string;
  loggedById: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  status: SalesEntityStatus;
  source: SalesRecordSource;
  confidence?: SalesAIConfidence;
  evidenceLinkage?: SalesEvidenceLinkage;
}

export interface SalesMeeting {
  id: string;
  organizationId: string;
  accountId: string;
  opportunityId?: string;
  contactId?: string;
  scheduledAt: string;
  summary?: string;
  actionItems?: string[];
  hasSummary: boolean;
  loggedById: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  status: SalesEntityStatus;
  source: SalesRecordSource;
  confidence?: SalesAIConfidence;
  evidenceLinkage?: SalesEvidenceLinkage;
}

export interface SalesOutreach {
  id: string;
  organizationId: string;
  accountId: string;
  opportunityId?: string;
  contactId?: string;
  channel: "email" | "linkedin" | "call" | "event" | "other";
  messageSummary: string;
  sentAt: string;
  responseReceived?: boolean;
  loggedById: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  status: SalesEntityStatus;
  source: SalesRecordSource;
}

export const SALES_SIGNAL_TYPES = [
  "buying",
  "timing",
  "budget",
  "authority",
  "need",
  "other",
] as const;
export type SalesSignalType = (typeof SALES_SIGNAL_TYPES)[number];

export interface SalesSignal {
  id: string;
  organizationId: string;
  accountId?: string;
  opportunityId?: string;
  signalType: SalesSignalType;
  description: string;
  strength: "weak" | "moderate" | "strong";
  createdById: string;
  createdAt: string;
  updatedAt: string;
  status: SalesEntityStatus;
  source: SalesRecordSource;
  confidence?: SalesAIConfidence;
}

export interface SalesObjection {
  id: string;
  organizationId: string;
  accountId?: string;
  opportunityId?: string;
  category: string;
  description: string;
  frequency?: number;
  resolved?: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  status: SalesEntityStatus;
  source: SalesRecordSource;
}

export interface SalesCompetitorMention {
  id: string;
  organizationId: string;
  accountId?: string;
  opportunityId?: string;
  competitorName: string;
  context: string;
  threatLevel?: "low" | "medium" | "high";
  createdById: string;
  createdAt: string;
  updatedAt: string;
  status: SalesEntityStatus;
  source: SalesRecordSource;
}

export const SALES_PROOF_ASSET_TYPES = [
  "case_study",
  "pilot_result",
  "audit_evidence",
  "demo_recording",
  "proposal",
  "customer_quote",
  "benchmark",
  "objection_response",
] as const;
export type SalesProofAssetType = (typeof SALES_PROOF_ASSET_TYPES)[number];

export interface SalesProofAsset {
  id: string;
  organizationId: string;
  assetType: SalesProofAssetType;
  title: string;
  description?: string;
  linkedAccountIds?: string[];
  linkedOpportunityIds?: string[];
  opportunityId?: string;
  externalRef?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  status: SalesEntityStatus;
  source: SalesRecordSource;
}

export const SALES_ICP_DIMENSIONS = [
  "industry",
  "company_size",
  "title",
  "pain_point",
  "region",
  "other",
] as const;
export type SalesICPDimension = (typeof SALES_ICP_DIMENSIONS)[number];

export interface SalesICPInsight {
  id: string;
  organizationId: string;
  accountId?: string;
  dimension: SalesICPDimension;
  hypothesis: string;
  evidenceSummary: string;
  recommendation?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  status: SalesEntityStatus;
  source: SalesRecordSource;
  confidence?: SalesAIConfidence;
}

export interface SalesNextAction {
  id: string;
  organizationId: string;
  accountId?: string;
  opportunityId?: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueAt?: string;
  assigneeId?: string;
  ruleId?: string;
  recommendationOnly?: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  status: SalesEntityStatus;
  source: SalesRecordSource;
}

export interface SalesWinLossInsight {
  id: string;
  organizationId: string;
  opportunityId: string;
  outcome: "won" | "lost";
  primaryReason: string;
  contributingFactors?: string[];
  competitorInvolved?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  status: SalesEntityStatus;
  source: SalesRecordSource;
}

export interface SalesInteractionMetadata {
  followUpTasks?: string[];
  extractedActions?: string[];
  extractedDecisions?: string[];
}

/** Legacy interaction log — retained for existing /sales routes. */
export interface SalesInteractionLog {
  id: string;
  organizationId: string;
  accountId: string;
  opportunityId?: string;
  contactId?: string;
  type: "call" | "meeting" | "email" | "note";
  summary: string;
  evidenceRef?: string;
  loggedById: string;
  loggedAt: string;
  metadata?: SalesInteractionMetadata;
}

export function activityToInteraction(
  activity: SalesActivity,
): SalesInteractionLog {
  const type =
    activity.type === "task" || activity.type === "other"
      ? "note"
      : activity.type;
  return {
    id: activity.id,
    organizationId: activity.organizationId,
    accountId: activity.accountId,
    opportunityId: activity.opportunityId,
    contactId: activity.contactId,
    type,
    summary: activity.summary,
    loggedById: activity.loggedById,
    loggedAt: activity.loggedAt,
  };
}

export function interactionToActivity(
  interaction: SalesInteractionLog,
  createdById: string,
): SalesActivity {
  const now = new Date().toISOString();
  return {
    id: interaction.id,
    organizationId: interaction.organizationId,
    accountId: interaction.accountId,
    opportunityId: interaction.opportunityId,
    contactId: interaction.contactId,
    type: interaction.type,
    summary: interaction.summary,
    loggedAt: interaction.loggedAt,
    loggedById: interaction.loggedById,
    createdById,
    createdAt: now,
    updatedAt: now,
    status: "active",
    source: "seed",
  };
}

export const SALES_PERMISSIONS = [
  "sales.account.view",
  "sales.account.create",
  "sales.opportunity.view",
  "sales.opportunity.create",
  "sales.opportunity.review",
  "sales.opportunity.approve",
  "sales.brief.export",
] as const;
export type SalesPermission = (typeof SALES_PERMISSIONS)[number];

export const SALES_AUDIT_EVENTS = [
  "sales.account.created",
  "sales.opportunity.stage_changed",
  "sales.opportunity.submitted_for_review",
  "sales.opportunity.approved",
  "sales.opportunity.rejected",
  "sales.brief.exported",
  "sales.ai.claim_review_requested",
] as const;
export type SalesAuditEvent = (typeof SALES_AUDIT_EVENTS)[number];

/** UI DTOs — derived from store/intelligence, not persisted entities */
export interface SalesObjectionSignal {
  id: string;
  labelAr: string;
  count: number;
  source: "interaction" | "derived";
}

export interface SalesICPHypothesis {
  id: string;
  segment: string;
  segmentAr: string;
  hypothesisAr: string;
  evidenceAr: string[];
  confidence: number;
  recommendedAdjustmentsAr: string[];
}

export interface SalesAIBriefDraft {
  accountId: string;
  generatedAt: string;
  status: "DRAFT";
  disclaimerAr: string;
  sections: Array<{ titleAr: string; bodyAr: string }>;
}

export interface SalesNextBestActionItem {
  id: string;
  labelAr: string;
  labelEn: string;
  priority: "high" | "medium" | "low";
  href: string;
  accountId?: string;
  opportunityId?: string;
  reasonAr: string;
}

export interface SalesCompetitorMentionView {
  id: string;
  name: string;
  accountId?: string;
  contextAr: string;
}
