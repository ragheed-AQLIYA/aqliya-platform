import {
  buildAssessmentSummaryPDF,
  buildSpendClassificationXLSX,
  buildEvidenceIndexXLSX,
} from "@/lib/local-content/export";
import type { LocalContentExportInput } from "@/lib/local-content/export";

function makeSampleInput(): LocalContentExportInput {
  return {
    projectName: "Test Project",
    reportingPeriod: "FY2025",
    generatedBy: "Test User",
    generatedAt: "2025-06-01T12:00:00Z",
    reviewStatus: "Pending",
    approvalStatus: "Pending",
    score: {
      totalSpend: 10000000,
      localSpend: 6500000,
      nonLocalSpend: 3000000,
      mixedSpend: 500000,
      unclassifiedSpend: 0,
      localContentPercentage: 65,
      supplierCounts: {
        total: 50,
        local: 20,
        nonLocal: 15,
        mixed: 10,
        unclassified: 5,
      },
      evidenceStats: {
        total: 100,
        verified: 60,
        reviewed: 20,
        uploaded: 10,
        linked: 5,
        rejected: 3,
        missing: 2,
        coveragePercentage: 85,
      },
      findingStats: {
        total: 8,
        bySeverity: { low: 3, medium: 3, high: 2, critical: 0 },
        byStatus: { open: 5, resolved: 3 },
      },
      classificationStats: {
        total: 50,
        confirmed: 35,
        draft: 10,
        disputed: 5,
        byBasis: {
          certificate: 20,
          self_declaration: 15,
          contract_term: 10,
          analyst_estimate: 5,
        },
      },
    },
    disclaimer: "Test disclaimer",
  };
}

describe("LocalContentOS Export Generators", () => {
  describe("buildAssessmentSummaryPDF", () => {
    it("generates a valid PDF buffer", async () => {
      const result = await buildAssessmentSummaryPDF(makeSampleInput());
      expect(result.format).toBe("pdf");
      expect(result.filename).toMatch(/\.pdf$/);
      expect(result.mimeType).toBe("application/pdf");
      expect(Buffer.isBuffer(result.content)).toBe(true);
      expect((result.content as Buffer).length).toBeGreaterThan(0);
      expect((result.content as Buffer).subarray(0, 5).toString()).toBe(
        "%PDF-",
      );
    });
  });

  describe("buildSpendClassificationXLSX", () => {
    it("generates a valid XLSX buffer", async () => {
      const result = await buildSpendClassificationXLSX(makeSampleInput());
      expect(result.format).toBe("xlsx");
      expect(result.filename).toMatch(/\.xlsx$/);
      expect(result.mimeType).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      expect(Buffer.isBuffer(result.content)).toBe(true);
      expect((result.content as Buffer).length).toBeGreaterThan(0);
      expect((result.content as Buffer).subarray(0, 2).toString()).toBe("PK");
    });
  });

  describe("buildEvidenceIndexXLSX", () => {
    it("generates a valid XLSX buffer", async () => {
      const result = await buildEvidenceIndexXLSX(makeSampleInput());
      expect(result.format).toBe("xlsx");
      expect(result.filename).toMatch(/\.xlsx$/);
      expect(result.mimeType).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      expect(Buffer.isBuffer(result.content)).toBe(true);
      expect((result.content as Buffer).length).toBeGreaterThan(0);
      expect((result.content as Buffer).subarray(0, 2).toString()).toBe("PK");
    });
  });
});
