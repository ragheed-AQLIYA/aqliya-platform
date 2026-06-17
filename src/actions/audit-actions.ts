"use server";

import { revalidatePath } from "next/cache";
import { createEvidenceVersion } from "@/lib/audit/evidence-versioning-service";
import { evaluateEngagementArchival } from "@/lib/audit/engagement-archival";

import {
  createEngagement as svcCreateEngagement,
  uploadTrialBalance as svcUploadTrialBalance,
  getTraceability as svcGetTraceability,
  createEvidence as svcCreateEvidence,
  updateEvidenceState as svcUpdateEvidenceState,
  updateEvidenceStateWithEvent as svcUpdateEvidenceStateWithEvent,
  updateEvidenceStorageService as svcUpdateEvidenceStorage,
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
  runValidation as svcRunValidation,
  disposeValidationIssue as svcDisposeValidationIssue,
  publishEngagement as svcPublishEngagement,
  archiveEngagement as svcArchiveEngagement,
  restoreEngagement as svcRestoreEngagement,
  getEngagement as svcGetEngagement,
  getEvidence as svcGetEvidence,
  getTrialBalanceLines as svcGetTrialBalanceLines,
  updateEngagementPresentationProfile as svcUpdateEngagementPresentationProfile,
} from "@/lib/audit/services";
import {
  runSamplingEngine,
  type SamplingMethod,
  type SamplingResult,
} from "@/lib/audit/sampling";
import { linkEvidenceToEntity as svcLinkEvidenceToEntity } from "@/lib/audit/services";
import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import { enforceAuditRateLimit } from "@/lib/audit/rate-limit";
import { isScanRejected, scanEvidenceFile } from "@/lib/audit/file-scanner";
import {
  checkPublicationGovernance,
  evaluateFindingEscalation,
  evaluateEvidenceEscalation,
  getGovernanceAuditMetadata,
  buildProvenanceMetadata,
  mapFindingStatusToApprovalState,
  mapRecommendationStatusToApprovalState,
  buildEvidenceRequirementsFromEvidenceList,
} from "@/lib/audit/governance-bridge";
import { getGovernanceContext } from "@/lib/governance/retrieval-router";
import { getStorageProvider, buildStorageKey } from "@/lib/audit/storage";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { notifyOnEvent } from "@/lib/platform/notification/integration";

export async function createEngagementAction(params: {
  organizationId: string;
  clientName: string;
  fiscalPeriod: string;
  engagementType: string;
  teamMemberIds: string[];
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  const result = await svcCreateEngagement({
    ...params,
    actorId: actor.actorId,
    actorName: actor.actorName,
  });

  const engagementId = typeof result === "object" && result !== null && "id" in result
    ? (result as { id: string }).id
    : null;

  if (engagementId && params.teamMemberIds.length > 0) {
    for (const memberId of params.teamMemberIds) {
      try {
        await notifyOnEvent("on_create", params.organizationId, engagementId, {
          productKey: "audit",
          templateKey: "audit_review_assigned",
          recipientId: memberId,
          templateVars: {
            title: params.clientName,
            clientName: params.clientName,
            assignedAt: new Date().toISOString(),
          },
        });
      } catch {
        // Notification must not block the primary action
      }
    }
  }

  return result;
}

export async function uploadTrialBalanceAction(
  engagementId: string,
  sourceFile: string,
  rows: Array<{
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    classificationHints?: string[];
  }>,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "upload_trial_balance", "upload");
  return svcUploadTrialBalance(
    engagementId,
    sourceFile,
    rows,
    actor.actorId,
    actor.actorName,
  );
}

