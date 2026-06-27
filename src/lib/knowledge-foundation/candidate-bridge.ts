import "server-only";

import { prisma } from "@/lib/prisma";
import { emitFoundationEvent } from "./events";

export type BoundCandidateRow = {
  bindingId: string;
  candidateId: string;
  candidatePhrase: string;
  canonicalCode: string;
  category: string;
  confidence: number;
  supportCount: number;
  organizationCount: number;
  boundAt: string;
  boundById: string;
  boundByName: string | null;
  includedInRelease: boolean;
  notes: string | null;
  promotionDate: string | null;
  evidenceCount: number;
  contributingOrganizationCount: number;
};

export type EligiblePromotedCandidate = {
  id: string;
  candidatePhrase: string;
  canonicalCode: string;
  category: string;
  confidence: number;
  supportCount: number;
  organizationCount: number;
  promotedAt: string | null;
  evidenceCount: number;
};

export type VersionCandidateStats = {
  versionId: string;
  boundCount: number;
  includedInReleaseCount: number;
};

async function assertDraftVersion(versionId: string) {
  const version = await prisma.knowledgeFoundationVersion.findUniqueOrThrow({
    where: { id: versionId },
    select: { id: true, status: true, versionNumber: true },
  });

  if (version.status !== "DRAFT") {
    throw new Error(
      `Cannot modify candidate bindings for version in status "${version.status}". Must be DRAFT.`,
    );
  }

  return version;
}

export async function syncVersionCandidateCount(versionId: string): Promise<number> {
  const count = await prisma.knowledgeFoundationVersionCandidate.count({
    where: { versionId },
  });

  await prisma.knowledgeFoundationVersion.update({
    where: { id: versionId },
    data: { candidateCount: count },
  });

  return count;
}

/**
 * PROMOTED candidates not yet bound to any foundation version.
 */
export async function listEligiblePromotedCandidates(): Promise<
  EligiblePromotedCandidate[]
> {
  const boundIds = await prisma.knowledgeFoundationVersionCandidate.findMany({
    select: { candidateId: true },
  });
  const exclude = new Set(boundIds.map((b) => b.candidateId));

  const candidates = await prisma.knowledgeCandidate.findMany({
    where: {
      status: "PROMOTED",
      ...(exclude.size > 0 ? { id: { notIn: [...exclude] } } : {}),
    },
    include: {
      promotionHistory: { orderBy: { promotedAt: "desc" }, take: 1 },
      _count: { select: { evidence: true } },
    },
    orderBy: [{ supportCount: "desc" }, { confidence: "desc" }],
  });

  return candidates.map((c) => ({
    id: c.id,
    candidatePhrase: c.candidatePhrase,
    canonicalCode: c.canonicalCode,
    category: c.category,
    confidence: c.confidence,
    supportCount: c.supportCount,
    organizationCount: c.organizationCount,
    promotedAt: c.promotionHistory[0]?.promotedAt.toISOString() ?? null,
    evidenceCount: c._count.evidence,
  }));
}

export async function listBoundCandidates(
  versionId: string,
): Promise<BoundCandidateRow[]> {
  const bindings = await prisma.knowledgeFoundationVersionCandidate.findMany({
    where: { versionId },
    include: {
      candidate: {
        include: {
          promotionHistory: { orderBy: { promotedAt: "desc" }, take: 1 },
          evidence: { select: { organizationId: true } },
        },
      },
      boundBy: { select: { id: true, name: true } },
    },
    orderBy: { boundAt: "asc" },
  });

  return bindings.map((b) => {
    const orgIds = new Set(
      b.candidate.evidence.map((e) => e.organizationId).filter(Boolean),
    );
    return {
      bindingId: b.id,
      candidateId: b.candidateId,
      candidatePhrase: b.candidate.candidatePhrase,
      canonicalCode: b.candidate.canonicalCode,
      category: b.candidate.category,
      confidence: b.candidate.confidence,
      supportCount: b.candidate.supportCount,
      organizationCount: b.candidate.organizationCount,
      boundAt: b.boundAt.toISOString(),
      boundById: b.boundById,
      boundByName: b.boundBy?.name ?? null,
      includedInRelease: b.includedInRelease,
      notes: b.notes,
      promotionDate:
        b.candidate.promotionHistory[0]?.promotedAt.toISOString() ?? null,
      evidenceCount: b.candidate.evidence.length,
      contributingOrganizationCount: orgIds.size,
    };
  });
}

