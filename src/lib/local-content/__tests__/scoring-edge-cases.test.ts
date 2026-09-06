import { describe, expect, it } from "@jest/globals";
import { scoreLocalityFactor, scoreOwnershipFactor, scoreWorkforceFactor, scoreDeclaredContentFactor, supplierScoreTier, calculateSupplierScore, calculateSpendBreakdown, calculateEvidenceCoverage, calculateFindingCounts, calculateClassificationStats, calculateFullScoring, SUPPLIER_SCORE_WEIGHTS } from "../scoring";
import type { CalculateScoringInput } from "../scoring";

describe("scoreLocalityFactor - boundary conditions", () => {
  it("returns full weight for local supplier", () => {
    expect(scoreLocalityFactor({ localityClassification: "local", localContentPercentage: 85, ownershipType: "Saudi" })).toBe(SUPPLIER_SCORE_WEIGHTS.locality);
  });
  it("returns 0 for non_local supplier", () => {
    expect(scoreLocalityFactor({ localityClassification: "non_local", localContentPercentage: 90, ownershipType: "foreign" })).toBe(0);
  });
  it("returns 25% weight for unclassified with null", () => {
    expect(scoreLocalityFactor({ localityClassification: null, localContentPercentage: null, ownershipType: null })).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.locality * 0.25));
  });
  it("mixed: clamps declared content above 100", () => {
    expect(scoreLocalityFactor({ localityClassification: "mixed", localContentPercentage: 150, ownershipType: "joint_venture" })).toBe(SUPPLIER_SCORE_WEIGHTS.locality);
  });
  it("mixed: clamps declared content below 0", () => {
    expect(scoreLocalityFactor({ localityClassification: "mixed", localContentPercentage: -10, ownershipType: "joint_venture" })).toBe(0);
  });
  it("mixed: 0% declared yields 0", () => {
    expect(scoreLocalityFactor({ localityClassification: "mixed", localContentPercentage: 0, ownershipType: "joint_venture" })).toBe(0);
  });
  it("mixed: 50% declared yields half weight", () => {
    expect(scoreLocalityFactor({ localityClassification: "mixed", localContentPercentage: 50, ownershipType: "joint_venture" })).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.locality * 0.5));
  });
  it("mixed: null declared defaults to 0", () => {
    expect(scoreLocalityFactor({ localityClassification: "mixed", localContentPercentage: null, ownershipType: "joint_venture" })).toBe(0);
  });
});

describe("scoreOwnershipFactor - all ownership types", () => {
  it("Saudi returns full weight", () => { expect(scoreOwnershipFactor("Saudi")).toBe(SUPPLIER_SCORE_WEIGHTS.ownership); });
  it("joint_venture returns 60% weight", () => { expect(scoreOwnershipFactor("joint_venture")).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.ownership * 0.6)); });
  it("foreign returns 15% weight", () => { expect(scoreOwnershipFactor("foreign")).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.ownership * 0.15)); });
  it("null returns 35% weight", () => { expect(scoreOwnershipFactor(null)).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.ownership * 0.35)); });
  it("unknown type returns 35% weight", () => { expect(scoreOwnershipFactor("unknown_type")).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.ownership * 0.35)); });
  it("empty string returns 35% weight", () => { expect(scoreOwnershipFactor("")).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.ownership * 0.35)); });
});

describe("scoreWorkforceFactor - boundary and null", () => {
  it("null returns 40% of weight", () => { expect(scoreWorkforceFactor(null)).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.workforce * 0.4)); });
  it("undefined returns 40% of weight", () => { expect(scoreWorkforceFactor(undefined)).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.workforce * 0.4)); });
  it("NaN returns 40% of weight", () => { expect(scoreWorkforceFactor(NaN)).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.workforce * 0.4)); });
  it("0 returns 0", () => { expect(scoreWorkforceFactor(0)).toBe(0); });
  it("100 returns full weight", () => { expect(scoreWorkforceFactor(100)).toBe(SUPPLIER_SCORE_WEIGHTS.workforce); });
  it("150 is clamped to 100", () => { expect(scoreWorkforceFactor(150)).toBe(SUPPLIER_SCORE_WEIGHTS.workforce); });
  it("-20 is clamped to 0", () => { expect(scoreWorkforceFactor(-20)).toBe(0); });
  it("50 returns half weight", () => { expect(scoreWorkforceFactor(50)).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.workforce * 0.5)); });
});

