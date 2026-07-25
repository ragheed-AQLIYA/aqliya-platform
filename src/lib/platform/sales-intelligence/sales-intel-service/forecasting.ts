import "server-only"

import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { intl } from "../intel-strings"
import type { SalesForecast, CreateForecastInput, ForecastPeriod } from "./common"

// ─── In-memory forecast store ───
// Replace with Prisma SalesForecast model when schema is updated.

const forecastStore = new Map<string, SalesForecast>()
let forecastCounter = 0

function generateId(): string {
  forecastCounter++
  return `f-${Date.now()}-${forecastCounter}`
}

export function _resetForecastsForTest(): void {
  forecastStore.clear()
  forecastCounter = 0
}

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

  const deals = await prisma.salesDeal.findMany({
    take: 100,
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
