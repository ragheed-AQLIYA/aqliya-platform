// Deterministic local content scoring logic for LocalContentOS v0.1
// All calculations are rule-based. No AI calls.

import type { ScoringResult } from "./types";

interface SupplierScoreInput {
  localityClassification: string | null;
  localContentPercentage: number | null;
  ownershipType: string | null;
}

interface SpendScoreInput {
  amount: number;
  supplier: SupplierScoreInput;
  category: string;
}

interface ClassificationScoreInput {
  localPercentage: number;
  reviewStatus: string;
  classificationBasis: string;
}

interface EvidenceScoreInput {
  status: string;
}

interface FindingScoreInput {
  severity: string;
  status: string;
}

export interface CalculateScoringInput {
  suppliers: SupplierScoreInput[];
  spendRecords: SpendScoreInput[];
  classifications: ClassificationScoreInput[];
  evidence: EvidenceScoreInput[];
  findings: FindingScoreInput[];
}

export function classifySupplier(supplier: SupplierScoreInput): {
  locality: string;
  localPercentage: number;
  isLocal: boolean;
} {
  const locality = supplier.localityClassification || "unclassified";
  const localPercentage = supplier.localContentPercentage ?? 0;
  return {
    locality,
    localPercentage,
    isLocal: locality === "local",
  };
}

export function classifySpend(spend: SpendScoreInput): {
  localAmount: number;
  nonLocalAmount: number;
  mixedAmount: number;
  unclassifiedAmount: number;
} {
  const { locality } = classifySupplier(spend.supplier);
  const amount = spend.amount;

  switch (locality) {
    case "local":
      return {
        localAmount: amount,
        nonLocalAmount: 0,
        mixedAmount: 0,
        unclassifiedAmount: 0,
      };
    case "non_local":
      return {
        localAmount: 0,
        nonLocalAmount: amount,
        mixedAmount: 0,
        unclassifiedAmount: 0,
      };
    case "mixed": {
      const pct = (spend.supplier.localContentPercentage ?? 50) / 100;
      return {
        localAmount: amount * pct,
        nonLocalAmount: amount * (1 - pct),
        mixedAmount: 0,
        unclassifiedAmount: 0,
      };
    }
    default:
      return {
        localAmount: 0,
        nonLocalAmount: 0,
        mixedAmount: 0,
        unclassifiedAmount: amount,
      };
  }
}

export function calculateSpendBreakdown(spendRecords: SpendScoreInput[]): {
  totalSpend: number;
  localSpend: number;
  nonLocalSpend: number;
  mixedSpend: number;
  unclassifiedSpend: number;
  localContentPercentage: number;
} {
  let localSpend = 0;
  let nonLocalSpend = 0;
  let mixedSpend = 0;
  let unclassifiedSpend = 0;

  for (const spend of spendRecords) {
    const breakdown = classifySpend(spend);
    localSpend += breakdown.localAmount;
    nonLocalSpend += breakdown.nonLocalAmount;
    mixedSpend += breakdown.mixedAmount;
    unclassifiedSpend += breakdown.unclassifiedAmount;
  }

  const totalSpend =
    localSpend + nonLocalSpend + mixedSpend + unclassifiedSpend;
  const classifiedSpend = localSpend + nonLocalSpend + mixedSpend;
  const localContentPercentage =
    classifiedSpend > 0 ? (localSpend / classifiedSpend) * 100 : 0;

  return {
    totalSpend,
    localSpend,
    nonLocalSpend,
    mixedSpend,
    unclassifiedSpend,
    localContentPercentage,
  };
}

export function calculateSupplierCounts(suppliers: SupplierScoreInput[]): {
  total: number;
  local: number;
  nonLocal: number;
  mixed: number;
  unclassified: number;
} {
  const counts = {
    total: suppliers.length,
    local: 0,
    nonLocal: 0,
    mixed: 0,
    unclassified: 0,
  };
  for (const supplier of suppliers) {
    const locality = supplier.localityClassification || "unclassified";
    switch (locality) {
      case "local":
        counts.local++;
        break;
      case "non_local":
        counts.nonLocal++;
        break;
      case "mixed":
        counts.mixed++;
        break;
      default:
        counts.unclassified++;
        break;
    }
  }
  return counts;
}

export function calculateEvidenceCoverage(evidence: EvidenceScoreInput[]): {
  total: number;
  verified: number;
  reviewed: number;
  uploaded: number;
  linked: number;
  rejected: number;
  missing: number;
  coveragePercentage: number;
} {
  const stats = {
    total: evidence.length,
    verified: 0,
    reviewed: 0,
    uploaded: 0,
    linked: 0,
    rejected: 0,
    missing: 0,
  };
  for (const e of evidence) {
    switch (e.status) {
      case "verified":
        stats.verified++;
        break;
      case "reviewed":
        stats.reviewed++;
        break;
      case "uploaded":
        stats.uploaded++;
        break;
      case "linked":
        stats.linked++;
        break;
      case "rejected":
        stats.rejected++;
        break;
      case "missing":
        stats.missing++;
        break;
    }
  }
  const covered =
    stats.verified + stats.reviewed + stats.uploaded + stats.linked;
  const coveragePercentage =
    stats.total > 0 ? (covered / stats.total) * 100 : 0;
  return { ...stats, coveragePercentage };
}

export function calculateFindingCounts(findings: FindingScoreInput[]): {
  total: number;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
} {
  const bySeverity: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const f of findings) {
    bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
    byStatus[f.status] = (byStatus[f.status] || 0) + 1;
  }
  return { total: findings.length, bySeverity, byStatus };
}

export function calculateClassificationStats(
  classifications: ClassificationScoreInput[],
): {
  total: number;
  confirmed: number;
  draft: number;
  disputed: number;
  byBasis: Record<string, number>;
} {
  const byBasis: Record<string, number> = {};
  let confirmed = 0;
  let draft = 0;
  let disputed = 0;
  for (const c of classifications) {
    byBasis[c.classificationBasis] = (byBasis[c.classificationBasis] || 0) + 1;
    switch (c.reviewStatus) {
      case "confirmed":
        confirmed++;
        break;
      case "draft":
        draft++;
        break;
      case "disputed":
        disputed++;
        break;
    }
  }
  return { total: classifications.length, confirmed, draft, disputed, byBasis };
}

export function calculateFullScoring(
  input: CalculateScoringInput,
): ScoringResult {
  const spendBreakdown = calculateSpendBreakdown(input.spendRecords);
  const supplierCounts = calculateSupplierCounts(input.suppliers);
  const evidenceStats = calculateEvidenceCoverage(input.evidence);
  const findingStats = calculateFindingCounts(input.findings);
  const classificationStats = calculateClassificationStats(
    input.classifications,
  );

  return {
    ...spendBreakdown,
    supplierCounts,
    evidenceStats,
    findingStats,
    classificationStats,
  };
}