describe("scoreDeclaredContentFactor - boundary and null", () => {
  it("null returns 30% of weight", () => { expect(scoreDeclaredContentFactor({ localityClassification: "local", localContentPercentage: null, ownershipType: "Saudi" })).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.declaredContent * 0.3)); });
  it("NaN returns 30% of weight", () => { expect(scoreDeclaredContentFactor({ localityClassification: "local", localContentPercentage: NaN, ownershipType: "Saudi" })).toBe(Math.round(SUPPLIER_SCORE_WEIGHTS.declaredContent * 0.3)); });
  it("0 returns 0", () => { expect(scoreDeclaredContentFactor({ localityClassification: "local", localContentPercentage: 0, ownershipType: "Saudi" })).toBe(0); });
  it("100 returns full weight", () => { expect(scoreDeclaredContentFactor({ localityClassification: "local", localContentPercentage: 100, ownershipType: "Saudi" })).toBe(SUPPLIER_SCORE_WEIGHTS.declaredContent); });
  it("200 is clamped to 100", () => { expect(scoreDeclaredContentFactor({ localityClassification: "local", localContentPercentage: 200, ownershipType: "Saudi" })).toBe(SUPPLIER_SCORE_WEIGHTS.declaredContent); });
  it("-50 is clamped to 0", () => { expect(scoreDeclaredContentFactor({ localityClassification: "local", localContentPercentage: -50, ownershipType: "Saudi" })).toBe(0); });
});

describe("supplierScoreTier - exact boundaries", () => {
  it("75 returns strong", () => expect(supplierScoreTier(75)).toBe("strong"));
  it("74 returns moderate", () => expect(supplierScoreTier(74)).toBe("moderate"));
  it("50 returns moderate", () => expect(supplierScoreTier(50)).toBe("moderate"));
  it("49 returns weak", () => expect(supplierScoreTier(49)).toBe("weak"));
  it("25 returns weak", () => expect(supplierScoreTier(25)).toBe("weak"));
  it("24 returns critical", () => expect(supplierScoreTier(24)).toBe("critical"));
  it("0 returns critical", () => expect(supplierScoreTier(0)).toBe("critical"));
  it("100 returns strong", () => expect(supplierScoreTier(100)).toBe("strong"));
});

describe("calculateSupplierScore - composite clamping", () => {
  it("clamps composite score to max 100", () => {
    const r = calculateSupplierScore({ supplierKey: "max", localityClassification: "local", localContentPercentage: 100, ownershipType: "Saudi", workforceLocalPct: 100 });
    expect(r.compositeScore).toBeLessThanOrEqual(100);
  });
  it("generates default supplierKey", () => {
    expect(calculateSupplierScore({ localityClassification: "local", localContentPercentage: 50, ownershipType: "Saudi" }, 5).supplierKey).toBe("supplier-5");
  });
  it("uses provided supplierKey", () => {
    expect(calculateSupplierScore({ supplierKey: "custom", localityClassification: "local", localContentPercentage: 50, ownershipType: "Saudi" }).supplierKey).toBe("custom");
  });
  it("all null inputs produce minimum score", () => {
    const r = calculateSupplierScore({ localityClassification: null, localContentPercentage: null, ownershipType: null });
    expect(r.compositeScore).toBeGreaterThan(0);
    expect(r.tier).not.toBe("strong");
  });
  it("preserves factor breakdowns", () => {
    const r = calculateSupplierScore({ supplierKey: "f", localityClassification: "local", localContentPercentage: 80, ownershipType: "Saudi", workforceLocalPct: 70 });
    expect(r.factors.locality).toBe(SUPPLIER_SCORE_WEIGHTS.locality);
    expect(r.factors.ownership).toBe(SUPPLIER_SCORE_WEIGHTS.ownership);
    expect(r.factors.workforce).toBe(Math.round((SUPPLIER_SCORE_WEIGHTS.workforce * 70) / 100));
    expect(r.factors.declaredContent).toBe(Math.round((SUPPLIER_SCORE_WEIGHTS.declaredContent * 80) / 100));
  });
});

