// LocalContentOS audit event writer
// Uses domain-specific audit events for detailed traceability.
// PlatformAuditLog dual-write can be added later for cross-product visibility.

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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
}

export async function createLocalContentAuditEvent(
  input: AuditEventInput,
): Promise<void> {
  try {
    await prisma.localContentAuditEvent.create({
      data: {
        projectId: input.projectId,
        actorId: input.actorId,
        actorName: input.actorName ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before ?? null,
        after: input.after ?? null,
        metadata: (input.metadata ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
      },
    });
  } catch (error) {
    console.warn(
      `[LocalContentOS] Audit event write failed: ${error instanceof Error ? error.message : "unknown"}`,
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
 * Write an AI audit event to the LcAiAuditEvent table.
 * Never throws — best-effort write for traceability.
 */
export async function createAiAuditEvent(
  input: AiAuditInput,
): Promise<void> {
  try {
    await prisma.lcAiAuditEvent.create({
      data: {
        organizationId: input.organizationId,
        projectId: input.projectId ?? null,
        workbookId: input.workbookId ?? null,
        action: input.action,
        actorId: input.actorId ?? null,
        providerId: input.providerId ?? null,
        modelVersion: input.modelVersion ?? null,
        promptVersion: input.promptVersion ?? null,
        confidence: input.confidence ?? null,
        status: input.status,
        inputSummary: (input.inputSummary ?? undefined) as Prisma.InputJsonValue | undefined,
        outputSummary: (input.outputSummary ?? undefined) as Prisma.InputJsonValue | undefined,
        warningCount: input.warningCount ?? 0,
        durationMs: input.durationMs ?? 0,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    console.warn(
      `[LocalContentOS] AI audit event write failed: ${error instanceof Error ? error.message : "unknown"}`,
    );
  }
}
