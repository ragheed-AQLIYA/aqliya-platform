// ─── Core ExportService ───
// Thin shared utilities for export output construction.
// No auth, no business logic, no audit — just format + content + response helpers.

import { buildDownloadResponse } from "./download";

// ─── Export format types ───

export type ExportFormat = "pdf" | "xlsx" | "json" | "csv";

export const VALID_EXPORT_FORMATS: ExportFormat[] = [
  "pdf",
  "xlsx",
  "json",
  "csv",
];

// ─── MIME type map ───

export const MIME_TYPES: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  json: "application/json",
  csv: "text/csv",
};

/**
 * Returns the MIME type for a given export format.
 */
export function mimeTypeForFormat(format: ExportFormat): string {
  return MIME_TYPES[format];
}

/**
 * Validates that a string is a supported export format.
 * Throws with a helpful message on invalid input.
 */
export function assertExportFormat(format: string): ExportFormat {
  if (!VALID_EXPORT_FORMATS.includes(format as ExportFormat)) {
    throw new Error(
      `Unsupported export format: ${format}. Use one of: ${VALID_EXPORT_FORMATS.join(", ")}`,
    );
  }
  return format as ExportFormat;
}

// ─── Export result type ───

export interface ExportOutput {
  format: ExportFormat;
  filename: string;
  content: Buffer | string;
  sizeBytes?: number;
}

/**
 * Build a download response for an export output.
 * Delegates to buildDownloadResponse with the export's MIME type.
 */
export function buildExportResponse(output: ExportOutput) {
  return buildDownloadResponse({
    content: output.content,
    filename: output.filename,
    mimeType: mimeTypeForFormat(output.format),
    sizeBytes: output.sizeBytes,
  });
}

export { buildExportMetadata, type ExportMetadata } from "./production-export";
