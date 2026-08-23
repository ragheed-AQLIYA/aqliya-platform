// ─── AQLIYA XLSX Abstraction Types ───
// Thin type layer over ExcelJS. Business code imports these, not ExcelJS directly.

import type ExcelJS from "exceljs";

/** Re-export the workbook type for convenience. */
export type Workbook = ExcelJS.Workbook;

/** Re-export the worksheet type for convenience. */
export type Worksheet = ExcelJS.Worksheet;

/** Options for reading an XLSX buffer. */
export interface ReadOptions {
  /** Parse cell formulas (default: false). */
  cellFormula?: boolean;
  /** Parse cell dates (default: false). */
  cellDates?: boolean;
}

/** Options for writing an XLSX buffer. */
export interface WriteOptions {
  /** Book type (default: 'xlsx'). */
  bookType?: "xlsx";
}
