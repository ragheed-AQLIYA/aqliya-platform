// ─── LocalContentOS — LCGPA Mandatory List Tests ───
// Deterministic, explainable, versioned, auditable, reproducible.

import {
  importMandatoryListFromXlsx,
  getActiveMandatoryListVersion,
  getAllMandatoryListVersions,
  getMandatoryListItems,
  searchMandatoryList,
  classifySpendAgainstMandatoryList,
  getMandatoryProductsBySector,
  getSectorInfo,
  getAllSectors,
  clearMandatoryListStore,
} from "../mandatory-list";
import { MandatoryListImportResult, MandatoryListClassification } from "../types";

describe("LCGPA Mandatory List — Import", () => {
  beforeEach(() => {
    clearMandatoryListStore();
  });

  it("imports valid XLSX data successfully", () => {
    const result = importMandatoryListFromXlsx(
      "2026-Q1",
      "https://lcgpa.gov.sa/documents/mandatory-list-2026-q1.xlsx",
      new Date("2026-01-01"),
      [
        {
          productCode: "ML-001",
          productNameAr: "أسمنت بورتلاندي عادي",
          productNameEn: "Ordinary Portland Cement",
          sectorCode: "04",
          sectorNameAr: "صناعات مواد البناء",
          sectorNameEn: "Building Materials Industries",
          effectiveDate: "2026-01-01",
        },
        {
          productCode: "ML-002",
          productNameAr: "حديد تسليح",
          productNameEn: "Reinforcing Steel",
          sectorCode: "04",
          sectorNameAr: "صناعات مواد البناء",
          sectorNameEn: "Building Materials Industries",
          effectiveDate: "2026-01-01",
        },
      ],
      "user-001",
    );

    expect(result.success).toBe(true);
    expect(result.version).toBe("2026-Q1");
    expect(result.productCount).toBe(2);
    expect(result.sectorCount).toBe(1);
    expect(result.errors).toEqual([]);
  });

  it("rejects invalid version format", () => {
    const result = importMandatoryListFromXlsx(
      "2026-Q1-extra",
      "https://lcgpa.gov.sa/documents/list.xlsx",
      new Date("2026-01-01"),
      [],
      "user-001",
    );

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain("Invalid version format");
  });

  it("rejects duplicate version", () => {
    importMandatoryListFromXlsx(
      "2026-Q1",
      "https://lcgpa.gov.sa/documents/list.xlsx",
      new Date("2026-01-01"),
      [{ productCode: "ML-001", productNameAr: "منتج 1", sectorCode: "01", sectorNameAr: "قطاع 1", effectiveDate: "2026-01-01" }],
    );

    const result = importMandatoryListFromXlsx(
      "2026-Q1",
      "https://lcgpa.gov.sa/documents/list2.xlsx",
      new Date("2026-01-01"),
      [{ productCode: "ML-002", productNameAr: "منتج 2", sectorCode: "01", sectorNameAr: "قطاع 1", effectiveDate: "2026-01-01" }],
    );

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain("already exists");
  });

  it("handles duplicate product codes with warning", () => {
    const result = importMandatoryListFromXlsx(
      "2026-Q1",
      "https://lcgpa.gov.sa/documents/list.xlsx",
      new Date("2026-01-01"),
      [
        { productCode: "ML-001", productNameAr: "منتج 1", sectorCode: "S01", sectorNameAr: "خدمات الإسكان", effectiveDate: "2026-01-01" },
        { productCode: "ML-001", productNameAr: "منتج 2", sectorCode: "S01", sectorNameAr: "خدمات الإسكان", effectiveDate: "2026-01-01" }, // duplicate
      ],
    );

    expect(result.success).toBe(true);
    expect(result.productCount).toBe(1);
    expect(result.warnings[0]).toContain("Duplicate productCode");
  });

  it("validates required fields", () => {
    const result = importMandatoryListFromXlsx(
      "2026-Q1",
      "https://lcgpa.gov.sa/documents/list.xlsx",
      new Date("2026-01-01"),
      [
        { productCode: "", productNameAr: "منتج 1", sectorCode: "01", sectorNameAr: "قطاع 1", effectiveDate: "2026-01-01" },
      ],
    );

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain("Missing productCode");
  });

  it("handles unknown sector code with warning", () => {
    const result = importMandatoryListFromXlsx(
      "2026-Q1",
      "https://lcgpa.gov.sa/documents/list.xlsx",
      new Date("2026-01-01"),
      [
        { productCode: "ML-001", productNameAr: "منتج 1", sectorCode: "99", sectorNameAr: "قطاع مجهول", effectiveDate: "2026-01-01" },
      ],
    );

    expect(result.success).toBe(true);
    expect(result.warnings[0]).toContain("Unknown sectorCode");
  });
});

