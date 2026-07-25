// ─── Unit Test: publication-db — Publication Package, Audit Events, Traceability ───
// Tests getPublicationPackage, getAuditEvents, recordAuditEvent, getTraceability, getFullTraceability
// Uses mocked Prisma — no database required.

// ─── Mocks (hoisted before imports) ───

jest.mock("@/lib/prisma", () => {
  const mockPrisma = {};
  return { prisma: mockPrisma };
});

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ id: "plat-log-1" }),
}));

jest.mock("@/lib/platform/audit-logger", () => ({
  Product: { AUDIT_OS: "audit_os" },
  auditLogger: jest.fn(() => ({ record: jest.fn().mockResolvedValue({ ok: true }) })),
}));

jest.mock("@/lib/platform/audit/audit-store", () => ({
  appendToAuditChain: jest.fn().mockResolvedValue(undefined),
}));

// ─── Define mock functions for Prisma models needed by publication-db ───

const mockAuditPublicationPackageFindFirst = jest.fn();
const mockAuditFinancialStatementFindMany = jest.fn();
const mockAuditDisclosureNoteFindMany = jest.fn();
const mockAuditFindingFindMany = jest.fn();
const mockAuditRecommendationFindMany = jest.fn();
const mockAuditReviewCommentFindMany = jest.fn();
const mockAuditApprovalRecordFindMany = jest.fn();
const mockAuditEvidenceFindMany = jest.fn();
const mockAuditAccountMappingFindMany = jest.fn();
const mockPlatformAuditLogFindMany = jest.fn();
const mockPlatformAuditLogCreate = jest.fn();
const mockPlatformAuditLogFindUnique = jest.fn();
const mockAuditTrialBalanceFindFirst = jest.fn();
const mockAuditEvidenceLinkFindMany = jest.fn();
const mockAuditAiOutputFindMany = jest.fn();
const mockAuditAccountMappingFindFirst = jest.fn();
const mockAuditFindingFindFirst = jest.fn();
const mockAuditRecommendationFindFirst = jest.fn();
const mockAuditEvidenceFindFirst = jest.fn();

// Re-mock prisma with all needed models
jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditPublicationPackage: {
      findFirst: mockAuditPublicationPackageFindFirst,
    },
    auditFinancialStatement: {
      findMany: mockAuditFinancialStatementFindMany,
    },
    auditDisclosureNote: {
      findMany: mockAuditDisclosureNoteFindMany,
    },
    auditFinding: {
      findMany: mockAuditFindingFindMany,
      findFirst: mockAuditFindingFindFirst,
    },
    auditRecommendation: {
      findMany: mockAuditRecommendationFindMany,
      findFirst: mockAuditRecommendationFindFirst,
    },
    auditReviewComment: {
      findMany: mockAuditReviewCommentFindMany,
    },
    auditApprovalRecord: {
      findMany: mockAuditApprovalRecordFindMany,
    },
    auditEvidence: {
      findMany: mockAuditEvidenceFindMany,
      findFirst: mockAuditEvidenceFindFirst,
    },
    auditAccountMapping: {
      findMany: mockAuditAccountMappingFindMany,
      findFirst: mockAuditAccountMappingFindFirst,
    },
    platformAuditLog: {
      findMany: mockPlatformAuditLogFindMany,
      create: mockPlatformAuditLogCreate,
      findUnique: mockPlatformAuditLogFindUnique,
    },
    auditTrialBalance: {
      findFirst: mockAuditTrialBalanceFindFirst,
    },
    auditEvidenceLink: {
      findMany: mockAuditEvidenceLinkFindMany,
    },
    auditAiOutput: {
      findMany: mockAuditAiOutputFindMany,
    },
    $transaction: jest.fn((ops) => Promise.all(ops)),
  },
}));

// ─── Imports (after mocks) ───

import { getPublicationPackage } from "@/lib/audit/db/publication-db/publication-package";
import { getAuditEvents, recordAuditEvent } from "@/lib/audit/db/publication-db/audit-events";
import { getTraceability } from "@/lib/audit/db/publication-db/traceability";
import { getFullTraceability } from "@/lib/audit/db/publication-db/full-traceability";

// ─── Helpers ───

function makeDate(iso: string): Date {
  return new Date(iso);
}

const ENGAGEMENT_ID = "eng-1";

// ─── Publication Package ───

