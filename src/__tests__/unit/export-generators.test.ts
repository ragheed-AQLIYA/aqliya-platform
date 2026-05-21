import { generateExport, getExporter } from "@/lib/audit/export";
import type { ExportInput } from "@/lib/audit/export/types";
import type {
  FinancialStatement,
  DisclosureNote,
  EvidenceObject,
  Finding,
} from "@/types/audit";

function makeSampleStatements(): FinancialStatement[] {
  return [
    {
      id: "fs-bs-1",
      engagementId: "eng-1",
      statementType: "balance_sheet",
      title: "Statement of Financial Position",
      status: "draft",
      lines: [
        {
          id: "l1",
          statementId: "fs-bs-1",
          label: "ASSETS",
          amount: 0,
          isTotal: false,
          indentLevel: 0,
          displayOrder: 5,
          linkedAccountMappings: [],
        },
        {
          id: "l2",
          statementId: "fs-bs-1",
          label: "Current Assets",
          amount: 500000,
          isTotal: true,
          indentLevel: 0,
          displayOrder: 10,
          linkedAccountMappings: ["m1"],
        },
        {
          id: "l3",
          statementId: "fs-bs-1",
          label: "  Cash",
          amount: 100000,
          isTotal: false,
          indentLevel: 1,
          displayOrder: 11,
          linkedAccountMappings: ["m1"],
        },
        {
          id: "l4",
          statementId: "fs-bs-1",
          label: "  Accounts Receivable",
          amount: 400000,
          isTotal: false,
          indentLevel: 1,
          displayOrder: 12,
          linkedAccountMappings: ["m2"],
        },
        {
          id: "l5",
          statementId: "fs-bs-1",
          label: "TOTAL ASSETS",
          amount: 500000,
          isTotal: true,
          indentLevel: 0,
          displayOrder: 20,
          linkedAccountMappings: [],
        },
      ],
      linkedAccounts: [],
      reviewComments: [],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "fs-is-1",
      engagementId: "eng-1",
      statementType: "income_statement",
      title: "Statement of Profit or Loss",
      status: "draft",
      lines: [
        {
          id: "l6",
          statementId: "fs-is-1",
          label: "Revenue",
          amount: 1000000,
          isTotal: true,
          indentLevel: 0,
          displayOrder: 10,
          linkedAccountMappings: [],
        },
        {
          id: "l7",
          statementId: "fs-is-1",
          label: "Cost of Sales",
          amount: 600000,
          isTotal: true,
          indentLevel: 0,
          displayOrder: 20,
          linkedAccountMappings: [],
        },
        {
          id: "l8",
          statementId: "fs-is-1",
          label: "Gross Profit",
          amount: 400000,
          isTotal: true,
          indentLevel: 0,
          displayOrder: 30,
          linkedAccountMappings: [],
        },
        {
          id: "l9",
          statementId: "fs-is-1",
          label: "Net Profit",
          amount: 200000,
          isTotal: true,
          indentLevel: 0,
          displayOrder: 40,
          linkedAccountMappings: [],
        },
      ],
      linkedAccounts: [],
      reviewComments: [],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
  ];
}

function makeSampleNotes(): DisclosureNote[] {
  return [
    {
      id: "n1",
      engagementId: "eng-1",
      noteNumber: "1",
      title: "Significant Accounting Policies",
      noteType: "accounting_policy",
      content: "The financial statements are prepared under IFRS for SMEs.",
      linkedStatementLine: undefined,
      missingInformation: ["Revenue recognition details"],
      aiDrafted: true,
      status: "draft",
      reviewComments: [],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
  ];
}

function makeSampleEvidence(): EvidenceObject[] {
  return [
    {
      id: "ev1",
      engagementId: "eng-1",
      filename: "bank_confirmation.pdf",
      fileType: "pdf",
      fileSize: 102400,
      fileHash: "abc123",
      uploadedBy: "user1",
      uploadedAt: "2025-01-01T00:00:00Z",
      state: "accepted",
      linkedEntities: [],
      storageKey: "engagements/eng-1/evidence/ev1/bank_confirmation.pdf",
    },
    {
      id: "ev2",
      engagementId: "eng-1",
      filename: "inventory_sheet.xlsx",
      fileType: "xlsx",
      fileSize: 204800,
      fileHash: "def456",
      uploadedBy: "user1",
      uploadedAt: "2025-01-01T00:00:00Z",
      state: "missing",
      linkedEntities: [],
      storageKey: "",
    },
  ];
}

function makeSampleFindings(): Finding[] {
  return [
    {
      id: "f1",
      engagementId: "eng-1",
      title: "Revenue Recognition Timing",
      findingType: "disclosure_gap",
      severity: "medium",
      materiality: "immaterial",
      description: "Review required",
      rootCause: "Policy incomplete",
      impact: "Disclosure gap",
      status: "open",
      relatedAccountIds: [],
      relatedEvidenceIds: [],
      aiSuggested: false,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
  ];
}

function makeSampleInput(overrides?: Partial<ExportInput>): ExportInput {
  return {
    metadata: {
      engagementId: "eng-1",
      clientName: "Test Company",
      fiscalPeriod: "FY 2025",
      reportingFramework: "IFRS for SMEs",
      currency: "SAR",
      status: "in_progress",
      exportedAt: "2025-06-01T12:00:00Z",
      labels: {
        isDraft: true,
        isApproved: false,
        draftWarning: "DRAFT — Not final.",
        approvalInfo: null,
      },
    },
    statements: makeSampleStatements(),
    notes: makeSampleNotes(),
    evidence: makeSampleEvidence(),
    findings: makeSampleFindings(),
    ...overrides,
  };
}

describe("Export generators", () => {
  describe("getExporter", () => {
    it("returns pdf exporter for pdf format", () => {
      const exp = getExporter("pdf");
      expect(exp.format).toBe("pdf");
    });

    it("returns xlsx exporter for xlsx format", () => {
      const exp = getExporter("xlsx");
      expect(exp.format).toBe("xlsx");
    });

    it("throws for unknown format", () => {
      expect(() => getExporter("docx" as never)).toThrow(
        "Unsupported export format",
      );
    });
  });

  describe("PDF export", () => {
    it("generates a valid PDF buffer", async () => {
      const result = await generateExport(makeSampleInput(), "pdf");
      expect(result.format).toBe("pdf");
      expect(result.filename).toContain(".pdf");
      expect(result.mimeType).toBe("application/pdf");
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.sizeBytes).toBeGreaterThan(0);
      // PDF starts with %PDF signature
      expect(result.buffer.subarray(0, 5).toString()).toBe("%PDF-");
    });

    it("includes draft disclaimer in metadata", async () => {
      const input = makeSampleInput();
      const result = await generateExport(input, "pdf");
      expect(result.buffer.length).toBeGreaterThan(1000);
    });

    it("includes notes content when notes exist", async () => {
      const input = makeSampleInput({ notes: makeSampleNotes() });
      const result = await generateExport(input, "pdf");
      expect(result.sizeBytes).toBeGreaterThan(2000);
    });

    it("handles empty notes gracefully", async () => {
      const result = await generateExport(
        makeSampleInput({ notes: [] }),
        "pdf",
      );
      expect(result.sizeBytes).toBeGreaterThan(500);
    });

    it("handles single statement", async () => {
      const result = await generateExport(
        makeSampleInput({ statements: [makeSampleStatements()[0]] }),
        "pdf",
      );
      expect(result.sizeBytes).toBeGreaterThan(500);
    });
  });

  describe("XLSX export", () => {
    it("generates a valid XLSX buffer", async () => {
      const result = await generateExport(makeSampleInput(), "xlsx");
      expect(result.format).toBe("xlsx");
      expect(result.filename).toContain(".xlsx");
      expect(result.mimeType).toContain("spreadsheet");
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.sizeBytes).toBeGreaterThan(0);
      // XLSX is a ZIP file (PK signature)
      expect(result.buffer.subarray(0, 2).toString()).toBe("PK");
    });

    it("generates XLSX with correct sheets", async () => {
      const result = await generateExport(makeSampleInput(), "xlsx");
      expect(result.sizeBytes).toBeGreaterThan(2000);
    });

    it("handles empty notes in XLSX", async () => {
      const result = await generateExport(
        makeSampleInput({ notes: [] }),
        "xlsx",
      );
      expect(result.sizeBytes).toBeGreaterThan(1000);
    });

    it("handles empty evidence list", async () => {
      const result = await generateExport(
        makeSampleInput({ evidence: [] }),
        "xlsx",
      );
      expect(result.sizeBytes).toBeGreaterThan(1000);
    });

    it("handles empty findings list", async () => {
      const result = await generateExport(
        makeSampleInput({ findings: [] }),
        "xlsx",
      );
      expect(result.sizeBytes).toBeGreaterThan(1000);
    });

    it("includes all data worksheets when data exists", async () => {
      const result = await generateExport(makeSampleInput(), "xlsx");
      expect(result.buffer.subarray(0, 2).toString()).toBe("PK");
    });
  });

  describe("generateExport", () => {
    it("throws for unsupported format", async () => {
      await expect(
        generateExport(makeSampleInput(), "docx" as never),
      ).rejects.toThrow("Unsupported export format");
    });

    it("generates both formats from same input", async () => {
      const input = makeSampleInput();
      const [pdf, xlsx] = await Promise.all([
        generateExport(input, "pdf"),
        generateExport(input, "xlsx"),
      ]);
      expect(pdf.mimeType).toBe("application/pdf");
      expect(xlsx.mimeType).toContain("spreadsheet");
    });
  });
});
