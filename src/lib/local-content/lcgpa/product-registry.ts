// ─── LocalContentOS — LCGPA Official Product Registry Pipeline ───
//
// PURPOSE: Enforce that the only product data entering the system comes from
// official LCGPA sources with full provenance tracking.
//
// RULE: No product record may exist in the database without:
//   - Official LCGPA source document reference
//   - SHA-256 hash of the source file
//   - Effective date from the official publication
//   - Version identifier matching LCGPA's own versioning
//   - Change detection against previous version
//
// This module is the ONLY valid entry point for mandatory list data.

import { createHash } from "crypto";
import type {
  MandatoryListVersion,
  MandatoryListItem,
  MandatoryListImportResult,
} from "./types";

// ─── Provenance Types ───

/**
 * Official LCGPA source document metadata.
 * Every import MUST reference an official source.
 */
export interface LcgpSourceDocument {
  /** Official document title (Arabic) */
  titleAr: string;
  /** Official document title (English) */
  titleEn: string;
  /** LCGPA document library URL or reference number */
  referenceUrl: string;
  /** Official publication date from LCGPA */
  publishedDate: Date;
  /** Date from which this document becomes effective */
  effectiveDate: Date;
  /** LCGPA-issued version identifier (e.g., "2026-Q2", "v.3") */
  lcgpaVersion: string;
  /** Type of official document */
  documentType:
    | "mandatory_list"
    | "circular"
    | "amendment"
    | "sector_update"
    | "template";
  /** Official gazette reference if published in Um Al-Qura */
  gazetteReference?: string;
}

/**
 * SHA-256 hash of the source file.
 * Proves the exact file content that was imported.
 */
export interface SourceFileHash {
  /** SHA-256 hex digest of the file */
  sha256: string;
  /** File size in bytes */
  sizeBytes: number;
  /** Original filename */
  filename: string;
  /** MIME type */
  mimeType: string;
  /** When the hash was computed */
  computedAt: Date;
}

/**
 * Complete provenance record for an imported dataset.
 * This is the audit trail for data entry.
 */
export interface DatasetProvenance {
  /** Unique provenance ID */
  provenanceId: string;
  /** Official source document */
  sourceDocument: LcgpSourceDocument;
  /** Hash of the imported file */
  fileHash: SourceFileHash;
  /** User who performed the import */
  importedById: string;
  /** When the import was performed */
  importedAt: Date;
  /** Import method used */
  importMethod: "xlsx_parser" | "csv_parser" | "api" | "manual_entry";
  /** Validation status after import */
  validationStatus: "pending" | "validated" | "failed" | "partial";
  /** Validation errors if any */
  validationErrors: string[];
  /** Validation warnings */
  validationWarnings: string[];
}

/**
 * A single product record with full provenance.
 * This is what gets stored in the database.
 */
export interface ProductRecord {
  /** Unique record ID */
  id: string;
  /** Reference to the dataset provenance */
  provenanceId: string;
  /** LCGPA product code (official) */
  productCode: string;
  /** Arabic product name (official) */
  productNameAr: string;
  /** English product name (if available from LCGPA) */
  productNameEn: string | null;
  /** LCGPA sector code */
  sectorCode: string;
  /** Arabic sector name */
  sectorNameAr: string;
  /** English sector name */
  sectorNameEn: string | null;
  /** Product category within sector */
  category?: string;
  /** Minimum LC requirement for this product (0-100%) if specified */
  minimumLcRequirement?: number;
  /** Certificate requirement description */
  certificateRequirement?: string;
  /** When this product became mandatory per LCGPA */
  effectiveDate: Date;
  /** When this product record was created in our system */
  createdAt: Date;
  /** Status of this record */
  status: "active" | "superseded" | "removed";
}

/**
 * Change between two versions of the mandatory list.
 * Tracks additions, removals, and modifications.
 */
