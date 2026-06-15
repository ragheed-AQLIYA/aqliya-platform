import { getMockCanonicalAccounts } from "@/lib/audit/coa/canonical-coa";
// Protected AuditOS workspace reads are database-first.
// Mock fallback is disabled by default and must be explicitly enabled.

import type {
  Engagement,
  TrialBalance,
  TrialBalanceLine,
  AccountMapping,
  ValidationRun,
  FinancialStatement,
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
  PilotFeedback,
  ProductionBlocker,
  PilotSignoff,
} from "@/types/audit";
import { classifyTrialBalanceRows } from "@/lib/tb-intelligence";
import type { PaginatedResult } from "@/lib/audit/pagination";
import { type FinancialStatementLine } from "@/types/audit";
import * as mock from "./mock-data";

// Phase 3B: AI abstraction wiring — imports handlers to register them on deterministicProvider
import "@/lib/ai/handlers/register-handlers";
import { runGovernedAuditAITask } from "@/lib/audit/audit-ai-bridge";

export type AuditAIActorContext = {
  userId?: string;
  userRole?: string;
};

const USE_DATABASE = true;
const ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK =
  process.env.AUDIT_ALLOW_MOCK_FALLBACK === "true";

const delay = (ms = 30) => new Promise((r) => setTimeout(r, ms));

async function getDb() {
  return import("./db");
}

async function tryDb<T>(
  fallback: () => Promise<T>,
  dbFn: (db: typeof import("./db")) => Promise<T>,
  label = "protected AuditOS read",
): Promise<T> {
  if (USE_DATABASE) {
    try {
      const db = await getDb();
      return await dbFn(db);
    } catch (e) {
      if (!ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK) {
        const reason = e instanceof Error ? e.message : "unknown error";
        throw new Error(
          `[AuditServices] ${label} failed. Mock fallback is disabled for protected /audit workspace. ${reason}`,
        );
      }

      console.warn(
        `[AuditServices] ${label} failed; explicit mock fallback enabled:`,
        e,
      );
    }
  }

  if (!ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK) {
    throw new Error(
      `[AuditServices] ${label} unavailable. Mock fallback is disabled for protected /audit workspace.`,
    );
  }

  await delay();
  return fallback();
}

export async function getDashboardSummary(
  organizationId?: string,
): Promise<DashboardSummary> {
  return tryDb(
    () => Promise.resolve(mock.mockDashboardSummary),
    (db) => db.getDashboardSummary(organizationId),
    "dashboard summary",
  );
}

export async function getEngagements(
  organizationId?: string,
): Promise<Engagement[]> {
  return tryDb(
    () => Promise.resolve(mock.mockDashboardSummary.engagements),
    (db) => db.getEngagements(organizationId),
    "engagement list",
  );
}

export async function getEngagement(
  organizationId: string | undefined,
  id: string,
): Promise<Engagement | null> {
  return tryDb(
    () => {
      const e = mock.mockDashboardSummary.engagements.find((e) => e.id === id);
      return Promise.resolve(e ?? null);
    },
    (db) => db.getEngagement(organizationId, id),
    `engagement ${id}`,
  );
}

export async function getEngagementWorkflowStatus(
  engagementId: string,
): Promise<WorkflowStatus> {
  return tryDb(
    async () => {
      const e = mock.mockDashboardSummary.engagements.find(
        (e) => e.id === engagementId,
      );
      return {
        currentState: e?.status ?? "setup",
        availableTransitions: ["in_progress"],
        blockingIssues: [],
        completionPercentage: 10,
      };
    },
    (db) => db.getEngagementWorkflowStatus(engagementId),
    `workflow status for ${engagementId}`,
  );
}

export async function getTrialBalance(
  engagementId: string,
): Promise<TrialBalance | null> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockTrialBalance)
        : Promise.resolve(null),
    (db) => db.getTrialBalance(engagementId),
    `trial balance for ${engagementId}`,
  );
}

export async function getTrialBalanceLines(
  engagementId: string,
): Promise<TrialBalanceLine[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockTBLines)
        : Promise.resolve([]),
    (db) => db.getTrialBalanceLines(engagementId),
  );
}

export async function getMappings(
  engagementId: string,
): Promise<AccountMapping[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockMappings)
        : Promise.resolve([]),
    (db) => db.getMappings(engagementId),
    `account mappings for ${engagementId}`,
  );
}

export async function confirmMapping(
  engagementId: string,
  mappingId: string,
): Promise<AccountMapping | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available for confirmMapping");
  });
  return db.confirmMapping(engagementId, mappingId);
}

export async function confirmAllSuggestedMappings(engagementId: string): Promise<{
  confirmedCount: number;
  mappings: AccountMapping[];
}> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available for confirmAllSuggestedMappings");
  });
  return db.confirmAllSuggestedMappings(engagementId);
}

export async function updateManualMapping(data: {
  engagementId: string;
  mappingId: string;
  canonicalAccountId: string | null;
  mappedBy?: string;
}): Promise<AccountMapping | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.updateManualMapping(data);
}

export async function getUnmappedAccounts(
  engagementId: string,
): Promise<AccountMapping[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(
            mock.mockMappings.filter((m) => m.status === "pending"),
          )
        : Promise.resolve([]),
    (db) => db.getUnmappedAccounts(engagementId),
  );
}

export async function getValidationRun(
  engagementId: string,
): Promise<ValidationRun | null> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockValidationRun)
        : Promise.resolve(null),
    (db) => db.getValidationRun(engagementId),
    `validation run for ${engagementId}`,
  );
}