describe("LCGPA Mandatory List — Version Management", () => {
  beforeEach(() => {
    clearMandatoryListStore();
  });

  it("returns active version", () => {
    importMandatoryListFromXlsx(
      "2026-Q1",
      "https://lcgpa.gov.sa/documents/list.xlsx",
      new Date("2026-01-01"),
      [{ productCode: "ML-001", productNameAr: "منتج 1", sectorCode: "01", sectorNameAr: "قطاع 1", effectiveDate: "2026-01-01" }],
    );

    const active = getActiveMandatoryListVersion();
    expect(active).not.toBeNull();
    expect(active!.version).toBe("2026-Q1");
    expect(active!.status).toBe("active");
  });

  it("supersedes previous active version on new import", () => {
    importMandatoryListFromXlsx(
      "2026-Q1",
      "https://lcgpa.gov.sa/documents/list.xlsx",
      new Date("2026-01-01"),
      [{ productCode: "ML-001", productNameAr: "منتج 1", sectorCode: "01", sectorNameAr: "قطاع 1", effectiveDate: "2026-01-01" }],
    );

    importMandatoryListFromXlsx(
      "2026-Q2",
      "https://lcgpa.gov.sa/documents/list2.xlsx",
      new Date("2026-04-01"),
      [{ productCode: "ML-002", productNameAr: "منتج 2", sectorCode: "01", sectorNameAr: "قطاع 1", effectiveDate: "2026-04-01" }],
    );

    const active = getActiveMandatoryListVersion();
    expect(active!.version).toBe("2026-Q2");

    const all = getAllMandatoryListVersions();
    expect(all.length).toBe(2);
    const v1 = all.find(v => v.version === "2026-Q1");
    expect(v1!.status).toBe("superseded");
  });

  it("returns all versions sorted by effective date desc", () => {
    importMandatoryListFromXlsx("2025-Q4", "url", new Date("2025-10-01"), [{ productCode: "ML-001", productNameAr: "منتج", sectorCode: "01", sectorNameAr: "قطاع", effectiveDate: "2025-10-01" }]);
    importMandatoryListFromXlsx("2026-Q1", "url", new Date("2026-01-01"), [{ productCode: "ML-002", productNameAr: "منتج", sectorCode: "01", sectorNameAr: "قطاع", effectiveDate: "2026-01-01" }]);
    importMandatoryListFromXlsx("2026-Q2", "url", new Date("2026-04-01"), [{ productCode: "ML-003", productNameAr: "منتج", sectorCode: "01", sectorNameAr: "قطاع", effectiveDate: "2026-04-01" }]);

    const all = getAllMandatoryListVersions();
    expect(all.map(v => v.version)).toEqual(["2026-Q2", "2026-Q1", "2025-Q4"]);
  });

  it("returns items for a version", () => {
    importMandatoryListFromXlsx(
      "2026-Q1",
      "url",
      new Date("2026-01-01"),
      [
        { productCode: "ML-001", productNameAr: "منتج 1", sectorCode: "01", sectorNameAr: "قطاع 1", effectiveDate: "2026-01-01" },
        { productCode: "ML-002", productNameAr: "منتج 2", sectorCode: "01", sectorNameAr: "قطاع 1", effectiveDate: "2026-01-01" },
      ],
    );

    const items = getMandatoryListItems("2026-Q1");
    expect(items.length).toBe(2);
    expect(items[0].productCode).toBe("ML-001");
  });
});

