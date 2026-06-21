/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import {
  paginate,
  offsetFromPage,
  DEFAULT_PAGE_SIZE,
} from "@/lib/audit/pagination";
import type { PaginatedResult } from "@/lib/audit/pagination";
import type {
  Engagement,
  TrialBalance,
  TrialBalanceLine,
  AccountMapping,
  ValidationRun,
  ValidationIssue,
  FinancialStatement,
  FinancialStatementLine,
  DisclosureNote,
  EvidenceObject,
  EvidenceLink,
  Finding,
  Recommendation,
  ReviewComment,
  ApprovalRecord,
  PublicationPackage,
  AuditEvent,
  AIAssistanceOutput,
  DashboardSummary,
  WorkflowStatus,
  AuditUser,
  Client,
  EngagementTeamMember,
  EngagementAlert,
  TrustState,
  PilotFeedback,
  ProductionBlocker,
  PilotSignoff,
} from "@/types/audit";
import { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";
import {
  buildStatementLinesFromMappings,
  type MappingWithCanonical,
} from "./statement-builder";

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
  uploadedBy: string | null;
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
    uploadedBy: ev.uploadedBy ?? "",
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

function emptyDashboardSummary(): DashboardSummary {
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

function protectedAuditReadUnavailable(scope: string, error?: unknown): never {
  if (error) {
    console.error(
      `[AuditDB] ${scope} failed. Mock fallback disabled for protected /audit workspace.`,
      error,
    );
  } else {
    console.error(
      `[AuditDB] ${scope} failed. Mock fallback disabled for protected /audit workspace.`,
    );
  }

  throw new Error(
    `AuditOS protected read unavailable: ${scope}. Mock fallback disabled for protected /audit workspace.`,
  );
}

export async function getDashboardSummary(
  organizationId?: string,
): Promise<DashboardSummary> {
  try {
    const orgFilter = organizationId ? { organizationId } : {};
    const [engagements, events, findings, evidence, _mappings] =
      await Promise.all([
        prisma.auditEngagement.findMany({
          where: orgFilter,
          include: { client: true },
        }),
        prisma.auditEvent.findMany({
          where: organizationId ? { engagement: { organizationId } } : {},
          orderBy: { timestamp: "desc" },
          take: 5,
        }),
        prisma.auditFinding.findMany({
          where: {
            status: { not: "resolved" },
            ...(organizationId ? { engagement: { organizationId } } : {}),
          },
        }),
        prisma.auditEvidence.findMany({
          where: {
            state: "missing",
            ...(organizationId ? { engagement: { organizationId } } : {}),
          },
        }),
        prisma.auditAccountMapping.findMany({
          where: {
            status: "pending",
            ...(organizationId ? { engagement: { organizationId } } : {}),
          },
        }),
      ]);
    if (engagements.length === 0) {
      return emptyDashboardSummary();
    }
    const activeEngagements = engagements.filter(
      (e) => e.status !== "archived" && e.status !== "published",
    ).length;
    const pendingReviews = engagements.filter(
      (e) => e.status === "under_review" || e.status === "awaiting_client",
    ).length;
    const readyForApproval = engagements.filter(
      (e) => e.status === "ready_for_approval",
    ).length;
    const publishedCount = engagements.filter(
      (e) => e.status === "published",
    ).length;
    return {
      totalEngagements: engagements.length,
      activeEngagements,
      pendingReviews,
      openFindings: findings.length,
      missingEvidence: evidence.length,
      readyForApproval,
      publishedCount,
      recentActivity: events.map(toAuditEvent),
      engagements: engagements.map(toEngagement),
    };
  } catch (error) {
    protectedAuditReadUnavailable("getDashboardSummary", error);
  }
}

export async function getEngagements(
  organizationId?: string,
): Promise<Engagement[]> {
  try {
    const orgFilter = organizationId ? { organizationId } : {};
    const engagements = await prisma.auditEngagement.findMany({
      where: orgFilter,
      include: { client: true },
    });
    if (engagements.length === 0) return [];
    return engagements.map(toEngagement);
  } catch (error) {
    protectedAuditReadUnavailable("getEngagements", error);
  }
}

export async function getEngagement(
  organizationId: string | undefined,
  id: string,
): Promise<Engagement | null> {
  try {
    const where: Record<string, unknown> = { id };
    if (organizationId)
      (where as Record<string, unknown>).organizationId = organizationId;
    const engagement = await prisma.auditEngagement.findUnique({
      where: where as { id: string },
      include: { client: true },
    });
    if (!engagement) return null;
    return toEngagement(engagement);
  } catch (error) {
    protectedAuditReadUnavailable(`getEngagement(${id})`, error);
  }
}

export async function getEngagementWorkflowStatus(
  engagementId: string,
): Promise<WorkflowStatus> {
  try {
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: engagementId },
    });
    const [unmappedCount, missingCount, openReviewCount] = await Promise.all([
      prisma.auditAccountMapping.count({
        where: { engagementId, status: "pending" },
      }),
      prisma.auditEvidence.count({ where: { engagementId, state: "missing" } }),
      prisma.auditReviewComment.count({
        where: { engagementId, status: "open" },
      }),
    ]);
    if (!engagement) {
      return {
        currentState: "setup",
        availableTransitions: ["in_progress"],
        blockingIssues: [],
        completionPercentage: 10,
      };
    }
    const blockingIssues: string[] = [];
    let completionPercentage = 10;
    if (unmappedCount > 0)
      blockingIssues.push(`${unmappedCount} unmapped account(s)`);
    if (missingCount > 0)
      blockingIssues.push(`${missingCount} missing evidence item(s)`);
    if (openReviewCount > 0)
      blockingIssues.push(`${openReviewCount} open review comment(s)`);
    if (engagement.status === "setup") completionPercentage = 15;
    else if (engagement.status === "in_progress") completionPercentage = 45;
    else if (engagement.status === "under_review") completionPercentage = 70;
    else if (engagement.status === "ready_for_approval")
      completionPercentage = 90;
    else if (
      engagement.status === "approved" ||
      engagement.status === "published"
    )
      completionPercentage = 100;
    const statusMap: Record<string, string[]> = {
      draft: ["setup"],
      setup: ["in_progress"],
      in_progress: ["under_review", "awaiting_client"],
      under_review: ["ready_for_approval", "awaiting_client"],
      awaiting_client: ["in_progress", "under_review"],
      ready_for_approval: ["approved"],
      approved: ["published"],
      published: [],
      archived: [],
    };
    return {
      currentState: engagement.status as WorkflowStatus["currentState"],
      availableTransitions: statusMap[engagement.status] ?? [],
      blockingIssues,
      completionPercentage,
    };
  } catch (error) {
    protectedAuditReadUnavailable(
      `getEngagementWorkflowStatus(${engagementId})`,
      error,
    );
  }
}

export async function getTrialBalance(
  engagementId: string,
): Promise<TrialBalance | null> {
  try {
    const tb = await prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });
    if (!tb) return null;
    return toTrialBalance(tb);
  } catch (error) {
    protectedAuditReadUnavailable(`getTrialBalance(${engagementId})`, error);
  }
}

export async function getTrialBalanceLines(
  engagementId: string,
): Promise<TrialBalanceLine[]> {
  try {
    const tb = await prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      include: { lines: true },
    });
    if (!tb || tb.lines.length === 0) return [];
    return tb.lines.map(toTrialBalanceLine);
  } catch (error) {
    protectedAuditReadUnavailable(
      `getTrialBalanceLines(${engagementId})`,
      error,
    );
  }
}

export async function getMappings(
  engagementId: string,
): Promise<AccountMapping[]> {
  try {
    const mappings = await prisma.auditAccountMapping.findMany({
      where: { engagementId },
      include: { canonicalAccount: true },
      orderBy: { createdAt: "asc" },
    });
    if (mappings.length === 0) return [];

    const { getLatestClassificationSources } = await import(
      "@/lib/tb-intelligence/firm-memory"
    );
    const { getMappingClassificationExplanations } = await import(
      "@/lib/tb-intelligence/classification-explanation"
    );
    const mapped = mappings.map(toAccountMapping);
    const [sources, explanations] = await Promise.all([
      getLatestClassificationSources(engagementId),
      getMappingClassificationExplanations(engagementId, mapped),
    ]);

    return mapped.map((m) => ({
      ...m,
      classificationSource: sources[m.sourceAccountCode],
      classificationExplanation: explanations[m.sourceAccountCode],
    }));
  } catch (error) {
    protectedAuditReadUnavailable(`getMappings(${engagementId})`, error);
  }
}

