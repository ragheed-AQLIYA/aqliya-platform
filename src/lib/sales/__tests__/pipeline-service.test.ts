// --- Unit Test: SalesOS Pipeline Service ---
// Tests pipeline stage transitions, stage governance rules,
// deal creation/update validation, and Prisma service layer.
// Uses mocked Prisma - no database required.

// --- Mocks (hoisted before imports) ---

const mockSalesDealFindFirst = jest.fn();
const mockSalesDealCreate = jest.fn();
const mockSalesDealUpdate = jest.fn();
const mockSalesDealFindMany = jest.fn();
const mockSalesDealCount = jest.fn();
const mockSalesAccountFindFirst = jest.fn();
const mockSalesAccountFindMany = jest.fn();
const mockSalesPipelineFindFirst = jest.fn();
const mockSalesPipelineStageFindFirst = jest.fn();
const mockSalesPipelineStageFindMany = jest.fn();
const mockSalesAuditEventCreate = jest.fn();
const mockSalesEvidenceLinkCount = jest.fn();
const mockSalesDealGroupBy = jest.fn().mockResolvedValue([]);

jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: {
      findFirst: mockSalesDealFindFirst,
      create: mockSalesDealCreate,
      update: mockSalesDealUpdate,
      findMany: mockSalesDealFindMany,
      count: mockSalesDealCount,
      groupBy: mockSalesDealGroupBy,
    },
    salesAccount: {
      findFirst: mockSalesAccountFindFirst,
      findMany: mockSalesAccountFindMany,
    },
    salesPipeline: {
      findFirst: mockSalesPipelineFindFirst,
    },
    salesPipelineStage: {
      findFirst: mockSalesPipelineStageFindFirst,
      findMany: mockSalesPipelineStageFindMany,
    },
    salesAuditEvent: {
      create: mockSalesAuditEventCreate,
    },
    salesEvidenceLink: {
      count: mockSalesEvidenceLinkCount,
    },
  },
}));

jest.mock("@/lib/platform/audit-logger", () => ({
  auditLogger: jest.fn(() => ({
    record: jest.fn().mockResolvedValue({ ok: true }),
  })),
  Product: { SALES_OS: "sales_os" },
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true, id: "audit-plat-1" }),
}));

jest.mock("@/lib/platform/audit/audit-store", () => ({
  appendToAuditChain: jest.fn().mockResolvedValue(undefined),
}));

import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import {
  validateCreateSalesDealInput,
  validateUpdateSalesDealInput,
  validateDealStatus,
  SalesValidationError,
} from "../validation";
import {
  requiresApprovalForStageChange,
  normalizeStageSlug,
  assertStageChangeGovernance,
} from "../governance";
import { createSalesDeal, updateSalesDeal } from "../services";
import { SalesAuditActions } from "../audit-events";

const ORG_ID = "org-pipeline-test";
const ACTOR = {
  id: "user-pipeline-001",
  name: "Pipeline Tester",
  platformOrganizationId: "plat-org-test",
};

function mockValidAccount() {
  mockSalesAccountFindFirst.mockResolvedValue({
    id: "acct-pipeline",
    platformOrganizationId: "plat-org-test",
  });
}

function mockValidStage(stageId = "stage-disco") {
  mockSalesPipelineStageFindFirst.mockResolvedValue({
    id: stageId,
    name: "Discovery",
    slug: "discovery",
  });
}

function mockDealResponse(overrides = {}) {
  return {
    id: "deal-1",
    title: "Test Deal",
    accountId: "acct-pipeline",
    account: { id: "acct-pipeline", name: "Acct" },
    stage: null,
    status: "open",
    amount: null,
    currency: "SAR",
    probability: null,
    expectedCloseDate: null,
    isDemo: false,
    metadata: null,
    stageId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSalesAuditEventCreate.mockResolvedValue({ id: "audit-n" });
});


