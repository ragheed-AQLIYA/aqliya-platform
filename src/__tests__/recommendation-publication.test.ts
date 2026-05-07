import { prisma } from "@/lib/prisma"
import {
  getDecisionRecommendation,
  getPublishedRecommendationViewAction,
  publishRecommendationAction,
  unpublishRecommendationAction,
} from "@/actions/decisions"

// Mock auth module
jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn(),
  requireUserContext: jest.fn(),
  requireOrgAccess: jest.fn(),
  requireDecisionAccess: jest.fn().mockImplementation(async (decisionId, role) => {
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: { organizationId: true }
    })
    const user = await getCurrentUser()
    return { user, organizationId: decision?.organizationId || user.organizationId }
  }),
  isExpectedAccessDeniedError: () => false,
}))

const { getCurrentUser } = require("@/lib/auth")

// Mock auditLog.create to avoid foreign key issues
jest.mock("@/lib/prisma", () => {
  const actual = jest.requireActual("@/lib/prisma")
  return {
    prisma: {
      ...actual.prisma,
      auditLog: {
        ...actual.prisma.auditLog,
        create: jest.fn().mockResolvedValue({}),
      },
    }
  }
})

async function cleanup() {
  await prisma.auditLog.deleteMany()
  await prisma.decisionRiskAlert.deleteMany()
  await prisma.decisionMonitoringSignal.deleteMany()
  await prisma.decisionPattern.deleteMany()
  await prisma.decisionReport.deleteMany()
  await prisma.decisionRiskAnalysis.deleteMany()
  await prisma.decisionScenario.deleteMany()
  await prisma.decisionFramework.deleteMany()
  await prisma.simulationResult.deleteMany()
  await prisma.scenario.deleteMany()
  await prisma.tenderProfile.deleteMany()
  await prisma.approval.deleteMany()
  await prisma.recommendation.deleteMany()
  await prisma.objective.deleteMany()
  await prisma.constraint.deleteMany()
  await prisma.assumption.deleteMany()
  await prisma.alternative.deleteMany()
  await prisma.risk.deleteMany()
  await prisma.sectorPattern.deleteMany()
  await prisma.decision.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()
}

describe("Recommendation Publication", () => {
  beforeEach(async () => {
    await cleanup()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await cleanup()
  })

  it("returns error when recommendation not published", async () => {
    const org = await prisma.organization.create({ data: { name: "Test Org" } })
    const user = await prisma.user.create({
      data: {
        email: "viewer@test.local",
        name: "Viewer",
        role: "VIEWER",
        organizationId: org.id,
      },
    })

    const decision = await prisma.decision.create({
      data: {
        title: "Unpublished Decision",
        type: "TENDER",
        ownerId: user.id,
        organizationId: org.id,
        status: "DRAFT",
      },
    })

    ;(getCurrentUser as jest.Mock).mockResolvedValue({
      id: user.id,
      role: "VIEWER",
      organizationId: org.id,
    })

    const result = await getPublishedRecommendationViewAction(decision.id)
    expect(result.success).toBe(false)
  })

  it("returns published recommendation for viewer in same org", async () => {
    const org = await prisma.organization.create({ data: { name: "Test Org" } })
    const user = await prisma.user.create({
      data: {
        email: "viewer@test.local",
        name: "Viewer",
        role: "VIEWER",
        organizationId: org.id,
      },
    })

    const decision = await prisma.decision.create({
      data: {
        title: "Published Decision",
        type: "TENDER",
        ownerId: user.id,
        organizationId: org.id,
        status: "APPROVED",
      },
    })

    await prisma.recommendation.create({
      data: {
        decisionId: decision.id,
        recommendedAction: "Go ahead",
        rationale: "All clear",
        expectedNextState: "Success",
        scopeExclusions: "",
        assumptionsUsed: "",
        risksAccepted: "",
        risksRejected: "",
        isClientVisible: true,
        publishedAt: new Date(),
        publishedVersion: 1,
      },
    })

    ;(getCurrentUser as jest.Mock).mockResolvedValue({
      id: user.id,
      role: "VIEWER",
      organizationId: org.id,
    })

    const result = await getPublishedRecommendationViewAction(decision.id)
    expect(result.success).toBe(true)
    expect(result.data?.title).toBe("Published Decision")
  })

  it("publishRecommendationAction sets publishedAt and version", async () => {
    const org = await prisma.organization.create({ data: { name: "Test Org" } })
    const operator = await prisma.user.create({
      data: {
        email: "op@test.local",
        name: "Operator",
        role: "OPERATOR",
        organizationId: org.id,
      },
    })

    const decision = await prisma.decision.create({
      data: {
        title: "To Publish",
        type: "TENDER",
        ownerId: operator.id,
        organizationId: org.id,
        status: "APPROVED",
      },
    })

    await prisma.recommendation.create({
      data: {
        decisionId: decision.id,
        recommendedAction: "Proceed",
        rationale: "OK",
        expectedNextState: "Done",
        scopeExclusions: "",
        assumptionsUsed: "",
        risksAccepted: "",
        risksRejected: "",
      },
    })

    ;(getCurrentUser as jest.Mock).mockResolvedValue({
      id: operator.id,
      role: "OPERATOR",
      organizationId: org.id,
    })

    const publishResult = await publishRecommendationAction(decision.id)
    expect(publishResult.success).toBe(true)

    const viewResult = await getPublishedRecommendationViewAction(decision.id)
    expect(viewResult.success).toBe(true)
    expect(viewResult.data?.recommendation.publishedVersion).toBe(2)
  })

  it("unpublishRecommendationAction clears publishedAt", async () => {
    const org = await prisma.organization.create({ data: { name: "Test Org" } })
    const operator = await prisma.user.create({
      data: {
        email: "op@test.local",
        name: "Operator",
        role: "OPERATOR",
        organizationId: org.id,
      },
    })

    const decision = await prisma.decision.create({
      data: {
        title: "To Unpublish",
        type: "TENDER",
        ownerId: operator.id,
        organizationId: org.id,
        status: "APPROVED",
      },
    })

    await prisma.recommendation.create({
      data: {
        decisionId: decision.id,
        recommendedAction: "Go",
        rationale: "Yes",
        expectedNextState: "Done",
        scopeExclusions: "",
        assumptionsUsed: "",
        risksAccepted: "",
        risksRejected: "",
        isClientVisible: true,
        publishedAt: new Date(),
        publishedVersion: 1,
      },
    })

    ;(getCurrentUser as jest.Mock).mockResolvedValue({
      id: operator.id,
      role: "OPERATOR",
      organizationId: org.id,
    })

    await unpublishRecommendationAction(decision.id)
    const result = await getPublishedRecommendationViewAction(decision.id)
    expect(result.success).toBe(false)
  })
})
