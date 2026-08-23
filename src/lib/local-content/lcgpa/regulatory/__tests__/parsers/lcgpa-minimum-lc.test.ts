import {
  createMinimumLcParser,
  parseMinimumLcCell,
  scheduleValueForYear,
} from "../../parsers/lcgpa-minimum-lc";
import type { RegulatoryArtifact } from "../../types";
import { buildWorkbook, minimumRow, minimumSheet } from "./workbook-fixtures";

const ARTIFACT = { sha256: "b".repeat(64) } as RegulatoryArtifact;
const parser2026 = createMinimumLcParser({ effectiveYear: 2026 });

describe("LCGPA parsers :: minimum-LC cell semantics (§45)", () => {
  it("converts a published fraction to a percentage", () => {
    const c = parseMinimumLcCell(2026, 0.23);
    expect(c.entry.state).toBe("STATED");
    expect(c.entry.pct).toBe(23);
    expect(c.converted).toBe(true);
  });

  it("treats «-» as NOT_APPLICABLE, never as zero", () => {
    const c = parseMinimumLcCell(2026, "-");
    expect(c.entry.state).toBe("NOT_APPLICABLE");
    expect(c.entry.pct).toBeNull();
    expect(c.entry.pct).not.toBe(0);
    expect(c.error).toBeNull();
  });

  it("treats «TBD» as TBD, never as zero", () => {
    const c = parseMinimumLcCell(2031, "TBD");
    expect(c.entry.state).toBe("TBD");
    expect(c.entry.pct).toBeNull();
    expect(c.entry.raw).toBe("TBD");
  });

  it("treats an empty cell as NOT_APPLICABLE", () => {
    expect(parseMinimumLcCell(2026, null).entry.state).toBe("NOT_APPLICABLE");
  });

  it("takes a value above 1 as an already-expressed percentage", () => {
    const c = parseMinimumLcCell(2026, 23);
    expect(c.entry.pct).toBe(23);
    expect(c.converted).toBe(false);
  });

  it("REFUSES an unparseable or out-of-range value", () => {
    expect(parseMinimumLcCell(2026, "لاحقاً").error).toMatch(/MINIMUM_LC_UNPARSEABLE/);
    expect(parseMinimumLcCell(2026, 250).error).toMatch(/MINIMUM_LC_OUT_OF_RANGE/);
    expect(parseMinimumLcCell(2026, -1).error).toMatch(/MINIMUM_LC_OUT_OF_RANGE/);
  });

  it("resolves the value for a specific year only when it is STATED", () => {
    const schedule = [
      { year: 2026, pct: null, state: "NOT_APPLICABLE" as const, raw: "-" },
      { year: 2027, pct: 19, state: "STATED" as const, raw: "0.19" },
    ];
    expect(scheduleValueForYear(schedule, 2026)).toBeNull();
    expect(scheduleValueForYear(schedule, 2027)).toBe(19);
    expect(scheduleValueForYear(schedule, 2099)).toBeNull();
  });
});

