// ─── Unit/Integration Test: DecisionOS Actions ───
// Tests CRUD operations, evidence upload, export, and error paths for decisions.
// Uses mocked Prisma — no database required.

// ─── Mocks (hoisted before imports) ───

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/decision", () => ({
  evaluateIntake: jest.fn().mockReturnValue({
    status: "accepted",
    readyForFramework: true,
    reasonCodes: [],
    reasons: [],
    requiredNextSteps: [],
  }),
  evaluateFramework: jest.fn().mockReturnValue({
    isComplete: true,
    missingFields: [],
    suggestion: "Framework is complete",
    completeness: 100,
    scores: { clarity: 8, coverage: 7, alignment: 9 },
  }),
  evaluateScenarios: jest.fn().mockReturnValue({
    isComplete: true,
    gapIdentified: false,
    missingPerspectives: [],
    missingCount: 0,
    suggestion: "Scenarios are adequate",
    scores: { diversity: 7, coverage: 8 },
  }),
  evaluateRisks: jest.fn().mockReturnValue({
    isComplete: true,
    gapIdentified: false,
    missingTypes: [],
    missingCount: 0,
    recommendation: "Risks adequately evaluated",
    scores: { identification: 8, mitigation: 7 },
  }),
}));

const mockGetCurrentUser = jest.fn();
const mockRequireDecisionAccess = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  requireUserContext: mockGetCurrentUser,
  requireDecisionAccess: mockRequireDecisionAccess,
  isExpectedAccessDeniedError: jest.fn((error) =>
    error instanceof Error &&
    (error.message.startsWith("Access denied:") || error.message === "Unauthenticated")
  ),
}));

jest.mock("@/lib/decision/decision-audit", () => ({
  logDecisionAudit: jest.fn().mockResolvedValue(undefined),
  logAudit: jest.fn().mockResolvedValue(undefined),
  toAuditJson: jest.fn((o) => JSON.stringify(o)),
}));

jest.mock("@/lib/platform/audit-logger", () => ({
  auditLogger: jest.fn(() => ({
    record: jest.fn().mockResolvedValue({ ok: true }),
  })),
  Product: { DECISION_OS: "decision_os" },
}));

const mockStorageStore = jest.fn();
const mockStorageDelete = jest.fn();
jest.mock("@/lib/platform/storage", () => ({
  getStorageProvider: jest.fn(() => ({
    store: mockStorageStore,
    delete: mockStorageDelete,
  })),
}));

jest.mock("@/lib/decisions/export", () => ({
  buildDecisionReportPDF: jest.fn().mockResolvedValue({
    content: Buffer.from("mock-pdf-content"),
    mimeType: "application/pdf",
    filename: "decision-report.pdf",
  }),
}));

jest.mock("@/lib/simulation/simulation-engine", () => ({
  deriveScores: jest.fn().mockReturnValue({
    strategicFitScore: 75,
    feasibilityScore: 70,
    riskScore: 65,
    confidenceScore: 72,
    dataQuality: "good",
    missingInputs: [],
  }),
  buildScoringData: jest.fn().mockReturnValue({}),
}));

jest.mock("@/lib/decision/outcome-dashboard", () => ({
  buildOutcomeDashboardMetrics: jest.fn().mockReturnValue({
    totalTracked: 0,
    avgOutcomeScore: null,
    reviewedCount: 0,
  }),
}));

jest.mock("@/lib/decision/outcome-correlation", () => ({
  buildOutcomeCorrelation: jest.fn().mockReturnValue({
    correlations: [],
    insights: [],
  }),
}));

jest.mock("@/lib/decision/decision-portfolio", () => ({
  buildDecisionPortfolioSnapshot: jest.fn().mockReturnValue({
    portfolioRiskProfile: "balanced",
    diversityScore: 0,
  }),
}));

jest.mock("@/lib/decision/cross-decision-patterns", () => ({
  buildCrossDecisionPatterns: jest.fn().mockReturnValue({
    patterns: [],
    commonRisks: [],
    recommendations: [],
  }),
}));
// ─── Prisma mock functions ───

