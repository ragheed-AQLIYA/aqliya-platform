import { prisma } from "@/lib/prisma";
import { getDecisionById } from "@/actions/decisions";

// Mock auth module with proper access control
jest.mock("@/lib/auth", () => {
  const mockGetCurrentUser = jest.fn();
  const requireDecisionAccess = jest
    .fn()
    .mockImplementation(async (decisionId: string) => {
      const user = await mockGetCurrentUser();
      const { prisma: db } = jest.requireActual("@/lib/prisma");
      const decision = await db.decision.findUnique({
        where: { id: decisionId },
        select: { organizationId: true },
      });
      if (!decision || user.organizationId !== decision.organizationId) {
        throw new Error("Access denied");
      }
      return { user, organizationId: user.organizationId };
    });

  return {
    getCurrentUser: mockGetCurrentUser,
    requireUserContext: jest.fn(),
    requireOrgAccess: jest.fn(),
    requireDecisionAccess,
    isExpectedAccessDeniedError: (error: Error) =>
      error?.message === "Access denied",
  };
});

import { getCurrentUser } from "@/lib/auth";

async function cleanup() {
  await prisma.auditLog.deleteMany();
  await prisma.decisionRiskAlert.deleteMany();
  await prisma.decisionMonitoringSignal.deleteMany();
  await prisma.decisionPattern.deleteMany();
  await prisma.decisionReport.deleteMany();
  await prisma.decisionRiskAnalysis.deleteMany();
  await prisma.decisionScenario.deleteMany();
  await prisma.decisionFramework.deleteMany();
  await prisma.simulationResult.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.tenderProfile.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.constraint.deleteMany();
  await prisma.assumption.deleteMany();
  await prisma.alternative.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.sectorPattern.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

describe("Organization Scoping", () => {
  beforeEach(async () => {
    await cleanup();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanup();
  });

  it("user cannot access another organization's decision", async () => {
    const ownOrg = await prisma.organization.create({
      data: { name: "Own Org" },
    });
    const otherOrg = await prisma.organization.create({
      data: { name: "Other Org" },
    });

    const operator = await prisma.user.create({
      data: {
        email: "operator@own-org.local",
        name: "Own Operator",
        role: "OPERATOR",
        organizationId: ownOrg.id,
      },
    });

    const otherUser = await prisma.user.create({
      data: {
        email: "viewer@other-org.local",
        name: "Other Viewer",
        role: "VIEWER",
        organizationId: otherOrg.id,
      },
    });

    const decision = await prisma.decision.create({
      data: {
        title: "Own Decision",
        type: "TENDER",
        ownerId: operator.id,
        organizationId: ownOrg.id,
        status: "DRAFT",
      },
    });

    // Mock requireDecisionAccess to throw for other user
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: otherUser.id,
      role: "VIEWER",
      organizationId: otherOrg.id,
    });

    const result = await getDecisionById(decision.id);
    expect(result.success).toBe(false);
  });

  it("operator can access decision in own organization", async () => {
    const org = await prisma.organization.create({
      data: { name: "Test Org" },
    });

    const operator = await prisma.user.create({
      data: {
        email: "operator@test.local",
        name: "Operator",
        role: "OPERATOR",
        organizationId: org.id,
      },
    });

    const decision = await prisma.decision.create({
      data: {
        title: "Test Decision",
        type: "TENDER",
        ownerId: operator.id,
        organizationId: org.id,
        status: "DRAFT",
      },
    });

    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: operator.id,
      role: "OPERATOR",
      organizationId: org.id,
    });

    const result = await getDecisionById(decision.id);
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe(decision.id);
  });

  it("viewer can access published decision in own organization", async () => {
    const org = await prisma.organization.create({
      data: { name: "Test Org" },
    });

    const viewer = await prisma.user.create({
      data: {
        email: "viewer@test.local",
        name: "Viewer",
        role: "VIEWER",
        organizationId: org.id,
      },
    });

    const operator = await prisma.user.create({
      data: {
        email: "op@test.local",
        name: "Operator",
        role: "OPERATOR",
        organizationId: org.id,
      },
    });

    const decision = await prisma.decision.create({
      data: {
        title: "Published Decision",
        type: "TENDER",
        ownerId: operator.id,
        organizationId: org.id,
        status: "APPROVED",
      },
    });

    await prisma.recommendation.create({
      data: {
        decisionId: decision.id,
        recommendedAction: "Go",
        rationale: "OK",
        expectedNextState: "Done",
        scopeExclusions: "",
        assumptionsUsed: "",
        risksAccepted: "",
        risksRejected: "",
        publishedAt: new Date(),
        publishedVersion: 1,
      },
    });
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: viewer.id,
      role: "VIEWER",
      organizationId: org.id,
    });

    const result = await getDecisionById(decision.id);
    expect(result.success).toBe(true);
  });
});
