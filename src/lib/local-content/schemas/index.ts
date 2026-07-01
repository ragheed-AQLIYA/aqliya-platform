/**
 * LocalContentOS Zod Schema Library
 *
 * Every schema in this directory follows the P0-A2 Validation Standard:
 * - One schema per action pattern
 * - Consistent error handling via `parseOrError`
 * - Domain-as-directory structure
 *
 * ## Usage
 *
 * ```ts
 * import { parseOrError } from "./schemas/common";
 * import { createSupplierSchema } from "./schemas/supplier";
 *
 * const parsed = parseOrError(createSupplierSchema, Object.fromEntries(formData));
 * if (!parsed.success) return parsed;
 * ```
 */

// Common infrastructure (available at both paths for convenience)
export * from "./common";

// Domain schemas
export * from "./project";
export * from "./supplier";
export * from "./evidence";
export * from "./spend";
export * from "./finding";
export * from "./review";
export * from "./report";
export * from "./workbook";
export * from "./ai-review";
export * from "./content-studio";
