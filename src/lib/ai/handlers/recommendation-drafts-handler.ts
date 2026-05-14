// Phase 3B: Deterministic handler for generateRecommendationDrafts
// Extracts the rule-based recommendation draft generation logic from services.ts.
// Registered on the deterministicProvider at import time.
// No schema changes. No external API dependency.

import type { DeterministicTaskHandler, AIRequest, AIResponse } from "../types"
import type { AIAssistanceOutput } from "@/types/audit"

export const recommendationDraftsHandler: DeterministicTaskHandler = async (request: AIRequest): Promise<AIResponse> => {
  const engagementId = request.engagementId
  if (!engagementId) {
    throw new Error('recommendationDraftsHandler requires engagementId in AIRequest')
  }

  const db = await import("@/lib/audit/db")

  const [findings, recs] = await Promise.all([
    db.getFindings(engagementId),
    db.getRecommendations(engagementId),
  ])

  const existingFindingIds = new Set(recs.map(r => r.findingId))

  const created: AIAssistanceOutput[] = []
  for (const finding of findings) {
    if (existingFindingIds.has(finding.id)) continue
    const recContent = {
      findingId: finding.id,
      title: `Remediation: ${finding.title}`,
      description: `Based on finding "${finding.title}", the following remediation is recommended.`,
      recommendedAction: `Review and address the root causes identified in finding "${finding.title}". Implement appropriate controls and document the resolution process.`,
      riskLevel: finding.severity === 'critical' || finding.severity === 'high' ? 'high' : 'medium',
    }
    const ai = await db.createAIOutput({
      engagementId,
      suggestionType: 'recommendation',
      inputContext: `Draft recommendation for finding: ${finding.title} (${finding.id})`,
      outputContent: JSON.stringify(recContent),
      confidence: 0.75,
      modelVersion: 'audit-os-llm-v1',
      sourceEntityType: 'finding',
      sourceEntityId: finding.id,
      metadata: { draftType: 'recommendation_assistant', findingId: finding.id },
    })
    created.push(ai)
  }

  const avgConfidence = created.length > 0
    ? created.reduce((sum, o) => sum + o.confidence, 0) / created.length
    : 1.0

  const skippedCount = findings.length - created.length

  return {
    output: JSON.stringify({ recommendationCount: created.length, skippedCount }),
    confidence: Math.round(avgConfidence * 100) / 100,
    providerId: 'deterministic',
    modelVersion: 'audit-os-llm-v1',
    metadata: {
      outputs: created,
    },
    warnings: skippedCount > 0
      ? [`${skippedCount} findings already have recommendations — skipped`]
      : [],
  }
}