describe("getPublicationPackage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when no publication package exists", async () => {
    mockAuditPublicationPackageFindFirst.mockResolvedValue(null);
    const result = await getPublicationPackage(ENGAGEMENT_ID);
    expect(result).toBeNull();
  });

  it("returns a fully structured PublicationPackage when data exists", async () => {
    mockAuditPublicationPackageFindFirst.mockResolvedValue({
      id: "pkg-1",
      engagementId: ENGAGEMENT_ID,
      status: "published",
      publishedAt: makeDate("2026-07-01"),
      publishedBy: "auditor-1",
      lockedAt: makeDate("2026-06-30"),
      createdAt: makeDate("2026-06-01"),
    });

    mockAuditFinancialStatementFindMany.mockResolvedValue([
      {
        id: "fs-1",
        engagementId: ENGAGEMENT_ID,
        statementType: "income_statement",
        title: "قائمة الدخل",
        status: "finalized",
        lines: JSON.stringify([
          { id: "l1", label: "الإيرادات", amount: 500000, type: "revenue", linkedAccountMappings: [] },
        ]),
        createdAt: makeDate("2026-06-01"),
        updatedAt: makeDate("2026-06-15"),
      },
    ]);

    mockAuditDisclosureNoteFindMany.mockResolvedValue([
      {
        id: "note-1",
        engagementId: ENGAGEMENT_ID,
        label: "إيضاح 1",
        content: "سياسات محاسبية",
        category: "accounting_policies",
        status: "final",
        sortOrder: 1,
        createdAt: makeDate("2026-06-01"),
        updatedAt: makeDate("2026-06-15"),
      },
    ]);

    mockAuditFindingFindMany.mockResolvedValue([
      {
        id: "find-1",
        engagementId: ENGAGEMENT_ID,
        title: "نقص في الإفصاح",
        description: "لم يتم الإفصاح كاملاً",
        status: "open",
        severity: "high",
        category: "disclosure",
        createdById: "user-1",
        relatedAccountIds: [],
        createdAt: makeDate("2026-06-01"),
        updatedAt: makeDate("2026-06-10"),
      },
    ]);

    mockAuditRecommendationFindMany.mockResolvedValue([
      {
        id: "rec-1",
        engagementId: ENGAGEMENT_ID,
        findingId: "find-1",
        title: "تحسين الإفصاح",
        description: "ينصح بتوفير إفصاح كامل",
        status: "open",
        riskLevel: "medium",
        priority: "medium",
        createdAt: makeDate("2026-06-10"),
        updatedAt: makeDate("2026-06-10"),
      },
    ]);

    mockAuditReviewCommentFindMany.mockResolvedValue([
      {
        id: "rc-1",
        engagementId: ENGAGEMENT_ID,
        targetType: "statement",
        targetId: "fs-1",
        comment: "يرجى المراجعة",
        status: "open",
        reviewerName: "مراجع 1",
        reviewerId: "user-2",
        createdAt: makeDate("2026-06-05"),
        updatedAt: makeDate("2026-06-05"),
      },
    ]);

    mockAuditApprovalRecordFindMany.mockResolvedValue([
      {
        id: "appr-1",
        engagementId: ENGAGEMENT_ID,
        action: "approved",
        approverName: "مدير التدقيق",
        approverId: "user-3",
        comments: "موافق",
        createdAt: makeDate("2026-07-01"),
        updatedAt: makeDate("2026-07-01"),
      },
    ]);

    mockAuditEvidenceFindMany.mockResolvedValue([]);
    mockAuditAccountMappingFindMany.mockResolvedValue([]);

    const result = await getPublicationPackage(ENGAGEMENT_ID);

    expect(result).not.toBeNull();
    expect(result!.id).toBe("pkg-1");
    expect(result!.status).toBe("published");
    expect(result!.publishedAt).toBe("2026-07-01T00:00:00.000Z");
    expect(result!.statements).toHaveLength(1);
    expect(result!.notes).toHaveLength(1);
    expect(result!.findings).toHaveLength(1);
    expect(result!.recommendations).toHaveLength(1);
    expect(result!.findingsSummary).toContain("1 findings");
    expect(result!.evidenceSummary).toContain("0 evidence items");
    expect(result!.reviewSummary).toBe("1 open comment(s)");
    expect(result!.approvalHistory).toHaveLength(1);
  });

  it("throws protectedAuditReadUnavailable on error", async () => {
    mockAuditPublicationPackageFindFirst.mockRejectedValue(new Error("DB error"));
    // The error is caught and rethrown via protectedAuditReadUnavailable
    await expect(getPublicationPackage(ENGAGEMENT_ID)).rejects.toThrow();
  });
});