export async function runValidation(
  engagementId: string,
  actorId: string,
): Promise<ValidationRun> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.runValidation(engagementId, actorId);
}

export async function disposeValidationIssue(
  issueId: string,
  action: string,
  rationale: string | undefined,
  actorId: string,
  actorName: string,
): Promise<ValidationRun | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.disposeValidationIssue(
    issueId,
    action,
    rationale,
    actorId,
    actorName,
  );
}

export async function publishEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<{ package: import("@/types/audit").PublicationPackage | null }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.publishEngagement(engagementId, actorId, actorName);
}

export async function getFinancialStatements(
  engagementId: string,
): Promise<FinancialStatement[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockFinancialStatements)
        : Promise.resolve([]),
    (db) => db.getFinancialStatements(engagementId),
    `financial statements for ${engagementId}`,
  );
}

export async function getEquityStatementLines(): Promise<
  FinancialStatementLine[]
> {
  return tryDb(
    () => Promise.resolve(mock.mockEquityStatementLines),
    (db) => db.getEquityStatementLines(),
  );
}

export async function getDisclosureNotes(
  engagementId: string,
): Promise<DisclosureNote[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockDisclosureNotesGenerated)
        : Promise.resolve([]),
    (db) => db.getDisclosureNotes(engagementId),
  );
}

export async function getEvidence(
  engagementId: string,
): Promise<EvidenceObject[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockEvidence)
        : Promise.resolve([]),
    (db) => db.getEvidence(engagementId),
  );
}

export async function getEvidencePaginated(
  engagementId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<EvidenceObject>> {
  return tryDb(
    () => {
      if (engagementId !== mock.mockEngagement.id)
        return Promise.resolve({
          items: [] as EvidenceObject[],
          total: 0,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          hasMore: false,
        });
      const page = Math.max(1, params.page ?? 1);
      const pageSize = Math.max(1, params.pageSize ?? 20);
      const skip = (page - 1) * pageSize;
      const items = mock.mockEvidence.slice(skip, skip + pageSize);
      return Promise.resolve({
        items,
        total: mock.mockEvidence.length,
        page,
        pageSize,
        hasMore: page * pageSize < mock.mockEvidence.length,
      });
    },
    (db) => db.getEvidencePaginated(engagementId, params),
  );
}

export async function getMissingEvidence(
  engagementId: string,
): Promise<EvidenceObject[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(
            mock.mockEvidence.filter((e) => e.state === "missing"),
          )
        : Promise.resolve([]),
    (db) => db.getMissingEvidence(engagementId),
  );
}

export async function getFindings(engagementId: string): Promise<Finding[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockFindings)
        : Promise.resolve([]),
    (db) => db.getFindings(engagementId),
  );
}

export async function getFindingsPaginated(
  engagementId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<Finding>> {
  return tryDb(
    () => {
      if (engagementId !== mock.mockEngagement.id)
        return Promise.resolve({
          items: [] as Finding[],
          total: 0,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          hasMore: false,
        });
      const page = Math.max(1, params.page ?? 1);
      const pageSize = Math.max(1, params.pageSize ?? 20);
      const skip = (page - 1) * pageSize;
      const items = mock.mockFindings.slice(skip, skip + pageSize);
      return Promise.resolve({
        items,
        total: mock.mockFindings.length,
        page,
        pageSize,
        hasMore: page * pageSize < mock.mockFindings.length,
      });
    },
    (db) => db.getFindingsPaginated(engagementId, params),
  );
}

export async function getFinding(
  engagementId: string,
  findingId: string,
): Promise<Finding | null> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(
            mock.mockFindings.find((f) => f.id === findingId) ?? null,
          )
        : Promise.resolve(null),
    (db) => db.getFinding(engagementId, findingId),
  );
}

export async function getRecommendations(
  engagementId: string,
): Promise<Recommendation[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockRecommendations)
        : Promise.resolve([]),
    (db) => db.getRecommendations(engagementId),
  );
}

export async function getRecommendationsPaginated(
  engagementId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<Recommendation>> {
  return tryDb(
    () => {
      if (engagementId !== mock.mockEngagement.id)
        return Promise.resolve({
          items: [] as Recommendation[],
          total: 0,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          hasMore: false,
        });
      const page = Math.max(1, params.page ?? 1);
      const pageSize = Math.max(1, params.pageSize ?? 20);
      const skip = (page - 1) * pageSize;
      const items = mock.mockRecommendations.slice(skip, skip + pageSize);
      return Promise.resolve({
        items,
        total: mock.mockRecommendations.length,
        page,
        pageSize,
        hasMore: page * pageSize < mock.mockRecommendations.length,
      });
    },
    (db) => db.getRecommendationsPaginated(engagementId, params),
  );
}

export async function getRecommendation(
  engagementId: string,
  recId: string,
): Promise<Recommendation | null> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(
            mock.mockRecommendations.find((r) => r.id === recId) ?? null,
          )
        : Promise.resolve(null),
    (db) => db.getRecommendation(engagementId, recId),
  );
}

export async function getReviewComments(
  engagementId: string,
): Promise<ReviewComment[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockReviewComments)
        : Promise.resolve([]),
    (db) => db.getReviewComments(engagementId),
  );
}

