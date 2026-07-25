// ─── Shared Types, Constants, and Helpers ───

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

export const STAGE_WEIGHTS: Record<string, number> = {
  drafting: 0,
  qualifying: 10,
  qualification: 10,
  proposal: 40,
  negotiation: 65,
  closing: 80,
  closed_won: 100,
  closedwon: 100,
}

export const DEFAULT_STAGE_WEIGHT = 5

// ─── Helpers ───

export function computeHealthLevel(score: number): HealthLevel {
  if (score >= 70) return "HEALTHY"
  if (score >= 40) return "WATCH"
  return "AT_RISK"
}

export function getStageWeight(slug: string | null | undefined): number {
  if (!slug) return DEFAULT_STAGE_WEIGHT
  const key = slug.toLowerCase().replace(/\s+/g, "_")
  return STAGE_WEIGHTS[key] ?? DEFAULT_STAGE_WEIGHT
}

export function daysSince(date: Date): number {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

export function computeRecencyScore(latestInteractionDate: Date | null): number {
  if (!latestInteractionDate) return 0
  const days = daysSince(latestInteractionDate)
  if (days < 7) return 20
  if (days < 14) return 15
  if (days < 30) return 10
  return 0
}

export function computeValueScore(
  dealValue: number | null,
  avgDealValue: number,
): number {
  if (!dealValue || dealValue <= 0 || avgDealValue <= 0) return 0
  const ratio = dealValue / avgDealValue
  return Math.min(50, Math.round(Math.sqrt(ratio) * 50))
}
