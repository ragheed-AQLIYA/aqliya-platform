// ─── LCGPA Product Registry Pipeline Tests ───

import {
  computeSourceHash,
  computeVersionDiff,
  validateProductRecord,
  validateDatasetImport,
  canImportDataset,
} from "../product-registry";
import type {
  ProductRecord,
  LcgpSourceDocument,
  DatasetProvenance,
} from "../product-registry";

// ─── Test Fixtures ───

const OFFICIAL_SOURCE: LcgpSourceDocument = {
  titleAr: "القائمة الإلزامية للمنتجات الوطنية",
  titleEn: "Mandatory List of National Products",
  referenceUrl: "https://www.lcgpa.gov.sa/documents/mandatory-list-2026-Q2",
  publishedDate: new Date("2026-04-15"),
  effectiveDate: new Date("2026-08-01"),
  lcgpaVersion: "2026-Q2",
  documentType: "mandatory_list",
};

function makeRecord(overrides: Partial<ProductRecord> = {}): ProductRecord {
  return {
    id: `rec-${Math.random().toString(36).slice(2, 8)}`,
    provenanceId: "prov-001",
    productCode: "ML-001",
    productNameAr: "أدوية أساسية",
    productNameEn: "Essential Medicines",
    sectorCode: "P01",
    sectorNameAr: "المنتجات الصناعية",
    sectorNameEn: "Industrial Products",
    effectiveDate: new Date("2026-08-01"),
    createdAt: new Date(),
    status: "active",
    ...overrides,
  };
}

function makeProvenance(
  overrides: Partial<DatasetProvenance> = {},
): DatasetProvenance {
  return {
    provenanceId: "prov-001",
    sourceDocument: OFFICIAL_SOURCE,
    fileHash: {
      sha256: "abc123def456",
      sizeBytes: 102400,
      filename: "mandatory-list-2026-Q2.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      computedAt: new Date(),
    },
    importedById: "user-001",
    importedAt: new Date(),
    importMethod: "xlsx_parser",
    validationStatus: "pending",
    validationErrors: [],
    validationWarnings: [],
    ...overrides,
  };
}

// ─── Tests ───

