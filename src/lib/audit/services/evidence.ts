/**
 * Audit Services — Evidence domain
 *
 * Evidence CRUD, state management, storage, linking.
 */

import type { EvidenceObject, EvidenceLink } from "@/types/audit";
import { createLogger } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";
import type { PaginatedResult } from "@/lib/audit/pagination";
import * as mock from "../mock-data";
import { getDb, tryDb } from "./common";

const logger = createLogger({ product: "platform", action: "lib-audit-services-evidence" });

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

export async function createEvidence(params: {
  engagementId: string;
  filename: string;
  fileType: string;
  fileSize?: number;
  state?: string;
  uploadedById?: string;
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
    uploadedById: params.uploadedById,
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

  try {
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: params.engagementId },
      select: { organizationId: true },
    });
    if (engagement?.organizationId) {
      const { linkAuditEvidenceAfterUpload } = await import(
        "@/lib/core/evidence/link-after-upload"
      );
      await linkAuditEvidenceAfterUpload({
        organizationId: engagement.organizationId,
        engagementId: params.engagementId,
        evidenceId: evidence.id,
        filename: params.filename,
        actorId: params.actorId,
      });
    }
  } catch {
    // Graph linkage is best-effort
  }

  return { evidence };
}

export async function createEvidenceWithStorage(params: {
  engagementId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  fileHash: string;
  storageKey: string;
  uploadedById?: string;
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
    uploadedById: params.uploadedById,
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

  try {
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: params.engagementId },
      select: { organizationId: true },
    });
    if (engagement?.organizationId) {
      const { linkAuditEvidenceAfterUpload } = await import(
        "@/lib/core/evidence/link-after-upload"
      );
      await linkAuditEvidenceAfterUpload({
        organizationId: engagement.organizationId,
        engagementId: params.engagementId,
        evidenceId: evidence.id,
        filename: params.filename,
        actorId: params.actorId,
      });
    }
  } catch {
    // Graph linkage is best-effort
  }

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
  logger.warn("[AuditServices] updateEvidenceState called without audit event — use updateEvidenceStateWithEvent instead");
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
  actor: { actorId: string; actorName: string; actorRole: string }) {
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

  try {
    const { syncAuditEvidenceStateToCore } = await import(
      "@/lib/core/evidence/adapters/audit-adapter"
    );
    await syncAuditEvidenceStateToCore({
      evidenceId: id,
      newState: state,
      actorId: actor.actorId,
    });
  } catch {
    // Platform sync is best-effort
  }

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

  try {
    const { syncAuditEvidenceLinkToCore } = await import(
      "@/lib/core/evidence/adapters/audit-adapter"
    );
    await syncAuditEvidenceLinkToCore({
      evidenceId: params.evidenceId,
      targetType: params.targetType,
      targetId: params.targetId,
      context: params.context,
      createdBy: params.actorId,
    });
  } catch {
    // Platform sync is best-effort
  }

  return { link };
}
