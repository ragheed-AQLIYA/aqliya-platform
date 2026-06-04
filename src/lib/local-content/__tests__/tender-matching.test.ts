import {
  buildTenderMatchReport,
  DEFAULT_TENDER_SPEC,
  parseTenderSpecFromMetadata,
} from "../tender-matching";

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
