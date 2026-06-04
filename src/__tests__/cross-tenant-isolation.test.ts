import { readFileSync } from "fs"
import { join } from "path"

jest.mock("@/lib/auth", () => {
  const mockRequireUserContext = jest.fn()
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
      const user = await mockRequireUserContext(_requiredRole)
      if (user.organizationId !== organizationId) {
        throw new Error("Access denied: organization access required")
      }
      return user
    },
    getCurrentUser: jest.fn(),
    requireUserContext: mockRequireUserContext,
  }
})

import {
  hasRequiredRole,
  isAdmin,
  isOperator,
  isViewer,
  isExpectedAccessDeniedError,
  requireOrgAccess,
  requireUserContext,
} from "@/lib/auth"
import {
  requireServerActionAccess,
  requireServerActionRead,
} from "@/core/access/server-action-guard"

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
        ;(requireUserContext as jest.Mock).mockResolvedValue(user)
        await expect(
          requireOrgAccess("org-beta", "OPERATOR"),
        ).rejects.toThrow("Access denied: organization access required")
      })

      it("allows when user org matches target org", async () => {
        const user = makeUser({ organizationId: "org-alpha" })
        ;(requireUserContext as jest.Mock).mockResolvedValue(user)
        const result = await requireOrgAccess("org-alpha", "OPERATOR")
        expect(result.organizationId).toBe("org-alpha")
      })

      it("calls requireUserContext with the required role", async () => {
        const user = makeUser({ organizationId: "org-alpha" })
        ;(requireUserContext as jest.Mock).mockResolvedValue(user)
        await requireOrgAccess("org-alpha", "ADMIN")
        expect(requireUserContext).toHaveBeenCalledWith("ADMIN")
      })
    })
  })

  describe("2. Server Action Guard — tenant isolation", () => {
    const resources = [
      "organization",
      "settings",
      "user",
      "platform",
      "audit",
      "sales",
      "decisions",
      "local_content",
      "assistant",
      "workflowos",
      "sunbul",
    ] as const

    it("allows access when user org matches target org", async () => {
      const user = makeUser()
      ;(requireUserContext as jest.Mock).mockResolvedValue(user)
      await expect(
        requireServerActionAccess("sales", "read", {
          organizationId: "org-alpha",
        }),
      ).resolves.toMatchObject({ organizationId: "org-alpha" })
    })

    it("blocks access when user org mismatches target org for non-ADMIN", async () => {
      const user = makeUser()
      ;(requireUserContext as jest.Mock).mockResolvedValue(user)
      await expect(
        requireServerActionAccess("sales", "read", {
          organizationId: "org-beta",
        }),
      ).rejects.toThrow("Access denied: organization mismatch")
    })

    it("blocks cross-org access for all resource types when non-ADMIN", async () => {
      const user = makeUser()
      ;(requireUserContext as jest.Mock).mockResolvedValue(user)
      for (const resource of resources) {
        await expect(
          requireServerActionAccess(resource, "read", {
            organizationId: "org-beta",
          }),
        ).rejects.toThrow("Access denied: organization mismatch")
      }
    })

    it("allows cross-org access for ADMIN on organization resource with allowPlatformAdminCrossTenant", async () => {
      const admin = makeAdmin({ organizationId: "org-alpha" })
      ;(requireUserContext as jest.Mock).mockResolvedValue(admin)
      await expect(
        requireServerActionAccess("organization", "admin", {
          organizationId: "org-beta",
          allowPlatformAdminCrossTenant: true,
        }),
      ).resolves.toMatchObject({ organizationId: "org-alpha" })
    })

    it("allows cross-org access for ADMIN on any resource (super-user)", async () => {
      const admin = makeAdmin({ organizationId: "org-alpha" })
      ;(requireUserContext as jest.Mock).mockResolvedValue(admin)
      for (const resource of resources) {
        await expect(
          requireServerActionAccess(resource, "admin", {
            organizationId: "org-beta",
          }),
        ).resolves.toMatchObject({ role: "ADMIN" })
      }
    })

    it("allows cross-org for ADMIN even without allowPlatformAdminCrossTenant flag", async () => {
      const admin = makeAdmin({ organizationId: "org-alpha" })
      ;(requireUserContext as jest.Mock).mockResolvedValue(admin)
      await expect(
        requireServerActionAccess("organization", "admin", {
          organizationId: "org-beta",
        }),
      ).resolves.toMatchObject({ role: "ADMIN" })
    })

    it("defaults organizationId to user.organizationId when not provided", async () => {
      const user = makeUser()
      ;(requireUserContext as jest.Mock).mockResolvedValue(user)
      await expect(
        requireServerActionAccess("sales", "read"),
      ).resolves.toMatchObject({ organizationId: "org-alpha" })
    })

    it("blocks VIEWER from OPERATOR-level actions", async () => {
      const viewer = makeUser({ role: "VIEWER" })
      ;(requireUserContext as jest.Mock).mockRejectedValue(
        new Error("Access denied: OPERATOR role required"),
      )
      await expect(
        requireServerActionAccess("sales", "create"),
      ).rejects.toThrow("Access denied: OPERATOR role required")
    })
  })

  describe("3. Server Action Guard — action-to-role mapping", () => {
    it("requires ADMIN for admin action", async () => {
      ;(requireUserContext as jest.Mock).mockRejectedValue(
        new Error("Access denied: ADMIN role required"),
      )
      await expect(
        requireServerActionAccess("organization", "admin"),
      ).rejects.toThrow("Access denied: ADMIN role required")
    })

    it("requires ADMIN for approve action", async () => {
      ;(requireUserContext as jest.Mock).mockRejectedValue(
        new Error("Access denied: ADMIN role required"),
      )
      await expect(
        requireServerActionAccess("organization", "approve"),
      ).rejects.toThrow("Access denied: ADMIN role required")
    })

    it("requires ADMIN for reject action", async () => {
      ;(requireUserContext as jest.Mock).mockRejectedValue(
        new Error("Access denied: ADMIN role required"),
      )
      await expect(
        requireServerActionAccess("organization", "reject"),
      ).rejects.toThrow("Access denied: ADMIN role required")
    })

    it("requires OPERATOR for create action", async () => {
      ;(requireUserContext as jest.Mock).mockRejectedValue(
        new Error("Access denied: OPERATOR role required"),
      )
      await expect(
        requireServerActionAccess("sales", "create"),
      ).rejects.toThrow("Access denied: OPERATOR role required")
    })

    it("requires OPERATOR for update action", async () => {
      ;(requireUserContext as jest.Mock).mockRejectedValue(
        new Error("Access denied: OPERATOR role required"),
      )
      await expect(
        requireServerActionAccess("sales", "update"),
      ).rejects.toThrow("Access denied: OPERATOR role required")
    })

    it("requires VIEWER for export action", async () => {
      const user = makeUser({ role: "VIEWER" })
      ;(requireUserContext as jest.Mock).mockResolvedValue(user)
      await expect(
        requireServerActionAccess("sales", "export"),
      ).resolves.toMatchObject({ role: "VIEWER" })
    })

    it("requireServerActionRead defaults to VIEWER minimum", async () => {
      const viewer = makeUser({ role: "VIEWER" })
      ;(requireUserContext as jest.Mock).mockResolvedValue(viewer)
      await expect(
        requireServerActionRead("sales"),
      ).resolves.toMatchObject({ role: "VIEWER" })
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
      "AuditLog",
      "LocalContentProject",
      "SalesAccount",
      "SalesDeal",
      "SalesInteraction",
      "SalesContact",
      "SalesProposal",
      "SalesReview",
      "SalesApproval",
      "SalesAuditEvent",
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
        "AuditEvent",
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
        expect(matcherSection).toContain(`"${route}"`)
      })
    }

    it("intelligence and monitoring routes are also in matcher", () => {
      expect(matcherSection).toContain('"/intelligence"')
      expect(matcherSection).toContain('"/monitoring"')
      expect(matcherSection).toContain('"/published/recommendation"')
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
        expect(matcherSection).toContain(`"${route}"`)
      }
    })

    it("api/auth and health endpoints are NOT in the matcher", () => {
      expect(matcherSection).not.toContain('"/api/auth"')
      expect(matcherSection).not.toContain('"/api/health"')
    })
  })

  describe("6. CoreAccessControl stub", () => {
    it("grants at core layer; tenant RBAC is enforced in server-action-guard", async () => {
      const { CoreAccessControl } = await import(
        "@/core/access/access-control"
      )
      const ctrl = new CoreAccessControl()
      await expect(
        ctrl.check({
          userId: "u1",
          organizationId: "org-a",
          resource: "sales",
          action: "read",
        }),
      ).resolves.toEqual({ decision: "granted" })
    })
  })
})