describe("classifySpend - mixed supplier extremes", () => {
  it("100% declared allocates all to local", () => {
    const r = calculateSpendBreakdown([{ amount: 1000, supplier: { localityClassification: "mixed", localContentPercentage: 100, ownershipType: "joint_venture" }, category: "services" }]);
    expect(r.localSpend).toBe(1000);
    expect(r.nonLocalSpend).toBe(0);
  });
  it("0% declared allocates all to non-local", () => {
    const r = calculateSpendBreakdown([{ amount: 1000, supplier: { localityClassification: "mixed", localContentPercentage: 0, ownershipType: "joint_venture" }, category: "services" }]);
    expect(r.localSpend).toBe(0);
    expect(r.nonLocalSpend).toBe(1000);
  });
  it("all unclassified yields 0% local", () => {
    const r = calculateSpendBreakdown([
      { amount: 500, supplier: { localityClassification: null, localContentPercentage: null, ownershipType: null }, category: "services" },
      { amount: 500, supplier: { localityClassification: "unclassified", localContentPercentage: null, ownershipType: null }, category: "goods" },
    ]);
    expect(r.totalSpend).toBe(1000);
    expect(r.unclassifiedSpend).toBe(1000);
    expect(r.localContentPercentage).toBe(0);
  });
  it("null declared defaults to 50/50 split", () => {
    const r = calculateSpendBreakdown([{ amount: 1000, supplier: { localityClassification: "mixed", localContentPercentage: null, ownershipType: "joint_venture" }, category: "services" }]);
    expect(r.localSpend).toBe(500);
    expect(r.nonLocalSpend).toBe(500);
  });
  it("complex: all four locality types", () => {
    const r = calculateSpendBreakdown([
      { amount: 1000, supplier: { localityClassification: "local", localContentPercentage: 90, ownershipType: "Saudi" }, category: "services" },
      { amount: 2000, supplier: { localityClassification: "non_local", localContentPercentage: 10, ownershipType: "foreign" }, category: "goods" },
      { amount: 1000, supplier: { localityClassification: "mixed", localContentPercentage: 60, ownershipType: "joint_venture" }, category: "construction" },
      { amount: 500, supplier: { localityClassification: null, localContentPercentage: null, ownershipType: null }, category: "other" },
    ]);
    expect(r.totalSpend).toBe(4500);
    expect(r.localSpend).toBe(1600);
    expect(r.nonLocalSpend).toBe(2400);
    expect(r.unclassifiedSpend).toBe(500);
    expect(r.localContentPercentage).toBeCloseTo(40, 0);
  });
});

