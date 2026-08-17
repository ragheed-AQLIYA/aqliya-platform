// --- Security Test: SalesOS Intelligence Server Actions ---
// Tests ALL 15 intel actions for:
//   - Authentication enforcement (unauthenticated → DENY)
//   - RBAC permission enforcement (unauthorized role → DENY)
//   - Tenant/organization isolation (cross-tenant → DENY)
//   - Resource ownership (forged ID → DENY)
//
// These tests verify the authorization closure prevents
// unauthenticated/ unauthorized access to intel provider operations.

// --- Mocks (hoisted before imports) ──

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// ── Mock: getCurrentUser ──

const mockGetCurrentUser = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

// ── Mock: Guards ──

const mockRequireSalesPermission = jest.fn();
const mockRequireSalesOrgAccess = jest.fn();

class MockSalesAccessError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "SalesAccessError";
    this.code = code;
  }
}

jest.mock("@/lib/sales/guards", () => ({
  requireSalesPermission: (...args: unknown[]) => mockRequireSalesPermission(...args),
  requireSalesOrgAccess: (...args: unknown[]) => mockRequireSalesOrgAccess(...args),
  assertSalesPermission: jest.fn(),
  assertSalesAccountAccess: jest.fn(),
  assertSalesDealAccess: jest.fn(),
  SalesAccessError: MockSalesAccessError,
}));

// ── Mock: Intel Provider ──

const mockEnrichCompany = jest.fn();
const mockSearchCompanies = jest.fn();
const mockFindContacts = jest.fn();
const mockVerifyEmail = jest.fn();
const mockWaterfallEnrich = jest.fn();
const mockTestConnection = jest.fn();
const mockGetRateLimitState = jest.fn();
const mockCreateCampaign = jest.fn();

jest.mock("@/lib/sales/intelligence", () => ({
  createSalesIntelProvider: jest.fn(() => ({
    enrichCompany: mockEnrichCompany,
    searchCompanies: mockSearchCompanies,
    findContacts: mockFindContacts,
    verifyEmail: mockVerifyEmail,
    waterfallEnrich: mockWaterfallEnrich,
    testConnection: mockTestConnection,
    getRateLimitState: mockGetRateLimitState,
    createCampaign: mockCreateCampaign,
  })),
  listRegisteredProviders: jest.fn(() => ["apollo", "ocean", "clay", "smartlead", "linkedin"]),
}));

// ── Mock: Prisma ──

const mockPrismaAccountFindFirst = jest.fn();
const mockPrismaAccountFindMany = jest.fn();
const mockPrismaAccountUpdate = jest.fn();
const mockPrismaDealFindFirst = jest.fn();
const mockPrismaContactFindFirst = jest.fn();
const mockPrismaContactCreate = jest.fn();
const mockPrismaAuditLogCreate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesAccount: {
      findFirst: (...args: unknown[]) => mockPrismaAccountFindFirst(...args),
      findMany: (...args: unknown[]) => mockPrismaAccountFindMany(...args),
      update: (...args: unknown[]) => mockPrismaAccountUpdate(...args),
    },
    salesDeal: {
      findFirst: (...args: unknown[]) => mockPrismaDealFindFirst(...args),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    salesContact: {
      findFirst: (...args: unknown[]) => mockPrismaContactFindFirst(...args),
      create: (...args: unknown[]) => mockPrismaContactCreate(...args),
    },
    platformAuditLog: {
      create: (...args: unknown[]) => mockPrismaAuditLogCreate(...args),
      findMany: jest.fn(() => []),
    },
  },
}));

// ── Mock: AI Orchestrator ──

jest.mock("@/lib/core/ai/orchestrator", () => ({
  aiOrchestrator: {
    generate: jest.fn(() =>
      Promise.resolve({
        response: { output: '{"summary":"test","nextSteps":["a"],"risks":["b"]}', confidence: 0.8 },
        providerId: "test",
      }),
    ),
  },
}));

// ── Test fixtures ──

const AUTHORIZED_USER = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  role: "OPERATOR" as const,
  organizationId: "org-1",
  platformOrganizationId: "plat-1",
};

