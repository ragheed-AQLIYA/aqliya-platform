// Phase 3B: Deterministic handler for generateAnalyticalReview
// Extracts the rule-based flag generation + persistence logic from services.ts.
// Registered on the deterministicProvider at import time.
// No schema changes. No external API dependency.

import type { DeterministicTaskHandler, AIRequest, AIResponse } from "../types"
import type { AIAssistanceOutput } from "@/types/audit"

export const analyticalReviewHandler: DeterministicTaskHandler = async (request: AIRequest): Promise<AIResponse> => {
  const engagementId = request.engagementId
  if (!engagementId) {
    throw new Error('analyticalReviewHandler requires engagementId in AIRequest')
  }

  const db = await import("@/lib/audit/db")

  const [trialBalance, mappings, evidence, findings] = await Promise.all([
    db.getTrialBalance(engagementId),
    db.getMappings(engagementId),
    db.getEvidence(engagementId),
    db.getFindings(engagementId),
  ])

  const flags: Array<{
    flagType: string; title: string; description: string; severity: string; confidence: number;
  }> = []

  const tbLines = trialBalance?.lines ?? []
  for (const line of tbLines) {
    if (line.balance < 0 && (line.accountType === 'liability' || line.accountType === 'equity')) {
      flags.push({
        flagType: 'negative_balance', severity: 'warning',
        title: `Negative balance in ${line.accountName}`,
        description: `${line.accountName} (${line.accountCode}) has a negative credit balance of SAR ${Math.abs(line.balance).toLocaleString()}. This may indicate a prior period adjustment or reclassification needed.`,
        confidence: 0.85,
      })
    }
    if (Math.abs(line.balance) > 500000) {
      flags.push({
        flagType: 'large_balance', severity: 'info',
        title: `Large balance: ${line.accountName}`,
        description: `${line.accountName} (${line.accountCode}) has a material balance of SAR ${Math.abs(line.balance).toLocaleString()}. Consider additional substantive procedures.`,
        confidence: 0.7,
      })
    }
  }

  const unmapped = mappings.filter(m => m.status === 'pending' || !m.canonicalAccountId)
  for (const m of unmapped.slice(0, 3)) {
    flags.push({
      flagType: 'unmapped_account', severity: 'warning',
      title: `Unmapped account: ${m.sourceAccountName}`,
      description: `${m.sourceAccountName} (${m.sourceAccountCode}) has not been mapped to a canonical account. Suggest classification review.`,
      confidence: 0.9,
    })
  }

  if (flags.length === 0) {
    flags.push({
      flagType: 'review_complete', severity: 'info',
      title: 'Analytical review complete',
      description: 'No unusual balances or unmapped accounts detected during analytical review.',
      confidence: 1.0,
    })
  }

  const created: AIAssistanceOutput[] = []
  for (const flag of flags.slice(0, 8)) {
    const ai = await db.createAIOutput({
      engagementId,
      suggestionType: 'anomaly_explanation',
      inputContext: `Analytical review flag: ${flag.title}`,
      outputContent: JSON.stringify({ flagType: flag.flagType, title: flag.title, description: flag.description, severity: flag.severity }),
      confidence: flag.confidence,
      modelVersion: 'audit-os-llm-v1',
      sourceEntityType: 'engagement',
      sourceEntityId: engagementId,
      metadata: { draftType: 'analytical_review' },
    })
    created.push(ai)
  }

  const avgConfidence = created.length > 0
    ? created.reduce((sum, o) => sum + o.confidence, 0) / created.length
    : 1.0

  const evidenceWarnings: string[] = []
  if (evidence.length === 0) evidenceWarnings.push('No evidence items found for this engagement')
  for (const f of findings) {
    if (f.status === 'draft' || f.status === 'open') {
      evidenceWarnings.push(`Finding "${f.title}" is unresolved (${f.status})`)
    }
  }

  return {
    output: JSON.stringify({ flagCount: created.length, flags }),
    confidence: Math.round(avgConfidence * 100) / 100,
    providerId: 'deterministic',
    modelVersion: 'audit-os-llm-v1',
    metadata: {
      outputs: created,
      flagTypes: flags.map(f => f.flagType),
    },
    warnings: evidenceWarnings.slice(0, 5),
  }
}