export async function updateManualMappingAction(input: {
  engagementId: string;
  mappingId: string;
  canonicalAccountId: string | null;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(input.engagementId, actor);
  const mapping = await svcUpdateManualMapping({
    ...input,
    mappedBy: actor.actorName,
  });
  if (mapping) {
    await svcRecordAuditEvent({
      engagementId: input.engagementId,
      eventType: "mapping.manual_updated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "account_mapping",
      targetId: mapping.id,
      newState: mapping.status,
      description: `Manual mapping updated: ${mapping.sourceAccountName} -> ${mapping.canonicalAccountName ?? "unmapped"}`,
      metadata: { canonicalAccountId: input.canonicalAccountId ?? null },
    });
    await svcRecordAuditEvent({
      engagementId: input.engagementId,
      eventType: "financial_statements.generated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "engagement",
      targetId: input.engagementId,
      newState: "statements_rebuilt",
      description: `Financial statements regenerated after manual mapping update`,
      metadata: {
        trigger: "manual_mapping_update",
        statementTypes: ["income_statement", "balance_sheet", "equity"],
        source: "trial_balance_mapping",
        generatedAt: new Date().toISOString(),
      },
    });
  }
  return mapping;
}

export async function getTraceabilityAction(
  engagementId: string,
  targetType: string,
  targetId: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"]);
  await assertEngagementAccess(engagementId, actor);
  return svcGetTraceability(engagementId, targetType, targetId);
}

export async function confirmMappingAction(
  engagementId: string,
  mappingId: string,
): Promise<import("@/types/audit").AccountMapping | null> {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(engagementId, actor);
  const { confirmMapping } = await import("@/lib/audit/services");
  const result = await confirmMapping(engagementId, mappingId);
  if (result) {
    const { resolveFirmMemoryOrganizationIdFromEngagement } = await import(
      "@/lib/tb-intelligence/org-resolver"
    );
    const orgId = await resolveFirmMemoryOrganizationIdFromEngagement(
      engagementId,
    );
    if (orgId && result.canonicalAccountId) {
      const { recordFirmMemoryFeedback, getClassificationHintsForAccount } =
        await import("@/lib/tb-intelligence/firm-memory");
      const classificationHints = await getClassificationHintsForAccount(
        engagementId,
        result.sourceAccountCode,
      );
      await recordFirmMemoryFeedback({
        organizationId: orgId,
        engagementId,
        clientAccountCode: result.sourceAccountCode,
        clientAccountName: result.sourceAccountName,
        suggestedCanonicalId: result.canonicalAccountId,
        acceptedCanonicalId: result.canonicalAccountId,
        wasAccepted: true,
        reviewerId: actor.actorId,
        classificationHints,
      });
    }
    await svcRecordAuditEvent({
      engagementId,
      eventType: "mapping.confirmed",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "account_mapping",
      targetId: mappingId,
      newState: "confirmed",
      description: `Mapping confirmed: ${result.sourceAccountName} → ${result.canonicalAccountName ?? "unmapped"}`,
    });
    await svcRecordAuditEvent({
      engagementId,
      eventType: "financial_statements.generated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "engagement",
      targetId: engagementId,
      newState: "statements_rebuilt",
      description: `Financial statements regenerated after mapping confirmation`,
      metadata: {
        trigger: "mapping_confirm",
        statementTypes: ["income_statement", "balance_sheet", "equity"],
        source: "trial_balance_mapping",
        generatedAt: new Date().toISOString(),
      },
    });
  }
  return result;
}

export async function bulkConfirmSuggestedMappingsAction(
  engagementId: string,
): Promise<{ confirmedCount: number }> {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(engagementId, actor);

  const { confirmAllSuggestedMappings } = await import("@/lib/audit/services");
  const { confirmedCount, mappings } =
    await confirmAllSuggestedMappings(engagementId);

  if (confirmedCount === 0) {
    return { confirmedCount: 0 };
  }

  const { resolveFirmMemoryOrganizationIdFromEngagement } = await import(
    "@/lib/tb-intelligence/org-resolver"
  );
  const orgId = await resolveFirmMemoryOrganizationIdFromEngagement(engagementId);

  if (orgId) {
    const { recordFirmMemoryFeedback, getClassificationHintsForAccount } =
      await import("@/lib/tb-intelligence/firm-memory");
    for (const result of mappings) {
      if (!result.canonicalAccountId) continue;
      const classificationHints = await getClassificationHintsForAccount(
        engagementId,
        result.sourceAccountCode,
      );
      await recordFirmMemoryFeedback({
        organizationId: orgId,
        engagementId,
        clientAccountCode: result.sourceAccountCode,
        clientAccountName: result.sourceAccountName,
        suggestedCanonicalId: result.canonicalAccountId,
        acceptedCanonicalId: result.canonicalAccountId,
        wasAccepted: true,
        reviewerId: actor.actorId,
        classificationHints,
      });
    }
  }

  await svcRecordAuditEvent({
    engagementId,
    eventType: "mapping.confirmed",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "account_mapping",
    targetId: engagementId,
    newState: "bulk_confirmed",
    description: `Bulk confirmed ${confirmedCount} suggested mappings`,
    metadata: { confirmedCount },
  });
  await svcRecordAuditEvent({
    engagementId,
    eventType: "financial_statements.generated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "engagement",
    targetId: engagementId,
    newState: "statements_rebuilt",
    description: "Financial statements regenerated after bulk mapping confirmation",
    metadata: {
      trigger: "bulk_mapping_confirm",
      confirmedCount,
      statementTypes: ["income_statement", "balance_sheet", "equity"],
      source: "trial_balance_mapping",
      generatedAt: new Date().toISOString(),
    },
  });

  return { confirmedCount };
}

const ALLOWED_FILE_TYPES = [
  "pdf",
  "xlsx",
  "xls",
  "docx",
  "jpg",
  "jpeg",
  "png",
  "csv",
];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export async function createEvidenceAction(params: {
  engagementId: string;
  filename: string;
  fileType: string;
  fileSize?: number;
  state?: string;
  uploadedBy?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(params.engagementId, actor);
  if (!ALLOWED_FILE_TYPES.includes(params.fileType.toLowerCase())) {
    throw new Error(
      `Unsupported file type: ${params.fileType}. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`,
    );
  }
  if (params.fileSize && params.fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File too large: ${(params.fileSize / 1024 / 1024).toFixed(1)}MB. Maximum: ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
    );
  }
  // File scanning
  const scanResult = await scanEvidenceFile({
    filename: params.filename,
    fileType: params.fileType,
    fileSize: params.fileSize,
  });
  if (isScanRejected(scanResult)) {
    throw new Error(scanResult.details || "File rejected by security scanner");
  }
  const evidence = await svcCreateEvidence({
    ...params,
    actorId: actor.actorId,
    actorName: actor.actorName,
  });
  const escalation = evaluateEvidenceEscalation(evidence.evidence.state);
  const eventMetadata: Record<string, unknown> = {
    scanStatus: scanResult.status,
    scanProvider: scanResult.provider,
    scannedAt: scanResult.scannedAt,
  };
  if (escalation.triggers.length > 0) {
    eventMetadata.governanceEscalationLevel = escalation.level;
    eventMetadata.governanceEscalationTriggers = escalation.triggers.map(
      (t) => t.trigger,
    );
    eventMetadata.governanceRequiresHumanResolution =
      escalation.requiresHumanResolution;
  }
  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType:
      escalation.triggers.length > 0
        ? "evidence.escalation_triggered"
        : "evidence.file_scanned",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "evidence",
    targetId: evidence.evidence.id,
    newState: evidence.evidence.state,
    description:
      escalation.triggers.length > 0
        ? `File scanned: ${params.filename} — governance escalation: ${escalation.message}`
        : `File scanned: ${params.filename} → ${scanResult.status} (${scanResult.provider})`,
    metadata: eventMetadata,
  });
  return evidence;
}

