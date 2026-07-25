/**
 * Audit Services — AI domain
 *
 * AI suggestions, drafts, acceptance, notes generation.
 */

// Phase 3B: AI abstraction wiring — imports handlers to register them on deterministicProvider
import "@/lib/core/ai/handlers/register-handlers";
import { runGovernedAuditAITask } from "@/lib/audit/audit-ai-bridge";
import type {
  AIAssistanceOutput,
  DisclosureNote,
  Finding,
  Recommendation,
  EvidenceObject,
  ReviewComment,
} from "@/types/audit";
import * as mock from "../mock-data";
import { getDb, tryDb, type AuditAIActorContext } from "./common";

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