describe("validateCreateSalesDealInput", () => {
  it("accepts valid minimal input with title and accountId", () => {
    const result = validateCreateSalesDealInput({ title: "Deal 1", accountId: "acct-1" });
    expect(result.title).toBe("Deal 1");
    expect(result.accountId).toBe("acct-1");
    expect(result.currency).toBe("SAR");
  });

  it("rejects empty title", () => {
    expect(() => validateCreateSalesDealInput({ title: "", accountId: "acct-1" }))
      .toThrow(SalesValidationError);
    expect(() => validateCreateSalesDealInput({ title: "   ", accountId: "acct-1" }))
      .toThrow(SalesValidationError);
  });

  it("rejects missing accountId", () => {
    expect(() => validateCreateSalesDealInput({ title: "Deal", accountId: "" }))
      .toThrow(SalesValidationError);
  });

  it("rejects negative amount", () => {
    expect(() => validateCreateSalesDealInput({ title: "Deal", accountId: "acct-1", amount: -500 }))
      .toThrow("amount must be a non-negative number");
  });

  it("rejects NaN amount", () => {
    expect(() => validateCreateSalesDealInput({ title: "Deal", accountId: "acct-1", amount: NaN }))
      .toThrow("amount must be a non-negative number");
  });

  it("accepts zero amount", () => {
    const result = validateCreateSalesDealInput({ title: "Free", accountId: "acct-1", amount: 0 });
    expect(result.amount).toBe(0);
  });

  it("rejects probability below 0", () => {
    expect(() => validateCreateSalesDealInput({ title: "Deal", accountId: "acct-1", probability: -5 }))
      .toThrow("probability must be between 0 and 100");
  });

  it("rejects probability above 100", () => {
    expect(() => validateCreateSalesDealInput({ title: "Deal", accountId: "acct-1", probability: 150 }))
      .toThrow("probability must be between 0 and 100");
  });

  it("accepts valid probability 0-100", () => {
    const result = validateCreateSalesDealInput({ title: "Deal", accountId: "acct-1", probability: 75 });
    expect(result.probability).toBe(75);
  });

  it("rejects invalid deal status", () => {
    expect(() => validateCreateSalesDealInput({ title: "Deal", accountId: "acct-1", status: "invalid-status" }))
      .toThrow("status must be one of: open, won, lost, archived");
  });

  it("accepts valid statuses open/won/lost/archived", () => {
    ["open", "won", "lost", "archived"].forEach((status) => {
      const result = validateCreateSalesDealInput({ title: "Deal", accountId: "acct-1", status });
      expect(result.status).toBe(status);
    });
  });

  it("defaults currency to SAR", () => {
    const result = validateCreateSalesDealInput({ title: "Deal", accountId: "acct-1" });
    expect(result.currency).toBe("SAR");
  });

  it("preserves custom currency", () => {
    const result = validateCreateSalesDealInput({ title: "Deal", accountId: "acct-1", currency: "USD" });
    expect(result.currency).toBe("USD");
  });
});

describe("validateUpdateSalesDealInput", () => {
  it("accepts empty update", () => {
    const result = validateUpdateSalesDealInput({});
    expect(result).toEqual({ governanceOverrideReason: undefined });
  });

  it("rejects empty title in update", () => {
    expect(() => validateUpdateSalesDealInput({ title: "" })).toThrow(SalesValidationError);
  });

  it("accepts valid title update", () => {
    const result = validateUpdateSalesDealInput({ title: "Updated" });
    expect(result.title).toBe("Updated");
  });

  it("rejects negative amount in update", () => {
    expect(() => validateUpdateSalesDealInput({ amount: -1 }))
      .toThrow("amount must be a non-negative number");
  });

  it("rejects invalid probability in update", () => {
    expect(() => validateUpdateSalesDealInput({ probability: 101 }))
      .toThrow("probability must be between 0 and 100");
  });

  it("trims governance override reason", () => {
    const result = validateUpdateSalesDealInput({ governanceOverrideReason: "  reason  " });
    expect(result.governanceOverrideReason).toBe("reason");
  });

  it("returns undefined for whitespace-only override reason", () => {
    const result = validateUpdateSalesDealInput({ governanceOverrideReason: "   " });
    expect(result.governanceOverrideReason).toBeUndefined();
  });
});