/** @deprecated Use updateEvidenceStateWithEventAction instead — records audit event */
export async function updateEvidenceStateAction(id: string, state: string) {
  console.warn(
    "[AuditActions] updateEvidenceStateAction called without audit event — use updateEvidenceStateWithEventAction instead",
  );
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  await enforceAuditRateLimit(actor, "update_evidence_state", "mutation");
  return svcUpdateEvidenceState(id, state, {
    userId: actor.actorId,
    actorName: actor.actorName,
  });
}

export async function updateEvidenceStateWithEventAction(
  id: string,
  state: string,
  engagementId: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "update_evidence_state", "mutation");
  const escalation = evaluateEvidenceEscalation(state);
  const result = await svcUpdateEvidenceStateWithEvent(
    id,
    state,
    engagementId,
    actor,
  );
  try {
    await createEvidenceVersion(
      id,
      { state },
      actor.actorId,
      actor.actorName,
      `تغيير الحالة إلى ${state}`,
    );
  } catch {
    /* versioning optional until migration applied */
  }
  if (escalation.triggers.length > 0) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "evidence.escalation_triggered",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "evidence",
      targetId: id,
      newState: state,
      description: `Evidence state change triggered escalation: ${escalation.message}`,
      aiRelated: false,
      metadata: {
        governanceEscalationLevel: escalation.level,
        governanceEscalationTriggers: escalation.triggers.map((t) => t.trigger),
        governanceRequiresHumanResolution: escalation.requiresHumanResolution,
      },
    });
  }
  return result;
}

