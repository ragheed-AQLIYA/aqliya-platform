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
} as const;
