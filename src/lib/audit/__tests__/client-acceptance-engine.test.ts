jest.mock("@/lib/audit/services", () => ({
  recordAuditEvent: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    clientProspect: {
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    kycPackage: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    clientRiskAssessment: {
      create: jest.fn(),
      update: jest.fn(),
    },
    acceptanceDecision: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    continuanceReview: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import { clientAcceptanceEngine } from "../client-acceptance-engine";

const mockedPrisma = jest.requireMock("@/lib/prisma").prisma;

const ACTOR = {
  actorId: "user-1",
  actorName: "Partner One",
  actorRole: "partner",
  organizationId: "org-1",
};

const NOW = new Date("2026-07-03T12:00:00.000Z");

describe("ClientAcceptanceEngine (L6.1)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);

    function mockProspect(status = "new") {
      return {
        id: "prospect-1",
        organizationId: "org-1",
        status,
        companyName: "Test Corp",
        kycPackage: null,
        riskAssessment: null,
        decisions: [],
      };
    }

    mockedPrisma.clientProspect.findUniqueOrThrow.mockImplementation(({ where }: any) =>
      Promise.resolve(mockProspect()),
    );

    mockedPrisma.clientProspect.findUnique.mockImplementation(({ where }: any) =>
      Promise.resolve(mockProspect()),
    );

    mockedPrisma.clientProspect.create.mockResolvedValue(mockProspect());

    mockedPrisma.clientProspect.update.mockImplementation(({ where, data }: any) => {
      // Update the mock state for subsequent calls
      const status = data.status as string ?? "new";
      const updated = mockProspect(status);
      // Make findUniqueOrThrow return the updated status for the next call
      mockedPrisma.clientProspect.findUniqueOrThrow.mockImplementation(() =>
        Promise.resolve(updated),
      );
      return Promise.resolve(updated);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("creates a prospect with new status", async () => {
    const result = await clientAcceptanceEngine.createProspect(ACTOR, {
      organizationId: "org-1",
      companyName: "Test Corp",
      source: "referral",
    });

    expect(result.status).toBe("new");
    expect(result.companyName).toBe("Test Corp");
    expect(mockedPrisma.clientProspect.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org-1",
        companyName: "Test Corp",
        status: "new",
        createdById: "user-1",
      }),
    });
  });

  it("enforces valid status transitions", async () => {
    await expect(
      clientAcceptanceEngine.updateProspect("prospect-1", { status: "accepted" }),
    ).rejects.toThrow("Invalid prospect status transition");
  });

  it("allows valid status transitions", async () => {
    const result = await clientAcceptanceEngine.updateProspect("prospect-1", {
      status: "qualified",
    });

    expect(result.status).toBe("qualified");
  });

  it("creates KYC package and advances prospect to kyc_completed", async () => {
    mockedPrisma.kycPackage.findUnique.mockResolvedValue(null);
    mockedPrisma.kycPackage.create.mockResolvedValue({
      id: "kyc-1",
      prospectId: "prospect-1",
      status: "pending",
    });

    await clientAcceptanceEngine.createOrUpdateKyc(ACTOR, "prospect-1", {
      ownershipStructure: { beneficialOwners: ["Owner A"] },
    });

    expect(mockedPrisma.kycPackage.create).toHaveBeenCalled();
    expect(mockedPrisma.clientProspect.update).toHaveBeenCalledWith({
      where: { id: "prospect-1" },
      data: { status: "kyc_completed" },
    });
  });

  it("creates risk assessment with computed score", async () => {
    // Start from kyc_completed status
    const kycCompletedProspect = {
      id: "prospect-1",
      organizationId: "org-1",
      status: "kyc_completed",
      companyName: "Test Corp",
    };
    mockedPrisma.clientProspect.findUniqueOrThrow.mockResolvedValue(kycCompletedProspect);

    mockedPrisma.clientRiskAssessment.create.mockResolvedValue({
      id: "ra-1",
      prospectId: "prospect-1",
      overallRiskLevel: "medium",
      overallRiskScore: 55,
    });

    const result = await clientAcceptanceEngine.assessRisk(ACTOR, {
      prospectId: "prospect-1",
      assessmentType: "acceptance",
      riskFactors: [
        { name: "industry", weight: 1, score: 60, rationale: "Cyclical industry" },
        { name: "financial", weight: 2, score: 50, rationale: "Moderate liquidity" },
      ],
    });

    expect(result.overallRiskScore).toBe(55);
    expect(result.overallRiskLevel).toBe("medium");
  });

  it("creates acceptance decision and advances prospect to accepted", async () => {
    // Start from risk_completed status
    const riskCompletedProspect = {
      id: "prospect-1",
      organizationId: "org-1",
      status: "risk_completed",
      companyName: "Test Corp",
    };
    mockedPrisma.clientProspect.findUniqueOrThrow.mockResolvedValue(riskCompletedProspect);

    mockedPrisma.acceptanceDecision.create.mockResolvedValue({
      id: "dec-1",
      prospectId: "prospect-1",
      decision: "accept",
      approvedById: "user-1",
    });

    await clientAcceptanceEngine.makeDecision(ACTOR, {
      prospectId: "prospect-1",
      decisionType: "acceptance",
      decision: "accept",
      rationale: "Strong financial position",
    });

    expect(mockedPrisma.acceptanceDecision.create).toHaveBeenCalled();
    expect(mockedPrisma.clientProspect.update).toHaveBeenCalledWith({
      where: { id: "prospect-1" },
      data: { status: "accepted" },
    });
  });

  it("creates and completes continuance review", async () => {
    mockedPrisma.continuanceReview.create.mockResolvedValue({
      id: "cr-1",
      clientId: "client-1",
      reviewYear: 2026,
      status: "pending",
    });

    mockedPrisma.continuanceReview.update.mockResolvedValue({
      id: "cr-1",
      clientId: "client-1",
      status: "completed",
      decision: "continue",
    });

    const created = await clientAcceptanceEngine.createContinuanceReview(ACTOR, {
      organizationId: "org-1",
      clientId: "client-1",
      reviewYear: 2026,
    });

    expect(created.status).toBe("pending");

    const completed = await clientAcceptanceEngine.completeContinuanceReview(
      ACTOR,
      "cr-1",
      "continue",
      "No material changes",
    );

    expect(completed.status).toBe("completed");
  });

  it("returns pipeline summary", async () => {
    mockedPrisma.clientProspect.findMany.mockResolvedValue([
      { id: "p1", status: "new" },
      { id: "p2", status: "new" },
      { id: "p3", status: "kyc_in_progress" },
      { id: "p4", status: "accepted" },
    ]);

    const pipeline = await clientAcceptanceEngine.getPipeline("org-1");

    expect(pipeline.total).toBe(4);
    expect(pipeline.pipeline).toEqual({
      new: 2,
      kyc_in_progress: 1,
      accepted: 1,
    });
    expect(pipeline.recent).toHaveLength(4);
  });
});
