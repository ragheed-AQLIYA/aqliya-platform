// ─── LCGPA Regulatory Intelligence :: Minimum Local Content schedule parser ───
//
// VERIFIED AGAINST THE OFFICIAL ARTIFACT (retrieved 2026-08-22):
//   الحد الأدنى لنسبة المحتوى المحلي في شهادة المحتوى المحلي على منتجات
//   القائمة الإلزامية - يوليو 2026.xlsx
//   sha256 acec6451903348b92484c4e0280d26a076e2321219d565e1253a0aa9d111673f
//
// STRUCTURE (as published):
//   One worksheet. Header row 1, data from row 2.
//     A  الرمز في منصة اعتماد Etimad Code
//     B  اسم المنتج (عربي)
//     C  اسم المنتج (انجليزي)
//     D  تاريخ بدء إشتراط الحد الأدنى        e.g. "1 أغسطس 2026م"
//     E… نسبة الحد الأدنى لعام 2026 … 2031    one column per year
//
//   Year cells carry three distinct meanings and NONE of them is zero:
//     a number  → the binding minimum for that year, published as a fraction
//     "-"       → NOT_APPLICABLE, the requirement does not bind that year
//     "TBD"     → the authority has not determined it yet
//
// UNIT CONVERSION: values are published as fractions (0.23 = 23%). The engine
// stores percentages 0-100, so a value of 1 or below is multiplied by 100 and
// the conversion is recorded as a warning. A value above 1 is already a
// percentage and is taken as-is. Nothing else is transformed.

import type {
  MinimumLcScheduleEntry,
  RegulatoryArtifact,
  RegulatoryProduct,
} from "../types";
import { parseFailure, type AsyncRegulatoryParser, type ParseResult } from "../parser";
import { parseLcgpaDate } from "./arabic-dates";
import { canonicalEtimadCode } from "./lcgpa-mandatory-list";
import {
  findColumn,
  findHeaderRow,
  readWorkbook,
  text,
  type CellValue,
} from "./xlsx-reader";

export const MINIMUM_LC_PARSER_VERSION = "lcgpa-minimum-lc-xlsx@1.0.0";

export const MINIMUM_LC_COLUMNS = {
  code: ["الرمز في منصة اعتماد", "etimad code"],
  nameAr: ["اسم المنتج (عربي)"],
  nameEn: ["اسم المنتج (انجليزي)", "اسم المنتج (إنجليزي)"],
  startDate: ["تاريخ بدء إشتراط", "تاريخ بدء اشتراط"],
  yearPrefix: ["نسبة الحد الأدنى لعام"],
} as const;

/** Literal cell values the authority uses for "no number". */
export const NOT_APPLICABLE_TOKENS = ["-", "–", "—", "لا ينطبق", "n/a", "na"];
export const TBD_TOKENS = ["tbd", "t.b.d", "غير محدد", "لم يحدد"];

export interface MinimumLcCell {
  entry: MinimumLcScheduleEntry;
  error: string | null;
  converted: boolean;
}

/** Interpret one year cell exactly as published. */
export function parseMinimumLcCell(year: number, value: CellValue): MinimumLcCell {
  const raw = text(value);
  const lowered = raw.toLowerCase();

  if (raw === "") {
    return {
      entry: { year, pct: null, state: "NOT_APPLICABLE", raw: "" },
      error: null,
      converted: false,
    };
  }
  if (NOT_APPLICABLE_TOKENS.includes(lowered)) {
    return {
      entry: { year, pct: null, state: "NOT_APPLICABLE", raw },
      error: null,
      converted: false,
    };
  }
  if (TBD_TOKENS.includes(lowered)) {
    return { entry: { year, pct: null, state: "TBD", raw }, error: null, converted: false };
  }

  const numeric =
    typeof value === "number" ? value : Number(raw.replace(/%/g, "").trim());
  if (!Number.isFinite(numeric)) {
    return {
      entry: { year, pct: null, state: "TBD", raw },
      error: `MINIMUM_LC_UNPARSEABLE [${year}]: "${raw}" is neither a number, "-" nor "TBD"`,
      converted: false,
    };
  }
  if (numeric < 0) {
    return {
      entry: { year, pct: null, state: "TBD", raw },
      error: `MINIMUM_LC_OUT_OF_RANGE [${year}]: ${numeric}`,
      converted: false,
    };
  }

  const converted = numeric <= 1;
  const pct = converted ? numeric * 100 : numeric;
  if (pct > 100) {
    return {
      entry: { year, pct: null, state: "TBD", raw },
      error: `MINIMUM_LC_OUT_OF_RANGE [${year}]: ${pct} exceeds 100`,
      converted,
    };
  }
  return {
    entry: { year, pct: Math.round(pct * 1e6) / 1e6, state: "STATED", raw },
    error: null,
    converted,
  };
}

