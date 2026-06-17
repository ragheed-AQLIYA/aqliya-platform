// ─── Tests: Local Content Scoring Engine ───

import {
  computeLcMetrics,
  computeLcScore,
  getLineValue,
  computeMetricContributions,
  computeSectionBreakdown,
} from "../scoring";
import type { LcWorkbookLine } from "@prisma/client";

/** Helper to build a mock workbook line */
function line(
  code: string,
  overrides?: Partial<LcWorkbookLine>,
): LcWorkbookLine {
  return {
    id: `line-${code}`,
    workbookId: "wb-1",
    section: "revenue",
    code,
    name: `Line ${code}`,
    autoFillable: true,
    autoFilled: false,
    autoFillValue: null,
    autoFillSource: null,
    manualValue: null,
    source: "tb",
    confidence: "high",
    evidenceRequired: false,
    evidenceTypes: null,
    notes: null,
    displayOrder: 0,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("getLineValue", () => {
  it("should return manualValue when set", () => {
    const l = line("REV-01", { manualValue: 500, autoFillValue: 1000 });
    expect(getLineValue(l)).toBe(500);
  });

  it("should return autoFillValue when no manualValue", () => {
    const l = line("REV-01", { manualValue: null, autoFillValue: 1000 });
    expect(getLineValue(l)).toBe(1000);
  });

  it("should return null when both are null", () => {
    const l = line("REV-01", { manualValue: null, autoFillValue: null });
    expect(getLineValue(l)).toBeNull();
  });
});

describe("computeLcMetrics", () => {
  it("should compute revenue score from REV-01 and REV-03", () => {
    const lines = [
      line("REV-01", { manualValue: 300_000_000 }),
      line("REV-03", { manualValue: 550_000_000 }),
    ];
    const metrics = computeLcMetrics(lines);
    const rev = metrics.find((m) => m.code === "revenue")!;
    expect(rev.numerator).toBe(300_000_000);
    expect(rev.denominator).toBe(550_000_000);
    expect(rev.score).toBe(55); // 300M / 550M ≈ 54.5 → 55%
    expect(rev.weight).toBe(0.35);
  });

  it("should return null score when data is missing", () => {
    const lines = [
      line("REV-01", { manualValue: null, autoFillValue: null }),
      line("REV-03", { manualValue: 550_000_000 }),
    ];
    const metrics = computeLcMetrics(lines);
    const rev = metrics.find((m) => m.code === "revenue")!;
    expect(rev.score).toBeNull();
    expect(rev.numerator).toBeNull();
  });

  it("should return null score when denominator is zero", () => {
    const lines = [
      line("REV-01", { manualValue: 100 }),
      line("REV-03", { manualValue: 0 }),
    ];
    const metrics = computeLcMetrics(lines);
    const rev = metrics.find((m) => m.code === "revenue")!;
    expect(rev.score).toBeNull();
  });

  it("should return null score when line is missing entirely", () => {
    const lines: LcWorkbookLine[] = [line("REV-03", { manualValue: 100 })];
    const metrics = computeLcMetrics(lines);
    const rev = metrics.find((m) => m.code === "revenue")!;
    expect(rev.numerator).toBeNull();
    expect(rev.score).toBeNull();
  });

  it("should prefer manualValue over autoFillValue", () => {
    const lines = [
      line("REV-01", { manualValue: 200, autoFillValue: 100 }),
      line("REV-03", { manualValue: 400, autoFillValue: 300 }),
    ];
    const metrics = computeLcMetrics(lines);
    const rev = metrics.find((m) => m.code === "revenue")!;
    expect(rev.numerator).toBe(200);
    expect(rev.denominator).toBe(400);
    expect(rev.score).toBe(50);
  });

  it("should return 4 metrics (revenue, supplier_spend, workforce, assets)", () => {
    const lines = [
      line("REV-01", { manualValue: 100 }),
      line("REV-03", { manualValue: 200 }),
      line("SPN-01", { manualValue: 100 }),
      line("SPN-03", { manualValue: 200 }),
      line("WRK-01", { manualValue: 30 }),
      line("WRK-02", { manualValue: 100 }),
      line("AST-01", { manualValue: 100 }),
      line("AST-02", { manualValue: 200 }),
    ];
    const metrics = computeLcMetrics(lines);
    expect(metrics).toHaveLength(4);
    expect(metrics.map((m) => m.code)).toEqual([
      "revenue",
      "supplier_spend",
      "workforce",
      "assets",
    ]);
  });
});

describe("computeLcScore", () => {
  it("should compute overall score from complete data", () => {
    const lines = [
      line("REV-01", { manualValue: 300_000_000 }),
      line("REV-03", { manualValue: 550_000_000 }),
      line("SPN-01", { manualValue: 100_000_000 }),
      line("SPN-03", { manualValue: 200_000_000 }),
      line("WRK-01", { manualValue: 30 }),
      line("WRK-02", { manualValue: 100 }),
      line("AST-01", { manualValue: 8_000_000 }),
      line("AST-02", { manualValue: 10_000_000 }),
    ];
    const result = computeLcScore(lines);

    // Revenue: 300/550 = 55% * 0.35
    // Supplier: 100/200 = 50% * 0.35
    // Workforce: 30/100 = 30% * 0.20
    // Assets: 8/10 = 80% * 0.10
    // Weighted: (55*0.35 + 50*0.35 + 30*0.20 + 80*0.10) / (0.35+0.35+0.20+0.10) = 1.0
    // = (19.25 + 17.5 + 6 + 8) / 1.0 = 50.75
    expect(result.overallScore).toBe(50.75);
    expect(result.statusLabel).toBe("جيد");
    expect(result.metrics).toHaveLength(4);
    expect(result.computedAt).toBeDefined();
  });

  it("should return null overall score when all data is missing", () => {
    const lines: LcWorkbookLine[] = [
      line("REV-01"),
      line("REV-03"),
      line("SPN-01"),
      line("SPN-03"),
      line("WRK-01"),
      line("WRK-02"),
      line("AST-01"),
      line("AST-02"),
    ];
    const result = computeLcScore(lines);
    expect(result.overallScore).toBeNull();
    expect(result.statusLabel).toBe("لا توجد بيانات كافية");
  });

  it("should compute partial score when some metrics are missing", () => {
    const lines = [
      line("REV-01", { manualValue: 100 }),
      line("REV-03", { manualValue: 200 }),
      // SPN missing
      // WRK missing
      // AST missing
    ];
    const result = computeLcScore(lines);
    // Only revenue metric contributes: 100/200 = 50% * 0.35 / 0.35 = 50%
    expect(result.overallScore).toBe(50);
    expect(result.metrics[0].score).toBe(50);
    expect(result.metrics[1].score).toBeNull(); // supplier_spend
    expect(result.metrics[2].score).toBeNull(); // workforce
    expect(result.metrics[3].score).toBeNull(); // assets
  });

  it("should use autoFillValue when no manualValue", () => {
    const lines = [
      line("REV-01", { manualValue: null, autoFillValue: 100 }),
      line("REV-03", { manualValue: null, autoFillValue: 200 }),
    ];
    const result = computeLcScore(lines);
    expect(result.overallScore).toBe(50);
  });

  it("should produce bilingual summary with metrics breakdown", () => {
    const lines = [
      line("REV-01", { manualValue: 100 }),
      line("REV-03", { manualValue: 200 }),
      line("SPN-01", { manualValue: 50 }),
      line("SPN-03", { manualValue: 100 }),
      line("WRK-01", { manualValue: 30 }),
      line("WRK-02", { manualValue: 60 }),
      line("AST-01", { manualValue: 40 }),
      line("AST-02", { manualValue: 80 }),
    ];
    const result = computeLcScore(lines);
    expect(result.summaryAr).toContain("النتيجة الإجمالية");
    expect(result.summaryAr).toContain("%");
    expect(result.metrics.every((m) => m.score !== null)).toBe(true);
  });

  it("should include contributions array", () => {
    const lines = [
      line("REV-01", { manualValue: 100 }),
      line("REV-03", { manualValue: 200 }),
      line("SPN-01", { manualValue: 50 }),
      line("SPN-03", { manualValue: 100 }),
      line("WRK-01", { manualValue: 30 }),
      line("WRK-02", { manualValue: 60 }),
      line("AST-01", { manualValue: 40 }),
      line("AST-02", { manualValue: 80 }),
    ];
    const result = computeLcScore(lines);
    expect(result.contributions).toHaveLength(4);
    expect(result.contributions![0]).toHaveProperty("effectiveWeight");
    expect(result.contributions![0]).toHaveProperty("contributionPct");
  });

  it("should include section breakdown", () => {
    const lines = [
      line("REV-01", { manualValue: 100 }),
      line("REV-03", { manualValue: 200 }),
      line("SPN-01", { manualValue: null }),
      line("SPN-03", { manualValue: null }),
    ];
    const result = computeLcScore(lines);
    expect(result.sectionBreakdown).toBeDefined();
    expect(result.sectionBreakdown!.length).toBeGreaterThan(0);
    const revSection = result.sectionBreakdown!.find(
      (s) => s.section === "revenue",
    )!;
    expect(revSection).toBeDefined();
    expect(revSection.fillPct).toBe(100);
    expect(revSection.totalLines).toBe(2);
  });
});

describe("computeMetricContributions", () => {
  it("should compute effective weight and contribution for complete data", () => {
    const metrics = [
      {
        code: "revenue",
        label: "Revenue",
        labelAr: "الإيرادات",
        score: 55,
        numerator: 300,
        denominator: 550,
        weight: 0.35,
        explanationAr: "...",
      },
      {
        code: "supplier_spend",
        label: "Supplier Spend",
        labelAr: "المشتريات",
        score: 50,
        numerator: 100,
        denominator: 200,
        weight: 0.35,
        explanationAr: "...",
      },
      {
        code: "workforce",
        label: "Workforce",
        labelAr: "التوطين",
        score: 30,
        numerator: 30,
        denominator: 100,
        weight: 0.20,
        explanationAr: "...",
      },
      {
        code: "assets",
        label: "Assets",
        labelAr: "الأصول",
        score: 80,
        numerator: 8,
        denominator: 10,
        weight: 0.10,
        explanationAr: "...",
      },
    ];
    const overallScore = 50.75;
    const contributions = computeMetricContributions(metrics, overallScore);

    expect(contributions).toHaveLength(4);
    // All metrics have scores, so effectiveWeight equals raw weight
    const rev = contributions.find((c) => c.code === "revenue")!;
    expect(rev.effectiveWeight).toBeCloseTo(0.35, 2);
    // Contribution = 55 * 0.35 = 19.25
    expect(rev.contributionPct).toBeCloseTo(19.25, 2);
  });

  it("should re-weight when a metric is missing", () => {
    const metrics = [
      {
        code: "revenue",
        label: "Revenue",
        labelAr: "الإيرادات",
        score: 50,
        numerator: 100,
        denominator: 200,
        weight: 0.35,
        explanationAr: "...",
      },
      {
        code: "supplier_spend",
        label: "Supplier Spend",
        labelAr: "المشتريات",
        score: null,
        numerator: null,
        denominator: null,
        weight: 0.35,
        explanationAr: "...",
      },
      {
        code: "workforce",
        label: "Workforce",
        labelAr: "التوطين",
        score: null,
        numerator: null,
        denominator: null,
        weight: 0.20,
        explanationAr: "...",
      },
      {
        code: "assets",
        label: "Assets",
        labelAr: "الأصول",
        score: null,
        numerator: null,
        denominator: null,
        weight: 0.10,
        explanationAr: "...",
      },
    ];
    const overallScore = 50.0;
    const contributions = computeMetricContributions(metrics, overallScore);

    const rev = contributions.find((c) => c.code === "revenue")!;
    // Only revenue contributes, effective weight = 0.35 / 0.35 = 1.0
    expect(rev.effectiveWeight).toBeCloseTo(1.0, 2);
    // Contribution = 50 * 1.0 = 50
    expect(rev.contributionPct).toBeCloseTo(50, 2);
  });

  it("should return all null contributions when no metrics have score", () => {
    const metrics = [
      {
        code: "revenue",
        label: "Revenue",
        labelAr: "الإيرادات",
        score: null,
        numerator: null,
        denominator: null,
        weight: 0.35,
        explanationAr: "...",
      },
      {
        code: "supplier_spend",
        label: "Supplier Spend",
        labelAr: "المشتريات",
        score: null,
        numerator: null,
        denominator: null,
        weight: 0.35,
        explanationAr: "...",
      },
      {
        code: "workforce",
        label: "Workforce",
        labelAr: "التوطين",
        score: null,
        numerator: null,
        denominator: null,
        weight: 0.20,
        explanationAr: "...",
      },
      {
        code: "assets",
        label: "Assets",
        labelAr: "الأصول",
        score: null,
        numerator: null,
        denominator: null,
        weight: 0.10,
        explanationAr: "...",
      },
    ];
    const contributions = computeMetricContributions(metrics, null);
    contributions.forEach((c) => {
      expect(c.effectiveWeight).toBe(0);
      expect(c.contributionPct).toBeNull();
    });
  });
});

describe("computeSectionBreakdown", () => {
  it("should group lines by section and compute fill rates", () => {
    const lines = [
      line("REV-01", { manualValue: 100 }),
      line("REV-03", { manualValue: null, autoFillValue: null }),
      line("SPN-01", { manualValue: 50 }),
      line("SPN-03", { manualValue: 25 }),
      line("WRK-01", { manualValue: null }),
      line("WRK-02", { manualValue: null }),
      line("AST-01", { manualValue: 100 }),
    ];
    const breakdown = computeSectionBreakdown(lines);

    const rev = breakdown.find((s) => s.section === "revenue")!;
    expect(rev.totalLines).toBe(2);
    expect(rev.filledLines).toBe(1);
    expect(rev.missingLines).toBe(1);
    expect(rev.fillPct).toBe(50);

    const spn = breakdown.find((s) => s.section === "supplier_spend")!;
    expect(spn.fillPct).toBe(100);

    const wrk = breakdown.find((s) => s.section === "workforce")!;
    expect(wrk.fillPct).toBe(0);
  });

  it("should sort by fill rate descending", () => {
    const lines = [
      line("REV-01", { manualValue: null }),
      line("REV-03", { manualValue: 200 }),
      line("SPN-01", { manualValue: 50 }),
      line("SPN-03", { manualValue: 25 }),
    ];
    const breakdown = computeSectionBreakdown(lines);
    expect(breakdown[0].fillPct).toBeGreaterThanOrEqual(breakdown[1].fillPct);
  });

  it("should return Arabic labels", () => {
    const lines = [
      line("REV-01", { manualValue: 100 }),
      line("REV-03", { manualValue: 200 }),
    ];
    const breakdown = computeSectionBreakdown(lines);
    expect(breakdown[0].labelAr).toBe("الإيرادات");
  });
});
