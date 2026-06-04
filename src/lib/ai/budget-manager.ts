import "server-only"

import { prisma } from "@/lib/prisma"

export interface BudgetConfig {
  monthlySpendCapUsd: number
  monthlyRequestCap: number
  monthlyTokenCap: number
  alertThresholds: number[]
}

export interface BudgetStatus {
  organizationId: string
  month: string
  currentSpendUsd: number
  currentRequests: number
  currentTokens: number
  spendCapUsd: number
  requestCap: number
  tokenCap: number
  spendPercent: number
  isExceeded: boolean
}

export interface BudgetQuotaResult {
  allowed: boolean
  reason?: string
  status: BudgetStatus
}

const DEFAULT_CONFIG: BudgetConfig = {
  monthlySpendCapUsd: 100,
  monthlyRequestCap: 10_000,
  monthlyTokenCap: 5_000_000,
  alertThresholds: [0.5, 0.8, 0.9, 1.0],
}

function configKey(organizationId: string) {
  return `budget_config:${organizationId}`
}

function currentMonthKey(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

function monthRange(month: string): { start: Date; end: Date } {
  const [y, m] = month.split("-").map(Number)
  const start = new Date(Date.UTC(y, m - 1, 1))
  const end = new Date(Date.UTC(y, m, 1))
  return { start, end }
}

export async function getBudgetConfig(organizationId: string): Promise<BudgetConfig> {
  const row = await prisma.platformSecret.findUnique({
    where: { key: configKey(organizationId) },
  })
  if (!row?.encryptedValue) return { ...DEFAULT_CONFIG }
  try {
    const parsed = JSON.parse(row.encryptedValue) as Partial<BudgetConfig>
    return { ...DEFAULT_CONFIG, ...parsed }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export async function setBudgetConfig(
  organizationId: string,
  patch: Partial<BudgetConfig>,
): Promise<BudgetConfig> {
  const current = await getBudgetConfig(organizationId)
  const next = { ...current, ...patch }
  await prisma.platformSecret.upsert({
    where: { key: configKey(organizationId) },
    create: {
      key: configKey(organizationId),
      encryptedValue: JSON.stringify(next),
      description: "AI budget configuration",
    },
    update: { encryptedValue: JSON.stringify(next) },
  })
  return next
}

export async function getBudgetStatus(organizationId: string): Promise<BudgetStatus> {
  const config = await getBudgetConfig(organizationId)
  const month = currentMonthKey()
  const { start, end } = monthRange(month)

  const logs = await prisma.platformAuditLog.findMany({
    where: {
      platformOrganizationId: organizationId,
      productKey: "ai_core",
      action: "ai_generation",
      createdAt: { gte: start, lt: end },
    },
    select: { metadata: true },
  })

  let currentSpendUsd = 0
  let currentTokens = 0
  for (const log of logs) {
    const meta = log.metadata as Record<string, unknown> | null
    currentSpendUsd += Number(meta?.totalCost ?? 0)
    currentTokens +=
      Number(meta?.tokenInput ?? 0) + Number(meta?.tokenOutput ?? 0)
  }

  const currentRequests = logs.length
  const spendPercent =
    config.monthlySpendCapUsd > 0
      ? (currentSpendUsd / config.monthlySpendCapUsd) * 100
      : 0
  const isExceeded =
    currentSpendUsd > config.monthlySpendCapUsd ||
    currentRequests > config.monthlyRequestCap ||
    currentTokens > config.monthlyTokenCap

  return {
    organizationId,
    month,
    currentSpendUsd,
    currentRequests,
    currentTokens,
    spendCapUsd: config.monthlySpendCapUsd,
    requestCap: config.monthlyRequestCap,
    tokenCap: config.monthlyTokenCap,
    spendPercent,
    isExceeded,
  }
}

export async function checkBudgetQuota(
  organizationId: string,
): Promise<BudgetQuotaResult> {
  const status = await getBudgetStatus(organizationId)
  if (status.isExceeded) {
    return {
      allowed: false,
      reason: "Budget exceeded",
      status,
    }
  }
  return { allowed: true, status }
}

export async function triggerBudgetAlerts(_organizationId: string): Promise<void> {
  // Alerts are emitted when quotas are checked in governed flows.
}