export async function getOpenReviewCount(
  engagementId: string,
): Promise<number> {
  return tryDb(
    () =>
      Promise.resolve(
        mock.mockReviewComments.filter((c) => c.status === "open").length,
      ),
    (db) => db.getOpenReviewCount(engagementId),
  );
}

export async function getApprovalRecords(
  engagementId: string,
): Promise<ApprovalRecord[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockApprovalRecords)
        : Promise.resolve([]),
    (db) => db.getApprovalRecords(engagementId),
  );
}

export async function getApprovalStatus(engagementId: string): Promise<{
  status: string;
  blockingIssues: readonly string[];
  checklist: Array<{ label: string; passed: boolean; detail: string }>;
}> {
  const db = await getDb();
  return db.getApprovalStatus(engagementId);
}

export async function getPublicationPackage(
  engagementId: string,
): Promise<PublicationPackage | null> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockPublicationPackage)
        : Promise.resolve(null),
    (db) => db.getPublicationPackage(engagementId),
  );
}

export async function getAuditEvents(
  engagementId: string,
): Promise<AuditEvent[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockAuditEvents)
        : Promise.resolve([]),
    (db) => db.getAuditEvents(engagementId),
  );
}

export async function getAISuggestions(
  engagementId: string,
  suggestionType?: string,
): Promise<AIAssistanceOutput[]> {
  return tryDb(
    () => {
      let results = mock.mockAiOutputs;
      if (suggestionType)
        results = results.filter((a) => a.suggestionType === suggestionType);
      return Promise.resolve(
        engagementId === mock.mockEngagement.id ? results : [],
      );
    },
    (db) => db.getAISuggestions(engagementId, suggestionType),
  );
}

export async function acceptAISuggestion(
  suggestionId: string,
  userId: string,
): Promise<void> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available for acceptAISuggestion");
  });
  return db.acceptAISuggestion(suggestionId, userId);
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
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.createAIOutput(data);
}

export async function generateDraftNotes(
  engagementId: string,
  actor?: AuditAIActorContext,
): Promise<AIAssistanceOutput[]> {
  return runGovernedAuditAITask(engagementId, "notes_generation", actor);
}

export async function generateEvidenceSuggestions(
  engagementId: string,
  actor?: AuditAIActorContext,
): Promise<AIAssistanceOutput[]> {
  return runGovernedAuditAITask(engagementId, "evidence_review", actor);
}

export async function acceptEvidenceSuggestion(
  aiOutputId: string,
  engagementId: string,
): Promise<{
  aiOutput: AIAssistanceOutput | null;
  evidence: EvidenceObject | null;
}> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const aiOutput = await db.updateAIOutputStatus(
    aiOutputId,
    "accepted_by_human",
  );
  if (!aiOutput) return { aiOutput: null, evidence: null };
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(aiOutput.outputContent);
  } catch {
    parsed = { filename: `evidence-${Date.now()}.pdf` };
  }
  const filename = (parsed.filename as string) ?? `evidence-${Date.now()}.pdf`;
  const evidence = await db.createEvidence({
    engagementId,
    filename,
    fileType: "pdf",
    state: "missing",
  });
  return { aiOutput, evidence };
}

export async function acceptDraftNote(
  aiOutputId: string,
  noteContent: string,
  engagementId: string,
): Promise<{
  aiOutput: AIAssistanceOutput | null;
  note: DisclosureNote | null;
}> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const aiOutput = await db.updateAIOutputStatus(
    aiOutputId,
    "accepted_by_human",
  );
  if (!aiOutput) return { aiOutput: null, note: null };
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(noteContent);
  } catch {
    parsed = { content: noteContent };
  }
  const title = (parsed.title as string) ?? "AI Drafted Note";
  const noteType = (parsed.noteType as string) ?? "other";
  const content = (parsed.content as string) ?? noteContent;
  const linkedStatementLine =
    (parsed.linkedStatementLine as string) ?? undefined;
  const missingInfo = Array.isArray(parsed.missingInformation)
    ? (parsed.missingInformation as string[])
    : [];
  const noteNumber = (parsed.noteNumber as string) ?? `ai-${Date.now()}`;
  const existingNotes = await db.getDisclosureNotes(engagementId);
  const existingNote = existingNotes.find(
    (n) => n.title.toLowerCase() === (title as string).toLowerCase(),
  );
  let note: DisclosureNote | null = null;
  if (existingNote) {
    note = await db.updateDisclosureNote(existingNote.id, {
      content,
      status: "draft",
      aiDrafted: true,
      missingInformation: missingInfo,
      linkedStatementLine,
    });
  } else {
    note = await db.createDisclosureNote({
      engagementId,
      noteNumber,
      title,
      noteType,
      content,
      linkedStatementLine,
      missingInformation: missingInfo,
      aiDrafted: true,
    });
  }
  return { aiOutput, note };
}

export async function updateNoteStatus(
  noteId: string,
  status: string,
  engagementId: string,
  reviewerName?: string,
  comment?: string,
): Promise<{
  note: DisclosureNote | null;
  reviewComment: ReviewComment | null;
}> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const note = await db.updateDisclosureNote(noteId, { status });
  let reviewComment: ReviewComment | null = null;
  if (comment && note) {
    reviewComment = await db.createReviewComment({
      engagementId,
      targetType: "note",
      targetId: noteId,
      reviewerId: "system",
      reviewerName: reviewerName ?? "Reviewer",
      comment,
      requiredAction:
        status === "needs_info"
          ? "provide_evidence"
          : status === "rejected"
            ? "revise"
            : "none",
    });
  }
  if (note) {
    await db.recordAuditEvent({
      engagementId,
      eventType: "note.status_changed",
      actorId: "system",
      actorName: reviewerName ?? "Reviewer",
      actorRole: "reviewer",
      targetType: "disclosure_note",
      targetId: noteId,
      newState: status,
      description: `Note "${note.title}" status changed to ${status}${comment ? ` — ${comment.substring(0, 80)}` : ""}`,
    });
  }
  return { note, reviewComment };
}

