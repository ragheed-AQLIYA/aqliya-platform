import { describe, expect, it } from "@jest/globals";
import {
  classifySupplier,
  classifySpend,
  calculateSpendBreakdown,
  calculateSupplierCounts,
  calculateFullScoring,
} from "../scoring";
import type { CalculateScoringInput } from "../scoring";

const DEMO_SUPPLIERS = [
  {
    localityClassification: "local",
    localContentPercentage: 85,
    ownershipType: "Saudi",
  },
  {
    localityClassification: "local",
    localContentPercentage: 72,
    ownershipType: "Saudi",
  },
  {
    localityClassification: "non_local",
    localContentPercentage: 15,
    ownershipType: "foreign",
  },
  {
    localityClassification: "local",
    localContentPercentage: 95,
    ownershipType: "Saudi",
  },
  {
    localityClassification: "non_local",
    localContentPercentage: 22,
    ownershipType: "foreign",
  },
  {
    localityClassification: "local",
    localContentPercentage: 78,
    ownershipType: "Saudi",
  },
  {
    localityClassification: "non_local",
    localContentPercentage: 5,
    ownershipType: "foreign",
  },
  {
    localityClassification: "mixed",
    localContentPercentage: 55,
    ownershipType: "joint_venture",
  },
  {
    localityClassification: "local",
    localContentPercentage: 90,
    ownershipType: "Saudi",
  },
  {
    localityClassification: "non_local",
    localContentPercentage: 10,
    ownershipType: "foreign",
  },
  {
    localityClassification: "local",
    localContentPercentage: 68,
    ownershipType: "Saudi",
  },
  {
    localityClassification: "non_local",
    localContentPercentage: 18,
    ownershipType: "foreign",
  },
];

describe("LocalContentOS service-level scoring rules", () => {
  it("classifies demo suppliers consistently", () => {
    const counts = calculateSupplierCounts(DEMO_SUPPLIERS);
    expect(counts.total).toBe(12);
    expect(counts.local).toBe(6);
    expect(counts.nonLocal).toBe(5);
    expect(counts.mixed).toBe(1);
  });

  it("reproduces a simple all-local spend breakdown", () => {
    const demoSpend = [
      { amount: 5000000, supplier: DEMO_SUPPLIERS[0]!, category: "technology" },
      { amount: 3000000, supplier: DEMO_SUPPLIERS[3]!, category: "logistics" },
      { amount: 2000000, supplier: DEMO_SUPPLIERS[5]!, category: "goods" },
    ];

    const breakdown = calculateSpendBreakdown(demoSpend);
    expect(breakdown.totalSpend).toBe(10000000);
    expect(breakdown.localSpend).toBe(10000000);
    expect(breakdown.nonLocalSpend).toBe(0);
    expect(breakdown.localContentPercentage).toBe(100);
  });

  it("reproduces `calculateFullScoring` output with demo-like data", () => {
    const input: CalculateScoringInput = {
      suppliers: DEMO_SUPPLIERS,
      spendRecords: DEMO_SUPPLIERS.map((s, i) => ({
        amount: 1000000 + i * 500000,
        supplier: s,
        category: "goods",
      })),
      classifications: DEMO_SUPPLIERS.map((s) => ({
        localPercentage: s.localContentPercentage ?? 0,
        reviewStatus: "confirmed",
        classificationBasis: "certificate",
      })),
      evidence: DEMO_SUPPLIERS.map(() => ({ status: "verified" })),
      findings: [
        { severity: "high", status: "submitted" },
        { severity: "medium", status: "draft" },
      ],
    };
    const result = calculateFullScoring(input);
    expect(result.evidenceStats.coveragePercentage).toBe(100);
    expect(result.classificationStats.confirmed).toBe(12);
  });
});
