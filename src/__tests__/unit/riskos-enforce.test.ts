import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// ─── Mocks (hoisted before imports) ───

const mockGetCurrentUser = jest.fn();
const mockEnforce = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  isExpectedAccessDeniedError: jest.fn(
    (error: Error) =>
      error?.message?.startsWith("Access denied:") ||
      error?.message === "Unauthenticated",
  ),
}));

jest.mock("@/lib/kernel", () => ({
  enforce: mockEnforce,
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditRiskModel: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    auditRiskAssessment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditRiskProcedure: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    auditEngagement: {
      findMany: jest.fn(),
    },
    platformAuditLog: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/platform/audit-risk", () => ({
  createRiskModel: jest.fn(),
  getRiskModel: jest.fn(),
  listRiskModels: jest.fn(),
  assessRisk: jest.fn(),
  getAssessment: jest.fn(),
  getAssessmentsByEngagement: jest.fn(),
  getRiskProcedures: jest.fn(),
  updateProcedure: jest.fn(),
  verifyOrgAccess: jest.fn(),
  transitionAssessmentStatus: jest.fn(),
}));

jest.mock("@/lib/platform/cache-strategy", () => ({
  getCachedOrFetch: jest.fn((_key: string, fn: () => Promise<unknown>) => fn()),
  DASHBOARD_CACHE_TTL_MS: 300000,
  invalidateCacheByPrefix: jest.fn().mockResolvedValue(undefined),
}));

const mockWritePlatformAuditLog = jest.fn().mockResolvedValue({ ok: true, id: "audit-1" });
jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: (...args: unknown[]) => mockWritePlatformAuditLog(...args),
}));

// ─── Imports ───

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import {
  createRiskModelAction,
  createAssessmentAction,
  updateProcedureAction,
  transitionAssessmentAction,
  exportAssessmentAction,
  listAssessmentsAction,
  getAssessmentAction,
  getAssessmentAuditTrailAction,
  getRiskDashboardStatsAction,
  getRiskModelAction,
} from "@/app/risk/actions";
import {
  createRiskModel,
  assessRisk,
  getAssessment,
  getAssessmentsByEngagement,
  getRiskProcedures,
  updateProcedure,
  verifyOrgAccess,
  transitionAssessmentStatus,
  listRiskModels,
  getRiskModel,
} from "@/lib/platform/audit-risk";

// ─── Helpers ───

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "risk@test.com",
    name: "Risk Tester",
    role: "ADMIN",
    organizationId: "org-1",
    platformOrganizationId: "plat-1",
    organization: { id: "org-1", name: "Risk Org" },
    ...overrides,
  };
}

