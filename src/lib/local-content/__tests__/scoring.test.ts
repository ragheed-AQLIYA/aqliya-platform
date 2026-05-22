import { describe, expect, it } from "@jest/globals";
import {
  classifySupplier,
  classifySpend,
  calculateSpendBreakdown,
  calculateSupplierCounts,
  calculateEvidenceCoverage,
  calculateFindingCounts,
  calculateClassificationStats,
  calculateFullScoring,
} from "../scoring";
import type { CalculateScoringInput } from "../scoring";

const SAUDI_SUPPLIER = {
  localityClassification: "local",
  localContentPercentage: 85,
  ownershipType: "Saudi",
};
const FOREIGN_SUPPLIER = {
  localityClassification: "non_local",
  localContentPercentage: 10,
  ownershipType: "foreign",
};
const MIXED_SUPPLIER = {
  localityClassification: "mixed",
  localContentPercentage: 55,
  ownershipType: "joint_venture",
};
const UNCLASSIFIED_SUPPLIER = {
  localityClassification: null,
  localContentPercentage: null,
  ownershipType: null,
};

describe("LocalContentOS scoring", () => {
  describe("classifySupplier", () => {
    it("classifies Saudi supplier as local", () => {
      const result = classifySupplier(SAUDI_SUPPLIER);
      expect(result.locality).toBe("local");
      expect(result.isLocal).toBe(true);
      expect(result.localPercentage).toBe(85);
    });

    it("classifies foreign supplier as non-local", () => {
      const result = classifySupplier(FOREIGN_SUPPLIER);
      expect(result.locality).toBe("non_local");
      expect(result.isLocal).toBe(false);
    });

    it("classifies joint venture as mixed", () => {
      const result = classifySupplier(MIXED_SUPPLIER);
      expect(result.locality).toBe("mixed");
      expect(result.isLocal).toBe(false);
    });

    it("defaults unclassified supplier to unclassified", () => {
      const result = classifySupplier(UNCLASSIFIED_SUPPLIER);
      expect(result.locality).toBe("unclassified");
      expect(result.isLocal).toBe(false);
    });
  });

  describe("classifySpend", () => {
    it("puts full amount in local for local supplier", () => {
      const result = classifySpend({
        amount: 1000,
        supplier: SAUDI_SUPPLIER,
        category: "services",
      });
      expect(result.localAmount).toBe(1000);
      expect(result.nonLocalAmount).toBe(0);
    });

    it("puts full amount in nonLocal for foreign supplier", () => {
      const result = classifySpend({
        amount: 1000,
        supplier: FOREIGN_SUPPLIER,
        category: "goods",
      });
      expect(result.nonLocalAmount).toBe(1000);
    });

    it("splits amount for mixed supplier based on percentage", () => {
      const result = classifySpend({
        amount: 1000,
        supplier: MIXED_SUPPLIER,
        category: "construction",
      });
      expect(result.localAmount).toBe(550);
      expect(result.nonLocalAmount).toBeCloseTo(450, 1);
    });

    it("puts full amount in unclassified for unknown supplier", () => {
      const result = classifySpend({
        amount: 1000,
        supplier: UNCLASSIFIED_SUPPLIER,
        category: "other",
      });
      expect(result.unclassifiedAmount).toBe(1000);
    });
  });

  describe("calculateSpendBreakdown", () => {
    it("calculates correct local content percentage", () => {
      const result = calculateSpendBreakdown([
        { amount: 7000, supplier: SAUDI_SUPPLIER, category: "services" },
        { amount: 3000, supplier: FOREIGN_SUPPLIER, category: "goods" },
      ]);
      expect(result.totalSpend).toBe(10000);
      expect(result.localSpend).toBe(7000);
      expect(result.nonLocalSpend).toBe(3000);
      expect(result.localContentPercentage).toBe(70);
    });

    it("handles empty spend", () => {
      const result = calculateSpendBreakdown([]);
      expect(result.totalSpend).toBe(0);
      expect(result.localContentPercentage).toBe(0);
    });
  });

  describe("calculateSupplierCounts", () => {
    it("counts suppliers by locality", () => {
      const result = calculateSupplierCounts([
        SAUDI_SUPPLIER,
        SAUDI_SUPPLIER,
        FOREIGN_SUPPLIER,
        MIXED_SUPPLIER,
        UNCLASSIFIED_SUPPLIER,
      ]);
      expect(result.local).toBe(2);
      expect(result.nonLocal).toBe(1);
      expect(result.mixed).toBe(1);
      expect(result.unclassified).toBe(1);
      expect(result.total).toBe(5);
    });
  });

  describe("calculateEvidenceCoverage", () => {
    it("calculates coverage percentage", () => {
      const result = calculateEvidenceCoverage([
        { status: "verified" },
        { status: "reviewed" },
        { status: "uploaded" },
        { status: "linked" },
        { status: "missing" },
      ]);
      expect(result.total).toBe(5);
      expect(result.verified).toBe(1);
      expect(result.missing).toBe(1);
      expect(result.coveragePercentage).toBe(80);
    });
  });

  describe("calculateFindingCounts", () => {
    it("groups by severity and status", () => {
      const result = calculateFindingCounts([
        { severity: "high", status: "submitted" },
        { severity: "medium", status: "draft" },
        { severity: "high", status: "draft" },
      ]);
      expect(result.total).toBe(3);
      expect(result.bySeverity.high).toBe(2);
      expect(result.byStatus.submitted).toBe(1);
    });
  });

  describe("calculateClassificationStats", () => {
    it("groups by review status and basis", () => {
      const result = calculateClassificationStats([
        {
          localPercentage: 85,
          reviewStatus: "confirmed",
          classificationBasis: "certificate",
        },
        {
          localPercentage: 70,
          reviewStatus: "draft",
          classificationBasis: "self_declaration",
        },
        {
          localPercentage: 55,
          reviewStatus: "confirmed",
          classificationBasis: "contract_term",
        },
      ]);
      expect(result.total).toBe(3);
      expect(result.confirmed).toBe(2);
      expect(result.draft).toBe(1);
      expect(result.byBasis.certificate).toBe(1);
    });
  });

  describe("calculateFullScoring", () => {
    it("produces complete scoring result", () => {
      const input: CalculateScoringInput = {
        suppliers: [SAUDI_SUPPLIER, FOREIGN_SUPPLIER],
        spendRecords: [
          { amount: 8000, supplier: SAUDI_SUPPLIER, category: "services" },
          { amount: 2000, supplier: FOREIGN_SUPPLIER, category: "goods" },
        ],
        classifications: [
          {
            localPercentage: 85,
            reviewStatus: "confirmed",
            classificationBasis: "certificate",
          },
          {
            localPercentage: 10,
            reviewStatus: "draft",
            classificationBasis: "analyst_estimate",
          },
        ],
        evidence: [{ status: "verified" }, { status: "missing" }],
        findings: [{ severity: "low", status: "draft" }],
      };
      const result = calculateFullScoring(input);
      expect(result.localContentPercentage).toBe(80);
      expect(result.supplierCounts.local).toBe(1);
      expect(result.evidenceStats.coveragePercentage).toBe(50);
      expect(result.findingStats.total).toBe(1);
    });
  });
});
