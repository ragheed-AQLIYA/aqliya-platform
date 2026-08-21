// ─── LocalContentOS Workbook — Population Engine Tests ───
// Phase 1: Unit tests for TB→workbook mapping and population engine.

// ─── Mocks (must be before imports) ───

jest.mock("@/lib/prisma", () => ({
  prisma: {
    localContentProject: {
      findFirst: jest.fn(),
    },
    lcWorkbook: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    lcWorkbookLine: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

// Mock ai-auto-review to prevent side effects from populateWorkbookFromTb
jest.mock("../ai-auto-review", () => ({
  runWorkbookAiReview: jest.fn().mockResolvedValue(undefined),
}));

import { describe, expect, it, jest } from "@jest/globals";
import {
  WORKBOOK_TEMPLATE,
  getTemplateLineByCode,
  getTemplateLinesBySection,
  getTemplateSectionSummary,
} from "../template";
import { getTemplateLineByCode as actualGetLine } from "../template";
import {
  isAccountInCodeRange,
  deduplicateTbAccounts,
  aggregateTbValues,
  evaluateFormula,
  buildLinesData,
  computeSectionStatsFromLines,
  populateWorkbookFromProject,
  populateWorkbookFromTb,
} from "../population";
import type { AccountCodeRange, TbLine } from "../types";

describe("WorkbookTemplate", () => {
  it("should have 62 lines (32 legacy + 30 official template v.2)", () => {
    expect(WORKBOOK_TEMPLATE.lines.length).toBe(62);
  });

  it("should have version string", () => {
    expect(WORKBOOK_TEMPLATE.version).toBe("1.0");
  });

  it("should have all expected sections", () => {
    const sections = new Set(
      WORKBOOK_TEMPLATE.lines.map((l) => l.section),
    );
    expect(sections.has("company_info")).toBe(true);
    expect(sections.has("revenue")).toBe(true);
    expect(sections.has("cost_of_sales")).toBe(true);
    expect(sections.has("gross_profit")).toBe(true);
    expect(sections.has("supplier_spend")).toBe(true);
    expect(sections.has("lc_assessment")).toBe(true);
    expect(sections.has("workforce")).toBe(true);
    expect(sections.has("goods_services")).toBe(true);
    expect(sections.has("additional_disclosure")).toBe(true);
    expect(sections.has("capex")).toBe(true);
    expect(sections.has("capacity_building")).toBe(true);
    expect(sections.has("depreciation")).toBe(true);
    expect(sections.has("declarations")).toBe(true);
    expect(sections.has("appendix_a")).toBe(true);
  });

  it("should find template line by code", () => {
    const line = getTemplateLineByCode("REV-01");
    expect(line).toBeDefined();
    expect(line?.name).toContain("Local Customer Revenue");
    expect(line?.autoFillable).toBe(true);
  });

  it("should return undefined for non-existent code", () => {
    const line = getTemplateLineByCode("NONEXISTENT");
    expect(line).toBeUndefined();
  });

  it("should get lines by section", () => {
    const revLines = getTemplateLinesBySection("revenue");
    expect(revLines.length).toBe(3);
    expect(revLines[0].code).toBe("REV-01");
    expect(revLines[1].code).toBe("REV-02");
    expect(revLines[2].code).toBe("REV-03");
  });

  it("should return empty array for unregistered section", () => {
    const lines = getTemplateLinesBySection("pizza");
    expect(lines).toEqual([]);
  });

  it("should generate section summary", () => {
    const summary = getTemplateSectionSummary();
    expect(Object.keys(summary).length).toBeGreaterThanOrEqual(8);
    expect(summary.revenue.total).toBe(3);
    expect(summary.revenue.autoFillable).toBe(3);
    expect(summary.company_info.autoFillable).toBe(0);
    expect(summary.declarations.autoFillable).toBe(0);
  });

  it("should have at least some non-auto-fillable lines", () => {
    const nonAuto = WORKBOOK_TEMPLATE.lines.filter((l) => !l.autoFillable);
    expect(nonAuto.length).toBeGreaterThan(0);
  });

  it("should have display order ascending across all lines", () => {
    const orders = WORKBOOK_TEMPLATE.lines.map((l) => l.displayOrder);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBeGreaterThan(orders[i - 1]);
    }
  });

  it("should have unique codes across all lines", () => {
    const codes = WORKBOOK_TEMPLATE.lines.map((l) => l.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it("should have descriptions for all company_info lines", () => {
    const companyLines = getTemplateLinesBySection("company_info");
    for (const line of companyLines) {
      expect(line.description).toBeTruthy();
    }
  });

  it("should have evidence requirements on assets section", () => {
    const assetLines = getTemplateLinesBySection("assets");
    for (const line of assetLines) {
      if (line.evidenceRequired) {
        expect(line.evidenceTypes?.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("WorkbookPopulation (logical)", () => {
  it("template line REV-01 should match revenue-related TB patterns", () => {
    const line = getTemplateLineByCode("REV-01");
    expect(line?.tbAccountPatterns).toBeDefined();
    expect(line!.tbAccountPatterns!.length).toBeGreaterThanOrEqual(3);
  });

  it("template line WRK-01 should not be autoFillable (needs manual input)", () => {
    const line = getTemplateLineByCode("WRK-01");
    expect(line?.autoFillable).toBe(false);
  });

  it("template line INF-01 should require evidence", () => {
    const line = getTemplateLineByCode("INF-01");
    expect(line?.evidenceRequired).toBe(true);
    expect(line?.evidenceTypes).toContain("registration");
  });
});
describe("AccountCodeRange filtering", () => {
  it("should accept account within range prefix", () => {
    const ranges: AccountCodeRange[] = [{ prefix: "4" }];
    expect(isAccountInCodeRange("4401010003", ranges)).toBe(true);
  });

  it("should reject account outside range prefix", () => {
    const ranges: AccountCodeRange[] = [{ prefix: "4" }];
    expect(isAccountInCodeRange("3204010028", ranges)).toBe(false);
  });

  it("should accept account matching first of multiple range prefixes", () => {
    const ranges: AccountCodeRange[] = [{ prefix: "3" }, { prefix: "4" }];
    expect(isAccountInCodeRange("4401010003", ranges)).toBe(true);
    expect(isAccountInCodeRange("3204010028", ranges)).toBe(true);
  });

  it("should return true when no ranges are defined", () => {
    expect(isAccountInCodeRange("4401010003", undefined)).toBe(true);
    expect(isAccountInCodeRange("4401010003", [])).toBe(true);
  });

  it("should exclude account with matching excludePrefix", () => {
    const ranges: AccountCodeRange[] = [{ prefix: "1", excludePrefixes: ["1106"] }];
    expect(isAccountInCodeRange("1201000101", ranges)).toBe(true);
    expect(isAccountInCodeRange("1106010001", ranges)).toBe(false);
  });

  it("WRK-04 template should exclude prepaid accounts (1106)", () => {
    const line = getTemplateLineByCode("WRK-04");
    expect(line?.accountCodeRanges).toBeDefined();
    expect(line!.accountCodeRanges![0].prefix).toBe("3");
    expect(line!.accountCodeRanges![0].excludePrefixes).toContain("1106");
  });

  it("AST-01 template should match depreciation expense accounts (prefix 3)", () => {
    const line = getTemplateLineByCode("AST-01");
    expect(line?.accountCodeRanges).toBeDefined();
    expect(line!.accountCodeRanges![0].prefix).toBe("3");
  });

  it("REV-01 template should only match revenue prefix 4", () => {
    const line = getTemplateLineByCode("REV-01");
    expect(line?.accountCodeRanges).toBeDefined();
    expect(line!.accountCodeRanges![0].prefix).toBe("4");
  });
});
describe("Deduplicate TB accounts", () => {
  it("should remove duplicate account codes", () => {
    const lines = [
      { accountCode: "4401", accountName: "Revenue A", debit: 100, credit: 0 },
      { accountCode: "4401", accountName: "Revenue A dup", debit: 200, credit: 0 },
      { accountCode: "3204", accountName: "Expense B", debit: 50, credit: 0 },
    ];
    const deduped = deduplicateTbAccounts(lines);
    expect(deduped.length).toBe(2);
  });

  it("should keep the entry with higher absolute balance when duplicates exist", () => {
    const lines = [
      { accountCode: "4401", accountName: "Low", debit: 100, credit: 0 },
      { accountCode: "4401", accountName: "High", debit: 500, credit: 0 },
    ];
    const deduped = deduplicateTbAccounts(lines);
    expect(deduped.length).toBe(1);
    expect(deduped[0].accountName).toBe("High");
  });

  it("should handle empty array", () => {
    const deduped = deduplicateTbAccounts([]);
    expect(deduped).toEqual([]);
  });

  it("should handle single entry", () => {
    const lines = [
      { accountCode: "4401", accountName: "Revenue", debit: 100, credit: 0 },
    ];
    const deduped = deduplicateTbAccounts(lines);
    expect(deduped.length).toBe(1);
    expect(deduped[0].accountCode).toBe("4401");
  });
});
describe("Aggregate TB values with code ranges", () => {
  it("should aggregate all matching accounts within code range", () => {
    const revenueLines = [
      { accountCode: "4401010001", accountName: "ايرادات صيانة وتشغيل - غير مدورة", debit: 278000000, credit: 0 },
      { accountCode: "4401010004", accountName: "ايرادات صيانة وتشغيل - مطالبات", debit: 221000000, credit: 0 },
      { accountCode: "3204010028", accountName: "مصروفات حكومية", debit: 58000000, credit: 0 },
    ];
    const value = aggregateTbValues(revenueLines, "REV-03");
    expect(value).not.toBeNull();
    expect(value).toBe(278000000 + 221000000);
  });

  it("should not match accounts outside code range", () => {
    const lines = [
      { accountCode: "3204010028", accountName: "عمولات مبيعات", debit: 1.15, credit: 0 },
    ];
    const value = aggregateTbValues(lines, "REV-01");
    expect(value).toBeNull();
  });

  it("should exclude prepaid accounts from payroll matching", () => {
    const lines = [
      { accountCode: "3204010010", accountName: "رواتب وأجور", debit: 199000000, credit: 0 },
      { accountCode: "1106010001", accountName: "م مدفوعة مقدماً (رواتب واجور)", debit: 2800, credit: 0 },
    ];
    const value = aggregateTbValues(lines, "WRK-04");
    expect(value).not.toBeNull();
    expect(value).toBe(199000000);
  });

  it("should exclude gain on sale accounts from depreciation matching", () => {
    const lines = [
      { accountCode: "3204010050", accountName: "مصروف إهلاك", debit: 9500000, credit: 0 },
      { accountCode: "4402010001", accountName: "أ.خ بيع أصول ثابتة", debit: 47905, credit: 0 },
    ];
    const value = aggregateTbValues(lines, "AST-01");
    // AST-01 now matches depreciation expense (prefix 3), not asset accounts
    expect(value).toBe(9500000);
  });

  it("should match مصروف إهلاك depreciation expense accounts", () => {
    const lines = [
      { accountCode: "3204010050", accountName: "مصروف إهلاك أصول", debit: 9583752.34, credit: 0 },
      { accountCode: "3204010051", accountName: "مصروف إهلاك معدات", debit: 51479.31, credit: 0 },
    ];
    const value = aggregateTbValues(lines, "AST-01");
    // AST-01 matches depreciation expense (prefix 3)
    expect(value).toBe(9583752.34 + 51479.31);
  });

  it("should match تكلفة مردم account for COS", () => {
    const lines = [
      { accountCode: "3204010091", accountName: "تكلفة مردم تبوك (مخزون)", debit: 1267242, credit: 0 },
    ];
    const value = aggregateTbValues(lines, "COS-03");
    expect(value).not.toBeNull();
    expect(value).toBe(1267242);
  });

  it("should return null for empty TB lines", () => {
    const value = aggregateTbValues([], "REV-01");
    expect(value).toBeNull();
  });
});
describe("Formula evaluation", () => {
  it("should compute simple subtraction formula", () => {
    const values = { "REV-03": 547341228.83, "COS-03": 3839810 };
    const result = evaluateFormula("REV-03 - COS-03", values);
    expect(result).not.toBeNull();
    expect(result).toBeCloseTo(543501418.83, 2);
  });

  it("should return null when dependency is missing", () => {
    const values = { "REV-03": 547341228.83 };
    const result = evaluateFormula("REV-03 - COS-03", values);
    expect(result).toBeNull();
  });

  it("should return null when dependency is null", () => {
    const values = { "REV-03": 547341228.83, "COS-03": null };
    const result = evaluateFormula("REV-03 - COS-03", values);
    expect(result).toBeNull();
  });

  it("should handle addition formula", () => {
    const values = { "A": 100, "B": 200 };
    const result = evaluateFormula("A + B", values);
    expect(result).toBe(300);
  });

  it("GP-01 template should have formula 'REV-03 - COS-03'", () => {
    const line = getTemplateLineByCode("GP-01");
    expect(line?.formula).toBe("REV-03 - COS-03");
  });

  it("should not fail when unreferenced value is null", () => {
    const values = {
      "REV-03": 547341228.83,
      "COS-03": 3839810,
      "GP-01": null,
    };
    const result = evaluateFormula("REV-03 - COS-03", values);
    expect(result).not.toBeNull();
    expect(result).toBeCloseTo(543501418.83, 2);
  });

  it("should handle multiplication and division", () => {
    const values = { "WRK-01": 50, "WRK-02": 200 };
    const result = evaluateFormula("WRK-01 / WRK-02 * 100", values);
    expect(result).not.toBeNull();
    expect(result).toBe(25);
  });

  it("should return null for invalid formula expression", () => {
    const values = { "X": 10 };
    const result = evaluateFormula("X +", values);
    expect(result).toBeNull();
  });

  it("should return null for division by zero", () => {
    const values = { "A": 100, "B": 0 };
    const result = evaluateFormula("A / B", values);
    expect(result).toBeNull();
  });
});
// ─── TbLine type and pipeline integration ───

describe("TbLine type", () => {
  it("should accept valid TB line data", () => {
    const line: TbLine = {
      accountCode: "4401010004",
      accountName: "ايرادات الصيانة والتشغيل",
      debit: 221860796.68,
      credit: 0,
    };
    expect(line.accountCode).toBe("4401010004");
    expect(line.accountName).toContain("ايرادات");
    expect(line.debit - line.credit).toBe(221860796.68);
  });

  it("should handle credit-side balances", () => {
    const line: TbLine = {
      accountCode: "2101010001",
      accountName: "دائنون موردون",
      debit: 0,
      credit: 15000000,
    };
    expect(line.debit - line.credit).toBe(-15000000);
    expect(Math.abs(line.debit - line.credit)).toBe(15000000);
  });
});

describe("Full pipeline integration (dedup + aggregate + formula)", () => {
  const tbLines: TbLine[] = [
    { accountCode: "4401010004", accountName: "ايرادات الصيانة والتشغيل", debit: 221860796.68, credit: 0 },
    { accountCode: "4401010002", accountName: "ايرادات عقود الصيانة", debit: 185420000, credit: 0 },
    { accountCode: "4401010003", accountName: "ايرادات عقود التشغيل", debit: 140060432.15, credit: 0 },
    { accountCode: "3204010091", accountName: "تكلفة مردم تبوك ( مخزون)", debit: 1267242, credit: 0 },
    { accountCode: "3205010001", accountName: "رواتب قطاع الحاويات", debit: 567190.65, credit: 0 },
    { accountCode: "3205010002", accountName: "رواتب قطاع الخدمات اللوجستية", debit: 23000000, credit: 0 },
    { accountCode: "1301010006", accountName: "آلات ومعدات", debit: 9583752.34, credit: 0 },
    { accountCode: "1301010007", accountName: "أثاث مكتبى", debit: 299837.95, credit: 0 },
  ];

  it("should deduplicate identical account codes", () => {
    const withDuplicates = [...tbLines, { ...tbLines[0] }];
    const deduped = deduplicateTbAccounts(withDuplicates);
    expect(deduped.length).toBe(tbLines.length);
  });

  it("should aggregate revenue accounts (prefix 4) into REV-03", () => {
    const value = aggregateTbValues(tbLines, "REV-03");
    const expected = 221860796.68 + 185420000 + 140060432.15;
    expect(value).toBeCloseTo(expected, 1);
  });

  it("should aggregate depreciation expense accounts (prefix 3) into AST-01", () => {
    // AST-01 is now depreciation expense, not asset accounts
    const depLines: TbLine[] = [
      { accountCode: "3204010050", accountName: "مصروف إهلاك أصول", debit: 9583752.34, credit: 0 },
      { accountCode: "3204010051", accountName: "مصروف إهلاك مباني", debit: 299837.95, credit: 0 },
    ];
    const value = aggregateTbValues(depLines, "AST-01");
    expect(value).toBeCloseTo(9583752.34 + 299837.95, 1);
  });

  it("should aggregate payroll accounts into WRK-04", () => {
    const value = aggregateTbValues(tbLines, "WRK-04");
    const expected = 567190.65 + 23000000;
    expect(value).toBeCloseTo(expected, 1);
  });

  it("should compute GP-01 formula from REV-03 and COS-03", () => {
    const values: Record<string, number | null> = {};
    for (const code of ["REV-01", "REV-03", "COS-01", "COS-03", "GP-01"]) {
      values[code] = aggregateTbValues(tbLines, code);
    }
    expect(values["REV-03"]).not.toBeNull();
    expect(values["COS-03"]).not.toBeNull();
    const rev03 = values["REV-03"]!;
    const cos03 = values["COS-03"]!;
    const gpFormula = evaluateFormula("REV-03 - COS-03", values);
    expect(gpFormula).toBeCloseTo(rev03 - cos03, 1);
  });

  it("should not match prepaid accounts in WRK-04", () => {
    const withPrepaid = [
      ...tbLines,
      { accountCode: "1106010001", accountName: "م.مقدمة (رواتب)", debit: 2800, credit: 0 },
    ];
    const value = aggregateTbValues(withPrepaid, "WRK-04");
    expect(value).toBeCloseTo(567190.65 + 23000000, 1);
  });
});
// ─── buildLinesData tests ───

describe("buildLinesData", () => {
  it("should return 62 lines matching template count", () => {
    // Pass explicit nulls for all template codes
    const explicitNulls: Record<string, number | null> = {};
    for (const tmpl of WORKBOOK_TEMPLATE.lines) {
      explicitNulls[tmpl.code] = null;
    }
    const result = buildLinesData(explicitNulls, "wb-1");
    expect(result.linesData.length).toBe(62);
    expect(result.autoFilledCount).toBe(0);
  });

  it("should auto-fill lines that have matching TB values", () => {
    const tbValues: Record<string, number | null> = {
      "REV-01": 300000000,
      "REV-02": 100000000,
      "REV-03": 400000000,
    };
    const result = buildLinesData(tbValues, "wb-1");
    const rev01 = result.linesData.find((l) => l.code === "REV-01");
    const rev02 = result.linesData.find((l) => l.code === "REV-02");
    const rev03 = result.linesData.find((l) => l.code === "REV-03");
    expect(rev01?.autoFilled).toBe(true);
    expect(rev01?.autoFillValue).toBe(300000000);
    expect(rev01?.source).toBe("tb");
    expect(rev01?.confidence).toBe("medium");
    expect(rev02?.autoFilled).toBe(true);
    expect(rev02?.autoFillValue).toBe(100000000);
    expect(rev03?.autoFilled).toBe(true);
    expect(rev03?.autoFillValue).toBe(400000000);
  });

  it("should not auto-fill non-autoFillable lines", () => {
    const result = buildLinesData({}, "wb-1");
    const inf01 = result.linesData.find((l) => l.code === "INF-01");
    expect(inf01?.autoFillable).toBe(false);
    expect(inf01?.autoFilled).toBe(false);
    expect(inf01?.source).toBe("tb");
  });

  it("should mark formula-derived lines with correct source and confidence", () => {
    const tbValues: Record<string, number | null> = {
      "REV-03": 500000,
      "COS-03": 200000,
      "GP-01": 300000,
    };
    const result = buildLinesData(tbValues, "wb-1");
    const gp01 = result.linesData.find((l) => l.code === "GP-01");
    expect(gp01?.autoFilled).toBe(true);
    expect(gp01?.source).toBe("formula");
    expect(gp01?.confidence).toBe("high");
    expect(gp01?.autoFillSource).toContain("formula");
    expect(gp01?.autoFillValue).toBe(300000);
  });

  it("should handle null values (no auto-fill)", () => {
    const tbValues: Record<string, number | null> = {
      "REV-01": null,
      "REV-02": null,
    };
    const result = buildLinesData(tbValues, "wb-1");
    const rev01 = result.linesData.find((l) => l.code === "REV-01");
    expect(rev01?.autoFilled).toBe(false);
    expect(rev01?.autoFillValue).toBeNull();
  });

  it("should count auto-filled lines correctly", () => {
    const tbValues: Record<string, number | null> = {
      "REV-01": 100,
      "REV-02": 200,
      "REV-03": 300,
      "COS-01": 50,
      "COS-02": 30,
    };
    const result = buildLinesData(tbValues, "wb-1");
    expect(result.autoFilledCount).toBeGreaterThanOrEqual(5);
    expect(result.autoFilledCount).toBeLessThanOrEqual(62);
  });

  it("should set workbookId on all lines", () => {
    const result = buildLinesData({ "REV-01": 100 }, "wb-special");
    for (const line of result.linesData) {
      expect(line.workbookId).toBe("wb-special");
    }
  });

  it("should serialize evidenceTypes as JSON string", () => {
    const result = buildLinesData({}, "wb-1");
    const inf01 = result.linesData.find((l) => l.code === "INF-01");
    expect(inf01?.evidenceTypes).toBeTruthy();
    if (inf01?.evidenceTypes) {
      const parsed = JSON.parse(inf01.evidenceTypes);
      expect(Array.isArray(parsed)).toBe(true);
    }
  });

  it("should set displayOrder matching template", () => {
    const result = buildLinesData({}, "wb-1");
    const orders = result.linesData.map((l) => l.displayOrder);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBeGreaterThan(orders[i - 1]);
    }
  });
});
// ─── computeSectionStatsFromLines tests ───

describe("computeSectionStatsFromLines", () => {
  it("should compute stats for a single section with all lines filled", () => {
    const lines = [
      { section: "revenue", autoFilled: true, manualValue: null },
      { section: "revenue", autoFilled: false, manualValue: 100 },
      { section: "revenue", autoFilled: false, manualValue: 200 },
    ];
    const stats = computeSectionStatsFromLines(lines);
    expect(stats.revenue.total).toBe(3);
    expect(stats.revenue.filled).toBe(3);
    expect(stats.revenue.pct).toBe(100);
  });

  it("should compute stats for a single section partially filled", () => {
    const lines = [
      { section: "revenue", autoFilled: true, manualValue: null },
      { section: "revenue", autoFilled: false, manualValue: null },
      { section: "revenue", autoFilled: false, manualValue: 200 },
    ];
    const stats = computeSectionStatsFromLines(lines);
    expect(stats.revenue.total).toBe(3);
    expect(stats.revenue.filled).toBe(2);
    expect(stats.revenue.pct).toBe(67);
  });

  it("should compute stats for multiple sections", () => {
    const lines = [
      { section: "revenue", autoFilled: true, manualValue: null },
      { section: "revenue", autoFilled: false, manualValue: null },
      { section: "workforce", autoFilled: false, manualValue: 50 },
    ];
    const stats = computeSectionStatsFromLines(lines);
    expect(stats.revenue.total).toBe(2);
    expect(stats.revenue.filled).toBe(1);
    expect(stats.revenue.pct).toBe(50);
    expect(stats.workforce.total).toBe(1);
    expect(stats.workforce.filled).toBe(1);
    expect(stats.workforce.pct).toBe(100);
  });

  it("should handle section with all empty lines", () => {
    const lines = [
      { section: "workforce", autoFilled: false, manualValue: null },
      { section: "workforce", autoFilled: false, manualValue: null },
    ];
    const stats = computeSectionStatsFromLines(lines);
    expect(stats.workforce.total).toBe(2);
    expect(stats.workforce.filled).toBe(0);
    expect(stats.workforce.pct).toBe(0);
  });

  it("should return empty object for empty lines array", () => {
    const stats = computeSectionStatsFromLines([]);
    expect(stats).toEqual({});
  });
});
// ─── populateWorkbookFromProject tests ───

describe("populateWorkbookFromProject", () => {
  const mockProject = {
    id: "proj-1",
    name: "Test Project",
    reportingPeriod: "2025-Q2",
    organizationId: "org-1",
    suppliers: [
      { id: "sup-1", name: "مورد سعودي" },
    ],
    spendRecords: [
      { id: "sp-1", supplierId: "sup-1", category: "خدمات", description: "خدمات صيانة", amount: 500000 },
    ],
    evidence: [],
  };

  const mockCreatedWorkbook = {
    id: "wb-1",
    projectId: "proj-1",
    title: "Workbook - Test Project (2025-Q2)",
    reportingPeriod: "2025-Q2",
    status: "populated",
    totalLines: 32,
    autoFilledLines: 0,
    missingLines: 32,
    completionPct: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    organizationId: "org-1",
  };

  const mockUpdatedWorkbook = {
    ...mockCreatedWorkbook,
    autoFilledLines: 3,
    missingLines: 29,
    completionPct: 14,
    status: "partial",
  };

  const mockLines = [
    { section: "revenue", autoFilled: true, manualValue: null },
    { section: "revenue", autoFilled: false, manualValue: null },
    { section: "workforce", autoFilled: false, manualValue: null },
  ];

  beforeEach(() => {
    const prisma = require("@/lib/prisma").prisma;
    jest.clearAllMocks();
    // Re-setup prisma mocks after clearAllMocks
    prisma.localContentProject.findFirst.mockResolvedValue(mockProject);
    prisma.lcWorkbook.findFirst
      .mockReset()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockUpdatedWorkbook);
    // Re-setup ai-auto-review mock that clearAllMocks would have cleared
    const aiReview = require("../ai-auto-review");
    aiReview.runWorkbookAiReview.mockResolvedValue(undefined);
    prisma.lcWorkbook.create.mockResolvedValue(mockCreatedWorkbook);
    prisma.lcWorkbookLine.createMany.mockResolvedValue({ count: 32 });
    prisma.lcWorkbook.update.mockResolvedValue(mockUpdatedWorkbook);
    prisma.lcWorkbookLine.findMany.mockResolvedValue(mockLines);
  });

  it("should throw if project is not found", async () => {
    const prisma = require("@/lib/prisma").prisma;
    prisma.localContentProject.findFirst.mockResolvedValue(null);
    await expect(
      populateWorkbookFromProject("nonexistent", "org-1"),
    ).rejects.toThrow("Project not found");
  });

  it("should create a new workbook when none exists", async () => {
    const result = await populateWorkbookFromProject("proj-1", "org-1");
    const prisma = require("@/lib/prisma").prisma;
    expect(prisma.lcWorkbook.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: "proj-1",
          title: expect.stringContaining("Workbook"),
          reportingPeriod: "2025-Q2",
          status: "populated",
        }),
      }),
    );
    expect(prisma.lcWorkbookLine.createMany).toHaveBeenCalledTimes(1);
    expect(prisma.lcWorkbook.update).toHaveBeenCalledTimes(1);
    expect(result.workbookId).toBe("wb-1");
    expect(result.totalLines).toBe(32);
  });

  it("should return existing workbook if already populated", async () => {
    const prisma = require("@/lib/prisma").prisma;
    prisma.lcWorkbook.findFirst.mockReset().mockResolvedValue(mockCreatedWorkbook);
    prisma.lcWorkbookLine.findMany.mockResolvedValue(mockLines);

    const result = await populateWorkbookFromProject("proj-1", "org-1");
    expect(prisma.lcWorkbook.create).not.toHaveBeenCalled();
    expect(result.workbookId).toBeDefined();
  });

  it("should use custom title when provided", async () => {
    await populateWorkbookFromProject("proj-1", "org-1", "Custom Title");
    const prisma = require("@/lib/prisma").prisma;
    expect(prisma.lcWorkbook.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: "Custom Title" }),
      }),
    );
  });

  it("should return sectionStats", async () => {
    const prisma = require("@/lib/prisma").prisma;
    prisma.lcWorkbookLine.findMany.mockResolvedValue([
      { section: "revenue", autoFilled: true, manualValue: null },
      { section: "revenue", autoFilled: false, manualValue: null },
      { section: "workforce", autoFilled: true, manualValue: null },
    ]);
    const result = await populateWorkbookFromProject("proj-1", "org-1");
    expect(result.sectionStats).toBeDefined();
    expect(result.sectionStats.revenue).toBeDefined();
    expect(result.sectionStats.workforce).toBeDefined();
  });
});

// ─── populateWorkbookFromTb tests ───

describe("populateWorkbookFromTb", () => {
  const mockProject = {
    id: "proj-2",
    name: "TB Project",
    reportingPeriod: "2025-Q1",
    organizationId: "org-1",
  };

  const mockCreatedWorkbook = {
    id: "wb-2",
    projectId: "proj-2",
    title: "Workbook - TB Project (2025-Q1)",
    reportingPeriod: "2025-Q1",
    status: "populated",
    totalLines: 32,
    autoFilledLines: 0,
    missingLines: 32,
    completionPct: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    organizationId: "org-1",
  };

  const mockUpdatedWorkbook = {
    ...mockCreatedWorkbook,
    autoFilledLines: 5,
    missingLines: 27,
    completionPct: 23,
    status: "partial",
  };

  const mockTbLines: TbLine[] = [
    { accountCode: "4401010001", accountName: "ايرادات صيانة", debit: 1000000, credit: 0 },
    { accountCode: "4401010002", accountName: "ايرادات تشغيل", debit: 2000000, credit: 0 },
    { accountCode: "3204010091", accountName: "تكلفة مردم", debit: 500000, credit: 0 },
    { accountCode: "3205010001", accountName: "رواتب", debit: 300000, credit: 0 },
  ];

  const mockLines = [
    { section: "revenue", autoFilled: true, manualValue: null },
    { section: "cost_of_sales", autoFilled: true, manualValue: null },
    { section: "workforce", autoFilled: false, manualValue: null },
  ];

  beforeEach(() => {
    const prisma = require("@/lib/prisma").prisma;
    jest.clearAllMocks();
    // Re-setup prisma mocks after clearAllMocks
    prisma.localContentProject.findFirst.mockResolvedValue(mockProject);
    prisma.lcWorkbook.findFirst
      .mockReset()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockUpdatedWorkbook);
    // Re-setup ai-auto-review mock that clearAllMocks would have cleared
    const aiReview = require("../ai-auto-review");
    aiReview.runWorkbookAiReview.mockResolvedValue(undefined);
    prisma.lcWorkbook.create.mockResolvedValue(mockCreatedWorkbook);
    prisma.lcWorkbookLine.createMany.mockResolvedValue({ count: 32 });
    prisma.lcWorkbook.update.mockResolvedValue(mockUpdatedWorkbook);
    prisma.lcWorkbookLine.findMany.mockResolvedValue(mockLines);
  });

  it("should throw if project is not found", async () => {
    const prisma = require("@/lib/prisma").prisma;
    prisma.localContentProject.findFirst.mockResolvedValue(null);
    await expect(
      populateWorkbookFromTb("nonexistent", "org-1", []),
    ).rejects.toThrow("Project not found");
  });

  it("should create a new workbook and populate from TB lines", async () => {
    const result = await populateWorkbookFromTb("proj-2", "org-1", mockTbLines);
    const prisma = require("@/lib/prisma").prisma;
    expect(prisma.lcWorkbook.create).toHaveBeenCalledTimes(1);
    expect(prisma.lcWorkbookLine.createMany).toHaveBeenCalledTimes(1);
    expect(prisma.lcWorkbook.update).toHaveBeenCalledTimes(1);
    expect(result.workbookId).toBe("wb-2");
  });

  it("should delete existing lines and repopulate when workbook exists", async () => {
    const prisma = require("@/lib/prisma").prisma;
    const existingWb = { ...mockCreatedWorkbook, id: "wb-existing", status: "partial" };
    prisma.lcWorkbook.findFirst.mockReset().mockResolvedValue(existingWb);
    const result = await populateWorkbookFromTb("proj-2", "org-1", mockTbLines);
    expect(prisma.lcWorkbook.create).not.toHaveBeenCalled();
    expect(prisma.lcWorkbookLine.deleteMany).toHaveBeenCalledTimes(1);
    expect(prisma.lcWorkbookLine.createMany).toHaveBeenCalledTimes(1);
    expect(result.workbookId).toBe("wb-existing");
  });

  it("should use custom title when provided", async () => {
    await populateWorkbookFromTb("proj-2", "org-1", mockTbLines, "My Custom Workbook");
    const prisma = require("@/lib/prisma").prisma;
    expect(prisma.lcWorkbook.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: "My Custom Workbook" }),
      }),
    );
  });

  it("should return sectionStats", async () => {
    const result = await populateWorkbookFromTb("proj-2", "org-1", mockTbLines);
    expect(result.sectionStats).toBeDefined();
    expect(result.sectionStats.revenue).toBeDefined();
  });

  it("should handle empty TB lines gracefully", async () => {
    const result = await populateWorkbookFromTb("proj-2", "org-1", []);
    expect(result.workbookId).toBeDefined();
    expect(result.totalLines).toBe(32);
  });
});


