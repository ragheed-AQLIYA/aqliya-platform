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

import * as svc from "../services";
import {
  exportAuditFile,
  exportBilingual,
  exportFinancialStatements,
  generateArabicAuditReport,
} from "../export-service";

const mockedSvc = svc as jest.Mocked<typeof svc>;

const FIXED_NOW = new Date("2026-07-03T12:00:00.000Z");

describe("audit export-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(FIXED_NOW);

    mockedSvc.getEngagement.mockResolvedValue({
      id: "eng-1",
      fiscalPeriod: "FY2025",
      status: "draft",
      client: {
        name: "Acme Manufacturing",
        reportingFramework: "IFRS",
        currencyCode: "SAR",
      },
    } as Awaited<ReturnType<typeof svc.getEngagement>>);

    mockedSvc.getFinancialStatements.mockResolvedValue([
      {
        statementType: "balance_sheet",
        title: "Statement of Financial Position",
        status: "draft",
        lines: [
          {
            label: "Cash and cash equivalents",
            amount: 250000,
            isTotal: false,
            indentLevel: 0,
          },
        ],
      },
    ] as Awaited<ReturnType<typeof svc.getFinancialStatements>>);

    mockedSvc.getDisclosureNotes.mockResolvedValue([
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
    ] as Awaited<ReturnType<typeof svc.getDisclosureNotes>>);

    mockedSvc.getApprovalRecords.mockResolvedValue([
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
    ] as Awaited<ReturnType<typeof svc.getApprovalRecords>>);

    mockedSvc.getEvidence.mockResolvedValue([
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
    ] as Awaited<ReturnType<typeof svc.getEvidence>>);

    mockedSvc.getFindings.mockResolvedValue([
      {
        id: "finding-1",
        engagementId: "eng-1",
        title: "Cash confirmation mismatch",
        findingType: "control_deficiency",
        severity: "medium",
        materiality: "significant",
        description: "Mismatch between confirmation and ledger.",
        status: "open",
        relatedAccountIds: ["account-1"],
        relatedEvidenceIds: ["evidence-1"],
        aiSuggested: false,
        createdAt: "2026-07-01T08:00:00.000Z",
        updatedAt: "2026-07-01T08:00:00.000Z",
      },
    ] as Awaited<ReturnType<typeof svc.getFindings>>);

    mockedSvc.getRecommendations.mockResolvedValue([
      {
        id: "rec-1",
        engagementId: "eng-1",
        findingId: "finding-1",
        title: "Reconcile confirmations",
        description: "Investigate the confirmation mismatch.",
        recommendedAction: "Perform follow-up reconciliation.",
        riskLevel: "medium",
        status: "draft",
        aiContributed: false,
        createdAt: "2026-07-01T08:00:00.000Z",
        updatedAt: "2026-07-01T08:00:00.000Z",
      },
    ] as Awaited<ReturnType<typeof svc.getRecommendations>>);

    mockedSvc.getReviewComments.mockResolvedValue([
      {
        id: "review-1",
        engagementId: "eng-1",
        targetType: "statement",
        targetId: "fs-1",
        reviewerId: "user-3",
        reviewerName: "Manager Reviewer",
        comment: "Please expand the cash narrative.",
        status: "open",
        createdAt: "2026-07-02T11:00:00.000Z",
      },
    ] as Awaited<ReturnType<typeof svc.getReviewComments>>);

    mockedSvc.getAuditEvents.mockResolvedValue([
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
    ] as Awaited<ReturnType<typeof svc.getAuditEvents>>);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("throws when the engagement cannot be found", async () => {
    mockedSvc.getEngagement.mockResolvedValue(undefined);

    await expect(exportFinancialStatements("missing-engagement")).rejects.toThrow(
      "Engagement not found",
    );
  });

  it("returns bilingual locale and draft labels when Arabic content exists", async () => {
    mockedSvc.getEngagement.mockResolvedValue({
      id: "eng-1",
      fiscalPeriod: "FY2025",
      status: "draft",
      client: {
        name: "شركة الأفق",
        reportingFramework: "IFRS for SMEs",
        currencyCode: "SAR",
      },
    } as Awaited<ReturnType<typeof svc.getEngagement>>);

    mockedSvc.getDisclosureNotes.mockResolvedValue([
      {
        id: "note-ar-1",
        engagementId: "eng-1",
        noteNumber: "1",
        title: "الإفصاحات المحاسبية",
        noteType: "policy",
        content: "شرح عربي للإفصاح",
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
    expect(result.labels.isDraft).toBe(true);
    expect(result.labels.isApproved).toBe(false);
    expect(result.labels.draftWarning).toContain("DRAFT");
    expect(result.labels.approvalInfo).toBeNull();
    expect(result.statements[0]?.notes).toEqual(["1. الإفصاحات المحاسبية"]);
    expect(result.exportedAt).toBe(FIXED_NOW.toISOString());
  });

  it("adds approval metadata for approved engagements", async () => {
    mockedSvc.getEngagement.mockResolvedValue({
      id: "eng-1",
      fiscalPeriod: "FY2025",
      status: "approved",
      client: {
        name: "Acme Manufacturing",
        reportingFramework: "IFRS",
        currencyCode: "SAR",
      },
    } as Awaited<ReturnType<typeof svc.getEngagement>>);

    const result = await exportFinancialStatements("eng-1");

    expect(result.labels.isDraft).toBe(false);
    expect(result.labels.isApproved).toBe(true);
    expect(result.labels.draftWarning).toBe("");
    expect(result.labels.approvalInfo).toEqual(
      expect.stringContaining("Approved by Partner One at"),
    );
  });

  it("enriches audit-file exports with a consistent export timestamp", async () => {
    const result = await exportAuditFile("eng-1");

    expect(result.auditFile).toBeDefined();
    expect(result.auditFile?.exportedAt).toBe(FIXED_NOW.toISOString());
    expect(result.auditFile?.evidenceChecklist[0]?.exportedAt).toBe(
      FIXED_NOW.toISOString(),
    );
    expect(result.auditFile?.approvalRecords[0]?.exportedAt).toBe(
      FIXED_NOW.toISOString(),
    );
    expect(result.auditFile?.auditTrail).toHaveLength(1);
    expect(result.auditFile?.findings).toHaveLength(1);
    expect(result.auditFile?.recommendations).toHaveLength(1);
    expect(result.auditFile?.reviewComments).toHaveLength(1);
  });

  it("falls back to empty optional audit sections in Arabic report generation", async () => {
    mockedSvc.getFindings.mockRejectedValue(new Error("findings unavailable"));
    mockedSvc.getRecommendations.mockRejectedValue(new Error("recommendations unavailable"));
    mockedSvc.getEvidence.mockRejectedValue(new Error("evidence unavailable"));
    mockedSvc.getAuditEvents.mockRejectedValue(new Error("audit trail unavailable"));

    const result = await generateArabicAuditReport("eng-1");

    expect(result.locale).toBe("ar");
    expect(result.statements[0]?.title).toBe("قائمة المركز المالي");
    expect(result.auditFile?.findings).toEqual([]);
    expect(result.auditFile?.recommendations).toEqual([]);
    expect(result.auditFile?.evidenceChecklist).toEqual([]);
    expect(result.auditFile?.auditTrail).toEqual([]);
    expect(result.auditFile?.reviewComments).toEqual([]);
  });

  it("translates titles for bilingual exports without dropping note content", async () => {
    const result = await exportBilingual("eng-1", "bilingual");

    expect(result.locale).toBe("bilingual");
    expect(result.statements[0]?.title).toBe(
      "قائمة المركز المالي / Statement of Financial Position",
    );
    expect(result.notes[0]?.title).toBe("Accounting policies");
  });

  it("exportAuditFile propagates sub-service errors (no catch clause)", async () => {
    mockedSvc.getEvidence.mockRejectedValue(new Error("evidence unavailable"));

    await expect(exportAuditFile("eng-1")).rejects.toThrow(
      "evidence unavailable",
    );
  });

  it("exportBilingual with locale=en returns English titles unchanged", async () => {
    const result = await exportBilingual("eng-1", "en");

    expect(result.locale).toBe("en");
    expect(result.statements[0]?.title).toBe("Statement of Financial Position");
    expect(result.notes[0]?.title).toBe("Accounting policies");
  });
});
