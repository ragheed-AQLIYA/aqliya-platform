import "server-only";

import type { VersionProvenanceManifest } from "./provenance-manifest";

export type ProvenanceSummary = {
  candidateCount: number;
  totalEvidenceCount: number;
  contributingOrganizationCount: number;
  canonicalCodeDistribution: Array<{
    canonicalCode: string;
    count: number;
    category: string;
  }>;
  averageConfidence: number;
};

/**
 * Aggregate canonical provenance summary — no organizationId or raw evidence.
 */
export function summarizeProvenanceManifest(
  manifest: VersionProvenanceManifest,
): ProvenanceSummary {
  const codeMap = new Map<
    string,
    { count: number; category: string }
  >();

  let totalEvidenceCount = 0;
  let orgTotal = 0;
  let confidenceSum = 0;

  for (const c of manifest.candidates) {
    totalEvidenceCount += c.evidenceSummary.evidenceCount;
    orgTotal += c.evidenceSummary.contributingOrganizationCount;
    confidenceSum += c.confidence;

    const existing = codeMap.get(c.canonicalCode);
    if (existing) {
      existing.count += 1;
    } else {
      codeMap.set(c.canonicalCode, { count: 1, category: c.category });
    }
  }

  const candidateCount = manifest.candidates.length;

  return {
    candidateCount,
    totalEvidenceCount,
    contributingOrganizationCount: orgTotal,
    canonicalCodeDistribution: [...codeMap.entries()]
      .map(([canonicalCode, { count, category }]) => ({
        canonicalCode,
        count,
        category,
      }))
      .sort((a, b) => b.count - a.count || a.canonicalCode.localeCompare(b.canonicalCode)),
    averageConfidence: candidateCount > 0 ? confidenceSum / candidateCount : 0,
  };
}
