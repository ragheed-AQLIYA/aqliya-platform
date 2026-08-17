// --- Security Test: SalesOS Deal Health Server Actions ---
// Tests getDealHealthAction and listDealHealthAction for:
//   - Authentication enforcement
//   - Tenant/organization scoping (cross-tenant isolation)
//   - Forged/missing identifier handling
//   - RBAC permission enforcement
//
// These tests verify that the Wave 3 R-001 remediation prevents
// cross-tenant deal health data exposure.
//
// Security design:
//   Auth/permission/tenant errors PROPAGATE (not swallowed) to trigger
//   Next.js error boundaries / redirect to login.
//   Business logic errors (getDealHealth fails) degrade gracefully (return null/[]).

// --- Mocks (hoisted before imports) ---

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
const mockAssertSalesDealAccess = jest.fn();

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
  assertSalesDealAccess: (...args: unknown[]) => mockAssertSalesDealAccess(...args),
  SalesAccessError: MockSalesAccessError,
  requireSalesOrgAccess: jest.fn(),
}));

// ── Mock: Prisma ──

const mockPrismaDealFindMany = jest.fn();
const mockPrismaDealFindUnique = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: {
      findMany: (...args: unknown[]) => mockPrismaDealFindMany(...args),
      findUnique: (...args: unknown[]) => mockPrismaDealFindUnique(...args),
    },
  },
}));

// ── Mock: getDealHealth (service layer) ──

const mockGetDealHealth = jest.fn();

jest.mock(
  "@/lib/platform/sales-intelligence/sales-intel-service/health",
  () => ({
    getDealHealth: (...args: unknown[]) => mockGetDealHealth(...args),
  }),
);

jest.mock(
  "@/lib/platform/sales-intelligence/sales-intel-service/scoring",
  () => ({
    scoreDeal: jest.fn(),
  }),
);

// ── Imports ──

import {
  getDealHealthAction,
  listDealHealthAction,
} from "../sales-deal-health";

// ── Fixtures ──

const ORG_A = "org-a-11111111";
const ORG_B = "org-b-22222222";
const DEAL_ORG_A = "deal-a-11111111";
const DEAL_ORG_B = "deal-b-22222222";
const USER_ORG_A = {
  id: "user-a-1111",
  name: "User A",
  email: "user-a@test.com",
  role: "OPERATOR" as const,
  organizationId: ORG_A,
  platformOrganizationId: null,
};

