import {
  canonicalEtimadCode,
  createMandatoryListParser,
} from "../../parsers/lcgpa-mandatory-list";
import { normalizeCell, findColumn, text } from "../../parsers/xlsx-reader";
import type { RegulatoryArtifact } from "../../types";
import {
  MANDATORY_HEADER_MISLABELLED,
  OVERVIEW_SHEET,
  buildWorkbook,
  govRow,
  governmentSheet,
} from "./workbook-fixtures";

const ARTIFACT = { sha256: "a".repeat(64) } as RegulatoryArtifact;
const parser = createMandatoryListParser({ variant: "GOVERNMENT_ENTITIES" });

describe("LCGPA parsers :: canonical Etimad code", () => {
  it("strips leading zeros so the two published code formats join", () => {
    expect(canonicalEtimadCode("0001")).toBe("1");
    expect(canonicalEtimadCode("1")).toBe("1");
    expect(canonicalEtimadCode("2353")).toBe("2353");
  });

  it("returns empty for a non-numeric code", () => {
    expect(canonicalEtimadCode("ABC")).toBe("");
    expect(canonicalEtimadCode("")).toBe("");
  });

  it("preserves a genuine zero", () => {
    expect(canonicalEtimadCode("0000")).toBe("0");
  });
});

describe("LCGPA parsers :: OOXML cell normalisation (§41)", () => {
  it("takes the CACHED RESULT of a formula, never the formula", () => {
    expect(normalizeCell({ formula: "SUM(A1:A9)", result: 42 })).toBe(42);
    expect(normalizeCell({ formula: "A1&B1" })).toBeNull();
  });

  it("flattens rich text and hyperlink cells", () => {
    expect(normalizeCell({ richText: [{ text: "بلاط " }, { text: "سيراميك" }] })).toBe(
      "بلاط سيراميك",
    );
    expect(normalizeCell({ text: "Ceramic", hyperlink: "https://x" })).toBe("Ceramic");
  });

  it("treats an error cell as no value", () => {
    expect(normalizeCell({ error: "#REF!" })).toBeNull();
  });

  it("locates a column by any supplied fragment", () => {
    const header = [null, "الرمز في منصة اعتماد Etimad Code", "اسم المنتج (عربي)"];
    expect(findColumn(header, ["etimad code"])).toBe(1);
    expect(findColumn(header, ["اسم المنتج (عربي)"])).toBe(2);
    expect(findColumn(header, ["nope"])).toBeNull();
    expect(text(header[1])).toContain("Etimad Code");
  });
});

