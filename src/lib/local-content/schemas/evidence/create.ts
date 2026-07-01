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
 * Schema for `uploadLocalContentEvidenceFileAction`.
 *
 * Accepts FormData with an optional file and filename.
 * File validation (size, MIME type) is handled downstream by the upload service.
 * This schema validates the metadata fields only.
 *
 * NOTE: File objects in FormData are validated at runtime by `instanceof File`
 * checks inside the action. The Zod schema handles non-file form fields.
 */
export const uploadEvidenceFileSchema = z.object({
  filename: optionalText,
});