describe("calculateEvidenceCoverage - edge cases", () => {
  it("empty returns 0% coverage", () => { expect(calculateEvidenceCoverage([]).coveragePercentage).toBe(0); });
  it("all verified returns 100%", () => { expect(calculateEvidenceCoverage([{ status: "verified" }, { status: "verified" }, { status: "verified" }]).coveragePercentage).toBe(100); });
  it("all missing returns 0%", () => { expect(calculateEvidenceCoverage([{ status: "missing" }, { status: "missing" }]).coveragePercentage).toBe(0); });
  it("all rejected returns 0%", () => { expect(calculateEvidenceCoverage([{ status: "rejected" }, { status: "rejected" }]).coveragePercentage).toBe(0); });
  it("counts each status correctly", () => {
    const r = calculateEvidenceCoverage([{ status: "verified" }, { status: "reviewed" }, { status: "uploaded" }, { status: "linked" }, { status: "rejected" }, { status: "missing" }]);
    expect(r.verified).toBe(1); expect(r.reviewed).toBe(1); expect(r.uploaded).toBe(1); expect(r.linked).toBe(1); expect(r.rejected).toBe(1); expect(r.missing).toBe(1);
    expect(r.coveragePercentage).toBeCloseTo(66.67, 0);
  });
  it("unknown status not counted", () => {
    const r = calculateEvidenceCoverage([{ status: "unknown_status" }]);
    expect(r.total).toBe(1); expect(r.verified).toBe(0); expect(r.coveragePercentage).toBe(0);
  });
});

describe("calculateFindingCounts - edge cases", () => {
  it("empty returns total 0", () => { expect(calculateFindingCounts([]).total).toBe(0); });
  it("counts multiple severity levels", () => {
    const r = calculateFindingCounts([
      { severity: "critical", status: "open" }, { severity: "high", status: "open" }, { severity: "high", status: "closed" },
      { severity: "medium", status: "open" }, { severity: "low", status: "closed" }, { severity: "low", status: "closed" },
    ]);
    expect(r.bySeverity.critical).toBe(1); expect(r.bySeverity.high).toBe(2); expect(r.bySeverity.medium).toBe(1); expect(r.bySeverity.low).toBe(2);
    expect(r.byStatus.open).toBe(3); expect(r.byStatus.closed).toBe(3);
  });
});

describe("calculateClassificationStats - edge cases", () => {
  it("empty returns 0 totals", () => {
    const r = calculateClassificationStats([]);
    expect(r.total).toBe(0); expect(r.confirmed).toBe(0); expect(r.draft).toBe(0); expect(r.disputed).toBe(0);
  });
  it("counts disputed classifications", () => {
    const r = calculateClassificationStats([
      { localPercentage: 80, reviewStatus: "disputed", classificationBasis: "certificate" },
      { localPercentage: 60, reviewStatus: "disputed", classificationBasis: "analyst_estimate" },
      { localPercentage: 40, reviewStatus: "confirmed", classificationBasis: "contract_term" },
    ]);
    expect(r.disputed).toBe(2); expect(r.confirmed).toBe(1);
    expect(r.byBasis.certificate).toBe(1); expect(r.byBasis.analyst_estimate).toBe(1); expect(r.byBasis.contract_term).toBe(1);
  });
});

describe("calculateFullScoring - edge cases", () => {
  it("empty suppliers yields average of 0", () => {
    const r = calculateFullScoring({ suppliers: [], spendRecords: [], classifications: [], evidence: [], findings: [] });
    expect(r.averageSupplierScore).toBe(0);
    expect(r.supplierScores).toHaveLength(0);
  });
  it("identical suppliers yield consistent average", () => {
    const s = { localityClassification: "local" as const, localContentPercentage: 80, ownershipType: "Saudi", workforceLocalPct: 80 };
    const r = calculateFullScoring({ suppliers: [s, s, s], spendRecords: [], classifications: [], evidence: [], findings: [] });
    expect(r.averageSupplierScore).toBe(r.supplierScores[0].compositeScore);
  });
  it("only unclassified spend yields 0% local", () => {
    const r = calculateFullScoring({
      suppliers: [],
      spendRecords: [{ amount: 5000, supplier: { localityClassification: null, localContentPercentage: null, ownershipType: null }, category: "services" }],
      classifications: [], evidence: [], findings: [],
    });
    expect(r.localContentPercentage).toBe(0);
    expect(r.totalSpend).toBe(5000);
  });
});