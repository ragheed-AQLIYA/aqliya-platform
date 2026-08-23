// ─── LCGPA Regulatory Intelligence :: Parsing Contract (§28, §41, §45) ───
//
// Parsing is separated from acquisition so that a parser failure can NEVER be
// mistaken for a dataset update (§28):
//
//     ARTIFACT_ACQUIRED → SOURCE_VERIFIED → PARSER_FAILED
//        ⇒ REGULATORY_DATA_PIPELINE_FAILURE, dataset NOT updated
//
// EVIDENCE BOUNDARY (2026-08-21):
//   The canonical LCGPA Mandatory List artifact could not be retrieved from this
//   environment, so its column structure is UNVERIFIED. No parser in this file
//   guesses that structure. `unresolvedArtifactParser` is the default and fails
//   closed with an explicit blocker. A real parser is installed only after an
//   operator verifies the artifact and supplies an explicit column mapping.

import type { RegulatoryArtifact, RegulatoryProduct } from "./types";
import { REGULATORY_PARSER_VERSION } from "./types";

export interface ParseResult {
  ok: boolean;
  products: RegulatoryProduct[];
  /** Blocking problems. Non-empty ⇒ the dataset must NOT be created. */
  errors: string[];
  warnings: string[];
  parserVersion: string;
  /** Rows read from the artifact, including rejected ones. */
  rowsRead: number;
}

/** Parser port. Implementations receive the RAW artifact bytes, unmodified. */
export interface RegulatoryParser {
  readonly parserVersion: string;
  parse(artifact: RegulatoryArtifact, body: Buffer): ParseResult;
}

/**
 * Asynchronous parser port, for formats whose reader is async (OOXML via
 * ExcelJS, PDF extraction). Same contract, same fail-closed guarantees.
 */
export interface AsyncRegulatoryParser {
  readonly parserVersion: string;
  parse(artifact: RegulatoryArtifact, body: Buffer): Promise<ParseResult>;
}

export type AnyRegulatoryParser = RegulatoryParser | AsyncRegulatoryParser;

/** Await either parser shape. The only call path the pipeline uses. */
export async function runParser(
  parser: AnyRegulatoryParser,
  artifact: RegulatoryArtifact,
  body: Buffer,
): Promise<ParseResult> {
  try {
    return await parser.parse(artifact, body);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return parseFailure(parser.parserVersion, [`PARSER_THREW: ${message}`]);
  }
}

export function parseFailure(
  parserVersion: string,
  errors: string[],
  rowsRead = 0,
): ParseResult {
  return { ok: false, products: [], errors, warnings: [], parserVersion, rowsRead };
}

// ─── Explicit column mapping ───

/**
 * Operator-supplied mapping from the official artifact's own column headers to
 * normalized fields. Every mapping is explicit: nothing is inferred from a
 * header name, and no field is defaulted (§45).
 */
export interface ColumnMapping {
  productCode: string;
  productNameAr: string;
  productNameEn?: string;
  sectorCode: string;
  sectorNameAr?: string;
  sectorNameEn?: string;
  category?: string;
  hsCode?: string;
  minimumLcPct?: string;
  applicability?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  /** Columns whose presence means the product carries that requirement. */
  requirementColumns?: string[];
}

/** Columns without which a dataset cannot be asserted at all. */
export const REQUIRED_MAPPING_KEYS: (keyof ColumnMapping)[] = [
  "productCode",
  "productNameAr",
  "sectorCode",
];

export function validateColumnMapping(
  mapping: Partial<ColumnMapping>,
): string[] {
  const errors: string[] = [];
  for (const key of REQUIRED_MAPPING_KEYS) {
    if (!mapping[key]) {
      errors.push(`COLUMN_MAPPING_INCOMPLETE: required mapping "${key}" is missing`);
    }
  }
  return errors;
}

// ─── Value coercion (fails closed) ───

