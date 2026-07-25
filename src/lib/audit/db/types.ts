import type {
  Engagement,
  TrialBalance,
  TrialBalanceLine,
  AccountMapping,
  FinancialStatementLine,
  DisclosureNote,
  EvidenceObject,
  EvidenceLink,
  Finding,
  Recommendation,
  ReviewComment,
  ApprovalRecord,
  AuditEvent,
  AIAssistanceOutput,
  DashboardSummary,
  AuditUser,
  Client,
  EngagementTeamMember,
  EngagementAlert,
  TrustState,
} from "@/types/audit";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "audit-os", action: "db-types" });

function toEngagementTeamMember(data: unknown): EngagementTeamMember[] {
  if (Array.isArray(data)) return data as EngagementTeamMember[];
  return [];
}

function toEngagementAlerts(data: unknown): EngagementAlert[] {
  if (Array.isArray(data)) return data as EngagementAlert[];
  return [];
}

function toClient(c: {
  id: string;
  organizationId: string;
  name: string;
  registrationNumber: string | null;
  industry: string;
  reportingFramework: string;
  fiscalPeriodEnd: string;
  currencyCode: string;
  status: string;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Client {
  return {
    id: c.id,
    organizationId: c.organizationId,
    name: c.name,
    registrationNumber: c.registrationNumber ?? undefined,
    industry: c.industry,
    reportingFramework: c.reportingFramework,
    fiscalPeriodEnd: c.fiscalPeriodEnd,
    currencyCode: c.currencyCode,
    status: c.status as "active" | "inactive",
    contactEmail: c.contactEmail ?? undefined,
    contactPhone: c.contactPhone ?? undefined,
    createdAt: c.createdAt.toISOString(),
  };
}

function toEngagement(e: {
  id: string;
  organizationId: string;
  clientId: string;
  client: {
    id: string;
    organizationId: string;
    name: string;
    registrationNumber: string | null;
    industry: string;
    reportingFramework: string;
    fiscalPeriodEnd: string;
    currencyCode: string;
    status: string;
    contactEmail: string | null;
    contactPhone: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  fiscalPeriod: string;
  engagementType: string;
  status: string;
  team: unknown;
  alerts: unknown;
  presentationProfile?: string | null;
  presentationProfileVersion?: string | null;
  presentationPolicyId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Engagement {
  return {
    id: e.id,
    organizationId: e.organizationId,
    clientId: e.clientId,
    client: e.client ? toClient(e.client) : undefined,
    fiscalPeriod: e.fiscalPeriod,
    engagementType: e.engagementType as Engagement["engagementType"],
    status: e.status as Engagement["status"],
    team: toEngagementTeamMember(e.team),
    alerts: toEngagementAlerts(e.alerts),
    presentationProfile: e.presentationProfile ?? null,
    presentationProfileVersion: e.presentationProfileVersion ?? null,
    presentationPolicyId: e.presentationPolicyId ?? null,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

function toTrialBalanceLine(l: {
  id: string;
  trialBalanceId: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  accountType: string | null;
  currency: string;
}): TrialBalanceLine {
  return {
    id: l.id,
    trialBalanceId: l.trialBalanceId,
    accountCode: l.accountCode,
    accountName: l.accountName,
    debitAmount: l.debitAmount,
    creditAmount: l.creditAmount,
    balance: l.balance,
    accountType: l.accountType ?? undefined,
    currency: l.currency,
  };
}

function toTrialBalance(tb: {
  id: string;
  engagementId: string;
  importTimestamp: Date;
  sourceFile: string;
  fileHash: string | null;
  trustState: string;
  totalDebits: number;
  totalCredits: number;
  variance: number;
  lines: Array<{
    id: string;
    trialBalanceId: string;
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    balance: number;
    accountType: string | null;
    currency: string;
  }>;
  createdAt: Date;
}): TrialBalance {
  return {
    id: tb.id,
    engagementId: tb.engagementId,
    importTimestamp: tb.importTimestamp.toISOString(),
    sourceFile: tb.sourceFile,
    fileHash: tb.fileHash ?? undefined,
    trustState: tb.trustState as TrustState,
    totalDebits: tb.totalDebits,
    totalCredits: tb.totalCredits,
    variance: tb.variance,
    lines: tb.lines.map(toTrialBalanceLine),
    createdAt: tb.createdAt.toISOString(),
  };
}

function toAccountMapping(m: {
  id: string;
  engagementId: string;
  sourceAccountId: string;
  sourceAccountCode: string;
  sourceAccountName: string;
  debitAmount: number;
  creditAmount: number;
  canonicalAccountId: string | null;
  canonicalAccount: { code: string; name: string } | null;
  confidence: number | null;
  mappingType: string;
  status: string;
  statementClassification: string | null;
  mappedBy: string | null;
  mappedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AccountMapping {
  return {
    id: m.id,
    engagementId: m.engagementId,
    sourceAccountId: m.sourceAccountId,
    sourceAccountCode: m.sourceAccountCode,
    sourceAccountName: m.sourceAccountName,
    debitAmount: m.debitAmount,
    creditAmount: m.creditAmount,
    canonicalAccountId: m.canonicalAccountId ?? undefined,
    canonicalAccountCode: m.canonicalAccount?.code ?? undefined,
    canonicalAccountName: m.canonicalAccount?.name ?? undefined,
    statementClassification: m.statementClassification ?? undefined,
    confidence: m.confidence ?? undefined,
    mappingType: m.mappingType as AccountMapping["mappingType"],
    status: m.status as AccountMapping["status"],
    mappedBy: m.mappedBy ?? undefined,
    mappedAt: m.mappedAt?.toISOString() ?? undefined,
    updatedAt: m.updatedAt.toISOString(),
  };
}

function toFinancialStatementLine(l: any): FinancialStatementLine {
  return {
    id: l.id,
    statementId: l.statementId,
    label: l.label,
    amount: l.amount,
    isTotal: l.isTotal,
    indentLevel: l.indentLevel,
    displayOrder: l.displayOrder,
    linkedAccountMappings: l.linkedAccountMappings ?? [],
  };
}

function toReviewComment(rc: {
  id: string;
  engagementId: string;
  targetType: string;
  targetId: string;
  reviewerId: string;
  reviewerName: string;
  comment: string;
  requiredAction: string | null;
  resolution: string | null;
  status: string;
  createdAt: Date;
  resolvedAt: Date | null;
}): ReviewComment {
  return {
    id: rc.id,
    engagementId: rc.engagementId,
    targetType: rc.targetType as ReviewComment["targetType"],
    targetId: rc.targetId,
    reviewerId: rc.reviewerId,
    reviewerName: rc.reviewerName,
    comment: rc.comment,
    requiredAction: (rc.requiredAction ??
      undefined) as ReviewComment["requiredAction"],
    resolution: rc.resolution ?? undefined,
    status: rc.status as ReviewComment["status"],
    createdAt: rc.createdAt.toISOString(),
    resolvedAt: rc.resolvedAt?.toISOString() ?? undefined,
  };
}

function toDisclosureNote(
  n: {
    id: string;
    engagementId: string;
    noteNumber: string;
    title: string;
    noteType: string;
    content: string;
    linkedStatementLine: string | null;
    missingInformation: unknown;
    aiDrafted: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  },
  reviewComments: ReviewComment[],
): DisclosureNote {
  return {
    id: n.id,
    engagementId: n.engagementId,
    noteNumber: n.noteNumber,
    title: n.title,
    noteType: n.noteType,
    content: n.content,
    linkedStatementLine: n.linkedStatementLine ?? undefined,
    missingInformation: Array.isArray(n.missingInformation)
      ? (n.missingInformation as string[])
      : [],
    aiDrafted: n.aiDrafted,
    status: n.status as DisclosureNote["status"],
    reviewComments,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

function toEvidenceLink(el: {
  id: string;
  evidenceId: string;
  targetType: string;
  targetId: string;
  linkType: string;
  context: string | null;
  createdBy: string | null;
  createdAt: Date;
}): EvidenceLink {
  return {
    id: el.id,
    evidenceId: el.evidenceId,
    targetType: el.targetType as EvidenceLink["targetType"],
    targetId: el.targetId,
    targetLabel:
      el.context ?? `${el.targetType}:${el.targetId.substring(0, 8)}`,
    linkType: el.linkType as EvidenceLink["linkType"],
    context: el.context ?? undefined,
    createdBy: el.createdBy ?? "",
    createdAt: el.createdAt.toISOString(),
  };
}

function toEvidenceObject(ev: {
  id: string;
  engagementId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  fileHash: string | null;
  storageKey: string | null;
  uploadedById: string | null;
  uploadedAt: Date | null;
  state: string;
  links: Array<{
    id: string;
    evidenceId: string;
    targetType: string;
    targetId: string;
    linkType: string;
    context: string | null;
    createdBy: string | null;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}): EvidenceObject {
  return {
    id: ev.id,
    engagementId: ev.engagementId,
    filename: ev.filename,
    fileType: ev.fileType,
    fileSize: ev.fileSize,
    fileHash: ev.fileHash ?? "",
    uploadedById: ev.uploadedById ?? "",
    uploadedAt: ev.uploadedAt?.toISOString() ?? "",
    state: ev.state as EvidenceObject["state"],
    linkedEntities: ev.links.map(toEvidenceLink),
    storageKey: ev.storageKey ?? "",
  };
}

function toFinding(f: {
  id: string;
  engagementId: string;
  title: string;
  findingType: string;
  severity: string;
  materiality: string;
  description: string;
  rootCause: string | null;
  impact: string | null;
  status: string;
  relatedAccountIds: unknown;
  relatedEvidenceIds: unknown;
  aiSuggested: boolean;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Finding {
  return {
    id: f.id,
    engagementId: f.engagementId,
    title: f.title,
    findingType: f.findingType as Finding["findingType"],
    severity: f.severity as Finding["severity"],
    materiality: f.materiality as Finding["materiality"],
    description: f.description,
    rootCause: f.rootCause ?? undefined,
    impact: f.impact ?? undefined,
    status: f.status as Finding["status"],
    relatedAccountIds: Array.isArray(f.relatedAccountIds)
      ? (f.relatedAccountIds as string[])
      : [],
    relatedEvidenceIds: Array.isArray(f.relatedEvidenceIds)
      ? (f.relatedEvidenceIds as string[])
      : [],
    aiSuggested: f.aiSuggested,
    assignedTo: f.assignedTo ?? undefined,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}

function toRecommendation(r: {
  id: string;
  engagementId: string;
  findingId: string;
  title: string;
  description: string;
  recommendedAction: string;
  impactAssessment: string | null;
  riskLevel: string;
  status: string;
  aiContributed: boolean;
  aiSuggestionId: string | null;
  reviewerDecision: string | null;
  finding?: { id: string; title: string } | null;
  createdAt: Date;
  updatedAt: Date;
}): Recommendation {
  return {
    id: r.id,
    engagementId: r.engagementId,
    findingId: r.findingId,
    title: r.title,
    description: r.description,
    recommendedAction: r.recommendedAction,
    impactAssessment: r.impactAssessment ?? undefined,
    riskLevel: r.riskLevel as Recommendation["riskLevel"],
    status: r.status as Recommendation["status"],
    aiContributed: r.aiContributed,
    aiSuggestionId: r.aiSuggestionId ?? undefined,
    reviewerDecision: r.reviewerDecision ?? undefined,
    finding: r.finding
      ? ({ id: r.finding.id, title: r.finding.title } as Finding)
      : undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function toApprovalRecord(a: {
  id: string;
  engagementId: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  action: string;
  rationale: string | null;
  targetType: string;
  targetId: string;
  createdAt: Date;
}): ApprovalRecord {
  return {
    id: a.id,
    engagementId: a.engagementId,
    approverId: a.approverId,
    approverName: a.approverName,
    approverRole: a.approverRole as ApprovalRecord["approverRole"],
    action: a.action as ApprovalRecord["action"],
    rationale: a.rationale ?? undefined,
    targetType: a.targetType as ApprovalRecord["targetType"],
    targetId: a.targetId,
    createdAt: a.createdAt.toISOString(),
  };
}

function toAuditEvent(ae: {
  id: string;
  engagementId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetType: string;
  targetId: string;
  previousState: string | null;
  newState: string;
  description: string;
  aiRelated: boolean;
  metadata: unknown;
  timestamp: Date;
}): AuditEvent {
  return {
    id: ae.id,
    engagementId: ae.engagementId,
    eventType: ae.eventType,
    actorId: ae.actorId,
    actorName: ae.actorName,
    actorRole: ae.actorRole as AuditEvent["actorRole"],
    targetType: ae.targetType,
    targetId: ae.targetId,
    previousState: ae.previousState ?? undefined,
    newState: ae.newState,
    description: ae.description,
    aiRelated: ae.aiRelated,
    metadata: ae.metadata
      ? (ae.metadata as Record<string, unknown>)
      : undefined,
    timestamp: ae.timestamp.toISOString(),
  };
}

function toAiOutput(ai: {
  id: string;
  engagementId: string;
  suggestionType: string;
  inputContext: string | null;
  outputContent: string;
  confidence: number | null;
  modelVersion: string | null;
  status: string;
  acceptedBy: string | null;
  acceptedAt: Date | null;
  rejectedBy: string | null;
  rejectedAt: Date | null;
  sourceEntityType: string | null;
  sourceEntityId: string | null;
  metadata: unknown;
  createdAt: Date;
}): AIAssistanceOutput {
  return {
    id: ai.id,
    engagementId: ai.engagementId,
    suggestionType: ai.suggestionType as AIAssistanceOutput["suggestionType"],
    inputContext: ai.inputContext ?? "",
    outputContent: ai.outputContent,
    confidence: ai.confidence ?? 0,
    modelVersion: ai.modelVersion ?? "",
    status: ai.status as AIAssistanceOutput["status"],
    acceptedBy: ai.acceptedBy ?? undefined,
    acceptedAt: ai.acceptedAt?.toISOString() ?? undefined,
    rejectedBy: ai.rejectedBy ?? undefined,
    rejectedAt: ai.rejectedAt?.toISOString() ?? undefined,
    sourceEntityType: ai.sourceEntityType ?? undefined,
    sourceEntityId: ai.sourceEntityId ?? undefined,
    metadata: ai.metadata
      ? (ai.metadata as Record<string, unknown>)
      : undefined,
    createdAt: ai.createdAt.toISOString(),
  };
}

function toAuditUser(u: {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: string;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
}): AuditUser {
  return {
    id: u.id,
    organizationId: u.organizationId,
    email: u.email,
    name: u.name,
    role: u.role as AuditUser["role"],
    status: u.status as AuditUser["status"],
    lastLoginAt: u.lastLoginAt?.toISOString() ?? undefined,
    createdAt: u.createdAt.toISOString(),
  };
}

export function emptyDashboardSummary(): DashboardSummary {
  return {
    totalEngagements: 0,
    activeEngagements: 0,
    pendingReviews: 0,
    openFindings: 0,
    missingEvidence: 0,
    readyForApproval: 0,
    publishedCount: 0,
    recentActivity: [],
    engagements: [],
  };
}

export function protectedAuditReadUnavailable(
  scope: string,
  error?: unknown,
): never {
  if (error) {
    logger.error(
      `${scope} failed. Mock fallback disabled for protected /audit workspace.`,
      error instanceof Error ? error : undefined,
    );
  } else {
    logger.error(
      `${scope} failed. Mock fallback disabled for protected /audit workspace.`,
    );
  }

  throw new Error(
    `AuditOS protected read unavailable: ${scope}. Mock fallback disabled for protected /audit workspace.`,
  );
}

export {
  toEngagementTeamMember,
  toEngagementAlerts,
  toClient,
  toEngagement,
  toTrialBalanceLine,
  toTrialBalance,
  toAccountMapping,
  toFinancialStatementLine,
  toReviewComment,
  toDisclosureNote,
  toEvidenceLink,
  toEvidenceObject,
  toFinding,
  toRecommendation,
  toApprovalRecord,
  toAuditEvent,
  toAiOutput,
  toAuditUser,
  toAuditEventFromPlatformLog,
};

// ─── PlatformAuditLog → toAuditEvent adapter ───
// Maps a PlatformAuditLog row (with productKey: "audit_os") into the shape
// expected by toAuditEvent(). EngagementId is extracted from metadata JSON
// (dual-write stores it there). ActorRole is not available in PlatformAuditLog.
function toAuditEventFromPlatformLog(pal: {
  id: string;
  action: string;
  actorId: string | null;
  actorName: string | null;
  targetType: string | null;
  targetId: string | null;
  beforeState: string | null;
  afterState: string | null;
  eventDescription: string | null;
  aiRelated: boolean;
  metadata: unknown;
  createdAt: Date;
}) {
  return toAuditEvent({
    id: pal.id,
    engagementId:
      (pal.metadata as Record<string, unknown> | null)?.engagementId as
        | string
        | undefined ?? "",
    eventType: pal.action,
    actorId: pal.actorId ?? "",
    actorName: pal.actorName ?? "",
    actorRole: "",
    targetType: pal.targetType ?? "",
    targetId: pal.targetId ?? "",
    previousState: pal.beforeState,
    newState: pal.afterState ?? "",
    description: pal.eventDescription ?? "",
    aiRelated: pal.aiRelated,
    metadata: pal.metadata,
    timestamp: pal.createdAt,
  });
}
