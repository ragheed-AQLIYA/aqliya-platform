import "server-only"

import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { intl } from "../intel-strings"
import type {
  PipelineAnalytics,
  WinRateData,
  WinRateQuery,
  VelocityMetrics,
} from "./common"
import { daysSince } from "./common"
import { getDealHealth } from "./health"

// ─── Pipeline Analytics ───

export async function getPipelineAnalytics(
  orgId: string,
  pipelineId?: string,
): Promise<PipelineAnalytics> {
  if (!orgId) throw new Error(intl.en.errors.orgRequired)

  const where: Record<string, unknown> = {
    organizationId: orgId,
    isDemo: false,
  }

  if (pipelineId) {
    where.stage = { pipelineId }
  }

  const deals = await prisma.salesDeal.findMany({
    take: 100,
    where,
    include: { stage: true },
  })

  if (deals.length === 0) {
    return {
      totalDeals: 0,
      totalValue: 0,
      weightedValue: 0,
      dealsByStage: {},
      avgDealSize: 0,
      avgAge: 0,
      avgProbability: 0,
      healthBreakdown: { healthy: 0, watch: 0, atRisk: 0 },
      conversionRate: 0,
    }
  }

  const dealsByStage: Record<string, { count: number; value: number }> = {}
  let totalValue = 0
  let weightedValue = 0
  let totalProbability = 0
  let totalAgeDays = 0
  let closedWon = 0
  let totalClosed = 0

  for (const deal of deals) {
    const stageName =
      deal.stage?.slug ?? deal.stage?.name ?? "unknown"
    const value = deal.amount ?? 0
    const prob = deal.probability ?? 0

    totalValue += value
    weightedValue += value * (prob / 100)
    totalProbability += prob
    totalAgeDays += daysSince(deal.createdAt)

    if (deal.status === "closed_won" || deal.status === "closed") {
      closedWon++
      totalClosed++
    } else if (deal.status === "closed_lost") {
      totalClosed++
    }

    if (!dealsByStage[stageName]) {
      dealsByStage[stageName] = { count: 0, value: 0 }
    }
    dealsByStage[stageName].count++
    dealsByStage[stageName].value += value
  }

  const avgDealSize =
    deals.length > 0 ? Math.round((totalValue / deals.length) * 100) / 100 : 0
  const avgAge =
    deals.length > 0 ? Math.round(totalAgeDays / deals.length) : 0
  const avgProbability =
    deals.length > 0
      ? Math.round((totalProbability / deals.length) * 100) / 100
      : 0
  const conversionRate =
    totalClosed > 0 ? Math.round((closedWon / totalClosed) * 10000) / 100 : 0

  const healthResults = await Promise.allSettled(
    deals.map((d) => getDealHealth(d.id)),
  )
  const healthBreakdown = { healthy: 0, watch: 0, atRisk: 0 }
  for (const result of healthResults) {
    if (result.status === "fulfilled" && result.value) {
      healthBreakdown[result.value.healthLevel.toLowerCase() as keyof typeof healthBreakdown]++
    }
  }

  await writePlatformAuditLog({
    productKey: "salesos",
    action: "pipeline_analytics_generated",
    platformOrganizationId: orgId,
    targetType: "pipeline",
    targetId: pipelineId ?? "all",
    severity: "info",
    metadata: {
      totalDeals: deals.length,
      totalValue,
      weightedValue: Math.round(weightedValue * 100) / 100,
    },
  }).catch(() => {})

  return {
    totalDeals: deals.length,
    totalValue: Math.round(totalValue * 100) / 100,
    weightedValue: Math.round(weightedValue * 100) / 100,
    dealsByStage,
    avgDealSize,
    avgAge,
    avgProbability,
    healthBreakdown,
    conversionRate,
  }
}

// ─── Win Rate Analysis ───

