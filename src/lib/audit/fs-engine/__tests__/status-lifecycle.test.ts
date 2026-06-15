import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditFinancialStatement: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    auditEvent: {
      create: jest.fn(),
    },
  },
}));

import {
  canTransitionFsStatus,
  transitionFinancialStatementStatus,
  markAllFinancialStatementsReviewed,
  approveAllFinancialStatementsForEngagement,
} from "@/lib/audit/fs-engine/status-lifecycle";

describe("canTransitionFsStatus", () => {
  it("allows draft→reviewed only", () => {
    expect(canTransitionFsStatus("draft", "reviewed")).toBe(true);
    expect(canTransitionFsStatus("draft", "approved")).toBe(false);
    expect(canTransitionFsStatus("reviewed", "approved")).toBe(true);
    expect(canTransitionFsStatus("reviewed", "draft")).toBe(false);
    expect(canTransitionFsStatus("approved", "draft")).toBe(false);
    expect(canTransitionFsStatus("approved", "reviewed")).toBe(false);
  });
});

describe("transitionFinancialStatementStatus", () => {
  const mockedPrisma = jest.mocked(prisma);

  beforeEach(() => {
    mockedPrisma.auditFinancialStatement.findFirst.mockReset();
    mockedPrisma.auditFinancialStatement.update.mockReset();
    mockedPrisma.auditEvent.create.mockReset();
  });

  it("throws when statement not found", async () => {
    mockedPrisma.auditFinancialStatement.findFirst.mockResolvedValue(null);

    await expect(
      transitionFinancialStatementStatus({
        engagementId: "e1",
        statementId: "s-nonexistent",
        toStatus: "reviewed",
        actorId: "user-1",
        actorName: "Test User",
      }),
    ).rejects.toThrow("Financial statement not found");
  });

  it("throws on invalid transition", async () => {
    mockedPrisma.auditFinancialStatement.findFirst.mockResolvedValue({
      id: "s-1",
      engagementId: "e1",
      statementType: "balance_sheet",
      status: "draft",
    } as any);

    await expect(
      transitionFinancialStatementStatus({
        engagementId: "e1",
        statementId: "s-1",
        toStatus: "approved",
        actorId: "user-1",
        actorName: "Test User",
      }),
    ).rejects.toThrow("Invalid FS status transition: draft → approved");
  });

  it("transitions draft→reviewed and creates audit event", async () => {
    mockedPrisma.auditFinancialStatement.findFirst.mockResolvedValue({
      id: "s-1",
      engagementId: "e1",
      statementType: "income_statement",
      status: "draft",
    } as any);
    mockedPrisma.auditFinancialStatement.update.mockResolvedValue({} as any);
    mockedPrisma.auditEvent.create.mockResolvedValue({} as any);

    await transitionFinancialStatementStatus({
      engagementId: "e1",
      statementId: "s-1",
      toStatus: "reviewed",
      actorId: "user-1",
      actorName: "Test User",
    });

    expect(mockedPrisma.auditFinancialStatement.update).toHaveBeenCalledWith({
      where: { id: "s-1" },
      data: { status: "reviewed" },
    });
    expect(mockedPrisma.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventType: "financial_statement.status_changed",
        actorId: "user-1",
        previousState: "draft",
        newState: "reviewed",
      }),
    });
  });
});

