"use server"

import {
  createEngagement as svcCreateEngagement,
  uploadTrialBalance as svcUploadTrialBalance,
  getTraceability as svcGetTraceability,
  createEvidence as svcCreateEvidence,
  updateEvidenceState as svcUpdateEvidenceState,
  updateEvidenceStateWithEvent as svcUpdateEvidenceStateWithEvent,
  createFinding as svcCreateFinding,
  updateFindingStatus as svcUpdateFindingStatus,
  createRecommendation as svcCreateRecommendation,
  updateRecommendationStatus as svcUpdateRecommendationStatus,
  createReviewComment as svcCreateReviewComment,
  updateReviewCommentStatus as svcUpdateReviewCommentStatus,
  createApprovalRecord as svcCreateApprovalRecord,
  createAIOutput as svcCreateAIOutput,
  updateAIOutputStatus as svcUpdateAIOutputStatus,
  recordAuditEvent as svcRecordAuditEvent,
  generateDraftNotes as svcGenerateDraftNotes,
  acceptDraftNote as svcAcceptDraftNote,
  generateEvidenceSuggestions as svcGenerateEvidenceSuggestions,
  acceptEvidenceSuggestion as svcAcceptEvidenceSuggestion,
  generateFindingDrafts as svcGenerateFindingDrafts,
  acceptFindingDraft as svcAcceptFindingDraft,
  generateRecommendationDrafts as svcGenerateRecommendationDrafts,
  acceptRecommendationDraft as svcAcceptRecommendationDraft,
  generateAnalyticalReview as svcGenerateAnalyticalReview,
  createPilotFeedback as svcCreatePilotFeedback,
  updatePilotFeedbackStatus as svcUpdatePilotFeedbackStatus,
  getPilotFeedback as svcGetPilotFeedback,
  createProductionBlocker as svcCreateProductionBlocker,
  updateProductionBlockerStatus as svcUpdateProductionBlockerStatus,
  getProductionBlockers as svcGetProductionBlockers,
  createOrUpdatePilotSignoff as svcCreateOrUpdatePilotSignoff,
  getPilotSignoffChecklist as svcGetPilotSignoffChecklist,
  updateManualMapping as svcUpdateManualMapping,
} from "@/lib/audit/services"
import { linkEvidenceToEntity as svcLinkEvidenceToEntity } from "@/lib/audit/services"
import { getAuditActor, canDraft, canReview, canApprove, requireRole } from "@/lib/audit/actor-context"
import { assertEngagementAccess } from "@/lib/audit/tenant-guard"
import { enforceAuditRateLimit } from "@/lib/audit/rate-limit"
import { scanEvidenceFile } from "@/lib/audit/file-scanner"

export async function createEngagementAction(params: {
  organizationId: string; clientName: string; fiscalPeriod: string;
  engagementType: string; teamMemberIds: string[];
}) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  return svcCreateEngagement({ ...params, actorId: actor.actorId, actorName: actor.actorName })
}

export async function uploadTrialBalanceAction(
  engagementId: string, sourceFile: string,
  rows: Array<{ accountCode: string; accountName: string; debit: number; credit: number }>,
) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(engagementId, actor)
  await enforceAuditRateLimit(actor, "upload_trial_balance", "upload")
  return svcUploadTrialBalance(engagementId, sourceFile, rows, actor.actorId, actor.actorName)
}

export async function updateManualMappingAction(input: {
  engagementId: string
  mappingId: string
  canonicalAccountId: string | null
}) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(input.engagementId, actor)
  const mapping = await svcUpdateManualMapping({
    ...input,
    mappedBy: actor.actorName,
  })
  if (mapping) {
    await svcRecordAuditEvent({
      engagementId: input.engagementId,
      eventType: 'mapping.manual_updated',
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: 'account_mapping',
      targetId: mapping.id,
      newState: mapping.status,
      description: `Manual mapping updated: ${mapping.sourceAccountName} -> ${mapping.canonicalAccountName ?? 'unmapped'}`,
      metadata: { canonicalAccountId: input.canonicalAccountId ?? null },
    })
  }
  return mapping
}

export async function getTraceabilityAction(engagementId: string, targetType: string, targetId: string) {
  return svcGetTraceability(engagementId, targetType, targetId)
}

const ALLOWED_FILE_TYPES = ["pdf", "xlsx", "xls", "docx", "jpg", "jpeg", "png", "csv"]
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