export async function getAIOutputsForEntity(
  engagementId: string,
  sourceEntityType: string,
  sourceEntityId: string,
): Promise<AIAssistanceOutput[]> {
  return tryDb(
    () =>
      Promise.resolve(
        mock.mockAiOutputs.filter((a) => a.engagementId === engagementId),
      ),
    (db) =>
      db.getAIOutputsForEntity(engagementId, sourceEntityType, sourceEntityId),
  );
}

export async function updateAIOutputStatus(
  id: string,
  status: string,
  userId?: string,
): Promise<AIAssistanceOutput | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.updateAIOutputStatus(id, status, userId);
}

export async function generateFindingDrafts(
  engagementId: string,
  actor?: AuditAIActorContext,
): Promise<AIAssistanceOutput[]> {
  return runGovernedAuditAITask(engagementId, "audit_findings", actor);
}

export async function acceptFindingDraft(
  aiOutputId: string,
  engagementId: string,
): Promise<{ aiOutput: AIAssistanceOutput | null; finding: Finding | null }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const aiOutput = await db.updateAIOutputStatus(
    aiOutputId,
    "accepted_by_human",
  );
  if (!aiOutput) return { aiOutput: null, finding: null };
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(aiOutput.outputContent);
  } catch {
    return { aiOutput, finding: null };
  }
  const finding = await db.createFinding({
    engagementId,
    title: (parsed.title as string) ?? "AI Draft Finding",
    findingType: (parsed.findingType as string) ?? "observation",
    severity: (parsed.severity as string) ?? "low",
    description: (parsed.description as string) ?? aiOutput.outputContent,
    rootCause: (parsed.rootCause as string) ?? undefined,
    impact: (parsed.impact as string) ?? undefined,
    materiality: (parsed.materiality as string) ?? "immaterial",
    aiSuggested: true,
  });
  return { aiOutput, finding };
}

export async function generateRecommendationDrafts(
  engagementId: string,
  actor?: AuditAIActorContext,
): Promise<AIAssistanceOutput[]> {
  return runGovernedAuditAITask(engagementId, "approval_review", actor);
}

export async function generateAnalyticalReview(
  engagementId: string,
  actor?: AuditAIActorContext,
): Promise<AIAssistanceOutput[]> {
  const result = await runGovernedAuditAITask(
    engagementId,
    "trial_balance_upload",
    actor,
  );
  return result;
}

export async function acceptRecommendationDraft(
  aiOutputId: string,
  engagementId: string,
): Promise<{
  aiOutput: AIAssistanceOutput | null;
  recommendation: Recommendation | null;
}> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const aiOutput = await db.updateAIOutputStatus(
    aiOutputId,
    "accepted_by_human",
  );
  if (!aiOutput) return { aiOutput: null, recommendation: null };
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(aiOutput.outputContent);
  } catch {
    return { aiOutput, recommendation: null };
  }
  const recommendation = await db.createRecommendation({
    engagementId,
    findingId: (parsed.findingId as string) ?? "",
    title: (parsed.title as string) ?? "AI Draft Recommendation",
    description: (parsed.description as string) ?? aiOutput.outputContent,
    recommendedAction: (parsed.recommendedAction as string) ?? "",
    riskLevel: (parsed.riskLevel as string) ?? "medium",
    aiContributed: true,
  });
  return { aiOutput, recommendation };
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
}): Promise<void> {
  const db = await getDb();
  const event = await db.recordAuditEvent(params);

  // Dual-write to PlatformAuditLog (safe mode — never blocks)
  try {
    const { writePlatformAuditLog } = await import("@/lib/platform/audit-log");
    const { getProjectByEngagementId } =
      await import("@/lib/platform/project-context");
    const { getClientWorkspaceById } =
      await import("@/lib/platform/client-workspace-context");
    const { getPlatformOrganizationById } =
      await import("@/lib/platform/platform-organization-context");

    let projectId: string | undefined;
    let workspaceId: string | undefined;
    let platformOrgId: string | undefined;

    try {
      const project = await getProjectByEngagementId(params.engagementId);
      projectId = project.projectId;
      workspaceId = project.workspaceId;
      const workspace = await getClientWorkspaceById(workspaceId);
      const platformOrg = await getPlatformOrganizationById(
        workspace.platformOrganizationId,
      );
      platformOrgId = platformOrg.platformOrganizationId;
    } catch {
      // Context resolution is best-effort
    }

    await writePlatformAuditLog({
      productKey: "audit_os",
      action: params.eventType,
      platformOrganizationId: platformOrgId,
      clientWorkspaceId: workspaceId,
      projectId,
      actorId: params.actorId,
      actorType: "user",
      actorName: params.actorName,
      targetType: params.targetType,
      targetId: params.targetId,
      severity: params.aiRelated ? "info" : "info",
      status: "recorded",
      sourceSystem: "audit_os",
      sourceModel: "AuditEvent",
      sourceId: event.id,
      metadata: {
        originalId: event.id,
        dualWrite: true,
        engagementId: params.engagementId,
        previousState: params.previousState,
        newState: params.newState,
        aiRelated: params.aiRelated,
      },
    });
  } catch {
    // Dual-write failure must never affect the primary action
  }
}