describe("markAllFinancialStatementsReviewed", () => {
  const mockedPrisma = jest.mocked(prisma);

  beforeEach(() => {
    mockedPrisma.auditFinancialStatement.findMany.mockReset();
    mockedPrisma.auditFinancialStatement.findFirst.mockReset();
    mockedPrisma.auditFinancialStatement.update.mockReset();
    mockedPrisma.auditEvent.create.mockReset();
  });

  it("returns 0 when no drafts exist", async () => {
    mockedPrisma.auditFinancialStatement.findMany.mockResolvedValue([]);

    const count = await markAllFinancialStatementsReviewed({
      engagementId: "e1",
      actorId: "user-1",
      actorName: "Test User",
    });

    expect(count).toBe(0);
  });

  it("marks all drafts as reviewed and returns count", async () => {
    mockedPrisma.auditFinancialStatement.findMany.mockResolvedValue([
      { id: "s-1", engagementId: "e1", statementType: "balance_sheet", status: "draft" },
      { id: "s-2", engagementId: "e1", statementType: "income_statement", status: "draft" },
    ] as any);
    mockedPrisma.auditFinancialStatement.findFirst.mockResolvedValue({
      id: "s-1",
      engagementId: "e1",
      statementType: "balance_sheet",
      status: "draft",
    } as any);
    mockedPrisma.auditFinancialStatement.update.mockResolvedValue({} as any);
    mockedPrisma.auditEvent.create.mockResolvedValue({} as any);

    const count = await markAllFinancialStatementsReviewed({
      engagementId: "e1",
      actorId: "user-1",
      actorName: "Test User",
    });

    expect(count).toBe(2);
    // Called once per statement + once per transition
    expect(mockedPrisma.auditFinancialStatement.update).toHaveBeenCalledTimes(2);
    expect(mockedPrisma.auditEvent.create).toHaveBeenCalledTimes(2);
  });
});

describe("approveAllFinancialStatementsForEngagement", () => {
  const mockedPrisma = jest.mocked(prisma);

  beforeEach(() => {
    mockedPrisma.auditFinancialStatement.findMany.mockReset();
    mockedPrisma.auditFinancialStatement.findFirst.mockReset();
    mockedPrisma.auditFinancialStatement.update.mockReset();
    mockedPrisma.auditEvent.create.mockReset();
  });

  it("returns 0 when no pending statements", async () => {
    mockedPrisma.auditFinancialStatement.findMany.mockResolvedValue([]);

    const count = await approveAllFinancialStatementsForEngagement("e1", "user-1", "Admin");

    expect(count).toBe(0);
  });

  it("approves already-reviewed statements directly", async () => {
    mockedPrisma.auditFinancialStatement.findMany.mockResolvedValue([
      { id: "s-1", engagementId: "e1", statementType: "balance_sheet", status: "reviewed" },
    ] as any);
    mockedPrisma.auditFinancialStatement.findFirst.mockResolvedValue({
      id: "s-1",
      engagementId: "e1",
      statementType: "balance_sheet",
      status: "reviewed",
    } as any);
    mockedPrisma.auditFinancialStatement.update.mockResolvedValue({} as any);
    mockedPrisma.auditEvent.create.mockResolvedValue({} as any);

    const count = await approveAllFinancialStatementsForEngagement("e1", "user-1", "Admin");

    expect(count).toBe(1);
    // 1 transition: reviewed→approved (no draft→reviewed because already reviewed)
    expect(mockedPrisma.auditFinancialStatement.update).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.auditEvent.create).toHaveBeenCalledTimes(1);
  });

  it("promotes drafts through reviewed→approved pipeline", async () => {
    // First findMany returns draft, then transition needs findFirst → draft → reviewed → approved
    mockedPrisma.auditFinancialStatement.findMany.mockResolvedValue([
      { id: "s-1", engagementId: "e1", statementType: "balance_sheet", status: "draft" },
    ] as any);
    // findFirst returns draft first, then reviewed (after DB update)
    mockedPrisma.auditFinancialStatement.findFirst
      .mockResolvedValueOnce({ id: "s-1", engagementId: "e1", statementType: "balance_sheet", status: "draft" } as any)
      .mockResolvedValueOnce({ id: "s-1", engagementId: "e1", statementType: "balance_sheet", status: "reviewed" } as any);
    mockedPrisma.auditFinancialStatement.update.mockResolvedValue({} as any);
    mockedPrisma.auditEvent.create.mockResolvedValue({} as any);

    const count = await approveAllFinancialStatementsForEngagement("e1", "user-1", "Admin");

    expect(count).toBe(1);
    // 2 transitions: draft→reviewed + reviewed→approved = 2 updates + 2 creates
    expect(mockedPrisma.auditFinancialStatement.update).toHaveBeenCalledTimes(2);
    expect(mockedPrisma.auditEvent.create).toHaveBeenCalledTimes(2);
  });
});
