// ─── Unit Test: Admin Actions ───
// Tests listUsers, updateUserRole, getSystemConfig, getPlatformStats
// Uses mocked dependencies -- no database required.

// ─── Mocks (hoisted before imports) ───

const mockGetCurrentUser = jest.fn()
jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args) => mockGetCurrentUser(...args),
}))

const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  organization: { count: jest.fn() },
  auditEngagement: { count: jest.fn() },
  decision: { count: jest.fn() },
  auditEvent: { count: jest.fn() },
  auditEvidence: { count: jest.fn() },
}
jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}))

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

// Mock notification actions since admin-actions imports createNotification
jest.mock("@/actions/notification-actions", () => ({
  createNotification: jest.fn().mockResolvedValue({ id: "notif-1" }),
}))

// ─── Imports (after mocks) ───

import { listUsers, updateUserRole, getSystemConfig, getPlatformStats } from "@/actions/admin-actions"

// ─── Helpers ───

function makeAdmin(overrides: Record<string, string> = {}) {
  return { id: "admin-1", role: "ADMIN", organizationId: "org-1", ...overrides }
}

// ─── Tests ───

describe("Admin Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("listUsers", () => {
    it("returns users when caller is admin", async () => {
      mockGetCurrentUser.mockResolvedValue(makeAdmin())
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "u1", name: "User", email: "u@t.com", role: "OPERATOR" },
      ])

      const result = await listUsers("org-1")

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { organizationId: "org-1" } }),
      )
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("u1")
    })

    it("throws when not authenticated (null user)", async () => {
      mockGetCurrentUser.mockResolvedValue(null)
      await expect(listUsers("org-1")).rejects.toThrow("Authentication required")
    })

    it("throws when not admin", async () => {
      mockGetCurrentUser.mockResolvedValue(makeAdmin({ role: "OPERATOR" }))
      await expect(listUsers("org-1")).rejects.toThrow("Admin access required")
    })
  })

  describe("updateUserRole", () => {
    it("updates role for valid roles", async () => {
      mockGetCurrentUser.mockResolvedValue(makeAdmin())
      mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", organizationId: "org-1" })
      mockPrisma.user.update.mockResolvedValue({ id: "u1", role: "OPERATOR" })

      const result = await updateUserRole("u1", "OPERATOR", "org-1")

      expect(result.success).toBe(true)
      expect(result.newRole).toBe("OPERATOR")
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { role: "OPERATOR" },
      })
    })

    it("rejects invalid roles", async () => {
      mockGetCurrentUser.mockResolvedValue(makeAdmin())
      await expect(updateUserRole("u1", "INVALID", "org-1")).rejects.toThrow("Invalid role")
    })

    it("throws when user not found", async () => {
      mockGetCurrentUser.mockResolvedValue(makeAdmin())
      mockPrisma.user.findUnique.mockResolvedValue(null)
      await expect(updateUserRole("u1", "OPERATOR", "org-1")).rejects.toThrow("User not found")
    })

    it("throws when user belongs to another organization", async () => {
      mockGetCurrentUser.mockResolvedValue(makeAdmin())
      mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", organizationId: "org-2" })
      await expect(updateUserRole("u1", "OPERATOR", "org-1")).rejects.toThrow("Access denied")
    })
  })

  describe("getSystemConfig", () => {
    it("returns config from environment", async () => {
      mockGetCurrentUser.mockResolvedValue(makeAdmin())
      const prevNodeEnv = process.env.NODE_ENV

      process.env.NODE_ENV = "test"
      process.env.STORAGE_PROVIDER = "s3"
      process.env.FF_ABAC_ENFORCE = "true"

      const config = await getSystemConfig("org-1")

      expect(config.environment).toBe("test")
      expect(config.storageProvider).toBe("s3")
      expect(config.features.abacEnforce).toBe(true)
      expect(config.features).toHaveProperty("abacShadow")
      expect(config.features).toHaveProperty("eventOutbox")
      expect(config.features).toHaveProperty("schemaRegistry")
      expect(config.features).toHaveProperty("aiProviders")

      // Restore
      process.env.NODE_ENV = prevNodeEnv
    })
  })

  describe("getPlatformStats", () => {
    it("returns platform statistics", async () => {
      mockGetCurrentUser.mockResolvedValue(makeAdmin())
      mockPrisma.user.count.mockResolvedValue(10)
      mockPrisma.organization.count.mockResolvedValue(3)
      mockPrisma.auditEngagement.count.mockResolvedValue(25)
      mockPrisma.decision.count.mockResolvedValue(50)
      mockPrisma.auditEvent.count.mockResolvedValue(1000)
      mockPrisma.auditEvidence.count.mockResolvedValue(200)

      const stats = await getPlatformStats("org-1")

      expect(stats.users).toBe(10)
      expect(stats.organizations).toBe(3)
      expect(stats.engagements).toBe(25)
      expect(stats.decisions).toBe(50)
      expect(stats.auditEvents).toBe(1000)
      expect(stats.evidenceFiles).toBe(200)
    })

    it("passes organizationId filter to counts", async () => {
      mockGetCurrentUser.mockResolvedValue(makeAdmin())
      mockPrisma.user.count.mockResolvedValue(0)
      mockPrisma.organization.count.mockResolvedValue(0)
      mockPrisma.auditEngagement.count.mockResolvedValue(0)
      mockPrisma.decision.count.mockResolvedValue(0)
      mockPrisma.auditEvent.count.mockResolvedValue(0)
      mockPrisma.auditEvidence.count.mockResolvedValue(0)

      await getPlatformStats("org-x")

      expect(mockPrisma.user.count).toHaveBeenCalledWith({ where: { organizationId: "org-x" } })
      expect(mockPrisma.auditEngagement.count).toHaveBeenCalledWith({ where: { organizationId: "org-x" } })
      expect(mockPrisma.decision.count).toHaveBeenCalledWith({ where: { organizationId: "org-x" } })
    })
  })
})