export async function getTraceability(
  engagementId: string,
  targetType: string,
  targetId: string,
) {
  return tryDb(
    () =>
      Promise.resolve({
        targetType,
        targetId,
        forwardTrace: [
          {
            type: "source_data",
            label: "Trial Balance Entry",
            status: "imported",
          },
          { type: "account", label: "Mapped Account", status: "mapped" },
          { type: "evidence", label: "Linked Evidence", status: "accepted" },
          { type: "finding", label: "Related Finding", status: "open" },
          {
            type: "recommendation",
            label: "Recommendation",
            status: "under_review",
          },
        ],
        backwardTrace: [
          { type: "publication", label: "Published Output", status: "draft" },
          { type: "approval", label: "Approval Record", status: "pending" },
        ],
      }),
    (db) => db.getTraceability(engagementId, targetType, targetId),
  );
}

export async function getFullTraceability(
  engagementId: string,
  statementLineLabel: string,
) {
  return tryDb(
    () =>
      Promise.resolve({
        targetLabel: statementLineLabel,
        nodes: [],
        message: "No traceability data available",
      }),
    (db) => db.getFullTraceability(engagementId, statementLineLabel),
  );
}

export async function getAuditUsers(organizationId?: string) {
  return tryDb(
    () => Promise.resolve(mock.mockUsers),
    (db) => db.getAuditUsers(organizationId),
  );
}

// ─── Pilot Feedback ───

export async function createPilotFeedback(data: {
  engagementId: string;
  title: string;
  description: string;
  source: string;
  category: string;
  severity?: string;
  createdBy: string;
}): Promise<PilotFeedback> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.createPilotFeedback(data);
}

export async function updatePilotFeedbackStatus(
  id: string,
  status: string,
  decision?: string,
  owner?: string,
  nextAction?: string,
): Promise<PilotFeedback | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.updatePilotFeedbackStatus(id, status, decision, owner, nextAction);
}

export async function getPilotFeedback(
  engagementId: string,
): Promise<PilotFeedback[]> {
  return tryDb(
    () => Promise.resolve([]),
    (db) => db.getPilotFeedback(engagementId),
  );
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
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.createProductionBlocker(data);
}

export async function updateProductionBlockerStatus(
  id: string,
  status: string,
  owner?: string,
  resolutionPlan?: string,
): Promise<ProductionBlocker | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.updateProductionBlockerStatus(id, status, owner, resolutionPlan);
}

export async function getProductionBlockers(
  engagementId?: string,
): Promise<ProductionBlocker[]> {
  return tryDb(
    () => Promise.resolve([]),
    (db) => db.getProductionBlockers(engagementId),
  );
}

export async function createOrUpdatePilotSignoff(data: {
  engagementId: string;
  checklistItem: string;
  status: string;
  signedBy?: string;
  notes?: string;
}): Promise<PilotSignoff> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.createOrUpdatePilotSignoff(data);
}

export async function getPilotSignoffChecklist(
  engagementId: string,
): Promise<PilotSignoff[]> {
  return tryDb(
    () => Promise.resolve([]),
    (db) => db.getPilotSignoffChecklist(engagementId),
  );
}

// ─── Write Operations ───

export async function createEngagement(params: {
  organizationId: string;
  clientName: string;
  fiscalPeriod: string;
  engagementType: string;
  teamMemberIds: string[];
  actorId?: string;
  actorName?: string;
}): Promise<{ engagement: Engagement }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available for write operations");
  });
  const client = await db.createClient({
    organizationId: params.organizationId,
    name: params.clientName,
    industry: "Other",
  });
  const team = params.teamMemberIds.map((uid) => ({
    userId: uid,
    userName: "",
    role: "operator",
    assignedAt: new Date().toISOString(),
  }));
  const engagement = await db.createEngagement({
    organizationId: params.organizationId,
    clientId: client.id,
    fiscalPeriod: params.fiscalPeriod,
    engagementType: params.engagementType,
    team,
  });
  await db.recordAuditEvent({
    engagementId: engagement.id,
    eventType: "engagement.created",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: "operator",
    targetType: "engagement",
    targetId: engagement.id,
    newState: "setup",
    description: `Engagement created for ${params.clientName} ${params.fiscalPeriod}`,
  });
  return { engagement };
}

