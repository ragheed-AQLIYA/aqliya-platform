import "server-only";
import { prisma } from "@/lib/prisma";
import { emitFoundationEvent } from "./events";
import type { DiffResult } from "./types";
import { loadVersionBoundCandidates } from "./version-candidate-snapshot";

/**
 * Compare two knowledge foundation versions by their bound candidate sets.
 */
export async function generateDiff(
  fromVersionId: string,
  toVersionId: string,
  actorId: string,
): Promise<DiffResult> {
  const [fromVersion, toVersion] = await Promise.all([
    prisma.knowledgeFoundationVersion.findUniqueOrThrow({
      where: { id: fromVersionId },
    }),
    prisma.knowledgeFoundationVersion.findUniqueOrThrow({
      where: { id: toVersionId },
    }),
  ]);

  const [fromBound, toBound] = await Promise.all([
    loadVersionBoundCandidates(fromVersionId),
    loadVersionBoundCandidates(toVersionId),
  ]);

  const fromMap = new Map(fromBound.map((c) => [c.canonicalCode, c]));
  const toMap = new Map(toBound.map((c) => [c.canonicalCode, c]));

  const addedRules: DiffResult["addedRules"] = [];
  const removedRules: DiffResult["removedRules"] = [];
  const modifiedRules: DiffResult["modifiedRules"] = [];

  for (const [code, candidate] of toMap) {
    if (!fromMap.has(code)) {
      addedRules.push({
        phrase: candidate.candidatePhrase,
        canonicalCode: candidate.canonicalCode,
        category: candidate.category,
        confidence: candidate.confidence,
      });
    } else {
      const existing = fromMap.get(code)!;
      if (existing.confidence !== candidate.confidence) {
        modifiedRules.push({
          phrase: candidate.candidatePhrase,
          canonicalCode: candidate.canonicalCode,
          category: candidate.category,
          oldConfidence: existing.confidence,
          newConfidence: candidate.confidence,
        });
      }
    }
  }

  for (const [code, candidate] of fromMap) {
    if (!toMap.has(code)) {
      removedRules.push({
        phrase: candidate.candidatePhrase,
        canonicalCode: candidate.canonicalCode,
        category: candidate.category,
        confidence: candidate.confidence,
      });
    }
  }

  const breakingChange = removedRules.length > 0;
  const totalChanges =
    addedRules.length + modifiedRules.length + removedRules.length;
  const riskScore =
    totalChanges > 0
      ? Math.round(
          ((addedRules.length * 0.3 +
            modifiedRules.length * 0.5 +
            removedRules.length * 1.0) /
            totalChanges) *
            100,
        ) / 100
      : 0;

  const summary = buildSummary(
    fromVersion.versionNumber,
    toVersion.versionNumber,
    addedRules,
    modifiedRules,
    removedRules,
  );

  await prisma.knowledgeFoundationDiff.upsert({
    where: { fromVersionId_toVersionId: { fromVersionId, toVersionId } },
    update: {
      addedRules,
      modifiedRules,
      removedRules,
      riskScore,
      breakingChange,
      summary,
    },
    create: {
      fromVersionId,
      toVersionId,
      addedRules,
      modifiedRules,
      removedRules,
      riskScore,
      breakingChange,
      summary,
    },
  });

  await emitFoundationEvent({
    type: "knowledge.foundation.diff.generated",
    versionId: toVersionId,
    actorId,
    timestamp: new Date().toISOString(),
    versionNumber: toVersion.versionNumber,
    payload: {
      fromVersionId,
      fromVersionNumber: fromVersion.versionNumber,
      addedCount: addedRules.length,
      modifiedCount: modifiedRules.length,
      removedCount: removedRules.length,
      breakingChange,
      riskScore,
    },
  });

  return {
    fromVersionId,
    toVersionId,
    fromVersionNumber: fromVersion.versionNumber,
    toVersionNumber: toVersion.versionNumber,
    addedRules,
    modifiedRules,
    removedRules,
    breakingChange,
    riskScore,
    summary,
  };
}

function buildSummary(
  fromVersion: string,
  toVersion: string,
  added: unknown[],
  modified: unknown[],
  removed: unknown[],
): string {
  const parts: string[] = [];
  if (added.length > 0) parts.push(`+${added.length} added`);
  if (modified.length > 0) parts.push(`~${modified.length} modified`);
  if (removed.length > 0) parts.push(`-${removed.length} removed`);
  if (parts.length === 0)
    return `No changes between v${fromVersion} and v${toVersion}.`;
  return `v${fromVersion} → v${toVersion}: ${parts.join(", ")}.`;
}

export async function getDiffForVersion(versionId: string) {
  const diffs = await prisma.knowledgeFoundationDiff.findMany({
    where: {
      OR: [{ fromVersionId: versionId }, { toVersionId: versionId }],
    },
    orderBy: { generatedAt: "desc" },
    include: {
      fromVersion: { select: { id: true, versionNumber: true } },
      toVersion: { select: { id: true, versionNumber: true } },
    },
  });
  return diffs;
}
