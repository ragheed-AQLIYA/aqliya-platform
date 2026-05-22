import type {
  LocalContentProjectStatus,
  SupplierLocality,
  OwnershipType,
  EvidenceType,
  EvidenceStatus,
  FindingType,
  FindingSeverity,
  ClassificationBasis,
  ConfidenceLevel,
} from "./types";
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
} from "./types";

export function validateProjectStatus(
  value: string,
): LocalContentProjectStatus {
  validateIn(
    value,
    VALID_PROJECT_STATUSES as unknown as readonly string[],
    "status",
  );
  return value as LocalContentProjectStatus;
}

export function validateSupplierLocality(value: string): SupplierLocality {
  validateIn(
    value,
    VALID_SUPPLIER_LOCALITIES as unknown as readonly string[],
    "localityClassification",
  );
  return value as SupplierLocality;
}

export function validateOwnershipType(value: string): OwnershipType {
  validateIn(
    value,
    VALID_OWNERSHIP_TYPES as unknown as readonly string[],
    "ownershipType",
  );
  return value as OwnershipType;
}

export function validateEvidenceType(value: string): EvidenceType {
  validateIn(
    value,
    VALID_EVIDENCE_TYPES as unknown as readonly string[],
    "evidenceType",
  );
  return value as EvidenceType;
}

export function validateEvidenceStatus(value: string): EvidenceStatus {
  validateIn(
    value,
    VALID_EVIDENCE_STATUSES as unknown as readonly string[],
    "evidenceStatus",
  );
  return value as EvidenceStatus;
}

export function validateFindingType(value: string): FindingType {
  validateIn(
    value,
    VALID_FINDING_TYPES as unknown as readonly string[],
    "findingType",
  );
  return value as FindingType;
}

export function validateFindingSeverity(value: string): FindingSeverity {
  validateIn(
    value,
    VALID_FINDING_SEVERITIES as unknown as readonly string[],
    "severity",
  );
  return value as FindingSeverity;
}

export function validateClassificationBasis(
  value: string,
): ClassificationBasis {
  validateIn(
    value,
    VALID_CLASSIFICATION_BASES as unknown as readonly string[],
    "classificationBasis",
  );
  return value as ClassificationBasis;
}

export function validateConfidenceLevel(value: string): ConfidenceLevel {
  validateIn(
    value,
    VALID_CONFIDENCE_LEVELS as unknown as readonly string[],
    "confidence",
  );
  return value as ConfidenceLevel;
}

export function validateRequired(
  value: unknown,
  name: string,
): asserts value is string {
  if (!value || (typeof value === "string" && value.trim().length === 0)) {
    throw new Error(`LocalContentOS validation: ${name} is required`);
  }
}

export function validatePositiveNumber(
  value: number | undefined | null,
  name: string,
): void {
  if (value === undefined || value === null || value < 0) {
    throw new Error(
      `LocalContentOS validation: ${name} must be a non-negative number`,
    );
  }
}

export function validatePercentage(
  value: number | undefined | null,
  name: string,
): void {
  if (value !== undefined && value !== null && (value < 0 || value > 100)) {
    throw new Error(
      `LocalContentOS validation: ${name} must be between 0 and 100`,
    );
  }
}

function validateIn(
  value: string,
  valid: readonly string[],
  name: string,
): void {
  if (!valid.includes(value)) {
    throw new Error(
      `LocalContentOS validation: ${name} must be one of: ${valid.join(", ")}`,
    );
  }
}
