"use server";

import { revalidatePath } from "next/cache";
import { evaluateEngagementArchival } from "@/lib/audit/engagement-archival";

import {
  createEngagement as svcCreateEngagement,
  uploadTrialBalance as svcUploadTrialBalance,
  getTraceability as svcGetTraceability,
  updateManualMapping as svcUpdateManualMapping,
  getAccountMappingById as svcGetAccountMappingById,
  createReviewComment as svcCreateReviewComment,
  updateReviewCommentStatus as svcUpdateReviewCommentStatus,
  createApprovalRecord as svcCreateApprovalRecord,
  recordAuditEvent as svcRecordAuditEvent,
  publishEngagement as svcPublishEngagement,
  archiveEngagement as svcArchiveEngagement,
  restoreEngagement as svcRestoreEngagement,
  getEngagement as svcGetEngagement,
  getEvidence as svcGetEvidence,
  getTrialBalanceLines as svcGetTrialBalanceLines,
  updateEngagementPresentationProfile as svcUpdateEngagementPresentationProfile,
  runValidation as svcRunValidation,
  disposeValidationIssue as svcDisposeValidationIssue,
} from "@/lib/audit/services";
import {
  runSamplingEngine,
  type SamplingMethod,
  type SamplingResult,
} from "@/lib/audit/sampling";
import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import { enforceAuditRateLimit } from "@/lib/audit/rate-limit";
import {
  checkPublicationGovernance,
  buildEvidenceRequirementsFromEvidenceList,
} from "@/lib/audit/governance-bridge";
import { prisma } from "@/lib/prisma";
import { notifyOnEvent } from "@/lib/platform/notification/integration";
import { createLogger } from "@/lib/observability/logger";
import { publishDomainEvent } from "@/lib/kernel/publish";
import { publishAuditOSEvent } from "@/lib/kernel/events/audit-events";

async function persistMappingReviewFirmMemory(params: {
  engagementId: string;
  sourceAccountCode: string;
  sourceAccountName: string;
  suggestedCanonicalId?: string | null;
  acceptedCanonicalId: string;
  reviewerId: string;
}): Promise<void> {
  const { resolveFirmMemoryOrganizationIdFromEngagement } = await import(
    "@/lib/tb-intelligence/org-resolver"
  );
  const orgId = await resolveFirmMemoryOrganizationIdFromEngagement(
    params.engagementId,
  );
  if (!orgId) return;

  const { recordReviewMappingFeedback, getClassificationHintsForAccount } =
    await import("@/lib/tb-intelligence/firm-memory");
  const classificationHints = await getClassificationHintsForAccount(
    params.engagementId,
    params.sourceAccountCode,
  );
  await recordReviewMappingFeedback({
    organizationId: orgId,
    engagementId: params.engagementId,
    clientAccountCode: params.sourceAccountCode,
    clientAccountName: params.sourceAccountName,
    suggestedCanonicalId: params.suggestedCanonicalId,
    acceptedCanonicalId: params.acceptedCanonicalId,
    reviewerId: params.reviewerId,
    classificationHints,
  });
}

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
    await Promise.allSettled(
      params.teamMemberIds.map((memberId) =>
        notifyOnEvent("on_create", params.organizationId, engagementId, {
          productKey: "audit",
          templateKey: "audit_review_assigned",
          recipientId: memberId,
          templateVars: {
            title: params.clientName,
            clientName: params.clientName,
            assignedAt: new Date().toISOString(),
          },
        })
      )
    );
  }

  try {
    await publishDomainEvent(publishAuditOSEvent("engagement.created", {
      actorId: actor.actorId,
      organizationId: params.organizationId,
      resourceId: engagementId ?? undefined,
      resourceType: "engagement",
      metadata: {
        engagementId: engagementId ?? undefined,
        engagementName: params.clientName,
      },
    }));
  } catch {
    // Event publishing is fire-and-forget
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
  rejectionReason?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(input.engagementId, actor);

  const priorMapping = await svcGetAccountMappingById(input.mappingId);
  if (!priorMapping || priorMapping.engagementId !== input.engagementId) {
    return null;
  }

  const mapping = await svcUpdateManualMapping({
    engagementId: input.engagementId,
    mappingId: input.mappingId,
    canonicalAccountId: input.canonicalAccountId,
    mappedBy: actor.actorName,
  });

  if (mapping?.canonicalAccountId) {
    await persistMappingReviewFirmMemory({
      engagementId: input.engagementId,
      sourceAccountCode: mapping.sourceAccountCode,
      sourceAccountName: mapping.sourceAccountName,
      suggestedCanonicalId: priorMapping.canonicalAccountId ?? null,
      acceptedCanonicalId: mapping.canonicalAccountId,
      reviewerId: actor.actorId,
    });
  }

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
      metadata: {
        canonicalAccountId: input.canonicalAccountId ?? null,
        priorCanonicalAccountId: priorMapping.canonicalAccountId ?? null,
        firmMemoryRecorded: Boolean(mapping.canonicalAccountId),
        rejectionReason: input.rejectionReason ?? null,
      },
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
    if (result.canonicalAccountId) {
      await persistMappingReviewFirmMemory({
        engagementId,
        sourceAccountCode: result.sourceAccountCode,
        sourceAccountName: result.sourceAccountName,
        suggestedCanonicalId: result.canonicalAccountId,
        acceptedCanonicalId: result.canonicalAccountId,
        reviewerId: actor.actorId,
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

  for (const result of mappings) {
    if (!result.canonicalAccountId) continue;
    await persistMappingReviewFirmMemory({
      engagementId,
      sourceAccountCode: result.sourceAccountCode,
      sourceAccountName: result.sourceAccountName,
      suggestedCanonicalId: result.canonicalAccountId,
      acceptedCanonicalId: result.canonicalAccountId,
      reviewerId: actor.actorId,
    });
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
  } catch (error) {
    const logger = createLogger({ product: "audit", action: "createApprovalRecordNotification" });
    logger.error("Notification failed for approval record", error as Error, { engagementId: params.engagementId });
    // Notification must not block the primary action
  }

  return result;
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

  const [engagement, evidence] = await Promise.all([
    svcGetEngagement(actor.organizationId, engagementId),
    svcGetEvidence(engagementId),
  ]);
  if (!engagement) {
    throw new Error("Engagement not found");
  }
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
