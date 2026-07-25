import "server-only"

import { prisma } from "@/lib/prisma"
import { intl } from "../intel-strings"
import type { DealHealthIndicator } from "./common"
import { scoreDeal } from "./scoring"

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
    take: 100,
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
