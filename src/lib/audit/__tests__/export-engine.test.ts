import { describe, expect, it, beforeEach, jest } from "@jest/globals";

// Mock the services module
jest.mock("../services", () => ({
  getEngagement: jest.fn(),
  getFinancialStatements: jest.fn(),
  getDisclosureNotes: jest.fn(),
  getApprovalRecords: jest.fn(),
  getEvidence: jest.fn(),
  getFindings: jest.fn(),
  getRecommendations: jest.fn(),
  getReviewComments: jest.fn(),
  getAuditEvents: jest.fn(),
}));

// Mock the export module
jest.mock("../export", () => ({
  generateExport: jest.fn().mockResolvedValue({
    format: "pdf",
    filename: "test.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("test"),
    sizeBytes: 4,
  }),
}));

// Mock arabic support
jest.mock("../arabic-pdf-support", () => ({
  isArabicText: jest.fn((text: string) => /[\u0600-\u06FF]/.test(text)),
}));

import * as svc from "../services";
import { generateExport } from "../export";
import {
  exportFinancialStatements,
  exportAuditFile,
  generateArabicAuditReport,
  exportBilingual,
  renderExportPackage,
  type ExportPackage,
} from "../export-service";

const mockedSvc = svc as jest.Mocked<typeof svc>;
const mockedGenerateExport = generateExport as jest.MockedFunction<typeof generateExport>;

const FIXED_NOW = new Date("2026-07-03T12:00:00.000Z");

function baseEngagement(overrides: Record<string, unknown> = {}) {
  return {
    id: "eng-1",
    fiscalPeriod: "FY2025",
    status: "draft",
    client: {
      name: "Acme Manufacturing",
      reportingFramework: "IFRS",
      currencyCode: "SAR",
    },
    ...overrides,
  } as Awaited<ReturnType<typeof svc.getEngagement>>;
}

function baseStatements() {
  return [
    {
      statementType: "balance_sheet",
      title: "Statement of Financial Position",
      status: "draft",
      lines: [
        { label: "Cash", amount: 250000, isTotal: false, indentLevel: 0 },
        { label: "Total Assets", amount: 1000000, isTotal: true, indentLevel: 1 },
      ],
    },
    {
      statementType: "income_statement",
      title: "Statement of Income",
      status: "draft",
      lines: [
        { label: "Revenue", amount: 5000000, isTotal: false, indentLevel: 0 },
        { label: "Net Income", amount: 500000, isTotal: true, indentLevel: 1 },
      ],
    },
  ] as Awaited<ReturnType<typeof svc.getFinancialStatements>>;
}

function baseNotes() {
  return [
    {
      id: "note-1",
      engagementId: "eng-1",
      noteNumber: "1",
      title: "Accounting policies",
      noteType: "policy",
      content: "English disclosure content",
      linkedStatementLine: "Statement of Financial Position",
      missingInformation: [],
      aiDrafted: false,
      status: "approved",
      reviewComments: [],
      createdAt: "2026-07-01T10:00:00.000Z",
      updatedAt: "2026-07-01T10:00:00.000Z",
    },
  ] as Awaited<ReturnType<typeof svc.getDisclosureNotes>>;
}

function baseApprovals() {
  return [
    {
      id: "approval-1",
      engagementId: "eng-1",
      approverId: "user-1",
      approverName: "Partner One",
      approverRole: "partner",
      action: "approved",
      targetType: "engagement",
      targetId: "eng-1",
      createdAt: "2026-07-02T09:30:00.000Z",
    },
  ] as Awaited<ReturnType<typeof svc.getApprovalRecords>>;
}

function baseEvidence() {
  return [
    {
      id: "evidence-1",
      engagementId: "eng-1",
      filename: "tb.xlsx",
      fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileSize: 2048,
      fileHash: "hash-1",
      uploadedById: "user-2",
      uploadedAt: "2026-07-01T08:00:00.000Z",
      state: "approved",
      linkedEntities: [],
      storageKey: "audit/evidence/tb.xlsx",
    },
  ] as Awaited<ReturnType<typeof svc.getEvidence>>;
}

