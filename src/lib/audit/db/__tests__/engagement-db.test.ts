/**
 * Unit Test: Engagement DB (AuditOS / engagement-db)
 *
 * Tests dashboard summary, engagement CRUD, status transitions,
 * publishing, and archiving. All Prisma calls and side-effects mocked.
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditEngagement: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditClient: {
      create: jest.fn(),
    },

    platformAuditLog: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    auditFinding: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    auditEvidence: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    auditAccountMapping: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    auditReviewComment: {
      count: jest.fn(),
    },
    auditCanonicalAccount: {
      findMany: jest.fn(),
    },
    auditPublicationPackage: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/audit/audit-events", () => ({
  recordAuditOsAuditEvent: jest.fn().mockResolvedValue({ id: "ae-1" }),
}));

jest.mock("@/lib/audit/db/publication-db", () => ({
  getPublicationPackage: jest.fn().mockResolvedValue({
    id: "pkg-1",
    engagementId: "eng-1",
    status: "published",
    publishedAt: new Date().toISOString(),
    publishedBy: "user-1",
  }),
}));

jest.mock("@/lib/audit/presentation/presentation-policy-resolver", () => ({
  policyIdForProfile: jest.fn().mockReturnValue("pol-default"),
}));

jest.mock("@/lib/audit/governance", () => ({
  appendFactoryApprovalGates: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/audit/reconciliation/reconciliation-engine", () => ({
  appendReconciliationApprovalGates: jest.fn().mockResolvedValue(undefined),
}));

import { prisma } from "@/lib/prisma";
import {
  getDashboardSummary,
  getEngagements,
  getEngagement,
  getEngagementWorkflowStatus,
  getEngagementOrganizationId,
  getApprovalStatus,
  createClient,
  createEngagement,
  updateEngagementPresentationProfile,
  updateEngagementStatus,
  getCanonicalAccounts,
  publishEngagement,
  archiveEngagement,
  restoreEngagement,
} from "@/lib/audit/db/engagement-db";

const mp = jest.mocked(prisma);

// ─── Shared test data ───────────────────────────────────────────────

const NOW = new Date("2026-07-21T00:00:00.000Z");
const ENGAGEMENT_ID = "eng-1";
const CLIENT_ID = "client-1";
const ORG_ID = "org-1";
const USER_ID = "user-1";
const USER_NAME = "Test User";

function baseEngagement(overrides?: Record<string, unknown>) {
  return {
    id: ENGAGEMENT_ID,
    organizationId: ORG_ID,
    clientId: CLIENT_ID,
    fiscalPeriod: "FY2026",
    engagementType: "audit",
    status: "in_progress",
    team: [],
    alerts: [],
    presentationProfile: "generic",
    presentationProfileVersion: "generic-v1",
    presentationPolicyId: "pol-default",
    client: {
      id: CLIENT_ID,
      organizationId: ORG_ID,
      name: "Test Client",
      registrationNumber: "CR-123",
      industry: "services",
      reportingFramework: "ifrs",
      fiscalPeriodEnd: "12-31",
      currencyCode: "SAR",
      status: "active",
      contactEmail: "client@test.com",
      contactPhone: "+966500000000",
      createdAt: NOW,
      updatedAt: NOW,
    },
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

// ─── Dashboard ──────────────────────────────────────────────────────

describe("engagement-db — Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getDashboardSummary returns aggregated counts", async () => {
    mp.auditEngagement.findMany.mockResolvedValue([
      baseEngagement({ status: "in_progress" }),
      baseEngagement({ id: "eng-2", status: "under_review" }),
      baseEngagement({ id: "eng-3", status: "published" }),
    ]);
    mp.platformAuditLog.findMany.mockResolvedValue([]);
    mp.auditFinding.findMany.mockResolvedValue([{ id: "f-1" }, { id: "f-2" }]);
    mp.auditEvidence.findMany.mockResolvedValue([{ id: "e-1" }]);
    mp.auditAccountMapping.findMany.mockResolvedValue([]);

    const result = await getDashboardSummary(ORG_ID);
    expect(result.totalEngagements).toBe(3);
    expect(result.activeEngagements).toBe(2);
    expect(result.openFindings).toBe(2);
    expect(result.missingEvidence).toBe(1);
    expect(result.publishedCount).toBe(1);
  });

  it("getDashboardSummary returns empty summary when no engagements", async () => {
    mp.auditEngagement.findMany.mockResolvedValue([]);
    mp.platformAuditLog.findMany.mockResolvedValue([]);
    mp.auditFinding.findMany.mockResolvedValue([]);
    mp.auditEvidence.findMany.mockResolvedValue([]);
    mp.auditAccountMapping.findMany.mockResolvedValue([]);

    const result = await getDashboardSummary();
    expect(result.totalEngagements).toBe(0);
    expect(result.activeEngagements).toBe(0);
  });

  it("getEngagements returns engagement list", async () => {
    mp.auditEngagement.findMany.mockResolvedValue([baseEngagement()]);
    const result = await getEngagements();
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(ENGAGEMENT_ID);
  });

  it("getEngagements returns empty array when none", async () => {
    mp.auditEngagement.findMany.mockResolvedValue([]);
    const result = await getEngagements(ORG_ID);
    expect(result).toEqual([]);
  });

  it("getEngagement returns engagement by id", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue(baseEngagement());
    const result = await getEngagement(ORG_ID, ENGAGEMENT_ID);
    expect(result).not.toBeNull();
    expect(result!.id).toBe(ENGAGEMENT_ID);
  });

  it("getEngagement returns null when not found", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue(null);
    const result = await getEngagement(ORG_ID, "nonexistent");
    expect(result).toBeNull();
  });
});

// ─── Status & Workflow ──────────────────────────────────────────────

describe("engagement-db — Status & Workflow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getEngagementWorkflowStatus returns status with blocking issues", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue(baseEngagement({ status: "in_progress" }));
    mp.auditAccountMapping.count.mockResolvedValue(2);
    mp.auditEvidence.count.mockResolvedValue(1);
    mp.auditReviewComment.count.mockResolvedValue(0);

    const result = await getEngagementWorkflowStatus(ENGAGEMENT_ID);
    expect(result.currentState).toBe("in_progress");
    expect(result.blockingIssues).toHaveLength(2);
    expect(result.completionPercentage).toBe(45);
  });

  it("getEngagementWorkflowStatus handles missing engagement", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue(null);
    mp.auditAccountMapping.count.mockResolvedValue(0);
    mp.auditEvidence.count.mockResolvedValue(0);
    mp.auditReviewComment.count.mockResolvedValue(0);

    const result = await getEngagementWorkflowStatus(ENGAGEMENT_ID);
    expect(result.currentState).toBe("setup");
    expect(result.availableTransitions).toContain("in_progress");
  });

  it("getEngagementOrganizationId returns org id", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue({ organizationId: ORG_ID });
    const result = await getEngagementOrganizationId(ENGAGEMENT_ID);
    expect(result).toBe(ORG_ID);
  });

  it("getEngagementOrganizationId returns null when engagement missing", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue(null);
    const result = await getEngagementOrganizationId(ENGAGEMENT_ID);
    expect(result).toBeNull();
  });

  it("getApprovalStatus returns ready when all checks pass", async () => {
    mp.auditReviewComment.count.mockResolvedValue(0);
    mp.auditAccountMapping.count.mockResolvedValue(0);
    mp.auditEvidence.count.mockResolvedValue(0);
    mp.auditFinding.count.mockResolvedValue(0);
    mp.auditEngagement.findUnique.mockResolvedValue({ status: "ready_for_approval" });

    const result = await getApprovalStatus(ENGAGEMENT_ID);
    expect(result.status).toBe("ready");
    expect(result.checklist).toHaveLength(5);
    expect(result.blockingIssues).toEqual([]);
  });

  it("getApprovalStatus returns not_ready when issues exist", async () => {
    mp.auditReviewComment.count.mockResolvedValue(3);
    mp.auditAccountMapping.count.mockResolvedValue(5);
    mp.auditEvidence.count.mockResolvedValue(2);
    mp.auditFinding.count.mockResolvedValue(1);
    mp.auditEngagement.findUnique.mockResolvedValue({ status: "in_progress" });

    const result = await getApprovalStatus(ENGAGEMENT_ID);
    expect(result.status).toBe("not_ready");
    expect(result.blockingIssues.length).toBeGreaterThan(0);
  });
});

// ─── CRUD ───────────────────────────────────────────────────────────

describe("engagement-db — CRUD", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createClient creates an audit client", async () => {
    mp.auditClient.create.mockResolvedValue({
      id: CLIENT_ID,
      organizationId: ORG_ID,
      name: "New Client",
      registrationNumber: null,
      industry: "technology",
      reportingFramework: "ifrs_for_smes",
      fiscalPeriodEnd: "12-31",
      currencyCode: "SAR",
      status: "active",
      contactEmail: null,
      contactPhone: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
    const result = await createClient({
      organizationId: ORG_ID,
      name: "New Client",
      industry: "technology",
    });
    expect(result.id).toBe(CLIENT_ID);
    expect(result.name).toBe("New Client");
  });

  it("createEngagement creates an engagement with defaults", async () => {
    mp.auditEngagement.create.mockResolvedValue(baseEngagement({ status: "setup" }));
    const result = await createEngagement({
      organizationId: ORG_ID,
      clientId: CLIENT_ID,
      fiscalPeriod: "FY2026",
      engagementType: "audit",
    });
    expect(result.id).toBe(ENGAGEMENT_ID);
    expect(mp.auditEngagement.create).toHaveBeenCalledTimes(1);
  });

  it("updateEngagementPresentationProfile updates profile fields", async () => {
    mp.auditEngagement.update.mockResolvedValue(
      baseEngagement({ presentationProfile: "saudi", presentationProfileVersion: "saudi-v2", presentationPolicyId: "pol-saudi" }),
    );
    const result = await updateEngagementPresentationProfile(ENGAGEMENT_ID, {
      presentationProfile: "saudi",
      presentationProfileVersion: "saudi-v2",
      presentationPolicyId: "pol-saudi",
    });
    expect(result.presentationProfile).toBe("saudi");
    expect(mp.auditEngagement.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ENGAGEMENT_ID },
        data: expect.objectContaining({ presentationProfile: "saudi" }),
      }),
    );
  });

  it("updateEngagementStatus updates status", async () => {
    mp.auditEngagement.update.mockResolvedValue({} as any);
    await updateEngagementStatus(ENGAGEMENT_ID, "under_review");
    expect(mp.auditEngagement.update).toHaveBeenCalledWith({
      where: { id: ENGAGEMENT_ID },
      data: { status: "under_review" },
    });
  });

  it("getCanonicalAccounts returns limited accounts", async () => {
    mp.auditCanonicalAccount.findMany.mockResolvedValue([
      { id: "ca-1", code: "REV-01", name: "Revenue", displayOrder: 1 },
      { id: "ca-2", code: "EXP-01", name: "Expenses", displayOrder: 2 },
    ]);
    const result = await getCanonicalAccounts(10);
    expect(result).toHaveLength(2);
    expect(result[0]!.code).toBe("REV-01");
  });

  it("getCanonicalAccounts returns empty on error", async () => {
    mp.auditCanonicalAccount.findMany.mockRejectedValue(new Error("DB error"));
    const result = await getCanonicalAccounts();
    expect(result).toEqual([]);
  });
});

// ─── Publishing ─────────────────────────────────────────────────────

describe("engagement-db — Publishing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("publishEngagement creates package and updates engagement", async () => {
    mp.auditPublicationPackage.findFirst.mockResolvedValue(null);
    mp.auditPublicationPackage.create.mockResolvedValue({
      id: "pkg-1",
      engagementId: ENGAGEMENT_ID,
      status: "draft",
    });
    mp.auditPublicationPackage.update.mockResolvedValue({
      id: "pkg-1",
      engagementId: ENGAGEMENT_ID,
      status: "published",
      publishedAt: NOW,
      publishedBy: USER_ID,
      lockedAt: NOW,
    });
    mp.auditEngagement.findUnique.mockResolvedValue({ status: "approved" });

    const result = await publishEngagement(ENGAGEMENT_ID, USER_ID, USER_NAME);
    expect(result.package).not.toBeNull();
    expect(mp.auditPublicationPackage.create).toHaveBeenCalled();
    expect(mp.auditPublicationPackage.update).toHaveBeenCalled();
  });

  it("publishEngagement throws when already published", async () => {
    mp.auditPublicationPackage.findFirst.mockResolvedValue({
      id: "pkg-1",
      engagementId: ENGAGEMENT_ID,
      status: "published",
    });
    await expect(
      publishEngagement(ENGAGEMENT_ID, USER_ID, USER_NAME),
    ).rejects.toThrow("already published or locked");
  });
});

// ─── Archiving ──────────────────────────────────────────────────────

describe("engagement-db — Archiving", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("archiveEngagement archives an active engagement", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue({ status: "published" });
    mp.auditEngagement.update.mockResolvedValue({} as any);
        await archiveEngagement(ENGAGEMENT_ID, USER_ID, USER_NAME);
    expect(mp.auditEngagement.update).toHaveBeenCalledWith({
      where: { id: ENGAGEMENT_ID },
      data: { status: "archived" },
    });
  });

  it("archiveEngagement throws when already archived", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue({ status: "archived" });
    await expect(
      archiveEngagement(ENGAGEMENT_ID, USER_ID, USER_NAME),
    ).rejects.toThrow("already archived");
  });

  it("archiveEngagement throws when engagement not found", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue(null);
    await expect(
      archiveEngagement(ENGAGEMENT_ID, USER_ID, USER_NAME),
    ).rejects.toThrow("Engagement not found");
  });

  it("restoreEngagement restores to previous state", async () => {
    mp.auditEngagement.findUnique
      .mockResolvedValueOnce({ status: "archived" }) // first check
      .mockResolvedValueOnce({ status: "published" }); // after update
    mp.platformAuditLog.findFirst.mockResolvedValue({ beforeState: "published" });
    mp.auditEngagement.update.mockResolvedValue({} as any);
        const restoredStatus = await restoreEngagement(ENGAGEMENT_ID, USER_ID, USER_NAME);
    expect(restoredStatus).toBe("published");
    expect(mp.auditEngagement.update).toHaveBeenCalledWith({
      where: { id: ENGAGEMENT_ID },
      data: { status: "published" },
    });
  });

  it("restoreEngagement throws when engagement not archived", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue({ status: "in_progress" });
    await expect(
      restoreEngagement(ENGAGEMENT_ID, USER_ID, USER_NAME),
    ).rejects.toThrow("not archived");
  });

  it("restoreEngagement throws when engagement not found", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue(null);
    await expect(
      restoreEngagement(ENGAGEMENT_ID, USER_ID, USER_NAME),
    ).rejects.toThrow("Engagement not found");
  });
});