/** Parse a percentage. Returns null for anything not unambiguously numeric. */
export function parsePercent(raw: string | undefined): {
  value: number | null;
  error: string | null;
} {
  if (raw === undefined) return { value: null, error: null };
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null, error: null };
  const cleaned = trimmed.replace(/%/g, "").replace(/٫/g, ".").trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n)) {
    return { value: null, error: `MINIMUM_LC_UNPARSEABLE: "${raw}"` };
  }
  if (n < 0 || n > 100) {
    return { value: null, error: `MINIMUM_LC_OUT_OF_RANGE: ${n} is outside 0-100` };
  }
  return { value: n, error: null };
}

/** Parse an ISO date. Ambiguous or locale-dependent formats are rejected. */
export function parseIsoDate(raw: string | undefined): {
  value: Date | null;
  error: string | null;
} {
  if (raw === undefined) return { value: null, error: null };
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null, error: null };
  if (!/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(trimmed)) {
    return {
      value: null,
      error: `DATE_FORMAT_AMBIGUOUS: "${raw}" is not an unambiguous ISO-8601 date; effective dates are never guessed`,
    };
  }
  const d = new Date(trimmed.length === 10 ? `${trimmed}T00:00:00.000Z` : trimmed);
  if (Number.isNaN(d.getTime())) {
    return { value: null, error: `DATE_UNPARSEABLE: "${raw}"` };
  }
  return { value: d, error: null };
}

// ─── Delimited (CSV/TSV) parser ───