const mockDecisionCreate = jest.fn();
const mockDecisionFindMany = jest.fn();
const mockDecisionFindUnique = jest.fn();
const mockDecisionUpdate = jest.fn();
const mockDecisionCount = jest.fn();
const mockDecisionEvidenceFindMany = jest.fn();
const mockDecisionEvidenceFindUnique = jest.fn();
const mockDecisionEvidenceCreate = jest.fn();
const mockDecisionEvidenceDelete = jest.fn();
const mockDecisionEvidenceCount = jest.fn();
const mockAuditLogCreate = jest.fn();
const mockRecommendationFindUnique = jest.fn();
const mockRecommendationFindFirst = jest.fn();
const mockRecommendationUpsert = jest.fn();
const mockApprovalFindFirst = jest.fn();
const mockApprovalFindUnique = jest.fn();
const mockObjectiveFindMany = jest.fn();
const mockDecisionScenarioFindMany = jest.fn();
const mockDecisionScenarioFindFirst = jest.fn();
const mockDecisionScenarioCreate = jest.fn();
const mockDecisionScenarioUpdate = jest.fn();
const mockDecisionRiskAnalysisFindMany = jest.fn();
const mockDecisionRiskAnalysisFindFirst = jest.fn();
const mockDecisionRiskAnalysisCreate = jest.fn();
const mockDecisionRiskAnalysisUpdate = jest.fn();
const mockDecisionGroupBy = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: {
      create: mockDecisionCreate,
      findMany: mockDecisionFindMany,
      findUnique: mockDecisionFindUnique,
      update: mockDecisionUpdate,
      count: mockDecisionCount,
      groupBy: mockDecisionGroupBy,
    },
    decisionEvidence: {
      findMany: mockDecisionEvidenceFindMany,
      findUnique: mockDecisionEvidenceFindUnique,
      create: mockDecisionEvidenceCreate,
      delete: mockDecisionEvidenceDelete,
      count: mockDecisionEvidenceCount,
    },
    auditLog: {
      create: mockAuditLogCreate,
    },
    recommendation: {
      findUnique: mockRecommendationFindUnique,
      findFirst: mockRecommendationFindFirst,
      upsert: mockRecommendationUpsert,
    },
    approval: {
      findFirst: mockApprovalFindFirst,
      findUnique: mockApprovalFindUnique,
    },
    objective: {
      findMany: mockObjectiveFindMany,
    },
    decisionScenario: {
      findMany: mockDecisionScenarioFindMany,
      findFirst: mockDecisionScenarioFindFirst,
      create: mockDecisionScenarioCreate,
      update: mockDecisionScenarioUpdate,
    },
    decisionRiskAnalysis: {
      findMany: mockDecisionRiskAnalysisFindMany,
      findFirst: mockDecisionRiskAnalysisFindFirst,
      create: mockDecisionRiskAnalysisCreate,
      update: mockDecisionRiskAnalysisUpdate,
    },
    $transaction: jest.fn((ops) => Promise.all(ops)),
  },
}));
// ─── Imports (after mocks) ───

import { logDecisionAudit, logAudit } from "@/lib/decision/decision-audit";

import {
  createDecision,
  getDecisions,
  getDecisionById,
  updateDecisionStatus,
  getDecisionFramework,
  exportDecisionReport,
  getDashboardMetrics,
} from "@/actions/decisions";

import {
  getDecisionEvidenceAction,
  uploadDecisionEvidenceAction,
  deleteDecisionEvidenceAction,
} from "@/actions/decision-evidence-actions";

// ─── Mock Data ───

const mockUser = {
  id: "user-1",
  name: "مستخدم اختبار",
  email: "test@aqliya.com",
  organizationId: "org-1",
  platformOrganizationId: "plat-org-1",
  role: "ADMIN",
  organization: { id: "org-1", name: "منظمة اختبار" },
};

