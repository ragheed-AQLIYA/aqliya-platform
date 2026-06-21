// ─── Audit Search Tests ───
// اختبارات بحث التدقيق الموحد

import { searchAuditLogs } from "../audit-store"
import { prisma } from "@/lib/prisma"

// ── Prisma mock ──
jest.mock("@/lib/prisma", () => ({
  prisma: {
    platformAuditLog: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as unknown as {
  platformAuditLog: {
    findMany: jest.Mock
    count: jest.Mock
  }
}

function makeLog(overrides: Record<string, unknown> = {}) {
  return {
    id: "log-1",
    productKey: "audit_os",
    action: "engagement.created",
    actorId: "user-1",
    actorType: "user",
    actorName: "أحمد",
    actorEmail: "ahmed@test.com",
    targetType: "engagement",
    targetId: "eng-1",
    targetLabel: null,
    severity: "info",
    status: "recorded",
    platformOrganizationId: "org-1",
    clientWorkspaceId: null,
    projectId: null,
    sourceSystem: null,
    sourceId: null,
    metadata: null,
    createdAt: new Date("2026-06-01"),
    hashChainEntry: null,
    ...overrides,
  }
}

describe("searchAuditLogs", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns entries and total count", async () => {
    const rows = [makeLog()]
    mockPrisma.platformAuditLog.findMany.mockResolvedValue(rows)
    mockPrisma.platformAuditLog.count.mockResolvedValue(1)

    const result = await searchAuditLogs({})

    expect(result.entries).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.hasMore).toBe(false)
  })

  it("filters by productKey", async () => {
    mockPrisma.platformAuditLog.findMany.mockResolvedValue([])
    mockPrisma.platformAuditLog.count.mockResolvedValue(0)

    await searchAuditLogs({ productKey: "sales_os" })

    expect(mockPrisma.platformAuditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ productKey: "sales_os" }),
      }),
    )
  })

  it("filters by date range", async () => {
    mockPrisma.platformAuditLog.findMany.mockResolvedValue([])
    mockPrisma.platformAuditLog.count.mockResolvedValue(0)

    const fromDate = new Date("2026-01-01")
    const toDate = new Date("2026-06-30")

    await searchAuditLogs({ fromDate, toDate })

    expect(mockPrisma.platformAuditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: { gte: fromDate, lte: toDate },
        }),
      }),
    )
  })

  it("reports chainVerified true when hashChainEntry exists", async () => {
    const rows = [makeLog({ hashChainEntry: { id: "chain-1" } })]
    mockPrisma.platformAuditLog.findMany.mockResolvedValue(rows)
    mockPrisma.platformAuditLog.count.mockResolvedValue(1)

    const result = await searchAuditLogs({})

    expect(result.entries[0].chainVerified).toBe(true)
  })

  it("reports chainVerified false when no hashChainEntry", async () => {
    const rows = [makeLog({ hashChainEntry: null })]
    mockPrisma.platformAuditLog.findMany.mockResolvedValue(rows)
    mockPrisma.platformAuditLog.count.mockResolvedValue(1)

    const result = await searchAuditLogs({})

    expect(result.entries[0].chainVerified).toBe(false)
  })

  it("handles findMany error gracefully", async () => {
    mockPrisma.platformAuditLog.findMany.mockRejectedValue(
      new Error("DB down"),
    )
    mockPrisma.platformAuditLog.count.mockRejectedValue(new Error("DB down"))

    const result = await searchAuditLogs({})

    expect(result.entries).toEqual([])
    expect(result.total).toBe(0)
    expect(result.hasMore).toBe(false)
  })

  it("respects limit and offset", async () => {
    mockPrisma.platformAuditLog.findMany.mockResolvedValue([])
    mockPrisma.platformAuditLog.count.mockResolvedValue(100)

    await searchAuditLogs({ limit: 10, offset: 20 })

    expect(mockPrisma.platformAuditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, skip: 20 }),
    )
  })

  it("caps limit at 200", async () => {
    mockPrisma.platformAuditLog.findMany.mockResolvedValue([])
    mockPrisma.platformAuditLog.count.mockResolvedValue(500)

    await searchAuditLogs({ limit: 999 })

    expect(mockPrisma.platformAuditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 200 }),
    )
  })
})
