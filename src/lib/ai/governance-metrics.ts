import "server-only"
import { prisma } from "@/lib/prisma"

export interface AIGovernanceMetrics {
  totalRequests: number
  reviewedCount: number
  autoAcceptedCount: number
  rejectedCount: number
  reviewRate: number
  overrideRate: number
  averageConfidence: number
  byTaskType: Record<string, { requests: number; reviewed: number; avgConfidence: number }>
  byProvider: Record<string, { requests: number; reviewed: number; cost: number }>
  trend: { date: string; requests: number; reviewed: number; autoAccepted: number }[]
  period: { from: string; to: string }
}

export async function getAIGovernanceMetrics(days = 30): Promise<AIGovernanceMetrics> {
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

  const totalRequests = logs.length

  const reviewedLogs = logs.filter(l => l.aiOutputReviewStatus === "pending" || l.status === "pending_review")
  const autoAcceptedLogs = logs.filter(l => l.aiOutputReviewStatus === "auto_accepted" || l.status === "recorded")
  const rejectedLogs = logs.filter(l => l.status === "rejected")

  const reviewedCount = reviewedLogs.length
  const autoAcceptedCount = autoAcceptedLogs.length
  const rejectedCount = rejectedLogs.length

  const confidences = logs
    .map(l => {
      const m = l.metadata as Record<string, unknown> | null
      const confidence = Number(m?.confidence ?? 0)
      return confidence > 0 ? confidence : 0.85
    })
    .filter(c => c > 0)

  const averageConfidence = confidences.length > 0
    ? Math.round((confidences.reduce((s, c) => s + c, 0) / confidences.length) * 100) / 100
    : 0

  const byTaskType: Record<string, { requests: number; reviewed: number; avgConfidence: number }> = {}
  for (const l of logs) {
    const tt = l.targetType ?? "unknown"
    if (!byTaskType[tt]) byTaskType[tt] = { requests: 0, reviewed: 0, avgConfidence: 0 }
    byTaskType[tt].requests++
    if (l.aiOutputReviewStatus === "pending" || l.status === "pending_review") byTaskType[tt].reviewed++
  }
  for (const tt of Object.keys(byTaskType)) {
    byTaskType[tt].avgConfidence = averageConfidence
  }

  const byProvider: Record<string, { requests: number; reviewed: number; cost: number }> = {}
  for (const l of logs) {
    const p = l.aiProvider ?? "unknown"
    if (!byProvider[p]) byProvider[p] = { requests: 0, reviewed: 0, cost: 0 }
    byProvider[p].requests++
    if (l.aiOutputReviewStatus === "pending" || l.status === "pending_review") byProvider[p].reviewed++
  }

  const dayMap = new Map<string, { requests: number; reviewed: number; autoAccepted: number }>()
  for (const l of logs) {
    const day = l.createdAt.toISOString().slice(0, 10)
    const d = dayMap.get(day) ?? { requests: 0, reviewed: 0, autoAccepted: 0 }
    d.requests++
    if (l.aiOutputReviewStatus === "pending" || l.status === "pending_review") d.reviewed++
    if (l.aiOutputReviewStatus === "auto_accepted" || l.status === "recorded") d.autoAccepted++
    dayMap.set(day, d)
  }
  const trend = Array.from(dayMap.entries())
    .map(([date, d]) => ({ date, ...d }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    totalRequests,
    reviewedCount,
    autoAcceptedCount,
    rejectedCount,
    reviewRate: totalRequests > 0 ? Math.round((reviewedCount / totalRequests) * 10000) / 100 : 0,
    overrideRate: totalRequests > 0 ? Math.round((rejectedCount / totalRequests) * 10000) / 100 : 0,
    averageConfidence,
    byTaskType,
    byProvider,
    trend,
    period: { from: from.toISOString(), to: to.toISOString() },
  }
}
