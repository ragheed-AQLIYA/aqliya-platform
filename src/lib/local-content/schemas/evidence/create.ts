import { z } from "zod";
import { requiredText, optionalText, evidenceStatus, optionalEvidenceType } from "../common";

/**
 * Schema for `createLocalContentEvidenceAction`.
 *
 * Accepts FormData. filename is required; other fields are optional.
 */
export const createEvidenceSchema = z.object({
  filename: requiredText,
  supplierId: optionalText,
  spendRecordId: optionalText,
  fileType: optionalText.default("pdf"),
  mimeType: optionalText,
  evidenceType: optionalEvidenceType.default("other"),
});

/**
 * Schema for `updateLocalContentEvidenceStatusAction`.
 *
 * Accepts a status string that must be a valid EvidenceStatus.
 */
export const updateEvidenceStatusSchema = z.object({
  status: evidenceStatus,
});

/**
 * Allowed MIME types for evidence file uploads (SC-02).
 */
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/vnd.ms-excel", // xls
  "image/jpeg",
  "image/png",
  "image/tiff",
  "text/csv",
  "text/plain",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/**
 * Maximum file size for evidence uploads: 25 MB.
 */
export const MAX_EVIDENCE_FILE_SIZE = 25 * 1024 * 1024;

/**
 * Schema for `uploadLocalContentEvidenceFileAction`.
 *
 * Validates filename (optional) and file metadata.
 * File size and MIME type enforcement is done at runtime
 * since FormData File objects are accessed after Zod parsing.
 */
export const uploadEvidenceFileSchema = z.object({
  filename: optionalText,
});

/**
 * Validate a File object against SC-02 upload security rules.
 * Returns an error message string if validation fails, or null if valid.
 */
export function validateEvidenceFile(file: File): string | null {
  if (!file || file.size === 0) {
    return "File is required";
  }

  if (file.size > MAX_EVIDENCE_FILE_SIZE) {
    const mb = MAX_EVIDENCE_FILE_SIZE / 1024 / 1024;
    return `File exceeds maximum size of ${mb} MB`;
  }

  const allowed = ALLOWED_MIME_TYPES as readonly string[];
  if (!allowed.includes(file.type)) {
    return `File type "${file.type}" is not allowed. Accepted types: PDF, DOCX, XLSX, CSV, JPEG, PNG, TIFF, TXT`;
  }

  return null;
}

/**
 * Compute a SHA-256 hex digest of a File's ArrayBuffer.
 * Used for evidence integrity verification (SC-02).
 */
export async function computeFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