describe("LCGPA Product Registry Pipeline", () => {
  // ─── 1. Source Hash ───

  describe("computeSourceHash", () => {
    it("computes SHA-256 hash of file buffer", () => {
      const buffer = Buffer.from("test file content");
      const hash = computeSourceHash(buffer, "test.xlsx", "application/octet-stream");

      expect(hash.sha256).toHaveLength(64); // SHA-256 hex = 64 chars
      expect(hash.sizeBytes).toBe(17); // "test file content" = 17 bytes
      expect(hash.filename).toBe("test.xlsx");
      expect(hash.mimeType).toBe("application/octet-stream");
      expect(hash.computedAt).toBeInstanceOf(Date);
    });

    it("produces deterministic hash for same content", () => {
      const buffer = Buffer.from("deterministic content");
      const h1 = computeSourceHash(buffer, "f.xlsx", "application/octet-stream");
      const h2 = computeSourceHash(buffer, "f.xlsx", "application/octet-stream");

      expect(h1.sha256).toBe(h2.sha256);
      expect(h1.sizeBytes).toBe(h2.sizeBytes);
    });

    it("produces different hash for different content", () => {
      const h1 = computeSourceHash(Buffer.from("content A"), "f.xlsx", "application/octet-stream");
      const h2 = computeSourceHash(Buffer.from("content B"), "f.xlsx", "application/octet-stream");

      expect(h1.sha256).not.toBe(h2.sha256);
    });
  });

  // ─── 2. Product Record Validation ───

  describe("validateProductRecord", () => {
    it("passes for complete valid record", () => {
      const { errors, warnings } = validateProductRecord({
        productCode: "ML-001",
        productNameAr: "أدوية أساسية",
        sectorCode: "P01",
        effectiveDate: new Date("2026-08-01"),
        sourceDocument: OFFICIAL_SOURCE,
      });

      expect(errors).toHaveLength(0);
      expect(warnings).toHaveLength(0);
    });

    it("blocks when product code missing", () => {
      const { errors } = validateProductRecord({
        productNameAr: "أدوية",
        sectorCode: "P01",
        effectiveDate: new Date(),
        sourceDocument: OFFICIAL_SOURCE,
      });

      expect(errors.some((e) => e.includes("PRODUCT_CODE_MISSING"))).toBe(true);
    });

    it("blocks when Arabic name missing", () => {
      const { errors } = validateProductRecord({
        productCode: "ML-001",
        sectorCode: "P01",
        effectiveDate: new Date(),
        sourceDocument: OFFICIAL_SOURCE,
      });

      expect(errors.some((e) => e.includes("PRODUCT_NAME_AR_MISSING"))).toBe(true);
    });

    it("blocks when source document missing", () => {
      const { errors } = validateProductRecord({
        productCode: "ML-001",
        productNameAr: "أدوية",
        sectorCode: "P01",
        effectiveDate: new Date(),
      });

      expect(errors.some((e) => e.includes("SOURCE_DOCUMENT_MISSING"))).toBe(true);
    });

    it("warns for short product code", () => {
      const { warnings } = validateProductRecord({
        productCode: "AB",
        productNameAr: "أدوية",
        sectorCode: "P01",
        effectiveDate: new Date(),
        sourceDocument: OFFICIAL_SOURCE,
      });

      expect(warnings.some((w) => w.includes("PRODUCT_CODE_SHORT"))).toBe(true);
    });

    it("warns for non-standard sector code format", () => {
      const { warnings } = validateProductRecord({
        productCode: "ML-001",
        productNameAr: "أدوية",
        sectorCode: "XYZ",
        effectiveDate: new Date(),
        sourceDocument: OFFICIAL_SOURCE,
      });

      expect(warnings.some((w) => w.includes("SECTOR_CODE_FORMAT"))).toBe(true);
    });
  });

  // ─── 3. Dataset Import Validation ───

  describe("validateDatasetImport", () => {
    it("passes for valid dataset", () => {
      const records = [
        makeRecord({ productCode: "ML-001" }),
        makeRecord({ productCode: "ML-002", productNameAr: "معدات طبية" }),
      ];

      const result = validateDatasetImport(records, OFFICIAL_SOURCE);

      expect(result.success).toBe(true);
      expect(result.productCount).toBe(2);
      expect(result.sectorCount).toBe(1); // Both P01
      expect(result.version).toBe("2026-Q2");
    });

    it("fails when records have validation errors", () => {
      const records = [
        makeRecord({ productCode: "ML-001" }),
        makeRecord({ productCode: "", productNameAr: "" }), // Missing required fields
      ];

      const result = validateDatasetImport(records, OFFICIAL_SOURCE);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("counts distinct sectors", () => {
      const records = [
        makeRecord({ productCode: "ML-001", sectorCode: "P01" }),
        makeRecord({ productCode: "ML-002", sectorCode: "P02" }),
        makeRecord({ productCode: "ML-003", sectorCode: "P01" }),
      ];

      const result = validateDatasetImport(records, OFFICIAL_SOURCE);

      expect(result.sectorCount).toBe(2);
    });
  });

  // ─── 4. Version Diff Engine ───

  describe("computeVersionDiff", () => {
    it("detects added products", () => {
      const prev = [makeRecord({ productCode: "ML-001" })];
      const next = [
        makeRecord({ productCode: "ML-001" }),
        makeRecord({ productCode: "ML-002", productNameAr: "منتج جديد" }),
      ];

      const diff = computeVersionDiff(prev, next, "2026-Q1", "2026-Q2");

      expect(diff.added).toHaveLength(1);
      expect(diff.added[0].productCode).toBe("ML-002");
      expect(diff.summary.addedCount).toBe(1);
      expect(diff.summary.previousCount).toBe(1);
      expect(diff.summary.newCount).toBe(2);
    });

    it("detects removed products", () => {
      const prev = [
        makeRecord({ productCode: "ML-001" }),
        makeRecord({ productCode: "ML-002" }),
      ];
      const next = [makeRecord({ productCode: "ML-001" })];

      const diff = computeVersionDiff(prev, next, "2026-Q1", "2026-Q2");

      expect(diff.removed).toHaveLength(1);
      expect(diff.removed[0].productCode).toBe("ML-002");
      expect(diff.summary.removedCount).toBe(1);
    });

    it("detects modified products", () => {
      const prev = [makeRecord({ productCode: "ML-001", productNameAr: "اسم قديم" })];
      const next = [makeRecord({ productCode: "ML-001", productNameAr: "اسم جديد" })];

      const diff = computeVersionDiff(prev, next, "2026-Q1", "2026-Q2");

      expect(diff.modified).toHaveLength(1);
      expect(diff.modified[0].changedFields).toContain("productNameAr");
      expect(diff.summary.modifiedCount).toBe(1);
    });

    it("identifies unchanged products", () => {
      const fixedDate = new Date("2026-08-01");
      const prev = [makeRecord({ productCode: "ML-001", effectiveDate: fixedDate })];
      const next = [makeRecord({ productCode: "ML-001", effectiveDate: fixedDate })];

      const diff = computeVersionDiff(prev, next, "2026-Q1", "2026-Q2");

      expect(diff.unchanged).toHaveLength(1);
      expect(diff.summary.unchangedCount).toBe(1);
    });

    it("handles empty previous version (first import)", () => {
      const next = [
        makeRecord({ productCode: "ML-001" }),
        makeRecord({ productCode: "ML-002" }),
      ];

      const diff = computeVersionDiff([], next, "none", "2026-Q1");

      expect(diff.added).toHaveLength(2);
      expect(diff.removed).toHaveLength(0);
      expect(diff.summary.previousCount).toBe(0);
      expect(diff.summary.newCount).toBe(2);
    });

    it("handles empty new version (all removed)", () => {
      const prev = [makeRecord({ productCode: "ML-001" })];

      const diff = computeVersionDiff(prev, [], "2026-Q1", "none");

      expect(diff.removed).toHaveLength(1);
      expect(diff.added).toHaveLength(0);
      expect(diff.summary.newCount).toBe(0);
    });
  });

  // ─── 5. Gate Check ───

  describe("canImportDataset", () => {
    it("allows valid import with complete provenance", () => {
      const provenance = makeProvenance();
      const records = [makeRecord()];

      const result = canImportDataset(provenance, records);

      expect(result.allowed).toBe(true);
      expect(result.reason).toContain("passed");
    });

    it("blocks when source URL missing", () => {
      const provenance = makeProvenance({
        sourceDocument: { ...OFFICIAL_SOURCE, referenceUrl: "" },
      });

      const result = canImportDataset(provenance, [makeRecord()]);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("SOURCE_URL_MISSING");
    });

    it("blocks when file hash missing", () => {
      const provenance = makeProvenance({
        fileHash: {
          sha256: "",
          sizeBytes: 0,
          filename: "",
          mimeType: "",
          computedAt: new Date(),
        },
      });

      const result = canImportDataset(provenance, [makeRecord()]);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("FILE_HASH_MISSING");
    });

    it("blocks when importer not identified", () => {
      const provenance = makeProvenance({ importedById: "" });

      const result = canImportDataset(provenance, [makeRecord()]);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("IMPORTER_MISSING");
    });

    it("blocks when records fail validation", () => {
      const provenance = makeProvenance();
      const records = [makeRecord({ productCode: "", productNameAr: "" })];

      const result = canImportDataset(provenance, records);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("VALIDATION_FAILED");
    });

    it("blocks duplicate product codes", () => {
      const provenance = makeProvenance();
      const records = [
        makeRecord({ productCode: "ML-001" }),
        makeRecord({ productCode: "ML-001" }), // duplicate
      ];

      const result = canImportDataset(provenance, records);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("DUPLICATE_PRODUCT_CODES");
    });
  });

  // ─── 6. Determinism ───

  describe("Determinism", () => {
    it("same inputs produce identical version diff", () => {
      const prev = [
        makeRecord({ productCode: "ML-001", productNameAr: "أدوية" }),
        makeRecord({ productCode: "ML-002", productNameAr: "معدات" }),
      ];
      const next = [
        makeRecord({ productCode: "ML-001", productNameAr: "أدوية محدثة" }),
        makeRecord({ productCode: "ML-003", productNameAr: "مستلزمات" }),
      ];

      const d1 = computeVersionDiff(prev, next, "v1", "v2");
      const d2 = computeVersionDiff(prev, next, "v1", "v2");

      expect(d1.summary.addedCount).toBe(d2.summary.addedCount);
      expect(d1.summary.removedCount).toBe(d2.summary.removedCount);
      expect(d1.summary.modifiedCount).toBe(d2.summary.modifiedCount);
      expect(d1.added.map((c) => c.productCode).sort()).toEqual(
        d2.added.map((c) => c.productCode).sort(),
      );
    });

    it("same file content produces identical hash", () => {
      const buf = Buffer.from("same content always");
      const h1 = computeSourceHash(buf, "f.xlsx", "application/octet-stream");
      const h2 = computeSourceHash(buf, "f.xlsx", "application/octet-stream");

      expect(h1.sha256).toBe(h2.sha256);
    });
  });
});
