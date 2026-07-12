"use server";

import {
  createAIOutput as svcCreateAIOutput,
  updateAIOutputStatus as svcUpdateAIOutputStatus,
  generateDraftNotes as svcGenerateDraftNotes,
  acceptDraftNote as svcAcceptDraftNote,
  generateEvidenceSuggestions as svcGenerateEvidenceSuggestions,
  acceptEvidenceSuggestion as svcAcceptEvidenceSuggestion,
  generateFindingDrafts as svcGenerateFindingDrafts,
  acceptFindingDraft as svcAcceptFindingDraft,
  generateRecommendationDrafts as svcGenerateRecommendationDrafts,
  acceptRecommendationDraft as svcAcceptRecommendationDraft,
  generateAnalyticalReview as svcGenerateAnalyticalReview,
  recordAuditEvent as svcRecordAuditEvent,
} from "@/lib/audit/services";
import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import { enforceAuditRateLimit } from "@/lib/audit/rate-limit";

export async function createAIOutputAction(params: {
  engagementId: string;
  suggestionType: string;
  inputContext?: string;
  outputContent: string;
  confidence?: number;
  modelVersion?: string;
  sourceEntityType?: string;
  sourceEntityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(params.engagementId, actor);
  const aiOutput = await svcCreateAIOutput(params);
  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType: "ai.output_generated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "ai_output",
    targetId: aiOutput.id,
    newState: "suggested",
    description: `AI ${params.suggestionType} generated`,
    aiRelated: true,
    metadata: {
      suggestionType: params.suggestionType,
      sourceEntityType: params.sourceEntityType,
      sourceEntityId: params.sourceEntityId,
    },
  });
  return aiOutput;
}

export async function updateAIOutputStatusAction(id: string, status: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  const aiOutput = await svcUpdateAIOutputStatus(id, status, actor.actorId);
  if (aiOutput) {
    await svcRecordAuditEvent({
      engagementId: aiOutput.engagementId,
      eventType:
        status === "accepted_by_human"
          ? "ai.output_accepted"
          : "ai.output_rejected",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "ai_output",
      targetId: aiOutput.id,
      newState: status,
      description: `AI ${aiOutput.suggestionType} ${status === "accepted_by_human" ? "accepted" : "rejected"} by human`,
      aiRelated: true,
    });
  }
  return aiOutput;
}

export async function generateEvidenceSuggestionsAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "generate_ai", "ai_generate");
  const aiOutputs = await svcGenerateEvidenceSuggestions(engagementId, {
    userId: actor.actorId,
    userRole: actor.actorRole,
  });
  await enforceAuditRateLimit(actor, "generate_ai", "ai_generate");
  for (const ai of aiOutputs) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "ai.output_generated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "ai_output",
      targetId: ai.id,
      newState: "suggested",
      description: `AI evidence suggestion: ${ai.suggestionType}`,
      aiRelated: true,
      metadata: { suggestionType: "evidence_suggestion" },
    });
  }
  return aiOutputs;
}

export async function acceptEvidenceSuggestionAction(
  aiOutputId: string,
  engagementId: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(engagementId, actor);
  const result = await svcAcceptEvidenceSuggestion(aiOutputId, engagementId);
  if (result.aiOutput && result.evidence) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "evidence.created",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "evidence",
      targetId: result.evidence.id,
      newState: "missing",
      description: `Evidence request created from AI suggestion: ${result.evidence.filename}`,
      aiRelated: true,
      metadata: { aiOutputId, evidenceId: result.evidence.id },
    });
  }
  return result;
}

export async function generateFindingDraftsAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "generate_ai", "ai_generate");
  const aiOutputs = await svcGenerateFindingDrafts(engagementId, {
    userId: actor.actorId,
    userRole: actor.actorRole,
  });
  for (const ai of aiOutputs) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "ai.finding_draft_generated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "ai_output",
      targetId: ai.id,
      newState: "suggested",
      description: `AI finding draft generated: ${ai.suggestionType}`,
      aiRelated: true,
      metadata: { suggestionType: "finding" },
    });
  }
  return aiOutputs;
}