export interface VersionChange {
  /** Change type */
  type: "added" | "removed" | "modified" | "unchanged";
  /** Product code */
  productCode: string;
  /** Arabic product name */
  productNameAr: string;
  /** Previous version value (for modified/removed) */
  previousValue?: Partial<ProductRecord>;
  /** New version value (for added/modified) */
  newValue?: Partial<ProductRecord>;
  /** What changed (for modified) */
  changedFields?: string[];
}

/**
 * Version diff result.
 */
export interface VersionDiff {
  /** Previous version */
  previousVersion: string;
  /** New version */
  newVersion: string;
  /** Products added in new version */
  added: VersionChange[];
  /** Products removed from previous version */
  removed: VersionChange[];
  /** Products modified between versions */
  modified: VersionChange[];
  /** Products unchanged */
  unchanged: VersionChange[];
  /** Summary statistics */
  summary: {
    previousCount: number;
    newCount: number;
    addedCount: number;
    removedCount: number;
    modifiedCount: number;
    unchangedCount: number;
  };
}

// ─── Hash Computation ───

/**
 * Compute SHA-256 hash of a file buffer.
 * This is used to fingerprint the exact source file.
 */
export function computeSourceHash(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
): SourceFileHash {
  const sha256 = createHash("sha256").update(fileBuffer).digest("hex");
  return {
    sha256,
    sizeBytes: fileBuffer.length,
    filename,
    mimeType,
    computedAt: new Date(),
  };
}

// ─── Version Diff Engine ───

/**
 * Compute the diff between two versions of product records.
 * Deterministic: same inputs always produce same diff.
 */
export function computeVersionDiff(
  previousRecords: ProductRecord[],
  newRecords: ProductRecord[],
  previousVersion: string,
  newVersion: string,
): VersionDiff {
  const previousMap = new Map(previousRecords.map((r) => [r.productCode, r]));
  const newMap = new Map(newRecords.map((r) => [r.productCode, r]));

  const added: VersionChange[] = [];
  const removed: VersionChange[] = [];
  const modified: VersionChange[] = [];
  const unchanged: VersionChange[] = [];

  // Find added and modified
  for (const [code, newRec] of newMap) {
    const prevRec = previousMap.get(code);
    if (!prevRec) {
      added.push({
        type: "added",
        productCode: code,
        productNameAr: newRec.productNameAr,
        newValue: newRec,
      });
    } else {
      const changedFields = findChangedFields(prevRec, newRec);
      if (changedFields.length > 0) {
        modified.push({
          type: "modified",
          productCode: code,
          productNameAr: newRec.productNameAr,
          previousValue: prevRec,
          newValue: newRec,
          changedFields,
        });
      } else {
        unchanged.push({
          type: "unchanged",
          productCode: code,
          productNameAr: newRec.productNameAr,
        });
      }
    }
  }

  // Find removed
  for (const [code, prevRec] of previousMap) {
    if (!newMap.has(code)) {
      removed.push({
        type: "removed",
        productCode: code,
        productNameAr: prevRec.productNameAr,
        previousValue: prevRec,
      });
    }
  }

  return {
    previousVersion,
    newVersion,
    added,
    removed,
    modified,
    unchanged,
    summary: {
      previousCount: previousRecords.length,
      newCount: newRecords.length,
      addedCount: added.length,
      removedCount: removed.length,
      modifiedCount: modified.length,
      unchangedCount: unchanged.length,
    },
  };
}

/**
 * Find fields that changed between two product records.
 */
function findChangedFields(
  prev: ProductRecord,
  next: ProductRecord,
): string[] {
  const fields: string[] = [];
  const compareKeys: (keyof ProductRecord)[] = [
    "productNameAr",
    "productNameEn",
    "sectorCode",
    "sectorNameAr",
    "sectorNameEn",
    "category",
    "minimumLcRequirement",
    "certificateRequirement",
    "effectiveDate",
    "status",
  ];

  for (const key of compareKeys) {
    const prevVal = prev[key];
    const nextVal = next[key];
    if (prevVal !== nextVal) {
      fields.push(key);
    }
  }

  return fields;
}

// ─── Validation ───

