// LocalContentOS audit event writer
// Single-write to PlatformAuditLog for unified cross-product audit trail.

import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { Product } from "@/lib/platform/audit-logger";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";

export interface AuditEventInput {
  projectId: string;
  actorId: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: string;
  after?: string;
  metadata?: Record<string, unknown>;
  platformOrganizationId?: string;
}

export async function createLocalContentAuditEvent(
  input: AuditEventInput,
): Promise<void> {
  const platformResult = await writePlatformAuditLog({
    productKey: Product.LOCAL_CONTENT,
    action: input.action,
    platformOrganizationId: input.platformOrganizationId ?? undefined,
    actorId: input.actorId,
    actorName: input.actorName,
    projectId: input.projectId,
    targetType: input.entityType,
    targetId: input.entityId,
    beforeState: input.before,
    afterState: input.after,
    metadata: input.metadata as Record<string, unknown> | undefined,
  });

  if (platformResult.ok && platformResult.id) {
    await appendToAuditChain(
      platformResult.id,
      input.action,
      input.actorId,
    );
  }
}

export const AuditActions = {
  PROJECT_CREATED: "project.created",
  PROJECT_UPDATED: "project.updated",
  SUPPLIER_CREATED: "supplier.created",
  SUPPLIER_UPDATED: "supplier.updated",
  SPEND_CREATED: "spend.created",
  SPEND_IMPORTED: "spend.imported",
  CLASSIFICATION_CREATED: "classification.created",
  CLASSIFICATION_UPDATED: "classification.updated",
  CLASSIFICATIONS_COMPLETED: "classifications.completed",
  EVIDENCE_UPLOADED: "evidence.uploaded",
  EVIDENCE_LINKED: "evidence.linked",
  EVIDENCE_REVIEWED: "evidence.reviewed",
  FINDING_CREATED: "finding.created",
  FINDING_UPDATED: "finding.updated",
  SUPPLIER_DELETED: "supplier.deleted",
  SPEND_DELETED: "spend.deleted",
  EVIDENCE_DELETED: "evidence.deleted",
  FINDING_DELETED: "finding.deleted",
  REVIEW_SUBMITTED: "review.submitted",
  REVIEW_RETURNED: "review.returned",
  APPROVAL_DECIDED: "approval.decided",
  REPORT_GENERATED: "report.generated",
  // ── AI Advisor V3 Audit Actions ──
  AI_REVIEW_RUN: "ai.review_run",
  AI_REVIEW_COMPLETED: "ai.review_completed",
  AI_REVIEW_FAILED: "ai.review_failed",
  AI_PATTERN_SUGGESTED: "ai.pattern_suggested",
  AI_PATTERN_REVIEWED: "ai.pattern_reviewed",
  AI_RECOMMENDATION_GENERATED: "ai.recommendation_generated",
  AI_RECOMMENDATION_REVIEWED: "ai.recommendation_reviewed",
  AI_SIMULATION_RUN: "ai.simulation_run",
  AI_SIMULATION_REVIEWED: "ai.simulation_reviewed",
  AI_CONFIDENCE_CALIBRATED: "ai.confidence_calibrated",
  AI_FALSE_POSITIVE_REVIEWED: "ai.false_positive_reviewed",
  AI_LEARNING_LOOP_UPDATED: "ai.learning_loop_updated",
  AI_PATTERN_OVERRIDE: "ai.pattern_override",
  AI_PATTERN_MANUAL_APPLIED: "ai.pattern_manual_applied",
  AI_LEARNING_VALIDATED: "ai.learning_validated",
} as const;

// ── AI Audit Event Writer ──

export interface AiAuditInput {
  organizationId: string;
  projectId?: string;
  workbookId?: string;
  action: string;
  actorId?: string;
  providerId?: string;
  modelVersion?: string;
  promptVersion?: string;
  confidence?: number;
  status: "success" | "partial" | "failed";
  inputSummary?: Record<string, unknown>;
  outputSummary?: Record<string, unknown>;
  warningCount?: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Write an AI audit event via PlatformAuditLog.
 * Never throws — best-effort write for traceability.
 */
export async function createAiAuditEvent(
  input: AiAuditInput,
): Promise<void> {
  const platformResult = await writePlatformAuditLog({
    productKey: Product.LOCAL_CONTENT,
    action: input.action,
    organizationId: input.organizationId,
    projectId: input.projectId,
    actorId: input.actorId,
    aiProvider: input.providerId,
    aiModel: input.modelVersion,
    aiPromptVersion: input.promptVersion,
    aiRelated: true,
    aiConfidence: input.confidence,
    aiStatus: input.status,
    inputSummary: input.inputSummary,
    outputSummary: input.outputSummary,
    durationMs: input.durationMs,
    targetType: "AiAuditEvent",
    targetId: input.action,
    severity: input.status === "failed" ? "error" : input.status === "partial" ? "warning" : "info",
    metadata: {
      ...(input.metadata ?? {}),
      workbookId: input.workbookId,
      warningCount: input.warningCount,
    } as Record<string, unknown>,
  });

  if (platformResult.ok && platformResult.id) {
    await appendToAuditChain(
      platformResult.id,
      input.action,
      input.actorId ?? "system",
    );
  }
}