const mockDecision = {
  id: "decision-1",
  title: "قرار استثماري استراتيجي",
  type: "INVESTMENT",
  status: "DRAFT",
  priority: "HIGH",
  description: "قرار استثماري في قطاع التكنولوجيا",
  targetDate: new Date("2026-12-31"),
  ownerId: "user-1",
  organizationId: "org-1",
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
  owner: { id: "user-1", name: "مستخدم اختبار" },
  organization: { id: "org-1", name: "منظمة اختبار" },
  reviewer: null,
  approver: null,
  objectives: [],
  constraints: [],
  assumptions: [],
  alternatives: [],
  risks: [],
  framework: null,
  decisionScenarios: [],
  riskAnalyses: [],
  scenarios: [],
  simulations: [],
  recommendation: null,
  approvals: [],
  outcome: null,
  auditLogs: [],
  reports: [],
  signals: [],
  alerts: [],
  sector: null,
  decisionPatterns: null,
  sectorPatterns: [],
  evidence: [],
  tenderProfile: null,
};

const base64Content = Buffer.from("mock file content").toString("base64");
// ─── Tests ───

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue(mockUser);
  mockRequireDecisionAccess.mockResolvedValue({ user: mockUser, organizationId: "org-1" });
});

describe("createDecision", () => {
  it("creates a decision with required fields", async () => {
    mockDecisionCreate.mockResolvedValue(mockDecision);

    const result = await createDecision({
      title: "قرار استثماري استراتيجي",
      type: "INVESTMENT",
      priority: "HIGH",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("قرار استثماري استراتيجي");
      expect(result.data.type).toBe("INVESTMENT");
      expect(result.data.status).toBe("DRAFT");
    }
    expect(mockDecisionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "قرار استثماري استراتيجي",
          type: "INVESTMENT",
          organizationId: "org-1",
          ownerId: "user-1",
        }),
      }),
    );
    expect(logAudit).toHaveBeenCalled();
  });

  it("defaults type to TENDER and priority to MEDIUM", async () => {
    mockDecisionCreate.mockResolvedValue({ ...mockDecision, type: "TENDER", priority: "MEDIUM" });

    const result = await createDecision({ title: "قرار اختبار" });

    expect(result.success).toBe(true);
    expect(mockDecisionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "TENDER",
          priority: "MEDIUM",
        }),
      }),
    );
  });

  it("rejects empty title", async () => {
    const result = await createDecision({ title: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("title");
    }
  });

  it("rejects whitespace-only title", async () => {
    const result = await createDecision({ title: "   " });

    expect(result.success).toBe(false);
  });

  it("rejects invalid decision type", async () => {
    const result = await createDecision({ title: "قرار", type: "INVALID_TYPE" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid decision type");
    }
  });

  it("handles OPERATOR role rejection", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Access denied: OPERATOR role required"));

    const result = await createDecision({ title: "قرار" });

    expect(result.success).toBe(false);
  });
});

describe("getDecisions", () => {
  it("returns decisions for the user organization", async () => {
    mockDecisionFindMany.mockResolvedValue([mockDecision]);

    const result = await getDecisions();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe("قرار استثماري استراتيجي");
    }
    expect(mockDecisionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: "org-1" }),
      }),
    );
  });

  it("returns empty array when no decisions exist", async () => {
    mockDecisionFindMany.mockResolvedValue([]);

    const result = await getDecisions();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });

  it("handles unauthorized access", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthenticated"));

    const result = await getDecisions();

    expect(result.success).toBe(false);
  });
});

describe("getDecisionById", () => {
  it("returns a decision by id", async () => {
    mockDecisionFindUnique.mockResolvedValue(mockDecision);

    const result = await getDecisionById("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("decision-1");
      expect(result.data.title).toBe("قرار استثماري استراتيجي");
    }
    expect(mockRequireDecisionAccess).toHaveBeenCalledWith("decision-1", "VIEWER");
  });

  it("returns error for non-existent decision", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);

    const result = await getDecisionById("nonexistent");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Decision not found");
    }
  });

  it("handles unauthorized access", async () => {
    mockRequireDecisionAccess.mockRejectedValue(new Error("Access denied: VIEWER role required"));

    const result = await getDecisionById("decision-1");

    expect(result.success).toBe(false);
  });
});