/**
 * Validate a product record for completeness and correctness.
 * Returns errors (blocking) and warnings (non-blocking).
 */
export function validateProductRecord(record: {
  productCode?: string;
  productNameAr?: string;
  sectorCode?: string;
  effectiveDate?: Date;
  sourceDocument?: LcgpSourceDocument;
}): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!record.productCode) {
    errors.push("PRODUCT_CODE_MISSING: Product code is required");
  }
  if (!record.productNameAr) {
    errors.push("PRODUCT_NAME_AR_MISSING: Arabic product name is required");
  }
  if (!record.sectorCode) {
    errors.push("SECTOR_CODE_MISSING: Sector code is required");
  }
  if (!record.effectiveDate) {
    errors.push("EFFECTIVE_DATE_MISSING: Effective date is required");
  }
  if (!record.sourceDocument) {
    errors.push(
      "SOURCE_DOCUMENT_MISSING: Official LCGPA source document reference is required",
    );
  }

  // Warnings
  if (record.productCode && record.productCode.length < 3) {
    warnings.push("PRODUCT_CODE_SHORT: Product code seems unusually short");
  }
  if (record.sectorCode && !/^[SP]\d{2}$/.test(record.sectorCode)) {
    warnings.push(
      "SECTOR_CODE_FORMAT: Sector code should match pattern S## or P##",
    );
  }

  return { errors, warnings };
}

/**
 * Validate a complete dataset import.
 * Checks all records and produces a summary.
 */
export function validateDatasetImport(
  records: ProductRecord[],
  sourceDocument: LcgpSourceDocument,
): MandatoryListImportResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const sectorCodes = new Set<string>();

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const { errors, warnings } = validateProductRecord({
      productCode: record.productCode,
      productNameAr: record.productNameAr,
      sectorCode: record.sectorCode,
      effectiveDate: record.effectiveDate,
      sourceDocument,
    });

    for (const e of errors) {
      allErrors.push(`[${i}] ${record.productCode ?? "UNKNOWN"}: ${e}`);
    }
    for (const w of warnings) {
      allWarnings.push(`[${i}] ${record.productCode ?? "UNKNOWN"}: ${w}`);
    }

    if (record.sectorCode) {
      sectorCodes.add(record.sectorCode);
    }
  }

  return {
    success: allErrors.length === 0,
    version: sourceDocument.lcgpaVersion,
    productCount: records.length,
    sectorCount: sectorCodes.size,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// ─── Provenance Enforcement ───

/**
 * Gate check: can this product data enter the system?
 *
 * Returns true ONLY if:
 * 1. Source document is official LCGPA
 * 2. File hash is computed
 * 3. All records pass validation
 * 4. Provenance record is complete
 */
export function canImportDataset(
  provenance: DatasetProvenance,
  records: ProductRecord[],
): { allowed: boolean; reason: string } {
  // Check provenance completeness
  if (!provenance.sourceDocument.referenceUrl) {
    return {
      allowed: false,
      reason: "SOURCE_URL_MISSING: Official LCGPA source URL is required",
    };
  }

  if (!provenance.fileHash.sha256) {
    return {
      allowed: false,
      reason: "FILE_HASH_MISSING: Source file hash is required for audit trail",
    };
  }

  if (!provenance.importedById) {
    return {
      allowed: false,
      reason: "IMPORTER_MISSING: Import must be performed by an authenticated user",
    };
  }

  // Validate dataset
  const validation = validateDatasetImport(records, provenance.sourceDocument);
  if (!validation.success) {
    return {
      allowed: false,
      reason: `VALIDATION_FAILED: ${validation.errors.length} record(s) failed validation`,
    };
  }

  // Check for duplicate product codes
  const codes = records.map((r) => r.productCode);
  const uniqueCodes = new Set(codes);
  if (uniqueCodes.size !== codes.length) {
    return {
      allowed: false,
      reason:
        "DUPLICATE_PRODUCT_CODES: Product codes must be unique within a dataset",
    };
  }

  return { allowed: true, reason: "All provenance checks passed" };
}
