/**
 * Phase 8 — Knowledge Promotion Service.
 *
 * Promotes approved candidates to knowledge artifacts.
 *
 * IMPORTANT:
 * - Promotion generates candidate artifacts (candidate-synonyms.json, candidate-rule-pack.json).
 * - Promotion does NOT modify production files (synonyms.ts, coa-loader.ts, etc.).
 * - Human merge is required for production adoption.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import { emitReviewEvent } from "@/lib/knowledge-review/events";
import { registerAuditHandler } from "@/lib/knowledge-review/audit-handler";
import { promises as fs } from "fs";
import * as path from "path";
import type { PromotionInput, PromotionResult } from "./types";

// Register the audit handler so promotion events write a PlatformAuditLog.
// Idempotent — safe to call multiple times.
registerAuditHandler();

const CANDIDATE_ARTIFACTS_DIR = path.join(
  process.cwd(),
  "knowledge",
  "tb-intelligence",
  "candidates",
);

async function ensureArtifactDir(): Promise<void> {
  try {
    await fs.mkdir(CANDIDATE_ARTIFACTS_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

type SynonymEntry = {
  id: string;
  candidatePhrase: string;
  canonicalCode: string;
  category: string;
  confidence: number;
  supportCount: number;
  organizationCount: number;
};

type RuleEntry = {
  id: string;
  candidatePhrase: string;
  canonicalCode: string;
  category: string;
  confidence: number;
  supportCount: number;
  organizationCount: number;
};

async function generateCandidateSynonymsArtifact(
  candidateIds: string[],
  version: string,
): Promise<string> {
  await ensureArtifactDir();

  // Bounded by in(candidateIds) — IDs from caller, naturally limited
  const rows = await prisma.knowledgeCandidate.findMany({
    where: { id: { in: candidateIds }, status: "APPROVED" },
    select: {
      id: true,
      candidatePhrase: true,
      canonicalCode: true,
      category: true,
      confidence: true,
      supportCount: true,
      organizationCount: true,
    },
    take: 100,
  });
  const candidates = rows as unknown as SynonymEntry[];

  const synonyms = candidates.map((c: SynonymEntry) => ({
    suggestedAliases: [c.candidatePhrase],
    canonicalCode: c.canonicalCode,
    category: c.category,
    confidence: c.confidence,
    supportCount: c.supportCount,
    organizationCount: c.organizationCount,
    candidateId: c.id,
  }));

  const artifact = {
    meta: {
      artifactType: "candidate-synonyms",
      version,
      generatedAt: new Date().toISOString(),
      generatedBy: "knowledge-mining/promotion-service",
      totalCandidates: synonyms.length,
      status: "candidate",
      requiresHumanReview: true,
      instructions:
        "Review each entry and manually merge into src/lib/tb-intelligence/synonyms.ts",
    },
    synonyms,
  };

  const filename = `candidate-synonyms-${version.replace(/\./g, "-")}.json`;
  const filepath = path.join(CANDIDATE_ARTIFACTS_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(artifact, null, 2), "utf-8");

  return filepath;
}

async function generateCandidateRulePackArtifact(
  candidateIds: string[],
  version: string,
): Promise<string> {
  await ensureArtifactDir();

  // Bounded by in(candidateIds) — IDs from caller, naturally limited
  const rows = await prisma.knowledgeCandidate.findMany({
    where: { id: { in: candidateIds }, status: "APPROVED" },
    select: {
      id: true,
      candidatePhrase: true,
      canonicalCode: true,
      category: true,
      confidence: true,
      supportCount: true,
      organizationCount: true,
    },
    take: 100,
  });
  const candidates = rows as unknown as RuleEntry[];

  const rules = candidates.map((c: RuleEntry) => ({
    pattern: c.candidatePhrase,
    targetCode: c.canonicalCode,
    category: c.category,
    type: "synonym" as const,
    priority: "medium" as const,
    confidence: c.confidence,
    evidence: {
      supportCount: c.supportCount,
      organizationCount: c.organizationCount,
      candidateId: c.id,
    },
  }));

  const artifact = {
    meta: {
      artifactType: "candidate-rule-pack",
      version,
      generatedAt: new Date().toISOString(),
      generatedBy: "knowledge-mining/promotion-service",
      totalRules: rules.length,
      status: "candidate",
      requiresHumanReview: true,
      instructions:
        "Review each rule and manually merge into production rule sources if appropriate.",
    },
    rules,
  };

  const filename = `candidate-rule-pack-${version.replace(/\./g, "-")}.json`;
  const filepath = path.join(CANDIDATE_ARTIFACTS_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(artifact, null, 2), "utf-8");

  return filepath;
}

/**
 * Promote approved candidates to a knowledge artifact.
 * Creates a KnowledgePromotionHistory record and generates the artifact file.
 */
