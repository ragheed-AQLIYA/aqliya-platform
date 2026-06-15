import { prisma } from "@/lib/prisma";
import type { CanonicalCandidate, ClassificationResult } from "./types";
import { normaliseAccountText } from "./synonyms";

function similarityScore(a: string, b: string): number {
  const na = normaliseAccountText(a);
  const nb = normaliseAccountText(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const aTokens = new Set(na.split(" "));
  const bTokens = new Set(nb.split(" "));
  let overlap = 0;
  for (const t of aTokens) {
    if (bTokens.has(t)) overlap++;
  }
  return overlap / Math.max(aTokens.size, bTokens.size, 1);
}

export async function matchByPattern(
  organizationId: string,
  accountCode: string,
  accountName: string,
  candidates: CanonicalCandidate[],
): Promise<ClassificationResult | null> {
  let history: Awaited<
    ReturnType<typeof prisma.tBClassificationHistory.findMany>
  > = [];
  try {
    history = await prisma.tBClassificationHistory.findMany({
      where: {
        organizationId,
        source: { in: ["firm_memory", "rule", "pattern", "cloud"] },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch {
    /* Firm Memory tables may be unavailable before migration deploy */
    return null;
  }

  let best: { canonicalCode: string; score: number; evidence: string } | null =
    null;

  for (const row of history) {
    if (!row.canonicalCode) continue;
    const nameScore = similarityScore(accountName, row.accountName ?? "");
    const codeScore = row.accountCode === accountCode ? 0.3 : 0;
    const score = nameScore + codeScore;
    if (score < 0.5) continue;
    if (!best || score > best.score) {
      best = {
        canonicalCode: row.canonicalCode,
        score,
        evidence: `Pattern match with prior account ${row.accountCode} (${row.accountName ?? ""})`,
      };
    }
  }

  if (!best) return null;

  const canonical = candidates.find((c) => c.code === best!.canonicalCode);
  if (!canonical) return null;

  return {
    canonicalAccountId: canonical.id,
    canonicalCode: canonical.code,
    canonicalName: canonical.name,
    category: canonical.category,
    confidence: Math.min(0.92, 0.65 + best.score * 0.25),
    source: "pattern",
    evidence: best.evidence,
    sourceDetail: { tier: "pattern" },
    evidenceDetail: {
      matchedBy: "pattern",
      detail: best.evidence,
    },
  };
}