function makeRiskModel(overrides: Record<string, unknown> = {}) {
  return {
    id: "model-1",
    organizationId: "org-1",
    name: "Test Risk Model",
    description: "Standard risk model",
    version: 1,
    categories: [],
    thresholds: { low: 30, medium: 60, high: 80, critical: 100 },
    isActive: true,
    createdById: "user-1",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function makeAssessment(overrides: Record<string, unknown> = {}) {
  return {
    id: "assess-1",
    modelId: "model-1",
    organizationId: "org-1",
    engagementId: "eng-1",
    title: "Test Assessment",
    inherentScore: 75,
    inherentLevel: "HIGH",
    residualScore: 40,
    residualLevel: "MEDIUM",
    riskResponse: "MITIGATE",
    responseNotes: "Apply controls",
    answers: {},
    categoryScores: [],
    status: "draft",
    assessedById: "user-1",
    reviewedById: null,
    approvedById: null,
    assessedAt: new Date("2026-01-01"),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

// ─── Test: RiskOS enforce() Authorization ───

describe("RiskOS enforce(): Authorization Gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockEnforce as jest.Mock).mockResolvedValue(undefined);
    (mockGetCurrentUser as jest.Mock).mockResolvedValue(makeUser());
  });

  it("createRiskModelAction calls enforce before creation", async () => {
    (createRiskModel as jest.Mock).mockResolvedValue(makeRiskModel());
    await createRiskModelAction({ name: "New Model", categories: [] });
    expect(mockEnforce).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" }),
      expect.objectContaining({ type: "engagement" }),
      "create",
    );
    expect(createRiskModel).toHaveBeenCalled();
  });

  it("createRiskModelAction rejects when enforce throws", async () => {
    (mockEnforce as jest.Mock).mockRejectedValue(
      new Error("Access denied: insufficient permissions"),
    );
    const result = await createRiskModelAction({ name: "Unauthorized Model", categories: [] });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Access denied");
    expect(createRiskModel).not.toHaveBeenCalled();
  });

  it("createAssessmentAction calls enforce before assessment", async () => {
    (prisma.auditEngagement.findMany as jest.Mock).mockResolvedValue([{ id: "eng-1" }]);
    (assessRisk as jest.Mock).mockResolvedValue(makeAssessment());
    await createAssessmentAction("model-1", "eng-1", {
      title: "New Assessment", answers: { q1: { inherent: 5 } },
    });
    expect(mockEnforce).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" }),
      expect.objectContaining({ type: "engagement" }),
      "create",
    );
  });

  it("createAssessmentAction rejects unauthorized user", async () => {
    (mockEnforce as jest.Mock).mockRejectedValue(new Error("Access denied: insufficient role"));
    const result = await createAssessmentAction("model-1", "eng-1", {
      title: "Unauthorized Assessment", answers: {},
    });
    expect(result.ok).toBe(false);
    expect(assessRisk).not.toHaveBeenCalled();
  });

  it("updateProcedureAction calls enforce before update", async () => {
    (verifyOrgAccess as jest.Mock).mockResolvedValue(true);
    (updateProcedure as jest.Mock).mockResolvedValue({ id: "proc-1" });
    await updateProcedureAction("proc-1", { description: "Updated" });
    expect(mockEnforce).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" }),
      expect.objectContaining({ type: "engagement" }),
      "update",
    );
  });

  it("updateProcedureAction rejects unauthorized user", async () => {
    (mockEnforce as jest.Mock).mockRejectedValue(new Error("Access denied: role required"));
    const result = await updateProcedureAction("proc-1", { description: "Should fail" });
    expect(result.ok).toBe(false);
    expect(updateProcedure).not.toHaveBeenCalled();
  });

  it("transitionAssessmentAction calls enforce before transition", async () => {
    (transitionAssessmentStatus as jest.Mock).mockResolvedValue(
      makeAssessment({ status: "reviewed" }),
    );
    await transitionAssessmentAction("assess-1", "REVIEWED");
    expect(mockEnforce).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" }),
      expect.objectContaining({ type: "engagement" }),
      "update",
    );
  });

  it("transitionAssessmentAction rejects unauthorized user", async () => {
    (mockEnforce as jest.Mock).mockRejectedValue(new Error("Access denied: admin role required"));
    const result = await transitionAssessmentAction("assess-1", "REVIEWED");
    expect(result.ok).toBe(false);
    expect(transitionAssessmentStatus).not.toHaveBeenCalled();
  });

  it("exportAssessmentAction calls enforce with export action", async () => {
    (getAssessment as jest.Mock).mockResolvedValue(makeAssessment());
    (verifyOrgAccess as jest.Mock).mockResolvedValue(true);
    (getRiskProcedures as jest.Mock).mockResolvedValue([]);
    await exportAssessmentAction("assess-1");
    expect(mockEnforce).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" }),
      expect.objectContaining({ type: "engagement" }),
      "export",
    );
  });

  it("exportAssessmentAction rejects unauthorized user", async () => {
    (mockEnforce as jest.Mock).mockRejectedValue(new Error("Access denied: export not permitted"));
    const result = await exportAssessmentAction("assess-1");
    expect(result.ok).toBe(false);
  });
});

// ─── Test: Risk Assessment Status Transitions ───

