// ─── AQLIYA XLSX Helper Functions ───
// Replaces XLSX.utils.aoa_to_sheet, json_to_sheet, sheet_to_json
// with ExcelJS-native equivalents.

import type ExcelJS from "exceljs";
import type { Worksheet } from "./types";

/**
 * Convert an array-of-arrays to worksheet rows.
 * Replaces: XLSX.utils.aoa_to_sheet(data)
 *
 * The first row is treated as headers if `hasHeaders` is true (default).
 * Column widths can be set via `colWidths` (array of width values).
 */
export function aoaToSheet(
  workbook: ExcelJS.Workbook,
  data: unknown[][],
  options?: { hasHeaders?: boolean; colWidths?: number[]; sheetName?: string },
): Worksheet {
  const ws = workbook.addWorksheet(options?.sheetName ?? "Sheet1");

  for (let r = 0; r < data.length; r++) {
    const rowData = data[r];
    if (!rowData) continue;
    ws.addRow(rowData);
  }

  if (options?.colWidths) {
    for (let c = 0; c < options.colWidths.length; c++) {
      const col = ws.getColumn(c + 1);
      col.width = options.colWidths[c]!;
    }
  }

  return ws;
}

/**
 * Convert an array-of-objects to worksheet rows.
 * Replaces: XLSX.utils.json_to_sheet(data)
 *
 * Uses the first object's keys as column headers.
 */
export function jsonToSheet(
  workbook: ExcelJS.Workbook,
  data: Record<string, unknown>[],
  options?: { sheetName?: string },
): Worksheet {
  if (data.length === 0) {
    return workbook.addWorksheet(options?.sheetName ?? "Sheet1");
  }

  const keys = Object.keys(data[0]!);
  const ws = workbook.addWorksheet(options?.sheetName ?? "Sheet1");

  ws.addRow(keys);

  for (const row of data) {
    ws.addRow(keys.map((k) => row[k]));
  }

  return ws;
}

/**
 * Convert worksheet rows to array-of-arrays.
 * Replaces: XLSX.utils.sheet_to_json(ws, { header: 1 })
 *
 * If headerRow is true (default), the first row is treated as headers
 * and returned as the first element. All rows include empty cells as "".
 */
export function sheetToJsonArrays(
  worksheet: Worksheet,
  options?: { includeEmpty?: boolean },
): unknown[][] {
  const includeEmpty = options?.includeEmpty !== false;
  const result: unknown[][] = [];

  worksheet.eachRow({ includeEmpty: true }, (row, _rowNum) => {
    const rowData: unknown[] = [];
    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      rowData[colNum - 1] = cell.value;
    });
    if (includeEmpty || rowData.some((v) => v != null && v !== "")) {
      result.push(rowData);
    }
  });

  return result;
}

/**
 * Convert worksheet rows to array-of-objects using the first row as headers.
 * Replaces: XLSX.utils.sheet_to_json(ws) (default mode)
 *
 * Returns one object per data row (skips header row 1).
 * If `defval` is provided, missing cells default to that value.
 */
export function sheetToJsonObjects(
  worksheet: Worksheet,
  options?: { defval?: string },
): Record<string, unknown>[] {
  const defval = options?.defval;
  const result: Record<string, unknown>[] = [];

  // Get headers from row 1
  const headerRow = worksheet.getRow(1);
  const headers: (string | number)[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    headers[colNum - 1] = String(cell.value ?? "");
  });

  // Process data rows (row 2+)
  worksheet.eachRow({ includeEmpty: true }, (row, rowNum) => {
    if (rowNum <= 1) return; // skip header
    const obj: Record<string, unknown> = {};
    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      const header = headers[colNum - 1];
      if (header !== undefined) {
        obj[String(header)] = cell.value ?? (defval ?? "");
      }
    });
    // Fill missing columns with defval
    if (defval !== undefined) {
      for (const h of headers) {
        if (h !== undefined && obj[String(h)] === undefined) {
          obj[String(h)] = defval;
        }
      }
    }
    result.push(obj);
  });

  return result;
}

/**
 * Decode an ExcelJS range string like "A1:C10" into start/end row/col.
 * Replaces: XLSX.utils.decode_range(ref)
 *
 * Returns { s: {r, c}, e: {r, c} } using 0-based indexing (like xlsx).
 */
export function decodeRange(ref: string): {
  s: { r: number; c: number };
  e: { r: number; c: number };
} {
  // Split on ':'
  const parts = ref.split(":");
  if (parts.length !== 2) {
    throw new Error(`Invalid range: ${ref}`);
  }
  const [startStr, endStr] = parts;

  function parseCellRef(cellRef: string): { r: number; c: number } {
    const match = cellRef.match(/^([A-Z]+)(\d+)$/i);
    if (!match) throw new Error(`Invalid cell reference: ${cellRef}`);

    const colStr = match[1]!.toUpperCase();
    const rowNum = parseInt(match[2]!, 10);

    // Convert column letters to 0-based index
    let colIndex = 0;
    for (let i = 0; i < colStr.length; i++) {
      colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
    }
    colIndex -= 1; // Convert to 0-based

    return { r: rowNum - 1, c: colIndex }; // 0-based row and col
  }

  return {
    s: parseCellRef(startStr!),
    e: parseCellRef(endStr!),
  };
}
