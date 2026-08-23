// ─── AQLIYA XLSX Writer ───
// Replaces XLSX.write and XLSX.writeFile with async ExcelJS equivalents.

import type { Workbook, WriteOptions } from "./types";

/**
 * Write a workbook to a Buffer.
 * Replaces: XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
 *
 * @param workbook - ExcelJS Workbook
 * @param options - Write options
 * @returns Buffer containing XLSX data
 */
export async function writeBuffer(
  workbook: Workbook,
  options?: WriteOptions,
): Promise<Buffer> {
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Write a workbook to a file on disk.
 * Replaces: XLSX.writeFile(wb, path)
 *
 * @param workbook - ExcelJS Workbook
 * @param filePath - Destination path
 */
export async function writeFile(
  workbook: Workbook,
  filePath: string,
): Promise<void> {
  await workbook.xlsx.writeFile(filePath);
}