export async function rebuildFinancialStatementsForEngagement(
  engagementId: string,
): Promise<void> {
  let rebuiltViaV2 = false;
  try {
    const { maybeRebuildFinancialStatements } = await import(
      "@/lib/audit/fs-engine"
    );
    rebuiltViaV2 = await maybeRebuildFinancialStatements(engagementId);
  } catch (fsErr) {
    console.error(
      `[AuditDB] FS v2 rebuild failed for ${engagementId}`,
      fsErr,
    );
  }

  if (!rebuiltViaV2) {
  const { loadEngagementPresentationContext } = await import(
    "@/lib/audit/presentation/engagement-presentation-config"
  );
  const { enrichMappingsWithErpMap1 } = await import(
    "@/lib/audit/presentation/enrich-mapping-map1"
  );
  const [mappings, existingStatements, presentationContext] = await Promise.all([
    prisma.auditAccountMapping.findMany({
      where: { engagementId },
      include: { canonicalAccount: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.auditFinancialStatement.findMany({ where: { engagementId } }),
    loadEngagementPresentationContext(engagementId),
  ]);

  const enrichedMappings = await enrichMappingsWithErpMap1(
    engagementId,
    mappings as MappingWithCanonical[],
  );

  const titles: Record<string, string> = {
    income_statement: "Statement of Profit or Loss",
    balance_sheet: "Statement of Financial Position",
    equity: "Statement of Changes in Equity",
  };

  for (const statementType of [
    "income_statement",
    "balance_sheet",
    "equity",
  ] as const) {
    const existing = existingStatements.find(
      (statement) => statement.statementType === statementType,
    );
    const statementId = existing?.id ?? `fs-${statementType}-${engagementId}`;
    const lines = buildStatementLinesFromMappings(
      statementId,
      statementType,
      enrichedMappings,
      {
        presentationProfile: presentationContext.presentationProfile,
        presentationPolicy: presentationContext.policy,
      },
    );
    if (existing) {
      await prisma.auditFinancialStatement.update({
        where: { id: existing.id },
        data: { lines: lines as unknown as object },
      });
    } else {
      await prisma.auditFinancialStatement.create({
        data: {
          id: statementId,
          engagementId,
          statementType,
          title: titles[statementType],
          status: "draft",
          lines: lines as unknown as object,
        },
      });
    }
  }
  }

  try {
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: engagementId },
      select: { organizationId: true },
    });
    const { maybeRunAuditIntelligenceAfterDisclosure } = await import(
      "@/lib/audit/intelligence"
    );
    await maybeRunAuditIntelligenceAfterDisclosure(
      engagementId,
      engagement?.organizationId,
    );
  } catch (intelErr) {
    console.error(
      `[AuditDB] audit intelligence hook failed for ${engagementId}`,
      intelErr,
    );
  }

  try {
    const { maybeGenerateLeadSchedules, isLeadScheduleAutoEnabled } =
      await import("@/lib/audit/lead-schedule");
    if (isLeadScheduleAutoEnabled()) {
      await maybeGenerateLeadSchedules(engagementId, "mapping_confirm");
    } else {
      const { maybeSyncReportingGraphAfterFsRebuild } = await import(
        "@/lib/audit/reporting-graph/graph-sync-service"
      );
      await maybeSyncReportingGraphAfterFsRebuild(engagementId);
    }
  } catch (hookErr) {
    console.error(
      `[AuditDB] lead schedule / graph hook failed for ${engagementId}`,
      hookErr,
    );
  }

  try {
    const { maybeRunReconciliationAfterPipeline } = await import(
      "@/lib/audit/reconciliation"
    );
    await maybeRunReconciliationAfterPipeline(engagementId);
  } catch (reconErr) {
    console.error(
      `[AuditDB] reconciliation hook failed for ${engagementId}`,
      reconErr,
    );
  }

  try {
    const { maybeRunIfrsRulesAfterFsRebuild } = await import(
      "@/lib/audit/rules"
    );
    await maybeRunIfrsRulesAfterFsRebuild(engagementId);
  } catch (ifrsErr) {
    console.error(
      `[AuditDB] IFRS rules hook failed for ${engagementId}`,
      ifrsErr,
    );
  }

  try {
    const { maybeRunSocpaRulesAfterFsRebuild } = await import(
      "@/lib/audit/rules"
    );
    await maybeRunSocpaRulesAfterFsRebuild(engagementId);
  } catch (socpaErr) {
    console.error(
      `[AuditDB] SOCPA rules hook failed for ${engagementId}`,
      socpaErr,
    );
  }

  try {
    const { maybeAutoGenerateDisclosureNotes } = await import(
      "@/lib/audit/notes/disclosure-auto"
    );
    await maybeAutoGenerateDisclosureNotes(engagementId);
  } catch (disclosureErr) {
    console.error(
      `[AuditDB] disclosure auto hook failed for ${engagementId}`,
      disclosureErr,
    );
  }
}

export async function confirmMapping(
  engagementId: string,
  mappingId: string,
): Promise<AccountMapping | null> {
  try {
    const updated = await prisma.auditAccountMapping.update({
      where: { id: mappingId },
      data: {
        status: "confirmed",
        mappingType: "human_mapped",
        mappedAt: new Date(),
      },
      include: { canonicalAccount: true },
    });
    await rebuildFinancialStatementsForEngagement(engagementId);
    return toAccountMapping(updated);
  } catch (error) {
    console.error(
      `[AuditDB] confirmMapping(${mappingId}) failed. Mock fallback disabled for mutation path.`,
      error,
    );
    throw new Error(
      `AuditOS mutation unavailable: confirmMapping(${mappingId}). Mock fallback disabled.`,
    );
  }
}

export async function confirmAllSuggestedMappings(engagementId: string): Promise<{
  confirmedCount: number;
  mappings: AccountMapping[];
}> {
  try {
    const pending = await prisma.auditAccountMapping.findMany({
      where: {
        engagementId,
        status: "pending",
        canonicalAccountId: { not: null },
      },
      select: { id: true },
    });

    if (pending.length === 0) {
      return { confirmedCount: 0, mappings: [] };
    }

    const ids = pending.map((p) => p.id);
    await prisma.auditAccountMapping.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "confirmed",
        mappingType: "confirmed_ai",
        mappedAt: new Date(),
      },
    });

    await rebuildFinancialStatementsForEngagement(engagementId);

    const updated = await prisma.auditAccountMapping.findMany({
      where: { id: { in: ids } },
      include: { canonicalAccount: true },
      orderBy: { sourceAccountCode: "asc" },
    });

    return {
      confirmedCount: updated.length,
      mappings: updated.map((m) => toAccountMapping(m)),
    };
  } catch (error) {
    console.error(
      `[AuditDB] confirmAllSuggestedMappings(${engagementId}) failed.`,
      error,
    );
    throw new Error(
      `AuditOS mutation unavailable: confirmAllSuggestedMappings(${engagementId}).`,
    );
  }
}

export async function updateManualMapping(data: {
  engagementId: string;
  mappingId: string;
  canonicalAccountId: string | null;
  mappedBy?: string;
}): Promise<AccountMapping | null> {
  try {
    const canonicalAccount = data.canonicalAccountId
      ? await prisma.auditCanonicalAccount.findUnique({
          where: { id: data.canonicalAccountId },
        })
      : null;

    const updated = await prisma.auditAccountMapping.update({
      where: { id: data.mappingId },
      data: {
        canonicalAccountId: data.canonicalAccountId,
        statementClassification: canonicalAccount?.category ?? null,
        status: data.canonicalAccountId ? "confirmed" : "pending",
        mappingType: data.canonicalAccountId ? "human_mapped" : "ai_suggested",
        mappedBy: data.mappedBy ?? null,
        mappedAt: data.canonicalAccountId ? new Date() : null,
      },
      include: { canonicalAccount: true },
    });

    await rebuildFinancialStatementsForEngagement(data.engagementId);
    return toAccountMapping(updated);
  } catch (error) {
    console.warn(
      `[AuditDB] updateManualMapping(${data.mappingId}) error`,
      error,
    );
    return null;
  }
}

export async function getUnmappedAccounts(
  engagementId: string,
): Promise<AccountMapping[]> {
  try {
    const mappings = await prisma.auditAccountMapping.findMany({
      where: { engagementId, status: "pending" },
      include: { canonicalAccount: true },
    });
    return mappings.map(toAccountMapping);
  } catch (error) {
    protectedAuditReadUnavailable(
      `getUnmappedAccounts(${engagementId})`,
      error,
    );
  }
}

export async function getValidationRun(
  engagementId: string,
): Promise<ValidationRun | null> {
  try {
    const run = await prisma.auditValidationRun.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      include: {
        issues: {
          include: { dispositions: true },
          orderBy: { severity: "asc" },
        },
      },
    });
    if (!run) return null;
    return {
      id: run.id,
      engagementId: run.engagementId,
      validationType: run.validationType,
      status: run.status as ValidationRun["status"],
      summary: run.summary ?? "",
      trustState: run.trustState as ValidationRun["trustState"],
      validatedAt:
        run.completedAt?.toISOString() ?? run.createdAt.toISOString(),
      issues: run.issues.map((i) => ({
        id: i.id,
        validationRunId: i.validationRunId,
        checkType: i.checkType as ValidationIssue["checkType"],
        severity: i.severity as ValidationIssue["severity"],
        status: (i.status as ValidationIssue["status"]) ?? "open",
        description: i.description ?? i.title,
        accountCode: i.accountCode ?? undefined,
        accountName: i.accountName ?? undefined,
        expectedValue: i.expectedValue ?? undefined,
        actualValue: i.actualValue ?? undefined,
        message: i.message ?? "",
        disposedBy: i.dispositions[0]?.disposedBy ?? undefined,
        disposedAt: i.dispositions[0]?.disposedAt?.toISOString() ?? undefined,
        disposition: i.dispositions[0]?.action ?? undefined,
      })),
    };
  } catch (error) {
    protectedAuditReadUnavailable(`getValidationRun(${engagementId})`, error);
  }
}

function _severityRank(s: string): number {
  if (s === "critical") return 0;
  if (s === "high") return 1;
  if (s === "medium") return 2;
  return 3;
}

