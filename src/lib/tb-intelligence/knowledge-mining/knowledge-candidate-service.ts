/**
 * Phase 8 — Knowledge Candidate Service.
 *
 * CRUD operations for candidate knowledge records.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import type { KnowledgeCandidateStatus, KnowledgeCandidateDTO } from "./types";

export type CandidateFilter = {
  status?: KnowledgeCandidateStatus;
  canonicalCode?: string;
  organizationId?: string;
  /** Platform-admin only: list institutional (organizationId = null) rows. */
  includeInstitutional?: boolean;
  search?: string;
  sortBy?: "supportCount" | "confidence" | "createdAt" | "updatedAt";
  sortDir?: "asc" | "desc";
  offset?: number;
  limit?: number;
};

export type CandidateListResult = {
  candidates: KnowledgeCandidateDTO[];
  total: number;
};

type RawCandidate = {
  id: string;
  organizationId: string | null;
  candidatePhrase: string;
  canonicalAccountId: string;
  canonicalCode: string;
  category: string;
  supportCount: number;
  organizationCount: number;
  confidence: number;
  status: KnowledgeCandidateStatus;
  source: string;
  reviewerId: string | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toDTO(candidate: RawCandidate): KnowledgeCandidateDTO {
  return {
    id: candidate.id,
    organizationId: candidate.organizationId,
    candidatePhrase: candidate.candidatePhrase,
    canonicalAccountId: candidate.canonicalAccountId,
    canonicalCode: candidate.canonicalCode,
    category: candidate.category,
    supportCount: candidate.supportCount,
    organizationCount: candidate.organizationCount,
    confidence: candidate.confidence,
    status: candidate.status,
    source: candidate.source,
    reviewerId: candidate.reviewerId,
    reviewedAt: candidate.reviewedAt?.toISOString() ?? null,
    reviewNotes: candidate.reviewNotes,
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
  };
}

/**
 * List knowledge candidates with filtering and pagination.
 */
export async function listCandidates(
  filter: CandidateFilter = {},
): Promise<CandidateListResult> {
  const where: Record<string, unknown> = {};

  if (filter.status) where.status = filter.status;
  if (filter.canonicalCode) where.canonicalCode = filter.canonicalCode;
  if (filter.organizationId) {
    where.organizationId = filter.organizationId;
  } else if (filter.includeInstitutional) {
    where.organizationId = null;
  } else {
    return { candidates: [], total: 0 };
  }
  if (filter.search) {
    where.candidatePhrase = { contains: filter.search, mode: "insensitive" };
  }

  const sortField = filter.sortBy ?? "createdAt";
  const sortDir = filter.sortDir ?? "desc";
  const offset = filter.offset ?? 0;
  const limit = Math.min(filter.limit ?? 50, 200);

  const [candidates, total] = await Promise.all([
    prisma.knowledgeCandidate.findMany({
      where,
      orderBy: { [sortField]: sortDir },
      skip: offset,
      take: limit,
    }),
    prisma.knowledgeCandidate.count({ where }),
  ]);

  return {
    candidates: (candidates as unknown as RawCandidate[]).map(toDTO),
    total,
  };
}

type EvidenceRow = {
  id: string;
  evidenceType: string;
  evidenceId: string;
  organizationId: string;
  accountCode: string;
  accountName: string | null;
  createdAt: Date;
};

type PromotionRow = {
  id: string;
  promotedBy: string;
  promotedAt: Date;
  artifactType: string;
  artifactPath: string | null;
  notes: string | null;
};

/**
 * Get a single candidate with evidence and promotion history.
 */
export async function getCandidate(
  id: string,
  organizationId?: string,
): Promise<{
  candidate: KnowledgeCandidateDTO | null;
  evidence: Array<{
    id: string;
    evidenceType: string;
    evidenceId: string;
    organizationId: string;
    accountCode: string;
    accountName: string | null;
    createdAt: string;
  }>;
  promotions: Array<{
    id: string;
    promotedBy: string;
    promotedAt: string;
    artifactType: string;
    artifactPath: string | null;
    notes: string | null;
  }>;
}> {
  const candidate = await prisma.knowledgeCandidate.findUnique({
    where: { id },
  });

  if (!candidate) {
    return { candidate: null, evidence: [], promotions: [] };
  }

  if (organizationId && candidate.organizationId !== organizationId) {
    return { candidate: null, evidence: [], promotions: [] };
  }

  const [evidence, promotions] = await Promise.all([
    prisma.knowledgeCandidateEvidence.findMany({
      where: { candidateId: id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.knowledgePromotionHistory.findMany({
      where: { candidateId: id },
      orderBy: { promotedAt: "desc" },
    }),
  ]);

  return {
    candidate: toDTO(candidate as unknown as RawCandidate),
    evidence: (evidence as unknown as EvidenceRow[]).map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
    promotions: (promotions as unknown as PromotionRow[]).map((p) => ({
      ...p,
      promotedAt: p.promotedAt.toISOString(),
    })),
  };
}

/**
 * Delete a candidate and its associated evidence/promotion history.
 * Blocked when the candidate is bound to a Knowledge Foundation version.
 */
export async function deleteCandidate(
  id: string,
  organizationId?: string,
): Promise<boolean> {
  if (organizationId) {
    const existing = await prisma.knowledgeCandidate.findUnique({
      where: { id },
      select: { organizationId: true },
    });
    if (!existing || existing.organizationId !== organizationId) {
      return false;
    }
  }
  const binding = await prisma.knowledgeFoundationVersionCandidate.findFirst({
    where: { candidateId: id },
    include: {
      version: {
        select: {
          id: true,
          versionNumber: true,
          status: true,
        },
      },
    },
  });

  if (binding) {
    throw new Error(
      `Cannot delete candidate. It is bound to Foundation Version ${binding.version.versionNumber} (${binding.version.status}). Unbind first.`,
    );
  }

  try {
    await prisma.knowledgeCandidate.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