// ─── Audit Events ───

describe("getAuditEvents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns an empty array when no events exist", async () => {
    mockPlatformAuditLogFindMany.mockResolvedValue([]);
    const result = await getAuditEvents(ENGAGEMENT_ID);
    expect(result).toEqual([]);
  });

  it("returns mapped audit events from platformAuditLog", async () => {
    mockPlatformAuditLogFindMany.mockResolvedValue([
      {
        id: "event-1",
        action: "finding.created",
        actorId: "user-1",
        actorName: "مدقق",
        targetType: "finding",
        targetId: "find-1",
        beforeState: null,
        afterState: "draft",
        eventDescription: "تم إنشاء نتيجة التدقيق",
        aiRelated: false,
        metadata: { engagementId: ENGAGEMENT_ID },
        createdAt: makeDate("2026-06-01T10:00:00Z"),
      },
    ]);

    const result = await getAuditEvents(ENGAGEMENT_ID);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("event-1");
    expect(result[0].eventType).toBe("finding.created");
  });

  it("throws on error", async () => {
    mockPlatformAuditLogFindMany.mockRejectedValue(new Error("DB error"));
    await expect(getAuditEvents(ENGAGEMENT_ID)).rejects.toThrow();
  });
});

describe("recordAuditEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates an audit event and returns it mapped", async () => {
    const created = {
      id: "event-new",
      engagementId: ENGAGEMENT_ID,
      eventType: "publication.published",
      action: "publication.published",
      actorId: "user-1",
      actorName: "مدقق",
      actorRole: "auditor",
      targetType: "publication",
      targetId: "pkg-1",
      previousState: "draft",
      beforeState: "draft",
      newState: "published",
      afterState: "published",
      description: "تم نشر الحزمة",
      eventDescription: "تم نشر الحزمة",
      aiRelated: false,
      metadata: null,
      timestamp: makeDate("2026-07-01T12:00:00Z"),
      createdAt: makeDate("2026-07-01T12:00:00Z"),
    };

    mockPlatformAuditLogFindUnique.mockResolvedValue(created);

    const result = await recordAuditEvent({
      engagementId: ENGAGEMENT_ID,
      eventType: "publication.published",
      actorId: "user-1",
      actorName: "مدقق",
      actorRole: "auditor",
      targetType: "publication",
      targetId: "pkg-1",
      previousState: "draft",
      newState: "published",
      description: "تم نشر الحزمة",
    });

    expect(result.id).toBe("event-new");
    expect(result.eventType).toBe("publication.published");
    expect(mockPlatformAuditLogFindUnique).toHaveBeenCalled();
  });

  it("passes aiRelated and metadata when provided", async () => {
    const created = {
      id: "event-ai",
      engagementId: ENGAGEMENT_ID,
      eventType: "ai.suggestion",
      action: "ai.suggestion",
      actorId: "user-1",
      actorName: "AI",
      actorRole: "system",
      targetType: "finding",
      targetId: "find-2",
      previousState: "",
      beforeState: "",
      newState: "draft",
      afterState: "draft",
      description: "اقتراح AI",
      eventDescription: "اقتراح AI",
      aiRelated: true,
      metadata: { confidence: 0.85 },
      timestamp: makeDate("2026-07-01T13:00:00Z"),
      createdAt: makeDate("2026-07-01T13:00:00Z"),
    };

    mockPlatformAuditLogFindUnique.mockResolvedValue(created);

    const result = await recordAuditEvent({
      engagementId: ENGAGEMENT_ID,
      eventType: "ai.suggestion",
      actorId: "user-1",
      actorName: "AI",
      actorRole: "system",
      targetType: "finding",
      targetId: "find-2",
      description: "اقتراح AI",
      aiRelated: true,
      metadata: { confidence: 0.85 },
    });

    expect(result.aiRelated).toBe(true);
    expect(result.metadata).toEqual({ confidence: 0.85 });
  });
});

// ─── Traceability ───

