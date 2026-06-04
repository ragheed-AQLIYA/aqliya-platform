import { buildOutcomeDashboardMetrics } from "@/lib/decision/outcome-dashboard"

describe("outcome-dashboard (D3-01)", () => {
  const baseDate = new Date("2026-06-01T12:00:00Z")

  it("computes coverage and status breakdown", () => {
    const metrics = buildOutcomeDashboardMetrics([
      {
        id: "d1",
        title: "قرار أ",
        status: "APPROVED",
        priority: "HIGH",
        outcome: {
          outcomeStatus: "SUCCESS",
          actualOutcome: "ok",
          variance: 2,
          reviewedAt: baseDate,
          updatedAt: baseDate,
        },
      },
      {
        id: "d2",
        title: "قرار ب",
        status: "APPROVED",
        priority: null,
        outcome: null,
      },
      {
        id: "d3",
        title: "قرار ج",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        outcome: {
          outcomeStatus: "UNKNOWN",
          actualOutcome: null,
          variance: null,
          reviewedAt: null,
          updatedAt: new Date("2026-06-02T12:00:00Z"),
        },
      },
    ])

    expect(metrics.totalOutcomes).toBe(2)
    expect(metrics.coveragePct).toBe(67)
    expect(metrics.approvedMissingOutcome).toBe(1)
    expect(metrics.byStatus.SUCCESS).toBe(1)
    expect(metrics.byStatus.UNKNOWN).toBe(1)
    expect(metrics.missingReview).toBe(1)
    expect(metrics.reviewedCount).toBe(1)
    expect(metrics.avgVariance).toBe(2)
    expect(metrics.recentOutcomes[0]?.decisionId).toBe("d3")
  })

  it("returns empty metrics for no decisions", () => {
    const metrics = buildOutcomeDashboardMetrics([])
    expect(metrics.totalOutcomes).toBe(0)
    expect(metrics.coveragePct).toBe(0)
    expect(metrics.recentOutcomes).toEqual([])
  })
})