export async function createEvidenceAction(params: {
  engagementId: string; filename: string; fileType: string; fileSize?: number; state?: string; uploadedBy?: string;
}) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(params.engagementId, actor)
  if (!ALLOWED_FILE_TYPES.includes(params.fileType.toLowerCase())) {
    throw new Error(`Unsupported file type: ${params.fileType}. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`)
  }
  if (params.fileSize && params.fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File too large: ${(params.fileSize / 1024 / 1024).toFixed(1)}MB. Maximum: ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`)
  }
  // File scanning
  const scanResult = await scanEvidenceFile({ filename: params.filename, fileType: params.fileType, fileSize: params.fileSize })
  if (scanResult.status === "error" || scanResult.status === "infected") {
    throw new Error(scanResult.details || "File rejected by security scanner")
  }
  const evidence = await svcCreateEvidence({ ...params, actorId: actor.actorId, actorName: actor.actorName })
  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType: 'evidence.file_scanned',
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: 'evidence',
    targetId: evidence.evidence.id,
    newState: evidence.evidence.state,
    description: `File scanned: ${params.filename} → ${scanResult.status} (${scanResult.provider})`,
    metadata: { scanStatus: scanResult.status, scanProvider: scanResult.provider, scannedAt: scanResult.scannedAt },
  })
  return evidence
}

export async function updateEvidenceStateAction(id: string, state: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer"])
  await enforceAuditRateLimit(actor, "update_evidence_state", "mutation")
  return svcUpdateEvidenceState(id, state, { userId: actor.actorId, actorName: actor.actorName })
}

export async function updateEvidenceStateWithEventAction(id: string, state: string, engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer"])
  await assertEngagementAccess(engagementId, actor)
  return svcUpdateEvidenceStateWithEvent(id, state, engagementId, actor)
}

export async function createFindingAction(params: {
  engagementId: string; title: string; findingType: string;
  severity: string; description: string; rootCause?: string; impact?: string;
}) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(params.engagementId, actor)
  return svcCreateFinding({ ...params, actorId: actor.actorId, actorName: actor.actorName })
  await enforceAuditRateLimit(actor, "create_finding", "mutation")
}

export async function updateFindingStatusAction(id: string, status: string, engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer"])
  await assertEngagementAccess(engagementId, actor)
  return svcUpdateFindingStatus(id, status, engagementId, actor.actorId)
}

export async function createRecommendationAction(params: {
  engagementId: string; findingId: string; title: string;
  description: string; recommendedAction: string; riskLevel?: string;
}) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(params.engagementId, actor)
  return svcCreateRecommendation({ ...params, actorId: actor.actorId, actorName: actor.actorName })
  await enforceAuditRateLimit(actor, "create_recommendation", "mutation")
}

export async function updateRecommendationStatusAction(id: string, status: string, engagementId: string, reviewerDecision?: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer"])
  await assertEngagementAccess(engagementId, actor)
  return svcUpdateRecommendationStatus(id, status, engagementId, reviewerDecision)
}

export async function createReviewCommentAction(params: {
  engagementId: string; targetType: string; targetId: string;
  comment: string; requiredAction?: string;
}) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer"])
  await assertEngagementAccess(params.engagementId, actor)
  return svcCreateReviewComment({ ...params, actorId: actor.actorId, actorName: actor.actorName })
  await enforceAuditRateLimit(actor, "create_review_comment", "mutation")
}

export async function updateReviewCommentStatusAction(id: string, status: string, resolution?: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer"])
  return svcUpdateReviewCommentStatus(id, status, resolution)
}

export async function createApprovalRecordAction(params: {
  engagementId: string; action: string; rationale?: string;
  targetType: string; targetId: string;
}) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "partner"])
  await assertEngagementAccess(params.engagementId, actor)
  return svcCreateApprovalRecord({ ...params, actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole })
  await enforceAuditRateLimit(actor, "create_approval", "mutation")
}

export async function linkEvidenceToEntityAction(params: {
  engagementId: string; evidenceId: string; targetType: string; targetId: string; context?: string;
}) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(params.engagementId, actor)
  return svcLinkEvidenceToEntity({ ...params, actorId: actor.actorId, actorName: actor.actorName })
}

export async function createAIOutputAction(params: {
  engagementId: string; suggestionType: string; inputContext?: string;
  outputContent: string; confidence?: number; modelVersion?: string;
  sourceEntityType?: string; sourceEntityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(params.engagementId, actor)
  const aiOutput = await svcCreateAIOutput(params)
  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType: 'ai.output_generated',
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: 'ai_output',
    targetId: aiOutput.id,
    newState: 'suggested',
    description: `AI ${params.suggestionType} generated`,
    aiRelated: true,
    metadata: { suggestionType: params.suggestionType, sourceEntityType: params.sourceEntityType, sourceEntityId: params.sourceEntityId },
  })
  return aiOutput
}

export async function updateAIOutputStatusAction(id: string, status: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer"])
  const aiOutput = await svcUpdateAIOutputStatus(id, status, actor.actorId)
  if (aiOutput) {
    await svcRecordAuditEvent({
      engagementId: aiOutput.engagementId,
      eventType: status === 'accepted_by_human' ? 'ai.output_accepted' : 'ai.output_rejected',
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: 'ai_output',
      targetId: aiOutput.id,
      newState: status,
      description: `AI ${aiOutput.suggestionType} ${status === 'accepted_by_human' ? 'accepted' : 'rejected'} by human`,
      aiRelated: true,
    })
  }
  return aiOutput
}

export async function generateEvidenceSuggestionsAction(engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(engagementId, actor)
  await enforceAuditRateLimit(actor, "generate_ai", "ai_generate")
  const aiOutputs = await svcGenerateEvidenceSuggestions(engagementId)
  await enforceAuditRateLimit(actor, "generate_ai", "ai_generate")
  for (const ai of aiOutputs) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: 'ai.output_generated',
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: 'ai_output',
      targetId: ai.id,
      newState: 'suggested',
      description: `AI evidence suggestion: ${ai.suggestionType}`,
      aiRelated: true,
      metadata: { suggestionType: 'evidence_suggestion' },
    })
  }
  return aiOutputs
}

export async function acceptEvidenceSuggestionAction(aiOutputId: string, engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(engagementId, actor)
  const result = await svcAcceptEvidenceSuggestion(aiOutputId, engagementId)
  if (result.aiOutput && result.evidence) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: 'evidence.created',
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: 'evidence',
      targetId: result.evidence.id,
      newState: 'missing',
      description: `Evidence request created from AI suggestion: ${result.evidence.filename}`,
      aiRelated: true,
      metadata: { aiOutputId, evidenceId: result.evidence.id },
    })
  }
  return result
}

export async function generateFindingDraftsAction(engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(engagementId, actor)
  await enforceAuditRateLimit(actor, "generate_ai", "ai_generate")
  const aiOutputs = await svcGenerateFindingDrafts(engagementId)
  for (const ai of aiOutputs) {
    await svcRecordAuditEvent({
      engagementId, eventType: 'ai.finding_draft_generated',
      actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
      targetType: 'ai_output', targetId: ai.id, newState: 'suggested',
      description: `AI finding draft generated: ${ai.suggestionType}`,
      aiRelated: true, metadata: { suggestionType: 'finding' },
    })
  }
  return aiOutputs
}

export async function acceptFindingDraftAction(aiOutputId: string, engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(engagementId, actor)
  const result = await svcAcceptFindingDraft(aiOutputId, engagementId)
  if (result.aiOutput && result.finding) {
    await svcRecordAuditEvent({
      engagementId, eventType: 'ai.finding_draft_accepted',
      actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
      targetType: 'finding', targetId: result.finding.id, newState: 'draft',
      description: `AI finding draft accepted: ${result.finding.title}`,
      aiRelated: true, metadata: { aiOutputId, findingId: result.finding.id },
    })
  }
  return result
}

export async function generateRecommendationDraftsAction(engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(engagementId, actor)
  await enforceAuditRateLimit(actor, "generate_ai", "ai_generate")
  const aiOutputs = await svcGenerateRecommendationDrafts(engagementId)
  for (const ai of aiOutputs) {
    await svcRecordAuditEvent({
      engagementId, eventType: 'ai.recommendation_draft_generated',
      actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
      targetType: 'ai_output', targetId: ai.id, newState: 'suggested',
      description: `AI recommendation draft generated`,
      aiRelated: true, metadata: { suggestionType: 'recommendation' },
    })
  }
  return aiOutputs
}

export async function acceptRecommendationDraftAction(aiOutputId: string, engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(engagementId, actor)
  const result = await svcAcceptRecommendationDraft(aiOutputId, engagementId)
  if (result.aiOutput && result.recommendation) {
    await svcRecordAuditEvent({
      engagementId, eventType: 'ai.recommendation_draft_accepted',
      actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
      targetType: 'recommendation', targetId: result.recommendation.id, newState: 'draft',
      description: `AI recommendation draft accepted`,
      aiRelated: true, metadata: { aiOutputId, recommendationId: result.recommendation.id },
    })
  }
  return result
}

export async function generateDraftNotesAction(engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(engagementId, actor)
  await enforceAuditRateLimit(actor, "generate_ai", "ai_generate")
  const aiOutputs = await svcGenerateDraftNotes(engagementId)
  for (const ai of aiOutputs) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: 'ai.notes_draft_generated',
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: 'ai_output',
      targetId: ai.id,
      newState: 'suggested',
      description: `AI draft note generated: ${ai.suggestionType}`,
      aiRelated: true,
      metadata: { suggestionType: ai.suggestionType },
    })
  }
  return aiOutputs
}

export async function acceptDraftNoteAction(aiOutputId: string, noteContent: string, engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(engagementId, actor)
  const result = await svcAcceptDraftNote(aiOutputId, noteContent, engagementId)
  if (result.aiOutput && result.note) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: 'ai.notes_draft_accepted',
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: 'disclosure_note',
      targetId: result.note.id,
      newState: 'draft',
      description: `AI draft note accepted: ${result.note.title}`,
      aiRelated: true,
      metadata: { aiOutputId, noteId: result.note.id },
    })
  }
  return result
}

export async function rejectDraftNoteAction(aiOutputId: string, engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator"])
  await assertEngagementAccess(engagementId, actor)
  const aiOutput = await svcUpdateAIOutputStatus(aiOutputId, 'rejected', actor.actorId)
  if (aiOutput) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: 'ai.notes_draft_rejected',
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: 'ai_output',
      targetId: aiOutput.id,
      newState: 'rejected',
      description: `AI draft note rejected: ${aiOutput.suggestionType}`,
      aiRelated: true,
    })
  }
  return aiOutput
}

export async function generateAnalyticalReviewAction(engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer"])
  await assertEngagementAccess(engagementId, actor)
  await enforceAuditRateLimit(actor, "generate_ai", "ai_generate")
  const aiOutputs = await svcGenerateAnalyticalReview(engagementId)
  for (const ai of aiOutputs) {
    await svcRecordAuditEvent({
      engagementId, eventType: 'ai.analytical_review_generated',
      actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
      targetType: 'ai_output', targetId: ai.id, newState: 'suggested',
      description: `AI analytical review: ${ai.suggestionType}`,
      aiRelated: true, metadata: { suggestionType: 'analytical_review' },
    })
  }
  return aiOutputs
}

export async function exportFinancialStatementsAction(engagementId: string) {
  const actor = await getAuditActor()
  await assertEngagementAccess(engagementId, actor)
  await enforceAuditRateLimit(actor, "export_financial_statements", "export")
  const { exportFinancialStatements } = await import("@/lib/audit/export-service")
  const pkg = await exportFinancialStatements(engagementId)
  await svcRecordAuditEvent({
    engagementId, eventType: 'export.financial_statements_generated',
    actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
    targetType: 'engagement', targetId: engagementId, newState: 'exported',
    description: `Financial statements exported (${pkg.statements.length} statements, ${pkg.notes.length} notes)`,
    metadata: { exportType: 'financial_statements', status: pkg.status },
  })
  return pkg
}

export async function exportAuditFileAction(engagementId: string) {
  const actor = await getAuditActor()
  await assertEngagementAccess(engagementId, actor)
  await enforceAuditRateLimit(actor, "export_audit_file", "export")
  const { exportAuditFile } = await import("@/lib/audit/export-service")
  const pkg = await exportAuditFile(engagementId)
  await svcRecordAuditEvent({
    engagementId, eventType: 'export.audit_file_generated',
    actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
    targetType: 'engagement', targetId: engagementId, newState: 'exported',
    description: `Audit file exported (${pkg.auditFile?.evidenceChecklist.length ?? 0} evidence items, ${pkg.auditFile?.findings.length ?? 0} findings)`,
    metadata: { exportType: 'audit_file', status: pkg.status },
  })
  return pkg
}

export async function exportBilingualAction(engagementId: string, locale: "en" | "ar") {
  const actor = await getAuditActor()
  await assertEngagementAccess(engagementId, actor)
  await enforceAuditRateLimit(actor, "export_bilingual", "export")
  const { exportBilingual } = await import("@/lib/audit/export-service")
  const pkg = await exportBilingual(engagementId, locale)
  await svcRecordAuditEvent({
    engagementId, eventType: 'export.financial_statements_generated',
    actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
    targetType: 'engagement', targetId: engagementId, newState: 'exported',
    description: `Bilingual export generated (${locale})`,
    metadata: { exportType: 'bilingual', locale },
  })
  return pkg
}

// ─── Pilot Feedback Actions ───

export async function createPilotFeedbackAction(params: {
  engagementId: string; title: string; description: string;
  source: string; category: string; severity?: string;
}) {
  const actor = await getAuditActor()
  await assertEngagementAccess(params.engagementId, actor)
  const feedback = await svcCreatePilotFeedback({ ...params, createdBy: actor.actorId })
  await svcRecordAuditEvent({
    engagementId: params.engagementId, eventType: 'pilot.feedback_created',
    actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
    targetType: 'pilot_feedback', targetId: feedback.id, newState: 'open',
    description: `Pilot feedback created: ${params.title}`,
    metadata: { category: params.category, source: params.source },
  })
  return feedback
}

export async function updatePilotFeedbackStatusAction(id: string, engagementId: string, status: string, decision?: string, owner?: string, nextAction?: string) {
  const actor = await getAuditActor()
  await assertEngagementAccess(engagementId, actor)
  const fb = await svcUpdatePilotFeedbackStatus(id, status, decision, owner, nextAction)
  if (fb) {
    await svcRecordAuditEvent({
      engagementId, eventType: 'pilot.feedback_updated',
      actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
      targetType: 'pilot_feedback', targetId: id, newState: status,
      description: `Pilot feedback updated: ${fb.title}`,
    })
  }
  return fb
}

export async function getPilotFeedbackAction(engagementId: string) {
  const actor = await getAuditActor()
  await assertEngagementAccess(engagementId, actor)
  return svcGetPilotFeedback(engagementId)
}

export async function createProductionBlockerAction(params: {
  title: string; description: string; category: string;
  severity?: string; requiredBefore?: string;
}) {
  const actor = await getAuditActor()
  const blocker = await svcCreateProductionBlocker({ ...params, createdBy: actor.actorId })
  await svcRecordAuditEvent({
    engagementId: '', eventType: 'pilot.blocker_created',
    actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
    targetType: 'production_blocker', targetId: blocker.id, newState: 'open',
    description: `Production blocker created: ${params.title}`,
  })
  return blocker
}

export async function updateProductionBlockerStatusAction(id: string, status: string, owner?: string, resolutionPlan?: string) {
  const actor = await getAuditActor()
  const b = await svcUpdateProductionBlockerStatus(id, status, owner, resolutionPlan)
  if (b) {
    await svcRecordAuditEvent({
      engagementId: '', eventType: 'pilot.blocker_updated',
      actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
      targetType: 'production_blocker', targetId: id, newState: status,
      description: `Production blocker updated: ${b.title}`,
    })
  }
  return b
}

export async function getProductionBlockersAction() {
  return svcGetProductionBlockers()
}

export async function createOrUpdatePilotSignoffAction(params: {
  engagementId: string; checklistItem: string; status: string; signedBy?: string; notes?: string;
}) {
  const actor = await getAuditActor()
  await assertEngagementAccess(params.engagementId, actor)
  const signoff = await svcCreateOrUpdatePilotSignoff({ ...params, signedBy: params.signedBy ?? actor.actorName })
  await svcRecordAuditEvent({
    engagementId: params.engagementId, eventType: 'pilot.signoff_updated',
    actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
    targetType: 'pilot_signoff', targetId: signoff.id, newState: params.status,
    description: `Pilot signoff updated: ${params.checklistItem} → ${params.status}`,
  })
  return signoff
}

export async function getPilotSignoffChecklistAction(engagementId: string) {
  const actor = await getAuditActor()
  await assertEngagementAccess(engagementId, actor)
  return svcGetPilotSignoffChecklist(engagementId)
}
