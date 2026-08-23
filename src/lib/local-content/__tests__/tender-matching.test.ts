import {
  buildTenderMatchReport,
  buildLcgpaTenderMatchReport,
  DEFAULT_TENDER_SPEC,
  parseTenderSpecFromMetadata,
} from "../tender-matching";
import type { RawSupplierSpend } from "../lcgpa/supplier-ranking";

// ─── LCGPA Test Fixtures ───

const LCGPA_SAUDI_SUPPLIER: RawSupplierSpend = {
  supplierId: "SUP-001",
  name: "شركةzilla Saudi",
  spend: 500000,
  localityClassification: "local",
  localContentPercentage: 85,
};

const LCGPA_FOREIGN_SUPPLIER: RawSupplierSpend = {
  supplierId: "SUP-002",
  name: "Global Tech Inc",
  spend: 300000,
  localityClassification: "non_local",
  localContentPercentage: 10,
};

const LCGPA_MIXED_SUPPLIER: RawSupplierSpend = {
  supplierId: "SUP-003",
  name: "Mixed Corp",
  spend: 200000,
  localityClassification: "mixed",
  localContentPercentage: 60,
};

// ─── Legacy IKTVA Tests ───

describe("tender-matching (LC-02)", () => {
  it("parses tender from project metadata", () => {
    const spec = parseTenderSpecFromMetadata({
      tender: { minLocalContentPct: 40, requiredSpendCategories: ["services"] },
    });
    expect(spec?.minLocalContentPct).toBe(40);
  });

  it("flags fail when local content below minimum", () => {
    const report = buildTenderMatchReport({
      projectName: "مشروع تجريبي",
      tender: { ...DEFAULT_TENDER_SPEC, minLocalContentPct: 90 },
      spendRecords: [
        {
          amount: 100,
          category: "services",
          supplier: {
            localityClassification: "non_local",
            localContentPercentage: 10,
            ownershipType: "foreign",
          },
        },
      ],
      suppliers: [{ localityClassification: "non_local" }],
    });
    expect(report.fitLevel).not.toBe("pass");
    expect(report.gaps.length).toBeGreaterThan(0);
  });

  it("passes when spend and suppliers meet tender", () => {
    const report = buildTenderMatchReport({
      projectName: "مشروع",
      tender: {
        minLocalContentPct: 20,
        requiredSpendCategories: ["services"],
        minLocalSupplierCount: 1,
        maxNonLocalSpendSharePct: 80,
      },
      spendRecords: [
        {
          amount: 100,
          category: "services",
          supplier: {
            localityClassification: "local",
            localContentPercentage: 80,
            ownershipType: "Saudi",
          },
        },
      ],
      suppliers: [{ localityClassification: "local" }],
    });
    expect(report.fitLevel).toBe("pass");
  });
});

// ─── LCGPA Tender Matching Tests ───

