import { z } from "zod";
import {
  VALID_PROJECT_STATUSES,
  VALID_SUPPLIER_LOCALITIES,
  VALID_OWNERSHIP_TYPES,
  VALID_EVIDENCE_TYPES,
  VALID_EVIDENCE_STATUSES,
  VALID_FINDING_TYPES,
  VALID_FINDING_SEVERITIES,
  VALID_CLASSIFICATION_BASES,
  VALID_CONFIDENCE_LEVELS,
} from "@/lib/local-content/types";

// ═══════════════════════════════════════════════════════════
// Identifiers
// ═══════════════════════════════════════════════════════════

export const entityId = z.string().trim().min(1, "Required");
export const optionalEntityId = entityId.optional();
export const entityIdArray = z.array(entityId).min(1, "At least one ID required");

// ═══════════════════════════════════════════════════════════
// Text Fields
// ═══════════════════════════════════════════════════════════

export const requiredText = z.string().trim().min(1, "Required");
export const optionalText = z.string().trim().optional();
export const shortText = requiredText.max(255, "Too long (max 255)");
export const longText = requiredText.max(10000, "Too long (max 10,000)");
export const optionalLongText = z.string().trim().max(10000).optional();

// ═══════════════════════════════════════════════════════════
// Numbers
// ═══════════════════════════════════════════════════════════

export const percentage = z.coerce.number().min(0, "Min 0").max(100, "Max 100");
export const optionalPercentage = percentage.optional();
export const nonNegativeNumber = z.coerce.number().min(0, "Must be ≥ 0");
export const optionalNonNegativeNumber = nonNegativeNumber.optional();
export const positiveNumber = z.coerce.number().min(0.01, "Must be > 0");
export const currencyAmount = z.coerce.number().min(0).multipleOf(0.01);
export const optionalCurrencyAmount = currencyAmount.optional();

// ═══════════════════════════════════════════════════════════
// Enums (from domain type constants)
// ═══════════════════════════════════════════════════════════

export const projectStatus = z.enum(VALID_PROJECT_STATUSES);
export const optionalProjectStatus = projectStatus.optional();

export const supplierLocality = z.enum(VALID_SUPPLIER_LOCALITIES);
export const optionalSupplierLocality = supplierLocality.optional();

export const ownershipType = z.enum(VALID_OWNERSHIP_TYPES);
export const optionalOwnershipType = ownershipType.optional();

export const evidenceType = z.enum(VALID_EVIDENCE_TYPES);
export const optionalEvidenceType = evidenceType.optional();

export const evidenceStatus = z.enum(VALID_EVIDENCE_STATUSES);
export const optionalEvidenceStatus = evidenceStatus.optional();

export const findingType = z.enum(VALID_FINDING_TYPES);
export const optionalFindingType = findingType.optional();

export const findingSeverity = z.enum(VALID_FINDING_SEVERITIES);
export const optionalFindingSeverity = findingSeverity.optional();

export const classificationBasis = z.enum(VALID_CLASSIFICATION_BASES);
export const optionalClassificationBasis = classificationBasis.optional();

export const confidenceLevel = z.enum(VALID_CONFIDENCE_LEVELS);
export const optionalConfidenceLevel = confidenceLevel.optional();

// ═══════════════════════════════════════════════════════════
// Special Formats
// ═══════════════════════════════════════════════════════════

export const yearField = z.coerce.number().int().min(2020).max(2100);
export const csvText = z.string().min(1, "CSV content required").max(5_000_000, "CSV too large (max 5MB)");
export const booleanFlag = z.boolean();
export const optionalBooleanFlag = booleanFlag.optional();
