import { describe, expect, it, beforeEach, jest } from "@jest/globals"

// ─── Mock Prisma ───

const mockDealFindUnique = jest.fn()
const mockDealFindMany = jest.fn()

jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesDeal: {
      findUnique: mockDealFindUnique,
      findMany: mockDealFindMany,
    },
  },
}))

// Mock audit log to prevent noise
jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest
    .fn()
    .mockResolvedValue({ ok: true, id: "audit-1" }),
}))

import {
  scoreDeal,
  getDealHealth,
  listDealHealth,
  createForecast,
  getForecast,
  listForecasts,
  calculateForecast,
  getPipelineAnalytics,
  getWinRateAnalysis,
  getVelocityMetrics,
  _resetForecastsForTest,
} from "../index"

// ─── Helpers ───

function makeDeal(overrides: Record<string, unknown> = {}) {
  const base = {
    id: "deal-1",
    organizationId: "org-1",
    accountId: "acct-1",
    title: "Test Deal",
    status: "open",
    amount: 100000,
    currency: "SAR",
    probability: 50,
    expectedCloseDate: new Date("2026-12-31"),
    isDemo: false,
    metadata: null,
    createdById: "user-1",
    updatedById: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-06-01"),
    stageId: "stage-1",
    stage: {
      id: "stage-1",
      pipelineId: "pipe-1",
      organizationId: "org-1",
      platformOrganizationId: null,
      name: "Qualifying",
      slug: "qualifying",
      sortOrder: 2,
      isClosed: false,
      status: "active",
      metadata: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    },
    interactions: [
      {
        id: "int-1",
        organizationId: "org-1",
        platformOrganizationId: null,
        accountId: "acct-1",
        dealId: "deal-1",
        type: "meeting",
        subject: "Discovery Call",
        summary: "Discussed requirements",
        occurredAt: new Date(),
        metadata: null,
        createdById: "user-1",
        createdAt: new Date("2026-06-01"),
        updatedAt: new Date("2026-06-01"),
      },
    ],
    ...overrides,
  }

  // If stage is explicitly set to null, override the nested stage
  if (overrides.stage === null) {
    base.stage = null as unknown as Record<string, unknown>
  }

  return base
}

function seedOrgDeals(orgId: string, count: number) {
  const deals = []
  for (let i = 0; i < count; i++) {
    deals.push({
      id: `${orgId}-deal-${i}`,
      organizationId: orgId,
      amount: 50000 + i * 10000,
      isDemo: false,
    })
  }
  return deals
}

beforeEach(() => {
  jest.clearAllMocks()
  _resetForecastsForTest()
})

// ─── scoreDeal ───