function baseFindings() {
  return [
    {
      id: "finding-1",
      engagementId: "eng-1",
      title: "Cash mismatch",
      findingType: "control_deficiency",
      severity: "medium",
      materiality: "significant",
      description: "Mismatch found.",
      status: "open",
      relatedAccountIds: ["account-1"],
      relatedEvidenceIds: ["evidence-1"],
      aiSuggested: false,
      createdAt: "2026-07-01T08:00:00.000Z",
      updatedAt: "2026-07-01T08:00:00.000Z",
    },
  ] as Awaited<ReturnType<typeof svc.getFindings>>;
}

function baseRecommendations() {
  return [
    {
      id: "rec-1",
      engagementId: "eng-1",
      findingId: "finding-1",
      title: "Reconcile",
      description: "Fix mismatch.",
      recommendedAction: "Reconcile accounts.",
      riskLevel: "medium",
      status: "draft",
      aiContributed: false,
      createdAt: "2026-07-01T08:00:00.000Z",
      updatedAt: "2026-07-01T08:00:00.000Z",
    },
  ] as Awaited<ReturnType<typeof svc.getRecommendations>>;
}

function baseReviewComments() {
  return [
    {
      id: "review-1",
      engagementId: "eng-1",
      targetType: "statement",
      targetId: "fs-1",
      reviewerId: "user-3",
      reviewerName: "Manager",
      comment: "Expand cash narrative.",
      status: "open",
      createdAt: "2026-07-02T11:00:00.000Z",
    },
  ] as Awaited<ReturnType<typeof svc.getReviewComments>>;
}

function baseAuditEvents() {
  return [
    {
      id: "event-1",
      engagementId: "eng-1",
      eventType: "engagement.updated",
      actorId: "user-1",
      actorName: "Partner One",
      actorRole: "partner",
      targetType: "engagement",
      targetId: "eng-1",
      newState: "draft",
      description: "Engagement updated",
      aiRelated: false,
      timestamp: "2026-07-02T12:00:00.000Z",
    },
  ] as Awaited<ReturnType<typeof svc.getAuditEvents>>;
}

function setupAllMocks() {
  mockedSvc.getEngagement.mockResolvedValue(baseEngagement());
  mockedSvc.getFinancialStatements.mockResolvedValue(baseStatements());
  mockedSvc.getDisclosureNotes.mockResolvedValue(baseNotes());
  mockedSvc.getApprovalRecords.mockResolvedValue(baseApprovals());
  mockedSvc.getEvidence.mockResolvedValue(baseEvidence());
  mockedSvc.getFindings.mockResolvedValue(baseFindings());
  mockedSvc.getRecommendations.mockResolvedValue(baseRecommendations());
  mockedSvc.getReviewComments.mockResolvedValue(baseReviewComments());
  mockedSvc.getAuditEvents.mockResolvedValue(baseAuditEvents());
}