describe("updateDecisionStatus", () => {
  it("updates decision status to IN_REVIEW", async () => {
    mockDecisionUpdate.mockResolvedValue({ ...mockDecision, status: "IN_REVIEW" });

    const result = await updateDecisionStatus("decision-1", "IN_REVIEW");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("IN_REVIEW");
    }
    expect(mockDecisionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "decision-1" },
        data: { status: "IN_REVIEW" },
      }),
    );
  });

  it("handles unauthorized status update", async () => {
    mockRequireDecisionAccess.mockRejectedValue(new Error("Access denied: OPERATOR role required"));

    const result = await updateDecisionStatus("decision-1", "APPROVED");

    expect(result.success).toBe(false);
  });
});

describe("getDecisionFramework", () => {
  it("returns framework data with evaluation", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecision,
      framework: {
        id: "fw-1",
        decisionId: "decision-1",
        context: "سياق القرار",
        purpose: "الغرض من القرار",
        options: "الخيارات المتاحة",
        criteria: "معايير التقييم",
        values: "القيم المؤسسية",
        informationGaps: "فجوات المعلومات",
        certainty: "درجة اليقين",
        assumptions: "الافتراضات",
      },
    });

    const result = await getDecisionFramework("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("INVESTMENT");
      expect(result.data.framework).toBeTruthy();
      expect(result.data.framework.context).toBe("سياق القرار");
      expect(result.data.intake).toBeDefined();
      expect(result.data.frameworkState).toBeDefined();
    }
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);

    const result = await getDecisionFramework("nonexistent");

    expect(result.success).toBe(false);
  });
});