export async function uploadEvidenceFileAction(params: {
  engagementId: string;
  filename: string;
  fileType: string;
  fileData: string; // base64-encoded file content
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(params.engagementId, actor);
  await enforceAuditRateLimit(actor, "upload_evidence_file", "upload");

  if (!ALLOWED_FILE_TYPES.includes(params.fileType.toLowerCase())) {
    throw new Error(
      `Unsupported file type: ${params.fileType}. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`,
    );
  }

  const content = Buffer.from(params.fileData, "base64");
  if (content.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File too large: ${(content.length / 1024 / 1024).toFixed(1)}MB. Maximum: ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
    );
  }

  // Compute file hash
  const fileHash = createHash("sha256").update(content).digest("hex");

  // File scanning
  const scanResult = await scanEvidenceFile({
    filename: params.filename,
    fileType: params.fileType,
    fileSize: content.length,
    content,
  });
  if (isScanRejected(scanResult)) {
    throw new Error(scanResult.details || "File rejected by security scanner");
  }

  // Create evidence record first to get the ID
  const { evidence } = await svcCreateEvidence({
    engagementId: params.engagementId,
    filename: params.filename,
    fileType: params.fileType,
    fileSize: content.length,
    state: "missing",
    actorId: actor.actorId,
    actorName: actor.actorName,
  });

  // Store the file
  const storageKey = buildStorageKey(
    params.engagementId,
    evidence.id,
    params.filename,
  );
  const storageProvider = getStorageProvider();
  await storageProvider.store(storageKey, {
    filename: params.filename,
    mimeType: params.fileType,
    content,
  });

  // Update evidence record with storage metadata
  await svcUpdateEvidenceStorage(evidence.id, {
    fileHash,
    storageKey,
    fileSize: content.length,
  });

  try {
    await createEvidenceVersion(
      evidence.id,
      {
        state: "uploaded",
        fileHash,
        storageKey,
        fileSize: content.length,
      },
      actor.actorId,
      actor.actorName,
      "رفع ملف الدليل",
    );
  } catch {
    /* versioning optional until migration applied */
  }

  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType: "evidence.uploaded",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "evidence",
    targetId: evidence.id,
    newState: "uploaded",
    description: `Evidence file uploaded: ${params.filename} (${(content.length / 1024).toFixed(1)}KB, scan: ${scanResult.status})`,
    aiRelated: false,
    metadata: {
      fileSize: content.length,
      fileHash: fileHash.substring(0, 12),
      storageKey,
      scanMethod: scanResult.provider,
      scanStatus: scanResult.status,
    },
  });

  return {
    evidence,
    storageKey,
    fileHash: fileHash.substring(0, 12),
    downloadUrl: `/api/audit/evidence/${evidence.id}/download`,
  };
}

export async function getEvidenceDownloadUrlAction(
  evidenceId: string,
  engagementId: string,
): Promise<{
  url: string;
  filename: string;
  fileType: string;
  fileSize: number;
} | null> {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"]);
  await assertEngagementAccess(engagementId, actor);
  const evidenceList = await svcGetEvidence(engagementId);
  const evidence = evidenceList.find((e) => e.id === evidenceId);
  if (!evidence || !evidence.storageKey) return null;
  const storageProvider = getStorageProvider();
  const exists = await storageProvider.exists(evidence.storageKey);
  if (!exists) return null;
  await svcRecordAuditEvent({
    engagementId,
    eventType: "evidence.download_requested",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "evidence",
    targetId: evidenceId,
    newState: evidence.state,
    description: `Evidence download requested: ${evidence.filename}`,
    aiRelated: false,
    metadata: { storageKey: evidence.storageKey },
  });
  return {
    url: `/api/audit/evidence/${evidenceId}/download`,
    filename: evidence.filename,
    fileType: evidence.fileType,
    fileSize: evidence.fileSize,
  };
}

