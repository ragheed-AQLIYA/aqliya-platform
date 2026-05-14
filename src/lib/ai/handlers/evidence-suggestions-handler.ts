// Phase 3B: Deterministic handler for generateEvidenceSuggestions
// Extracts the rule-based evidence suggestion logic from services.ts.
// Registered on the deterministicProvider at import time.
// No schema changes. No external API dependency.

import type { DeterministicTaskHandler, AIRequest, AIResponse } from "../types"
import type { AIAssistanceOutput } from "@/types/audit"

export const evidenceSuggestionsHandler: DeterministicTaskHandler = async (request: AIRequest): Promise<AIResponse> => {
  const engagementId = request.engagementId
  if (!engagementId) {
    throw new Error('evidenceSuggestionsHandler requires engagementId in AIRequest')
  }

  const db = await import("@/lib/audit/db")

  const [trialBalance, evidence, findings] = await Promise.all([
    db.getTrialBalance(engagementId),
    db.getEvidence(engagementId),
    db.getFindings(engagementId),
  ])

  const existingFilenames = new Set(evidence.map(e => e.filename.toLowerCase()))

  const evidenceSuggestions: Array<{
    filename: string; accountCode: string; accountName: string; balance: number;
    reason: string; confidence: number;
  }> = []

  const materialThreshold = 50000
  const tbLines = trialBalance?.lines ?? []

  for (const line of tbLines) {
    if (Math.abs(line.balance) < materialThreshold) continue
    const suggestedName = `${line.accountName.toLowerCase().replace(/\s+/g, '_')}_evidence.pdf`
    if (existingFilenames.has(suggestedName)) continue
    const reason = `Material balance of SAR ${Math.abs(line.balance).toLocaleString()} — standard audit evidence required`
    evidenceSuggestions.push({
      filename: suggestedName, accountCode: line.accountCode, accountName: line.accountName,
      balance: line.balance, reason, confidence: 0.8,
    })
  }

  for (const f of findings) {
    const fName = `finding_${f.id.substring(0, 8)}_evidence.pdf`
    if (existingFilenames.has(fName)) continue
    evidenceSuggestions.push({
      filename: fName, accountCode: '', accountName: f.title, balance: 0,
      reason: `Finding: ${f.title} — supporting evidence needed`, confidence: 0.7,
    })
  }

  const created: AIAssistanceOutput[] = []
  for (const sug of evidenceSuggestions) {
    const ai = await db.createAIOutput({
      engagementId,
      suggestionType: 'evidence_suggestion',
      inputContext: `Account: ${sug.accountCode} ${sug.accountName}, balance: SAR ${sug.balance}`,
      outputContent: JSON.stringify({
        filename: sug.filename, accountCode: sug.accountCode,
        accountName: sug.accountName, reason: sug.reason,
      }),
      confidence: sug.confidence,
      modelVersion: 'audit-os-llm-v1',
      sourceEntityType: 'engagement',
      sourceEntityId: engagementId,
      metadata: { draftType: 'evidence_suggestion' },
    })
    created.push(ai)
  }

  const avgConfidence = created.length > 0
    ? created.reduce((sum, o) => sum + o.confidence, 0) / created.length
    : 1.0

  const warnings: string[] = []
  if (trialBalance?.trustState && trialBalance.trustState !== 'trusted') {
    warnings.push(`Trial balance trust state is "${trialBalance.trustState}" — evidence suggestions may be incomplete`)
  }
  if (evidenceSuggestions.length === 0) {
    warnings.push('No evidence gaps detected — all material accounts have evidence')
  }

  return {
    output: JSON.stringify({ suggestionCount: created.length }),
    confidence: Math.round(avgConfidence * 100) / 100,
    providerId: 'deterministic',
    modelVersion: 'audit-os-llm-v1',
    metadata: {
      outputs: created,
    },
    warnings: warnings.slice(0, 5),
  }
}