describe("getTraceability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty forward/backward trace when no data exists", async () => {
    mockAuditTrialBalanceFindFirst.mockResolvedValue(null);
    mockAuditAccountMappingFindFirst.mockResolvedValue(null);
    mockAuditAccountMappingFindMany.mockResolvedValue([]);
    mockAuditEvidenceFindFirst.mockResolvedValue(null);
    mockAuditEvidenceFindMany.mockResolvedValue([]);
    mockAuditEvidenceLinkFindMany.mockResolvedValue([]);
    mockAuditFindingFindFirst.mockResolvedValue(null);
    mockAuditFindingFindMany.mockResolvedValue([]);
    mockAuditRecommendationFindFirst.mockResolvedValue(null);
    mockAuditRecommendationFindMany.mockResolvedValue([]);
    mockAuditReviewCommentFindMany.mockResolvedValue([]);
    mockAuditPublicationPackageFindFirst.mockResolvedValue(null);
    mockAuditApprovalRecordFindMany.mockResolvedValue([]);
    mockPlatformAuditLogFindMany.mockResolvedValue([]);
    mockAuditAiOutputFindMany.mockResolvedValue([]);

    const result = await getTraceability(ENGAGEMENT_ID, "finding", "find-1");
    expect(result.targetType).toBe("finding");
    expect(result.targetId).toBe("find-1");
    expect(result.forwardTrace).toEqual([]);
    expect(result.backwardTrace).toEqual([]);
  });

  it("builds forward trace with trial balance data", async () => {
    mockAuditTrialBalanceFindFirst.mockResolvedValue({
      id: "tb-1",
      sourceFile: "trial_balance_2026.xlsx",
      trustState: "verified",
      lines: [
        { id: "tbl-1", accountCode: "1010", accountName: "النقد", balance: 500000 },
      ],
    });
    mockAuditAccountMappingFindFirst.mockResolvedValue(null);
    mockAuditAccountMappingFindMany.mockResolvedValue([]);
    mockAuditEvidenceFindFirst.mockResolvedValue(null);
    mockAuditEvidenceFindMany.mockResolvedValue([]);
    mockAuditEvidenceLinkFindMany.mockResolvedValue([]);
    mockAuditFindingFindFirst.mockResolvedValue(null);
    mockAuditFindingFindMany.mockResolvedValue([]);
    mockAuditRecommendationFindFirst.mockResolvedValue(null);
    mockAuditRecommendationFindMany.mockResolvedValue([]);
    mockAuditReviewCommentFindMany.mockResolvedValue([]);
    mockAuditPublicationPackageFindFirst.mockResolvedValue(null);
    mockAuditApprovalRecordFindMany.mockResolvedValue([]);
    mockPlatformAuditLogFindMany.mockResolvedValue([]);
    mockAuditAiOutputFindMany.mockResolvedValue([]);

    const result = await getTraceability(ENGAGEMENT_ID, "account", "1010");
    expect(result.forwardTrace.length).toBeGreaterThanOrEqual(1);
    const tbEntry = result.forwardTrace.find((e: any) => e.type === "source_data");
    expect(tbEntry).toBeDefined();
    expect(tbEntry.label).toContain("trial_balance_2026");
  });

  it("includes backward trace with publication and approval data", async () => {
    mockAuditTrialBalanceFindFirst.mockResolvedValue(null);
    mockAuditAccountMappingFindFirst.mockResolvedValue(null);
    mockAuditAccountMappingFindMany.mockResolvedValue([]);
    mockAuditEvidenceFindFirst.mockResolvedValue(null);
    mockAuditEvidenceFindMany.mockResolvedValue([]);
    mockAuditEvidenceLinkFindMany.mockResolvedValue([]);
    mockAuditFindingFindFirst.mockResolvedValue(null);
    mockAuditFindingFindMany.mockResolvedValue([]);
    mockAuditRecommendationFindFirst.mockResolvedValue(null);
    mockAuditRecommendationFindMany.mockResolvedValue([]);
    mockAuditReviewCommentFindMany.mockResolvedValue([]);
    mockAuditPublicationPackageFindFirst.mockResolvedValue({
      id: "pkg-1",
      status: "published",
      createdAt: makeDate("2026-07-01"),
    });
    mockAuditApprovalRecordFindMany.mockResolvedValue([
      {
        id: "appr-1",
        action: "approved",
        approverName: "مدير التدقيق",
        approverId: "user-3",
        comments: "موافق",
        engagementId: ENGAGEMENT_ID,
        createdAt: makeDate("2026-07-01"),
        updatedAt: makeDate("2026-07-01"),
      },
    ]);
    mockPlatformAuditLogFindMany.mockResolvedValue([]);
    mockAuditAiOutputFindMany.mockResolvedValue([]);

    const result = await getTraceability(ENGAGEMENT_ID, "finding", "find-1");
    const pubEntry = result.backwardTrace.find((e: any) => e.type === "publication");
    expect(pubEntry).toBeDefined();
    expect(pubEntry.status).toBe("published");
    const approvalEntry = result.backwardTrace.find((e: any) => e.type === "approval");
    expect(approvalEntry).toBeDefined();
    expect(approvalEntry.status).toBe("approved");
  });

  it("handles errors gracefully returning empty traces", async () => {
    mockAuditTrialBalanceFindFirst.mockRejectedValue(new Error("DB error"));
    const result = await getTraceability(ENGAGEMENT_ID, "finding", "find-1");
    expect(result.forwardTrace).toEqual([]);
    expect(result.backwardTrace).toEqual([]);
  });
});