/** The minimum in force for a given calendar year, from a published schedule. */
export function scheduleValueForYear(
  schedule: MinimumLcScheduleEntry[],
  year: number,
): number | null {
  const entry = schedule.find((e) => e.year === year);
  return entry && entry.state === "STATED" ? entry.pct : null;
}

export interface MinimumLcParserOptions {
  /**
   * Calendar year whose published percentage becomes `minimumLcPct`.
   * Required — the engine never assumes "the current year".
   */
  effectiveYear: number;
  parserVersion?: string;
}

/**
 * Parser for the LCGPA minimum-local-content schedule workbook.
 *
 * Every product carries the full published schedule. `minimumLcPct` is the
 * value published for `effectiveYear`, and is null whenever that year is
 * "-" or "TBD" — never zero.
 */
export function createMinimumLcParser(
  options: MinimumLcParserOptions,
): AsyncRegulatoryParser {
  const parserVersion = options.parserVersion ?? MINIMUM_LC_PARSER_VERSION;

  return {
    parserVersion,
    async parse(_artifact: RegulatoryArtifact, body: Buffer): Promise<ParseResult> {
      if (!Number.isInteger(options.effectiveYear)) {
        return parseFailure(parserVersion, [
          "EFFECTIVE_YEAR_REQUIRED: the schedule year must be supplied explicitly",
        ]);
      }

      let workbook;
      try {
        workbook = await readWorkbook(body);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return parseFailure(parserVersion, [`WORKBOOK_UNREADABLE: ${message}`]);
      }

      const sheet = workbook.sheets[0];
      if (!sheet) return parseFailure(parserVersion, ["ARTIFACT_EMPTY: no worksheet"]);

      const headerRow = findHeaderRow(sheet.rows, [...MINIMUM_LC_COLUMNS.code]);
      if (headerRow === null) {
        return parseFailure(parserVersion, [
          "MISSING_COLUMNS: no Etimad Code column found in the first worksheet",
        ]);
      }
      const header = sheet.rows[headerRow];
      const cCode = findColumn(header, [...MINIMUM_LC_COLUMNS.code]);
      const cNameAr = findColumn(header, [...MINIMUM_LC_COLUMNS.nameAr]);
      const cNameEn = findColumn(header, [...MINIMUM_LC_COLUMNS.nameEn]);
      const cStart = findColumn(header, [...MINIMUM_LC_COLUMNS.startDate]);
      if (cCode === null || cNameAr === null) {
        return parseFailure(parserVersion, [
          "MISSING_COLUMNS: Etimad Code and اسم المنتج (عربي) are both required",
        ]);
      }

      // Year columns, discovered from the published header text.
      const yearCols: { index: number; year: number }[] = [];
      for (let i = 0; i < header.length; i++) {
        const label = text(header[i]);
        if (!MINIMUM_LC_COLUMNS.yearPrefix.some((p) => label.includes(p))) continue;
        const m = /\b(20\d{2})\b/.exec(label);
        if (!m) continue;
        yearCols.push({ index: i, year: Number(m[1]) });
      }
      if (yearCols.length === 0) {
        return parseFailure(parserVersion, [
          "MISSING_COLUMNS: no «نسبة الحد الأدنى لعام YYYY» columns found",
        ]);
      }
      const years = yearCols.map((y) => y.year).sort((a, b) => a - b);
      if (!years.includes(options.effectiveYear)) {
        return parseFailure(parserVersion, [
          `EFFECTIVE_YEAR_NOT_PUBLISHED: ${options.effectiveYear} is not among the published years (${years.join(", ")})`,
        ]);
      }

      const errors: string[] = [];
      const warnings: string[] = [];
      const products: RegulatoryProduct[] = [];
      const seen = new Set<string>();
      let rowsRead = 0;
      let convertedCells = 0;
      let blankRun = 0;

      for (let r = headerRow + 1; r < sheet.rows.length; r++) {
        const row = sheet.rows[r];
        const rawCode = text(row[cCode] ?? null);
        if (rawCode === "") {
          blankRun++;
          // The published sheet declares ~1,000,000 formatted rows; stop after a
          // long blank run rather than scanning empty formatting.
          if (blankRun > 50) break;
          continue;
        }
        blankRun = 0;
        rowsRead++;

        const code = canonicalEtimadCode(rawCode);
        if (code === "") {
          errors.push(`[r${r + 1}] PRODUCT_CODE_NON_NUMERIC: "${rawCode}"`);
          continue;
        }
        const nameAr = text(row[cNameAr] ?? null);
        if (nameAr === "") {
          errors.push(`[r${r + 1}] ${rawCode}: PRODUCT_NAME_AR_MISSING`);
          continue;
        }
        if (seen.has(code)) {
          errors.push(`[r${r + 1}] ${rawCode}: DUPLICATE_PRODUCT_CODE`);
          continue;
        }
        seen.add(code);

        let effectiveFrom: Date | null = null;
        if (cStart !== null) {
          const d = parseLcgpaDate(row[cStart] ?? null);
          if (d.error) {
            errors.push(`[r${r + 1}] ${rawCode}: ${d.error}`);
            continue;
          }
          effectiveFrom = d.value;
        }

        const schedule: MinimumLcScheduleEntry[] = [];
        let rowFailed = false;
        for (const yc of yearCols) {
          const cell = parseMinimumLcCell(yc.year, row[yc.index] ?? null);
          if (cell.error) {
            errors.push(`[r${r + 1}] ${rawCode}: ${cell.error}`);
            rowFailed = true;
            break;
          }
          if (cell.converted) convertedCells++;
          schedule.push(cell.entry);
        }
        if (rowFailed) continue;

        products.push({
          productCode: code,
          productCodeRaw: rawCode,
          productNameAr: nameAr,
          productNameEn: cNameEn !== null ? text(row[cNameEn] ?? null) || null : null,
          // The schedule publishes no sector at all.
          sectorCode: null,
          sectorNameAr: null,
          sectorNameEn: null,
          category: null,
          hsCode: null,
          minimumLcPct: scheduleValueForYear(schedule, options.effectiveYear),
          requirements: [],
          applicability: null,
          regulatoryStatus: "ACTIVE",
          effectiveFrom,
          effectiveTo: null,
          minimumLcSchedule: schedule,
        });
      }

      warnings.push(
        `PUBLISHED_YEARS: ${years.join(", ")}`,
        `EFFECTIVE_YEAR: ${options.effectiveYear}`,
        `FRACTION_TO_PERCENT_CONVERSIONS: ${convertedCells} cell(s) with a value of 1 or below were multiplied by 100`,
      );

      if (products.length === 0 && errors.length === 0) {
        errors.push("NO_PRODUCTS_PARSED: worksheet contained no usable rows");
      }

      return {
        ok: errors.length === 0,
        products: errors.length === 0 ? products : [],
        errors,
        warnings,
        parserVersion,
        rowsRead,
      };
    },
  };
}