describe("Export Engine — renderExportPackage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(FIXED_NOW);
    setupAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("throws when engagement not found", async () => {
    mockedSvc.getEngagement.mockResolvedValue(undefined);
    await expect(exportFinancialStatements("missing")).rejects.toThrow("Engagement not found");
  });

  it("returns English locale for non-Arabic content", async () => {
    const result = await exportFinancialStatements("eng-1");
    expect(result.locale).toBe("en");
    expect(result.labels.isDraft).toBe(true);
  });

  it("returns bilingual locale when Arabic client name detected", async () => {
    mockedSvc.getEngagement.mockResolvedValue(
      baseEngagement({ client: { name: "شركة الأفق", reportingFramework: "IFRS", currencyCode: "SAR" } }),
    );
    const result = await exportFinancialStatements("eng-1");
    expect(result.locale).toBe("bilingual");
  });

  it("returns bilingual locale when Arabic note content detected", async () => {
    mockedSvc.getDisclosureNotes.mockResolvedValue([
      {
        id: "note-ar",
        engagementId: "eng-1",
        noteNumber: "1",
        title: "الإفصاحات",
        noteType: "policy",
        content: "عربي",
        linkedStatementLine: "Statement of Financial Position",
        missingInformation: [],
        aiDrafted: false,
        status: "approved",
        reviewComments: [],
        createdAt: "2026-07-01T10:00:00.000Z",
        updatedAt: "2026-07-01T10:00:00.000Z",
      },
    ] as Awaited<ReturnType<typeof svc.getDisclosureNotes>>);
    const result = await exportFinancialStatements("eng-1");
    expect(result.locale).toBe("bilingual");
  });

  it("sets approval labels for published engagement", async () => {
    mockedSvc.getEngagement.mockResolvedValue(baseEngagement({ status: "published" }));
    const result = await exportFinancialStatements("eng-1");
    expect(result.labels.isDraft).toBe(false);
    expect(result.labels.isApproved).toBe(true);
    expect(result.labels.draftWarning).toBe("");
    expect(result.labels.approvalInfo).toContain("Approved by Partner One");
  });

  it("sets draft labels for draft engagement", async () => {
    const result = await exportFinancialStatements("eng-1");
    expect(result.labels.isDraft).toBe(true);
    expect(result.labels.isApproved).toBe(false);
    expect(result.labels.draftWarning).toContain("DRAFT");
    expect(result.labels.approvalInfo).toBeNull();
  });

  it("maps statement lines correctly", async () => {
    const result = await exportFinancialStatements("eng-1");
    expect(result.statements).toHaveLength(2);
    expect(result.statements[0].statementType).toBe("balance_sheet");
    expect(result.statements[0].lines).toHaveLength(2);
    expect(result.statements[0].lines[0].label).toBe("Cash");
    expect(result.statements[0].lines[0].amount).toBe(250000);
  });

  it("links notes to correct statements", async () => {
    const result = await exportFinancialStatements("eng-1");
    const bsNotes = result.statements[0].notes;
    expect(bsNotes).toEqual(["1. Accounting policies"]);
    const isNotes = result.statements[1].notes;
    expect(isNotes).toEqual([]);
  });

  it("exportAuditFile includes all sections", async () => {
    const result = await exportAuditFile("eng-1");
    expect(result.auditFile).toBeDefined();
    expect(result.auditFile?.evidenceChecklist).toHaveLength(1);
    expect(result.auditFile?.findings).toHaveLength(1);
    expect(result.auditFile?.recommendations).toHaveLength(1);
    expect(result.auditFile?.reviewComments).toHaveLength(1);
    expect(result.auditFile?.approvalRecords).toHaveLength(1);
    expect(result.auditFile?.auditTrail).toHaveLength(1);
  });

  it("exportAuditFile stamps exportedAt on evidence and approvals", async () => {
    const result = await exportAuditFile("eng-1");
    expect(result.auditFile?.exportedAt).toBe(FIXED_NOW.toISOString());
    expect(result.auditFile?.evidenceChecklist[0].exportedAt).toBe(FIXED_NOW.toISOString());
    expect(result.auditFile?.approvalRecords[0].exportedAt).toBe(FIXED_NOW.toISOString());
  });

  it("exportAuditFile propagates errors from sub-services", async () => {
    mockedSvc.getEvidence.mockRejectedValue(new Error("db down"));
    await expect(exportAuditFile("eng-1")).rejects.toThrow("db down");
  });

  it("generateArabicAuditReport falls back to empty arrays on errors", async () => {
    mockedSvc.getFindings.mockRejectedValue(new Error("fail"));
    mockedSvc.getRecommendations.mockRejectedValue(new Error("fail"));
    mockedSvc.getEvidence.mockRejectedValue(new Error("fail"));
    mockedSvc.getAuditEvents.mockRejectedValue(new Error("fail"));
    const result = await generateArabicAuditReport("eng-1");
    expect(result.locale).toBe("ar");
    expect(result.auditFile?.findings).toEqual([]);
    expect(result.auditFile?.recommendations).toEqual([]);
    expect(result.auditFile?.evidenceChecklist).toEqual([]);
    expect(result.auditFile?.auditTrail).toEqual([]);
    expect(result.auditFile?.reviewComments).toEqual([]);
  });

  it("generateArabicAuditReport translates statement titles", async () => {
    const result = await generateArabicAuditReport("eng-1");
    expect(result.statements[0].title).toBe("قائمة المركز المالي");
    expect(result.statements[1].title).toBe("قائمة الدخل");
  });

  it("generateArabicAuditReport still includes approval records", async () => {
    const result = await generateArabicAuditReport("eng-1");
    expect(result.auditFile?.approvalRecords).toHaveLength(1);
  });

  it("exportBilingual with en locale returns English titles", async () => {
    const result = await exportBilingual("eng-1", "en");
    expect(result.locale).toBe("en");
    expect(result.statements[0].title).toBe("Statement of Financial Position");
  });

  it("exportBilingual with ar locale returns Arabic titles", async () => {
    const result = await exportBilingual("eng-1", "ar");
    expect(result.locale).toBe("ar");
    expect(result.statements[0].title).toBe("قائمة المركز المالي");
  });

  it("exportBilingual with bilingual locale returns combined titles", async () => {
    const result = await exportBilingual("eng-1", "bilingual");
    expect(result.locale).toBe("bilingual");
    expect(result.statements[0].title).toBe("قائمة المركز المالي / Statement of Financial Position");
    expect(result.statements[1].title).toBe("قائمة الدخل / Statement of Income");
  });

  it("exportBilingual preserves note titles for bilingual", async () => {
    const result = await exportBilingual("eng-1", "bilingual");
    expect(result.notes[0].title).toBe("Accounting policies");
  });

  it("renderExportPackage calls generateExport with correct format", async () => {
    const pkg = await exportFinancialStatements("eng-1");
    await renderExportPackage(pkg, "pdf");
    expect(mockedGenerateExport).toHaveBeenCalledTimes(1);
    const [input, format] = mockedGenerateExport.mock.calls[0];
    expect(format).toBe("pdf");
    expect(input.metadata.engagementId).toBe("eng-1");
    expect(input.metadata.locale).toBe("en");
    expect(input.statements).toHaveLength(2);
  });

  it("renderExportPackage with xlsx format", async () => {
    const pkg = await exportFinancialStatements("eng-1");
    await renderExportPackage(pkg, "xlsx");
    expect(mockedGenerateExport).toHaveBeenCalledTimes(1);
    const [, format] = mockedGenerateExport.mock.calls[0];
    expect(format).toBe("xlsx");
  });

  it("renderExportPackage includes audit file sections when present", async () => {
    const pkg = await exportAuditFile("eng-1");
    await renderExportPackage(pkg, "pdf");
    const [input] = mockedGenerateExport.mock.calls[0];
    expect(input.evidence).toHaveLength(1);
    expect(input.findings).toHaveLength(1);
    expect(input.recommendations).toHaveLength(1);
    expect(input.approvalRecords).toHaveLength(1);
    expect(input.auditTrail).toHaveLength(1);
  });

  it("renderExportPackage omits audit file sections when absent", async () => {
    const pkg = await exportFinancialStatements("eng-1");
    await renderExportPackage(pkg, "pdf");
    const [input] = mockedGenerateExport.mock.calls[0];
    expect(input.evidence).toBeUndefined();
    expect(input.findings).toBeUndefined();
  });

  it("exportedAt is consistent across base and audit file", async () => {
    const result = await exportAuditFile("eng-1");
    expect(result.exportedAt).toBe(result.auditFile?.exportedAt);
  });

  it("handles engagement with no client data gracefully", async () => {
    mockedSvc.getEngagement.mockResolvedValue({
      id: "eng-1",
      fiscalPeriod: "FY2025",
      status: "draft",
      client: null,
    } as any);
    const result = await exportFinancialStatements("eng-1");
    expect(result.clientName).toBe("");
    expect(result.reportingFramework).toBe("IFRS for SMEs");
    expect(result.currency).toBe("SAR");
  });

  it("handles empty statements array", async () => {
    mockedSvc.getFinancialStatements.mockResolvedValue([]);
    const result = await exportFinancialStatements("eng-1");
    expect(result.statements).toEqual([]);
  });

  it("handles empty approval records", async () => {
    mockedSvc.getApprovalRecords.mockResolvedValue([]);
    const result = await exportFinancialStatements("eng-1");
    expect(result.labels.isDraft).toBe(true);
    expect(result.labels.approvalInfo).toBeNull();
  });

  it("approve status with no approval records still marks approved", async () => {
    mockedSvc.getEngagement.mockResolvedValue(baseEngagement({ status: "approved" }));
    mockedSvc.getApprovalRecords.mockResolvedValue([]);
    const result = await exportFinancialStatements("eng-1");
    expect(result.labels.isApproved).toBe(true);
    expect(result.labels.approvalInfo).toBeNull();
  });

  it("renderExportPackage maps statement types correctly", async () => {
    const pkg = await exportFinancialStatements("eng-1");
    await renderExportPackage(pkg, "pdf");
    const [input] = mockedGenerateExport.mock.calls[0];
    expect(input.statements[0].statementType).toBe("balance_sheet");
    expect(input.statements[1].statementType).toBe("income_statement");
  });

  it("renderExportPackage assigns correct statement ids and line ids", async () => {
    const pkg = await exportFinancialStatements("eng-1");
    await renderExportPackage(pkg, "pdf");
    const [input] = mockedGenerateExport.mock.calls[0];
    expect(input.statements[0].id).toBe("stmt-0");
    expect(input.statements[1].id).toBe("stmt-1");
    expect(input.statements[0].lines[0].id).toBe("line-0-0");
    expect(input.statements[0].lines[1].id).toBe("line-0-1");
  });

  it("renderExportPackage sets displayOrder on lines", async () => {
    const pkg = await exportFinancialStatements("eng-1");
    await renderExportPackage(pkg, "pdf");
    const [input] = mockedGenerateExport.mock.calls[0];
    expect(input.statements[0].lines[0].displayOrder).toBe(0);
    expect(input.statements[0].lines[1].displayOrder).toBe(1);
  });
});