export async function promoteCandidates(
  input: PromotionInput,
): Promise<PromotionResult> {
  const candidate = await prisma.knowledgeCandidate.findUnique({
    where: { id: input.candidateId },
    select: { id: true, status: true },
  });

  if (!candidate) {
    return { success: false, artifactPath: "", error: "Candidate not found" };
  }

  if (candidate.status !== "APPROVED") {
    return {
      success: false,
      artifactPath: "",
      error: `Cannot promote candidate with status ${candidate.status}. Must be APPROVED.`,
    };
  }

  const version = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  let artifactPath: string;

  if (input.artifactType === "candidate-synonyms") {
    artifactPath = await generateCandidateSynonymsArtifact(
      [input.candidateId],
      version,
    );
  } else {
    artifactPath = await generateCandidateRulePackArtifact(
      [input.candidateId],
      version,
    );
  }

  await prisma.knowledgePromotionHistory.create({
    data: {
      candidateId: input.candidateId,
      promotedBy: input.promotedBy,
      artifactType: input.artifactType,
      artifactPath,
      artifactVersion: version,
      notes: input.notes ?? null,
    },
  });

  await prisma.knowledgeCandidate.update({
    where: { id: input.candidateId },
    data: { status: "PROMOTED" },
  });

  // Emit promotion event
  await emitReviewEvent({
    type: "knowledge.candidate.promoted",
    candidateId: input.candidateId,
    actorId: input.promotedBy,
    timestamp: new Date().toISOString(),
    previousStatus: "APPROVED",
    newStatus: "PROMOTED",
    notes: input.notes ?? undefined,
    artifactPath,
  });

  return { success: true, artifactPath };
}

/**
 * Batch promote all APPROVED candidates to a combined artifact.
 * Useful for generating periodic review snapshots.
 */
export async function batchPromoteCandidates(params: {
  promotedBy: string;
  artifactType: "candidate-synonyms" | "candidate-rule-pack";
  notes?: string;
  organizationId?: string;
}): Promise<{ promoted: number; artifactPath: string }> {
  // Bounded by status:"APPROVED" — only approved candidates eligible for promotion
  const approved = await prisma.knowledgeCandidate.findMany({
    where: {
      status: "APPROVED",
      ...(params.organizationId ? { organizationId: params.organizationId } : {}),
    },
    select: { id: true },
    take: 100,
  });

  if (approved.length === 0) {
    return { promoted: 0, artifactPath: "" };
  }

  const candidateIds = approved.map((c: { id: string }) => c.id);
  const version = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  let artifactPath: string;

  if (params.artifactType === "candidate-synonyms") {
    artifactPath = await generateCandidateSynonymsArtifact(candidateIds, version);
  } else {
    artifactPath = await generateCandidateRulePackArtifact(candidateIds, version);
  }

  await prisma.knowledgePromotionHistory.createMany({
    data: candidateIds.map((cid: string) => ({
      candidateId: cid,
      promotedBy: params.promotedBy,
      artifactType: params.artifactType,
      artifactPath,
      artifactVersion: version,
      notes: params.notes ?? null,
    })),
  });

  await prisma.knowledgeCandidate.updateMany({
    where: { id: { in: candidateIds } },
    data: { status: "PROMOTED" },
  });

  // Emit a promotion event per candidate
  const timestamp = new Date().toISOString();
  await Promise.all(
    candidateIds.map((cid: string) =>
      emitReviewEvent({
        type: "knowledge.candidate.promoted",
        candidateId: cid,
        actorId: params.promotedBy,
        timestamp,
        previousStatus: "APPROVED",
        newStatus: "PROMOTED",
        notes: params.notes ?? undefined,
        artifactPath,
      }),
    ),
  );

  return { promoted: approved.length, artifactPath };
}