export async function createFindingAction(params: {
  engagementId: string;
  title: string;
  findingType: string;
  severity: string;
  description: string;
  rootCause?: string;
  impact?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(params.engagementId, actor);
  await enforceAuditRateLimit(actor, "create_finding", "mutation");
  const escalation = evaluateFindingEscalation(params.severity);
  const result = await svcCreateFinding({
    ...params,
    actorId: actor.actorId,
    actorName: actor.actorName,
  });
  if (escalation.triggers.length > 0) {
    await svcRecordAuditEvent({
      engagementId: params.engagementId,
      eventType: "finding.governance_escalation",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "finding",
      targetId: result.finding.id,
      newState: result.finding.status,
      description: `Governance escalation on finding "${params.title}": ${escalation.message}`,
      aiRelated: false,
      metadata: {
        governanceEscalationLevel: escalation.level,
        governanceEscalationTriggers: escalation.triggers.map((t) => t.trigger),
        governanceRequiresHumanResolution: escalation.requiresHumanResolution,
      },
    });
  }
  return result;
}

export async function updateFindingStatusAction(
  id: string,
  status: string,
  engagementId: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "update_finding_status", "mutation");
  const governanceContext = getGovernanceContext("audit_findings");
  const provenance = buildProvenanceMetadata({
    taskType: "audit_findings",
    approvalState: mapFindingStatusToApprovalState(status),
    evidenceRequirements: governanceContext.evidenceRequirements,
  });
  const result = await svcUpdateFindingStatus(
    id,
    status,
    engagementId,
    actor.actorId,
  );
  await svcRecordAuditEvent({
    engagementId,
    eventType: "finding.governance_state_changed",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "finding",
    targetId: id,
    newState: status,
    description: `Finding status changed to ${status} — governance check: ${provenance.approvalState}`,
    aiRelated: false,
    metadata: getGovernanceAuditMetadata("audit_findings", provenance),
  });
  return result;
}

export async function createRecommendationAction(params: {
  engagementId: string;
  findingId: string;
  title: string;
  description: string;
  recommendedAction: string;
  riskLevel?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(params.engagementId, actor);
  await enforceAuditRateLimit(actor, "create_recommendation", "mutation");
  return svcCreateRecommendation({
    ...params,
    actorId: actor.actorId,
    actorName: actor.actorName,
  });
}

export async function updateRecommendationStatusAction(
  id: string,
  status: string,
  engagementId: string,
  reviewerDecision?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(
    actor,
    "update_recommendation_status",
    "mutation",
  );
  const governanceContext = getGovernanceContext("audit_findings");
  const provenance = buildProvenanceMetadata({
    taskType: "audit_findings",
    approvalState: mapRecommendationStatusToApprovalState(status),
    evidenceRequirements: governanceContext.evidenceRequirements,
  });
  const result = await svcUpdateRecommendationStatus(
    id,
    status,
    engagementId,
    reviewerDecision,
  );
  await svcRecordAuditEvent({
    engagementId,
    eventType: "recommendation.governance_state_changed",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "recommendation",
    targetId: id,
    newState: status,
    description: `Recommendation status changed to ${status} — governance check: ${provenance.approvalState}${reviewerDecision ? ` (${reviewerDecision})` : ""}`,
    aiRelated: false,
    metadata: getGovernanceAuditMetadata("audit_findings", provenance),
  });
  return result;
}

export async function createReviewCommentAction(params: {
  engagementId: string;
  targetType: string;
  targetId: string;
  comment: string;
  requiredAction?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  await assertEngagementAccess(params.engagementId, actor);
  await enforceAuditRateLimit(actor, "create_review_comment", "mutation");
  return svcCreateReviewComment({
    ...params,
    actorId: actor.actorId,
    actorName: actor.actorName,
  });
}

export async function updateReviewCommentStatusAction(
  id: string,
  status: string,
  resolution?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  return svcUpdateReviewCommentStatus(id, status, resolution);
}

export async function createApprovalRecordAction(params: {
  engagementId: string;
  action: string;
  rationale?: string;
  targetType: string;
  targetId: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  await assertEngagementAccess(params.engagementId, actor);
  await enforceAuditRateLimit(actor, "create_approval", "mutation");
  const result = await svcCreateApprovalRecord({
    ...params,
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
  });

  try {
    const engagement = await svcGetEngagement(actor.organizationId, params.engagementId);
    if (engagement) {
      const clientName = engagement.client?.name ?? engagement.clientId;
      await notifyOnEvent("on_approval", actor.organizationId, params.engagementId, {
        productKey: "audit",
        templateKey: "audit_approval_needed",
        recipientId: actor.actorId,
        templateVars: {
          title: clientName,
          clientName,
          requestedAt: new Date().toISOString(),
        },
      });
    }
  } catch {
    // Notification must not block the primary action
  }

  return result;
}

export async function linkEvidenceToEntityAction(params: {
  engagementId: string;
  evidenceId: string;
  targetType: string;
  targetId: string;
  context?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(params.engagementId, actor);
  return svcLinkEvidenceToEntity({
    ...params,
    actorId: actor.actorId,
    actorName: actor.actorName,
  });
}

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

export async function exportFinancialStatementsAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "export_financial_statements", "export");
  const { exportFinancialStatements } =
    await import("@/lib/audit/export-service");
  const pkg = await exportFinancialStatements(engagementId);
  await svcRecordAuditEvent({
    engagementId,
    eventType: "export.financial_statements_generated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "engagement",
    targetId: engagementId,
    newState: "exported",
    description: `Financial statements exported (${pkg.statements.length} statements, ${pkg.notes.length} notes)`,
    metadata: { exportType: "financial_statements", status: pkg.status },
  });
  return pkg;
}

export async function exportAuditFileAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "export_audit_file", "export");
  const { exportAuditFile } = await import("@/lib/audit/export-service");
  const pkg = await exportAuditFile(engagementId);
  await svcRecordAuditEvent({
    engagementId,
    eventType: "export.audit_file_generated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "engagement",
    targetId: engagementId,
    newState: "exported",
    description: `Audit file exported (${pkg.auditFile?.evidenceChecklist.length ?? 0} evidence items, ${pkg.auditFile?.findings.length ?? 0} findings)`,
    metadata: { exportType: "audit_file", status: pkg.status },
  });
  return pkg;
}