describe("getDecisionEvidenceAction", () => {
  it("lists evidence for a decision", async () => {
    const mockEvidence = [
      {
        id: "ev-1",
        decisionId: "decision-1",
        filename: "تقرير-مالي.pdf",
        fileType: "pdf",
        fileSize: 1024,
        fileHash: "abc123",
        storageKey: "decisions/decision-1/evidence/ev-1",
        uploadedById: "user-1",
        description: "تقرير مالي للربع الأول",
        metadata: null,
        organizationId: "org-1",
        createdAt: new Date("2026-06-01"),
      },
    ];
    mockDecisionEvidenceFindMany.mockResolvedValue(mockEvidence);

    const result = await getDecisionEvidenceAction("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].filename).toBe("تقرير-مالي.pdf");
    }
  });

  it("returns empty array when no evidence exists", async () => {
    mockDecisionEvidenceFindMany.mockResolvedValue([]);

    const result = await getDecisionEvidenceAction("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });
});

describe("uploadDecisionEvidenceAction", () => {
  it("uploads evidence successfully", async () => {
    mockDecisionEvidenceCount.mockResolvedValue(0);
    mockDecisionEvidenceCreate.mockResolvedValue({
      id: "ev-1",
      decisionId: "decision-1",
      organizationId: "org-1",
      filename: "تقرير-مالي.pdf",
      fileType: "pdf",
      fileSize: 1024,
      fileHash: "abc123def456",
      storageKey: "decisions/decision-1/evidence/ts-report.pdf",
      uploadedById: "user-1",
      description: "تقرير مالي",
      metadata: { uploadedAt: new Date().toISOString() },
      createdAt: new Date(),
    });
    mockStorageStore.mockResolvedValue(undefined);

    const result = await uploadDecisionEvidenceAction({
      decisionId: "decision-1",
      filename: "تقرير-مالي.pdf",
      fileType: "pdf",
      fileData: base64Content,
      description: "تقرير مالي",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.filename).toBe("تقرير-مالي.pdf");
      expect(result.data.fileType).toBe("pdf");
    }
    expect(mockStorageStore).toHaveBeenCalledWith(
      expect.stringContaining("decisions/decision-1/evidence/"),
      expect.objectContaining({ filename: "تقرير-مالي.pdf" }),
    );
  });

  it("rejects unsupported file type", async () => {
    const result = await uploadDecisionEvidenceAction({
      decisionId: "decision-1",
      filename: "file.exe",
      fileType: "exe",
      fileData: base64Content,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("غير مدعوم");
    }
  });

  it("rejects file exceeding maximum size", async () => {
    const largeContent = Buffer.alloc(21 * 1024 * 1024).toString("base64");

    const result = await uploadDecisionEvidenceAction({
      decisionId: "decision-1",
      filename: "large_file.pdf",
      fileType: "pdf",
      fileData: largeContent,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("كبير جداً");
    }
  });

  it("rejects when max evidence count reached", async () => {
    mockDecisionEvidenceCount.mockResolvedValue(50);

    const result = await uploadDecisionEvidenceAction({
      decisionId: "decision-1",
      filename: "extra.pdf",
      fileType: "pdf",
      fileData: base64Content,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("أكثر من");
    }
  });
});

describe("deleteDecisionEvidenceAction", () => {
  it("deletes evidence successfully", async () => {
    mockDecisionEvidenceFindUnique.mockResolvedValue({
      id: "ev-1",
      decisionId: "decision-1",
      filename: "تقرير-مالي.pdf",
      fileType: "pdf",
      fileSize: 1024,
      fileHash: "abc123",
      storageKey: "decisions/decision-1/evidence/ev-1",
      uploadedById: "user-1",
      description: "تقرير مالي",
      metadata: null,
      organizationId: "org-1",
      createdAt: new Date(),
    });
    mockDecisionEvidenceDelete.mockResolvedValue({ id: "ev-1" });
    mockStorageDelete.mockResolvedValue(true);

    const result = await deleteDecisionEvidenceAction("ev-1");

    expect(result.success).toBe(true);
    expect(mockDecisionEvidenceDelete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "ev-1" } }),
    );
  });

  it("returns error when evidence not found", async () => {
    mockDecisionEvidenceFindUnique.mockResolvedValue(null);

    const result = await deleteDecisionEvidenceAction("nonexistent");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("غير موجود");
    }
  });
});

describe("exportDecisionReport", () => {
  it("exports a decision report successfully", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecision,
      owner: { id: "user-1", name: "مستخدم اختبار" },
      organization: { id: "org-1", name: "منظمة اختبار" },
      tenderProfile: {
        clientName: "عميل تجريبي",
        estimatedContractValue: 5000000,
        estimatedCost: 3500000,
        durationMonths: 12,
        marginEstimate: 0.3,
        riskLevel: "MEDIUM",
        requiredCapacity: 10,
        internalAvailableCapacity: 8,
        strategicFitScore: 80,
      },
      scenarios: [],
      recommendation: null,
      auditLogs: [],
    });

    const result = await exportDecisionReport("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content).toBeDefined();
      expect(result.mimeType).toBe("application/pdf");
      expect(result.filename).toBe("decision-report.pdf");
    }
    expect(logAudit).toHaveBeenCalled();
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);

    const result = await exportDecisionReport("nonexistent");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Decision not found");
    }
  });

  it("rejects cross-organization access", async () => {
    mockDecisionFindUnique.mockResolvedValue({
      ...mockDecision,
      organizationId: "org-other",
    });

    const result = await exportDecisionReport("decision-1");

    expect(result.success).toBe(false);
  });
});

describe("getDashboardMetrics", () => {
  it("returns dashboard metrics for the organization", async () => {
    mockDecisionFindMany.mockResolvedValue([mockDecision]);

    const result = await getDashboardMetrics();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalDecisions).toBe(1);
      expect(result.data.byStatus).toBeDefined();
      expect(result.data.byType).toBeDefined();
      expect(result.data.governanceMetrics).toBeDefined();
    }
  });

  it("handles empty decisions gracefully", async () => {
    mockDecisionFindMany.mockResolvedValue([]);

    const result = await getDashboardMetrics();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalDecisions).toBe(0);
      expect(result.data.byStatus).toEqual({});
      expect(result.data.avgCompletion).toBe(0);
    }
  });
});

