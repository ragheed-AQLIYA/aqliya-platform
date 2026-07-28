// --- Unit Test: SalesOS Server Actions ---
// Tests createDeal, updateDeal, listDeals, getDeal actions.
// Uses mocked Prisma, auth, guards, and services - no database required.

// --- Mocks (hoisted before imports) ---

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockGetCurrentUser = jest.fn();
const mockIsExpectedAccessDeniedError = jest.fn((error) =>
  error instanceof Error &&
  (error.message.startsWith("Access denied:") || error.message === "Unauthenticated")
);

jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args) => mockGetCurrentUser(...args),
  isExpectedAccessDeniedError: (...args) => mockIsExpectedAccessDeniedError(...args),
}));

jest.mock("@/lib/kernel", () => ({
  enforce: jest.fn().mockResolvedValue(undefined),
}));

// Mock guards
const mockRequireSalesPermission = jest.fn();
const mockAssertSalesDealAccess = jest.fn();
const mockSalesAccessError = class SalesAccessError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "SalesAccessError";
    this.code = code;
  }
};

jest.mock("@/lib/sales/guards", () => ({
  requireSalesPermission: (...args) => mockRequireSalesPermission(...args),
  assertSalesDealAccess: (...args) => mockAssertSalesDealAccess(...args),
  requireSalesOrgAccess: jest.fn(),
  SalesAccessError: mockSalesAccessError,
}));

// Mock audit events
jest.mock("@/lib/sales/audit-events", () => ({
  recordSalesAuditEvent: jest.fn().mockResolvedValue(undefined),
  SalesAuditActions: {
    DEAL_CREATED: "sales.deal.created",
    DEAL_UPDATED: "sales.deal.updated",
    DEAL_STAGE_CHANGED: "sales.deal.stage_changed",
    DEAL_STATUS_CHANGED: "sales.deal.status_changed",
    DEAL_NEXT_ACTION_SET: "sales.deal.next_action_set",
    ACCOUNT_CREATED: "sales.account.created",
    ACCOUNT_UPDATED: "sales.account.updated",
    ACCOUNT_VIEWED: "sales.account.viewed",
    PIPELINE_VIEWED: "sales.pipeline.viewed",
    GOVERNANCE_OVERRIDE: "sales.governance.override",
    GOVERNANCE_REVIEW_DECISION: "sales.governance.review_decision",
    REPORTS_VIEWED: "sales.reports.viewed",
  },
}));

// Mock governance
jest.mock("@/lib/sales/governance", () => ({
  recordReviewDecision: jest.fn().mockResolvedValue({
    id: "rev-001", decision: "approved", actorId: "user-1",
    actorName: "Test", reason: "Looks good", createdAt: new Date().toISOString(),
  }),
}));

// Mock platform audit logger
jest.mock("@/lib/platform/audit-logger", () => ({
  auditLogger: jest.fn(() => ({
    record: jest.fn().mockResolvedValue({ ok: true }),
  })),
  Product: { SALES_OS: "salesos" },
}));

// Mock platform audit log (dual-write)
jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true, id: "audit-plat-1" }),
}));

jest.mock("@/lib/platform/audit/audit-store", () => ({
  appendToAuditChain: jest.fn().mockResolvedValue(undefined),
}));

// --- Service mocks ---
const mockCreateSalesDeal = jest.fn();
const mockUpdateSalesDeal = jest.fn();
const mockListSalesDeals = jest.fn();
const mockGetSalesDeal = jest.fn();

jest.mock("@/lib/sales/services", () => ({
  createSalesDeal: (...args) => mockCreateSalesDeal(...args),
  updateSalesDeal: (...args) => mockUpdateSalesDeal(...args),
  listSalesDeals: (...args) => mockListSalesDeals(...args),
  getSalesDeal: (...args) => mockGetSalesDeal(...args),
  createSalesAccount: jest.fn(),
  updateSalesAccount: jest.fn(),
  getSalesAccount: jest.fn(),
  getSalesDashboardStats: jest.fn(),
  listSalesAccounts: jest.fn(),
  listSalesPipelineStages: jest.fn(),
  listSalesDealAuditEvents: jest.fn(),
  updateDealNextAction: jest.fn(),
  partitionPipelineDeals: jest.fn(),
  buildDueNextActions: jest.fn(),
}));