export async function acceptFindingDraftAction(
  aiOutputId: string,
  engagementId: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(engagementId, actor);
  const result = await svcAcceptFindingDraft(aiOutputId, engagementId);
  if (result.aiOutput && result.finding) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "ai.finding_draft_accepted",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "finding",
      targetId: result.finding.id,
      newState: "draft",
      description: `AI finding draft accepted: ${result.finding.title}`,
      aiRelated: true,
      metadata: { aiOutputId, findingId: result.finding.id },
    });
  }
  return result;
}

export async function generateRecommendationDraftsAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "generate_ai", "ai_generate");
  const aiOutputs = await svcGenerateRecommendationDrafts(engagementId, {
    userId: actor.actorId,
    userRole: actor.actorRole,
  });
  for (const ai of aiOutputs) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "ai.recommendation_draft_generated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "ai_output",
      targetId: ai.id,
      newState: "suggested",
      description: `AI recommendation draft generated`,
      aiRelated: true,
      metadata: { suggestionType: "recommendation" },
    });
  }
  return aiOutputs;
}

export async function acceptRecommendationDraftAction(
  aiOutputId: string,
  engagementId: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(engagementId, actor);
  const result = await svcAcceptRecommendationDraft(aiOutputId, engagementId);
  if (result.aiOutput && result.recommendation) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "ai.recommendation_draft_accepted",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "recommendation",
      targetId: result.recommendation.id,
      newState: "draft",
      description: `AI recommendation draft accepted`,
      aiRelated: true,
      metadata: { aiOutputId, recommendationId: result.recommendation.id },
    });
  }
  return result;
}

export async function generateDraftNotesAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "generate_ai", "ai_generate");
  const aiOutputs = await svcGenerateDraftNotes(engagementId, {
    userId: actor.actorId,
    userRole: actor.actorRole,
  });
  for (const ai of aiOutputs) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "ai.notes_draft_generated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "ai_output",
      targetId: ai.id,
      newState: "suggested",
      description: `AI draft note generated: ${ai.suggestionType}`,
      aiRelated: true,
      metadata: { suggestionType: ai.suggestionType },
    });
  }
  return aiOutputs;
}

export async function acceptDraftNoteAction(
  aiOutputId: string,
  noteContent: string,
  engagementId: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(engagementId, actor);
  const result = await svcAcceptDraftNote(
    aiOutputId,
    noteContent,
    engagementId,
  );
  if (result.aiOutput && result.note) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "ai.notes_draft_accepted",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "disclosure_note",
      targetId: result.note.id,
      newState: "draft",
      description: `AI draft note accepted: ${result.note.title}`,
      aiRelated: true,
      metadata: { aiOutputId, noteId: result.note.id },
    });
  }
  return result;
}

export async function rejectDraftNoteAction(
  aiOutputId: string,
  engagementId: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(engagementId, actor);
  const aiOutput = await svcUpdateAIOutputStatus(
    aiOutputId,
    "rejected",
    actor.actorId,
  );
  if (aiOutput) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "ai.notes_draft_rejected",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "ai_output",
      targetId: aiOutput.id,
      newState: "rejected",
      description: `AI draft note rejected: ${aiOutput.suggestionType}`,
      aiRelated: true,
    });
  }
  return aiOutput;
}

export async function updateNoteStatusAction(
  noteId: string,
  status: string,
  engagementId: string,
  comment?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  await assertEngagementAccess(engagementId, actor);
  const { updateNoteStatus } = await import("@/lib/audit/services");
  return updateNoteStatus(
    noteId,
    status,
    engagementId,
    actor.actorName,
    comment,
  );
}

export async function generateAnalyticalReviewAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "generate_ai", "ai_generate");
  const aiOutputs = await svcGenerateAnalyticalReview(engagementId, {
    userId: actor.actorId,
    userRole: actor.actorRole,
  });
  for (const ai of aiOutputs) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "ai.analytical_review_generated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "ai_output",
      targetId: ai.id,
      newState: "suggested",
      description: `AI analytical review: ${ai.suggestionType}`,
      aiRelated: true,
      metadata: { suggestionType: "analytical_review" },
    });
  }
  return aiOutputs;
}
