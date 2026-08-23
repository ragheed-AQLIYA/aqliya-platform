// ─── AQLIYA XLSX Abstraction ───
// Thin wrapper over ExcelJS. Business code imports from here, not from ExcelJS directly.
//
// Architecture:
//   Business code → @/lib/xlsx → ExcelJS
//
// NOT:
//   Business code → ExcelJS everywhere
//
// Security invariant:
//   UNTRUSTED XLSX → validateXlsxArchive(buffer) → readBuffer/readFile → workbook
//
// The archive validator (from @/lib/security/xlsx-validation) is parser-agnostic
// and MUST run before any read function in this module.

import ExcelJS from "exceljs";

// Re-export workbook/worksheet types
export type { Workbook, Worksheet } from "./types";
export type { ReadOptions, WriteOptions } from "./types";

// Re-export read functions
export { readBuffer, readFile } from "./reader";

// Re-export write functions
export { writeBuffer, writeFile } from "./writer";

// Re-export helper functions
export {
  aoaToSheet,
  jsonToSheet,
  sheetToJsonArrays,
  sheetToJsonObjects,
  decodeRange,
} from "./helpers";

// Re-export ExcelJS constructor for workbook creation
// (business code uses new Workbook() instead of XLSX.utils.book_new())
export { ExcelJS };

/**
 * Create a new empty workbook.
 * Replaces: XLSX.utils.book_new()
 */
export function createWorkbook(): ExcelJS.Workbook {
  return new ExcelJS.Workbook();
}
