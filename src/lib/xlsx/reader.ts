// ─── AQLIYA XLSX Reader ───
// Replaces XLSX.read and XLSX.readFile with async ExcelJS equivalents.
// All functions are async because ExcelJS I/O is async.

import ExcelJS from "exceljs";
import type { Workbook, ReadOptions } from "./types";

/**
 * Read an XLSX buffer into a workbook.
 * Replaces: XLSX.read(buffer, { type: "buffer" })
 *
 * @param buffer - Raw XLSX file bytes (already validated by validateXlsxArchive)
 * @param options - Parse options
 * @returns ExcelJS Workbook
 */
export async function readBuffer(
  buffer: Buffer | ArrayBuffer,
  options?: ReadOptions,
): Promise<Workbook> {
  const workbook = new ExcelJS.Workbook();
  // ExcelJS expects a Buffer or ArrayBuffer; normalize input
  let arrayBuf: ArrayBuffer;
  if (buffer instanceof ArrayBuffer) {
    arrayBuf = buffer;
  } else {
    // Node.js Buffer — extract the underlying ArrayBuffer
    arrayBuf = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  }
  await workbook.xlsx.load(arrayBuf);
  return workbook;
}

/**
 * Read an XLSX file from disk into a workbook.
 * Replaces: XLSX.readFile(path)
 *
 * @param filePath - Absolute or relative path to .xlsx file
 * @param options - Parse options (currently unused, kept for API parity)
 * @returns ExcelJS Workbook
 */
export async function readFile(
  filePath: string,
  options?: ReadOptions,
): Promise<Workbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  return workbook;
}
