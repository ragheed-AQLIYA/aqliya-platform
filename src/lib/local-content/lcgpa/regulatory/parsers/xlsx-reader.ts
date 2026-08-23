// ─── LCGPA Regulatory Intelligence :: OOXML reader (§41) ───
//
// Reads CACHED CELL VALUES ONLY. A formula cell yields its stored result; the
// formula itself is never evaluated and never treated as regulatory truth.
// External-link values are surfaced as warnings by the integrity layer before
// this reader is ever reached.

import ExcelJS from "exceljs";

/** A single normalized cell value. */
export type CellValue = string | number | Date | null;

export interface SheetData {
  title: string;
  /** Row-major values, 0-indexed columns, empty trailing cells trimmed. */
  rows: CellValue[][];
}

export interface WorkbookData {
  sheets: SheetData[];
}

interface RichTextRun {
  text?: string;
}

/** Normalize one ExcelJS cell value to a primitive, taking cached results only. */
export function normalizeCell(value: unknown): CellValue {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "string") {
    const t = value.trim();
    return t === "" ? null : t;
  }
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    // Formula cell: use the cached result, never the formula.
    if ("result" in v) return normalizeCell(v.result);
    if ("formula" in v || "sharedFormula" in v) return null;
    // Rich text
    if (Array.isArray(v.richText)) {
      const text = (v.richText as RichTextRun[])
        .map((r) => r.text ?? "")
        .join("")
        .trim();
      return text === "" ? null : text;
    }
    // Hyperlink cell
    if ("text" in v) return normalizeCell(v.text);
    // Error cell (#REF!, #N/A …) — not a value.
    if ("error" in v) return null;
  }
  return null;
}

/**
 * Load a workbook from raw artifact bytes.
 * The buffer is never mutated.
 */
export async function readWorkbook(body: Buffer): Promise<WorkbookData> {
  const wb = new ExcelJS.Workbook();
  // ExcelJS mutates nothing in the source buffer; it parses a copy.
  await wb.xlsx.load(body as unknown as ArrayBuffer);

  const sheets: SheetData[] = [];
  wb.eachSheet((ws) => {
    const rows: CellValue[][] = [];
    ws.eachRow({ includeEmpty: true }, (row) => {
      const values: CellValue[] = [];
      const count = row.cellCount;
      for (let c = 1; c <= count; c++) {
        values.push(normalizeCell(row.getCell(c).value));
      }
      while (values.length > 0 && values[values.length - 1] === null) {
        values.pop();
      }
      rows.push(values);
    });
    sheets.push({ title: ws.name, rows });
  });

  return { sheets };
}

/** Trimmed string form of a cell, or "" when absent. */
export function text(value: CellValue): string {
  if (value === null) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value).replace(/\s+/g, " ").trim();
}

/**
 * Locate a column by matching any of the supplied fragments against the header
 * text. LCGPA headers are bilingual and their wording varies between sheets and
 * between publications, so matching is fragment-based rather than exact —
 * but the fragments themselves are supplied explicitly by the caller and are
 * never inferred from the file.
 */
export function findColumn(
  header: CellValue[],
  fragments: string[],
): number | null {
  const normalized = header.map((h) => text(h).toLowerCase());
  for (let i = 0; i < normalized.length; i++) {
    const cell = normalized[i];
    if (cell === "") continue;
    if (fragments.some((f) => cell.includes(f.toLowerCase()))) return i;
  }
  return null;
}

/** Find the first row that looks like a header, given required fragments. */
export function findHeaderRow(
  rows: CellValue[][],
  requiredFragments: string[],
  maxScan = 10,
): number | null {
  for (let r = 0; r < Math.min(rows.length, maxScan); r++) {
    if (findColumn(rows[r], requiredFragments) !== null) return r;
  }
  return null;
}