const HEALTH_RESPONSE = {
  id: "health-deal-a",
  dealId: DEAL_ORG_A,
  organizationId: ORG_A,
  score: 75,
  healthLevel: "HEALTHY" as const,
  stageScore: 40,
  valueScore: 20,
  recencyScore: 10,
  probabilityScore: 5,
  lastScoredAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Tests ──

describe("Deal Health Actions — Security", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDealHealth.mockResolvedValue(HEALTH_RESPONSE);
    mockPrismaDealFindUnique.mockResolvedValue(null);
    mockPrismaDealFindMany.mockResolvedValue([]);
  });

  // ================================================================
  // getDealHealthAction
  // ================================================================

  describe("getDealHealthAction", () => {
    it("ALLOW: authenticated user with same org + valid permission", async () => {
      mockRequireSalesPermission.mockResolvedValue({
        user: USER_ORG_A,
        organizationId: ORG_A,
        platformOrganizationId: null,
      });
      mockAssertSalesDealAccess.mockResolvedValue({
        user: USER_ORG_A,
        organizationId: ORG_A,
        platformOrganizationId: null,
        dealId: DEAL_ORG_A,
        accountId: "acc-1",
        stageId: "stage-1",
      });

      const result = await getDealHealthAction(DEAL_ORG_A);

      expect(result).toEqual(HEALTH_RESPONSE);
      expect(mockRequireSalesPermission).toHaveBeenCalledWith("salesos:read");
      expect(mockAssertSalesDealAccess).toHaveBeenCalledWith(DEAL_ORG_A);
      expect(mockGetDealHealth).toHaveBeenCalledWith(DEAL_ORG_A);
    });

    it("DENY: unauthenticated — SalesAccessError propagates", async () => {
      mockRequireSalesPermission.mockRejectedValue(
        new MockSalesAccessError("Unauthenticated", "UNAUTHENTICATED")
      );

      await expect(getDealHealthAction(DEAL_ORG_A)).rejects.toThrow(
        "Unauthenticated"
      );
      expect(mockAssertSalesDealAccess).not.toHaveBeenCalled();
      expect(mockGetDealHealth).not.toHaveBeenCalled();
    });

    it("DENY: missing salesos:read permission — SalesAccessError propagates", async () => {
      mockRequireSalesPermission.mockRejectedValue(
        new MockSalesAccessError(
          "Access denied: missing permission salesos:read",
          "FORBIDDEN"
        )
      );

      await expect(getDealHealthAction(DEAL_ORG_A)).rejects.toThrow(
        "missing permission"
      );
      expect(mockAssertSalesDealAccess).not.toHaveBeenCalled();
      expect(mockGetDealHealth).not.toHaveBeenCalled();
    });

    it("DENY: cross-tenant — deal belongs to different organization", async () => {
      mockRequireSalesPermission.mockResolvedValue({
        user: USER_ORG_A,
        organizationId: ORG_A,
        platformOrganizationId: null,
      });
      mockAssertSalesDealAccess.mockRejectedValue(
        new MockSalesAccessError(
          "Access denied: deal belongs to another organization",
          "FORBIDDEN"
        )
      );

      await expect(getDealHealthAction(DEAL_ORG_B)).rejects.toThrow(
        "deal belongs to another organization"
      );
      expect(mockAssertSalesDealAccess).toHaveBeenCalledWith(DEAL_ORG_B);
      expect(mockGetDealHealth).not.toHaveBeenCalled();
    });

    it("DENY: forged dealId that does not exist", async () => {
      mockRequireSalesPermission.mockResolvedValue({
        user: USER_ORG_A,
        organizationId: ORG_A,
        platformOrganizationId: null,
      });
      mockAssertSalesDealAccess.mockRejectedValue(
        new MockSalesAccessError("Deal not found", "NOT_FOUND")
      );

      await expect(getDealHealthAction("fake-deal-id-999")).rejects.toThrow(
        "Deal not found"
      );
      expect(mockGetDealHealth).not.toHaveBeenCalled();
    });

    it("returns null for missing/null/undefined dealId (early return, no auth check)", async () => {
      const resultNull = await getDealHealthAction(null as unknown as string);
      const resultUndefined = await getDealHealthAction(
        undefined as unknown as string
      );
      const resultEmpty = await getDealHealthAction("");

      expect(resultNull).toBeNull();
      expect(resultUndefined).toBeNull();
      expect(resultEmpty).toBeNull();
      expect(mockRequireSalesPermission).not.toHaveBeenCalled();
    });

    it("DENY: platform organization mismatch", async () => {
      const userWithPlatformOrg = {
        ...USER_ORG_A,
        platformOrganizationId: "platform-org-a",
      };
      mockRequireSalesPermission.mockResolvedValue({
        user: userWithPlatformOrg,
        organizationId: ORG_A,
        platformOrganizationId: "platform-org-a",
      });
      mockAssertSalesDealAccess.mockRejectedValue(
        new MockSalesAccessError(
          "Access denied: deal belongs to another platform organization",
          "FORBIDDEN"
        )
      );

      await expect(getDealHealthAction(DEAL_ORG_B)).rejects.toThrow(
        "platform organization"
      );
      expect(mockAssertSalesDealAccess).toHaveBeenCalledWith(DEAL_ORG_B);
      expect(mockGetDealHealth).not.toHaveBeenCalled();
    });
  });

  // ================================================================
  // listDealHealthAction
  // ================================================================

  describe("listDealHealthAction", () => {
    it("ALLOW: authenticated user with same org gets health for org deals", async () => {
      mockRequireSalesPermission.mockResolvedValue({
        user: USER_ORG_A,
        organizationId: ORG_A,
        platformOrganizationId: null,
      });
      mockPrismaDealFindMany.mockResolvedValue([
        { id: DEAL_ORG_A },
        { id: "deal-a-2222" },
      ]);

      const result = await listDealHealthAction([
        DEAL_ORG_A,
        DEAL_ORG_B,
        "deal-a-2222",
      ]);

      expect(mockRequireSalesPermission).toHaveBeenCalledWith("salesos:read");
      // Bulk query filters by organizationId
      expect(mockPrismaDealFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: ORG_A,
            id: { in: [DEAL_ORG_A, DEAL_ORG_B, "deal-a-2222"] },
          }),
        })
      );
      // Only Org A deals are scored
      expect(mockGetDealHealth).toHaveBeenCalledTimes(2);
      expect(mockGetDealHealth).toHaveBeenCalledWith(DEAL_ORG_A);
      expect(mockGetDealHealth).toHaveBeenCalledWith("deal-a-2222");
      expect(mockGetDealHealth).not.toHaveBeenCalledWith(DEAL_ORG_B);
    });

    it("DENY: unauthenticated — SalesAccessError propagates", async () => {
      mockRequireSalesPermission.mockRejectedValue(
        new MockSalesAccessError("Unauthenticated", "UNAUTHENTICATED")
      );

      await expect(listDealHealthAction([DEAL_ORG_A])).rejects.toThrow(
        "Unauthenticated"
      );
      expect(mockPrismaDealFindMany).not.toHaveBeenCalled();
      expect(mockGetDealHealth).not.toHaveBeenCalled();
    });

    it("DENY: missing salesos:read — SalesAccessError propagates", async () => {
      mockRequireSalesPermission.mockRejectedValue(
        new MockSalesAccessError(
          "Access denied: missing permission salesos:read",
          "FORBIDDEN"
        )
      );

      await expect(listDealHealthAction([DEAL_ORG_A])).rejects.toThrow(
        "missing permission"
      );
      expect(mockPrismaDealFindMany).not.toHaveBeenCalled();
    });

    it("DENY: all deal IDs belong to different organization (cross-tenant)", async () => {
      mockRequireSalesPermission.mockResolvedValue({
        user: USER_ORG_A,
        organizationId: ORG_A,
        platformOrganizationId: null,
      });
      // Bulk query returns nothing (Org B deals filtered out by orgId)
      mockPrismaDealFindMany.mockResolvedValue([]);

      const result = await listDealHealthAction([
        DEAL_ORG_B,
        "deal-b-3333",
        "deal-b-4444",
      ]);

      expect(result).toEqual([]);
      expect(mockPrismaDealFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: ORG_A,
            id: { in: [DEAL_ORG_B, "deal-b-3333", "deal-b-4444"] },
          }),
        })
      );
      expect(mockGetDealHealth).not.toHaveBeenCalled();
    });

    it("returns empty array for missing/null/empty dealIds (early return, no auth)", async () => {
      const resultNull = await listDealHealthAction(null as unknown as string[]);
      const resultEmpty = await listDealHealthAction([]);

      expect(resultNull).toEqual([]);
      expect(resultEmpty).toEqual([]);
      expect(mockRequireSalesPermission).not.toHaveBeenCalled();
    });

    it("returns results only for successfully scored deals", async () => {
      mockRequireSalesPermission.mockResolvedValue({
        user: USER_ORG_A,
        organizationId: ORG_A,
        platformOrganizationId: null,
      });
      mockPrismaDealFindMany.mockResolvedValue([
        { id: DEAL_ORG_A },
        { id: "deal-a-3333" },
      ]);

      mockGetDealHealth
        .mockResolvedValueOnce(HEALTH_RESPONSE)
        .mockResolvedValueOnce(null);

      const result = await listDealHealthAction([DEAL_ORG_A, "deal-a-3333"]);

      expect(result).toHaveLength(1);
      expect(result[0].dealId).toBe(DEAL_ORG_A);
    });

    it("mixed Org A and Org B dealIds — only Org A processed (cross-tenant isolation)", async () => {
      mockRequireSalesPermission.mockResolvedValue({
        user: USER_ORG_A,
        organizationId: ORG_A,
        platformOrganizationId: null,
      });
      mockPrismaDealFindMany.mockResolvedValue([{ id: DEAL_ORG_A }]);

      const result = await listDealHealthAction([
        DEAL_ORG_A,
        DEAL_ORG_B,
        "not-a-deal",
      ]);

      expect(mockPrismaDealFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: ORG_A,
            id: { in: [DEAL_ORG_A, DEAL_ORG_B, "not-a-deal"] },
          }),
        })
      );
      expect(mockGetDealHealth).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
    });
  });
});