export async function exportBilingualAction(
  engagementId: string,
  locale: "en" | "ar" | "bilingual",
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "export_bilingual", "export");
  const { exportBilingual } = await import("@/lib/audit/export-service");
  const pkg = await exportBilingual(engagementId, locale);
  await svcRecordAuditEvent({
    engagementId,
    eventType: "export.financial_statements_generated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "engagement",
    targetId: engagementId,
    newState: "exported",
    description: `Bilingual export generated (${locale})`,
    metadata: { exportType: "bilingual", locale },
  });
  return pkg;
}

// ─── Pilot Feedback Actions ───

export async function createPilotFeedbackAction(params: {
  engagementId: string;
  title: string;
  description: string;
  source: string;
  category: string;
  severity?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(params.engagementId, actor);
  const feedback = await svcCreatePilotFeedback({
    ...params,
    createdBy: actor.actorId,
  });
  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType: "pilot.feedback_created",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "pilot_feedback",
    targetId: feedback.id,
    newState: "open",
    description: `Pilot feedback created: ${params.title}`,
    metadata: { category: params.category, source: params.source },
  });
  return feedback;
}

export async function updatePilotFeedbackStatusAction(
  id: string,
  engagementId: string,
  status: string,
  decision?: string,
  owner?: string,
  nextAction?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  const fb = await svcUpdatePilotFeedbackStatus(
    id,
    status,
    decision,
    owner,
    nextAction,
  );
  if (fb) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "pilot.feedback_updated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "pilot_feedback",
      targetId: id,
      newState: status,
      description: `Pilot feedback updated: ${fb.title}`,
    });
  }
  return fb;
}

export async function getPilotFeedbackAction(engagementId: string) {
  const actor = await getAuditActor();
  await assertEngagementAccess(engagementId, actor);
  return svcGetPilotFeedback(engagementId);
}

export async function createProductionBlockerAction(params: {
  engagementId: string;
  title: string;
  description: string;
  category: string;
  severity?: string;
  requiredBefore?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(params.engagementId, actor);
  const blocker = await svcCreateProductionBlocker({
    ...params,
    createdBy: actor.actorId,
  });
  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType: "pilot.blocker_created",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "production_blocker",
    targetId: blocker.id,
    newState: "open",
    description: `Production blocker created: ${params.title}`,
  });
  return blocker;
}

