import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { emitFoundationEvent } from "./events";
import { registerFoundationAuditHandler } from "./audit-handler";
import { bindCandidatesToVersion } from "./candidate-bridge";
import { verifyReleaseIntegrity } from "./release-integrity";
import type {
  CreateVersionInput,
  ApproveVersionInput,
  UpdateVersionStatusInput,
  VersionListItem,
  FoundationKPIs,
} from "./types";

// Wire audit handler at import time (idempotent)
registerFoundationAuditHandler();

async function assertOperator(): Promise<{ id: string; role: string }> {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
    throw new Error("Access denied: OPERATOR role required");
  }
  return user;
}

async function assertAdmin(): Promise<{ id: string; role: string }> {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Access denied: ADMIN role required");
  }
  return user;
}

// ─── Version CRUD ────────────────────────────────────────────────

export async function createVersion(input: CreateVersionInput) {
  const actor = await assertOperator();

  const version = await prisma.knowledgeFoundationVersion.create({
    data: {
      versionNumber: input.versionNumber,
      notes: input.notes,
      createdById: input.createdById,
      status: "DRAFT",
      candidateCount: 0,
    },
  });

  let candidateCount = 0;
  if (input.candidateIds && input.candidateIds.length > 0) {
    const bindResult = await bindCandidatesToVersion({
      versionId: version.id,
      candidateIds: input.candidateIds,
      boundById: actor.id,
      notes: input.notes,
    });
    candidateCount = bindResult.candidateCount;
  }

  await emitFoundationEvent({
    type: "knowledge.foundation.version.created",
    versionId: version.id,
    actorId: actor.id,
    timestamp: new Date().toISOString(),
    versionNumber: version.versionNumber,
    notes: input.notes,
    payload: {
      candidateIds: input.candidateIds ?? [],
      candidateCount,
    },
  });

  return prisma.knowledgeFoundationVersion.findUniqueOrThrow({
    where: { id: version.id },
  });
}

export async function approveVersion(input: ApproveVersionInput) {
  const actor = await assertAdmin();

  const version = await prisma.knowledgeFoundationVersion.findUniqueOrThrow({
    where: { id: input.versionId },
  });

  if (version.status !== "DRAFT" && version.status !== "APPROVED") {
    throw new Error(
      `Cannot approve version in status "${version.status}". Must be DRAFT.`,
    );
  }

  const updated = await prisma.knowledgeFoundationVersion.update({
    where: { id: input.versionId },
    data: {
      status: "APPROVED",
      approvedById: input.approvedById,
      notes: input.notes ?? version.notes,
    },
  });

  await emitFoundationEvent({
    type: "knowledge.foundation.version.approved",
    versionId: version.id,
    actorId: actor.id,
    timestamp: new Date().toISOString(),
    versionNumber: version.versionNumber,
    previousStatus: version.status,
    newStatus: "APPROVED",
    notes: input.notes,
  });

  return updated;
}

export async function releaseVersion(input: { versionId: string; releaseNotes?: string }) {
  throw new Error(
    "releaseVersion is deprecated after Phase 28.2. Use generateReleasePackage via generateFoundationRelease.",
  );
}

export async function activateVersion(input: { versionId: string }) {
  const actor = await assertAdmin();

  const version = await prisma.knowledgeFoundationVersion.findUniqueOrThrow({
    where: { id: input.versionId },
  });

  if (version.status !== "RELEASED") {
    throw new Error(
      `Cannot activate version in status "${version.status}". Must be RELEASED.`,
    );
  }

  const integrity = await verifyReleaseIntegrity(input.versionId, {
    actorId: actor.id,
    versionNumber: version.versionNumber,
    emitAudit: true,
    forActivation: true,
  });

  if (!integrity.valid) {
    throw new Error(
      `Release integrity verification failed: ${integrity.blockers.join("; ")}`,
    );
  }

  // Deactivate currently active version
  await prisma.knowledgeFoundationVersion.updateMany({
    where: { status: "ACTIVE" },
    data: { status: "DEPRECATED" },
  });

  // Activate new version
  const updated = await prisma.knowledgeFoundationVersion.update({
    where: { id: input.versionId },
    data: {
      status: "ACTIVE",
      activatedAt: new Date(),
    },
  });

  await emitFoundationEvent({
    type: "knowledge.foundation.version.activated",
    versionId: version.id,
    actorId: actor.id,
    timestamp: new Date().toISOString(),
    versionNumber: version.versionNumber,
    previousStatus: version.status,
    newStatus: "ACTIVE",
  });

  return updated;
}

export async function deprecateVersion(input: { versionId: string; notes?: string }) {
  const actor = await assertAdmin();

  const version = await prisma.knowledgeFoundationVersion.findUniqueOrThrow({
    where: { id: input.versionId },
  });

  if (version.status !== "ACTIVE" && version.status !== "RELEASED") {
    throw new Error(
      `Cannot deprecate version in status "${version.status}". Must be ACTIVE or RELEASED.`,
    );
  }

  const updated = await prisma.knowledgeFoundationVersion.update({
    where: { id: input.versionId },
    data: { status: "DEPRECATED" },
  });

  await emitFoundationEvent({
    type: "knowledge.foundation.version.deprecated",
    versionId: version.id,
    actorId: actor.id,
    timestamp: new Date().toISOString(),
    versionNumber: version.versionNumber,
    previousStatus: version.status,
    newStatus: "DEPRECATED",
    notes: input.notes,
  });

  return updated;
}

// ─── Queries ──────────────────────────────────────────────────────

