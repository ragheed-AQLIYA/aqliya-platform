import "server-only"
import { prisma } from "@/lib/prisma"
import { getModelCost } from "@/lib/ai/cost-mapping"

export interface SpendEntry {
  id: string
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
  currency: string
  timestamp: string
  organizationId?: string
  userId?: string
  taskType?: string
}

export interface SpendSummary {
  totalCost: number
  totalRequests: number
  byProvider: Record<string, { requests: number; cost: number; avgCost: number }>
  byModel: Record<string, { requests: number; cost: number; avgTokens: number }>
  byDay: { date: string; requests: number; cost: number }[]
  topOrgs: { organizationId: string; requests: number; cost: number }[]
  currency: string
  period: { from: string; to: string }
}

function toCurrency(n: number): number {
  return Math.round(n * 10000) / 10000
}

export async function getAISpendSummary(days = 30): Promise<SpendSummary> {
  const from = new Date(Date.now() - days * 86400000)
  const to = new Date()

  const logs = await prisma.platformAuditLog.findMany({
    where: {
      productKey: "ai_core",
      action: "ai_generation",
      createdAt: { gte: from, lte: to },
    },
    orderBy: { createdAt: "desc" },
    take: 10000,
  })

  const entries: SpendEntry[] = logs
    .filter(l => l.metadata && typeof l.metadata === "object")
    .map(l => {
      const m = l.metadata as Record<string, unknown>
      const provider = String(m.aiProvider ?? l.aiProvider ?? "unknown")
      const model = String(m.aiModel ?? l.aiModel ?? "unknown")
      const inputTokens = Number(m.inputTokens ?? 0)
      const outputTokens = Number(m.outputTokens ?? 0)
      const costInfo = getModelCost(model)
      const inputCost = costInfo ? (inputTokens / 1000) * costInfo.inputCostPer1K : 0
      const outputCost = costInfo ? (outputTokens / 1000) * costInfo.outputCostPer1K : 0
      return {
        id: l.id,
        provider,
        model,
        inputTokens,
        outputTokens,
        inputCost: toCurrency(inputCost),
        outputCost: toCurrency(outputCost),
        totalCost: toCurrency(inputCost + outputCost),
        currency: costInfo?.currency ?? "USD",
        timestamp: l.createdAt.toISOString(),
        organizationId: l.platformOrganizationId ?? undefined,
        userId: l.actorId ?? undefined,
        taskType: l.targetType ?? undefined,
      }
    })

  const totalCost = toCurrency(entries.reduce((s, e) => s + e.totalCost, 0))
  const totalRequests = entries.length

  const byProvider: Record<string, { requests: number; cost: number; avgCost: number }> = {}
  for (const e of entries) {
    if (!byProvider[e.provider]) byProvider[e.provider] = { requests: 0, cost: 0, avgCost: 0 }
    byProvider[e.provider].requests++
    byProvider[e.provider].cost += e.totalCost
  }
  for (const p of Object.keys(byProvider)) {
    byProvider[p].cost = toCurrency(byProvider[p].cost)
    byProvider[p].avgCost = toCurrency(byProvider[p].cost / byProvider[p].requests)
  }

  const byModel: Record<string, { requests: number; cost: number; avgTokens: number }> = {}
  const modelTotalTokens: Record<string, number> = {}
  for (const e of entries) {
    if (!byModel[e.model]) byModel[e.model] = { requests: 0, cost: 0, avgTokens: 0 }
    byModel[e.model].requests++
    byModel[e.model].cost += e.totalCost
    modelTotalTokens[e.model] = (modelTotalTokens[e.model] ?? 0) + e.inputTokens + e.outputTokens
  }
  for (const m of Object.keys(byModel)) {
    byModel[m].cost = toCurrency(byModel[m].cost)
    byModel[m].avgTokens = Math.round(modelTotalTokens[m] / byModel[m].requests)
  }

  const dayMap = new Map<string, { requests: number; cost: number }>()
  for (const e of entries) {
    const day = e.timestamp.slice(0, 10)
    const d = dayMap.get(day) ?? { requests: 0, cost: 0 }
    d.requests++
    d.cost += e.totalCost
    dayMap.set(day, d)
  }
  const byDay = Array.from(dayMap.entries())
    .map(([date, d]) => ({ date, requests: d.requests, cost: toCurrency(d.cost) }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const orgMap = new Map<string, { requests: number; cost: number }>()
  for (const e of entries) {
    const oid = e.organizationId ?? "__unknown__"
    const o = orgMap.get(oid) ?? { requests: 0, cost: 0 }
    o.requests++
    o.cost += e.totalCost
    orgMap.set(oid, o)
  }
  const topOrgs = Array.from(orgMap.entries())
    .map(([organizationId, d]) => ({ organizationId, requests: d.requests, cost: toCurrency(d.cost) }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10)

  const currency = entries.length > 0 ? entries[0].currency : "USD"

  return { totalCost, totalRequests, byProvider, byModel, byDay, topOrgs, currency, period: { from: from.toISOString(), to: to.toISOString() } }
}

export async function getAISpendByDay(days = 30): Promise<{ date: string; totalCost: number; requests: number; models: string[] }[]> {
  const summary = await getAISpendSummary(days)
  return summary.byDay.map(d => {
    const models = Object.keys(summary.byModel)
    return { date: d.date, totalCost: d.cost, requests: d.requests, models }
  })
}