describe("Risk Assessment: Status Transitions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockEnforce as jest.Mock).mockResolvedValue(undefined);
    (mockGetCurrentUser as jest.Mock).mockResolvedValue(makeUser());
  });

  it("DRAFT → REVIEWED is a valid transition", async () => {
    (transitionAssessmentStatus as jest.Mock).mockResolvedValue(
      makeAssessment({ status: "reviewed", reviewedById: "user-1" }),
    );
    const result = await transitionAssessmentAction("assess-1", "REVIEWED");
    expect(result.ok).toBe(true);
    expect(transitionAssessmentStatus).toHaveBeenCalledWith("assess-1", "REVIEWED", "user-1");
  });

  it("REVIEWED → APPROVED is a valid transition", async () => {
    (transitionAssessmentStatus as jest.Mock).mockResolvedValue(
      makeAssessment({ status: "approved", approvedById: "user-1" }),
    );
    const result = await transitionAssessmentAction("assess-1", "APPROVED");
    expect(result.ok).toBe(true);
    expect(transitionAssessmentStatus).toHaveBeenCalledWith("assess-1", "APPROVED", "user-1");
  });

  it("DRAFT → APPROVED is invalid (must go through REVIEWED)", async () => {
    (transitionAssessmentStatus as jest.Mock).mockRejectedValue(new Error("Invalid transition"));
    const result = await transitionAssessmentAction("assess-1", "APPROVED");
    expect(result.ok).toBe(false);
  });

  it("APPROVED → REVIEWED is invalid (no backwards transitions)", async () => {
    (transitionAssessmentStatus as jest.Mock).mockRejectedValue(new Error("Invalid transition"));
    const result = await transitionAssessmentAction("assess-1", "REVIEWED");
    expect(result.ok).toBe(false);
  });

  it("APPROVED → DRAFT is invalid (no reset allowed)", async () => {
    (transitionAssessmentStatus as jest.Mock).mockRejectedValue(new Error("Invalid transition"));
    const result = await transitionAssessmentAction("assess-1", "DRAFT");
    expect(result.ok).toBe(false);
  });

  it("REVIEWED → DRAFT is invalid (no backwards transitions)", async () => {
    (transitionAssessmentStatus as jest.Mock).mockRejectedValue(new Error("Invalid transition"));
    const result = await transitionAssessmentAction("assess-1", "DRAFT");
    expect(result.ok).toBe(false);
  });

  it("records reviewedById on DRAFT → REVIEWED", async () => {
    (transitionAssessmentStatus as jest.Mock).mockResolvedValue(
      makeAssessment({ status: "reviewed", reviewedById: "user-1" }),
    );
    await transitionAssessmentAction("assess-1", "REVIEWED");
    expect(transitionAssessmentStatus).toHaveBeenCalledWith("assess-1", "REVIEWED", "user-1");
  });

  it("records approvedById on REVIEWED → APPROVED", async () => {
    (transitionAssessmentStatus as jest.Mock).mockResolvedValue(
      makeAssessment({ status: "approved", approvedById: "user-1" }),
    );
    await transitionAssessmentAction("assess-1", "APPROVED");
    expect(transitionAssessmentStatus).toHaveBeenCalledWith("assess-1", "APPROVED", "user-1");
  });
});

// ─── Test: Risk Assessment Tenant Isolation ───