function assertVersionAccess(userRole: string, versionStatus: string): void {
  const statusLower = versionStatus.toLowerCase();
  
  if (userRole === "ADMIN") {
    return; // ADMIN can access all statuses
  }
  
  if (userRole === "OPERATOR") {
    // OPERATOR can access ACTIVE, RELEASED, APPROVED
    if (statusLower === "active" || statusLower === "released" || statusLower === "approved") {
      return;
    }
  }
  
  if (userRole === "VIEWER") {
    // VIEWER can access ACTIVE only
    if (statusLower === "active") {
      return;
    }
  }
  
  throw new Error(`Access denied: Cannot access version in status "${versionStatus}" with role "${userRole}"`);
}

export async function getVersions(): Promise<VersionListItem[]> {
  const actor = await getCurrentUser();
  
  const versions = await prisma.knowledgeFoundationVersion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true } },
    },
  });

  // Filter based on user role for list view
  const accessibleVersions = versions.filter(v => {
    try {
      assertVersionAccess(actor.role, v.status);
      return true;
    } catch {
      return false;
    }
  });

  return accessibleVersions.map((v) => ({
    id: v.id,
    versionNumber: v.versionNumber,
    status: v.status,
    candidateCount: v.candidateCount,
    createdById: v.createdById,
    createdByName: v.createdBy?.name ?? null,
    approvedById: v.approvedById ?? null,
    approvedByName: v.approvedBy?.name ?? null,
    activatedAt: v.activatedAt?.toISOString() ?? null,
    createdAt: v.createdAt.toISOString(),
    rollbackVersionId: v.rollbackVersionId ?? null,
    notes: v.notes ?? null,
  }));
}

export async function getVersion(id: string) {
  const actor = await getCurrentUser();
  
  const version = await prisma.knowledgeFoundationVersion.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
      releases: {
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, name: true } },
        },
      },
      diffsAsFrom: {
        include: {
          toVersion: { select: { id: true, versionNumber: true } },
        },
      },
      diffsAsTo: {
        include: {
          fromVersion: { select: { id: true, versionNumber: true } },
        },
      },
    },
  });

  if (!version) {
    return null;
  }

  // Check access permissions
  await assertVersionAccess(actor.role, version.status);

  return {
    id: version.id,
    versionNumber: version.versionNumber,
    status: version.status,
    candidateCount: version.candidateCount,
    createdById: version.createdById,
    createdByName: version.createdBy?.name ?? null,
    approvedById: version.approvedById ?? null,
    approvedByName: version.approvedBy?.name ?? null,
    activatedAt: version.activatedAt ?? null,
    createdAt: version.createdAt.toISOString(),
    rollbackVersionId: version.rollbackVersionId ?? null,
    notes: version.notes ?? null,
    artifactPath: version.artifactPath ?? null,
    releases: version.releases,
    diffsAsFrom: version.diffsAsFrom,
    diffsAsTo: version.diffsAsTo,
    createdBy: version.createdBy
      ? { id: version.createdBy.id, name: version.createdBy.name, email: version.createdBy.email }
      : null,
    approvedBy: version.approvedBy
      ? { id: version.approvedBy.id, name: version.approvedBy.name, email: version.approvedBy.email }
      : null,
  };
}

export async function getFoundationKPIs(): Promise<FoundationKPIs> {
  const active = await prisma.knowledgeFoundationVersion.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { activatedAt: "desc" },
  });

  const [
    totalVersions,
    totalReleases,
    rollbackCount,
    statusGroups,
    boundCandidates,
    releasedCandidates,
    promotedCandidates,
  ] = await Promise.all([
    prisma.knowledgeFoundationVersion.count(),
    prisma.knowledgeFoundationRelease.count(),
    prisma.knowledgeFoundationVersion.count({
      where: { rollbackVersionId: { not: null } },
    }),
    prisma.knowledgeFoundationVersion.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.knowledgeFoundationVersionCandidate.count(),
    prisma.knowledgeFoundationVersionCandidate.count({
      where: { includedInRelease: true },
    }),
    prisma.knowledgeCandidate.findMany({
      where: { status: "PROMOTED" },
      select: {
        id: true,
        confidence: true,
        _count: { select: { evidence: true } },
      },
    }),
  ]);

  const versionCounts = {
    DRAFT: 0,
    APPROVED: 0,
    RELEASED: 0,
    ACTIVE: 0,
    DEPRECATED: 0,
  };
  for (const g of statusGroups) {
    const key = g.status as keyof typeof versionCounts;
    if (key in versionCounts) {
      versionCounts[key] = g._count._all;
    }
  }

  const boundIds = await prisma.knowledgeFoundationVersionCandidate.findMany({
    select: { candidateId: true },
  });
  const boundIdSet = new Set(boundIds.map((b) => b.candidateId));
  const eligiblePromoted = promotedCandidates.filter(
    (c) => !boundIdSet.has(c.id),
  ).length;

  let confidenceSum = 0;
  let evidenceSum = 0;
  for (const c of promotedCandidates) {
    confidenceSum += c.confidence;
    evidenceSum += c._count.evidence;
  }
  const poolSize = promotedCandidates.length;

  return {
    activeVersion: active?.versionNumber ?? null,
    totalVersions,
    totalReleases,
    rollbackCount,
    latestVersionId: active?.id ?? null,
    versionCounts,
    candidateMetrics: {
      eligiblePromoted,
      boundCandidates,
      releasedCandidates,
      averageConfidence: poolSize > 0 ? confidenceSum / poolSize : 0,
      averageEvidenceCount: poolSize > 0 ? evidenceSum / poolSize : 0,
    },
  };
}