describe("LCGPA parsers :: minimum-LC workbook", () => {
  it("parses the published July 2026 structure", async () => {
    const body = await buildWorkbook([
      minimumSheet([
        minimumRow({
          code: "2353",
          nameAr: "بلاط سيراميك",
          nameEn: "Ceramic tiles or flagstones",
          start: "1 أغسطس 2026م",
          years: [0.23, 0.27, 0.3, 0.4, 0.6, "TBD"],
        }),
        minimumRow({
          code: "2118",
          nameAr: "الصمامات البوابية",
          nameEn: "Gate Valves",
          start: "1 أغسطس 2027م",
          years: ["-", 0.19, 0.23, 0.3, 0.4, 0.53],
        }),
      ]),
    ]);
    const result = await parser2026.parse(ARTIFACT, body);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.products).toHaveLength(2);
    expect(result.warnings.join(" ")).toMatch(
      /PUBLISHED_YEARS: 2026, 2027, 2028, 2029, 2030, 2031/,
    );

    const tiles = result.products.find((p) => p.productCode === "2353");
    expect(tiles?.minimumLcPct).toBe(23);
    expect(tiles?.effectiveFrom?.toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(tiles?.minimumLcSchedule?.map((e) => [e.year, e.pct, e.state])).toEqual([
      [2026, 23, "STATED"],
      [2027, 27, "STATED"],
      [2028, 30, "STATED"],
      [2029, 40, "STATED"],
      [2030, 60, "STATED"],
      [2031, null, "TBD"],
    ]);

    const valves = result.products.find((p) => p.productCode === "2118");
    expect(valves?.minimumLcPct).toBeNull(); // "-" in 2026 is not zero
    expect(valves?.effectiveFrom?.toISOString()).toBe("2027-08-01T00:00:00.000Z");
  });

  it("binds minimumLcPct to the requested year, not to «the latest»", async () => {
    const body = await buildWorkbook([
      minimumSheet([
        minimumRow({ code: "2118", start: "1 أغسطس 2027م", years: ["-", 0.19, 0.23, 0.3, 0.4, 0.53] }),
      ]),
    ]);
    const y2027 = await createMinimumLcParser({ effectiveYear: 2027 }).parse(ARTIFACT, body);
    const y2030 = await createMinimumLcParser({ effectiveYear: 2030 }).parse(ARTIFACT, body);
    expect(y2027.products[0].minimumLcPct).toBe(19);
    expect(y2030.products[0].minimumLcPct).toBe(40);
  });

  it("REFUSES a year the artifact does not publish", async () => {
    const body = await buildWorkbook([minimumSheet([minimumRow({ code: "2353" })])]);
    const result = await createMinimumLcParser({ effectiveYear: 2035 }).parse(ARTIFACT, body);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/EFFECTIVE_YEAR_NOT_PUBLISHED/);
  });

  it("REQUIRES the effective year to be supplied explicitly", async () => {
    const body = await buildWorkbook([minimumSheet([minimumRow({ code: "2353" })])]);
    const result = await createMinimumLcParser({
      effectiveYear: undefined as unknown as number,
    }).parse(ARTIFACT, body);
    expect(result.errors.join(" ")).toMatch(/EFFECTIVE_YEAR_REQUIRED/);
  });

  it("stops after a long blank run instead of scanning a million formatted rows", async () => {
    const rows: (string | number | Date | null)[][] = [minimumRow({ code: "2353" })];
    for (let i = 0; i < 120; i++) rows.push([null]);
    const body = await buildWorkbook([minimumSheet(rows)]);
    const result = await parser2026.parse(ARTIFACT, body);
    expect(result.ok).toBe(true);
    expect(result.rowsRead).toBe(1);
  });

  it("FAILS on a duplicate code", async () => {
    const body = await buildWorkbook([
      minimumSheet([minimumRow({ code: "2353" }), minimumRow({ code: "2353" })]),
    ]);
    const result = await parser2026.parse(ARTIFACT, body);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/DUPLICATE_PRODUCT_CODE/);
  });

  it("FAILS on an unrecognised start date", async () => {
    const body = await buildWorkbook([
      minimumSheet([minimumRow({ code: "2353", start: "قريباً" })]),
    ]);
    const result = await parser2026.parse(ARTIFACT, body);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/DATE_FORMAT_UNRECOGNISED/);
  });

  it("FAILS when the year columns are absent", async () => {
    const body = await buildWorkbook([
      {
        title: "Sheet1",
        header: ["الرمز في منصة اعتماد Etimad Code", "اسم المنتج (عربي)"],
        rows: [["2353", "بلاط"]],
      },
    ]);
    const result = await parser2026.parse(ARTIFACT, body);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/نسبة الحد الأدنى لعام/);
  });

  it("reports how many cells were converted from fractions", async () => {
    const body = await buildWorkbook([
      minimumSheet([minimumRow({ code: "2353", years: [0.23, 0.27, 0.3, 0.4, 0.6, "TBD"] })]),
    ]);
    const result = await parser2026.parse(ARTIFACT, body);
    expect(result.warnings.join(" ")).toMatch(/FRACTION_TO_PERCENT_CONVERSIONS: 5/);
  });
});