export async function runValidation(
  engagementId: string,
  actorId: string,
): Promise<ValidationRun> {
  try {
    const _existing = await prisma.auditValidationRun.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    const now = new Date();
    const runId = `vr-${Date.now()}`;
    const _run = await prisma.auditValidationRun.create({
      data: {
        id: runId,
        engagementId,
        validationType: "full",
        status: "completed",
        trustState: "conditional",
        createdBy: actorId,
        completedAt: now,
      },
    });

    const issues: Array<{
      id: string;
      validationRunId: string;
      engagementId: string;
      checkType: string;
      severity: string;
      status: string;
      title: string;
      description: string;
      message: string;
      accountCode: string | null;
      accountName: string | null;
      expectedValue: number | null;
      actualValue: number | null;
      difference: number | null;
      createdAt: Date;
    }> = [];

    let idx = 0;
    const issueId = (n: number) => `${runId}-i-${n}`;

    const tb = await prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });

    const mappings = await prisma.auditAccountMapping.findMany({
      where: { engagementId },
      include: { canonicalAccount: true },
    });

    const evidence = await prisma.auditEvidence.findMany({
      where: { engagementId },
    });
    const statements = await prisma.auditFinancialStatement.findMany({
      where: { engagementId },
    });

    // Check 1: Trial balance balance check
    if (tb) {
      const tbLines = tb.lines ?? [];
      const totalDebits = tbLines.reduce(
        (s: number, l: { debitAmount: number }) => s + l.debitAmount,
        0,
      );
      const totalCredits = tbLines.reduce(
        (s: number, l: { creditAmount: number }) => s + l.creditAmount,
        0,
      );
      const variance = totalDebits - totalCredits;
      const sev =
        Math.abs(variance) < 1 ? "low" : variance > 10000 ? "high" : "medium";
      issues.push({
        id: issueId(++idx),
        validationRunId: runId,
        engagementId,
        checkType: "balance_equality",
        severity: sev,
        status: "open",
        title: "Trial Balance Balance Check",
        description: "Verify total debits equal total credits",
        message:
          Math.abs(variance) < 1
            ? `Trial balance is balanced (variance: SAR ${variance.toFixed(2)})`
            : `Trial balance is unbalanced — variance: SAR ${variance.toFixed(2)}`,
        accountCode: null,
        accountName: null,
        expectedValue: null,
        actualValue: variance,
        difference: variance,
        createdAt: now,
      });
    }

    // Check 2: Unmapped accounts
    const pendingMappings = mappings.filter((m) => m.status === "pending");
    if (pendingMappings.length > 0) {
      issues.push({
        id: issueId(++idx),
        validationRunId: runId,
        engagementId,
        checkType: "missing_mappings",
        severity: pendingMappings.length > 3 ? "high" : "medium",
        status: "open",
        title: "Unmapped Accounts",
        description: `${pendingMappings.length} account(s) require mapping`,
        message: `Accounts pending mapping: ${pendingMappings.map((m) => `${m.sourceAccountCode} - ${m.sourceAccountName}`).join(", ")}`,
        accountCode: null,
        accountName: null,
        expectedValue: null,
        actualValue: pendingMappings.length,
        difference: null,
        createdAt: now,
      });
    }

    // Check 3: Mapping amount consistency
    for (const m of mappings) {
      if (m.status !== "confirmed") continue;
      const line = tb?.lines.find(
        (l: { id: string }) => l.id === m.sourceAccountId,
      );
      if (
        line &&
        (Math.abs(m.debitAmount - line.debitAmount) > 1 ||
          Math.abs(m.creditAmount - line.creditAmount) > 1)
      ) {
        issues.push({
          id: issueId(++idx),
          validationRunId: runId,
          engagementId,
          checkType: "classification_conflict",
          severity: "medium",
          status: "open",
          title: `Mapping Amount Mismatch: ${m.sourceAccountCode}`,
          description: `Mapping amount for ${m.sourceAccountName} (${m.sourceAccountCode}) does not match trial balance`,
          message: `Mapping: Debit ${m.debitAmount}, Credit ${m.creditAmount} | TB: Debit ${line.debitAmount}, Credit ${line.creditAmount}`,
          accountCode: m.sourceAccountCode,
          accountName: m.sourceAccountName,
          expectedValue: line.debitAmount || line.creditAmount,
          actualValue: m.debitAmount || m.creditAmount,
          difference: null,
          createdAt: now,
        });
      }
      if (idx >= 30) break;
    }

    // Check 4: Missing evidence
    const missingEvidence = evidence.filter((e) => e.state === "missing");
    if (missingEvidence.length > 0) {
      issues.push({
        id: issueId(++idx),
        validationRunId: runId,
        engagementId,
        checkType: "completeness",
        severity: missingEvidence.length > 2 ? "high" : "medium",
        status: "open",
        title: "Missing Evidence",
        description: `${missingEvidence.length} evidence item(s) are missing or not uploaded`,
        message: `${missingEvidence.map((e) => e.filename).join(", ")}`,
        accountCode: null,
        accountName: null,
        expectedValue: null,
        actualValue: missingEvidence.length,
        difference: null,
        createdAt: now,
      });
    }

    // Check 5: Statement existence
    if (statements.length === 0) {
      issues.push({
        id: issueId(++idx),
        validationRunId: runId,
        engagementId,
        checkType: "completeness",
        severity: "medium",
        status: "open",
        title: "No Financial Statements Generated",
        description: "No financial statements found for this engagement",
        message: "Run account mapping to generate financial statements",
        accountCode: null,
        accountName: null,
        expectedValue: null,
        actualValue: null,
        difference: null,
        createdAt: now,
      });
    }

    try {
      const { appendReconciliationValidationIssues } = await import(
        "@/lib/audit/reconciliation/reconciliation-engine"
      );
      idx = await appendReconciliationValidationIssues(
        engagementId,
        runId,
        issues,
        idx,
        now,
      );
    } catch (reconErr) {
      console.error(
        `[AuditDB] reconciliation validation append failed for ${engagementId}`,
        reconErr,
      );
    }

    try {
      const { appendIfrsValidationIssues } = await import(
        "@/lib/audit/rules/ifrs-rules-engine"
      );
      idx = await appendIfrsValidationIssues(
        engagementId,
        runId,
        issues,
        idx,
        now,
      );
    } catch (ifrsErr) {
      console.error(
        `[AuditDB] IFRS validation append failed for ${engagementId}`,
        ifrsErr,
      );
    }

    try {
      const { appendSocpaValidationIssues } = await import(
        "@/lib/audit/rules/socpa-rules-engine"
      );
      idx = await appendSocpaValidationIssues(
        engagementId,
        runId,
        issues,
        idx,
        now,
      );
    } catch (socpaErr) {
      console.error(
        `[AuditDB] SOCPA validation append failed for ${engagementId}`,
        socpaErr,
      );
    }

    // Persist issues
    for (const i of issues) {
      await prisma.auditValidationIssue.create({ data: i });
    }

    // Update summary counts
    const critical = issues.filter((i) => i.severity === "critical").length;
    const high = issues.filter((i) => i.severity === "high").length;
    const medium = issues.filter((i) => i.severity === "medium").length;
    const low = issues.filter((i) => i.severity === "low").length;
    const summaryParts: string[] = [];
    if (issues.length === 0) summaryParts.push("All checks passed");
    if (critical > 0) summaryParts.push(`${critical} critical`);
    if (high > 0) summaryParts.push(`${high} high`);
    if (medium > 0) summaryParts.push(`${medium} medium`);
    if (low > 0) summaryParts.push(`${low} low`);

    const trustState =
      critical > 0 ? "blocked" : high > 0 ? "conditional" : "trusted";

    await prisma.auditValidationRun.update({
      where: { id: runId },
      data: {
        summary: summaryParts.join(", "),
        issueCount: issues.length,
        criticalCount: critical,
        highCount: high,
        mediumCount: medium,
        lowCount: low,
        trustState,
      },
    });

    await recordAuditOsAuditEvent({
      engagementId,
      eventType: "validation.run_completed",
      actorId,
      actorName: "System",
      actorRole: "system",
      targetType: "validation_run",
      targetId: runId,
      newState: "completed",
      description: `Validation run completed: ${issues.length} issue(s) found`,
    });

    // Return the persisted run
    return (await getValidationRun(engagementId))!;
  } catch (error) {
    console.error(
      `[AuditDB] runValidation(${engagementId}) failed. Mock fallback disabled for mutation path.`,
      error,
    );
    throw new Error(
      `AuditOS mutation unavailable: runValidation(${engagementId}). Mock fallback disabled.`,
    );
  }
}

export async function disposeValidationIssue(
  issueId: string,
  action: string,
  rationale: string | undefined,
  actorId: string,
  actorName: string,
): Promise<ValidationRun | null> {
  try {
    const issue = await prisma.auditValidationIssue.findUnique({
      where: { id: issueId },
      select: { id: true, engagementId: true },
    });
    if (!issue) throw new Error("Validation issue not found");

    const newStatus =
      action === "accepted"
        ? "accepted"
        : action === "dismissed"
          ? "dismissed"
          : "investigated";

    await prisma.auditValidationDisposition.create({
      data: {
        issueId,
        engagementId: issue.engagementId,
        action,
        rationale: rationale ?? null,
        disposedBy: actorId,
      },
    });

    await prisma.auditValidationIssue.update({
      where: { id: issueId },
      data: { status: newStatus },
    });

    await recordAuditOsAuditEvent({
      engagementId: issue.engagementId,
      eventType: "validation.issue_disposed",
      actorId,
      actorName,
      actorRole: "reviewer",
      targetType: "validation_issue",
      targetId: issueId,
      newState: newStatus,
      description: `Validation issue ${action}${rationale ? ": " + rationale.substring(0, 80) : ""}`,
    });

    return getValidationRun(issue.engagementId);
  } catch (error) {
    console.warn(`[AuditDB] disposeValidationIssue(${issueId}) error`, error);
    return null;
  }
}

export async function getFinancialStatements(
  engagementId: string,
): Promise<FinancialStatement[]> {
  try {
    const statements = await prisma.auditFinancialStatement.findMany({
      where: { engagementId },
      orderBy: { createdAt: "asc" },
    });
    if (statements.length === 0) return [];
    const [mappings, reviewComments] = await Promise.all([
      prisma.auditAccountMapping.findMany({
        where: { engagementId },
        include: { canonicalAccount: true },
      }),
      prisma.auditReviewComment.findMany({ where: { engagementId } }),
    ]);
    const mappedMappings = mappings.map(toAccountMapping);
    const mappedComments = reviewComments.map(toReviewComment);
    return statements.map((fs) => {
      let lines: FinancialStatementLine[] = [];
      try {
        lines =
          typeof fs.lines === "string"
            ? JSON.parse(fs.lines)
            : Array.isArray(fs.lines)
              ? fs.lines
              : [];
      } catch {
        lines = [];
      }
      if (!Array.isArray(lines)) lines = [];
      return {
        id: fs.id,
        engagementId: fs.engagementId,
        statementType: fs.statementType as FinancialStatement["statementType"],
        title: fs.title,
        status: fs.status as FinancialStatement["status"],
        lines: lines.map(toFinancialStatementLine),
        linkedAccounts: mappedMappings,
        reviewComments: mappedComments.filter(
          (rc) => rc.targetType === "statement" && rc.targetId === fs.id,
        ),
        createdAt: fs.createdAt.toISOString(),
        updatedAt: fs.updatedAt.toISOString(),
      };
    });
  } catch (error) {
    protectedAuditReadUnavailable(
      `getFinancialStatements(${engagementId})`,
      error,
    );
  }
}

export async function getEquityStatementLines(): Promise<
  FinancialStatementLine[]
> {
  try {
    const eq = await prisma.auditFinancialStatement.findFirst({
      where: { statementType: "equity" },
      orderBy: { createdAt: "desc" },
    });
    if (!eq) return [];
    const lines: FinancialStatementLine[] =
      typeof eq.lines === "string"
        ? JSON.parse(eq.lines)
        : Array.isArray(eq.lines)
          ? eq.lines
          : [];
    return lines.map(toFinancialStatementLine);
  } catch (error) {
    protectedAuditReadUnavailable("getEquityStatementLines", error);
  }
}

