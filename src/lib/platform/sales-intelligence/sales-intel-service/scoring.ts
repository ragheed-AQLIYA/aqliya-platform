import "server-only"

import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { intl } from "../intel-strings"
import type { DealScore } from "./common"
import {
  computeHealthLevel,
  getStageWeight,
  computeValueScore,
  computeRecencyScore,
} from "./common"

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