export async function updateEngagementPresentationProfile(params: {
  organizationId: string;
  engagementId: string;
  presentationProfile: string;
  actorId: string;
  actorName: string;
  actorRole: string;
}): Promise<{
  engagement: Engagement;
  fsRebuild: import("@/lib/audit/presentation/presentation-profile-rebuild").PresentationProfileRebuildResult;
}> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available for write operations");
  });

  const existing = await db.getEngagement(params.organizationId, params.engagementId);
  if (!existing) {
    throw new Error("Engagement not found");
  }

  const { resolvePresentationProfile, presentationProfileVersionFor } =
    await import("@/lib/audit/presentation/presentation-profile");
  const { policyIdForProfile } = await import(
    "@/lib/audit/presentation/presentation-policy-resolver"
  );
  const profile = resolvePresentationProfile(params.presentationProfile);
  const version = presentationProfileVersionFor(profile);
  const policyId = policyIdForProfile(profile);

  const engagement = await db.updateEngagementPresentationProfile(
    params.engagementId,
    {
      presentationProfile: profile,
      presentationProfileVersion: version,
      presentationPolicyId: policyId,
    },
  );

  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType: "engagement.presentation_profile_updated",
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    targetType: "engagement",
    targetId: params.engagementId,
    previousState: existing.presentationProfile ?? "generic",
    newState: profile,
    description: `Presentation profile updated to ${profile} (${version})`,
    metadata: {
      presentationProfile: profile,
      presentationProfileVersion: version,
      presentationPolicyId: policyId,
    },
  });

  const { rebuildFinancialStatementsAfterProfileChange } = await import(
    "@/lib/audit/presentation/presentation-profile-rebuild"
  );
  const fsRebuild = await rebuildFinancialStatementsAfterProfileChange(
    params.engagementId,
  );

  if (fsRebuild.status === "rebuilt") {
    await db.recordAuditEvent({
      engagementId: params.engagementId,
      eventType: "engagement.presentation_profile_fs_rebuilt",
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      targetType: "engagement",
      targetId: params.engagementId,
      description: `Financial statements rebuilt after presentation profile change (${fsRebuild.method})`,
      metadata: {
        presentationProfile: profile,
        rebuildMethod: fsRebuild.method,
        statementCount: fsRebuild.statementCount,
      },
    });
  }

  return { engagement, fsRebuild };
}

export async function uploadTrialBalance(
  engagementId: string,
  sourceFile: string,
  rows: Array<{
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    classificationHints?: string[];
  }>,
  actorId?: string,
  actorName?: string,
): Promise<{ trialBalance: TrialBalance }> {
  const db = await getDb();
  const normalised = rows.map((r) => ({
    accountCode: r.accountCode,
    accountName: r.accountName,
    debitAmount: r.debit,
    creditAmount: r.credit,
    balance: r.debit - r.credit,
    accountType: classifyAccount(r.accountCode),
  }));
  const trialBalance = await db.saveTrialBalance(
    engagementId,
    sourceFile,
    normalised,
  );

  const organizationId = await db.getEngagementOrganizationId(engagementId);
  if (organizationId) {
    const classified = await classifyTrialBalanceRows(
      organizationId,
      engagementId,
      normalised.map((r, i) => ({
        accountCode: r.accountCode,
        accountName: r.accountName,
        debitAmount: r.debitAmount,
        creditAmount: r.creditAmount,
        classificationHints: rows[i]?.classificationHints,
      })),
      { enableCloudAi: true },
    );

    const mappingRows = classified
      .filter((c) => c.classification?.canonicalAccountId)
      .map((c) => ({
        accountCode: c.row.accountCode,
        accountName: c.row.accountName,
        debitAmount: c.row.debitAmount,
        creditAmount: c.row.creditAmount,
        canonicalAccountId: c.classification!.canonicalAccountId,
        confidence: c.classification!.confidence,
        source: c.classification!.source,
      }));

    const mappingCount = await db.createSuggestedMappingsForTrialBalance(
      engagementId,
      organizationId,
      mappingRows,
    );

    if (mappingCount > 0) {
      await db.recordAuditEvent({
        engagementId,
        eventType: "mapping.ai_suggested",
        actorId: actorId ?? "system",
        actorName: actorName ?? "System",
        actorRole: "operator",
        targetType: "account_mapping",
        targetId: trialBalance.id,
        newState: "pending",
        description: `AI suggested ${mappingCount} account mappings from trial balance upload`,
        aiRelated: true,
        metadata: { mappingCount, source: "tb-intelligence" },
      });
    }
  }

  await db.recordAuditEvent({
    engagementId,
    eventType: "trial_balance.uploaded",
    actorId: actorId ?? "system",
    actorName: actorName ?? "System",
    actorRole: "operator",
    targetType: "trial_balance",
    targetId: trialBalance.id,
    newState: "uploaded",
    description: `Trial balance uploaded: ${sourceFile} (${rows.length} accounts)`,
  });

  try {
    const { maybeSyncReportingGraphAfterTbUpload } = await import(
      "@/lib/audit/reporting-graph/graph-sync-service"
    );
    await maybeSyncReportingGraphAfterTbUpload(engagementId);
  } catch (graphErr) {
    console.error(
      `[AuditOS] reporting graph sync after TB upload failed for ${engagementId}`,
      graphErr,
    );
  }

  return { trialBalance };
}

// ─── Evidence Mutations ───

export async function createEvidence(params: {
  engagementId: string;
  filename: string;
  fileType: string;
  fileSize?: number;
  state?: string;
  uploadedBy?: string;
  actorId?: string;
  actorName?: string;
}): Promise<{ evidence: EvidenceObject }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const evidence = await db.createEvidence({
    engagementId: params.engagementId,
    filename: params.filename,
    fileType: params.fileType,
    fileSize: params.fileSize,
    state: params.state,
    uploadedBy: params.uploadedBy,
  });
  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType: "evidence.created",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: "operator",
    targetType: "evidence",
    targetId: evidence.id,
    newState: evidence.state,
    description: `Evidence created: ${params.filename}`,
  });
  return { evidence };
}

