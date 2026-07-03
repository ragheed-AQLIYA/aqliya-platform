jest.mock("@/lib/audit/services", () => ({
  recordAuditEvent: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    samplingEvidence: { create: jest.fn(), findMany: jest.fn() },
    samplingPlan: { update: jest.fn(), findUnique: jest.fn() },
    samplingReview: { create: jest.fn(), findMany: jest.fn() },
  },
}));

import { SamplingHardeningEngine } from "../sampling-hardening";
const mockedPrisma = jest.requireMock("@/lib/prisma").prisma;

const engine = new SamplingHardeningEngine();
const ACTOR = { actorId: "user-1", actorName: "Auditor", actorRole: "senior", organizationId: "org-1" };
const NOW = new Date("2026-07-03T12:00:00.000Z");

describe("SamplingHardeningEngine (L6.4)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
    mockedPrisma.samplingEvidence.create.mockResolvedValue({ id: "ev-1", planId: "plan-1", itemIndex: 1, conclusion: "no_error" });
    mockedPrisma.samplingPlan.findUnique.mockResolvedValue({ id: "plan-1", status: "in_progress" });
    mockedPrisma.samplingReview.create.mockResolvedValue({ id: "rev-1", planId: "plan-1", reviewerId: "user-1" });
  });

  afterEach(() => { jest.useRealTimers(); });

  it("records sampling evidence and creates audit trail", async () => {
    const result = await engine.recordEvidence(ACTOR, {
      organizationId: "org-1",
      planId: "plan-1",
      itemIndex: 1,
      conclusion: "no_error",
    });
    expect(result.id).toBe("ev-1");
    expect(mockedPrisma.samplingEvidence.create).toHaveBeenCalled();
  });

  it("submits sampling for review and creates review record", async () => {
    mockedPrisma.samplingReview.create.mockResolvedValue({ id: "rev-1", planId: "plan-1", status: "pending" });

    await engine.submitForReview(ACTOR, { organizationId: "org-1", planId: "plan-1" });
    expect(mockedPrisma.samplingReview.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ planId: "plan-1" }) }),
    );
  });

  it("lists evidence for a sampling plan", async () => {
    mockedPrisma.samplingEvidence.findMany.mockResolvedValue([
      { id: "ev-1", planId: "plan-1", itemIndex: 1, conclusion: "no_error" },
    ]);

    const results = await engine.listEvidence("plan-1");
    expect(results).toHaveLength(1);
    expect(results[0].conclusion).toBe("no_error");
  });
});
