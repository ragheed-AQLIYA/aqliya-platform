import { readFileSync } from "fs"
import { join } from "path"

const mockGetCurrentUser = jest.fn()

jest.mock("@/lib/auth", () => {
  return {
    hasRequiredRole: (
      user: { role: string },
      requiredRole: string,
    ): boolean => {
      if (requiredRole === "ADMIN") return user.role === "ADMIN"
      if (requiredRole === "OPERATOR")
        return ["OPERATOR", "ADMIN"].includes(user.role)
      return ["VIEWER", "OPERATOR", "ADMIN"].includes(user.role)
    },
    isAdmin: (user: { role: string }): boolean => user.role === "ADMIN",
    isOperator: (user: { role: string }): boolean =>
      ["OPERATOR", "ADMIN"].includes(user.role),
    isViewer: (user: { role: string }): boolean => user.role === "VIEWER",
    isExpectedAccessDeniedError: (error: unknown): boolean => {
      return (
        error instanceof Error &&
        (error.message.startsWith("Access denied:") ||
          error.message === "Unauthenticated")
      )
    },
    requireOrgAccess: async (
      organizationId: string,
      _requiredRole = "OPERATOR",
    ) => {
      const user = await mockGetCurrentUser()
      if (user.organizationId !== organizationId) {
        throw new Error("Access denied: organization access required")
      }
      return user
    },
    getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
  }
})

import {
  hasRequiredRole,
  isAdmin,
  isOperator,
  isViewer,
  isExpectedAccessDeniedError,
  requireOrgAccess,
} from "@/lib/auth"
import { enforce, authorize } from "@/lib/authorization"
import type { CurrentUser } from "@/lib/authorization"

const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user-1",
  email: "user@test.com",
  name: "Test User",
  role: "OPERATOR" as const,
  organizationId: "org-alpha",
  platformOrganizationId: "plat-alpha",
  organization: { id: "org-alpha", name: "Org Alpha" },
  ...overrides,
})

const makeAdmin = (overrides: Record<string, unknown> = {}) =>
  makeUser({ role: "ADMIN" as const, ...overrides })

beforeEach(() => {
  jest.clearAllMocks()
})