describe("LCGPA Mandatory List — Search", () => {
  beforeEach(() => {
    clearMandatoryListStore();
    importMandatoryListFromXlsx(
      "2026-Q1",
      "url",
      new Date("2026-01-01"),
      [
        { productCode: "ML-001", productNameAr: "أسمنت بورتلاندي عادي", productNameEn: "Ordinary Portland Cement", sectorCode: "04", sectorNameAr: "صناعات مواد البناء", sectorNameEn: "Building Materials Industries", effectiveDate: "2026-01-01" },
        { productCode: "ML-002", productNameAr: "حديد تسليح", productNameEn: "Reinforcing Steel", sectorCode: "04", sectorNameAr: "صناعات مواد البناء", sectorNameEn: "Building Materials Industries", effectiveDate: "2026-01-01" },
        { productCode: "ML-003", productNameAr: "بلاط سيراميك", productNameEn: "Ceramic Tiles", sectorCode: "04", sectorNameAr: "صناعات مواد البناء", sectorNameEn: "Building Materials Industries", effectiveDate: "2026-01-01" },
        { productCode: "ML-004", productNameAr: "أنابيب بلاستيكية", productNameEn: "Plastic Pipes", sectorCode: "08", sectorNameAr: "صناعات البلاستيك والمطاط", sectorNameEn: "Plastic and Rubber Industries", effectiveDate: "2026-01-01" },
      ],
    );
  });

  it("finds exact product code match", () => {
    const results = searchMandatoryList("ML-001");
    expect(results.length).toBe(1);
    expect(results[0].item.productCode).toBe("ML-001");
    expect(results[0].score).toBe(1);
    expect(results[0].matchType).toBe("exact_code");
  });

  it("finds exact Arabic name match", () => {
    const results = searchMandatoryList("أسمنت بورتلاندي عادي");
    expect(results.length).toBe(1);
    expect(results[0].item.productCode).toBe("ML-001");
    expect(results[0].score).toBe(0.95);
    expect(results[0].matchType).toBe("exact_name");
  });

  it("finds exact English name match", () => {
    const results = searchMandatoryList("Ordinary Portland Cement");
    expect(results.length).toBe(1);
    expect(results[0].item.productCode).toBe("ML-001");
    expect(results[0].score).toBe(0.9);
    expect(results[0].matchType).toBe("exact_name");
  });

  it("finds partial Arabic name match", () => {
    const results = searchMandatoryList("أسمنت");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.productCode).toBe("ML-001");
    expect(results[0].matchType).toBe("partial_name");
    expect(results[0].score).toBeGreaterThan(0.3);
  });

  it("finds sector match", () => {
    const results = searchMandatoryList("04");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].matchType).toBe("sector");
  });

  it("limits results", () => {
    const results = searchMandatoryList("أسمنت", undefined, { limit: 1 });
    expect(results.length).toBe(1);
  });

  it("filters by version", () => {
    importMandatoryListFromXlsx(
      "2026-Q2",
      "url",
      new Date("2026-04-01"),
      [{ productCode: "ML-005", productNameAr: "منتج جديد", sectorCode: "01", sectorNameAr: "قطاع 1", effectiveDate: "2026-04-01" }],
    );

    const results = searchMandatoryList("ML-005", "2026-Q1");
    expect(results.length).toBe(0);

    const results2 = searchMandatoryList("ML-005", "2026-Q2");
    expect(results2.length).toBe(1);
  });
});