describe("Risk Assessment: Tenant Isolation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockEnforce as jest.Mock).mockResolvedValue(undefined);
    (mockGetCurrentUser as jest.Mock).mockResolvedValue(makeUser());
  });

  it("getAssessmentAction rejects cross-org access", async () => {
    (getAssessment as jest.Mock).mockResolvedValue(
      makeAssessment({ organizationId: "org-other" }),
    );
    (verifyOrgAccess as jest.Mock).mockResolvedValue(false);
    const result = await getAssessmentAction("assess-1");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("وصول مرفوض");
  });

  it("getAssessmentAction allows same-org access", async () => {
    (getAssessment as jest.Mock).mockResolvedValue(makeAssessment({ organizationId: "org-1" }));
    (verifyOrgAccess as jest.Mock).mockResolvedValue(true);
    (getRiskProcedures as jest.Mock).mockResolvedValue([]);
    const result = await getAssessmentAction("assess-1");
    expect(result.ok).toBe(true);
  });

  it("updateProcedureAction rejects cross-org procedure access", async () => {
    (verifyOrgAccess as jest.Mock).mockResolvedValue(false);
    const result = await updateProcedureAction("proc-other-org", { description: "Should fail" });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("وصول مرفوض");
  });

  it("exportAssessmentAction rejects cross-org export", async () => {
    (getAssessment as jest.Mock).mockResolvedValue(
      makeAssessment({ organizationId: "org-other" }),
    );
    (verifyOrgAccess as jest.Mock).mockResolvedValue(false);
    const result = await exportAssessmentAction("assess-1");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("وصول مرفوض");
  });

  it("listAssessmentsAction returns only same-org assessments", async () => {
    (prisma.auditEngagement.findMany as jest.Mock).mockResolvedValue([{ id: "eng-1" }]);
    (getAssessmentsByEngagement as jest.Mock).mockResolvedValue([
      makeAssessment({ id: "a1", organizationId: "org-1" }),
      makeAssessment({ id: "a2", organizationId: "org-1" }),
    ]);
    const result = await listAssessmentsAction();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items).toHaveLength(2);
    }
  });

  it("getAssessmentAuditTrailAction rejects cross-org access", async () => {
    (verifyOrgAccess as jest.Mock).mockResolvedValue(false);
    const result = await getAssessmentAuditTrailAction("assess-1");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("وصول مرفوض");
  });
});

// ─── Test: Risk Assessment Export with Audit Trail ───

describe("Risk Assessment: Export with Audit Trail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockEnforce as jest.Mock).mockResolvedValue(undefined);
    (mockGetCurrentUser as jest.Mock).mockResolvedValue(makeUser());
  });

  it("exportAssessmentAction returns structured export data", async () => {
    (getAssessment as jest.Mock).mockResolvedValue(makeAssessment());
    (verifyOrgAccess as jest.Mock).mockResolvedValue(true);
    (getRiskProcedures as jest.Mock).mockResolvedValue([
      {
        procedureCode: "PROC-001", description: "Test procedure", riskCategory: "Financial",
        procedureSteps: [{ stepNumber: 1, instruction: "Step 1" }],
        evidenceRequired: true, status: "pending",
      },
    ]);
    const result = await exportAssessmentAction("assess-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("Test Assessment");
      expect(result.data.status).toBe("draft");
      expect(result.data.inherentLevel).toBe("HIGH");
      expect(result.data.procedures).toHaveLength(1);
      expect(result.data.procedures[0].code).toBe("PROC-001");
      expect(result.data.exportedAt).toBeDefined();
      expect(result.data.exportedBy).toBe("user-1");
    }
  });

  it("exportAssessmentAction logs RISK_ASSESSMENT_EXPORTED audit event", async () => {
    (getAssessment as jest.Mock).mockResolvedValue(makeAssessment());
    (verifyOrgAccess as jest.Mock).mockResolvedValue(true);
    (getRiskProcedures as jest.Mock).mockResolvedValue([]);
    await exportAssessmentAction("assess-1");
    expect(mockWritePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        productKey: "audit",
        action: "RISK_ASSESSMENT_EXPORTED",
        targetType: "auditRiskAssessment",
        targetId: "assess-1",
        actorId: "user-1",
      }),
    );
  });

  it("exportAssessmentAction returns error for non-existent assessment", async () => {
    (getAssessment as jest.Mock).mockResolvedValue(null);
    const result = await exportAssessmentAction("nonexistent");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("غير موجود");
  });
});

// ─── Test: Risk Dashboard Stats ───