export async function getWinRateAnalysis(
  orgId: string,
  period?: WinRateQuery,
): Promise<WinRateData> {
  if (!orgId) throw new Error(intl.en.errors.orgRequired)

  const end = period?.end ?? new Date()
  const start =
    period?.start ??
    new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000)

  const where: Record<string, unknown> = {
    organizationId: orgId,
    isDemo: false,
    status: { in: ["closed_won", "closed_lost", "closed"] },
    updatedAt: { gte: start, lte: end },
  }

  const closedDeals = await prisma.salesDeal.findMany({
    take: 100,
    where,
    include: { stage: true },
  })

  let won = 0
  let lost = 0
  const byStage: Record<
    string,
    { total: number; won: number; lost: number; rate: number }
  > = {}
  const topReasons: Record<string, number> = {}

  for (const deal of closedDeals) {
    const stageName = deal.stage?.slug ?? deal.stage?.name ?? "unknown"
    const isWon =
      deal.status === "closed_won" || deal.status === "closed"
    const isLost = deal.status === "closed_lost"

    if (isWon) won++
    if (isLost) lost++

    if (!byStage[stageName]) {
      byStage[stageName] = { total: 0, won: 0, lost: 0, rate: 0 }
    }
    byStage[stageName].total++
    if (isWon) byStage[stageName].won++
    if (isLost) byStage[stageName].lost++

    const meta = deal.metadata as Record<string, unknown> | null
    if (meta?.closeReason && typeof meta.closeReason === "string") {
      const reason = meta.closeReason as string
      topReasons[reason] = (topReasons[reason] ?? 0) + 1
    }
  }

  for (const stage of Object.keys(byStage)) {
    byStage[stage].rate =
      byStage[stage].total > 0
        ? Math.round((byStage[stage].won / byStage[stage].total) * 10000) / 100
        : 0
  }

  const totalClosed = closedDeals.length
  const winRate = totalClosed > 0 ? Math.round((won / totalClosed) * 10000) / 100 : 0

  await writePlatformAuditLog({
    productKey: "salesos",
    action: "win_rate_analyzed",
    platformOrganizationId: orgId,
    targetType: "win_rate",
    severity: "info",
    metadata: { totalClosed, won, lost, winRate, periodStart: start.toISOString(), periodEnd: end.toISOString() },
  }).catch(() => {})

  return {
    periodStart: start,
    periodEnd: end,
    totalClosed,
    won,
    lost,
    winRate,
    byStage,
    topReasons,
  }
}

// ─── Velocity Metrics ───

export async function getVelocityMetrics(
  orgId: string,
  pipelineId?: string,
): Promise<VelocityMetrics> {
  if (!orgId) throw new Error(intl.en.errors.orgRequired)

  const where: Record<string, unknown> = {
    organizationId: orgId,
    isDemo: false,
    status: { in: ["closed_won", "closed", "closed_lost"] },
  }

  if (pipelineId) {
    where.stage = { pipelineId }
  }

  const closedDeals = await prisma.salesDeal.findMany({
    take: 100,
    where,
    include: { stage: true },
    orderBy: { updatedAt: "asc" },
  })

  if (closedDeals.length === 0) {
    return {
      avgDaysToClose: 0,
      avgDaysPerStage: {},
      monthlyTrend: {},
    }
  }

  let totalDaysToClose = 0
  let dealsWithTiming = 0
  const monthlyTrend: Record<string, { count: number; value: number }> = {}
  const stageDays: Record<string, number[]> = {}

  for (const deal of closedDeals) {
    const daysToClose = daysSince(deal.createdAt)
    totalDaysToClose += daysToClose
    dealsWithTiming++

    const stageName = deal.stage?.slug ?? deal.stage?.name ?? "unknown"
    if (!stageDays[stageName]) stageDays[stageName] = []
    stageDays[stageName].push(daysToClose)

    const monthKey = `${deal.updatedAt.getFullYear()}-${String(deal.updatedAt.getMonth() + 1).padStart(2, "0")}`
    if (!monthlyTrend[monthKey]) {
      monthlyTrend[monthKey] = { count: 0, value: 0 }
    }
    monthlyTrend[monthKey].count++
    monthlyTrend[monthKey].value += deal.amount ?? 0
  }

  const avgDaysToClose =
    dealsWithTiming > 0
      ? Math.round(totalDaysToClose / dealsWithTiming)
      : 0

  const avgDaysPerStage: Record<string, number> = {}
  for (const [stage, days] of Object.entries(stageDays)) {
    avgDaysPerStage[stage] =
      days.length > 0
        ? Math.round(days.reduce((sum, d) => sum + d, 0) / days.length)
        : 0
  }

  await writePlatformAuditLog({
    productKey: "salesos",
    action: "velocity_metrics_generated",
    platformOrganizationId: orgId,
    targetType: "velocity",
    severity: "info",
    metadata: { avgDaysToClose, stagesTracked: Object.keys(avgDaysPerStage).length },
  }).catch(() => {})

  return {
    avgDaysToClose,
    avgDaysPerStage,
    monthlyTrend,
  }
}
