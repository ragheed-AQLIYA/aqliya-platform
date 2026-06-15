// ─── Sales Pipeline Intelligence Service ───
// Deal scoring, health monitoring, forecasting, and pipeline analytics.
// Pure TypeScript — all scoring/analytics are algorithmic (no external AI/ML).

import "server-only"

import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { intl } from "./intel-strings"

// ─── Types ───

export type HealthLevel = "HEALTHY" | "WATCH" | "AT_RISK"
export type ForecastPeriod = "MONTHLY" | "QUARTERLY" | "YEARLY"

export interface DealScore {
  dealId: string
  score: number
  healthLevel: HealthLevel
  stageScore: number
  valueScore: number
  recencyScore: number
  probabilityScore: number
  scoredAt: Date
}

export interface DealHealthIndicator {
  id: string
  dealId: string
  organizationId: string
  score: number
  healthLevel: HealthLevel
  stageScore: number
  valueScore: number
  recencyScore: number
  probabilityScore: number
  lastScoredAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface SalesForecast {
  id: string
  organizationId: string
  name: string
  period: ForecastPeriod
  periodStart: Date
  periodEnd: Date
  expectedRevenue: number
  weightedRevenue: number | null
  confidencePct: number | null
  status: string
  notes: string | null
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface PipelineAnalytics {
  totalDeals: number
  totalValue: number
  weightedValue: number
  dealsByStage: Record<string, { count: number; value: number }>
  avgDealSize: number
  avgAge: number
  avgProbability: number
  healthBreakdown: { healthy: number; watch: number; atRisk: number }
  conversionRate: number
}

export interface WinRateData {
  periodStart: Date
  periodEnd: Date
  totalClosed: number
  won: number
  lost: number
  winRate: number
  byStage: Record<string, { total: number; won: number; lost: number; rate: number }>
  topReasons: Record<string, number>
}

export interface VelocityMetrics {
  avgDaysToClose: number
  avgDaysPerStage: Record<string, number>
  monthlyTrend: Record<string, { count: number; value: number }>
}

export interface CreateForecastInput {
  name: string
  period: ForecastPeriod
  periodStart: Date
  periodEnd: Date
  expectedRevenue: number
  confidencePct?: number
  notes?: string
  createdById: string
}

export interface WinRateQuery {
  start?: Date
  end?: Date
}

// ─── Constants ───

const STAGE_WEIGHTS: Record<string, number> = {
  drafting: 0,
  qualifying: 10,
  qualification: 10,
  proposal: 40,
  negotiation: 65,
  closing: 80,
  closed_won: 100,
  closedwon: 100,
}

const DEFAULT_STAGE_WEIGHT = 5

// ─── In-memory forecast store ───
// Replace with Prisma SalesForecast model when schema is updated.

const forecastStore = new Map<string, SalesForecast>()
let forecastCounter = 0

export function _resetForecastsForTest(): void {
  forecastStore.clear()
  forecastCounter = 0
}

// ─── Helpers ───

function computeHealthLevel(score: number): HealthLevel {
  if (score >= 70) return "HEALTHY"
  if (score >= 40) return "WATCH"
  return "AT_RISK"
}

function getStageWeight(slug: string | null | undefined): number {
  if (!slug) return DEFAULT_STAGE_WEIGHT
  const key = slug.toLowerCase().replace(/\s+/g, "_")
  return STAGE_WEIGHTS[key] ?? DEFAULT_STAGE_WEIGHT
}

function daysSince(date: Date): number {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function computeRecencyScore(latestInteractionDate: Date | null): number {
  if (!latestInteractionDate) return 0
  const days = daysSince(latestInteractionDate)
  if (days < 7) return 20
  if (days < 14) return 15
  if (days < 30) return 10
  return 0
}

function computeValueScore(
  dealValue: number | null,
  avgDealValue: number,
): number {
  if (!dealValue || dealValue <= 0 || avgDealValue <= 0) return 0
  const ratio = dealValue / avgDealValue
  return Math.min(50, Math.round(Math.sqrt(ratio) * 50))
}

function generateId(): string {
  forecastCounter++
  return `f-${Date.now()}-${forecastCounter}`
}

// ─── Deal Scoring ───

export async function scoreDeal(dealId: string): Promise<DealScore> {
  if (!dealId) throw new Error(intl.en.errors.dealIdRequired)

  const deal = await prisma.salesDeal.findUnique({
    where: { id: dealId },
    include: {
      stage: true,
      interactions: {
        orderBy: { occurredAt: "desc" },
        take: 1,
      },
    },
  })

  if (!deal) throw new Error(intl.en.errors.dealNotFound)

  // Average deal value for the organization
  const orgDeals = await prisma.salesDeal.findMany({
    where: { organizationId: deal.organizationId, isDemo: false },
    select: { amount: true },
  })
  const validAmounts = orgDeals
    .map((d) => d.amount)
    .filter((a): a is number => a !== null && a > 0)
  const avgDealValue =
    validAmounts.length > 0
      ? validAmounts.reduce((sum, a) => sum + a, 0) / validAmounts.length
      : 0

  const stageSlug = deal.stage?.slug ?? null
  const stageWeight = getStageWeight(stageSlug)

  const dealValue = deal.amount ?? 0
  const valueScore = computeValueScore(dealValue, avgDealValue)

  const latestInteraction = deal.interactions[0] ?? null
  const recencyScore = computeRecencyScore(
    latestInteraction?.occurredAt ?? null,
  )

  const probabilityScore = Math.round(
    Math.max(0, Math.min(100, deal.probability ?? 0)),
  )

  const total =
    Math.round(
      stageWeight * 0.35 + valueScore * 0.2 + recencyScore * 0.15 + probabilityScore * 0.3,
    )

  const score = Math.max(0, Math.min(100, total))

  const result: DealScore = {
    dealId,
    score,
    healthLevel: computeHealthLevel(score),
    stageScore: Math.round(stageWeight),
    valueScore,
    recencyScore,
    probabilityScore,
    scoredAt: new Date(),
  }

  await writePlatformAuditLog({
    productKey: "salesos",
    action: "deal_scored",
    platformOrganizationId: deal.organizationId,
    targetType: "deal",
    targetId: dealId,
    targetLabel: deal.title,
    severity: "info",
    metadata: {
      score,
      healthLevel: result.healthLevel,
    },
  }).catch(() => {})

  return result
}

// ─── Deal Health ───

export async function getDealHealth(
  dealId: string,
): Promise<DealHealthIndicator | null> {
  try {
    const score = await scoreDeal(dealId)
    const deal = await prisma.salesDeal.findUnique({
      where: { id: dealId },
      select: { organizationId: true, title: true },
    })
    if (!deal) return null

    return {
      id: `health-${dealId}`,
      dealId,
      organizationId: deal.organizationId,
      score: score.score,
      healthLevel: score.healthLevel,
      stageScore: score.stageScore,
      valueScore: score.valueScore,
      recencyScore: score.recencyScore,
      probabilityScore: score.probabilityScore,
      lastScoredAt: score.scoredAt,
      createdAt: score.scoredAt,
      updatedAt: score.scoredAt,
    }
  } catch {
    return null
  }
}

export async function listDealHealth(
  orgId: string,
  pipelineId?: string,
): Promise<DealHealthIndicator[]> {
  if (!orgId) throw new Error(intl.en.errors.orgRequired)

  const where: Record<string, unknown> = {
    organizationId: orgId,
    isDemo: false,
    status: { not: "closed_lost" },
  }

  if (pipelineId) {
    where.stage = { pipelineId }
  }

  const deals = await prisma.salesDeal.findMany({
    where,
    include: { stage: true },
  })

  const results: DealHealthIndicator[] = []

  for (const deal of deals) {
    try {
      const health = await getDealHealth(deal.id)
      if (health) results.push(health)
    } catch {
      // skip deals that fail to score
    }
  }

  return results
}

// ─── Forecasting ───

export async function createForecast(
  orgId: string,
  data: CreateForecastInput,
): Promise<SalesForecast> {
  if (!orgId) throw new Error(intl.en.errors.orgRequired)

  const now = new Date()
  const forecast: SalesForecast = {
    id: generateId(),
    organizationId: orgId,
    name: data.name,
    period: data.period,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    expectedRevenue: data.expectedRevenue,
    weightedRevenue: null,
    confidencePct: data.confidencePct ?? null,
    status: "DRAFT",
    notes: data.notes ?? null,
    createdById: data.createdById,
    createdAt: now,
    updatedAt: now,
  }

  forecastStore.set(forecast.id, forecast)

  await writePlatformAuditLog({
    productKey: "salesos",
    action: "forecast_created",
    platformOrganizationId: orgId,
    targetType: "forecast",
    targetId: forecast.id,
    targetLabel: data.name,
    severity: "info",
  }).catch(() => {})

  return forecast
}

export async function getForecast(
  forecastId: string,
): Promise<SalesForecast | null> {
  return forecastStore.get(forecastId) ?? null
}

export async function listForecasts(
  orgId: string,
  period?: ForecastPeriod,
): Promise<SalesForecast[]> {
  if (!orgId) throw new Error(intl.en.errors.orgRequired)

  let forecasts = Array.from(forecastStore.values()).filter(
    (f) => f.organizationId === orgId,
  )

  if (period) {
    forecasts = forecasts.filter((f) => f.period === period)
  }

  forecasts.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )

  return forecasts
}

export async function calculateForecast(
  forecastId: string,
): Promise<SalesForecast> {
  const forecast = forecastStore.get(forecastId)
  if (!forecast) throw new Error(intl.en.errors.forecastNotFound)

  // Query open deals within the forecast period
  const deals = await prisma.salesDeal.findMany({
    where: {
      organizationId: forecast.organizationId,
      isDemo: false,
      status: "open",
      expectedCloseDate: {
        gte: forecast.periodStart,
        lte: forecast.periodEnd,
      },
    },
    select: { amount: true, probability: true },
  })

  let weightedSum = 0
  for (const deal of deals) {
    const value = deal.amount ?? 0
    const prob = (deal.probability ?? 0) / 100
    weightedSum += value * prob
  }

  forecast.weightedRevenue = Math.round(weightedSum * 100) / 100
  forecast.updatedAt = new Date()

  forecastStore.set(forecastId, forecast)

  await writePlatformAuditLog({
    productKey: "salesos",
    action: "forecast_calculated",
    platformOrganizationId: forecast.organizationId,
    targetType: "forecast",
    targetId: forecastId,
    targetLabel: forecast.name,
    severity: "info",
    metadata: {
      weightedRevenue: forecast.weightedRevenue,
      expectedRevenue: forecast.expectedRevenue,
    },
  }).catch(() => {})

  return forecast
}

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

  // Deals by stage
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

  // Health breakdown (compute from scores)
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
    new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000) // default: last 90 days

  const where: Record<string, unknown> = {
    organizationId: orgId,
    isDemo: false,
    status: { in: ["closed_won", "closed_lost", "closed"] },
    updatedAt: { gte: start, lte: end },
  }

  const closedDeals = await prisma.salesDeal.findMany({
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

    // Extract win/loss reason from metadata if available
    const meta = deal.metadata as Record<string, unknown> | null
    if (meta?.closeReason && typeof meta.closeReason === "string") {
      const reason = meta.closeReason as string
      topReasons[reason] = (topReasons[reason] ?? 0) + 1
    }
  }

  // Calculate rates per stage
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

  // Average days to close
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

    // Monthly trend
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

  // Average days per stage (using created vs updated as proxy for stage duration)
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
