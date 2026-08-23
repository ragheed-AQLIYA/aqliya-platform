// ─── LCGPA Regulatory Intelligence :: Mandatory List parser (§28, §45) ───
//
// VERIFIED AGAINST THE OFFICIAL ARTIFACT (retrieved 2026-08-22):
//   القائمة الإلزامية للجهات الحكومية (يوليو 2026).xlsx
//   sha256 93f3e1f4533da8d12644c0c9b964c4712972b1eade347d805458aca0d0d1d632
//   The mandatory list of the national products - ... (July 2026).xlsx
//   sha256 f613722d4017c8b0b2b471b99fba1c61d53bf5f4b29266a4d901671419e83dfc
//
// STRUCTURE (as published, not assumed):
//   One worksheet per sector. The sector's official identity is the sheet NAME;
//   LCGPA publishes no sector code, so `sectorCode` is null and the name is
//   carried in `sectorNameAr`. No code is derived from the name.
//   Header row 1, data from row 2. Column A is empty.
//     B  الرمز في منصة اعتماد Etimad Code
//     C  اسم المنتج (عربي)
//     D  اسم المنتج (انجليزي)
//     E  وصف المنتج (عربي)
//     F  وصف المنتج (انجليزي)
//     G  السقف السعري Price Ceiling                    (government file only)
//     H  تاريخ التطبيق Effective Date
//     I  الحد الأدنى لخط الأساس لمصنع المنتج           (government file only)
//     J  ملاحظات
//   Non-product sheets (نظرة عامة, ضوابط الاستثناء …) carry no Etimad Code
//   column and are skipped, and reported.
//
// Columns are located by their ARABIC labels. The English half of the bilingual
// header is unreliable — in the published file the Arabic name column of the
// البناء و التشييد sheet is labelled "Commodity Title (English)".

import type { RegulatoryArtifact, RegulatoryProduct } from "../types";
import { parseFailure, type AsyncRegulatoryParser, type ParseResult } from "../parser";
import { parseLcgpaDate } from "./arabic-dates";
import {
  findColumn,
  findHeaderRow,
  readWorkbook,
  text,
  type CellValue,
} from "./xlsx-reader";

export const MANDATORY_LIST_PARSER_VERSION = "lcgpa-mandatory-list-xlsx@1.0.0";

/** Column labels as published. Explicit — never inferred from the file. */
export const MANDATORY_LIST_COLUMNS = {
  code: ["الرمز في منصة اعتماد", "etimad code"],
  nameAr: ["اسم المنتج (عربي)"],
  nameEn: ["اسم المنتج (انجليزي)", "اسم المنتج (إنجليزي)"],
  descriptionAr: ["وصف المنتج (عربي)"],
  descriptionEn: ["وصف المنتج (انجليزي)", "وصف المنتج (إنجليزي)"],
  priceCeiling: ["السقف السعري"],
  effectiveDate: ["تاريخ التطبيق"],
  manufacturerBaseline: ["الحد الأدنى لخط الأساس"],
  notes: ["ملاحظات"],
} as const;

export type MandatoryListVariant = "GOVERNMENT_ENTITIES" | "STATE_OWNED_COMPANIES";

/**
 * Canonical Etimad code: digits only, leading zeros removed.
 *
 * The mandatory list publishes zero-padded codes ("0001") while the
 * minimum-local-content schedule publishes them unpadded ("1"). Canonicalising
 * makes the two artifacts joinable without altering what either one states —
 * the published form is preserved in `productCodeRaw`.
 */
export function canonicalEtimadCode(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  const stripped = digits.replace(/^0+/, "");
  return stripped === "" ? "0" : stripped;
}

export interface MandatoryListParserOptions {
  variant: MandatoryListVariant;
  parserVersion?: string;
}

interface SheetOutcome {
  products: RegulatoryProduct[];
  errors: string[];
  warnings: string[];
  rowsRead: number;
}

