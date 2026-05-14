// Phase 3B: Deterministic handler for generateFindingDrafts
// Extracts the rule-based finding draft generation logic from services.ts.
// Registered on the deterministicProvider at import time.
// No schema changes. No external API dependency.
//
// Note: The original services.ts function fetched trialBalance and evidence alongside findings,
// but neither was referenced in the function body. Only findings is queried here — it is the
// sole data dependency used for duplicate-title prevention against existing findings.

import type { DeterministicTaskHandler, AIRequest, AIResponse } from "../types"
import type { AIAssistanceOutput } from "@/types/audit"

export const findingDraftsHandler: DeterministicTaskHandler = async (request: AIRequest): Promise<AIResponse> => {
  const engagementId = request.engagementId
  if (!engagementId) {
    throw new Error('findingDraftsHandler requires engagementId in AIRequest')
  }

  const db = await import("@/lib/audit/db")

  const findings = await db.getFindings(engagementId)

  const existingTitles = new Set(findings.map(f => f.title.toLowerCase()))

  const findingDefs: Array<{
    title: string; findingType: string; severity: string; description: string;
    rootCause: string; impact: string; materiality: string;
  }> = [
    {
      title: 'Unusual Balance in Accrued Expenses',
      findingType: 'observation',
      severity: 'medium',
      description: 'Accrued Expenses show a negative credit balance of SAR 20,000, which may indicate a prior period adjustment or recording error. Investigation required.',
      rootCause: 'Possible unrecorded adjustment or reversal entry not posted correctly.',
      impact: 'Potential misstatement of current liabilities.',
      materiality: 'immaterial',
    },
    {
      title: 'Revenue Recognition Timing',
      findingType: 'disclosure_gap',
      severity: 'medium',
      description: 'Revenue recognition practices should be reviewed for consistency with IFRS for SMEs. Current policies may not fully disclose performance obligation details.',
      rootCause: 'Revenue recognition policy documentation incomplete.',
      impact: 'Disclosure gap in revenue note — may require supplemental disclosure.',
      materiality: 'immaterial',
    },
  ]

  const created: AIAssistanceOutput[] = []
  for (const def of findingDefs) {
    if (existingTitles.has(def.title.toLowerCase())) continue
    const ai = await db.createAIOutput({
      engagementId,
      suggestionType: 'finding',
      inputContext: `Draft finding: ${def.title}`,
      outputContent: JSON.stringify(def),
      confidence: 0.7,
      modelVersion: 'audit-os-llm-v1',
      sourceEntityType: 'engagement',
      sourceEntityId: engagementId,
      metadata: { draftType: 'finding_assistant' },
    })
    created.push(ai)
  }

  const avgConfidence = created.length > 0
    ? created.reduce((sum, o) => sum + o.confidence, 0) / created.length
    : 1.0

  const unresolvedCount = findings.filter(f => f.status === 'draft' || f.status === 'open').length

  return {
    output: JSON.stringify({ findingCount: created.length, findingDefs }),
    confidence: Math.round(avgConfidence * 100) / 100,
    providerId: 'deterministic',
    modelVersion: 'audit-os-llm-v1',
    metadata: {
      outputs: created,
    },
    warnings: unresolvedCount > 0
      ? [`${unresolvedCount} existing findings are unresolved — review before generating new drafts`]
      : [],
  }
}
