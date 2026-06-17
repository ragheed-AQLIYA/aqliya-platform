// ─── LocalContentOS Workbook — Population Engine Tests ───
// Phase 1: Unit tests for TB→workbook mapping and population engine.

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
} from "../population";
import type { AccountCodeRange, TbLine } from "../types";

describe("WorkbookTemplate", () => {
  it("should have exactly 22 lines", () => {
    expect(WORKBOOK_TEMPLATE.lines.length).toBe(22);
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
    expect(sections.has("workforce")).toBe(true);
    expect(sections.has("assets")).toBe(true);
    expect(sections.has("declarations")).toBe(true);
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
    // Asset account - should pass
    expect(isAccountInCodeRange("1201000101", ranges)).toBe(true);
    // Prepaid account - should fail
    expect(isAccountInCodeRange("1106010001", ranges)).toBe(false);
  });

  it("WRK-04 template should exclude prepaid accounts (1106)", () => {
    const line = getTemplateLineByCode("WRK-04");
    expect(line?.accountCodeRanges).toBeDefined();
    expect(line!.accountCodeRanges![0].prefix).toBe("3");
    expect(line!.accountCodeRanges![0].excludePrefixes).toContain("1106");
  });

  it("AST-01 template should exclude gain/loss accounts (4)", () => {
    const line = getTemplateLineByCode("AST-01");
    expect(line?.accountCodeRanges).toBeDefined();
    expect(line!.accountCodeRanges![0].prefix).toBe("1");
    expect(line!.accountCodeRanges![0].excludePrefixes).toContain("4");
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
});

describe("Aggregate TB values with code ranges", () => {
  it("should aggregate all matching accounts within code range", () => {
    const revenueLines = [
      { accountCode: "4401010001", accountName: "ايرادات صيانة وتشغيل - غير مدورة", debit: 278000000, credit: 0 },
      { accountCode: "4401010004", accountName: "ايرادات صيانة وتشغيل - مطالبات", debit: 221000000, credit: 0 },
      { accountCode: "3204010028", accountName: "مصروفات حكومية", debit: 58000000, credit: 0 },
    ];

    // REV-03 with code range "4" should only match the first two
    const value = aggregateTbValues(revenueLines, "REV-03");
    expect(value).not.toBeNull();
    expect(value).toBe(278000000 + 221000000);
  });

  it("should not match accounts outside code range", () => {
    const lines = [
      { accountCode: "3204010028", accountName: "عمولات مبيعات", debit: 1.15, credit: 0 },
    ];

    // REV-01 with code range "4" should NOT expense accounts
    const value = aggregateTbValues(lines, "REV-01");
    expect(value).toBeNull();
  });

  it("should exclude prepaid accounts from payroll matching", () => {
    const lines = [
      { accountCode: "3204010010", accountName: "رواتب وأجور", debit: 199000000, credit: 0 },
      { accountCode: "1106010001", accountName: "م مدفوعة مقدماً (رواتب واجور)", debit: 2800, credit: 0 },
    ];

    // WRK-04 should only match the first (expense) not the prepaid
    const value = aggregateTbValues(lines, "WRK-04");
    expect(value).not.toBeNull();
    expect(value).toBe(199000000); // Not 199002800
  });

  it("should exclude gain on sale accounts from asset matching", () => {
    const lines = [
      { accountCode: "1201000101", accountName: "أصول ثابتة - معدات", debit: 9500000, credit: 0 },
      { accountCode: "4402010001", accountName: "أ.خ بيع أصول ثابتة", debit: 47905, credit: 0 },
    ];

    // AST-01 should only match the first (fixed asset) not the gain
    const value = aggregateTbValues(lines, "AST-01");
    expect(value).not.toBeNull();
    expect(value).toBe(9500000); // Not 9547905
  });

  it("should match آلات ومعدات asset account with code prefix 1", () => {
    const lines = [
      { accountCode: "1301010006", accountName: "آلات ومعدات", debit: 9583752.34, credit: 0 },
      { accountCode: "3204010071", accountName: "مصروفات معدات وادوات صيانه", debit: 51479.31, credit: 0 },
    ];

    const value = aggregateTbValues(lines, "AST-01");
    expect(value).not.toBeNull();
    expect(value).toBe(9583752.34); // Should only match asset account
  });

  it("should match تكلفة مردم account for COS", () => {
    const lines = [
      { accountCode: "3204010091", accountName: "تكلفة مردم تبوك (مخزون)", debit: 1267242, credit: 0 },
    ];

    const value = aggregateTbValues(lines, "COS-03");
    expect(value).not.toBeNull();
    expect(value).toBe(1267242);
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
    const values = { "REV-03": 547341228.83 }; // COS-03 is missing
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
    // Values map contains GP-01 which has a formula but no TB match → null
    // The formula only uses REV-03 and COS-03, so GP-01 being null should not block it
    const values = {
      "REV-03": 547341228.83,
      "COS-03": 3839810,
      "GP-01": null, // unreferenced in formula
    };
    const result = evaluateFormula("REV-03 - COS-03", values);
    expect(result).not.toBeNull();
    expect(result).toBeCloseTo(543501418.83, 2);
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

  it("should aggregate asset accounts (prefix 1, exclude 4) into AST-01", () => {
    const value = aggregateTbValues(tbLines, "AST-01");
    const expected = 9583752.34 + 299837.95;
    expect(value).toBeCloseTo(expected, 1);
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
    // REV-03 should match
    expect(values["REV-03"]).not.toBeNull();
    // COS-03 should match تكلفة مردم
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
    expect(value).toBeCloseTo(567190.65 + 23000000, 1); // Prepaid not included
  });
});