describe("validateDealStatus", () => {
  it("accepts open/won/lost/archived", () => {
    expect(() => validateDealStatus("open")).not.toThrow();
    expect(() => validateDealStatus("won")).not.toThrow();
    expect(() => validateDealStatus("lost")).not.toThrow();
    expect(() => validateDealStatus("archived")).not.toThrow();
  });

  it("rejects unknown statuses", () => {
    expect(() => validateDealStatus("pending")).toThrow("status must be one of: open, won, lost, archived");
    expect(() => validateDealStatus("")).toThrow("status must be one of: open, won, lost, archived");
    expect(() => validateDealStatus("draft")).toThrow();
  });
});


describe("pipeline stage governance - normalizeStageSlug", () => {
  it("lowercases and trims stage slug", () => {
    expect(normalizeStageSlug("  Proposal ")).toBe("proposal");
    expect(normalizeStageSlug("PILOT")).toBe("pilot");
    expect(normalizeStageSlug("Closed_Won")).toBe("closed_won");
  });
});

describe("pipeline stage governance - requiresApprovalForStageChange", () => {
  it("returns true for proposal stage", () => {
    expect(requiresApprovalForStageChange("proposal")).toBe(true);
  });

  it("returns true for pilot stage", () => {
    expect(requiresApprovalForStageChange("pilot")).toBe(true);
  });

  it("returns true for stages containing won", () => {
    expect(requiresApprovalForStageChange("closed_won")).toBe(true);
  });

  it("returns false for discovery stage", () => {
    expect(requiresApprovalForStageChange("discovery")).toBe(false);
  });

  it("returns false for negotiation stage", () => {
    expect(requiresApprovalForStageChange("negotiation")).toBe(false);
  });

  it("returns false for new/qualified stages", () => {
    expect(requiresApprovalForStageChange("new")).toBe(false);
    expect(requiresApprovalForStageChange("qualified")).toBe(false);
  });

  it("returns false for null or undefined slug", () => {
    expect(requiresApprovalForStageChange(null)).toBe(false);
    expect(requiresApprovalForStageChange(undefined)).toBe(false);
  });
});

describe("pipeline stage governance - assertStageChangeGovernance", () => {
  it("allows non-governed stage without evidence or override", () => {
    const result = assertStageChangeGovernance({
      dealId: "deal-1", toStageSlug: "discovery", evidenceLinkCount: 0,
    });
    expect(result.usedOverride).toBe(false);
  });

  it("allows governed stage when evidence is linked", () => {
    const result = assertStageChangeGovernance({
      dealId: "deal-2", toStageSlug: "proposal", evidenceLinkCount: 3,
    });
    expect(result.usedOverride).toBe(false);
  });

  it("allows governed stage with OPERATOR override reason", () => {
    const result = assertStageChangeGovernance({
      dealId: "deal-3", toStageSlug: "pilot", evidenceLinkCount: 0,
      governanceOverrideReason: "Management override for strategic deal",
      actorRole: "OPERATOR",
    });
    expect(result.usedOverride).toBe(true);
    expect(result.overrideReason).toBe("Management override for strategic deal");
  });

  it("allows governed stage with ADMIN override reason", () => {
    const result = assertStageChangeGovernance({
      dealId: "deal-4", toStageSlug: "closed_won", evidenceLinkCount: 0,
      governanceOverrideReason: "Executive sign-off", actorRole: "ADMIN",
    });
    expect(result.usedOverride).toBe(true);
  });

  it("blocks governed stage without evidence or override", () => {
    expect(() => assertStageChangeGovernance({
      dealId: "deal-5", toStageSlug: "proposal", evidenceLinkCount: 0,
    })).toThrow("SalesOS governance: moving to proposal/pilot/won requires at least one linked evidence");
  });

  it("blocks governed stage with VIEWER role override", () => {
    expect(() => assertStageChangeGovernance({
      dealId: "deal-6", toStageSlug: "pilot", evidenceLinkCount: 0,
      governanceOverrideReason: "I want to push this through", actorRole: "VIEWER",
    })).toThrow("SalesOS governance: moving to proposal/pilot/won requires at least one linked evidence");
  });

  it("blocks governed stage with empty override reason", () => {
    expect(() => assertStageChangeGovernance({
      dealId: "deal-7", toStageSlug: "pilot", evidenceLinkCount: 0,
      governanceOverrideReason: "   ", actorRole: "OPERATOR",
    })).toThrow("SalesOS governance: moving to proposal/pilot/won requires at least one linked evidence");
  });
});


