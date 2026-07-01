import { z } from "zod";

/**
 * SC-02/DI-03: Zod schemas for JSON/JSONB fields in LCOS Prisma models.
 *
 * These schemas validate the structure of JSON fields before they are written
 * to the database, preventing invalid data from being silently accepted.
 */

/**
 * Evidence reference item within a JSON array.
 * Used by LCOS models that store evidence references as JSON.
 */
export const evidenceRefItemSchema = z.object({
  id: z.string().min(1),
  filename: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  uploadedAt: z.string().datetime().optional(),
  uploadedBy: z.string().optional(),
});

/**
 * Validates an evidenceRefs JSON field — an array of evidence references.
 */
export const evidenceRefsArraySchema = z
  .array(evidenceRefItemSchema)
  .min(0)
  .max(500, "Too many evidence references (max 500)");

/**
 * Generic metadata JSON field schema.
 * Accepts any valid JSON object with optional string values.
 * Can be extended per-model as needed.
 */
export const metadataSchema = z
  .record(z.string(), z.unknown())
  .nullable()
  .optional();

/**
 * ERP field mapping item.
 * Maps an external field to an internal field.
 */
export const fieldMappingItemSchema = z.object({
  externalField: z.string().min(1),
  internalField: z.string().min(1),
  transform: z.string().optional(),
  required: z.boolean().optional().default(false),
});

/**
 * Validates a fieldMappings JSON field — an array of field mappings.
 */
export const fieldMappingsArraySchema = z
  .array(fieldMappingItemSchema)
  .min(0)
  .max(200, "Too many field mappings (max 200)");

/**
 * Validate and sanitize an evidenceRefs JSON field.
 * Returns the validated value or throws a ZodError.
 */
export function validateEvidenceRefs(input: unknown): unknown {
  return evidenceRefsArraySchema.parse(input);
}

/**
 * Validate and sanitize a fieldMappings JSON field.
 */
export function validateFieldMappings(input: unknown): unknown {
  return fieldMappingsArraySchema.parse(input);
}