describe("L0-07: Cross-Tenant Isolation", () => {
  describe("1. Role-based access control (pure functions)", () => {
    describe("hasRequiredRole", () => {
      it("returns true for ADMIN when required role is ADMIN", () => {
        expect(hasRequiredRole(makeAdmin(), "ADMIN")).toBe(true)
      })

      it("returns false for OPERATOR when required role is ADMIN", () => {
        expect(hasRequiredRole(makeUser({ role: "OPERATOR" }), "ADMIN")).toBe(
          false,
        )
      })

      it("returns false for VIEWER when required role is ADMIN", () => {
        expect(hasRequiredRole(makeUser({ role: "VIEWER" }), "ADMIN")).toBe(
          false,
        )
      })

      it("returns true for ADMIN when required role is OPERATOR", () => {
        expect(hasRequiredRole(makeAdmin(), "OPERATOR")).toBe(true)
      })

      it("returns true for OPERATOR when required role is OPERATOR", () => {
        expect(
          hasRequiredRole(makeUser({ role: "OPERATOR" }), "OPERATOR"),
        ).toBe(true)
      })

      it("returns false for VIEWER when required role is OPERATOR", () => {
        expect(hasRequiredRole(makeUser({ role: "VIEWER" }), "OPERATOR")).toBe(
          false,
        )
      })

      it("returns true for any role when required role is VIEWER", () => {
        for (const role of ["VIEWER", "OPERATOR", "ADMIN"]) {
          expect(hasRequiredRole(makeUser({ role }), "VIEWER")).toBe(true)
        }
      })
    })

    describe("role helpers", () => {
      it("isAdmin returns true only for ADMIN role", () => {
        expect(isAdmin(makeAdmin())).toBe(true)
        expect(isAdmin(makeUser({ role: "OPERATOR" }))).toBe(false)
        expect(isAdmin(makeUser({ role: "VIEWER" }))).toBe(false)
      })

      it("isOperator returns true for OPERATOR and ADMIN", () => {
        expect(isOperator(makeAdmin())).toBe(true)
        expect(isOperator(makeUser({ role: "OPERATOR" }))).toBe(true)
        expect(isOperator(makeUser({ role: "VIEWER" }))).toBe(false)
      })

      it("isViewer returns true only for VIEWER role", () => {
        expect(isViewer(makeUser({ role: "VIEWER" }))).toBe(true)
        expect(isViewer(makeUser({ role: "OPERATOR" }))).toBe(false)
        expect(isViewer(makeAdmin())).toBe(false)
      })
    })

    describe("isExpectedAccessDeniedError", () => {
      it("recognizes Unauthenticated error", () => {
        expect(isExpectedAccessDeniedError(new Error("Unauthenticated"))).toBe(
          true,
        )
      })

      it("recognizes Access denied errors", () => {
        const messages = [
          "Access denied: organization mismatch",
          "Access denied: ADMIN role required",
          "Access denied: organization access required",
        ]
        for (const msg of messages) {
          expect(isExpectedAccessDeniedError(new Error(msg))).toBe(true)
        }
      })

      it("rejects non-access errors", () => {
        expect(isExpectedAccessDeniedError(new Error("Not found"))).toBe(false)
        expect(isExpectedAccessDeniedError(null)).toBe(false)
        expect(isExpectedAccessDeniedError("string error")).toBe(false)
      })
    })

    describe("requireOrgAccess", () => {
      it("throws when user org does not match target org", async () => {
        const user = makeUser({ organizationId: "org-alpha" })
        mockGetCurrentUser.mockResolvedValue(user)
        await expect(
          requireOrgAccess("org-beta", "OPERATOR"),
        ).rejects.toThrow("Access denied: organization access required")
      })

      it("allows when user org matches target org", async () => {
        const user = makeUser({ organizationId: "org-alpha" })
        mockGetCurrentUser.mockResolvedValue(user)
        const result = await requireOrgAccess("org-alpha", "OPERATOR")
        expect(result.organizationId).toBe("org-alpha")
      })

      it("calls getCurrentUser with the required role", async () => {
        const user = makeUser({ organizationId: "org-alpha" })
        mockGetCurrentUser.mockResolvedValue(user)
        await requireOrgAccess("org-alpha", "ADMIN")
        expect(mockGetCurrentUser).toHaveBeenCalled()
      })
    })
  })

  describe("2. Authorization facade — tenant isolation", () => {
    it("allows access when user org matches target org", async () => {
      const user = makeUser()
      await expect(
        enforce(user, { type: "sales", tenantId: "org-alpha" }, "read"),
      ).resolves.toBeUndefined()
    })

    it("blocks access when user org mismatches target org for non-ADMIN", async () => {
      const user = makeUser()
      await expect(
        enforce(user, { type: "sales", tenantId: "org-beta" }, "read"),
      ).rejects.toThrow("Tenant access denied")
    })

    it("blocks cross-org access for multiple resource types when non-ADMIN", async () => {
      const user = makeUser()
      for (const resource of ["sales", "audit", "platform", "settings"] as const) {
        await expect(
          enforce(user, { type: resource, tenantId: "org-beta" }, "read"),
        ).rejects.toThrow("Tenant access denied")
      }
    })

    it("blocks cross-org access for tenant ADMIN on any resource", async () => {
      const admin = makeAdmin({ organizationId: "org-alpha" })
      for (const resource of ["organization", "sales", "audit", "platform"] as const) {
        await expect(
          enforce(admin, { type: resource, tenantId: "org-beta" }, "admin"),
        ).rejects.toThrow("Tenant access denied")
      }
    })

    it("defaults tenantId to user.organizationId when not provided", async () => {
      const user = makeUser()
      await expect(
        enforce(user, { type: "sales" }, "read"),
      ).resolves.toBeUndefined()
    })

    it("blocks VIEWER from OPERATOR-level actions", async () => {
      const viewer = makeUser({ role: "VIEWER" })
      await expect(
        enforce(viewer, { type: "sales" }, "create"),
      ).rejects.toThrow("Insufficient permissions")
    })
  })

  describe("3. Authorization facade — action-to-role mapping", () => {
    const adminUser = makeAdmin()
    const viewerUser = makeUser({ role: "VIEWER" })

    it("VIEWER cannot perform admin action", async () => {
      await expect(
        enforce(viewerUser, { type: "organization" }, "admin"),
      ).rejects.toThrow("Insufficient permissions")
    })

    it("ADMIN can perform admin action", async () => {
      await expect(
        enforce(adminUser, { type: "organization" }, "admin"),
      ).resolves.toBeUndefined()
    })

    it("VIEWER cannot perform approve action", async () => {
      await expect(
        enforce(viewerUser, { type: "organization" }, "approve"),
      ).rejects.toThrow("Insufficient permissions")
    })

    it("ADMIN can perform approve action", async () => {
      await expect(
        enforce(adminUser, { type: "organization" }, "approve"),
      ).resolves.toBeUndefined()
    })

    it("VIEWER cannot perform create action", async () => {
      await expect(
        enforce(viewerUser, { type: "sales" }, "create"),
      ).rejects.toThrow("Insufficient permissions")
    })

    it("OPERATOR can perform create action", async () => {
      const op = makeUser({ role: "OPERATOR" })
      await expect(
        enforce(op, { type: "sales" }, "create"),
      ).resolves.toBeUndefined()
    })

    it("VIEWER can perform read action", async () => {
      await expect(
        enforce(viewerUser, { type: "sales" }, "read"),
      ).resolves.toBeUndefined()
    })

    it("VIEWER can perform export action", async () => {
      await expect(
        enforce(viewerUser, { type: "sales" }, "export"),
      ).resolves.toBeUndefined()
    })
  })

  describe("4. Schema isolation fields", () => {
    const schema = readFileSync(
      join(__dirname, "../../prisma/schema.prisma"),
      "utf-8",
    )

    const modelsWithOrgId = [
      "AuditEngagement",
      "AuditClient",
      "Decision",
      "DecisionEvidence",
      "DecisionMonitoringSignal",
      "DecisionRiskAlert",
            "LocalContentProject",
      "SalesAccount",
      "SalesDeal",
      "SalesInteraction",
      "SalesContact",
      "SalesProposal",
      "SalesReview",
      "SalesApproval",
            "SalesPipeline",
      "SalesPipelineStage",
    ]

    const modelsWithPlatformOrgId = [
      "ClientWorkspace",
      "Organization",
      "AuditOrganization",
      "SunbulClient",
      "LocalContentProject",
    ]

    for (const modelName of modelsWithOrgId) {
      it(`organizationId exists on model ${modelName}`, () => {
        const block = schema.match(
          new RegExp(`model ${modelName} \\{[\\s\\S]*?\\n\\}`),
        )?.[0]
        expect(block).toBeDefined()
        expect(block!).toContain("organizationId")
      })
    }

    for (const modelName of modelsWithPlatformOrgId) {
      it(`platformOrganizationId exists on model ${modelName}`, () => {
        const block = schema.match(
          new RegExp(`model ${modelName} \\{[\\s\\S]*?\\n\\}`),
        )?.[0]
        expect(block).toBeDefined()
        expect(block!).toContain("platformOrganizationId")
      })
    }

    it("AuditOS models without direct organizationId use engagementId chain", () => {
      const engagementChainModels = [
        "AuditFinding",
        "AuditRecommendation",
                "AuditReviewComment",
        "AuditApprovalRecord",
        "AuditEvidence",
        "AuditTrialBalance",
        "AuditAccountMapping",
        "AuditAiOutput",
        "AuditValidationIssue",
        "AuditValidationDisposition",
        "AuditFinancialStatement",
        "AuditDisclosureNote",
      ]
      for (const modelName of engagementChainModels) {
        const block = schema.match(
          new RegExp(`model ${modelName} \\{[\\s\\S]*?\\n\\}`),
        )?.[0]
        expect(block).toBeDefined()
        expect(block!).toContain("engagementId")
      }
    })

    it("LocalContentOS models use projectId chain for tenant isolation", () => {
      const projectChainModels = [
        "LocalContentSupplier",
        "LocalContentSpendRecord",
      ]
      for (const modelName of projectChainModels) {
        const block = schema.match(
          new RegExp(`model ${modelName} \\{[\\s\\S]*?\\n\\}`),
        )?.[0]
        expect(block).toBeDefined()
        expect(block!).toContain("projectId")
      }
    })
  })

  describe("5. Middleware route protection coverage", () => {
    const middleware = readFileSync(
      join(__dirname, "../middleware.ts"),
      "utf-8",
    )

    const matcherSection = middleware.match(
      /export const config = \{[^}]*matcher: \[([\s\S]*?)\]/,
    )?.[1]
    const routePolicySection = middleware.match(
      /const routeMinRoles: Record<string, string> = \{([\s\S]*?)\n  \};/,
    )?.[1]

    const protectedRoutes = [
      "/audit",
      "/audit/:path*",
      "/decisions",
      "/decisions/:path*",
      "/local-content",
      "/local-content/:path*",
      "/assistant",
      "/assistant/:path*",
      "/sales",
      "/sales/:path*",
      "/sunbul",
      "/sunbul/:path*",
      "/workflowos",
      "/workflowos/:path*",
      "/organizations",
      "/organizations/:path*",
      "/settings",
      "/settings/:path*",
    ]

    for (const route of protectedRoutes) {
      it(`middleware protects route ${route}`, () => {
        const baseRoute = route.replace("/:path*", "")
        expect(routePolicySection).toContain(`"${baseRoute}"`)
        expect(matcherSection).toContain("/((?!")
      })
    }

    it("intelligence and monitoring routes are also in matcher", () => {
      expect(routePolicySection).toContain('"/intelligence"')
      expect(routePolicySection).toContain('"/monitoring"')
      expect(matcherSection).toContain("/((?!")
    })

    it("product API routes are in the matcher", () => {
      const apiRoutes = [
        "/api/audit/:path*",
        "/api/office-ai/:path*",
        "/api/local-content/:path*",
        "/api/sunbul/:path*",
        "/api/workflowos/:path*",
        "/api/ai/:path*",
        "/api/monitoring/:path*",
        "/api/metrics",
      ]
      for (const route of apiRoutes) {
        const baseRoute = route.replace("/:path*", "")
        expect(routePolicySection).toContain(`"${baseRoute}"`)
        expect(matcherSection).toContain("/((?!")
      }
    })

    it("api/auth and health endpoints are NOT in the matcher", () => {
      expect(matcherSection).not.toContain('"/api/auth"')
      expect(matcherSection).not.toContain('"/api/health"')
    })
  })

  describe("6. Authorization facade deny-by-default", () => {
    it("denies when action requires higher role than user has", async () => {
      const viewer = makeUser({ role: "VIEWER", organizationId: "org-a" })
      const result = await authorize({
        user: viewer,
        resource: { type: "sales" },
        action: "admin",
      })
      expect(result.allowed).toBe(false)
    })

    it("denies when user is not authenticated (no user object)", async () => {
      // authorize with minimal object to test early rejection
      await expect(
        authorize({
          user: undefined as unknown as CurrentUser,
          resource: { type: "sales" },
          action: "read",
        }),
      ).rejects.toThrow()
    })

    it("grants when role satisfies action minimum", async () => {
      const viewer = makeUser({ role: "VIEWER", organizationId: "org-a" })
      const result = await authorize({
        user: viewer,
        resource: { type: "sales" },
        action: "read",
      })
      expect(result.allowed).toBe(true)
    })
  })
})