export async function createEvidenceWithStorage(params: {
  engagementId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  fileHash: string;
  storageKey: string;
  uploadedBy?: string;
  actorId?: string;
  actorName?: string;
}): Promise<{ evidence: EvidenceObject }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const evidence = await db.createEvidence({
    engagementId: params.engagementId,
    filename: params.filename,
    fileType: params.fileType,
    fileSize: params.fileSize,
    state: "uploaded",
    uploadedBy: params.uploadedBy,
    fileHash: params.fileHash,
    storageKey: params.storageKey,
  });
  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType: "evidence.uploaded",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: "operator",
    targetType: "evidence",
    targetId: evidence.id,
    newState: "uploaded",
    description: `Evidence uploaded: ${params.filename} (${(params.fileSize / 1024).toFixed(1)}KB, hash: ${params.fileHash.substring(0, 12)}...)`,
    metadata: {
      fileSize: params.fileSize,
      fileHash: params.fileHash.substring(0, 12),
      storageKey: params.storageKey,
    },
  });
  return { evidence };
}

/** @deprecated Use updateEvidenceStateWithEvent instead — records audit event */
export async function updateEvidenceState(
  id: string,
  state: string,
  params?: {
    userId?: string;
    actorName?: string;
  },
): Promise<{ evidence: EvidenceObject }> {
  console.warn(
    "[AuditServices] updateEvidenceState called without audit event — use updateEvidenceStateWithEvent instead",
  );
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const evidence = await db.updateEvidenceState(id, state, params?.userId);
  return { evidence };
}

export async function updateEvidenceStateWithEvent(
  id: string,
  state: string,
  engagementId: string,
  actor: { actorId: string; actorName: string; actorRole: string },
) {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const evidence = await db.updateEvidenceState(id, state, actor.actorId);
  await db.recordAuditEvent({
    engagementId,
    eventType: "evidence.state_changed",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "evidence",
    targetId: id,
    newState: state,
    description: `Evidence state changed to ${state}: ${evidence.filename}`,
  });
  return { evidence };
}

export async function updateEvidenceStorageService(
  id: string,
  data: {
    fileHash: string;
    storageKey: string;
    fileSize: number;
  },
): Promise<EvidenceObject | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.updateEvidenceStorage(id, data);
}

// ─── Findings Mutations ───

export async function createFinding(params: {
  engagementId: string;
  title: string;
  findingType: string;
  severity: string;
  description: string;
  rootCause?: string;
  impact?: string;
  materiality?: string;
  actorId?: string;
  actorName?: string;
}): Promise<{ finding: Finding }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const finding = await db.createFinding({
    engagementId: params.engagementId,
    title: params.title,
    findingType: params.findingType,
    severity: params.severity,
    description: params.description,
    rootCause: params.rootCause,
    impact: params.impact,
    materiality: params.materiality,
  });
  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType: "finding.created",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: "reviewer",
    targetType: "finding",
    targetId: finding.id,
    newState: finding.status,
    description: `Finding created: ${params.title}`,
  });
  return { finding };
}

export async function updateFindingStatus(
  id: string,
  status: string,
  engagementId: string,
  actorId?: string,
): Promise<{ finding: Finding }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const finding = await db.updateFindingStatus(id, status);
  await db.recordAuditEvent({
    engagementId,
    eventType: "finding.state_changed",
    actorId: actorId ?? "system",
    actorName: "System",
    actorRole: "reviewer",
    targetType: "finding",
    targetId: id,
    newState: status,
    description: `Finding status changed to ${status}`,
  });
  return { finding };
}

// ─── Recommendations Mutations ───

export async function createRecommendation(params: {
  engagementId: string;
  findingId: string;
  title: string;
  description: string;
  recommendedAction: string;
  riskLevel?: string;
  actorId?: string;
  actorName?: string;
}): Promise<{ recommendation: Recommendation }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const rec = await db.createRecommendation({
    engagementId: params.engagementId,
    findingId: params.findingId,
    title: params.title,
    description: params.description,
    recommendedAction: params.recommendedAction,
    riskLevel: params.riskLevel,
  });
  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType: "recommendation.created",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: "reviewer",
    targetType: "recommendation",
    targetId: rec.id,
    newState: rec.status,
    description: `Recommendation created: ${params.title}`,
  });
  return { recommendation: rec };
}

export async function updateRecommendationStatus(
  id: string,
  status: string,
  engagementId: string,
  reviewerDecision?: string,
): Promise<{ recommendation: Recommendation }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const rec = await db.updateRecommendationStatus(id, status, reviewerDecision);
  await db.recordAuditEvent({
    engagementId,
    eventType: "recommendation.state_changed",
    actorId: "system",
    actorName: "Reviewer",
    actorRole: "reviewer",
    targetType: "recommendation",
    targetId: id,
    newState: status,
    description: `Recommendation status changed to ${status}${reviewerDecision ? ": " + reviewerDecision : ""}`,
  });
  return { recommendation: rec };
}

// ─── Review Comment Mutations ───

export async function createReviewComment(params: {
  engagementId: string;
  targetType: string;
  targetId: string;
  comment: string;
  requiredAction?: string;
  actorId?: string;
  actorName?: string;
}): Promise<{ comment: ReviewComment }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const rc = await db.createReviewComment({
    engagementId: params.engagementId,
    targetType: params.targetType,
    targetId: params.targetId,
    reviewerId: params.actorId ?? "system",
    reviewerName: params.actorName ?? "System",
    comment: params.comment,
    requiredAction: params.requiredAction,
  });
  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType: "review.comment_added",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: "reviewer",
    targetType: params.targetType,
    targetId: params.targetId,
    newState: "open",
    description: `Review comment added on ${params.targetType}: ${params.comment.substring(0, 80)}`,
  });
  return { comment: rc };
}