describe("scoreDeal", () => {
  it("throws error for empty dealId", async () => {
    await expect(scoreDeal("")).rejects.toThrow("Deal ID is required")
  })

  it("throws error when deal not found", async () => {
    mockDealFindUnique.mockResolvedValue(null)
    await expect(scoreDeal("nonexistent")).rejects.toThrow("Deal not found")
  })

  it("computes HEALTHY score for a strong deal", async () => {
    const deal = makeDeal({
      probability: 100,
      amount: 500000,
      stage: { slug: "closed_won", name: "Closed Won" },
    })
    mockDealFindUnique.mockResolvedValue(deal)
    mockDealFindMany.mockResolvedValue([
      { amount: 100000 },
      { amount: 150000 },
      { amount: 50000 },
    ])

    const result = await scoreDeal("deal-1")
    expect(result.healthLevel).toBe("HEALTHY")
    expect(result.score).toBeGreaterThanOrEqual(70)
    expect(result.dealId).toBe("deal-1")
  })

  it("computes AT_RISK score for a weak deal", async () => {
    const deal = makeDeal({
      probability: 10,
      amount: 5000,
      stage: { slug: "drafting", name: "Drafting" },
    })
    mockDealFindUnique.mockResolvedValue(deal)
    mockDealFindMany.mockResolvedValue([
      { amount: 100000 },
      { amount: 150000 },
      { amount: 50000 },
    ])

    const result = await scoreDeal("deal-1")
    expect(result.healthLevel).toBe("AT_RISK")
    expect(result.score).toBeLessThan(40)
  })

  it("computes WATCH score for mid-range deal", async () => {
    const deal = makeDeal({
      probability: 60,
      amount: 100000,
      stage: { slug: "proposal", name: "Proposal" },
    })
    mockDealFindUnique.mockResolvedValue(deal)
    mockDealFindMany.mockResolvedValue([
      { amount: 100000 },
      { amount: 150000 },
      { amount: 50000 },
    ])

    const result = await scoreDeal("deal-1")
    expect(result.healthLevel).toBe("WATCH")
    expect(result.score).toBeGreaterThanOrEqual(40)
    expect(result.score).toBeLessThan(70)
  })

  it("awards max recency score for recent interaction", async () => {
    const deal = makeDeal({
      interactions: [
        {
          id: "int-recent",
          organizationId: "org-1",
          platformOrganizationId: null,
          accountId: "acct-1",
          dealId: "deal-1",
          type: "email",
          subject: "Follow-up",
          summary: "Quick check-in",
          occurredAt: new Date(),
          metadata: null,
          createdById: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })
    mockDealFindUnique.mockResolvedValue(deal)
    mockDealFindMany.mockResolvedValue([
      { amount: 100000 },
    ])

    const result = await scoreDeal("deal-1")
    expect(result.recencyScore).toBe(20)
  })

  it("awards zero recency score for old interaction", async () => {
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 60)
    const deal = makeDeal({
      interactions: [
        {
          id: "int-old",
          organizationId: "org-1",
          platformOrganizationId: null,
          accountId: "acct-1",
          dealId: "deal-1",
          type: "email",
          subject: "Old",
          summary: "Old interaction",
          occurredAt: oldDate,
          metadata: null,
          createdById: "user-1",
          createdAt: oldDate,
          updatedAt: oldDate,
        },
      ],
    })
    mockDealFindUnique.mockResolvedValue(deal)
    mockDealFindMany.mockResolvedValue([
      { amount: 100000 },
    ])

    const result = await scoreDeal("deal-1")
    expect(result.recencyScore).toBe(0)
  })

  it("computes stageScore correctly per stage slug", async () => {
    const stageTests = [
      { slug: "drafting", expected: 0 },
      { slug: "qualifying", expected: 10 },
      { slug: "proposal", expected: 40 },
      { slug: "negotiation", expected: 65 },
      { slug: "closing", expected: 80 },
      { slug: "closed_won", expected: 100 },
    ]

    for (const { slug, expected } of stageTests) {
      const deal = makeDeal({
        id: `deal-${slug}`,
        stage: { slug, name: slug.charAt(0).toUpperCase() + slug.slice(1) },
      })
      mockDealFindUnique.mockResolvedValue(deal)
      mockDealFindMany.mockResolvedValue([{ amount: 100000 }])

      const result = await scoreDeal(`deal-${slug}`)
      expect(result.stageScore).toBe(expected)
    }
  })

  it("caps score at 100", async () => {
    const deal = makeDeal({
      probability: 100,
      amount: 999999999,
      stage: { slug: "closed_won", name: "Closed Won" },
      interactions: [
        {
          id: "int-today",
          organizationId: "org-1",
          platformOrganizationId: null,
          accountId: "acct-1",
          dealId: "deal-1",
          type: "meeting",
          subject: "Final",
          summary: "Final meeting",
          occurredAt: new Date(),
          metadata: null,
          createdById: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })
    mockDealFindUnique.mockResolvedValue(deal)
    mockDealFindMany.mockResolvedValue([{ amount: 100000 }])

    const result = await scoreDeal("deal-1")
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.healthLevel).toBe("HEALTHY")
  })
})

// ─── getDealHealth ───

describe("getDealHealth", () => {
  it("returns DealHealthIndicator for valid deal", async () => {
    const deal = makeDeal()
    mockDealFindUnique.mockResolvedValue(deal)
    mockDealFindMany.mockResolvedValue([{ amount: 100000 }])

    const result = await getDealHealth("deal-1")
    expect(result).not.toBeNull()
    expect(result!.dealId).toBe("deal-1")
    expect(result!.organizationId).toBe("org-1")
    expect(result!.score).toBeGreaterThanOrEqual(0)
    expect(result!.score).toBeLessThanOrEqual(100)
    expect(["HEALTHY", "WATCH", "AT_RISK"]).toContain(result!.healthLevel)
  })

  it("returns null when deal not found", async () => {
    mockDealFindUnique.mockResolvedValue(null)
    const result = await getDealHealth("nonexistent")
    expect(result).toBeNull()
  })

  it("includes all sub-scores in result", async () => {
    const deal = makeDeal({ stage: { slug: "negotiation", name: "Negotiation" } })
    mockDealFindUnique.mockResolvedValue(deal)
    mockDealFindMany.mockResolvedValue([{ amount: 100000 }])

    const result = await getDealHealth("deal-1")
    expect(result).not.toBeNull()
    expect(result!.stageScore).toBeGreaterThanOrEqual(0)
    expect(result!.valueScore).toBeGreaterThanOrEqual(0)
    expect(result!.recencyScore).toBeGreaterThanOrEqual(0)
    expect(result!.probabilityScore).toBeGreaterThanOrEqual(0)
  })
})

// ─── listDealHealth ───

describe("listDealHealth", () => {
  it("throws error for empty orgId", async () => {
    await expect(listDealHealth("")).rejects.toThrow("Organization ID is required")
  })

  it("returns health indicators for all open deals", async () => {
    // findMany for listDealHealth: get deals
    // Then findUnique + findMany for each deal in getDealHealth
    mockDealFindMany
      .mockResolvedValueOnce([
        makeDeal({ id: "deal-1" }),
        makeDeal({ id: "deal-2" }),
      ])
      .mockResolvedValueOnce([{ amount: 100000 }])
      .mockResolvedValueOnce([{ amount: 100000 }])
    mockDealFindUnique
      .mockResolvedValueOnce(makeDeal({ id: "deal-1" }))
      .mockResolvedValueOnce(makeDeal({ id: "deal-2" }))

    const results = await listDealHealth("org-1")
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBe(2)
  })

  it("filters by pipelineId when provided", async () => {
    mockDealFindMany.mockResolvedValue([])
    const results = await listDealHealth("org-1", "pipe-1")
    expect(results).toEqual([])
  })

  it("returns empty array when no deals", async () => {
    mockDealFindMany.mockResolvedValue([])
    const results = await listDealHealth("org-1")
    expect(results).toEqual([])
  })
})

// ─── createForecast ───

describe("createForecast", () => {
  it("creates and returns a forecast", async () => {
    const forecast = await createForecast("org-1", {
      name: "Q3 2026 Forecast",
      period: "QUARTERLY",
      periodStart: new Date("2026-07-01"),
      periodEnd: new Date("2026-09-30"),
      expectedRevenue: 5000000,
      createdById: "user-1",
      confidencePct: 75,
      notes: "Based on current pipeline",
    })

    expect(forecast.id).toBeTruthy()
    expect(forecast.organizationId).toBe("org-1")
    expect(forecast.name).toBe("Q3 2026 Forecast")
    expect(forecast.period).toBe("QUARTERLY")
    expect(forecast.expectedRevenue).toBe(5000000)
    expect(forecast.confidencePct).toBe(75)
    expect(forecast.status).toBe("DRAFT")
    expect(forecast.notes).toBe("Based on current pipeline")
  })

  it("throws error for empty orgId", async () => {
    await expect(
      createForecast("", {
        name: "Test",
        period: "MONTHLY",
        periodStart: new Date(),
        periodEnd: new Date(),
        expectedRevenue: 0,
        createdById: "user-1",
      }),
    ).rejects.toThrow("Organization ID is required")
  })

  it("defaults confidencePct to null when not provided", async () => {
    const forecast = await createForecast("org-1", {
      name: "Test Forecast",
      period: "MONTHLY",
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-01-31"),
      expectedRevenue: 100000,
      createdById: "user-1",
    })

    expect(forecast.confidencePct).toBeNull()
    expect(forecast.notes).toBeNull()
  })
})

// ─── getForecast ───

describe("getForecast", () => {
  it("returns null for nonexistent forecast", async () => {
    const result = await getForecast("nonexistent")
    expect(result).toBeNull()
  })

  it("returns forecast by id", async () => {
    const created = await createForecast("org-1", {
      name: "Test Forecast",
      period: "YEARLY",
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-12-31"),
      expectedRevenue: 10000000,
      createdById: "user-1",
    })

    const found = await getForecast(created.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
    expect(found!.name).toBe("Test Forecast")
  })
})

// ─── listForecasts ───

describe("listForecasts", () => {
  it("returns forecasts scoped to orgId", async () => {
    await createForecast("org-1", {
      name: "Org1 Q3",
      period: "QUARTERLY",
      periodStart: new Date("2026-07-01"),
      periodEnd: new Date("2026-09-30"),
      expectedRevenue: 100000,
      createdById: "user-1",
    })
    await createForecast("org-2", {
      name: "Org2 Q3",
      period: "QUARTERLY",
      periodStart: new Date("2026-07-01"),
      periodEnd: new Date("2026-09-30"),
      expectedRevenue: 200000,
      createdById: "user-2",
    })

    const org1Forecasts = await listForecasts("org-1")
    expect(org1Forecasts.length).toBe(1)
    expect(org1Forecasts[0].name).toBe("Org1 Q3")
  })

  it("filters by period when provided", async () => {
    await createForecast("org-1", {
      name: "Monthly",
      period: "MONTHLY",
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-01-31"),
      expectedRevenue: 10000,
      createdById: "user-1",
    })
    await createForecast("org-1", {
      name: "Yearly",
      period: "YEARLY",
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-12-31"),
      expectedRevenue: 120000,
      createdById: "user-1",
    })

    const monthly = await listForecasts("org-1", "MONTHLY")
    expect(monthly.length).toBe(1)
    expect(monthly[0].name).toBe("Monthly")
  })

  it("throws error for empty orgId", async () => {
    await expect(listForecasts("")).rejects.toThrow("Organization ID is required")
  })
})

// ─── calculateForecast ───

describe("calculateForecast", () => {
  it("calculates weighted revenue from open deals", async () => {
    const forecast = await createForecast("org-1", {
      name: "Q1 2026",
      period: "QUARTERLY",
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-03-31"),
      expectedRevenue: 500000,
      createdById: "user-1",
    })

    mockDealFindMany.mockResolvedValue([
      { amount: 100000, probability: 80 },
      { amount: 200000, probability: 50 },
      { amount: 50000, probability: 100 },
    ])

    const result = await calculateForecast(forecast.id)
    // 100000*0.8 + 200000*0.5 + 50000*1.0 = 80000 + 100000 + 50000 = 230000
    expect(result.weightedRevenue).toBe(230000)
  })

  it("throws error for nonexistent forecast", async () => {
    await expect(calculateForecast("nonexistent")).rejects.toThrow(
      "Forecast not found",
    )
  })

  it("handles deals with null amounts", async () => {
    const forecast = await createForecast("org-1", {
      name: "Test",
      period: "MONTHLY",
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-01-31"),
      expectedRevenue: 0,
      createdById: "user-1",
    })

    mockDealFindMany.mockResolvedValue([
      { amount: null, probability: 50 },
      { amount: 100000, probability: null },
    ])

    const result = await calculateForecast(forecast.id)
    expect(result.weightedRevenue).toBe(0)
  })

  it("returns zero weighted revenue when no open deals in period", async () => {
    const forecast = await createForecast("org-1", {
      name: "Empty",
      period: "MONTHLY",
      periodStart: new Date("2025-01-01"),
      periodEnd: new Date("2025-01-31"),
      expectedRevenue: 100000,
      createdById: "user-1",
    })

    mockDealFindMany.mockResolvedValue([])

    const result = await calculateForecast(forecast.id)
    expect(result.weightedRevenue).toBe(0)
  })
})

// ─── getPipelineAnalytics ───

describe("getPipelineAnalytics", () => {
  it("returns empty analytics when no deals", async () => {
    mockDealFindMany.mockResolvedValue([])
    const result = await getPipelineAnalytics("org-1")
    expect(result.totalDeals).toBe(0)
    expect(result.totalValue).toBe(0)
    expect(result.weightedValue).toBe(0)
    expect(result.avgDealSize).toBe(0)
    expect(result.conversionRate).toBe(0)
  })

  it("computes correct pipeline totals", async () => {
    mockDealFindMany
      .mockResolvedValueOnce([
        makeDeal({ id: "d1", amount: 100000, probability: 80, status: "open" }),
        makeDeal({ id: "d2", amount: 200000, probability: 50, status: "open" }),
      ])
      // For getDealHealth calls (2 deals = 2 findUnique + 2 findMany)
      .mockResolvedValueOnce([{ amount: 100000 }])
      .mockResolvedValueOnce([{ amount: 100000 }])
    mockDealFindUnique
      .mockResolvedValueOnce(makeDeal({ id: "d1", amount: 100000, probability: 80, status: "open" }))
      .mockResolvedValueOnce(makeDeal({ id: "d2", amount: 200000, probability: 50, status: "open" }))

    const result = await getPipelineAnalytics("org-1")
    expect(result.totalDeals).toBe(2)
    expect(result.totalValue).toBe(300000)
    // weightedValue = 100000*0.8 + 200000*0.5 = 80000 + 100000 = 180000
    expect(result.weightedValue).toBe(180000)
  })

  it("groups deals by stage", async () => {
    const deal1 = makeDeal({ id: "d1", stage: { slug: "qualifying", name: "Qualifying" } })
    const deal2 = makeDeal({
      id: "d2",
      stage: { slug: "negotiation", name: "Negotiation" },
    })
    mockDealFindMany
      .mockResolvedValueOnce([deal1, deal2])
      .mockResolvedValueOnce([{ amount: 100000 }])
      .mockResolvedValueOnce([{ amount: 100000 }])
    mockDealFindUnique
      .mockResolvedValueOnce(deal1)
      .mockResolvedValueOnce(deal2)

    const result = await getPipelineAnalytics("org-1")
    expect(Object.keys(result.dealsByStage).length).toBeGreaterThanOrEqual(2)
  })

  it("throws error for empty orgId", async () => {
    await expect(getPipelineAnalytics("")).rejects.toThrow(
      "Organization ID is required",
    )
  })

  it("filters by pipelineId when provided", async () => {
    mockDealFindMany.mockResolvedValue([])
    const result = await getPipelineAnalytics("org-1", "pipe-1")
    expect(result.totalDeals).toBe(0)
  })
})

// ─── getWinRateAnalysis ───

describe("getWinRateAnalysis", () => {
  it("returns zero win rate when no closed deals", async () => {
    mockDealFindMany.mockResolvedValue([])
    const result = await getWinRateAnalysis("org-1")
    expect(result.totalClosed).toBe(0)
    expect(result.winRate).toBe(0)
  })

  it("computes correct win rate", async () => {
    mockDealFindMany.mockResolvedValue([
      makeDeal({ id: "d1", status: "closed_won" }),
      makeDeal({ id: "d2", status: "closed_won" }),
      makeDeal({ id: "d3", status: "closed_lost" }),
    ])

    const result = await getWinRateAnalysis("org-1")
    expect(result.totalClosed).toBe(3)
    expect(result.won).toBe(2)
    expect(result.lost).toBe(1)
    expect(result.winRate).toBeCloseTo(66.67, 0)
  })

  it("accepts custom period", async () => {
    mockDealFindMany.mockResolvedValue([
      makeDeal({ id: "d1", status: "closed_won" }),
    ])

    const result = await getWinRateAnalysis("org-1", {
      start: new Date("2026-01-01"),
      end: new Date("2026-12-31"),
    })
    expect(result.periodStart).toEqual(new Date("2026-01-01"))
    expect(result.periodEnd).toEqual(new Date("2026-12-31"))
  })

  it("extracts close reasons from metadata", async () => {
    mockDealFindMany.mockResolvedValue([
      makeDeal({
        id: "d1",
        status: "closed_won",
        metadata: { closeReason: "Best value" },
      }),
      makeDeal({
        id: "d2",
        status: "closed_lost",
        metadata: { closeReason: "Budget constraints" },
      }),
      makeDeal({
        id: "d3",
        status: "closed_won",
        metadata: { closeReason: "Best value" },
      }),
    ])

    const result = await getWinRateAnalysis("org-1")
    expect(result.topReasons["Best value"]).toBe(2)
    expect(result.topReasons["Budget constraints"]).toBe(1)
  })

  it("handles 100% win rate", async () => {
    mockDealFindMany.mockResolvedValue([
      makeDeal({ id: "d1", status: "closed_won" }),
    ])

    const result = await getWinRateAnalysis("org-1")
    expect(result.winRate).toBe(100)
    expect(result.won).toBe(1)
    expect(result.lost).toBe(0)
  })
})

// ─── getVelocityMetrics ───

describe("getVelocityMetrics", () => {
  it("returns empty metrics when no closed deals", async () => {
    mockDealFindMany.mockResolvedValue([])
    const result = await getVelocityMetrics("org-1")
    expect(result.avgDaysToClose).toBe(0)
    expect(Object.keys(result.avgDaysPerStage).length).toBe(0)
  })

  it("computes average days to close", async () => {
    const now = new Date()
    const oldDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    mockDealFindMany.mockResolvedValue([
      makeDeal({ id: "d1", createdAt: oldDate }),
    ])

    const result = await getVelocityMetrics("org-1")
    expect(result.avgDaysToClose).toBe(30)
  })

  it("groups by month in trend", async () => {
    const janDate = new Date("2026-01-15")
    const febDate = new Date("2026-02-15")
    mockDealFindMany.mockResolvedValue([
      makeDeal({ id: "d1", updatedAt: janDate, amount: 50000 }),
      makeDeal({ id: "d2", updatedAt: febDate, amount: 75000 }),
    ])

    const result = await getVelocityMetrics("org-1")
    expect(result.monthlyTrend["2026-01"]).toBeDefined()
    expect(result.monthlyTrend["2026-02"]).toBeDefined()
    expect(result.monthlyTrend["2026-01"].count).toBe(1)
    expect(result.monthlyTrend["2026-01"].value).toBe(50000)
  })

  it("throws error for empty orgId", async () => {
    await expect(getVelocityMetrics("")).rejects.toThrow(
      "Organization ID is required",
    )
  })
})

// ─── Edge Cases ───

describe("edge cases", () => {
  it("handles deal with no stage", async () => {
    const deal = makeDeal({ stage: null })
    mockDealFindUnique.mockResolvedValue(deal)
    mockDealFindMany.mockResolvedValue([{ amount: 100000 }])

    const result = await scoreDeal("deal-1")
    expect(result.stageScore).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeGreaterThanOrEqual(0)
  })

  it("handles deal with no interactions", async () => {
    const deal = makeDeal({ interactions: [] })
    mockDealFindUnique.mockResolvedValue(deal)
    mockDealFindMany.mockResolvedValue([{ amount: 100000 }])

    const result = await scoreDeal("deal-1")
    expect(result.recencyScore).toBe(0)
  })

  it("handles zero deal amount", async () => {
    const deal = makeDeal({ amount: 0 })
    mockDealFindUnique.mockResolvedValue(deal)
    mockDealFindMany.mockResolvedValue([{ amount: 100000 }])

    const result = await scoreDeal("deal-1")
    expect(result.valueScore).toBe(0)
  })

  it("handles zero probability", async () => {
    const deal = makeDeal({ probability: 0 })
    mockDealFindUnique.mockResolvedValue(deal)
    mockDealFindMany.mockResolvedValue([{ amount: 100000 }])

    const result = await scoreDeal("deal-1")
    expect(result.probabilityScore).toBe(0)
  })

  it("handles demo deals filtered out in listDealHealth", async () => {
    mockDealFindMany.mockResolvedValue([]) // no non-demo deals
    const results = await listDealHealth("org-1")
    expect(results).toEqual([])
  })

  it("handles legacy closed status as won", async () => {
    mockDealFindMany.mockResolvedValue([
      makeDeal({ id: "d1", status: "closed" }),
    ])
    mockDealFindUnique.mockResolvedValue(makeDeal({ id: "d1", status: "closed" }))

    const result = await getWinRateAnalysis("org-1")
    expect(result.won).toBe(1)
  })

  it("returns health list without crashing on scoring failures", async () => {
    mockDealFindMany.mockResolvedValue([
      makeDeal({ id: "d-fail" }),
    ])
    mockDealFindUnique.mockResolvedValue(null) // will cause scoring failure

    // Should not throw, just skip
    const results = await listDealHealth("org-1")
    expect(Array.isArray(results)).toBe(true)
  })

  it("handles null probability gracefully in calculation", async () => {
    const forecast = await createForecast("org-1", {
      name: "Test",
      period: "MONTHLY",
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-01-31"),
      expectedRevenue: 100000,
      createdById: "user-1",
    })

    mockDealFindMany.mockResolvedValue([
      { amount: 100000, probability: null },
    ])

    const result = await calculateForecast(forecast.id)
    expect(result.weightedRevenue).toBe(0)
  })
})

// ─── Tenant Isolation ───

describe("tenant isolation", () => {
  it("listForecasts returns only current org forecasts", async () => {
    await createForecast("org-a", {
      name: "Org A Forecast",
      period: "MONTHLY",
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-01-31"),
      expectedRevenue: 50000,
      createdById: "user-1",
    })
    await createForecast("org-b", {
      name: "Org B Forecast",
      period: "MONTHLY",
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-01-31"),
      expectedRevenue: 99999,
      createdById: "user-2",
    })

    const orgAForecasts = await listForecasts("org-a")
    expect(orgAForecasts.length).toBe(1)
    expect(orgAForecasts[0].name).toBe("Org A Forecast")
    expect(orgAForecasts[0].organizationId).toBe("org-a")

    const orgBForecasts = await listForecasts("org-b")
    expect(orgBForecasts.length).toBe(1)
    expect(orgBForecasts[0].name).toBe("Org B Forecast")
  })
})

// ─── Forecast Status Lifecycle ───

describe("forecast lifecycle", () => {
  it("creates forecast with DRAFT status", async () => {
    const forecast = await createForecast("org-1", {
      name: "Draft Forecast",
      period: "MONTHLY",
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-01-31"),
      expectedRevenue: 50000,
      createdById: "user-1",
    })
    expect(forecast.status).toBe("DRAFT")
  })

  it("updates weightedRevenue after calculation", async () => {
    const forecast = await createForecast("org-1", {
      name: "Calc Test",
      period: "MONTHLY",
      periodStart: new Date("2026-02-01"),
      periodEnd: new Date("2026-02-28"),
      expectedRevenue: 300000,
      createdById: "user-1",
    })

    expect(forecast.weightedRevenue).toBeNull()

    mockDealFindMany.mockResolvedValue([
      { amount: 100000, probability: 90 },
    ])

    const calculated = await calculateForecast(forecast.id)
    expect(calculated.weightedRevenue).toBe(90000)
  })
})