// ─── Full Traceability ───

describe("getFullTraceability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns message when line label is not found", async () => {
    mockAuditFinancialStatementFindMany.mockResolvedValue([
      {
        id: "fs-1",
        engagementId: ENGAGEMENT_ID,
        statementType: "income_statement",
        title: "قائمة الدخل",
        status: "finalized",
        lines: JSON.stringify([
          { id: "l1", label: "الإيرادات", amount: 500000, type: "revenue", linkedAccountMappings: [] },
        ]),
        createdAt: makeDate("2026-06-01"),
        updatedAt: makeDate("2026-06-15"),
      },
    ]);

    const result = await getFullTraceability(ENGAGEMENT_ID, "غير موجود");
    expect(result.nodes).toEqual([]);
    expect(result.message).toBe("Line not found in database");
  });

  it("returns nodes for a found line with mappings, evidence, findings", async () => {
    mockAuditFinancialStatementFindMany.mockResolvedValue([
      {
        id: "fs-1",
        engagementId: ENGAGEMENT_ID,
        statementType: "income_statement",
        title: "قائمة الدخل",
        status: "finalized",
        lines: JSON.stringify([
          { id: "l1", label: "الإيرادات", amount: 500000, type: "revenue", linkedAccountMappings: ["map-1"] },
        ]),
        createdAt: makeDate("2026-06-01"),
        updatedAt: makeDate("2026-06-15"),
      },
    ]);

    mockAuditAccountMappingFindMany.mockResolvedValue([
      {
        id: "map-1",
        engagementId: ENGAGEMENT_ID,
        sourceAccountId: "src-1",
        sourceAccountCode: "4010",
        sourceAccountName: "إيرادات المبيعات",
        debitAmount: 0,
        creditAmount: 500000,
        canonicalAccountId: "ca-1",
        canonicalAccount: { id: "ca-1", code: "CA-4010", name: "إيرادات", category: "Revenue", statementType: "income_statement", displayOrder: 100 },
        confidence: 1,
        mappingType: "confirmed_ai",
        status: "confirmed",
        statementClassification: null,
        mappedBy: null,
        mappedAt: null,
        createdAt: makeDate("2026-06-01"),
        updatedAt: makeDate("2026-06-01"),
      },
    ]);

    mockAuditEvidenceLinkFindMany.mockResolvedValue([]);
    mockAuditFindingFindMany.mockResolvedValue([]);
    mockAuditRecommendationFindMany.mockResolvedValue([]);
    mockAuditReviewCommentFindMany.mockResolvedValue([]);
    mockAuditApprovalRecordFindMany.mockResolvedValue([]);
    mockPlatformAuditLogFindMany.mockResolvedValue([]);
    mockAuditAiOutputFindMany.mockResolvedValue([]);

    const result = await getFullTraceability(ENGAGEMENT_ID, "الإيرادات");
    expect(result.targetLabel).toBe("الإيرادات");
    expect(result.nodes.length).toBeGreaterThanOrEqual(1);
    const lineNode = result.nodes.find((n: any) => n.type === "source_data");
    expect(lineNode).toBeDefined();
    expect(lineNode.label).toBe("الإيرادات");
    const mappingNode = result.nodes.find((n: any) => n.type === "account");
    expect(mappingNode).toBeDefined();
    expect(mappingNode.label).toContain("إيرادات المبيعات");
  });

  it("handles errors gracefully returning error message", async () => {
    mockAuditFinancialStatementFindMany.mockRejectedValue(new Error("DB error"));
    const result = await getFullTraceability(ENGAGEMENT_ID, "الإيرادات");
    expect(result.nodes).toEqual([]);
    expect(result.message).toBe("Error building traceability");
  });
});

