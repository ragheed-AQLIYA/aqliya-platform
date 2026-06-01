// @ts-nocheck
jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn(),
  requireUserContext: jest.fn(),
  isExpectedAccessDeniedError: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    salesAccount: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    salesPipeline: {
      findFirst: jest.fn(),
    },
    salesPipelineStage: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    salesAuditEvent: {
      create: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
    },
  },
}));

import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import {
  createSalesDeal,
  listSalesDeals,
  updateSalesDeal,
} from "../services";
import { SalesAuditActions } from "../audit-events";
import { SalesAccessError, assertSalesDealAccess } from "../guards";
import { getCurrentUser } from "@/lib/auth";

const ORG_A = "org-a";
const ORG_B = "org-b";
const ACTOR = { id: "user-1", name: "Test User" };

describe("SalesOS services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("listSalesDeals scopes by organizationId", async () => {
    prisma.salesDeal.findMany.mockResolvedValue([{ id: "deal-1" }]);

    const result = await listSalesDeals(ORG_A);

    expect(prisma.salesDeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: ORG_A } }),
    );
    expect(result).toHaveLength(1);
  });

  it("createSalesDeal writes audit event on success", async () => {
    prisma.salesAccount.findFirst.mockResolvedValue({
      id: "acct-1",
      platformOrganizationId: "plat-1",
    });
    prisma.salesPipelineStage.findFirst.mockResolvedValue({ id: "stage-1" });
    prisma.salesDeal.create.mockResolvedValue({
      id: "deal-new",
      title: "Test Deal",
      accountId: "acct-1",
      account: { id: "acct-1", name: "Acct" },
      stage: null,
    });
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "audit-1" });

    await createSalesDeal(
      { organizationId: ORG_A, platformOrganizationId: "plat-1" },
      { accountId: "acct-1", title: "Test Deal", stageId: "stage-1" },
      ACTOR,
    );

    expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: SalesAuditActions.DEAL_CREATED,
          targetType: "SalesDeal",
          organizationId: ORG_A,
        }),
      }),
    );
  });

  it("updateSalesDeal emits stage_changed audit when stage changes", async () => {
    prisma.salesDeal.findFirst.mockResolvedValue({
      id: "deal-1",
      title: "Deal",
      status: "open",
      stageId: "stage-old",
      amount: 100,
    });
    prisma.salesPipelineStage.findFirst.mockResolvedValue({ id: "stage-new" });
    prisma.salesDeal.update.mockResolvedValue({
      id: "deal-1",
      title: "Deal",
      accountId: "acct-1",
      stageId: "stage-new",
      account: { id: "acct-1", name: "Acct" },
      stage: { id: "stage-new", name: "Negotiation", slug: "negotiation", sortOrder: 7 },
    });
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "audit-2" });

    await updateSalesDeal(
      "deal-1",
      { organizationId: ORG_A, platformOrganizationId: "plat-1" },
      { stageId: "stage-new" },
      ACTOR,
    );

    expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: SalesAuditActions.DEAL_STAGE_CHANGED,
          metadata: expect.objectContaining({
            fromStageId: "stage-old",
            toStageId: "stage-new",
          }),
        }),
      }),
    );
  });
});

describe("SalesOS guards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.organization.findUnique.mockResolvedValue({
      platformOrganizationId: "plat-1",
    });
  });

  it("assertSalesDealAccess denies cross-org access", async () => {
    getCurrentUser.mockResolvedValue({
      id: "user-1",
      organizationId: ORG_A,
      name: "User",
      email: "u@test.local",
      role: "OPERATOR",
      organization: { id: ORG_A, name: "Org A" },
    });

    prisma.salesDeal.findUnique.mockResolvedValue({
      id: "deal-1",
      organizationId: ORG_B,
      platformOrganizationId: "plat-1",
      accountId: "acct-1",
      stageId: null,
      title: "Foreign Deal",
      status: "open",
    });

    await expect(assertSalesDealAccess("deal-1")).rejects.toBeInstanceOf(
      SalesAccessError,
    );
  });

  it("assertSalesDealAccess allows same-org access", async () => {
    getCurrentUser.mockResolvedValue({
      id: "user-1",
      organizationId: ORG_A,
      name: "User",
      email: "u@test.local",
      role: "OPERATOR",
      organization: { id: ORG_A, name: "Org A" },
    });

    prisma.salesDeal.findUnique.mockResolvedValue({
      id: "deal-1",
      organizationId: ORG_A,
      platformOrganizationId: "plat-1",
      accountId: "acct-1",
      stageId: null,
      title: "My Deal",
      status: "open",
    });

    const result = await assertSalesDealAccess("deal-1");
    expect(result.deal.id).toBe("deal-1");
  });
});
