import "server-only";

import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

export type EvidenceProductSlug =
  | "audit"
  | "decision"
  | "local_content"
  | "contact"
  | "workflow";

export type EvidenceSensitivity = "standard" | "restricted" | "confidential";

export interface EvidenceRegistryRecord {
  id: string;
  productSlug: EvidenceProductSlug;
  organizationId: string;
  resourceType: string;
  resourceId: string;
  filename: string;
  fileType: string;
  storageKey: string | null;
  sensitivity: EvidenceSensitivity;
  uploadedById?: string | null;
  createdAt: Date;
}

export interface LookupEvidenceInput {
  productSlug: EvidenceProductSlug;
  evidenceId: string;
  /** When set, record must belong to this parent resource */
  resourceId?: string;
}

export interface RegisterEvidenceInput {
  productSlug: EvidenceProductSlug;
  organizationId: string;
  resourceType: string;
  resourceId: string;
  filename: string;
  fileType: string;
  storageKey?: string;
  uploadedById: string;
  sensitivity?: EvidenceSensitivity;
}

function mapAuditSensitivity(state: string): EvidenceSensitivity {
  if (state === "missing") return "confidential";
  if (state === "verified") return "standard";
  return "restricted";
}

function mapLocalContentSensitivity(
  evidenceType: string,
  status: string,
): EvidenceSensitivity {
  if (status === "rejected" || status === "missing") return "restricted";
  if (evidenceType === "contract" || evidenceType === "attestation") {
    return "confidential";
  }
  return "standard";
}

/** Unified read facade over product-specific evidence models (no new Prisma tables). */
export async function lookupEvidence(
  input: LookupEvidenceInput,
): Promise<EvidenceRegistryRecord | null> {
  switch (input.productSlug) {
    case "audit": {
      const row = await prisma.auditEvidence.findUnique({
        where: { id: input.evidenceId },
        include: { engagement: { select: { organizationId: true } } },
      });
      if (!row) return null;
      if (
        input.resourceId &&
        row.engagementId !== input.resourceId
      ) {
        return null;
      }
      return {
        id: row.id,
        productSlug: "audit",
        organizationId: row.engagement.organizationId,
        resourceType: "AuditEngagement",
        resourceId: row.engagementId,
        filename: row.filename,
        fileType: row.fileType,
        storageKey: row.storageKey,
        sensitivity: mapAuditSensitivity(row.state),
        uploadedById: row.uploadedBy,
        createdAt: row.createdAt,
      };
    }
    case "decision": {
      const row = await prisma.decisionEvidence.findUnique({
        where: { id: input.evidenceId },
      });
      if (!row) return null;
      if (input.resourceId && row.decisionId !== input.resourceId) return null;
      return {
        id: row.id,
        productSlug: "decision",
        organizationId: row.organizationId,
        resourceType: "Decision",
        resourceId: row.decisionId,
        filename: row.filename,
        fileType: row.fileType,
        storageKey: row.storageKey,
        sensitivity: "restricted",
        uploadedById: row.uploadedById,
        createdAt: row.createdAt,
      };
    }
    case "local_content": {
      const row = await prisma.localContentEvidence.findUnique({
        where: { id: input.evidenceId },
        include: { project: { select: { organizationId: true } } },
      });
      if (!row) return null;
      if (input.resourceId && row.projectId !== input.resourceId) return null;
      return {
        id: row.id,
        productSlug: "local_content",
        organizationId: row.project.organizationId,
        resourceType: "LocalContentProject",
        resourceId: row.projectId,
        filename: row.filename,
        fileType: row.fileType,
        storageKey: row.storageKey,
        sensitivity: mapLocalContentSensitivity(row.evidenceType, row.status),
        uploadedById: row.reviewedById,
        createdAt: row.createdAt,
      };
    }
    case "contact": {
      const row = await prisma.contactEvidence.findUnique({
        where: { id: input.evidenceId },
        include: { contact: { select: { organizationId: true } } },
      });
      if (!row) return null;
      if (input.resourceId && row.contactId !== input.resourceId) return null;
      return {
        id: row.id,
        productSlug: "contact",
        organizationId: row.organizationId || row.contact.organizationId,
        resourceType: "LocalContact",
        resourceId: row.contactId,
        filename: row.filename,
        fileType: row.fileType,
        storageKey: row.storageKey,
        sensitivity: "confidential",
        uploadedById: row.uploadedById,
        createdAt: row.createdAt,
      };
    }
    case "workflow": {
      const row = await prisma.workflowEvidence.findUnique({
        where: { id: input.evidenceId },
      });
      if (!row) return null;
      if (input.resourceId && row.recordId !== input.resourceId) return null;
      return {
        id: row.id,
        productSlug: "workflow",
        organizationId: row.organizationId,
        resourceType: "WorkflowRecord",
        resourceId: row.recordId,
        filename: row.filename,
        fileType: row.fileType,
        storageKey: row.storageKey,
        sensitivity: "restricted",
        uploadedById: row.uploadedById,
        createdAt: row.createdAt,
      };
    }
    default:
      return null;
  }
}

/** Download authorization hook — tenant scope + stored file presence. */
export async function assertEvidenceDownloadAccess(params: {
  productSlug: EvidenceProductSlug;
  evidenceId: string;
  organizationId: string;
  resourceId?: string;
}): Promise<EvidenceRegistryRecord> {
  const record = await lookupEvidence({
    productSlug: params.productSlug,
    evidenceId: params.evidenceId,
    resourceId: params.resourceId,
  });

  if (!record) {
    throw new Error("Evidence not found");
  }
  if (record.organizationId !== params.organizationId) {
    throw new Error("Access denied: organization scope mismatch");
  }
  if (!record.storageKey) {
    throw new Error("Evidence not found or no file stored");
  }

  return record;
}

/**
 * Registration hook — facade phase logs intent; product services own persistence.
 * Returns metadata for callers that need a registry audit trail before product write.
 */
export async function registerEvidence(
  input: RegisterEvidenceInput,
): Promise<{ id: string; registered: false; productSlug: EvidenceProductSlug }> {
  await writePlatformAuditLog({
    productKey: input.productSlug,
    action: "evidence.register.requested",
    platformOrganizationId: input.organizationId,
    actorId: input.uploadedById,
    targetType: input.resourceType,
    targetId: input.resourceId,
    sourceSystem: "evidence_registry",
    severity: "info",
    status: "recorded",
    metadata: {
      filename: input.filename,
      fileType: input.fileType,
      sensitivity: input.sensitivity ?? "standard",
      storageKey: input.storageKey ?? null,
      facadePhase: true,
    },
  }).catch(() => {});

  return {
    id: `ev-pending-${input.productSlug}-${Date.now()}`,
    registered: false,
    productSlug: input.productSlug,
  };
}