describe("LCGPA parsers :: mandatory list workbook", () => {
  it("parses the published structure and skips non-product sheets", async () => {
    const body = await buildWorkbook([
      OVERVIEW_SHEET,
      governmentSheet("الأدوية و المستحضرات الطبية", [
        govRow({ code: "0001", nameAr: "املوديبين", nameEn: "AMLODIPINE" }),
        govRow({ code: "0002", nameAr: "دابوكستين" }),
      ]),
      governmentSheet("البناء و التشييد ", [govRow({ code: "2353", nameAr: "بلاط سيراميك" })]),
    ]);
    const result = await parser.parse(ARTIFACT, body);

    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.products).toHaveLength(3);
    expect(result.rowsRead).toBe(3);
    expect(result.warnings.join(" ")).toMatch(/SKIPPED_SHEETS: 1/);
    expect(result.warnings.join(" ")).toMatch(/VARIANT: GOVERNMENT_ENTITIES/);
  });

  it("carries the official sector NAME and invents no sector code (§45)", async () => {
    const body = await buildWorkbook([
      governmentSheet("الأدوية و المستحضرات الطبية", [govRow({ code: "0001" })]),
    ]);
    const result = await parser.parse(ARTIFACT, body);
    const p = result.products[0];
    // LCGPA publishes no sector code in these workbooks, so there is none.
    expect(p.sectorCode).toBeNull();
    expect(p.sectorNameAr).toBe("الأدوية و المستحضرات الطبية");
    expect(p.sectorNameEn).toBeNull();
    expect(p.hsCode).toBeNull();
    expect(p.category).toBeNull();
  });

  it("NEVER derives a sector code from the sector name", async () => {
    const body = await buildWorkbook([
      governmentSheet("الأدوية و المستحضرات الطبية", [govRow({ code: "0001" })]),
      governmentSheet("البناء و التشييد ", [govRow({ code: "0002" })]),
    ]);
    const result = await parser.parse(ARTIFACT, body);
    expect(result.products.every((p) => p.sectorCode === null)).toBe(true);
    expect(new Set(result.products.map((p) => p.sectorNameAr)).size).toBe(2);
  });

  it("captures every published field", async () => {
    const body = await buildWorkbook([
      governmentSheet("الأدوية و المستحضرات الطبية", [
        govRow({
          code: "0001",
          nameAr: "املوديبين",
          nameEn: "AMLODIPINE",
          descAr: "الشكل الصيدلاني (كبسولة)",
          descEn: "Dosage form (Capsule)",
          priceCeiling: 0.1,
          effectiveDate: "2020-04-07",
          baseline: "يشترط وجود شهادة المحتوى المحلي للمصنع",
          notes: "ملاحظة",
        }),
      ]),
    ]);
    const p = (await parser.parse(ARTIFACT, body)).products[0];
    expect(p.productCode).toBe("1");
    expect(p.productCodeRaw).toBe("0001");
    expect(p.productNameAr).toBe("املوديبين");
    expect(p.productNameEn).toBe("AMLODIPINE");
    expect(p.descriptionAr).toBe("الشكل الصيدلاني (كبسولة)");
    expect(p.descriptionEn).toBe("Dosage form (Capsule)");
    expect(p.priceCeilingRaw).toBe(0.1);
    expect(p.manufacturerBaseline).toBe("يشترط وجود شهادة المحتوى المحلي للمصنع");
    expect(p.applicability).toBe("ملاحظة");
    expect(p.effectiveFrom?.toISOString()).toBe("2020-04-07T00:00:00.000Z");
    expect(p.minimumLcPct).toBeNull(); // published in a different artifact
  });

  it("handles the sheet whose Arabic column is mislabelled in the official file", async () => {
    const body = await buildWorkbook([
      {
        title: "البناء و التشييد ",
        header: MANDATORY_HEADER_MISLABELLED,
        rows: [[null, "2353", "بلاط سيراميك", "Ceramic tiles", "وصف", "definition", "2022-12-18", null]],
      },
    ]);
    const result = await parser.parse(ARTIFACT, body);
    expect(result.ok).toBe(true);
    expect(result.products[0].productNameAr).toBe("بلاط سيراميك");
    expect(result.products[0].productNameEn).toBe("Ceramic tiles");
  });

  it("skips spacer rows without counting them", async () => {
    const body = await buildWorkbook([
      governmentSheet("الأثاث ", [
        govRow({ code: "0001" }),
        [null, null, null],
        govRow({ code: "0002" }),
      ]),
    ]);
    const result = await parser.parse(ARTIFACT, body);
    expect(result.rowsRead).toBe(2);
    expect(result.products).toHaveLength(2);
  });

  it("FAILS the dataset on a duplicate code within a sheet", async () => {
    const body = await buildWorkbook([
      governmentSheet("الأثاث ", [govRow({ code: "0001" }), govRow({ code: "0001" })]),
    ]);
    const result = await parser.parse(ARTIFACT, body);
    expect(result.ok).toBe(false);
    expect(result.products).toEqual([]);
    expect(result.errors.join(" ")).toMatch(/DUPLICATE_PRODUCT_CODE/);
  });

  it("FAILS the dataset when the same code appears in two sheets", async () => {
    const body = await buildWorkbook([
      governmentSheet("الأثاث ", [govRow({ code: "0001" })]),
      governmentSheet("الأعمال الفنية", [govRow({ code: "1" })]),
    ]);
    const result = await parser.parse(ARTIFACT, body);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/DUPLICATE_PRODUCT_CODE_ACROSS_SHEETS/);
  });

  it("FAILS on an ambiguous effective date rather than guessing", async () => {
    const body = await buildWorkbook([
      governmentSheet("الأثاث ", [govRow({ code: "0001", effectiveDate: "01/08/2026" })]),
    ]);
    const result = await parser.parse(ARTIFACT, body);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/DATE_FORMAT_UNRECOGNISED/);
  });

  it("FAILS on an unparseable price ceiling", async () => {
    const body = await buildWorkbook([
      governmentSheet("الأثاث ", [govRow({ code: "0001", priceCeiling: "عشرة" })]),
    ]);
    const result = await parser.parse(ARTIFACT, body);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/PRICE_CEILING_UNPARSEABLE/);
  });

  it("FAILS on a missing Arabic product name", async () => {
    const body = await buildWorkbook([
      governmentSheet("الأثاث ", [govRow({ code: "0001", nameAr: "" })]),
    ]);
    const result = await parser.parse(ARTIFACT, body);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/PRODUCT_NAME_AR_MISSING/);
  });

  it("FAILS when no worksheet carries an Etimad Code column", async () => {
    const body = await buildWorkbook([OVERVIEW_SHEET]);
    const result = await parser.parse(ARTIFACT, body);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/NO_PRODUCT_SHEETS/);
  });

  it("FAILS on a buffer that is not a workbook", async () => {
    const result = await parser.parse(ARTIFACT, Buffer.from("not a workbook"));
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/WORKBOOK_UNREADABLE/);
  });

  it("treats an absent price ceiling as UNKNOWN, never zero (§45)", async () => {
    const body = await buildWorkbook([
      governmentSheet("الأثاث ", [govRow({ code: "0001", priceCeiling: null })]),
    ]);
    const p = (await parser.parse(ARTIFACT, body)).products[0];
    expect(p.priceCeilingRaw).toBeNull();
    expect(p.priceCeilingRaw).not.toBe(0);
  });
});