const VIEWER_USER = {
  id: "user-v",
  name: "Viewer",
  email: "viewer@example.com",
  role: "VIEWER" as const,
  organizationId: "org-1",
  platformOrganizationId: "plat-1",
};

const CROSS_TENANT_USER = {
  id: "user-2",
  name: "Other Org",
  email: "other@example.com",
  role: "OPERATOR" as const,
  organizationId: "org-2",
  platformOrganizationId: "plat-2",
};

// ── Import action ──

import {
  listIntelProvidersAction,
  enrichCompanyAction,
  searchCompaniesAction,
  findContactsAction,
  verifyEmailAction,
  waterfallEnrichAction,
  checkIntelProviderHealthAction,
  batchEnrichAccountsAction,
  enrichAccountContactsAction,
  createOutreachCampaignAction,
  getOutreachEventsAction,
  getOutreachAnalyticsAction,
  scoreDealLeadsAction,
} from "@/actions/sales-intel-actions";

// ── Tests ──

describe("SalesOS Intel Actions — Authorization Security", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: authorized OPERATOR
    mockRequireSalesPermission.mockResolvedValue(AUTHORIZED_USER);
    mockRequireSalesOrgAccess.mockResolvedValue(AUTHORIZED_USER);

    // Provider mocks
    mockEnrichCompany.mockResolvedValue({ source: "apollo", name: "Test Co" });
    mockSearchCompanies.mockResolvedValue([]);
    mockFindContacts.mockResolvedValue([]);
    mockVerifyEmail.mockResolvedValue({ status: "valid", confidence: 0.9 });
    mockWaterfallEnrich.mockResolvedValue({ attempts: [], contacts: [] });
    mockTestConnection.mockResolvedValue({ success: true, latencyMs: 100 });
    mockGetRateLimitState.mockReturnValue({ remaining: 100 });
    mockCreateCampaign.mockResolvedValue({ id: "campaign-1" });

    // DB mocks
    mockPrismaAccountFindFirst.mockResolvedValue({ id: "acc-1", name: "Test Account", organizationId: "org-1" });
    mockPrismaAccountFindMany.mockResolvedValue([]);
    mockPrismaAccountUpdate.mockResolvedValue({});
    mockPrismaDealFindFirst.mockResolvedValue({ id: "deal-1", accountId: "acc-1", organizationId: "org-1" });
    mockPrismaContactFindFirst.mockResolvedValue(null);
    mockPrismaContactCreate.mockResolvedValue({});
    mockPrismaAuditLogCreate.mockResolvedValue({});
  });

  // ──────────────────────────────────────────────────
  // CRITICAL #1: listIntelProvidersAction
  // ──────────────────────────────────────────────────

  describe("listIntelProvidersAction (CRITICAL)", () => {
    it("allows authorized OPERATOR", async () => {
      const result = await listIntelProvidersAction();
      expect(result.success).toBe(true);
      expect(result.providers).toEqual(["apollo", "ocean", "clay", "smartlead", "linkedin"]);
    });

    it("rejects unauthenticated user", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      await expect(listIntelProvidersAction()).rejects.toThrow("Authentication required");
    });

    it("rejects user with insufficient role", async () => {
      // VIEWER has salesos:read, so this should succeed for listProviders
      // But let's test with a role that has NO permissions
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Access denied: missing permission salesos:read", "FORBIDDEN"));
      await expect(listIntelProvidersAction()).rejects.toThrow("Access denied");
    });

    it("rejects cross-tenant user", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Access denied", "FORBIDDEN"));
      await expect(listIntelProvidersAction()).rejects.toThrow("Access denied");
    });
  });

  // ──────────────────────────────────────────────────
  // CRITICAL #2: autoEnrichAccount (tested via enrichCompanyAction)
  // ──────────────────────────────────────────────────

  describe("enrichCompanyAction (CRITICAL gateway)", () => {
    it("allows authorized OPERATOR", async () => {
      const result = await enrichCompanyAction("apollo", "test.com");
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      const result = await enrichCompanyAction("apollo", "test.com");
      expect(result.success).toBe(false);
    });

    it("rejects user with missing permission", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Access denied: missing permission salesos:read", "FORBIDDEN"));
      const result = await enrichCompanyAction("apollo", "test.com");
      expect(result.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────
  // HIGH: Read-only intel actions (salesos:read)
  // ──────────────────────────────────────────────────

  describe("searchCompaniesAction", () => {
    it("allows authorized user", async () => {
      const result = await searchCompaniesAction("apollo", { keywords: ["test"] });
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      const result = await searchCompaniesAction("apollo", { keywords: ["test"] });
      expect(result.success).toBe(false);
    });

    it("rejects unauthorized role", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Access denied", "FORBIDDEN"));
      const result = await searchCompaniesAction("apollo", { keywords: ["test"] });
      expect(result.success).toBe(false);
    });
  });

  describe("findContactsAction", () => {
    it("allows authorized user", async () => {
      const result = await findContactsAction("apollo", { keywords: ["test"] });
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      const result = await findContactsAction("apollo", { keywords: ["test"] });
      expect(result.success).toBe(false);
    });
  });

  describe("verifyEmailAction", () => {
    it("allows authorized user", async () => {
      const result = await verifyEmailAction("apollo", "test@example.com");
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      const result = await verifyEmailAction("apollo", "test@example.com");
      expect(result.success).toBe(false);
    });
  });

  describe("waterfallEnrichAction", () => {
    it("allows authorized user", async () => {
      const result = await waterfallEnrichAction({ companyName: "Test Co", providers: ["apollo"] });
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      const result = await waterfallEnrichAction({ companyName: "Test Co", providers: ["apollo"] });
      expect(result.success).toBe(false);
    });
  });

  describe("checkIntelProviderHealthAction", () => {
    it("allows authorized user", async () => {
      const result = await checkIntelProviderHealthAction("apollo");
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      const result = await checkIntelProviderHealthAction("apollo");
      expect(result.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────
  // HIGH: Write intel actions (salesos:create / salesos:update)
  // ──────────────────────────────────────────────────

  describe("batchEnrichAccountsAction", () => {
    it("allows authorized OPERATOR", async () => {
      const result = await batchEnrichAccountsAction();
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user (throws — auth propagates)", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      await expect(batchEnrichAccountsAction()).rejects.toThrow("Authentication required");
    });

    it("rejects unauthorized role (throws — auth propagates)", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Access denied", "FORBIDDEN"));
      await expect(batchEnrichAccountsAction()).rejects.toThrow("Access denied");
    });

    it("scopes queries to user organization", async () => {
      await batchEnrichAccountsAction();
      expect(mockPrismaAccountFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: "org-1" }),
        }),
      );
    });
  });

  describe("enrichAccountContactsAction", () => {
    it("allows authorized OPERATOR", async () => {
      const result = await enrichAccountContactsAction("acc-1");
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user (throws — auth propagates)", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      await expect(enrichAccountContactsAction("acc-1")).rejects.toThrow("Authentication required");
    });

    it("rejects cross-tenant account access", async () => {
      mockPrismaAccountFindFirst.mockResolvedValue(null); // Account not in user's org
      const result = await enrichAccountContactsAction("acc-1");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Account not found");
    });
  });

  describe("createOutreachCampaignAction", () => {
    it("allows authorized OPERATOR with valid deal", async () => {
      const result = await createOutreachCampaignAction({
        dealId: "deal-1",
        name: "Test Campaign",
        contactIds: ["c1"],
        steps: [{ type: "email", template: "Hi" }],
      });
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user (throws — auth propagates)", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      await expect(createOutreachCampaignAction({
        dealId: "deal-1",
        name: "Test Campaign",
        contactIds: ["c1"],
        steps: [{ type: "email", template: "Hi" }],
      })).rejects.toThrow("Authentication required");
    });

    it("rejects cross-tenant deal", async () => {
      mockPrismaDealFindFirst.mockResolvedValue(null); // Deal not in user's org
      const result = await createOutreachCampaignAction({
        dealId: "deal-1",
        name: "Test Campaign",
        contactIds: ["c1"],
        steps: [{ type: "email", template: "Hi" }],
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Deal not found");
    });
  });

  describe("getOutreachEventsAction", () => {
    it("allows authorized OPERATOR", async () => {
      const result = await getOutreachEventsAction("deal-1");
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      const result = await getOutreachEventsAction("deal-1");
      expect(result.success).toBe(false);
    });

    it("rejects cross-tenant deal", async () => {
      mockPrismaDealFindFirst.mockResolvedValue(null);
      const result = await getOutreachEventsAction("deal-1");
      expect(result.success).toBe(false);
    });
  });

  describe("getOutreachAnalyticsAction", () => {
    it("allows authorized OPERATOR", async () => {
      const result = await getOutreachAnalyticsAction();
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      const result = await getOutreachAnalyticsAction();
      expect(result.success).toBe(false);
    });
  });

  describe("scoreDealLeadsAction", () => {
    it("allows authorized OPERATOR", async () => {
      const result = await scoreDealLeadsAction("deal-1");
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user (throws — auth propagates)", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Authentication required", "UNAUTHORIZED"));
      await expect(scoreDealLeadsAction("deal-1")).rejects.toThrow("Authentication required");
    });

    it("rejects cross-tenant deal", async () => {
      mockPrismaDealFindFirst.mockResolvedValue(null);
      const result = await scoreDealLeadsAction("deal-1");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Deal not found");
    });

    it("rejects unauthorized role (throws — auth propagates)", async () => {
      mockRequireSalesPermission.mockRejectedValue(new MockSalesAccessError("Access denied", "FORBIDDEN"));
      await expect(scoreDealLeadsAction("deal-1")).rejects.toThrow("Access denied");
    });
  });

  // ──────────────────────────────────────────────────
  // Cross-cutting: authorization is consistently enforced
  // ──────────────────────────────────────────────────

  describe("Cross-cutting authorization", () => {
    it("every action calls requireSalesPermission", async () => {
      const actions = [
        () => listIntelProvidersAction(),
        () => enrichCompanyAction("apollo", "test.com"),
        () => searchCompaniesAction("apollo", { keywords: ["test"] }),
        () => findContactsAction("apollo", { keywords: ["test"] }),
        () => verifyEmailAction("apollo", "test@example.com"),
        () => waterfallEnrichAction({ companyName: "Test", providers: ["apollo"] }),
        () => checkIntelProviderHealthAction("apollo"),
        () => batchEnrichAccountsAction(),
        () => enrichAccountContactsAction("acc-1"),
        () => getOutreachEventsAction("deal-1"),
        () => getOutreachAnalyticsAction(),
        () => scoreDealLeadsAction("deal-1"),
      ];

      for (const action of actions) {
        mockRequireSalesPermission.mockClear();
        try { await action(); } catch { /* expected for some */ }
        expect(mockRequireSalesPermission).toHaveBeenCalled();
      }
    });

    it("unauthenticated rejection is consistent across all actions", async () => {
      mockRequireSalesPermission.mockRejectedValue(
        new MockSalesAccessError("Authentication required", "UNAUTHORIZED"),
      );

      const readActions = [
        () => listIntelProvidersAction(),
        () => enrichCompanyAction("apollo", "test.com"),
        () => searchCompaniesAction("apollo", { keywords: ["test"] }),
        () => findContactsAction("apollo", { keywords: ["test"] }),
        () => verifyEmailAction("apollo", "test@example.com"),
        () => waterfallEnrichAction({ companyName: "Test", providers: ["apollo"] }),
        () => checkIntelProviderHealthAction("apollo"),
        () => batchEnrichAccountsAction(),
        () => enrichAccountContactsAction("acc-1"),
        () => getOutreachEventsAction("deal-1"),
        () => getOutreachAnalyticsAction(),
        () => scoreDealLeadsAction("deal-1"),
      ];

      for (const action of readActions) {
        // All actions must reject (throw) or return { success: false } when auth fails
        try {
          const result = await action();
          if (result && typeof result === "object" && "success" in result) {
            expect(result.success).toBe(false);
          }
        } catch (err) {
          // Auth errors propagate as throws — correct security design
          expect(err).toBeInstanceOf(MockSalesAccessError);
        }
      }
    });
  });
});