// --- Imports (after mocks) ---
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import {
  createSalesDealAction,
  updateSalesDealAction,
  listSalesDealsAction,
  getSalesDealAction,
} from "../sales-actions";

// --- Mock Data ---

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@aqliya.com",
  organizationId: "org-1",
  platformOrganizationId: "plat-org-1",
  role: "OPERATOR",
  organization: { id: "org-1", name: "Test Org" },
};

const mockCtx = {
  user: mockUser,
  organizationId: "org-1",
  platformOrganizationId: "plat-org-1",
};

function mockDeal(overrides = {}) {
  return {
    id: "deal-1",
    title: "Test Deal",
    status: "open",
    amount: 50000,
    currency: "SAR",
    probability: null,
    expectedCloseDate: null,
    accountId: "acct-1",
    stageId: "stage-1",
    isDemo: false,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    account: { id: "acct-1", name: "Test Account", metadata: null },
    stage: { id: "stage-1", name: "Discovery", slug: "discovery", sortOrder: 3 },
    ...overrides,
  };
}

// --- Tests ---

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue(mockUser);
  mockRequireSalesPermission.mockResolvedValue(mockCtx);
  mockAssertSalesDealAccess.mockResolvedValue({
    ...mockCtx, dealId: "deal-1", accountId: "acct-1", stageId: "stage-1",
  });
});