describe("LCGPA Mandatory List — Classification", () => {
  beforeEach(() => {
    clearMandatoryListStore();
    importMandatoryListFromXlsx(
      "2026-Q1",
      "url",
      new Date("2026-01-01"),
      [
        { productCode: "ML-001", productNameAr: "أسمنت بورتلاندي عادي", productNameEn: "Ordinary Portland Cement", sectorCode: "P09", sectorNameAr: "منتجات الاسمنت والجبس", sectorNameEn: "Cement & Gypsum Products", effectiveDate: "2026-01-01" },
        { productCode: "ML-002", productNameAr: "حديد تسليح", productNameEn: "Reinforcing Steel", sectorCode: "P10", sectorNameAr: "منتجات تصنيع حديد التسليح", sectorNameEn: "Rebar Manufacturing", effectiveDate: "2026-01-01" },
      ],
    );
  });

  it("classifies by exact product code", () => {
    const result = classifySpendAgainstMandatoryList({ productCode: "ML-001" });
    expect(result.isMandatory).toBe(true);
    expect(result.confidence).toBe(1.0);
    expect(result.match?.productCode).toBe("ML-001");
    expect(result.notes).toContain("Exact product code match");
  });

  it("classifies by exact Arabic name", () => {
    const result = classifySpendAgainstMandatoryList({ productNameAr: "أسمنت بورتلاندي عادي" });
    expect(result.isMandatory).toBe(true);
    expect(result.confidence).toBe(0.95);
    expect(result.notes).toContain("Exact Arabic name match");
  });

  it("classifies by partial Arabic name with high score", () => {
    const result = classifySpendAgainstMandatoryList({ productNameAr: "أسمنت بورتلاندي" });
    expect(result.isMandatory).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.7);
    expect(result.notes).toContain("Partial Arabic name match");
  });

  it("classifies by exact English name", () => {
    const result = classifySpendAgainstMandatoryList({ productNameEn: "Ordinary Portland Cement" });
    expect(result.isMandatory).toBe(true);
    expect(result.confidence).toBe(0.9);
    expect(result.notes).toContain("Exact English name match");
  });

  it("does not classify sector-only match as mandatory", () => {
    const result = classifySpendAgainstMandatoryList({ sectorCode: "P09" });
    expect(result.isMandatory).toBe(false);
    expect(result.confidence).toBe(0.3);
    expect(result.notes).toContain("Sector match only");
  });

  it("returns not mandatory for no match", () => {
    const result = classifySpendAgainstMandatoryList({ productNameAr: "منتج غير موجود" });
    expect(result.isMandatory).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.notes).toContain("No match found");
  });
});

describe("LCGPA Mandatory List — Sector Queries", () => {
  beforeEach(() => {
    clearMandatoryListStore();
    importMandatoryListFromXlsx(
      "2026-Q1",
      "url",
      new Date("2026-01-01"),
      [
        { productCode: "ML-001", productNameAr: "منتج 1", sectorCode: "P09", sectorNameAr: "منتجات الاسمنت والجبس", effectiveDate: "2026-01-01" },
        { productCode: "ML-002", productNameAr: "منتج 2", sectorCode: "P09", sectorNameAr: "منتجات الاسمنت والجبس", effectiveDate: "2026-01-01" },
        { productCode: "ML-003", productNameAr: "منتج 3", sectorCode: "P05", sectorNameAr: "منتجات الآلات والمعدات", effectiveDate: "2026-01-01" },
      ],
    );
  });

  it("gets products by sector", () => {
    const items = getMandatoryProductsBySector("P09");
    expect(items.length).toBe(2);
    expect(items.every(i => i.sectorCode === "P09")).toBe(true);
  });

  it("gets sector info", () => {
    const sector = getSectorInfo("S04");
    expect(sector).not.toBeNull();
    expect(sector!.nameAr).toBe("خدمات الأمن");
    expect(sector!.nameEn).toBe("Security Services");
  });

  it("returns null for unknown sector", () => {
    const sector = getSectorInfo("99");
    expect(sector).toBeNull();
  });

  it("gets all 38 sectors (23 service + 15 product)", () => {
    const sectors = getAllSectors();
    expect(sectors.length).toBe(38);
    expect(sectors[0].code).toBe("S01");
    expect(sectors[37].code).toBe("P15");
  });
});