export async function getDisclosureNotes(
  engagementId: string,
): Promise<DisclosureNote[]> {
  try {
    const notes = await prisma.auditDisclosureNote.findMany({
      where: { engagementId },
    });
    if (notes.length === 0) return [];
    const reviewComments = await prisma.auditReviewComment.findMany({
      where: { engagementId, targetType: "note" },
    });
    const mappedComments = reviewComments.map(toReviewComment);
    return notes.map((n) =>
      toDisclosureNote(
        n,
        mappedComments.filter((rc) => rc.targetId === n.id),
      ),
    );
  } catch (error) {
    protectedAuditReadUnavailable(`getDisclosureNotes(${engagementId})`, error);
  }
}

export async function getEvidence(
  engagementId: string,
): Promise<EvidenceObject[]> {
  try {
    const evidence = await prisma.auditEvidence.findMany({
      where: { engagementId },
      include: { links: true },
      orderBy: { createdAt: "desc" },
    });
    if (evidence.length === 0) return [];
    return evidence.map(toEvidenceObject);
  } catch (error) {
    protectedAuditReadUnavailable(`getEvidence(${engagementId})`, error);
  }
}

export async function getEvidencePaginated(
  engagementId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<EvidenceObject>> {
  try {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(
      1,
      Math.min(100, params.pageSize ?? DEFAULT_PAGE_SIZE),
    );
    const skip = offsetFromPage(page, pageSize);
    const [evidence, total] = await Promise.all([
      prisma.auditEvidence.findMany({
        where: { engagementId },
        include: { links: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.auditEvidence.count({ where: { engagementId } }),
    ]);
    return paginate(evidence.map(toEvidenceObject), total, { page, pageSize });
  } catch (error) {
    protectedAuditReadUnavailable(
      `getEvidencePaginated(${engagementId})`,
      error,
    );
  }
}

export async function getMissingEvidence(
  engagementId: string,
): Promise<EvidenceObject[]> {
  try {
    const evidence = await prisma.auditEvidence.findMany({
      where: { engagementId, state: "missing" },
      include: { links: true },
    });
    return evidence.map(toEvidenceObject);
  } catch (error) {
    protectedAuditReadUnavailable(`getMissingEvidence(${engagementId})`, error);
  }
}

export async function getFindings(engagementId: string): Promise<Finding[]> {
  try {
    const findings = await prisma.auditFinding.findMany({
      where: { engagementId },
    });
    if (findings.length === 0) return [];
    return findings.map(toFinding);
  } catch (error) {
    protectedAuditReadUnavailable(`getFindings(${engagementId})`, error);
  }
}

export async function getFindingsPaginated(
  engagementId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<Finding>> {
  try {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(
      1,
      Math.min(100, params.pageSize ?? DEFAULT_PAGE_SIZE),
    );
    const skip = offsetFromPage(page, pageSize);
    const [findings, total] = await Promise.all([
      prisma.auditFinding.findMany({
        where: { engagementId },
        skip,
        take: pageSize,
      }),
      prisma.auditFinding.count({ where: { engagementId } }),
    ]);
    return paginate(findings.map(toFinding), total, { page, pageSize });
  } catch (error) {
    protectedAuditReadUnavailable(
      `getFindingsPaginated(${engagementId})`,
      error,
    );
  }
}

export async function getFinding(
  engagementId: string,
  findingId: string,
): Promise<Finding | null> {
  try {
    const finding = await prisma.auditFinding.findUnique({
      where: { id: findingId },
    });
    if (!finding || finding.engagementId !== engagementId) return null;
    return toFinding(finding);
  } catch (error) {
    protectedAuditReadUnavailable(`getFinding(${findingId})`, error);
  }
}

export async function getRecommendations(
  engagementId: string,
): Promise<Recommendation[]> {
  try {
    const recs = await prisma.auditRecommendation.findMany({
      where: { engagementId },
      include: { finding: true },
    });
    if (recs.length === 0) return [];
    return recs.map(toRecommendation);
  } catch (error) {
    protectedAuditReadUnavailable(`getRecommendations(${engagementId})`, error);
  }
}

export async function getRecommendationsPaginated(
  engagementId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<Recommendation>> {
  try {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(
      1,
      Math.min(100, params.pageSize ?? DEFAULT_PAGE_SIZE),
    );
    const skip = offsetFromPage(page, pageSize);
    const [recs, total] = await Promise.all([
      prisma.auditRecommendation.findMany({
        where: { engagementId },
        include: { finding: true },
        skip,
        take: pageSize,
      }),
      prisma.auditRecommendation.count({ where: { engagementId } }),
    ]);
    return paginate(recs.map(toRecommendation), total, { page, pageSize });
  } catch (error) {
    protectedAuditReadUnavailable(
      `getRecommendationsPaginated(${engagementId})`,
      error,
    );
  }
}

export async function getRecommendation(
  engagementId: string,
  recId: string,
): Promise<Recommendation | null> {
  try {
    const rec = await prisma.auditRecommendation.findUnique({
      where: { id: recId },
    });
    if (!rec || rec.engagementId !== engagementId) return null;
    return toRecommendation(rec);
  } catch (error) {
    protectedAuditReadUnavailable(`getRecommendation(${recId})`, error);
  }
}

export async function getReviewComments(
  engagementId: string,
): Promise<ReviewComment[]> {
  try {
    const comments = await prisma.auditReviewComment.findMany({
      where: { engagementId },
    });
    if (comments.length === 0) return [];
    return comments.map(toReviewComment);
  } catch (error) {
    protectedAuditReadUnavailable(`getReviewComments(${engagementId})`, error);
  }
}

export async function getOpenReviewCount(
  engagementId: string,
): Promise<number> {
  try {
    const count = await prisma.auditReviewComment.count({
      where: { engagementId, status: "open" },
    });
    return count;
  } catch (error) {
    protectedAuditReadUnavailable(`getOpenReviewCount(${engagementId})`, error);
  }
}

export async function getApprovalRecords(
  engagementId: string,
): Promise<ApprovalRecord[]> {
  try {
    const records = await prisma.auditApprovalRecord.findMany({
      where: { engagementId },
    });
    if (records.length === 0) return [];
    return records.map(toApprovalRecord);
  } catch (error) {
    protectedAuditReadUnavailable(`getApprovalRecords(${engagementId})`, error);
  }
}

export async function getApprovalStatus(engagementId: string): Promise<{
  status: string;
  blockingIssues: readonly string[];
  checklist: Array<{ label: string; passed: boolean; detail: string }>;
}> {
  try {
    const [
      openReviews,
      unmappedCount,
      missingCount,
      rejectedCount,
      highCriticalFindings,
      engagement,
    ] = await Promise.all([
      prisma.auditReviewComment.count({
        where: { engagementId, status: "open" },
      }),
      prisma.auditAccountMapping.count({
        where: { engagementId, status: "pending" },
      }),
      prisma.auditEvidence.count({ where: { engagementId, state: "missing" } }),
      prisma.auditEvidence.count({
        where: { engagementId, state: "rejected" },
      }),
      prisma.auditFinding.count({
        where: {
          engagementId,
          severity: { in: ["high", "critical"] },
          status: { notIn: ["resolved", "dismissed"] },
        },
      }),
      prisma.auditEngagement.findUnique({
        where: { id: engagementId },
        select: { status: true },
      }),
    ]);
    const blockingIssues: string[] = [];
    const checklist: Array<{ label: string; passed: boolean; detail: string }> =
      [];

    // 1. Accounts mapped
    const accountsPassed = unmappedCount === 0;
    checklist.push({
      label: "All accounts mapped",
      passed: accountsPassed,
      detail: accountsPassed
        ? "All accounts mapped"
        : `${unmappedCount} account(s) pending mapping`,
    });
    if (!accountsPassed)
      blockingIssues.push(`${unmappedCount} unmapped account(s)`);

    // 2. Evidence collected
    const evidencePassed = missingCount === 0 && rejectedCount === 0;
    checklist.push({
      label: "All evidence collected",
      passed: evidencePassed,
      detail: !evidencePassed
        ? `${missingCount} missing, ${rejectedCount} rejected`
        : "All evidence collected",
    });
    if (missingCount > 0)
      blockingIssues.push(`${missingCount} missing evidence item(s)`);
    if (rejectedCount > 0)
      blockingIssues.push(`${rejectedCount} rejected evidence item(s)`);

    // 3. Review comments resolved
    const reviewsPassed = openReviews === 0;
    checklist.push({
      label: "Review comments resolved",
      passed: reviewsPassed,
      detail: reviewsPassed
        ? "All review comments resolved"
        : `${openReviews} open review comment(s)`,
    });
    if (!reviewsPassed)
      blockingIssues.push(`${openReviews} open review comment(s)`);

    // 4. No high/critical unresolved findings
    const findingsPassed = highCriticalFindings === 0;
    checklist.push({
      label: "No critical unresolved findings",
      passed: findingsPassed,
      detail: findingsPassed
        ? "No high/critical findings"
        : `${highCriticalFindings} high/critical finding(s) unresolved`,
    });
    if (!findingsPassed)
      blockingIssues.push(
        `${highCriticalFindings} high/critical finding(s) unresolved`,
      );

    // 5. Engagement status eligible
    const eligibleStatuses = [
      "in_progress",
      "under_review",
      "ready_for_approval",
    ];
    const statusPassed =
      engagement !== null && eligibleStatuses.includes(engagement.status);
    checklist.push({
      label: "Engagement ready for approval",
      passed: statusPassed,
      detail: statusPassed
        ? "Status eligible"
        : `Status: ${engagement?.status ?? "unknown"} (requires in_progress/under_review/ready_for_approval)`,
    });
    if (!statusPassed)
      blockingIssues.push(
        `Engagement status (${engagement?.status ?? "unknown"}) not ready for approval`,
      );

    try {
      const { appendFactoryApprovalGates } = await import(
        "@/lib/audit/governance"
      );
      await appendFactoryApprovalGates(engagementId, blockingIssues, checklist);
    } catch (gateErr) {
      console.error(
        `[AuditDB] factory approval gates failed for ${engagementId}`,
        gateErr,
      );
    }

    try {
      const { appendReconciliationApprovalGates } = await import(
        "@/lib/audit/reconciliation/reconciliation-engine"
      );
      await appendReconciliationApprovalGates(
        engagementId,
        blockingIssues,
        checklist,
      );
    } catch (reconGateErr) {
      console.error(
        `[AuditDB] reconciliation approval gates failed for ${engagementId}`,
        reconGateErr,
      );
    }

    const isReady = blockingIssues.length === 0;
    return {
      status: isReady ? "ready" : "not_ready",
      blockingIssues,
      checklist,
    } as const;
  } catch (error) {
    protectedAuditReadUnavailable(`getApprovalStatus(${engagementId})`, error);
  }
}

export async function getPublicationPackage(
  engagementId: string,
): Promise<PublicationPackage | null> {
  try {
    const pkg = await prisma.auditPublicationPackage.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
    });
    if (!pkg) return null;
    const [
      statements,
      notes,
      findings,
      recommendations,
      reviewComments,
      approvalRecords,
      evidenceList,
    ] = await Promise.all([
      prisma.auditFinancialStatement.findMany({ where: { engagementId } }),
      prisma.auditDisclosureNote.findMany({ where: { engagementId } }),
      prisma.auditFinding.findMany({ where: { engagementId } }),
      prisma.auditRecommendation.findMany({ where: { engagementId } }),
      prisma.auditReviewComment.findMany({ where: { engagementId } }),
      prisma.auditApprovalRecord.findMany({ where: { engagementId } }),
      prisma.auditEvidence.findMany({ where: { engagementId } }),
    ]);
    const mappedComments = reviewComments.map(toReviewComment);
    const mappedFindings = findings.map(toFinding);
    const mappedRecs = recommendations.map(toRecommendation);
    const mappedApprovals = approvalRecords.map(toApprovalRecord);
    const mappingData = await prisma.auditAccountMapping.findMany({
      where: { engagementId },
      include: { canonicalAccount: true },
    });
    const mappedMappings = mappingData.map(toAccountMapping);
    const mappedStatements = statements.map((fs) => {
      const lines: FinancialStatementLine[] =
        typeof fs.lines === "string"
          ? JSON.parse(fs.lines)
          : Array.isArray(fs.lines)
            ? fs.lines
            : [];
      return {
        id: fs.id,
        engagementId: fs.engagementId,
        statementType: fs.statementType as FinancialStatement["statementType"],
        title: fs.title,
        status: fs.status as FinancialStatement["status"],
        lines: lines.map(toFinancialStatementLine),
        linkedAccounts: mappedMappings,
        reviewComments: mappedComments.filter(
          (rc) => rc.targetType === "statement" && rc.targetId === fs.id,
        ),
        createdAt: fs.createdAt.toISOString(),
        updatedAt: fs.updatedAt.toISOString(),
      };
    });
    const mappedNotes = notes.map((n) =>
      toDisclosureNote(
        n,
        mappedComments.filter(
          (rc) => rc.targetType === "note" && rc.targetId === n.id,
        ),
      ),
    );
    const openReviewCount = reviewComments.filter(
      (rc) => rc.status === "open",
    ).length;
    const findingsSummary = `${mappedFindings.length} findings (${mappedFindings.filter((f) => f.status === "draft").length} draft, ${mappedFindings.filter((f) => f.status === "open").length} open, ${mappedFindings.filter((f) => f.status === "in_review").length} in review)`;
    const evidenceSummary = `${evidenceList.length} evidence items (${evidenceList.filter((e) => e.state === "accepted").length} accepted, ${evidenceList.filter((e) => e.state === "reviewed").length} reviewed, ${evidenceList.filter((e) => e.state === "missing").length} missing)`;
    return {
      id: pkg.id,
      engagementId: pkg.engagementId,
      status: pkg.status as PublicationPackage["status"],
      statements: mappedStatements,
      notes: mappedNotes,
      findings: mappedFindings,
      recommendations: mappedRecs,
      reviewSummary: `${openReviewCount} open comment(s)`,
      findingsSummary,
      evidenceSummary,
      approvalHistory: mappedApprovals,
      publishedAt: pkg.publishedAt?.toISOString() ?? undefined,
      publishedBy: pkg.publishedBy ?? undefined,
      lockedAt: pkg.lockedAt?.toISOString() ?? undefined,
    };
  } catch (error) {
    protectedAuditReadUnavailable(
      `getPublicationPackage(${engagementId})`,
      error,
    );
  }
}

export async function getAuditEvents(
  engagementId: string,
): Promise<AuditEvent[]> {
  try {
    const events = await prisma.auditEvent.findMany({
      where: { engagementId },
      orderBy: { timestamp: "desc" },
    });
    if (events.length === 0) return [];
    return events.map(toAuditEvent);
  } catch (error) {
    protectedAuditReadUnavailable(`getAuditEvents(${engagementId})`, error);
  }
}

export async function getAISuggestions(
  engagementId: string,
  suggestionType?: string,
): Promise<AIAssistanceOutput[]> {
  try {
    const where: Record<string, unknown> = { engagementId };
    if (suggestionType) where.suggestionType = suggestionType;
    const suggestions = await prisma.auditAiOutput.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    if (suggestions.length === 0) return [];
    return suggestions.map(toAiOutput);
  } catch (error) {
    protectedAuditReadUnavailable(`getAISuggestions(${engagementId})`, error);
  }
}

export async function acceptAISuggestion(
  suggestionId: string,
  userId: string,
): Promise<void> {
  try {
    await prisma.auditAiOutput.update({
      where: { id: suggestionId },
      data: {
        status: "accepted_by_human",
        acceptedBy: userId,
        acceptedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(
      `[AuditDB] acceptAISuggestion(${suggestionId}) failed. Mock fallback disabled for mutation path.`,
      error,
    );
    throw new Error(
      `AuditOS mutation unavailable: acceptAISuggestion(${suggestionId}). Mock fallback disabled.`,
    );
  }
}

export async function createAIOutput(data: {
  engagementId: string;
  suggestionType: string;
  inputContext?: string;
  outputContent: string;
  confidence?: number;
  modelVersion?: string;
  sourceEntityType?: string;
  sourceEntityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<AIAssistanceOutput> {
  const ai = await prisma.auditAiOutput.create({
    data: {
      engagementId: data.engagementId,
      suggestionType: data.suggestionType,
      inputContext: data.inputContext ?? null,
      outputContent: data.outputContent,
      confidence: data.confidence ?? null,
      modelVersion: data.modelVersion ?? null,
      status: "suggested",
      sourceEntityType: data.sourceEntityType ?? null,
      sourceEntityId: data.sourceEntityId ?? null,
      metadata: (data.metadata ?? undefined) as any,
    },
  });
  return toAiOutput(ai);
}

export async function getAIOutputsForEntity(
  engagementId: string,
  sourceEntityType: string,
  sourceEntityId: string,
): Promise<AIAssistanceOutput[]> {
  try {
    const outputs = await prisma.auditAiOutput.findMany({
      where: { engagementId, sourceEntityType, sourceEntityId },
      orderBy: { createdAt: "desc" },
    });
    return outputs.map(toAiOutput);
  } catch (error) {
    console.warn(
      `[AuditDB] getAIOutputsForEntity(${engagementId}) error`,
      error,
    );
    return [];
  }
}

export async function updateAIOutputStatus(
  id: string,
  status: string,
  userId?: string,
): Promise<AIAssistanceOutput | null> {
  try {
    const updateData: Record<string, unknown> = { status };
    if (status === "accepted_by_human" && userId) {
      updateData.acceptedBy = userId;
      updateData.acceptedAt = new Date();
    }
    if (status === "rejected" && userId) {
      updateData.rejectedBy = userId;
      updateData.rejectedAt = new Date();
    }
    const ai = await prisma.auditAiOutput.update({
      where: { id },
      data: updateData as any,
    });
    return toAiOutput(ai);
  } catch (error) {
    console.warn(`[AuditDB] updateAIOutputStatus(${id}) error`, error);
    return null;
  }
}

export async function getTraceability(
  engagementId: string,
  targetType: string,
  targetId: string,
): Promise<any> {
  try {
    const forwardTrace: any[] = [];
    const backwardTrace: any[] = [];

    const trialBalance = await prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });
    if (trialBalance) {
      forwardTrace.push({
        id: `tb-${trialBalance.id}`,
        type: "source_data",
        label: `Trial Balance: ${trialBalance.sourceFile}`,
        status: trialBalance.trustState,
      });
      const matchingLines = trialBalance.lines.filter(
        (l) => l.id === targetId || l.accountCode === targetId,
      );
      for (const line of matchingLines) {
        forwardTrace.push({
          id: `tbl-${line.id}`,
          type: "source_data",
          label: `${line.accountCode} - ${line.accountName}`,
          status: "imported",
          amount: line.balance,
        });
      }
    }

    const mapping = await prisma.auditAccountMapping.findFirst({
      where: {
        OR: [
          { id: targetId },
          { sourceAccountId: targetId },
          { sourceAccountCode: targetId },
        ],
        engagementId,
      },
      include: { canonicalAccount: true },
    });
    if (mapping) {
      forwardTrace.push({
        id: `map-${mapping.id}`,
        type: "account",
        label: `${mapping.sourceAccountName} → ${mapping.canonicalAccount?.name ?? "unmapped"}`,
        status: mapping.status,
        mappingType: mapping.mappingType,
      });
    }

    const evidence = await prisma.auditEvidence.findFirst({
      where: {
        OR: [{ id: targetId }, { links: { some: { targetId } } }],
        engagementId,
      },
      include: { links: true },
    });
    if (evidence) {
      forwardTrace.push({
        id: `ev-${evidence.id}`,
        type: "evidence",
        label: evidence.filename,
        status: evidence.state,
      });
    }

    // Also check for evidence linked to target via EvidenceLink
    const evidenceLinks = await prisma.auditEvidenceLink.findMany({
      where: { OR: [{ targetId }, { evidenceId: targetId }] },
      include: { evidence: true },
      take: 5,
    });
    for (const el of evidenceLinks) {
      forwardTrace.push({
        id: `evlink-${el.id}`,
        type: "evidence",
        label: el.evidence.filename,
        status: el.evidence.state,
        linkType: el.linkType,
      });
    }

    const finding = await prisma.auditFinding.findFirst({
      where: { id: targetId, engagementId },
    });
    if (finding) {
      forwardTrace.push({
        id: `find-${finding.id}`,
        type: "finding",
        label: finding.title,
        status: finding.status,
        severity: finding.severity,
      });
    }

    const rec = await prisma.auditRecommendation.findFirst({
      where: { engagementId, findingId: targetId },
    });
    const recById = await prisma.auditRecommendation.findFirst({
      where: { id: targetId, engagementId },
    });
    const foundRec = rec ?? recById;
    if (foundRec) {
      forwardTrace.push({
        id: `rec-${foundRec.id}`,
        type: "recommendation",
        label: foundRec.title,
        status: foundRec.status,
        riskLevel: foundRec.riskLevel,
      });
    }

    const comments = await prisma.auditReviewComment.findMany({
      where: { engagementId, targetId },
      take: 5,
    });
    for (const c of comments) {
      forwardTrace.push({
        id: `rc-${c.id}`,
        type: "review",
        label: c.comment.substring(0, 60),
        status: c.status,
        reviewer: c.reviewerName,
      });
    }

    const pkg = await prisma.auditPublicationPackage.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
    });
    if (pkg) {
      backwardTrace.push({
        id: `pub-${pkg.id}`,
        type: "publication",
        label: "Published Output",
        status: pkg.status,
      });
    }

    const approvals = await prisma.auditApprovalRecord.findMany({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    for (const a of approvals) {
      backwardTrace.push({
        id: `appr-${a.id}`,
        type: "approval",
        label: `Approval by ${a.approverName}`,
        status: a.action,
      });
    }

    const events = await prisma.auditEvent.findMany({
      where: { engagementId },
      orderBy: { timestamp: "desc" },
      take: 10,
    });
    for (const ae of events) {
      backwardTrace.push({
        id: `event-${ae.id}`,
        type: "event",
        label: ae.description,
        status: ae.eventType,
        actor: ae.actorName,
        timestamp: ae.timestamp.toISOString(),
      });
    }

    const aiOutputs = await prisma.auditAiOutput.findMany({
      where: {
        OR: [{ id: targetId }, { sourceEntityId: targetId }],
        engagementId,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    for (const ao of aiOutputs) {
      backwardTrace.push({
        id: `ai-${ao.id}`,
        type: "ai_output",
        label: `${ao.suggestionType}: ${ao.outputContent.substring(0, 60)}`,
        status: ao.status,
        timestamp: ao.createdAt.toISOString(),
      });
    }

    return { targetType, targetId, forwardTrace, backwardTrace };
  } catch (error) {
    console.warn(`[AuditDB] getTraceability(${engagementId}) error`, error);
    return { targetType, targetId, forwardTrace: [], backwardTrace: [] };
  }
}

export async function getFullTraceability(
  engagementId: string,
  label: string,
): Promise<any> {
  try {
    const statements = await prisma.auditFinancialStatement.findMany({
      where: { engagementId },
    });
    let targetLine: FinancialStatementLine | null = null;
    let targetStatementId = "";
    for (const fs of statements) {
      const lines: FinancialStatementLine[] =
        typeof fs.lines === "string"
          ? JSON.parse(fs.lines)
          : Array.isArray(fs.lines)
            ? fs.lines
            : [];
      const found = lines.find((l) => l.label === label);
      if (found) {
        targetLine = toFinancialStatementLine(found);
        targetStatementId = fs.id;
        break;
      }
    }
    if (!targetLine) {
      return {
        targetLabel: label,
        nodes: [],
        message: "Line not found in database",
      };
    }
    const mappingIds = targetLine.linkedAccountMappings;
    const mappings =
      mappingIds.length > 0
        ? await prisma.auditAccountMapping.findMany({
            where: { id: { in: mappingIds }, engagementId },
            include: { canonicalAccount: true },
          })
        : [];
    const mappedMappings = mappings.map(toAccountMapping);
    const sourceAccountIds = mappedMappings.map((m) => m.sourceAccountId);
    const evidenceLinks =
      sourceAccountIds.length > 0
        ? await prisma.auditEvidenceLink.findMany({
            where: { targetId: { in: sourceAccountIds } },
            include: { evidence: { include: { links: true } } },
          })
        : [];
    const evidenceSet = new Map<string, EvidenceObject>();
    for (const el of evidenceLinks) {
      if (!evidenceSet.has(el.evidenceId)) {
        evidenceSet.set(el.evidenceId, toEvidenceObject(el.evidence));
      }
    }
    const mappedEvidence = Array.from(evidenceSet.values());
    const findings =
      sourceAccountIds.length > 0
        ? await prisma.auditFinding.findMany({ where: { engagementId } })
        : [];
    const relatedFindings = findings.filter((f) => {
      const accountIds: string[] = Array.isArray(f.relatedAccountIds)
        ? (f.relatedAccountIds as string[])
        : [];
      return accountIds.some((aid) => sourceAccountIds.includes(aid));
    });
    const mappedFindings = relatedFindings.map(toFinding);
    const findingIds = mappedFindings.map((f) => f.id);
    const recommendations =
      findingIds.length > 0
        ? await prisma.auditRecommendation.findMany({
            where: { findingId: { in: findingIds }, engagementId },
          })
        : [];
    const mappedRecs = recommendations.map(toRecommendation);
    const allTargetIds = [
      ...sourceAccountIds,
      ...findingIds,
      ...mappedRecs.map((r) => r.id),
      targetStatementId,
    ];
    const reviewComments =
      allTargetIds.length > 0
        ? await prisma.auditReviewComment.findMany({
            where: { engagementId, targetId: { in: allTargetIds } },
          })
        : [];
    const mappedComments = reviewComments.map(toReviewComment);
    const approvalRecords = await prisma.auditApprovalRecord.findMany({
      where: { engagementId },
    });
    const mappedApprovals = approvalRecords.map(toApprovalRecord);
    const auditEvents = await prisma.auditEvent.findMany({
      where: { engagementId },
      orderBy: { timestamp: "asc" },
    });
    const mappedEvents = auditEvents.map(toAuditEvent);
    const nodes: any[] = [];
    nodes.push({
      id: `line-${targetLine.id}`,
      type: "source_data",
      label: targetLine.label,
      entityType: "financial_statement_line",
      status: "identified",
      amount: targetLine.amount,
    });
    for (const m of mappedMappings) {
      nodes.push({
        id: `mapping-${m.id}`,
        type: "account",
        label: `${m.sourceAccountName} (${m.sourceAccountCode}) → ${m.canonicalAccountName ?? "unmapped"}`,
        entityType: "account_mapping",
        status: m.status,
        mappingType: m.mappingType,
      });
    }
    for (const ev of mappedEvidence) {
      nodes.push({
        id: `evidence-${ev.id}`,
        type: "evidence",
        label: ev.filename,
        entityType: "evidence",
        status: ev.state,
      });
    }
    for (const f of mappedFindings) {
      nodes.push({
        id: `finding-${f.id}`,
        type: "finding",
        label: f.title,
        entityType: "finding",
        status: f.status,
        severity: f.severity,
      });
    }
    for (const r of mappedRecs) {
      nodes.push({
        id: `rec-${r.id}`,
        type: "recommendation",
        label: r.title,
        entityType: "recommendation",
        status: r.status,
        riskLevel: r.riskLevel,
      });
    }
    for (const rc of mappedComments) {
      nodes.push({
        id: `comment-${rc.id}`,
        type: "review",
        label: rc.comment.substring(0, 60),
        entityType: "review_comment",
        status: rc.status,
        reviewerName: rc.reviewerName,
      });
    }
    for (const a of mappedApprovals) {
      nodes.push({
        id: `approval-${a.id}`,
        type: "approval",
        label: `Approval by ${a.approverName}`,
        entityType: "approval_record",
        status: a.action,
      });
    }
    for (const ae of mappedEvents) {
      nodes.push({
        id: `event-${ae.id}`,
        type: "event",
        label: ae.description,
        entityType: "audit_event",
        status: ae.eventType,
        timestamp: ae.timestamp,
      });
    }
    const aiOutputs = await prisma.auditAiOutput.findMany({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    for (const ao of aiOutputs) {
      nodes.push({
        id: `ai-${ao.id}`,
        type: "ai_output",
        label: `${ao.suggestionType}: ${ao.outputContent.substring(0, 60)}`,
        entityType: "ai_output",
        status: ao.status,
        timestamp: ao.createdAt.toISOString(),
      });
    }
    return { targetLabel: label, statementId: targetStatementId, nodes };
  } catch (error) {
    console.warn(`[AuditDB] getFullTraceability(${engagementId}) error`, error);
    return {
      targetLabel: label,
      nodes: [],
      message: "Error building traceability",
    };
  }
}

// ─── Canonical Accounts ───

export async function getCanonicalAccounts(
  limit?: number,
): Promise<Array<{ id: string; code: string; name: string }>> {
  try {
    const accounts = await prisma.auditCanonicalAccount.findMany({
      orderBy: { displayOrder: "asc" },
      take: limit ?? 100,
    });
    return accounts.map((a) => ({ id: a.id, code: a.code, name: a.name }));
  } catch (error) {
    console.warn(
      "[AuditDB] getCanonicalAccounts error, returning empty",
      error,
    );
    return [];
  }
}

// ─── Write Operations ───

export async function createClient(data: {
  organizationId: string;
  name: string;
  industry: string;
  reportingFramework?: string;
  currencyCode?: string;
}): Promise<Client> {
  const client = await prisma.auditClient.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      industry: data.industry,
      reportingFramework: data.reportingFramework ?? "ifrs_for_smes",
      currencyCode: data.currencyCode ?? "SAR",
      fiscalPeriodEnd: "12-31",
    },
  });
  return toClient(client);
}

export async function createEngagement(data: {
  organizationId: string;
  clientId: string;
  fiscalPeriod: string;
  engagementType: string;
  team?: Array<Record<string, unknown>>;
  status?: string;
  presentationProfile?: string;
  presentationProfileVersion?: string;
  presentationPolicyId?: string;
}): Promise<Engagement> {
  const { policyIdForProfile } = await import(
    "@/lib/audit/presentation/presentation-policy-resolver"
  );
  const profile = data.presentationProfile ?? "generic";
  const engagement = await prisma.auditEngagement.create({
    data: {
      organizationId: data.organizationId,
      clientId: data.clientId,
      fiscalPeriod: data.fiscalPeriod,
      engagementType: data.engagementType,
      status: data.status ?? "setup",
      team: (data.team ?? []) as any,
      presentationProfile: profile,
      presentationProfileVersion:
        data.presentationProfileVersion ?? "generic-v1",
      presentationPolicyId:
        data.presentationPolicyId ?? policyIdForProfile(profile as any),
    },
    include: { client: true },
  });
  return toEngagement(engagement as any);
}

export async function updateEngagementPresentationProfile(
  engagementId: string,
  params: {
    presentationProfile: string;
    presentationProfileVersion: string;
    presentationPolicyId: string;
  },
): Promise<Engagement> {
  const engagement = await prisma.auditEngagement.update({
    where: { id: engagementId },
    data: {
      presentationProfile: params.presentationProfile,
      presentationProfileVersion: params.presentationProfileVersion,
      presentationPolicyId: params.presentationPolicyId,
    },
    include: { client: true, presentationPolicy: true },
  });

  return toEngagement(engagement as any);
}

export async function saveTrialBalance(
  engagementId: string,
  sourceFile: string,
  rows: Array<{
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    balance: number;
    accountType?: string;
  }>,
): Promise<TrialBalance> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { client: { select: { currencyCode: true } } },
  });
  const currency = engagement?.client?.currencyCode ?? "SAR";

  const totalDebits = rows.reduce((s, r) => s + r.debitAmount, 0);
  const totalCredits = rows.reduce((s, r) => s + r.creditAmount, 0);
  const variance = totalDebits - totalCredits;
  const tb = await prisma.auditTrialBalance.create({
    data: {
      engagementId,
      sourceFile,
      trustState: Math.abs(variance) < 1 ? "trusted" : "conditional",
      totalDebits,
      totalCredits,
      variance,
      lines: {
        create: rows.map((r) => ({
          accountCode: r.accountCode,
          accountName: r.accountName,
          debitAmount: r.debitAmount,
          creditAmount: r.creditAmount,
          balance: r.balance,
          accountType: r.accountType ?? null,
          currency,
        })),
      },
    },
    include: { lines: true },
  });
  return toTrialBalance(tb);
}

export async function createSuggestedMappingsForTrialBalance(
  engagementId: string,
  organizationId: string,
  rows: Array<{
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    canonicalAccountId: string;
    confidence: number;
    source: string;
  }>,
): Promise<number> {
  let created = 0;
  for (const row of rows) {
    const sourceAccountId = `src-${engagementId}-${row.accountCode}`;
    const existing = await prisma.auditAccountMapping.findFirst({
      where: { engagementId, sourceAccountCode: row.accountCode },
    });
    if (existing) continue;

    const canonical = await prisma.auditCanonicalAccount.findUnique({
      where: { id: row.canonicalAccountId },
    });

    await prisma.auditAccountMapping.create({
      data: {
        engagementId,
        sourceAccountId,
        sourceAccountCode: row.accountCode,
        sourceAccountName: row.accountName,
        debitAmount: row.debitAmount,
        creditAmount: row.creditAmount,
        canonicalAccountId: row.canonicalAccountId,
        confidence: row.confidence,
        mappingType: "ai_suggested",
        status: "pending",
        statementClassification: canonical?.category ?? null,
      },
    });
    created++;
  }
  return created;
}

export async function getEngagementOrganizationId(
  engagementId: string,
): Promise<string | null> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { organizationId: true },
  });
  return engagement?.organizationId ?? null;
}

export async function recordAuditEvent(params: {
  engagementId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetType: string;
  targetId: string;
  previousState?: string;
  newState?: string;
  description: string;
  aiRelated?: boolean;
  metadata?: Record<string, unknown>;
}): Promise<AuditEvent> {
  const event = await recordAuditOsAuditEvent({
    engagementId: params.engagementId,
    eventType: params.eventType,
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    targetType: params.targetType,
    targetId: params.targetId,
    previousState: params.previousState ?? "",
    newState: params.newState ?? "",
    description: params.description,
    aiRelated: params.aiRelated ?? false,
    metadata: params.metadata ?? undefined,
  });
  return toAuditEvent(event);
}

// ─── Evidence CRUD ───

export async function createEvidence(data: {
  engagementId: string;
  filename: string;
  fileType: string;
  fileSize?: number;
  state?: string;
  uploadedBy?: string;
  fileHash?: string;
  storageKey?: string;
}): Promise<EvidenceObject> {
  const ev = await prisma.auditEvidence.create({
    data: {
      engagementId: data.engagementId,
      filename: data.filename,
      fileType: data.fileType,
      fileSize: data.fileSize ?? 0,
      state: data.state ?? "missing",
      uploadedBy: data.uploadedBy ?? null,
      uploadedAt: data.uploadedBy ? new Date() : null,
      fileHash: data.fileHash ?? null,
      storageKey: data.storageKey ?? null,
    },
    include: { links: true },
  });
  return toEvidenceObject(ev);
}

export async function updateEvidenceState(
  id: string,
  state: string,
  userId?: string,
): Promise<EvidenceObject> {
  const ev = await prisma.auditEvidence.update({
    where: { id },
    data: {
      state,
      uploadedBy: userId ?? undefined,
      uploadedAt: userId ? new Date() : undefined,
    },
    include: { links: true },
  });
  return toEvidenceObject(ev);
}

export async function updateEvidenceStorage(
  id: string,
  data: {
    fileHash: string;
    storageKey: string;
    fileSize: number;
  },
): Promise<EvidenceObject | null> {
  try {
    const ev = await prisma.auditEvidence.update({
      where: { id },
      data: {
        fileHash: data.fileHash,
        storageKey: data.storageKey,
        fileSize: data.fileSize,
        state: "uploaded",
        uploadedAt: new Date(),
      },
      include: { links: true },
    });
    return toEvidenceObject(ev);
  } catch {
    return null;
  }
}

// ─── Findings CRUD ───

export async function createFinding(data: {
  engagementId: string;
  title: string;
  findingType: string;
  severity: string;
  materiality?: string;
  description: string;
  rootCause?: string;
  impact?: string;
  aiSuggested?: boolean;
}): Promise<Finding> {
  const finding = await prisma.auditFinding.create({
    data: {
      engagementId: data.engagementId,
      title: data.title,
      findingType: data.findingType,
      severity: data.severity,
      materiality: data.materiality ?? "immaterial",
      description: data.description,
      rootCause: data.rootCause ?? null,
      impact: data.impact ?? null,
      status: "draft",
      aiSuggested: data.aiSuggested ?? false,
    },
  });
  return toFinding(finding);
}

export async function updateFindingStatus(
  id: string,
  status: string,
): Promise<Finding> {
  const finding = await prisma.auditFinding.update({
    where: { id },
    data: { status },
  });
  return toFinding(finding);
}

// ─── Recommendations CRUD ───

export async function createRecommendation(data: {
  engagementId: string;
  findingId: string;
  title: string;
  description: string;
  recommendedAction: string;
  riskLevel?: string;
  aiContributed?: boolean;
}): Promise<Recommendation> {
  const rec = await prisma.auditRecommendation.create({
    data: {
      engagementId: data.engagementId,
      findingId: data.findingId,
      title: data.title,
      description: data.description,
      recommendedAction: data.recommendedAction,
      riskLevel: data.riskLevel ?? "medium",
      status: "suggested",
      aiContributed: data.aiContributed ?? false,
    },
  });
  return toRecommendation(rec);
}

export async function updateRecommendationStatus(
  id: string,
  status: string,
  reviewerDecision?: string,
): Promise<Recommendation> {
  const rec = await prisma.auditRecommendation.update({
    where: { id },
    data: { status, reviewerDecision: reviewerDecision ?? undefined },
  });
  return toRecommendation(rec);
}

// ─── Review Comments CRUD ───

export async function createReviewComment(data: {
  engagementId: string;
  targetType: string;
  targetId: string;
  reviewerId: string;
  reviewerName: string;
  comment: string;
  requiredAction?: string;
}): Promise<ReviewComment> {
  const rc = await prisma.auditReviewComment.create({
    data: {
      engagementId: data.engagementId,
      targetType: data.targetType,
      targetId: data.targetId,
      reviewerId: data.reviewerId,
      reviewerName: data.reviewerName,
      comment: data.comment,
      requiredAction: data.requiredAction ?? "none",
      status: "open",
    },
  });
  return toReviewComment(rc);
}

export async function updateReviewCommentStatus(
  id: string,
  status: string,
  resolution?: string,
): Promise<ReviewComment> {
  const rc = await prisma.auditReviewComment.update({
    where: { id },
    data: {
      status,
      resolution: resolution ?? null,
      resolvedAt: status === "resolved" ? new Date() : undefined,
    },
  });
  return toReviewComment(rc);
}

// ─── Approval Records CRUD ───

export async function createApprovalRecord(data: {
  engagementId: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  action: string;
  rationale?: string;
  targetType: string;
  targetId: string;
}): Promise<ApprovalRecord> {
  const ar = await prisma.auditApprovalRecord.create({
    data: {
      engagementId: data.engagementId,
      approverId: data.approverId,
      approverName: data.approverName,
      approverRole: data.approverRole,
      action: data.action,
      rationale: data.rationale ?? null,
      targetType: data.targetType,
      targetId: data.targetId,
    },
  });
  return toApprovalRecord(ar);
}

export async function updateEngagementStatus(
  id: string,
  status: string,
): Promise<void> {
  await prisma.auditEngagement.update({ where: { id }, data: { status } });
}

// ─── Evidence Linking ───

export async function createEvidenceLink(data: {
  evidenceId: string;
  targetType: string;
  targetId: string;
  linkType?: string;
  context?: string;
  createdBy?: string;
}): Promise<EvidenceLink> {
  const link = await prisma.auditEvidenceLink.create({
    data: {
      evidenceId: data.evidenceId,
      targetType: data.targetType,
      targetId: data.targetId,
      linkType: data.linkType ?? "supports",
      context: data.context ?? null,
      createdBy: data.createdBy ?? null,
    },
  });
  return toEvidenceLink(link);
}

export async function getEvidenceLinksForEvidence(
  evidenceId: string,
): Promise<EvidenceLink[]> {
  const links = await prisma.auditEvidenceLink.findMany({
    where: { evidenceId },
  });
  return links.map(toEvidenceLink);
}

export async function getEvidenceLinksForTarget(
  targetType: string,
  targetId: string,
): Promise<EvidenceLink[]> {
  const links = await prisma.auditEvidenceLink.findMany({
    where: { targetType, targetId },
  });
  return links.map(toEvidenceLink);
}

export async function updateDisclosureNote(
  id: string,
  data: {
    content?: string;
    status?: string;
    missingInformation?: string[];
    aiDrafted?: boolean;
    linkedStatementLine?: string;
  },
): Promise<DisclosureNote | null> {
  try {
    const note = await prisma.auditDisclosureNote.update({
      where: { id },
      data: {
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.missingInformation !== undefined
          ? { missingInformation: data.missingInformation }
          : {}),
        ...(data.aiDrafted !== undefined ? { aiDrafted: data.aiDrafted } : {}),
        ...(data.linkedStatementLine !== undefined
          ? { linkedStatementLine: data.linkedStatementLine }
          : {}),
      },
    });
    const reviewComments = await prisma.auditReviewComment.findMany({
      where: {
        engagementId: note.engagementId,
        targetType: "note",
        targetId: note.id,
      },
    });
    return toDisclosureNote(note, reviewComments.map(toReviewComment));
  } catch (error) {
    console.warn(`[AuditDB] updateDisclosureNote(${id}) error`, error);
    return null;
  }
}

export async function createDisclosureNote(data: {
  engagementId: string;
  noteNumber: string;
  title: string;
  noteType: string;
  content: string;
  linkedStatementLine?: string;
  missingInformation?: string[];
  aiDrafted?: boolean;
}): Promise<DisclosureNote> {
  const note = await prisma.auditDisclosureNote.create({
    data: {
      engagementId: data.engagementId,
      noteNumber: data.noteNumber,
      title: data.title,
      noteType: data.noteType,
      content: data.content,
      linkedStatementLine: data.linkedStatementLine ?? null,
      missingInformation: data.missingInformation ?? [],
      aiDrafted: data.aiDrafted ?? false,
      status: "draft",
    },
  });
  return toDisclosureNote(note, []);
}

// ─── Pilot Feedback ───

function toPilotFeedback(f: {
  id: string;
  engagementId: string;
  title: string;
  description: string;
  source: string;
  category: string;
  severity: string;
  status: string;
  decision: string | null;
  owner: string | null;
  nextAction: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): PilotFeedback {
  return {
    id: f.id,
    engagementId: f.engagementId,
    title: f.title,
    description: f.description,
    source: f.source,
    category: f.category,
    severity: f.severity,
    status: f.status,
    decision: f.decision ?? undefined,
    owner: f.owner ?? undefined,
    nextAction: f.nextAction ?? undefined,
    createdBy: f.createdBy,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}

function toProductionBlocker(b: {
  id: string;
  engagementId: string | null;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  requiredBefore: string;
  owner: string | null;
  resolutionPlan: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): ProductionBlocker {
  return {
    id: b.id,
    engagementId: b.engagementId ?? undefined,
    title: b.title,
    description: b.description,
    category: b.category,
    severity: b.severity,
    status: b.status,
    requiredBefore: b.requiredBefore,
    owner: b.owner ?? undefined,
    resolutionPlan: b.resolutionPlan ?? undefined,
    createdBy: b.createdBy,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

function toPilotSignoff(s: {
  id: string;
  engagementId: string;
  checklistItem: string;
  status: string;
  signedBy: string | null;
  signedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): PilotSignoff {
  return {
    id: s.id,
    engagementId: s.engagementId,
    checklistItem: s.checklistItem,
    status: s.status,
    signedBy: s.signedBy ?? undefined,
    signedAt: s.signedAt?.toISOString() ?? undefined,
    notes: s.notes ?? undefined,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export async function createPilotFeedback(data: {
  engagementId: string;
  title: string;
  description: string;
  source: string;
  category: string;
  severity?: string;
  createdBy: string;
}): Promise<PilotFeedback> {
  const fb = await prisma.pilotFeedback.create({
    data: { ...data, severity: data.severity ?? "medium", status: "open" },
  });
  return toPilotFeedback(fb);
}

export async function updatePilotFeedbackStatus(
  id: string,
  status: string,
  decision?: string,
  owner?: string,
  nextAction?: string,
): Promise<PilotFeedback | null> {
  try {
    const fb = await prisma.pilotFeedback.update({
      where: { id },
      data: {
        status,
        decision: decision ?? null,
        owner: owner ?? null,
        nextAction: nextAction ?? null,
      },
    });
    return toPilotFeedback(fb);
  } catch {
    return null;
  }
}

export async function getPilotFeedback(
  engagementId: string,
): Promise<PilotFeedback[]> {
  try {
    const items = await prisma.pilotFeedback.findMany({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
    });
    return items.map(toPilotFeedback);
  } catch (error) {
    protectedAuditReadUnavailable(`getPilotFeedback(${engagementId})`, error);
  }
}

export async function createProductionBlocker(data: {
  engagementId?: string;
  title: string;
  description: string;
  category: string;
  severity?: string;
  requiredBefore?: string;
  createdBy: string;
}): Promise<ProductionBlocker> {
  const b = await prisma.productionBlocker.create({
    data: {
      ...data,
      engagementId: data.engagementId ?? null,
      severity: data.severity ?? "critical",
      requiredBefore: data.requiredBefore ?? "production",
      status: "open",
    },
  });
  return toProductionBlocker(b);
}

export async function updateProductionBlockerStatus(
  id: string,
  status: string,
  owner?: string,
  resolutionPlan?: string,
): Promise<ProductionBlocker | null> {
  try {
    const b = await prisma.productionBlocker.update({
      where: { id },
      data: {
        status,
        owner: owner ?? null,
        resolutionPlan: resolutionPlan ?? null,
      },
    });
    return toProductionBlocker(b);
  } catch {
    return null;
  }
}

export async function getProductionBlockers(
  engagementId?: string,
): Promise<ProductionBlocker[]> {
  try {
    const where = engagementId ? { engagementId } : {};
    const items = await prisma.productionBlocker.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return items.map(toProductionBlocker);
  } catch (error) {
    protectedAuditReadUnavailable(
      `getProductionBlockers(${engagementId ?? "all"})`,
      error,
    );
  }
}

export async function createOrUpdatePilotSignoff(data: {
  engagementId: string;
  checklistItem: string;
  status: string;
  signedBy?: string;
  notes?: string;
}): Promise<PilotSignoff> {
  const existing = await prisma.pilotSignoff.findUnique({
    where: {
      engagementId_checklistItem: {
        engagementId: data.engagementId,
        checklistItem: data.checklistItem,
      },
    },
  });
  if (existing) {
    const s = await prisma.pilotSignoff.update({
      where: { id: existing.id },
      data: {
        status: data.status,
        signedBy: data.signedBy ?? null,
        signedAt: data.status === "approved" ? new Date() : null,
        notes: data.notes ?? null,
      },
    });
    return toPilotSignoff(s);
  }
  const s = await prisma.pilotSignoff.create({
    data: {
      engagementId: data.engagementId,
      checklistItem: data.checklistItem,
      status: data.status,
      signedBy: data.signedBy ?? null,
      signedAt: data.status === "approved" ? new Date() : null,
      notes: data.notes ?? null,
    },
  });
  return toPilotSignoff(s);
}

export async function getPilotSignoffChecklist(
  engagementId: string,
): Promise<PilotSignoff[]> {
  try {
    const items = await prisma.pilotSignoff.findMany({
      where: { engagementId },
      orderBy: { createdAt: "asc" },
    });
    return items.map(toPilotSignoff);
  } catch (error) {
    protectedAuditReadUnavailable(
      `getPilotSignoffChecklist(${engagementId})`,
      error,
    );
  }
}

export async function getAuditUsers(
  organizationId?: string,
): Promise<AuditUser[]> {
  try {
    const users = await prisma.auditUser.findMany({
      where: organizationId ? { organizationId } : {},
      orderBy: { name: "asc" },
    });
    if (users.length === 0) return [];
    return users.map(toAuditUser);
  } catch (error) {
    protectedAuditReadUnavailable("getAuditUsers", error);
  }
}

export async function publishEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<{ package: PublicationPackage | null }> {
  try {
    let pkg = await prisma.auditPublicationPackage.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
    });
    if (!pkg) {
      pkg = await prisma.auditPublicationPackage.create({
        data: { engagementId, status: "published" },
      });
    }
    if (pkg.status === "published" || pkg.status === "locked") {
      throw new Error("Engagement is already published or locked");
    }
    const now = new Date();
    await prisma.auditPublicationPackage.update({
      where: { id: pkg.id },
      data: {
        status: "published",
        publishedAt: now,
        publishedBy: actorId,
        lockedAt: now,
      },
    });
    const safeStatuses = [
      "approved",
      "in_progress",
      "under_review",
      "ready_for_approval",
    ];
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: engagementId },
      select: { status: true },
    });
    if (engagement && safeStatuses.includes(engagement.status)) {
      await prisma.auditEngagement.update({
        where: { id: engagementId },
        data: { status: "published" },
      });
    }
    await recordAuditOsAuditEvent({
      engagementId,
      eventType: "publication.published",
      actorId,
      actorName,
      actorRole: "partner",
      targetType: "publication_package",
      targetId: pkg.id,
      newState: "published",
      description: `Engagement published by ${actorName}`,
    });
    const result = await getPublicationPackage(engagementId);
    return { package: result };
  } catch (error) {
    console.warn(`[AuditDB] publishEngagement(${engagementId}) error`, error);
    throw error;
  }
}

export async function archiveEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<void> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { status: true },
  });
  if (!engagement) throw new Error("Engagement not found");
  if (engagement.status === "archived")
    throw new Error("Engagement is already archived");

  await prisma.auditEngagement.update({
    where: { id: engagementId },
    data: { status: "archived" },
  });
  await recordAuditOsAuditEvent({
    engagementId,
    eventType: "engagement.archived",
    actorId,
    actorName,
    actorRole: "admin",
    targetType: "engagement",
    targetId: engagementId,
    previousState: engagement.status,
    newState: "archived",
    description: `Engagement archived by ${actorName}`,
  });
}

export async function restoreEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<string> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { status: true },
  });
  if (!engagement) throw new Error("Engagement not found");
  if (engagement.status !== "archived")
    throw new Error("Engagement is not archived");

  const lastArchive = await prisma.auditEvent.findFirst({
    where: { engagementId, eventType: "engagement.archived" },
    orderBy: { timestamp: "desc" },
    select: { previousState: true },
  });
  const restoreStatus =
    lastArchive?.previousState &&
    lastArchive.previousState !== "archived"
      ? lastArchive.previousState
      : "published";

  await prisma.auditEngagement.update({
    where: { id: engagementId },
    data: { status: restoreStatus },
  });
  await recordAuditOsAuditEvent({
    engagementId,
    eventType: "engagement.restored",
    actorId,
    actorName,
    actorRole: "admin",
    targetType: "engagement",
    targetId: engagementId,
    previousState: "archived",
    newState: restoreStatus,
    description: `Engagement restored by ${actorName}`,
  });
  return restoreStatus;
}