describe("Risk Dashboard: Stats Aggregation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockEnforce as jest.Mock).mockResolvedValue(undefined);
    (mockGetCurrentUser as jest.Mock).mockResolvedValue(makeUser());
  });

  it("getRiskDashboardStatsAction returns aggregated stats", async () => {
    (prisma.auditEngagement.findMany as jest.Mock).mockResolvedValue([{ id: "eng-1" }]);
    (listRiskModels as jest.Mock).mockResolvedValue([
      makeRiskModel({ id: "m1" }),
      makeRiskModel({ id: "m2" }),
    ]);
    // Action filters on lowercase status: "draft", "reviewed", "approved"
    (getAssessmentsByEngagement as jest.Mock).mockResolvedValue([
      makeAssessment({ id: "a1", status: "draft", inherentLevel: "HIGH" }),
      makeAssessment({ id: "a2", status: "reviewed", inherentLevel: "LOW" }),
      makeAssessment({ id: "a3", status: "approved", inherentLevel: "CRITICAL" }),
    ]);
    const result = await getRiskDashboardStatsAction();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.totalModels).toBe(2);
      expect(result.data.totalAssessments).toBe(3);
      expect(result.data.pendingReview).toBe(2); // draft + reviewed
      expect(result.data.approved).toBe(1);
      expect(result.data.highCritical).toBe(2); // HIGH + CRITICAL
      expect(result.data.lowMedium).toBe(1); // LOW
    }
  });
});

// ─── Test: Risk Assessment Not Found ───

describe("Risk Assessment: Not Found Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockEnforce as jest.Mock).mockResolvedValue(undefined);
    (mockGetCurrentUser as jest.Mock).mockResolvedValue(makeUser());
  });

  it("getAssessmentAction returns error for non-existent assessment", async () => {
    (getAssessment as jest.Mock).mockResolvedValue(null);
    const result = await getAssessmentAction("nonexistent");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("غير موجود");
  });

  it("getRiskModelAction returns error for non-existent model", async () => {
    (getRiskModel as jest.Mock).mockResolvedValue(null);
    const result = await getRiskModelAction("nonexistent");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("غير موجود");
  });
});

// ─── Test: Risk Assessment Audit Trail ───

describe("Risk Assessment: Audit Trail Retrieval", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockEnforce as jest.Mock).mockResolvedValue(undefined);
    (mockGetCurrentUser as jest.Mock).mockResolvedValue(makeUser());
  });

  it("getAssessmentAuditTrailAction returns paginated audit entries", async () => {
    (verifyOrgAccess as jest.Mock).mockResolvedValue(true);
    (prisma.platformAuditLog.findMany as jest.Mock).mockResolvedValue([
      {
        id: "log-1", action: "RISK_ASSESSMENT_CREATED", actorId: "user-1",
        actorName: "Risk Tester", metadata: { modelId: "model-1" }, createdAt: new Date("2026-01-01"),
      },
      {
        id: "log-2", action: "RISK_ASSESSMENT_REVIEWED", actorId: "user-1",
        actorName: "Risk Tester", metadata: { fromStatus: "draft", toStatus: "reviewed" },
        createdAt: new Date("2026-01-02"),
      },
    ]);
    (prisma.platformAuditLog.count as jest.Mock).mockResolvedValue(2);
    const result = await getAssessmentAuditTrailAction("assess-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items).toHaveLength(2);
      expect(result.data.totalCount).toBe(2);
      expect(result.data.hasMore).toBe(false);
      expect(result.data.items[0].action).toBe("RISK_ASSESSMENT_CREATED");
      expect(result.data.items[1].action).toBe("RISK_ASSESSMENT_REVIEWED");
    }
  });

  it("getAssessmentAuditTrailAction supports pagination with more results", async () => {
    (verifyOrgAccess as jest.Mock).mockResolvedValue(true);
    (prisma.platformAuditLog.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.platformAuditLog.count as jest.Mock).mockResolvedValue(120);
    // offset=0, PAGE_SIZE=50 → hasMore = 0+50 < 120 → true
    const result = await getAssessmentAuditTrailAction("assess-1", 0);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.hasMore).toBe(true);
      expect(result.data.totalCount).toBe(120);
    }
  });
});
