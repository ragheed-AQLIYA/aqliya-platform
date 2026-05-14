// Phase 3B: Deterministic handler for generateDraftNotes
// Extracts the rule-based notes generation logic from services.ts.
// Uses the existing notes engine (src/lib/audit/notes/) for note generation.
// Preserves skipExistingTitles behavior, context construction, and persistence.
// Registered on the deterministicProvider at import time.
// No schema changes. No external API dependency.
//
// Note: The original services.ts imported getMissingInfoSummary and getEvidenceGapSummary
// from the notes engine but never called them. Only generateNotes is imported here.

import type { DeterministicTaskHandler, AIRequest, AIResponse } from "../types"
import type { AIAssistanceOutput } from "@/types/audit"

export const draftNotesHandler: DeterministicTaskHandler = async (request: AIRequest): Promise<AIResponse> => {
  const engagementId = request.engagementId
  if (!engagementId) {
    throw new Error('draftNotesHandler requires engagementId in AIRequest')
  }

  const db = await import("@/lib/audit/db")
  const { generateNotes } = await import("@/lib/audit/notes")

  const [trialBalance, mappings, statements, existingNotes, evidence, findings] = await Promise.all([
    db.getTrialBalance(engagementId),
    db.getMappings(engagementId),
    db.getFinancialStatements(engagementId),
    db.getDisclosureNotes(engagementId),
    db.getEvidence(engagementId),
    db.getFindings(engagementId),
  ])

  const context = {
    engagementId,
    trialBalanceLines: (trialBalance?.lines ?? []).map(l => ({
      accountCode: l.accountCode,
      accountName: l.accountName,
      debitAmount: l.debitAmount,
      creditAmount: l.creditAmount,
      balance: l.balance,
      accountType: l.accountType,
    })),
    mappings: mappings.map(m => ({
      sourceAccountCode: m.sourceAccountCode,
      sourceAccountName: m.sourceAccountName,
      canonicalAccountName: m.canonicalAccountName,
      statementClassification: m.statementClassification,
    })),
    financialStatements: statements.map(s => ({
      statementType: s.statementType,
      lines: s.lines.map(l => ({
        label: l.label,
        amount: l.amount,
        isTotal: l.isTotal,
        linkedAccountMappings: l.linkedAccountMappings,
      })),
    })),
    existingNotes: existingNotes.map(n => ({ title: n.title, status: n.status })),
    evidence: evidence.map(e => ({
      filename: e.filename,
      state: e.state,
      targetLabel: e.linkedEntities[0]?.targetLabel ?? '',
    })),
    findings: findings.map(f => ({
      title: f.title,
      findingType: f.findingType,
      severity: f.severity,
      relatedAccountIds: f.relatedAccountIds,
    })),
  }

  const generatedNotes = generateNotes(context, { skipExistingTitles: true })

  const created: AIAssistanceOutput[] = []
  for (const note of generatedNotes) {
    const ai = await db.createAIOutput({
      engagementId,
      suggestionType: 'note_draft',
      inputContext: `Draft Note ${note.noteNumber}: ${note.title}. Type: ${note.noteType}. Linked: ${note.linkedStatementLine ?? 'N/A'}`,
      outputContent: JSON.stringify({
        noteNumber: note.noteNumber,
        title: note.title,
        noteType: note.noteType,
        content: note.content,
        linkedStatementLine: note.linkedStatementLine,
        missingInformation: note.missingInformation,
        requiresEvidence: note.requiresEvidence,
        evidenceProvided: note.evidenceProvided,
      }),
      confidence: note.status === 'draft' ? 0.85 : 0.7,
      modelVersion: 'audit-os-notes-engine-v1',
      sourceEntityType: 'engagement',
      sourceEntityId: engagementId,
      metadata: { draftType: 'notes_engine_v1', ruleBased: true },
    })
    created.push(ai)
  }

  const avgConfidence = created.length > 0
    ? created.reduce((sum, o) => sum + o.confidence, 0) / created.length
    : 1.0

  const warnings: string[] = []
  for (const note of generatedNotes) {
    if (note.missingInformation && note.missingInformation.length > 0) {
      warnings.push(`Note ${note.noteNumber} "${note.title}" has ${note.missingInformation.length} missing information items`)
    }
  }

  return {
    output: JSON.stringify({ noteCount: created.length }),
    confidence: Math.round(avgConfidence * 100) / 100,
    providerId: 'deterministic',
    modelVersion: 'audit-os-notes-engine-v1',
    metadata: {
      outputs: created,
    },
    warnings: warnings.slice(0, 5),
  }
}