describe("createSalesDeal (Prisma service)", () => {
  beforeEach(() => {
    mockSalesAccountFindFirst.mockReset();
    mockSalesPipelineStageFindFirst.mockReset();
    mockSalesDealCreate.mockReset();
  });

  it("creates deal with valid input and writes audit event", async () => {
    mockValidAccount();
    mockSalesDealCreate.mockResolvedValue(mockDealResponse({ title: "New Deal", amount: 50000 }));

    const deal = await createSalesDeal(ORG_ID, {
      title: "New Deal", accountId: "acct-pipeline", amount: 50000,
    }, ACTOR);

    expect(deal.title).toBe("New Deal");
    expect(deal.status).toBe("open");
    expect(mockSalesDealCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ organizationId: ORG_ID, title: "New Deal", amount: 50000 }),
      }),
    );
    expect(mockSalesAuditEventCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: SalesAuditActions.DEAL_CREATED, targetType: "SalesDeal" }),
      }),
    );
  });

  it("throws when account is not found for this org", async () => {
    mockSalesAccountFindFirst.mockResolvedValue(null);
    await expect(createSalesDeal(ORG_ID, {
      title: "Deal", accountId: "acct-missing",
    }, ACTOR)).rejects.toThrow("Account not found for this organization");
  });

  it("throws when specified stage does not exist", async () => {
    mockValidAccount();
    mockSalesPipelineStageFindFirst.mockResolvedValue(null);
    await expect(createSalesDeal(ORG_ID, {
      title: "Deal", accountId: "acct-pipeline", stageId: "stage-fake",
    }, ACTOR)).rejects.toThrow("Pipeline stage not found for this organization");
  });

  it("defaults status to open", async () => {
    mockValidAccount();
    mockSalesDealCreate.mockResolvedValue(mockDealResponse({ title: "Auto Deal" }));
    const deal = await createSalesDeal(ORG_ID, {
      title: "Auto Deal", accountId: "acct-pipeline",
    }, ACTOR);
    expect(deal.status).toBe("open");
  });

  it("preserves explicit status when provided", async () => {
    mockValidAccount();
    mockSalesDealCreate.mockResolvedValue(mockDealResponse({ title: "Won Deal", status: "won" }));
    const deal = await createSalesDeal(ORG_ID, {
      title: "Won Deal", accountId: "acct-pipeline", status: "won",
    }, ACTOR);
    expect(deal.status).toBe("won");
  });
});