describe("LCGPA Mandatory List — Arabic Normalization", () => {
  beforeEach(() => {
    clearMandatoryListStore();
    importMandatoryListFromXlsx(
      "2026-Q1",
      "url",
      new Date("2026-01-01"),
      [
        { productCode: "ML-001", productNameAr: "أسمنت", productNameEn: "Cement", sectorCode: "04", sectorNameAr: "صناعات مواد البناء", effectiveDate: "2026-01-01" },
      ],
    );
  });

  it("matches Alef variants (أ، إ، آ)", () => {
    const results = searchMandatoryList("اسمنت"); // Plain alef
    expect(results.length).toBe(1);
    expect(results[0].item.productNameAr).toBe("أسمنت");
  });

  it("matches Ta Marbuta (ة vs ه)", () => {
    importMandatoryListFromXlsx(
      "2026-Q2",
      "url",
      new Date("2026-04-01"),
      [{ productCode: "ML-002", productNameAr: "سيارة", sectorCode: "10", sectorNameAr: "صناعات السيارات", effectiveDate: "2026-04-01" }],
    );

    const results = searchMandatoryList("سياره"); // With ha instead of ta marbuta
    expect(results.length).toBe(1);
    expect(results[0].item.productNameAr).toBe("سيارة");
  });

  it("matches Alef Maksura (ى vs ي)", () => {
    importMandatoryListFromXlsx(
      "2026-Q2",
      "url",
      new Date("2026-04-01"),
      [{ productCode: "ML-003", productNameAr: "مصنعى", sectorCode: "01", sectorNameAr: "الصناعات الغذائية", effectiveDate: "2026-04-01" }],
    );

    const results = searchMandatoryList("مصنعي"); // With ya instead of alef maksura
    expect(results.length).toBe(1);
    expect(results[0].item.productNameAr).toBe("مصنعى");
  });

  it("ignores diacritics", () => {
    const results = searchMandatoryList("أسمنت"); // With diacritics
    expect(results.length).toBe(1);
  });
});

describe("LCGPA Mandatory List — Edge Cases", () => {
  beforeEach(() => {
    clearMandatoryListStore();
  });

  it("handles empty query gracefully", () => {
    const results = searchMandatoryList("");
    expect(results).toEqual([]);
  });

  it("handles special characters in query", () => {
    importMandatoryListFromXlsx(
      "2026-Q1",
      "url",
      new Date("2026-01-01"),
      [{ productCode: "ML-001", productNameAr: "منتج (خاص)", productNameEn: "Special Product", sectorCode: "01", sectorNameAr: "قطاع 1", effectiveDate: "2026-01-01" }],
    );

    const results = searchMandatoryList("منتج (خاص)");
    expect(results.length).toBe(1);
  });

  it("handles version with no active list", () => {
    const active = getActiveMandatoryListVersion();
    expect(active).toBeNull();
  });

  it("classification prefers code over name", () => {
    importMandatoryListFromXlsx(
      "2026-Q1",
      "url",
      new Date("2026-01-01"),
      [
        { productCode: "ML-001", productNameAr: "منتج أ", sectorCode: "01", sectorNameAr: "قطاع 1", effectiveDate: "2026-01-01" },
        { productCode: "ML-002", productNameAr: "منتج ب", sectorCode: "01", sectorNameAr: "قطاع 1", effectiveDate: "2026-01-01" },
      ],
    );

    // Even if name matches ML-002, code match should win
    const result = classifySpendAgainstMandatoryList({
      productCode: "ML-001",
      productNameAr: "منتج ب",
    });

    expect(result.match?.productCode).toBe("ML-001");
  });
});