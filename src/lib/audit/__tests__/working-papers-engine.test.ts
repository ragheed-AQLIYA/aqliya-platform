jest.mock("@/lib/prisma", () => ({
  prisma: {
    workingPaperIndex: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    leadSchedule: {
      create: jest.fn(),
      update: jest.fn(),
    },
    analyticalReviewPaper: { create: jest.fn(), update: jest.fn() },
    controlTestingPaper: { create: jest.fn(), update: jest.fn() },
    substantiveTestingPaper: { create: jest.fn(), update: jest.fn() },
    completionPaper: { create: jest.fn(), update: jest.fn() },
  },
}));

jest.mock("@/lib/audit/tenant-guard", () => ({
  assertEngagementAccess: jest.fn(),
}));

jest.mock("@/lib/audit/services", () => ({
  recordAuditEvent: jest.fn().mockResolvedValue(undefined),
}));

import { workingPapersEngine } from "../working-papers-engine";
const mockedPrisma = jest.requireMock("@/lib/prisma").prisma;

const ACTOR = { actorId: "user-1", actorName: "Auditor", actorRole: "manager", organizationId: "org-1" };
const NOW = new Date("2026-07-03T12:00:00.000Z");

function mockPaper(overrides: Record<string, unknown> = {}) {
  return {
    id: "wp-1",
    engagementId: "eng-1",
    indexType: "lead_schedule",
    paperNumber: "LS-100",
    paperTitle: "Cash and Cash Equivalents",
    status: "draft",
    methodologyRef: null,
    conclusion: null,
    preparerId: "user-1",
    reviewerId: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

describe("WorkingPapersEngine (L6.5)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
    mockedPrisma.workingPaperIndex.create.mockResolvedValue(mockPaper());
    mockedPrisma.workingPaperIndex.findUnique.mockResolvedValue(mockPaper());
    mockedPrisma.workingPaperIndex.findMany.mockResolvedValue([mockPaper()]);
    mockedPrisma.workingPaperIndex.update.mockResolvedValue(mockPaper({ status: "reviewed" }));
    mockedPrisma.leadSchedule.create.mockResolvedValue({ id: "ls-1", workingPaperIndexId: "wp-1", accountCode: "1000", accountName: "Cash" });
  });

  afterEach(() => { jest.useRealTimers(); });

  it("creates a working paper index entry", async () => {
    const result = await workingPapersEngine.createPaper(ACTOR, {
      engagementId: "eng-1",
      indexType: "lead_schedule",
      paperNumber: "LS-100",
      paperTitle: "Cash and Cash Equivalents",
    });

    expect(result.paperNumber).toBe("LS-100");
    expect(mockedPrisma.workingPaperIndex.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ engagementId: "eng-1", paperNumber: "LS-100" }),
      }),
    );
  });

  it("lists papers by engagement with optional type filter", async () => {
    await workingPapersEngine.listPapers("eng-1");
    expect(mockedPrisma.workingPaperIndex.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ engagementId: "eng-1" }),
      }),
    );
  });

  it("updates paper status", async () => {
    await workingPapersEngine.updatePaperStatus(ACTOR, "wp-1", "reviewed");
    expect(mockedPrisma.workingPaperIndex.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "wp-1" },
        data: expect.objectContaining({ status: "reviewed" }),
      }),
    );
  });

  it("creates a lead schedule linked to a paper", async () => {
    const result = await workingPapersEngine.createLeadSchedule(ACTOR, {
      engagementId: "eng-1",
      workingPaperIndexId: "wp-1",
      accountCode: "1000",
      accountName: "Cash",
      priorYearBalance: 100000,
      currentYearBalance: 150000,
    });

    expect(result.accountCode).toBe("1000");
    expect(mockedPrisma.leadSchedule.create).toHaveBeenCalled();
  });
});