export async function updateReviewCommentStatus(
  id: string,
  status: string,
  resolution?: string,
): Promise<{ comment: ReviewComment }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const rc = await db.updateReviewCommentStatus(id, status, resolution);
  if (status === "resolved" && rc) {
    try {
      const engagement = await (
        await prismaGlobal()
      ).auditReviewComment.findUnique({
        where: { id },
        select: { engagementId: true },
      });
      if (engagement) {
        await db.recordAuditEvent({
          engagementId: engagement.engagementId,
          eventType: "review.comment_resolved",
          actorId: "system",
          actorName: rc.reviewerName,
          actorRole: "reviewer",
          targetType: "review_comment",
          targetId: id,
          newState: status,
          description: `Review comment resolved${resolution ? ": " + resolution : ""}`,
        });
      }
    } catch (e) {
      console.warn(
        "[AuditServices] Failed to record review comment resolution event:",
        (e as Error).message,
      );
    }
  }
  return { comment: rc };
}

async function prismaGlobal() {
  return import("@/lib/prisma").then((m) => m.prisma);
}

// ─── Approval Mutations ───

export async function createApprovalRecord(params: {
  engagementId: string;
  action: string;
  rationale?: string;
  targetType: string;
  targetId: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
}): Promise<{ record: ApprovalRecord }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  if (params.action === "approved") {
    const { assertFactoryApprovalGatesPass } = await import(
      "@/lib/audit/governance"
    );
    await assertFactoryApprovalGatesPass(params.engagementId);
  }
  const ar = await db.createApprovalRecord({
    engagementId: params.engagementId,
    approverId: params.actorId ?? "system",
    approverName: params.actorName ?? "System",
    approverRole: params.actorRole ?? "reviewer",
    action: params.action,
    rationale: params.rationale,
    targetType: params.targetType,
    targetId: params.targetId,
  });
  if (params.action === "approved") {
    try {
      const { promoteFinancialStatementsOnApproval } = await import(
        "@/lib/audit/governance"
      );
      await promoteFinancialStatementsOnApproval(
        params.engagementId,
        params.actorId ?? "system",
        params.actorName ?? "System",
      );
    } catch (promoteErr) {
      console.error(
        `[AuditOS] FS promotion on approval failed for ${params.engagementId}`,
        promoteErr,
      );
    }
    try {
      const { captureReportingGraphSnapshot } = await import(
        "@/lib/audit/reporting-graph"
      );
      await captureReportingGraphSnapshot({
        engagementId: params.engagementId,
        milestone: "approval",
        actorId: params.actorId ?? "system",
        actorName: params.actorName ?? "System",
        actorRole: params.actorRole ?? "reviewer",
      });
    } catch (snapErr) {
      console.error(
        `[AuditOS] Graph snapshot on approval failed for ${params.engagementId}`,
        snapErr,
      );
    }
  }
  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType:
      params.action === "approved"
        ? "engagement.state_changed"
        : "engagement.state_changed",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: params.actorRole ?? "reviewer",
    targetType: params.targetType,
    targetId: params.targetId,
    newState: params.action === "approved" ? "approved" : "rejected",
    description: `Engagement ${params.action} by ${params.actorName ?? "System"}${params.rationale ? ": " + params.rationale : ""}`,
  });
  if (params.action === "approved") {
    await db.updateEngagementStatus(params.engagementId, "approved");
  }
  return { record: ar };
}

// ─── Evidence Linking ───

export async function linkEvidenceToEntity(params: {
  engagementId: string;
  evidenceId: string;
  targetType: string;
  targetId: string;
  context?: string;
  actorId?: string;
  actorName?: string;
}): Promise<{ link: EvidenceLink }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  const link = await db.createEvidenceLink({
    evidenceId: params.evidenceId,
    targetType: params.targetType,
    targetId: params.targetId,
    context: params.context,
    createdBy: params.actorName ?? params.actorId,
  });
  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType: "evidence.linked",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: "operator",
    targetType: params.targetType,
    targetId: params.targetId,
    newState: "linked",
    description: `Evidence linked to ${params.targetType}: ${params.targetId}`,
    metadata: {
      evidenceId: params.evidenceId,
      linkType: "supports",
      context: params.context,
    },
  });
  return { link };
}

export async function getCanonicalAccounts(
  limit?: number,
): Promise<Array<{ id: string; code: string; name: string }>> {
  return tryDb(
    () => Promise.resolve(getMockCanonicalAccounts().slice(0, limit ?? 100)),
    (db) => db.getCanonicalAccounts(limit),
  );
}

function classifyAccount(code: string): string | undefined {
  if (!code || code.length < 4) return undefined;
  const prefix = code.substring(0, 2);
  if (["10", "11", "12"].includes(prefix)) return "asset";
  if (["13", "14"].includes(prefix)) return "non-current-asset";
  if (["20", "21"].includes(prefix)) return "liability";
  if (["30", "31"].includes(prefix)) return "equity";
  if (["40", "41"].includes(prefix)) return "revenue";
  if (
    ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"].includes(
      prefix,
    )
  )
    return "expense";
  return undefined;
}

export async function archiveEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<void> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  await db.archiveEngagement(engagementId, actorId, actorName);
}

export async function restoreEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<string> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.restoreEngagement(engagementId, actorId, actorName);
}