describe("LCGPA tender-matching", () => {
  it("should pass when LC_GS meets tender minimum", () => {
    const report = buildLcgpaTenderMatchReport({
      projectName: "مشروع LCGPA",
      tender: {
        minLocalContentPct: 50,
        requiredSpendCategories: [],
        minLocalSupplierCount: 1,
        maxNonLocalSpendSharePct: 80,
      },
      suppliers: [LCGPA_SAUDI_SUPPLIER, LCGPA_FOREIGN_SUPPLIER],
    });

    // LC_GS = 500000 / 800000 × 100 = 62.5%
    expect(report.fitLevel).toBe("pass");
    expect(report.localContentPct).toBe(62.5);
    expect(report.scoringMethod).toBe("lcgpa_v1");
  });

  it("should fail when LC_GS below tender minimum", () => {
    const report = buildLcgpaTenderMatchReport({
      projectName: "مشروع LCGPA",
      tender: {
        minLocalContentPct: 80,
        requiredSpendCategories: [],
        minLocalSupplierCount: 1,
        maxNonLocalSpendSharePct: 80,
      },
      suppliers: [LCGPA_SAUDI_SUPPLIER, LCGPA_FOREIGN_SUPPLIER],
    });

    // LC_GS = 500000 / 800000 × 100 = 62.5% < 80%
    expect(report.fitLevel).not.toBe("pass");
    expect(report.gaps.length).toBeGreaterThan(0);
  });

  it("should apply G&S selection rule correctly", () => {
    const report = buildLcgpaTenderMatchReport({
      projectName: "مشروع LCGPA",
      tender: {
        minLocalContentPct: 30,
        requiredSpendCategories: [],
        minLocalSupplierCount: 1,
        maxNonLocalSpendSharePct: 80,
      },
      suppliers: [LCGPA_SAUDI_SUPPLIER, LCGPA_FOREIGN_SUPPLIER, LCGPA_MIXED_SUPPLIER],
    });

    // Total spend = 1000000
    // Selection: top-40 rule (3 suppliers < 40)
    expect(report.gsSelection.selectedSuppliers).toHaveLength(3);
    expect(report.gsSelection.selectionMethod).toBe("top40_rule");
    expect(report.excludedSupplierCount).toBe(0);
    expect(report.excludedSpend).toBe(0);
  });

  it("should exclude suppliers when >40 suppliers exist", () => {
    // Create 50 suppliers each with 2% of total
    const suppliers: RawSupplierSpend[] = Array.from({ length: 50 }, (_, i) => ({
      supplierId: `SUP-${String(i + 1).padStart(3, "0")}`,
      name: `Supplier ${i + 1}`,
      spend: 10000,
      localityClassification: "local" as const,
      localContentPercentage: 100,
    }));

    const report = buildLcgpaTenderMatchReport({
      projectName: "مشروع LCGPA",
      tender: {
        minLocalContentPct: 30,
        requiredSpendCategories: [],
        minLocalSupplierCount: 1,
        maxNonLocalSpendSharePct: 80,
      },
      suppliers,
    });

    // 50 suppliers, top-40 rule selects 40
    expect(report.gsSelection.selectedSuppliers).toHaveLength(40);
    expect(report.excludedSupplierCount).toBe(10);
    expect(report.excludedSpend).toBe(100000);
  });

  it("should count suppliers by locality correctly", () => {
    const report = buildLcgpaTenderMatchReport({
      projectName: "مشروع LCGPA",
      tender: {
        minLocalContentPct: 30,
        requiredSpendCategories: [],
        minLocalSupplierCount: 1,
        maxNonLocalSpendSharePct: 80,
      },
      suppliers: [LCGPA_SAUDI_SUPPLIER, LCGPA_FOREIGN_SUPPLIER, LCGPA_MIXED_SUPPLIER],
    });

    expect(report.supplierCounts.local).toBe(1);
    expect(report.supplierCounts.nonLocal).toBe(1);
    expect(report.supplierCounts.mixed).toBe(1);
    expect(report.supplierCounts.unclassified).toBe(0);
  });

  it("should check minimum local supplier count", () => {
    const report = buildLcgpaTenderMatchReport({
      projectName: "مشروع LCGPA",
      tender: {
        minLocalContentPct: 30,
        requiredSpendCategories: [],
        minLocalSupplierCount: 2,
        maxNonLocalSpendSharePct: 80,
      },
      suppliers: [LCGPA_SAUDI_SUPPLIER, LCGPA_FOREIGN_SUPPLIER],
    });

    // Only 1 local supplier, need 2
    expect(report.fitLevel).not.toBe("pass");
    expect(report.gaps.some((g) => g.includes("موردون محليون"))).toBe(true);
  });

  it("should check maximum non-local spend share", () => {
    const report = buildLcgpaTenderMatchReport({
      projectName: "مشروع LCGPA",
      tender: {
        minLocalContentPct: 30,
        requiredSpendCategories: [],
        minLocalSupplierCount: 1,
        maxNonLocalSpendSharePct: 20,
      },
      suppliers: [LCGPA_SAUDI_SUPPLIER, LCGPA_FOREIGN_SUPPLIER],
    });

    // Non-local spend = 300000 / 800000 = 37.5% > 20%
    expect(report.fitLevel).not.toBe("pass");
    expect(report.gaps.some((g) => g.includes("حصة الإنفاق غير المحلي"))).toBe(true);
  });

  it("should handle empty supplier list", () => {
    const report = buildLcgpaTenderMatchReport({
      projectName: "مشروع LCGPA",
      tender: {
        minLocalContentPct: 30,
        requiredSpendCategories: [],
        minLocalSupplierCount: 1,
        maxNonLocalSpendSharePct: 80,
      },
      suppliers: [],
    });

    expect(report.fitLevel).not.toBe("pass");
    expect(report.localContentPct).toBe(0);
    expect(report.totalSpend).toBe(0);
  });

  it("should return correct rule version in supplier ranking", () => {
    const report = buildLcgpaTenderMatchReport({
      projectName: "مشروع LCGPA",
      tender: {
        minLocalContentPct: 30,
        requiredSpendCategories: [],
        minLocalSupplierCount: 1,
        maxNonLocalSpendSharePct: 80,
      },
      suppliers: [LCGPA_SAUDI_SUPPLIER],
    });

    // Rule version is embedded in the supplier ranking
    expect(report.gsSelection.selectedSuppliers).toHaveLength(1);
    expect(report.scoringMethod).toBe("lcgpa_v1");
  });
});