/** Minimal RFC4180 reader — quoted fields, embedded commas and newlines. */
export function readDelimited(text: string, delimiter = ","): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  // Strip a UTF-8 BOM if present.
  if (text.charCodeAt(0) === 0xfeff) i = 1;

  for (; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else if (ch === "\r") {
      // handled by the \n branch
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export interface DelimitedParserOptions {
  mapping: ColumnMapping;
  delimiter?: string;
  parserVersion?: string;
  /** Default regulatory status when the artifact states none. */
  defaultRegulatoryStatus?: RegulatoryProduct["regulatoryStatus"];
}

/**
 * Build a parser for a delimited official artifact using an EXPLICIT mapping.
 *
 * Fails closed: a missing mapped column, an unparseable percentage, an ambiguous
 * date or a duplicate product code all block the whole dataset.
 */
export function createDelimitedParser(
  options: DelimitedParserOptions,
): RegulatoryParser {
  const parserVersion = options.parserVersion ?? REGULATORY_PARSER_VERSION;
  const mappingErrors = validateColumnMapping(options.mapping);

  return {
    parserVersion,
    parse(_artifact, body) {
      if (mappingErrors.length > 0) {
        return parseFailure(parserVersion, mappingErrors);
      }

      let rows: string[][];
      try {
        rows = readDelimited(body.toString("utf8"), options.delimiter ?? ",");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return parseFailure(parserVersion, [`ARTIFACT_UNREADABLE: ${message}`]);
      }

      if (rows.length < 2) {
        return parseFailure(parserVersion, [
          "ARTIFACT_EMPTY: fewer than two rows (a header row and at least one data row are required)",
        ]);
      }

      const header = rows[0].map((h) => h.trim());
      const index = new Map(header.map((h, i) => [h, i]));
      const m = options.mapping;

      const missing: string[] = [];
      const requiredColumns = [m.productCode, m.productNameAr, m.sectorCode];
      for (const col of requiredColumns) {
        if (!index.has(col)) missing.push(col);
      }
      if (missing.length > 0) {
        return parseFailure(
          parserVersion,
          [`MISSING_COLUMNS: ${missing.join(", ")} not present in the artifact header`],
          rows.length - 1,
        );
      }

      const cell = (row: string[], column?: string): string | undefined => {
        if (!column) return undefined;
        const i = index.get(column);
        if (i === undefined) return undefined;
        const value = row[i];
        return value === undefined ? undefined : value.trim();
      };

      const errors: string[] = [];
      const warnings: string[] = [];
      const products: RegulatoryProduct[] = [];
      const seen = new Set<string>();

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const productCode = cell(row, m.productCode) ?? "";
        const productNameAr = cell(row, m.productNameAr) ?? "";
        const sectorCode = cell(row, m.sectorCode) ?? "";

        if (!productCode) {
          errors.push(`[row ${r + 1}] PRODUCT_CODE_MISSING`);
          continue;
        }
        if (!productNameAr) {
          errors.push(`[row ${r + 1}] ${productCode}: PRODUCT_NAME_AR_MISSING`);
          continue;
        }
        if (!sectorCode) {
          errors.push(`[row ${r + 1}] ${productCode}: SECTOR_CODE_MISSING`);
          continue;
        }
        if (seen.has(productCode)) {
          errors.push(
            `[row ${r + 1}] ${productCode}: DUPLICATE_PRODUCT_CODE within a single artifact`,
          );
          continue;
        }
        seen.add(productCode);

        const pct = parsePercent(cell(row, m.minimumLcPct));
        if (pct.error) errors.push(`[row ${r + 1}] ${productCode}: ${pct.error}`);

        const from = parseIsoDate(cell(row, m.effectiveFrom));
        if (from.error) errors.push(`[row ${r + 1}] ${productCode}: ${from.error}`);

        const to = parseIsoDate(cell(row, m.effectiveTo));
        if (to.error) errors.push(`[row ${r + 1}] ${productCode}: ${to.error}`);

        const requirements = (m.requirementColumns ?? [])
          .filter((col) => {
            const v = cell(row, col);
            return v !== undefined && v !== "" && v.toLowerCase() !== "no";
          })
          .sort();

        products.push({
          productCode,
          productNameAr,
          productNameEn: cell(row, m.productNameEn) || null,
          sectorCode,
          sectorNameAr: cell(row, m.sectorNameAr) || null,
          sectorNameEn: cell(row, m.sectorNameEn) || null,
          category: cell(row, m.category) || null,
          hsCode: cell(row, m.hsCode) || null,
          minimumLcPct: pct.value,
          requirements,
          applicability: cell(row, m.applicability) || null,
          regulatoryStatus: options.defaultRegulatoryStatus ?? "ACTIVE",
          effectiveFrom: from.value,
          effectiveTo: to.value,
        });
      }

      if (products.length === 0 && errors.length === 0) {
        errors.push("NO_PRODUCTS_PARSED: artifact contained no usable product rows");
      }

      return {
        ok: errors.length === 0,
        products: errors.length === 0 ? products : [],
        errors,
        warnings,
        parserVersion,
        rowsRead: rows.length - 1,
      };
    },
  };
}

// ─── Default parser: the evidence boundary ───

export const UNRESOLVED_ARTIFACT_BLOCKER =
  "EVIDENCE_BOUNDARY: the canonical LCGPA Mandatory List artifact has not been retrieved and verified, so its structure is unknown. Register a parser with an explicit, operator-verified ColumnMapping before ingestion. No structure is assumed.";

/**
 * The default parser. It always fails, on purpose.
 *
 * This is the honest state of the system until an operator verifies the
 * canonical artifact. It guarantees that no dataset can be created from an
 * assumed schema.
 */
export const unresolvedArtifactParser: RegulatoryParser = {
  parserVersion: "unresolved-artifact@0.0.0",
  parse() {
    return parseFailure("unresolved-artifact@0.0.0", [UNRESOLVED_ARTIFACT_BLOCKER]);
  },
};

/** Registry of parsers by source id. */
export interface ParserRegistry {
  register(sourceId: string, parser: AnyRegulatoryParser): void;
  /** Returns the registered parser, or the fail-closed default. */
  forSource(sourceId: string): AnyRegulatoryParser;
  has(sourceId: string): boolean;
}

export function createParserRegistry(): ParserRegistry {
  const map = new Map<string, AnyRegulatoryParser>();
  return {
    register: (sourceId, parser) => {
      map.set(sourceId, parser);
    },
    forSource: (sourceId) => map.get(sourceId) ?? unresolvedArtifactParser,
    has: (sourceId) => map.has(sourceId),
  };
}