export async function updateProductionBlockerStatusAction(
  id: string,
  engagementId: string,
  status: string,
  owner?: string,
  resolutionPlan?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  const blockers = await svcGetProductionBlockers(engagementId);
  if (!blockers.some((blocker) => blocker.id === id)) {
    throw new Error("Production blocker not found for this engagement");
  }
  const b = await svcUpdateProductionBlockerStatus(
    id,
    status,
    owner,
    resolutionPlan,
  );
  if (b) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "pilot.blocker_updated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "production_blocker",
      targetId: id,
      newState: status,
      description: `Production blocker updated: ${b.title}`,
    });
  }
  return b;
}

export async function getProductionBlockersAction(engagementId: string) {
  const actor = await getAuditActor();
  await assertEngagementAccess(engagementId, actor);
  return svcGetProductionBlockers(engagementId);
}

export async function createOrUpdatePilotSignoffAction(params: {
  engagementId: string;
  checklistItem: string;
  status: string;
  signedBy?: string;
  notes?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  await assertEngagementAccess(params.engagementId, actor);
  const signoff = await svcCreateOrUpdatePilotSignoff({
    ...params,
    signedBy: params.signedBy ?? actor.actorName,
  });
  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType: "pilot.signoff_updated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "pilot_signoff",
    targetId: signoff.id,
    newState: params.status,
    description: `Pilot signoff updated: ${params.checklistItem} → ${params.status}`,
  });
  return signoff;
}

export async function getPilotSignoffChecklistAction(engagementId: string) {
  const actor = await getAuditActor();
  await assertEngagementAccess(engagementId, actor);
  return svcGetPilotSignoffChecklist(engagementId);
}

export async function runValidationAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer", "operator"]);
  await assertEngagementAccess(engagementId, actor);
  return svcRunValidation(engagementId, actor.actorId);
}

export async function disposeValidationIssueAction(
  issueId: string,
  action: string,
  rationale?: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner", "manager", "reviewer"]);
  const issue = await prisma.auditValidationIssue.findUnique({
    where: { id: issueId },
    select: { engagementId: true },
  });
  if (!issue) {
    throw new Error("Validation issue not found");
  }
  await assertEngagementAccess(issue.engagementId, actor);
  return svcDisposeValidationIssue(
    issueId,
    action,
    rationale,
    actor.actorId,
    actor.actorName,
  );
}

export async function publishEngagementAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "publish_engagement", "mutation");

  const engagement = await svcGetEngagement(actor.organizationId, engagementId);
  if (!engagement) {
    throw new Error("Engagement not found");
  }
  const evidence = await svcGetEvidence(engagementId);
  const evidenceRequirements =
    buildEvidenceRequirementsFromEvidenceList(evidence);
  const governanceCheck = checkPublicationGovernance({
    engagementStatus: engagement.status,
    evidenceRequirements,
    taskType: "approval_review",
    approvedBy: actor.actorName,
  });
  if (!governanceCheck.allowed) {
    const reasons = governanceCheck.reasons.join("; ");
    await svcRecordAuditEvent({
      engagementId,
      eventType: "publication.blocked_by_governance",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "engagement",
      targetId: engagementId,
      newState: engagement.status,
      description: `Publication blocked by governance rules: ${reasons}`,
      aiRelated: false,
      metadata: {
        governanceBlocked: true,
        governanceReasons: governanceCheck.reasons,
        governanceEvidenceMissing: evidence.filter((e) => e.state === "missing")
          .length,
        governanceEvidenceRejected: evidence.filter(
          (e) => e.state === "rejected",
        ).length,
      },
    });
    throw new Error(`Publication blocked by governance rules: ${reasons}`);
  }

  const result = await svcPublishEngagement(
    engagementId,
    actor.actorId,
    actor.actorName,
  );
  await svcRecordAuditEvent({
    engagementId,
    eventType: "publication.governance_passed",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "engagement",
    targetId: engagementId,
    newState: "published",
    description: `Publication passed governance check — approved by ${actor.actorName}`,
    aiRelated: false,
    metadata: {
      governancePassed: true,
      governanceEvidenceCount: evidence.length,
    },
  });
  return result;
}