export async function getVersionCandidateStats(
  versionId: string,
): Promise<VersionCandidateStats> {
  const [boundCount, includedInReleaseCount] = await Promise.all([
    prisma.knowledgeFoundationVersionCandidate.count({ where: { versionId } }),
    prisma.knowledgeFoundationVersionCandidate.count({
      where: { versionId, includedInRelease: true },
    }),
  ]);

  return { versionId, boundCount, includedInReleaseCount };
}

export async function bindCandidatesToVersion(input: {
  versionId: string;
  candidateIds: string[];
  boundById: string;
  notes?: string;
}): Promise<{ bound: number; candidateCount: number }> {
  const version = await assertDraftVersion(input.versionId);

  if (input.candidateIds.length === 0) {
    return { bound: 0, candidateCount: await syncVersionCandidateCount(input.versionId) };
  }

  const uniqueIds = [...new Set(input.candidateIds)];

  const candidates = await prisma.knowledgeCandidate.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, status: true },
  });

  if (candidates.length !== uniqueIds.length) {
    throw new Error("One or more candidates were not found");
  }

  const notPromoted = candidates.filter((c) => c.status !== "PROMOTED");
  if (notPromoted.length > 0) {
    throw new Error(
      `Cannot bind candidates that are not PROMOTED: ${notPromoted.map((c) => c.id).join(", ")}`,
    );
  }

  const alreadyBound = await prisma.knowledgeFoundationVersionCandidate.findMany({
    where: { candidateId: { in: uniqueIds } },
    select: { candidateId: true, versionId: true },
  });

  const conflicts = alreadyBound.filter((b) => b.versionId !== input.versionId);
  if (conflicts.length > 0) {
    throw new Error(
      `Candidates already bound to another version: ${conflicts.map((c) => c.candidateId).join(", ")}`,
    );
  }

  const existingOnVersion = new Set(
    (
      await prisma.knowledgeFoundationVersionCandidate.findMany({
        where: { versionId: input.versionId, candidateId: { in: uniqueIds } },
        select: { candidateId: true },
      })
    ).map((b) => b.candidateId),
  );

  const toCreate = uniqueIds.filter((id) => !existingOnVersion.has(id));
  const timestamp = new Date().toISOString();

  if (toCreate.length > 0) {
    await prisma.knowledgeFoundationVersionCandidate.createMany({
      data: toCreate.map((candidateId) => ({
        versionId: input.versionId,
        candidateId,
        boundById: input.boundById,
        notes: input.notes ?? null,
      })),
    });

    await Promise.all(
      toCreate.map((candidateId) =>
        emitFoundationEvent({
          type: "knowledge.foundation.candidate.bound",
          versionId: input.versionId,
          actorId: input.boundById,
          timestamp,
          versionNumber: version.versionNumber,
          payload: { candidateId, notes: input.notes ?? null },
        }),
      ),
    );
  }

  const candidateCount = await syncVersionCandidateCount(input.versionId);
  return { bound: toCreate.length, candidateCount };
}

export async function unbindCandidateFromVersion(input: {
  versionId: string;
  candidateId: string;
  actorId: string;
}): Promise<{ candidateCount: number }> {
  const version = await assertDraftVersion(input.versionId);

  const binding = await prisma.knowledgeFoundationVersionCandidate.findFirst({
    where: {
      versionId: input.versionId,
      candidateId: input.candidateId,
    },
  });

  if (!binding) {
    throw new Error("Candidate is not bound to this version");
  }

  await prisma.knowledgeFoundationVersionCandidate.delete({
    where: { id: binding.id },
  });

  await emitFoundationEvent({
    type: "knowledge.foundation.candidate.unbound",
    versionId: input.versionId,
    actorId: input.actorId,
    timestamp: new Date().toISOString(),
    versionNumber: version.versionNumber,
    payload: { candidateId: input.candidateId },
  });

  const candidateCount = await syncVersionCandidateCount(input.versionId);
  return { candidateCount };
}

/**
 * Mark all bindings for a version as included in a release snapshot.
 */
export async function markVersionBindingsReleased(
  versionId: string,
): Promise<number> {
  const result = await prisma.knowledgeFoundationVersionCandidate.updateMany({
    where: { versionId },
    data: {
      includedInRelease: true,
      releasedAt: new Date(),
    },
  });
  return result.count;
}