describe("createSalesDealAction", () => {
  it("creates a deal with required fields", async () => {
    mockCreateSalesDeal.mockResolvedValue(mockDeal({ title: "New Deal" }));

    const result = await createSalesDealAction({
      title: "New Deal",
      accountId: "acct-1",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("New Deal");
      expect(result.data.status).toBe("open");
      expect(result.data.account.name).toBe("Test Account");
    }
    expect(mockCreateSalesDeal).toHaveBeenCalledWith(
      "org-1",
      expect.objectContaining({ title: "New Deal", accountId: "acct-1" }),
      expect.objectContaining({ id: "user-1" }),
    );
  });

  it("creates a deal with amount and currency", async () => {
    mockCreateSalesDeal.mockResolvedValue(mockDeal({ title: "Big Deal", amount: 250000, currency: "SAR" }));

    const result = await createSalesDealAction({
      title: "Big Deal",
      accountId: "acct-1",
      amount: 250000,
      currency: "SAR",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.amount).toBe(250000);
    }
  });

  it("rejects empty title (validation in service layer)", async () => {
    mockCreateSalesDeal.mockRejectedValue(new Error("title is required"));

    const result = await createSalesDealAction({ title: "", accountId: "acct-1" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("title is required");
    }
  });

  it("rejects missing accountId", async () => {
    mockCreateSalesDeal.mockRejectedValue(new Error("accountId is required"));

    const result = await createSalesDealAction({ title: "Deal", accountId: "" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("accountId is required");
    }
  });

  it("handles unauthorized access", async () => {
    mockRequireSalesPermission.mockRejectedValue(
      new mockSalesAccessError("Access denied: missing permission salesos:create", "FORBIDDEN"),
    );

    const result = await createSalesDealAction({ title: "Deal", accountId: "acct-1" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Access denied: missing permission salesos:create");
      expect(result.code).toBe("FORBIDDEN");
    }
  });

  it("handles account not found for org", async () => {
    mockCreateSalesDeal.mockRejectedValue(new Error("Account not found for this organization"));

    const result = await createSalesDealAction({ title: "Deal", accountId: "acct-fake" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Account not found for this organization");
    }
  });

  it("handles negative amount gracefully", async () => {
    mockCreateSalesDeal.mockRejectedValue(new Error("amount must be a non-negative number"));

    const result = await createSalesDealAction({ title: "Deal", accountId: "acct-1", amount: -100 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("non-negative");
    }
  });
});


describe("updateSalesDealAction", () => {
  it("updates deal title", async () => {
    mockUpdateSalesDeal.mockResolvedValue(mockDeal({ title: "Updated Title" }));

    const result = await updateSalesDealAction("deal-1", { title: "Updated Title" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("Updated Title");
    }
    expect(mockAssertSalesDealAccess).toHaveBeenCalledWith("deal-1");
  });

  it("updates deal amount", async () => {
    mockUpdateSalesDeal.mockResolvedValue(mockDeal({ amount: 150000 }));

    const result = await updateSalesDealAction("deal-1", { amount: 150000 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.amount).toBe(150000);
    }
  });

  it("updates deal stage", async () => {
    mockUpdateSalesDeal.mockResolvedValue(mockDeal({
      stageId: "stage-2",
      stage: { id: "stage-2", name: "Negotiation", slug: "negotiation", sortOrder: 7 },
    }));

    const result = await updateSalesDealAction("deal-1", { stageId: "stage-2" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.stage?.slug).toBe("negotiation");
    }
  });

  it("updates deal status to lost", async () => {
    mockUpdateSalesDeal.mockResolvedValue(mockDeal({ status: "lost" }));

    const result = await updateSalesDealAction("deal-1", { status: "lost" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe("lost");
    }
  });

  it("handles deal not found", async () => {
    mockAssertSalesDealAccess.mockRejectedValue(
      new mockSalesAccessError("Deal not found", "NOT_FOUND"),
    );

    const result = await updateSalesDealAction("deal-missing", { title: "Test" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("NOT_FOUND");
    }
  });

  it("handles unauthorized access", async () => {
    mockRequireSalesPermission.mockRejectedValue(
      new mockSalesAccessError("Access denied: missing permission salesos:update", "FORBIDDEN"),
    );

    const result = await updateSalesDealAction("deal-1", { title: "Test" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("FORBIDDEN");
    }
  });

  it("handles cross-org access rejection", async () => {
    mockAssertSalesDealAccess.mockRejectedValue(
      new mockSalesAccessError("Access denied: deal belongs to another organization", "FORBIDDEN"),
    );

    const result = await updateSalesDealAction("deal-other-org", { title: "Test" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("another organization");
    }
  });
});


describe("listSalesDealsAction", () => {
  it("returns deals scoped to user organization", async () => {
    mockListSalesDeals.mockResolvedValue([mockDeal(), mockDeal({ id: "deal-2", title: "Deal 2" })]);

    const result = await listSalesDealsAction();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe("deal-1");
      expect(result.data[1].id).toBe("deal-2");
    }
    expect(mockListSalesDeals).toHaveBeenCalledWith("org-1");
  });

  it("returns empty array when no deals exist", async () => {
    mockListSalesDeals.mockResolvedValue([]);

    const result = await listSalesDealsAction();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(0);
    }
  });

  it("handles unauthorized access", async () => {
    mockRequireSalesPermission.mockRejectedValue(
      new Error("Access denied: VIEWER role insufficient"),
    );

    const result = await listSalesDealsAction();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Access denied");
    }
  });

  it("handles unauthenticated user", async () => {
    mockRequireSalesPermission.mockRejectedValue(new Error("Unauthenticated"));

    const result = await listSalesDealsAction();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Access denied");
    }
  });
});


describe("getSalesDealAction", () => {
  it("returns a deal by id with org scoping", async () => {
    mockGetSalesDeal.mockResolvedValue(mockDeal({ title: "My Deal" }));

    const result = await getSalesDealAction("deal-1");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe("deal-1");
      expect(result.data.title).toBe("My Deal");
      expect(result.data.account.name).toBe("Test Account");
    }
    expect(mockAssertSalesDealAccess).toHaveBeenCalledWith("deal-1");
    expect(mockGetSalesDeal).toHaveBeenCalledWith("deal-1", "org-1");
  });

  it("returns error for non-existent deal", async () => {
    mockGetSalesDeal.mockResolvedValue(null);

    const result = await getSalesDealAction("nonexistent");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("NOT_FOUND");
      expect(result.error).toBe("Deal not found");
    }
  });

  it("handles cross-org access rejection", async () => {
    mockAssertSalesDealAccess.mockRejectedValue(
      new mockSalesAccessError("Access denied: deal belongs to another organization", "FORBIDDEN"),
    );

    const result = await getSalesDealAction("deal-other-org");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("FORBIDDEN");
    }
  });

  it("handles unauthenticated user", async () => {
    mockAssertSalesDealAccess.mockRejectedValue(new Error("Unauthenticated"));

    const result = await getSalesDealAction("deal-1");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Access denied");
    }
  });
});