describe("updateSalesDeal (Prisma service)", () => {
  beforeEach(() => {
    mockSalesDealFindFirst.mockReset();
    mockSalesAccountFindFirst.mockReset();
    mockSalesPipelineStageFindFirst.mockReset();
    mockSalesDealUpdate.mockReset();
    mockSalesEvidenceLinkCount.mockReset();
  });

  it("updates deal title and writes audit event", async () => {
    mockSalesDealFindFirst.mockResolvedValue({ id: "deal-upd", title: "Orig", stageId: null, status: "open" });
    mockSalesDealUpdate.mockResolvedValue(mockDealResponse({ title: "Updated" }));

    const deal = await updateSalesDeal("deal-upd", { organizationId: ORG_ID }, { title: "Updated" }, ACTOR);

    expect(deal.title).toBe("Updated");
    expect(mockSalesDealUpdate).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "deal-upd" } }));
    expect(mockSalesAuditEventCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: SalesAuditActions.DEAL_UPDATED }) }),
    );
  });

  it("updates deal amount", async () => {
    mockSalesDealFindFirst.mockResolvedValue({ id: "deal-upd", title: "Deal", stageId: null, status: "open" });
    mockSalesDealUpdate.mockResolvedValue(mockDealResponse({ amount: 75000 }));

    const deal = await updateSalesDeal("deal-upd", { organizationId: ORG_ID }, { amount: 75000 }, ACTOR);

    expect(deal.amount).toBe(75000);
  });

  it("emits stage_changed audit when stage differs", async () => {
    mockSalesDealFindFirst.mockResolvedValue({ id: "deal-stage", title: "Stage Deal", stageId: "stage-disco", status: "open" });
    mockSalesPipelineStageFindFirst.mockResolvedValue({ id: "stage-nego", slug: "negotiation" });
    mockSalesEvidenceLinkCount.mockResolvedValue(0);
    mockSalesDealUpdate.mockResolvedValue(mockDealResponse({
      stageId: "stage-nego", stage: { id: "stage-nego", name: "Negotiation", slug: "negotiation", sortOrder: 7 },
    }));

    await updateSalesDeal("deal-stage", { organizationId: ORG_ID }, { stageId: "stage-nego" }, ACTOR);

    expect(mockSalesAuditEventCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: SalesAuditActions.DEAL_STAGE_CHANGED,
          metadata: expect.objectContaining({ fromStageId: "stage-disco", toStageId: "stage-nego" }),
        }),
      }),
    );
  });

  it("does not emit stage_changed when stageId is unchanged", async () => {
    mockSalesDealFindFirst.mockResolvedValue({ id: "deal-same", title: "Deal", stageId: "stage-same", status: "open" });
    mockSalesDealUpdate.mockResolvedValue(mockDealResponse({ title: "New Title", stageId: "stage-same",
      stage: { id: "stage-same", name: "Same", slug: "same", sortOrder: 1 } }));

    mockSalesPipelineStageFindFirst.mockResolvedValue({ id: "stage-same", slug: "same" });
    mockSalesAuditEventCreate.mockClear();
    await updateSalesDeal("deal-same", { organizationId: ORG_ID }, { stageId: "stage-same", title: "New Title" }, ACTOR);

    const stageChangedCall = mockSalesAuditEventCreate.mock.calls.find(
      (call) => call[0]?.data?.action === SalesAuditActions.DEAL_STAGE_CHANGED,
    );
    expect(stageChangedCall).toBeUndefined();
  });

  it("throws when deal is not found", async () => {
    mockSalesDealFindFirst.mockResolvedValue(null);
    await expect(updateSalesDeal("deal-missing", { organizationId: ORG_ID }, {}, ACTOR))
      .rejects.toThrow("Deal not found");
  });

  it("throws when new accountId does not belong to org", async () => {
    mockSalesDealFindFirst.mockResolvedValue({ id: "deal-cross", title: "Deal", stageId: null, status: "open" });
    mockSalesAccountFindFirst.mockResolvedValue(null);
    await expect(updateSalesDeal("deal-cross", { organizationId: ORG_ID }, { accountId: "acct-other-org" }, ACTOR))
      .rejects.toThrow("Account not found for this organization");
  });

  it("blocks governed stage transition without evidence or override", async () => {
    mockSalesDealFindFirst.mockResolvedValue({ id: "deal-gov", title: "Gov Deal", stageId: "stage-disco", status: "open" });
    mockSalesPipelineStageFindFirst.mockResolvedValue({ id: "stage-prop", slug: "proposal" });
    mockSalesEvidenceLinkCount.mockResolvedValue(0);
    await expect(updateSalesDeal("deal-gov", { organizationId: ORG_ID }, { stageId: "stage-prop" }, ACTOR))
      .rejects.toThrow("SalesOS governance: moving to proposal/pilot/won requires at least one linked evidence");
  });

  it("updates status field correctly", async () => {
    mockSalesDealFindFirst.mockResolvedValue({ id: "deal-status", title: "Status Deal", stageId: null, status: "open" });
    mockSalesDealUpdate.mockResolvedValue(mockDealResponse({ status: "lost" }));
    const deal = await updateSalesDeal("deal-status", { organizationId: ORG_ID }, { status: "lost" }, ACTOR);
    expect(deal.status).toBe("lost");
  });
});