export async function archiveEngagementAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "archive_engagement", "mutation");

  const engagement = await svcGetEngagement(actor.organizationId, engagementId);
  if (!engagement) {
    throw new Error("Engagement not found");
  }
  if (engagement.status === "archived") {
    throw new Error("Engagement is already archived");
  }

  const archival = evaluateEngagementArchival(engagement.status);
  if (!archival.canArchive) {
    throw new Error(archival.reasonAr);
  }

  await svcArchiveEngagement(engagementId, actor.actorId, actor.actorName);

  await svcRecordAuditEvent({
    engagementId,
    eventType: "engagement.archived",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "engagement",
    targetId: engagementId,
    previousState: engagement.status,
    newState: "archived",
    description: `Engagement archived by ${actor.actorName}`,
    aiRelated: false,
    metadata: {
      archivedAt: new Date().toISOString(),
    },
  });

  revalidatePath(`/audit/engagements/${engagementId}`);
  revalidatePath("/audit");
  revalidatePath("/audit/archived");

  return { success: true };
}

export async function restoreEngagementAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "restore_engagement", "mutation");

  const engagement = await svcGetEngagement(actor.organizationId, engagementId);
  if (!engagement) {
    throw new Error("Engagement not found");
  }

  const archival = evaluateEngagementArchival(engagement.status);
  if (!archival.canRestore) {
    throw new Error(archival.reasonAr);
  }

  const restoredStatus = await svcRestoreEngagement(
    engagementId,
    actor.actorId,
    actor.actorName,
  );

  revalidatePath(`/audit/engagements/${engagementId}`);
  revalidatePath("/audit");
  revalidatePath("/audit/archived");
  revalidatePath("/audit/portfolio");

  return { success: true, restoredStatus };
}

/** A1-02 — deterministic trial balance sampling (assistive; human decides). */
export async function generateAuditSamplingAction(params: {
  engagementId: string;
  method: SamplingMethod;
  sampleSize: number;
  seed?: string;
  materialityThreshold?: number;
  confidenceLevel?: number;
  marginOfError?: number;
  interval?: number;
  randomStart?: number;
}): Promise<SamplingResult> {
  const actor = await getAuditActor();
  requireRole(actor, [
    "admin",
    "partner",
    "manager",
    "senior",
    "staff",
    "operator",
    "reviewer",
    "viewer",
  ]);
  await assertEngagementAccess(params.engagementId, actor);
  await enforceAuditRateLimit(actor, "generate_sampling", "read");

  const lines = await svcGetTrialBalanceLines(params.engagementId);
  if (lines.length === 0) {
    throw new Error(
      "لا توجد بنود ميزان مراجعة — ارفع الميزان قبل توليد العينة.",
    );
  }

  const population = lines.map((line) => ({
    id: line.id,
    accountCode: line.accountCode,
    accountName: line.accountName,
    debitAmount: line.debitAmount,
    creditAmount: line.creditAmount,
    balance: line.balance,
  }));

  const result = runSamplingEngine(params.engagementId, population, {
    method: params.method,
    sampleSize: params.sampleSize,
    seed: params.seed,
    materialityThreshold: params.materialityThreshold,
    confidenceLevel: params.confidenceLevel,
    marginOfError: params.marginOfError,
    interval: params.interval,
    randomStart: params.randomStart,
  });

  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType: "sampling.generated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "trial_balance_sample",
    targetId: params.engagementId,
    description: `Sampling generated (${result.method}, n=${result.sampleSize})`,
    aiRelated: false,
    metadata: {
      method: result.method,
      sampleSize: result.sampleSize,
      populationCount: result.populationCount,
      seed: result.seed,
      selectedIds: result.selectedIds,
      confidenceLevel: result.parameters.confidenceLevel,
      recommendedMinSampleSize: result.statistics?.recommendedMinSampleSize,
    },
  });

  revalidatePath(`/audit/engagements/${params.engagementId}/sampling`);
  return result;
}

export async function updateEngagementPresentationProfileAction(params: {
  engagementId: string;
  presentationProfile: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin"]);
  await assertEngagementAccess(params.engagementId, actor);

  const result = await svcUpdateEngagementPresentationProfile({
    organizationId: actor.organizationId,
    engagementId: params.engagementId,
    presentationProfile: params.presentationProfile,
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
  });

  revalidatePath(`/audit/engagements/${params.engagementId}`);
  revalidatePath(`/audit/engagements/${params.engagementId}/statements`);

  return {
    presentationProfile: result.engagement.presentationProfile,
    presentationProfileVersion: result.engagement.presentationProfileVersion,
    fsRebuild: result.fsRebuild,
  };
}
