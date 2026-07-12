import { prisma } from "@/lib/prisma";
import type { EvidenceObject, EvidenceLink } from "@/types/audit";
import type { PaginatedResult } from "@/lib/audit/pagination";
import {
  paginate,
  offsetFromPage,
  DEFAULT_PAGE_SIZE,
} from "@/lib/audit/pagination";
import {
  toEvidenceObject,
  toEvidenceLink,
  protectedAuditReadUnavailable,
} from "./types";

export async function getEvidence(
  engagementId: string,
): Promise<EvidenceObject[]> {
  try {
    const evidence = await prisma.auditEvidence.findMany({
      where: { engagementId },
      include: { links: true },
      orderBy: { createdAt: "desc" },
    });
    if (evidence.length === 0) return [];
    return evidence.map(toEvidenceObject);
  } catch (error) {
    protectedAuditReadUnavailable(`getEvidence(${engagementId})`, error);
  }
}

export async function getEvidencePaginated(
  engagementId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<EvidenceObject>> {
  try {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(
      1,
      Math.min(100, params.pageSize ?? DEFAULT_PAGE_SIZE),
    );
    const skip = offsetFromPage(page, pageSize);
    const [evidence, total] = await Promise.all([
      prisma.auditEvidence.findMany({
        where: { engagementId },
        include: { links: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.auditEvidence.count({ where: { engagementId } }),
    ]);
    return paginate(evidence.map(toEvidenceObject), total, { page, pageSize });
  } catch (error) {
    protectedAuditReadUnavailable(
      `getEvidencePaginated(${engagementId})`,
      error,
    );
  }
}

export async function getMissingEvidence(
  engagementId: string,
): Promise<EvidenceObject[]> {
  try {
    const evidence = await prisma.auditEvidence.findMany({
      where: { engagementId, state: "missing" },
      include: { links: true },
    });
    return evidence.map(toEvidenceObject);
  } catch (error) {
    protectedAuditReadUnavailable(`getMissingEvidence(${engagementId})`, error);
  }
}

export async function createEvidence(data: {
  engagementId: string;
  filename: string;
  fileType: string;
  fileSize?: number;
  state?: string;
  uploadedById?: string;
  fileHash?: string;
  storageKey?: string;
}): Promise<EvidenceObject> {
  const ev = await prisma.auditEvidence.create({
    data: {
      engagementId: data.engagementId,
      filename: data.filename,
      fileType: data.fileType,
      fileSize: data.fileSize ?? 0,
      state: data.state ?? "missing",
      uploadedById: data.uploadedById ?? null,
      uploadedAt: data.uploadedById ? new Date() : null,
      fileHash: data.fileHash ?? null,
      storageKey: data.storageKey ?? null,
    },
    include: { links: true },
  });
  return toEvidenceObject(ev);
}

export async function updateEvidenceState(
  id: string,
  state: string,
  userId?: string,
): Promise<EvidenceObject> {
  const ev = await prisma.auditEvidence.update({
    where: { id },
    data: {
      state,
      uploadedById: userId ?? undefined,
      uploadedAt: userId ? new Date() : undefined,
    },
    include: { links: true },
  });
  return toEvidenceObject(ev);
}

export async function updateEvidenceStorage(
  id: string,
  data: {
    fileHash: string;
    storageKey: string;
    fileSize: number;
  },
): Promise<EvidenceObject | null> {
  try {
    const ev = await prisma.auditEvidence.update({
      where: { id },
      data: {
        fileHash: data.fileHash,
        storageKey: data.storageKey,
        fileSize: data.fileSize,
        state: "uploaded",
        uploadedAt: new Date(),
      },
      include: { links: true },
    });
    return toEvidenceObject(ev);
  } catch {
    return null;
  }
}

export async function createEvidenceLink(data: {
  evidenceId: string;
  targetType: string;
  targetId: string;
  linkType?: string;
  context?: string;
  createdBy?: string;
}): Promise<EvidenceLink> {
  const link = await prisma.auditEvidenceLink.create({
    data: {
      evidenceId: data.evidenceId,
      targetType: data.targetType,
      targetId: data.targetId,
      linkType: data.linkType ?? "supports",
      context: data.context ?? null,
      createdBy: data.createdBy ?? null,
    },
  });
  return toEvidenceLink(link);
}

export async function getEvidenceLinksForEvidence(
  evidenceId: string,
): Promise<EvidenceLink[]> {
  const links = await prisma.auditEvidenceLink.findMany({
    where: { evidenceId },
  });
  return links.map(toEvidenceLink);
}

export async function getEvidenceLinksForTarget(
  targetType: string,
  targetId: string,
): Promise<EvidenceLink[]> {
  const links = await prisma.auditEvidenceLink.findMany({
    where: { targetType, targetId },
  });
  return links.map(toEvidenceLink);
}