describe("pipeline lifecycle integration", () => {
  beforeEach(() => {
    mockSalesAccountFindFirst.mockReset();
    mockSalesPipelineStageFindFirst.mockReset();
    mockSalesDealCreate.mockReset();
    mockSalesDealFindFirst.mockReset();
    mockSalesDealUpdate.mockReset();
    mockSalesEvidenceLinkCount.mockReset();
    mockSalesAuditEventCreate.mockClear();
  });

  it("simulates full pipeline: discovery -> negotiation -> (blocked) -> closed_won with evidence", async () => {
    // Step 1: Create deal at discovery
    mockSalesAccountFindFirst.mockResolvedValue({ id: "acct-lifecycle", platformOrganizationId: "plat-org-test" });
    mockSalesPipelineStageFindFirst.mockResolvedValue({ id: "stage-disco", slug: "discovery" });
    mockSalesDealCreate.mockResolvedValue(mockDealResponse({
      id: "deal-lifecycle", title: "Lifecycle Deal", amount: 100000, stageId: "stage-disco",
      stage: { id: "stage-disco", name: "Discovery", slug: "discovery", sortOrder: 3 },
    }));

    const deal = await createSalesDeal(ORG_ID, {
      title: "Lifecycle Deal", accountId: "acct-lifecycle", stageId: "stage-disco", amount: 100000,
    }, ACTOR);
    expect(deal.stage?.slug).toBe("discovery");

    // Step 2: Move to negotiation (non-governed)
    mockSalesDealFindFirst.mockResolvedValue({ id: "deal-lifecycle", title: "Lifecycle Deal", stageId: "stage-disco", status: "open" });
    mockSalesPipelineStageFindFirst.mockResolvedValue({ id: "stage-nego", slug: "negotiation" });
    mockSalesDealUpdate.mockResolvedValue(mockDealResponse({
      id: "deal-lifecycle", stageId: "stage-nego",
      stage: { id: "stage-nego", name: "Negotiation", slug: "negotiation", sortOrder: 7 },
    }));

    const updatedDeal = await updateSalesDeal("deal-lifecycle", { organizationId: ORG_ID }, { stageId: "stage-nego" }, ACTOR);
    expect(updatedDeal.stage?.slug).toBe("negotiation");

    // Step 3: Closed_won blocked without evidence
    mockSalesDealFindFirst.mockResolvedValue({ id: "deal-lifecycle", title: "Lifecycle Deal", stageId: "stage-nego", status: "open" });
    mockSalesPipelineStageFindFirst.mockResolvedValue({ id: "stage-won", slug: "closed_won" });
    mockSalesEvidenceLinkCount.mockResolvedValue(0);

    await expect(updateSalesDeal("deal-lifecycle", { organizationId: ORG_ID }, { stageId: "stage-won" }, ACTOR))
      .rejects.toThrow("SalesOS governance");

    // With evidence, should succeed
    mockSalesEvidenceLinkCount.mockResolvedValue(5);
    mockSalesDealUpdate.mockResolvedValue(mockDealResponse({
      id: "deal-lifecycle", stageId: "stage-won",
      stage: { id: "stage-won", name: "Closed Won", slug: "closed_won", sortOrder: 10 },
    }));

    const wonDeal = await updateSalesDeal("deal-lifecycle", { organizationId: ORG_ID }, { stageId: "stage-won" }, ACTOR);
    expect(wonDeal.stage?.slug).toBe("closed_won");
  });

  it("blocks draft -> closed_won jump without evidence or override", async () => {
    mockSalesDealFindFirst.mockResolvedValue({ id: "deal-jump", title: "Jump Deal", stageId: "stage-draft", status: "open" });
    mockSalesPipelineStageFindFirst.mockResolvedValue({ id: "stage-won", slug: "closed_won" });
    mockSalesEvidenceLinkCount.mockResolvedValue(0);

    await expect(updateSalesDeal("deal-jump", { organizationId: ORG_ID }, { stageId: "stage-won" }, ACTOR))
      .rejects.toThrow("SalesOS governance");
  });
});