describe("Export Engine — edge cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(FIXED_NOW);
    setupAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("multiple findings and recommendations are all exported", async () => {
    mockedSvc.getFindings.mockResolvedValue([
      { ...baseFindings()[0], id: "f-1", title: "Finding 1" },
      { ...baseFindings()[0], id: "f-2", title: "Finding 2" },
    ] as any);
    mockedSvc.getRecommendations.mockResolvedValue([
      { ...baseRecommendations()[0], id: "r-1" },
      { ...baseRecommendations()[0], id: "r-2" },
      { ...baseRecommendations()[0], id: "r-3" },
    ] as any);
    const result = await exportAuditFile("eng-1");
    expect(result.auditFile?.findings).toHaveLength(2);
    expect(result.auditFile?.recommendations).toHaveLength(3);
  });

  it("empty notes does not break statement mapping", async () => {
    mockedSvc.getDisclosureNotes.mockResolvedValue([]);
    const result = await exportFinancialStatements("eng-1");
    expect(result.statements[0].notes).toEqual([]);
  });

  it("notes linked to non-existent statements are ignored", async () => {
    mockedSvc.getDisclosureNotes.mockResolvedValue([
      {
        ...baseNotes()[0],
        linkedStatementLine: "Non-existent Statement",
      },
    ] as any);
    const result = await exportFinancialStatements("eng-1");
    for (const stmt of result.statements) {
      expect(stmt.notes).toEqual([]);
    }
  });

  it("arabic audit report handles unknown statement types with fallback title", async () => {
    mockedSvc.getFinancialStatements.mockResolvedValue([
      {
        statementType: "custom_type",
        title: "Custom",
        status: "draft",
        lines: [{ label: "X", amount: 100, isTotal: false, indentLevel: 0 }],
      },
    ] as any);
    const result = await generateArabicAuditReport("eng-1");
    expect(result.statements[0].title).toBe("Custom");
  });

  it("multiple review comments are all included in audit file", async () => {
    mockedSvc.getReviewComments.mockResolvedValue([
      { ...baseReviewComments()[0], id: "rc-1" },
      { ...baseReviewComments()[0], id: "rc-2" },
    ] as any);
    const result = await exportAuditFile("eng-1");
    expect(result.auditFile?.reviewComments).toHaveLength(2);
  });

  it("status transition from draft to approved changes labels correctly", async () => {
    mockedSvc.getEngagement.mockResolvedValue(baseEngagement({ status: "draft" }));
    const draftResult = await exportFinancialStatements("eng-1");
    expect(draftResult.labels.isDraft).toBe(true);

    mockedSvc.getEngagement.mockResolvedValue(baseEngagement({ status: "approved" }));
    const approvedResult = await exportFinancialStatements("eng-1");
    expect(approvedResult.labels.isDraft).toBe(false);
    expect(approvedResult.labels.isApproved).toBe(true);
  });

  it("audit events are included in audit trail", async () => {
    const result = await exportAuditFile("eng-1");
    expect(result.auditFile?.auditTrail[0].eventType).toBe("engagement.updated");
    expect(result.auditFile?.auditTrail[0].actorName).toBe("Partner One");
  });

  it("exportAuditFile includes financial statements from base", async () => {
    const result = await exportAuditFile("eng-1");
    expect(result.statements).toHaveLength(2);
    expect(result.statements[0].statementType).toBe("balance_sheet");
  });

  it("renderExportPackage sets engagementId on all statements", async () => {
    const pkg = await exportFinancialStatements("eng-1");
    await renderExportPackage(pkg, "pdf");
    const [input] = mockedGenerateExport.mock.calls[0];
    for (const stmt of input.statements) {
      expect(stmt.engagementId).toBe("eng-1");
    }
  });

  it("renderExportPackage sets createdAt and updatedAt on statements", async () => {
    const pkg = await exportFinancialStatements("eng-1");
    await renderExportPackage(pkg, "pdf");
    const [input] = mockedGenerateExport.mock.calls[0];
    expect(input.statements[0].createdAt).toBe(FIXED_NOW.toISOString());
    expect(input.statements[0].updatedAt).toBe(FIXED_NOW.toISOString());
  });

  it("renderExportPackage sets empty linkedAccountMappings on lines", async () => {
    const pkg = await exportFinancialStatements("eng-1");
    await renderExportPackage(pkg, "pdf");
    const [input] = mockedGenerateExport.mock.calls[0];
    expect(input.statements[0].lines[0].linkedAccountMappings).toEqual([]);
  });

  it("renderExportPackage sets empty reviewComments on statements", async () => {
    const pkg = await exportFinancialStatements("eng-1");
    await renderExportPackage(pkg, "pdf");
    const [input] = mockedGenerateExport.mock.calls[0];
    expect(input.statements[0].reviewComments).toEqual([]);
  });

  it("renderExportPackage sets status as draft/approved type", async () => {
    const pkg = await exportFinancialStatements("eng-1");
    await renderExportPackage(pkg, "pdf");
    const [input] = mockedGenerateExport.mock.calls[0];
    expect(["draft", "reviewed", "approved"]).toContain(input.statements[0].status);
  });
});