function parseSheet(
  title: string,
  rows: CellValue[][],
): SheetOutcome | null {
  const headerRow = findHeaderRow(rows, [...MANDATORY_LIST_COLUMNS.code]);
  if (headerRow === null) return null; // not a product sheet

  const header = rows[headerRow];
  const col = (fragments: readonly string[]): number | null =>
    findColumn(header, [...fragments]);

  const errors: string[] = [];
  const warnings: string[] = [];
  const products: RegulatoryProduct[] = [];

  const cCode = col(MANDATORY_LIST_COLUMNS.code);
  const cNameAr = col(MANDATORY_LIST_COLUMNS.nameAr);
  if (cCode === null || cNameAr === null) {
    return {
      products: [],
      rowsRead: 0,
      warnings,
      errors: [
        `MISSING_COLUMNS [${title}]: required column(s) not found — ` +
          `${cCode === null ? "Etimad Code " : ""}${cNameAr === null ? "اسم المنتج (عربي)" : ""}`.trim(),
      ],
    };
  }
  const cNameEn = col(MANDATORY_LIST_COLUMNS.nameEn);
  const cDescAr = col(MANDATORY_LIST_COLUMNS.descriptionAr);
  const cDescEn = col(MANDATORY_LIST_COLUMNS.descriptionEn);
  const cPrice = col(MANDATORY_LIST_COLUMNS.priceCeiling);
  const cDate = col(MANDATORY_LIST_COLUMNS.effectiveDate);
  const cBaseline = col(MANDATORY_LIST_COLUMNS.manufacturerBaseline);
  const cNotes = col(MANDATORY_LIST_COLUMNS.notes);

  const sector = title.replace(/\s+/g, " ").trim();
  const seen = new Set<string>();
  let rowsRead = 0;

  for (let r = headerRow + 1; r < rows.length; r++) {
    const row = rows[r];
    const rawCode = text(row[cCode] ?? null);
    if (rawCode === "") continue; // spacer / blank row
    rowsRead++;

    const code = canonicalEtimadCode(rawCode);
    if (code === "") {
      errors.push(`[${sector} r${r + 1}] PRODUCT_CODE_NON_NUMERIC: "${rawCode}"`);
      continue;
    }
    const nameAr = text(row[cNameAr] ?? null);
    if (nameAr === "") {
      errors.push(`[${sector} r${r + 1}] ${rawCode}: PRODUCT_NAME_AR_MISSING`);
      continue;
    }
    if (seen.has(code)) {
      errors.push(`[${sector} r${r + 1}] ${rawCode}: DUPLICATE_PRODUCT_CODE within sheet`);
      continue;
    }
    seen.add(code);

    let effectiveFrom: Date | null = null;
    if (cDate !== null) {
      const d = parseLcgpaDate(row[cDate] ?? null);
      if (d.error) {
        errors.push(`[${sector} r${r + 1}] ${rawCode}: ${d.error}`);
        continue;
      }
      effectiveFrom = d.value;
    }

    let priceCeilingRaw: number | null = null;
    if (cPrice !== null) {
      const cell = row[cPrice] ?? null;
      if (typeof cell === "number") {
        priceCeilingRaw = cell;
      } else {
        const t = text(cell);
        if (t !== "" && t !== "-") {
          const n = Number(t.replace(/%/g, "").trim());
          if (!Number.isFinite(n)) {
            errors.push(`[${sector} r${r + 1}] ${rawCode}: PRICE_CEILING_UNPARSEABLE: "${t}"`);
            continue;
          }
          priceCeilingRaw = n;
        }
      }
    }

    const notes = cNotes !== null ? text(row[cNotes] ?? null) : "";
    const baseline = cBaseline !== null ? text(row[cBaseline] ?? null) : "";

    products.push({
      productCode: code,
      productCodeRaw: rawCode,
      productNameAr: nameAr,
      productNameEn: cNameEn !== null ? text(row[cNameEn] ?? null) || null : null,
      // LCGPA publishes no sector code in these workbooks. The sheet name is
      // the sector's official identity; inventing a code would manufacture a
      // regulatory fact (§45).
      sectorCode: null,
      sectorNameAr: sector,
      sectorNameEn: null,
      category: null,
      hsCode: null,
      minimumLcPct: null,
      requirements: [],
      applicability: notes || null,
      regulatoryStatus: "ACTIVE",
      effectiveFrom,
      effectiveTo: null,
      descriptionAr: cDescAr !== null ? text(row[cDescAr] ?? null) || null : null,
      descriptionEn: cDescEn !== null ? text(row[cDescEn] ?? null) || null : null,
      priceCeilingRaw,
      manufacturerBaseline: baseline || null,
    });
  }

  return { products, errors, warnings, rowsRead };
}

/**
 * Parser for the LCGPA Mandatory List workbooks.
 *
 * Fails closed: a missing required column, an unparseable date or price
 * ceiling, a non-numeric code, or a duplicate code anywhere in the workbook
 * blocks the entire dataset.
 */
export function createMandatoryListParser(
  options: MandatoryListParserOptions,
): AsyncRegulatoryParser {
  const parserVersion = options.parserVersion ?? MANDATORY_LIST_PARSER_VERSION;

  return {
    parserVersion,
    async parse(_artifact: RegulatoryArtifact, body: Buffer): Promise<ParseResult> {
      let workbook;
      try {
        workbook = await readWorkbook(body);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return parseFailure(parserVersion, [`WORKBOOK_UNREADABLE: ${message}`]);
      }

      const errors: string[] = [];
      const warnings: string[] = [];
      const products: RegulatoryProduct[] = [];
      const productSheets: string[] = [];
      const skippedSheets: string[] = [];
      let rowsRead = 0;

      for (const sheet of workbook.sheets) {
        const outcome = parseSheet(sheet.title, sheet.rows);
        if (outcome === null) {
          skippedSheets.push(sheet.title.trim());
          continue;
        }
        productSheets.push(sheet.title.trim());
        errors.push(...outcome.errors);
        warnings.push(...outcome.warnings);
        products.push(...outcome.products);
        rowsRead += outcome.rowsRead;
      }

      if (productSheets.length === 0) {
        return parseFailure(parserVersion, [
          "NO_PRODUCT_SHEETS: no worksheet contained an Etimad Code column",
        ], rowsRead);
      }

      // Codes must be unique across the whole workbook, not just per sheet.
      const byCode = new Map<string, string>();
      for (const p of products) {
        const sectorName = p.sectorNameAr ?? "(unnamed sheet)";
        const prior = byCode.get(p.productCode);
        if (prior !== undefined && prior !== sectorName) {
          errors.push(
            `DUPLICATE_PRODUCT_CODE_ACROSS_SHEETS: ${p.productCodeRaw} appears in both "${prior}" and "${sectorName}"`,
          );
        } else if (prior !== undefined) {
          errors.push(`DUPLICATE_PRODUCT_CODE: ${p.productCodeRaw} appears twice in "${sectorName}"`);
        }
        byCode.set(p.productCode, sectorName);
      }

      warnings.push(
        `VARIANT: ${options.variant}`,
        `PRODUCT_SHEETS: ${productSheets.length} (${productSheets.join(", ")})`,
        `SKIPPED_SHEETS: ${skippedSheets.length}${skippedSheets.length ? ` (${skippedSheets.join(", ")})` : ""}`,
      );

      if (products.length === 0 && errors.length === 0) {
        errors.push("NO_PRODUCTS_PARSED: product sheets contained no usable rows");
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
