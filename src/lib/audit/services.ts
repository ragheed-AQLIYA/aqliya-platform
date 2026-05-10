// ─── AuditOS MVP Data Services ───
// Hybrid layer: tries database first, falls back to mock data.
// UI components import from here and never know if data is mock or real.

import type {
  Engagement, TrialBalance, TrialBalanceLine, AccountMapping, ValidationRun,
  FinancialStatement, DisclosureNote, EvidenceObject, EvidenceLink, Finding,
  Recommendation, ReviewComment, ApprovalRecord, PublicationPackage,
  AuditEvent, AIAssistanceOutput, DashboardSummary, WorkflowStatus,
  PilotFeedback, ProductionBlocker, PilotSignoff,
} from "@/types/audit"
import { type FinancialStatementLine } from "@/types/audit"
import * as mock from "./mock-data"

const USE_DATABASE = true

const delay = (ms = 30) => new Promise(r => setTimeout(r, ms))

async function getDb() {
  return import("./db")
}

async function tryDb<T>(fallback: () => Promise<T>, dbFn: (db: typeof import("./db")) => Promise<T>): Promise<T> {
  if (USE_DATABASE) {
    try {
      const db = await getDb()
      return await dbFn(db)
    } catch (e) { console.warn('[AuditServices] DB failed, using mock:', e) }
  }
  await delay()
  return fallback()
}

export async function getDashboardSummary(organizationId?: string): Promise<DashboardSummary> {
  return tryDb(() => Promise.resolve(mock.mockDashboardSummary), (db) => db.getDashboardSummary(organizationId))
}

export async function getEngagements(organizationId?: string): Promise<Engagement[]> {
  return tryDb(() => Promise.resolve(mock.mockDashboardSummary.engagements), (db) => db.getEngagements(organizationId))
}

export async function getEngagement(id: string): Promise<Engagement | null> {
  return tryDb(
    () => { const e = mock.mockDashboardSummary.engagements.find(e => e.id === id); return Promise.resolve(e ?? null) },
    (db) => db.getEngagement(id),
  )
}

export async function getEngagementWorkflowStatus(engagementId: string): Promise<WorkflowStatus> {
  return tryDb(
    async () => {
      const e = mock.mockDashboardSummary.engagements.find(e => e.id === engagementId)
      return { currentState: e?.status ?? 'setup', availableTransitions: ['in_progress'], blockingIssues: [], completionPercentage: 10 }
    },
    (db) => db.getEngagementWorkflowStatus(engagementId),
  )
}

export async function getTrialBalance(engagementId: string): Promise<TrialBalance | null> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockTrialBalance) : Promise.resolve(null),
    (db) => db.getTrialBalance(engagementId),
  )
}

export async function getTrialBalanceLines(engagementId: string): Promise<TrialBalanceLine[]> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockTBLines) : Promise.resolve([]),
    (db) => db.getTrialBalanceLines(engagementId),
  )
}

export async function getMappings(engagementId: string): Promise<AccountMapping[]> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockMappings) : Promise.resolve([]),
    (db) => db.getMappings(engagementId),
  )
}

export async function confirmMapping(engagementId: string, mappingId: string): Promise<AccountMapping | null> {
  return tryDb(
    () => { const m = mock.mockMappings.find(m => m.id === mappingId); if (m) { m.status = 'confirmed'; m.mappingType = 'human_mapped' }; return Promise.resolve(m ?? null) },
    (db) => db.confirmMapping(engagementId, mappingId),
  )
}

export async function updateManualMapping(data: {
  engagementId: string
  mappingId: string
  canonicalAccountId: string | null
  mappedBy?: string
}): Promise<AccountMapping | null> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  return db.updateManualMapping(data)
}

export async function getUnmappedAccounts(engagementId: string): Promise<AccountMapping[]> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockMappings.filter(m => m.status === 'pending')) : Promise.resolve([]),
    (db) => db.getUnmappedAccounts(engagementId),
  )
}

export async function getValidationRun(engagementId: string): Promise<ValidationRun | null> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockValidationRun) : Promise.resolve(null),
    (db) => db.getValidationRun(engagementId),
  )
}

export async function runValidation(engagementId: string): Promise<ValidationRun> {
  return tryDb(
    () => Promise.resolve(mock.mockValidationRun),
    (db) => db.runValidation(engagementId),
  )
}

export async function getFinancialStatements(engagementId: string): Promise<FinancialStatement[]> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockFinancialStatements) : Promise.resolve([]),
    (db) => db.getFinancialStatements(engagementId),
  )
}

export async function getEquityStatementLines(): Promise<FinancialStatementLine[]> {
  return tryDb(
    () => Promise.resolve(mock.mockEquityStatementLines),
    (db) => db.getEquityStatementLines(),
  )
}

export async function getDisclosureNotes(engagementId: string): Promise<DisclosureNote[]> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockDisclosureNotes) : Promise.resolve([]),
    (db) => db.getDisclosureNotes(engagementId),
  )
}

export async function getEvidence(engagementId: string): Promise<EvidenceObject[]> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockEvidence) : Promise.resolve([]),
    (db) => db.getEvidence(engagementId),
  )
}

export async function getMissingEvidence(engagementId: string): Promise<EvidenceObject[]> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockEvidence.filter(e => e.state === 'missing')) : Promise.resolve([]),
    (db) => db.getMissingEvidence(engagementId),
  )
}

export async function getFindings(engagementId: string): Promise<Finding[]> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockFindings) : Promise.resolve([]),
    (db) => db.getFindings(engagementId),
  )
}

export async function getFinding(engagementId: string, findingId: string): Promise<Finding | null> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockFindings.find(f => f.id === findingId) ?? null) : Promise.resolve(null),
    (db) => db.getFinding(engagementId, findingId),
  )
}

export async function getRecommendations(engagementId: string): Promise<Recommendation[]> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockRecommendations) : Promise.resolve([]),
    (db) => db.getRecommendations(engagementId),
  )
}

export async function getRecommendation(engagementId: string, recId: string): Promise<Recommendation | null> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockRecommendations.find(r => r.id === recId) ?? null) : Promise.resolve(null),
    (db) => db.getRecommendation(engagementId, recId),
  )
}

export async function getReviewComments(engagementId: string): Promise<ReviewComment[]> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockReviewComments) : Promise.resolve([]),
    (db) => db.getReviewComments(engagementId),
  )
}

export async function getOpenReviewCount(engagementId: string): Promise<number> {
  return tryDb(
    () => Promise.resolve(mock.mockReviewComments.filter(c => c.status === 'open').length),
    (db) => db.getOpenReviewCount(engagementId),
  )
}

export async function getApprovalRecords(engagementId: string): Promise<ApprovalRecord[]> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockApprovalRecords) : Promise.resolve([]),
    (db) => db.getApprovalRecords(engagementId),
  )
}

export async function getApprovalStatus(engagementId: string): Promise<{
  status: string; blockingIssues: readonly string[]; checklist: Array<{ label: string; passed: boolean; detail: string }>;
}> {
  const db = await getDb()
  return db.getApprovalStatus(engagementId)
}

export async function getPublicationPackage(engagementId: string): Promise<PublicationPackage | null> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockPublicationPackage) : Promise.resolve(null),
    (db) => db.getPublicationPackage(engagementId),
  )
}

export async function getAuditEvents(engagementId: string): Promise<AuditEvent[]> {
  return tryDb(
    () => engagementId === mock.mockEngagement.id ? Promise.resolve(mock.mockAuditEvents) : Promise.resolve([]),
    (db) => db.getAuditEvents(engagementId),
  )
}

export async function getAISuggestions(engagementId: string, suggestionType?: string): Promise<AIAssistanceOutput[]> {
  return tryDb(
    () => {
      let results = mock.mockAiOutputs
      if (suggestionType) results = results.filter(a => a.suggestionType === suggestionType)
      return Promise.resolve(engagementId === mock.mockEngagement.id ? results : [])
    },
    (db) => db.getAISuggestions(engagementId, suggestionType),
  )
}

export async function acceptAISuggestion(suggestionId: string, userId: string): Promise<void> {
  return tryDb(
    async () => {
      const s = mock.mockAiOutputs.find(a => a.id === suggestionId)
      if (s) { s.status = 'accepted_by_human'; s.acceptedBy = userId; s.acceptedAt = new Date().toISOString() }
    },
    (db) => db.acceptAISuggestion(suggestionId, userId),
  )
}

export async function createAIOutput(data: {
  engagementId: string; suggestionType: string; inputContext?: string;
  outputContent: string; confidence?: number; modelVersion?: string;
  sourceEntityType?: string; sourceEntityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<AIAssistanceOutput> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  return db.createAIOutput(data)
}

export async function generateDraftNotes(engagementId: string): Promise<AIAssistanceOutput[]> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const [trialBalance, mappings, statements, existingNotes] = await Promise.all([
    db.getTrialBalance(engagementId),
    db.getMappings(engagementId),
    db.getFinancialStatements(engagementId),
    db.getDisclosureNotes(engagementId),
  ])
  const existingTitles = new Set(existingNotes.map(n => n.title.toLowerCase()))
  const accountByType = new Map<string, { code: string; name: string; balance: number }[]>()
  if (trialBalance) {
    for (const line of trialBalance.lines) {
      const type = line.accountType ?? 'other'
      if (!accountByType.has(type)) accountByType.set(type, [])
      accountByType.get(type)!.push({ code: line.accountCode, name: line.accountName, balance: line.balance })
    }
  }
  const draftDefs: Array<{
    noteNumber: string; title: string; noteType: string;
    content: string; linkAccounts: string; missingInfo: string[];
  }> = [
    {
      noteNumber: '8', title: 'Revenue Breakdown',
      noteType: 'accounting_policy',
      content: `Revenue is primarily generated from trading activities within the Kingdom of Saudi Arabia. The Company recognises revenue upon transfer of control of goods to customers.`,
      linkAccounts: 'Revenue Accounts',
      missingInfo: ['Revenue by segment', 'Customer concentration details'],
    },
    {
      noteNumber: '9', title: 'Expenses by Nature',
      noteType: 'other',
      content: `Operating expenses include cost of goods sold, salaries and wages, depreciation, professional fees, and other administrative expenses.`,
      linkAccounts: 'Expense Accounts',
      missingInfo: ['Nature of expenses breakdown', 'Employee benefit details'],
    },
    {
      noteNumber: '10', title: 'Commitments and Contingencies',
      noteType: 'other',
      content: `The Company has no material capital commitments or contingent liabilities as at the reporting date, other than those arising in the ordinary course of business.`,
      linkAccounts: 'Off-Balance Sheet Items',
      missingInfo: ['Capital commitments', 'Contingent liabilities', 'Litigation status'],
    },
  ]
  const existing = existingTitles
  const created: AIAssistanceOutput[] = []
  for (const def of draftDefs) {
    const titleLower = def.title.toLowerCase()
    if (existing.has(titleLower)) continue
    const sourceAccounts = (trialBalance?.lines ?? []).slice(0, 5).map(l => `${l.accountCode} - ${l.accountName}`).join('; ')
    const ai = await db.createAIOutput({
      engagementId,
      suggestionType: 'note_draft',
      inputContext: `Draft Note ${def.noteNumber}: ${def.title}. Source accounts: ${sourceAccounts}`,
      outputContent: JSON.stringify({
        noteNumber: def.noteNumber,
        title: def.title,
        noteType: def.noteType,
        content: def.content + `\n\nNote: This is an AI-generated draft and requires human review, verification of amounts, and tailoring to the Company's specific circumstances.`,
        linkedStatementLine: def.linkAccounts,
        missingInformation: def.missingInfo,
      }),
      confidence: 0.75,
      modelVersion: 'audit-os-llm-v1',
      sourceEntityType: 'engagement',
      sourceEntityId: engagementId,
      metadata: { draftType: 'notes_assistant' },
    })
    created.push(ai)
  }
  return created
}

export async function generateEvidenceSuggestions(engagementId: string): Promise<AIAssistanceOutput[]> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
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
    evidenceSuggestions.push({ filename: suggestedName, accountCode: line.accountCode, accountName: line.accountName, balance: line.balance, reason, confidence: 0.8 })
  }
  for (const f of findings) {
    const fName = `finding_${f.id.substring(0, 8)}_evidence.pdf`
    if (existingFilenames.has(fName)) continue
    evidenceSuggestions.push({ filename: fName, accountCode: '', accountName: f.title, balance: 0, reason: `Finding: ${f.title} — supporting evidence needed`, confidence: 0.7 })
  }
  const created: AIAssistanceOutput[] = []
  for (const sug of evidenceSuggestions) {
    const ai = await db.createAIOutput({
      engagementId, suggestionType: 'evidence_suggestion',
      inputContext: `Account: ${sug.accountCode} ${sug.accountName}, balance: SAR ${sug.balance}`,
      outputContent: JSON.stringify({ filename: sug.filename, accountCode: sug.accountCode, accountName: sug.accountName, reason: sug.reason }),
      confidence: sug.confidence, modelVersion: 'audit-os-llm-v1',
      sourceEntityType: 'engagement', sourceEntityId: engagementId,
      metadata: { draftType: 'evidence_suggestion' },
    })
    created.push(ai)
  }
  return created
}

export async function acceptEvidenceSuggestion(aiOutputId: string, engagementId: string): Promise<{ aiOutput: AIAssistanceOutput | null; evidence: EvidenceObject | null }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const aiOutput = await db.updateAIOutputStatus(aiOutputId, 'accepted_by_human')
  if (!aiOutput) return { aiOutput: null, evidence: null }
  let parsed: Record<string, unknown> = {}
  try { parsed = JSON.parse(aiOutput.outputContent) } catch { parsed = { filename: `evidence-${Date.now()}.pdf` } }
  const filename = (parsed.filename as string) ?? `evidence-${Date.now()}.pdf`
  const evidence = await db.createEvidence({ engagementId, filename, fileType: 'pdf', state: 'missing' })
  return { aiOutput, evidence }
}

export async function acceptDraftNote(aiOutputId: string, noteContent: string, engagementId: string): Promise<{ aiOutput: AIAssistanceOutput | null; note: DisclosureNote | null }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const aiOutput = await db.updateAIOutputStatus(aiOutputId, 'accepted_by_human')
  if (!aiOutput) return { aiOutput: null, note: null }
  let parsed: Record<string, unknown>
  try { parsed = JSON.parse(noteContent) } catch { parsed = { content: noteContent } }
  const title = (parsed.title as string) ?? 'AI Drafted Note'
  const noteType = (parsed.noteType as string) ?? 'other'
  const content = (parsed.content as string) ?? noteContent
  const linkedStatementLine = (parsed.linkedStatementLine as string) ?? undefined
  const missingInfo = Array.isArray(parsed.missingInformation) ? parsed.missingInformation as string[] : []
  const noteNumber = (parsed.noteNumber as string) ?? `ai-${Date.now()}`
  const existingNotes = await db.getDisclosureNotes(engagementId)
  const existingNote = existingNotes.find(n => n.title.toLowerCase() === (title as string).toLowerCase())
  let note: DisclosureNote | null = null
  if (existingNote) {
    note = await db.updateDisclosureNote(existingNote.id, { content, status: 'draft', aiDrafted: true, missingInformation: missingInfo, linkedStatementLine })
  } else {
    note = await db.createDisclosureNote({ engagementId, noteNumber, title, noteType, content, linkedStatementLine, missingInformation: missingInfo, aiDrafted: true })
  }
  return { aiOutput, note }
}

export async function getAIOutputsForEntity(engagementId: string, sourceEntityType: string, sourceEntityId: string): Promise<AIAssistanceOutput[]> {
  return tryDb(
    () => Promise.resolve(mock.mockAiOutputs.filter(a => a.engagementId === engagementId)),
    (db) => db.getAIOutputsForEntity(engagementId, sourceEntityType, sourceEntityId),
  )
}

export async function updateAIOutputStatus(id: string, status: string, userId?: string): Promise<AIAssistanceOutput | null> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  return db.updateAIOutputStatus(id, status, userId)
}

export async function generateFindingDrafts(engagementId: string): Promise<AIAssistanceOutput[]> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const [trialBalance, evidence, findings] = await Promise.all([
    db.getTrialBalance(engagementId),
    db.getEvidence(engagementId),
    db.getFindings(engagementId),
  ])
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
  return created
}

export async function acceptFindingDraft(aiOutputId: string, engagementId: string): Promise<{ aiOutput: AIAssistanceOutput | null; finding: Finding | null }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const aiOutput = await db.updateAIOutputStatus(aiOutputId, 'accepted_by_human')
  if (!aiOutput) return { aiOutput: null, finding: null }
  let parsed: Record<string, unknown> = {}
  try { parsed = JSON.parse(aiOutput.outputContent) } catch { return { aiOutput, finding: null } }
  const finding = await db.createFinding({
    engagementId,
    title: (parsed.title as string) ?? 'AI Draft Finding',
    findingType: (parsed.findingType as string) ?? 'observation',
    severity: (parsed.severity as string) ?? 'low',
    description: (parsed.description as string) ?? aiOutput.outputContent,
    rootCause: (parsed.rootCause as string) ?? undefined,
    impact: (parsed.impact as string) ?? undefined,
    materiality: (parsed.materiality as string) ?? 'immaterial',
    aiSuggested: true,
  })
  return { aiOutput, finding }
}

export async function generateRecommendationDrafts(engagementId: string): Promise<AIAssistanceOutput[]> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const findings = await db.getFindings(engagementId)
  const recs = await db.getRecommendations(engagementId)
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
  return created
}

export async function generateAnalyticalReview(engagementId: string): Promise<AIAssistanceOutput[]> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
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
      engagementId, suggestionType: 'anomaly_explanation',
      inputContext: `Analytical review flag: ${flag.title}`,
      outputContent: JSON.stringify({ flagType: flag.flagType, title: flag.title, description: flag.description, severity: flag.severity }),
      confidence: flag.confidence, modelVersion: 'audit-os-llm-v1',
      sourceEntityType: 'engagement', sourceEntityId: engagementId,
      metadata: { draftType: 'analytical_review' },
    })
    created.push(ai)
  }
  return created
}

export async function acceptRecommendationDraft(aiOutputId: string, engagementId: string): Promise<{ aiOutput: AIAssistanceOutput | null; recommendation: Recommendation | null }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const aiOutput = await db.updateAIOutputStatus(aiOutputId, 'accepted_by_human')
  if (!aiOutput) return { aiOutput: null, recommendation: null }
  let parsed: Record<string, unknown> = {}
  try { parsed = JSON.parse(aiOutput.outputContent) } catch { return { aiOutput, recommendation: null } }
  const recommendation = await db.createRecommendation({
    engagementId,
    findingId: (parsed.findingId as string) ?? '',
    title: (parsed.title as string) ?? 'AI Draft Recommendation',
    description: (parsed.description as string) ?? aiOutput.outputContent,
    recommendedAction: (parsed.recommendedAction as string) ?? '',
    riskLevel: (parsed.riskLevel as string) ?? 'medium',
    aiContributed: true,
  })
  return { aiOutput, recommendation }
}

export async function recordAuditEvent(params: {
  engagementId: string; eventType: string; actorId: string; actorName: string; actorRole: string;
  targetType: string; targetId: string; previousState?: string; newState?: string;
  description: string; aiRelated?: boolean; metadata?: Record<string, unknown>;
}): Promise<void> {
  const db = await getDb()
  await db.recordAuditEvent(params)
}

export async function getTraceability(engagementId: string, targetType: string, targetId: string) {
  return tryDb(
    () => Promise.resolve({
      targetType, targetId,
      forwardTrace: [
        { type: 'source_data', label: 'Trial Balance Entry', status: 'imported' },
        { type: 'account', label: 'Mapped Account', status: 'mapped' },
        { type: 'evidence', label: 'Linked Evidence', status: 'accepted' },
        { type: 'finding', label: 'Related Finding', status: 'open' },
        { type: 'recommendation', label: 'Recommendation', status: 'under_review' },
      ],
      backwardTrace: [
        { type: 'publication', label: 'Published Output', status: 'draft' },
        { type: 'approval', label: 'Approval Record', status: 'pending' },
      ],
    }),
    (db) => db.getTraceability(engagementId, targetType, targetId),
  )
}

export async function getFullTraceability(engagementId: string, statementLineLabel: string) {
  return tryDb(
    () => Promise.resolve({ targetLabel: statementLineLabel, nodes: [], message: 'No traceability data available' }),
    (db) => db.getFullTraceability(engagementId, statementLineLabel),
  )
}

export async function getAuditUsers() {
  return tryDb(
    () => Promise.resolve(mock.mockUsers),
    (db) => db.getAuditUsers(),
  )
}

// ─── Pilot Feedback ───

export async function createPilotFeedback(data: {
  engagementId: string; title: string; description: string;
  source: string; category: string; severity?: string; createdBy: string;
}): Promise<PilotFeedback> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  return db.createPilotFeedback(data)
}

export async function updatePilotFeedbackStatus(id: string, status: string, decision?: string, owner?: string, nextAction?: string): Promise<PilotFeedback | null> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  return db.updatePilotFeedbackStatus(id, status, decision, owner, nextAction)
}

export async function getPilotFeedback(engagementId: string): Promise<PilotFeedback[]> {
  return tryDb(() => Promise.resolve([]), (db) => db.getPilotFeedback(engagementId))
}

export async function createProductionBlocker(data: {
  engagementId?: string; title: string; description: string;
  category: string; severity?: string; requiredBefore?: string; createdBy: string;
}): Promise<ProductionBlocker> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  return db.createProductionBlocker(data)
}

export async function updateProductionBlockerStatus(id: string, status: string, owner?: string, resolutionPlan?: string): Promise<ProductionBlocker | null> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  return db.updateProductionBlockerStatus(id, status, owner, resolutionPlan)
}

export async function getProductionBlockers(engagementId?: string): Promise<ProductionBlocker[]> {
  return tryDb(() => Promise.resolve([]), (db) => db.getProductionBlockers(engagementId))
}

export async function createOrUpdatePilotSignoff(data: {
  engagementId: string; checklistItem: string; status: string;
  signedBy?: string; notes?: string;
}): Promise<PilotSignoff> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  return db.createOrUpdatePilotSignoff(data)
}

export async function getPilotSignoffChecklist(engagementId: string): Promise<PilotSignoff[]> {
  return tryDb(() => Promise.resolve([]), (db) => db.getPilotSignoffChecklist(engagementId))
}

// ─── Write Operations ───

export async function createEngagement(params: {
  organizationId: string
  clientName: string
  fiscalPeriod: string
  engagementType: string
  teamMemberIds: string[]
  actorId?: string
  actorName?: string
}): Promise<{ engagement: Engagement }> {
  const db = await getDb().catch(() => { throw new Error('Database not available for write operations') })
  const client = await db.createClient({
    organizationId: params.organizationId,
    name: params.clientName,
    industry: 'Other',
  })
  const team = params.teamMemberIds.map(uid => ({
    userId: uid, userName: '', role: 'operator', assignedAt: new Date().toISOString(),
  }))
  const engagement = await db.createEngagement({
    organizationId: params.organizationId,
    clientId: client.id,
    fiscalPeriod: params.fiscalPeriod,
    engagementType: params.engagementType,
    team,
  })
  await db.recordAuditEvent({
    engagementId: engagement.id,
    eventType: 'engagement.created',
    actorId: params.actorId ?? 'system',
    actorName: params.actorName ?? 'System',
    actorRole: 'operator',
    targetType: 'engagement',
    targetId: engagement.id,
    newState: 'setup',
    description: `Engagement created for ${params.clientName} ${params.fiscalPeriod}`,
  })
  return { engagement }
}

export async function uploadTrialBalance(
  engagementId: string,
  sourceFile: string,
  rows: Array<{ accountCode: string; accountName: string; debit: number; credit: number }>,
  actorId?: string,
  actorName?: string,
): Promise<{ trialBalance: TrialBalance }> {
  const db = await getDb()
  const normalised = rows.map(r => ({
    accountCode: r.accountCode,
    accountName: r.accountName,
    debitAmount: r.debit,
    creditAmount: r.credit,
    balance: r.debit - r.credit,
    accountType: classifyAccount(r.accountCode),
  }))
  const trialBalance = await db.saveTrialBalance(engagementId, sourceFile, normalised)
  await db.recordAuditEvent({
    engagementId,
    eventType: 'trial_balance.uploaded',
    actorId: actorId ?? 'system',
    actorName: actorName ?? 'System',
    actorRole: 'operator',
    targetType: 'trial_balance',
    targetId: trialBalance.id,
    newState: 'uploaded',
    description: `Trial balance uploaded: ${sourceFile} (${rows.length} accounts)`,
  })
  return { trialBalance }
}

// ─── Evidence Mutations ───

export async function createEvidence(params: {
  engagementId: string; filename: string; fileType: string;
  state?: string; uploadedBy?: string; actorId?: string; actorName?: string;
}): Promise<{ evidence: EvidenceObject }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const evidence = await db.createEvidence({
    engagementId: params.engagementId, filename: params.filename, fileType: params.fileType,
    state: params.state, uploadedBy: params.uploadedBy,
  })
  await db.recordAuditEvent({
    engagementId: params.engagementId, eventType: 'evidence.created',
    actorId: params.actorId ?? 'system', actorName: params.actorName ?? 'System', actorRole: 'operator',
    targetType: 'evidence', targetId: evidence.id, newState: evidence.state,
    description: `Evidence created: ${params.filename}`,
  })
  return { evidence }
}

export async function updateEvidenceState(id: string, state: string, params?: {
  userId?: string; actorName?: string;
}): Promise<{ evidence: EvidenceObject }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const evidence = await db.updateEvidenceState(id, state, params?.userId)
  return { evidence }
}

export async function updateEvidenceStateWithEvent(id: string, state: string, engagementId: string, actor: { actorId: string; actorName: string; actorRole: string }) {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const evidence = await db.updateEvidenceState(id, state, actor.actorId)
  await db.recordAuditEvent({
    engagementId, eventType: 'evidence.state_changed',
    actorId: actor.actorId, actorName: actor.actorName, actorRole: actor.actorRole,
    targetType: 'evidence', targetId: id, newState: state,
    description: `Evidence state changed to ${state}: ${evidence.filename}`,
  })
  return { evidence }
}

// ─── Findings Mutations ───

export async function createFinding(params: {
  engagementId: string; title: string; findingType: string;
  severity: string; description: string; rootCause?: string; impact?: string;
  materiality?: string; actorId?: string; actorName?: string;
}): Promise<{ finding: Finding }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const finding = await db.createFinding({
    engagementId: params.engagementId, title: params.title, findingType: params.findingType,
    severity: params.severity, description: params.description,
    rootCause: params.rootCause, impact: params.impact, materiality: params.materiality,
  })
  await db.recordAuditEvent({
    engagementId: params.engagementId, eventType: 'finding.created',
    actorId: params.actorId ?? 'system', actorName: params.actorName ?? 'System', actorRole: 'reviewer',
    targetType: 'finding', targetId: finding.id, newState: finding.status,
    description: `Finding created: ${params.title}`,
  })
  return { finding }
}

export async function updateFindingStatus(id: string, status: string, engagementId: string, actorId?: string): Promise<{ finding: Finding }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const finding = await db.updateFindingStatus(id, status)
  return { finding }
}

// ─── Recommendations Mutations ───

export async function createRecommendation(params: {
  engagementId: string; findingId: string; title: string;
  description: string; recommendedAction: string; riskLevel?: string;
  actorId?: string; actorName?: string;
}): Promise<{ recommendation: Recommendation }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const rec = await db.createRecommendation({
    engagementId: params.engagementId, findingId: params.findingId, title: params.title,
    description: params.description, recommendedAction: params.recommendedAction, riskLevel: params.riskLevel,
  })
  await db.recordAuditEvent({
    engagementId: params.engagementId, eventType: 'recommendation.created',
    actorId: params.actorId ?? 'system', actorName: params.actorName ?? 'System', actorRole: 'reviewer',
    targetType: 'recommendation', targetId: rec.id, newState: rec.status,
    description: `Recommendation created: ${params.title}`,
  })
  return { recommendation: rec }
}

export async function updateRecommendationStatus(id: string, status: string, engagementId: string, reviewerDecision?: string): Promise<{ recommendation: Recommendation }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const rec = await db.updateRecommendationStatus(id, status, reviewerDecision)
  return { recommendation: rec }
}

// ─── Review Comment Mutations ───

export async function createReviewComment(params: {
  engagementId: string; targetType: string; targetId: string;
  comment: string; requiredAction?: string;
  actorId?: string; actorName?: string;
}): Promise<{ comment: ReviewComment }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const rc = await db.createReviewComment({
    engagementId: params.engagementId, targetType: params.targetType, targetId: params.targetId,
    reviewerId: params.actorId ?? 'system', reviewerName: params.actorName ?? 'System',
    comment: params.comment, requiredAction: params.requiredAction,
  })
  await db.recordAuditEvent({
    engagementId: params.engagementId, eventType: 'review.comment_added',
    actorId: params.actorId ?? 'system', actorName: params.actorName ?? 'System', actorRole: 'reviewer',
    targetType: params.targetType, targetId: params.targetId, newState: 'open',
    description: `Review comment added on ${params.targetType}: ${params.comment.substring(0, 80)}`,
  })
  return { comment: rc }
}

export async function updateReviewCommentStatus(id: string, status: string, resolution?: string): Promise<{ comment: ReviewComment }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const rc = await db.updateReviewCommentStatus(id, status, resolution)
  return { comment: rc }
}

// ─── Approval Mutations ───

export async function createApprovalRecord(params: {
  engagementId: string; action: string; rationale?: string;
  targetType: string; targetId: string;
  actorId?: string; actorName?: string; actorRole?: string;
}): Promise<{ record: ApprovalRecord }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const ar = await db.createApprovalRecord({
    engagementId: params.engagementId, approverId: params.actorId ?? 'system',
    approverName: params.actorName ?? 'System', approverRole: params.actorRole ?? 'reviewer',
    action: params.action, rationale: params.rationale,
    targetType: params.targetType, targetId: params.targetId,
  })
  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType: params.action === 'approved' ? 'engagement.state_changed' : 'engagement.state_changed',
    actorId: params.actorId ?? 'system', actorName: params.actorName ?? 'System', actorRole: params.actorRole ?? 'reviewer',
    targetType: params.targetType, targetId: params.targetId,
    newState: params.action === 'approved' ? 'approved' : 'rejected',
    description: `Engagement ${params.action} by ${params.actorName ?? 'System'}${params.rationale ? ': ' + params.rationale : ''}`,
  })
  if (params.action === 'approved') {
    await db.updateEngagementStatus(params.engagementId, 'approved')
  }
  return { record: ar }
}

// ─── Evidence Linking ───

export async function linkEvidenceToEntity(params: {
  engagementId: string; evidenceId: string; targetType: string; targetId: string; context?: string;
  actorId?: string; actorName?: string;
}): Promise<{ link: EvidenceLink }> {
  const db = await getDb().catch(() => { throw new Error('Database not available') })
  const link = await db.createEvidenceLink({
    evidenceId: params.evidenceId, targetType: params.targetType, targetId: params.targetId,
    context: params.context, createdBy: params.actorName ?? params.actorId,
  })
  await db.recordAuditEvent({
    engagementId: params.engagementId, eventType: 'evidence.linked',
    actorId: params.actorId ?? 'system', actorName: params.actorName ?? 'System', actorRole: 'operator',
    targetType: params.targetType, targetId: params.targetId,
    newState: 'linked', description: `Evidence linked to ${params.targetType}: ${params.targetId}`,
    metadata: { evidenceId: params.evidenceId, linkType: 'supports', context: params.context },
  })
  return { link }
}

function classifyAccount(code: string): string | undefined {
  if (!code || code.length < 4) return undefined
  const prefix = code.substring(0, 2)
  if (['10', '11', '12'].includes(prefix)) return 'asset'
  if (['13', '14'].includes(prefix)) return 'non-current-asset'
  if (['20', '21'].includes(prefix)) return 'liability'
  if (['30', '31'].includes(prefix)) return 'equity'
  if (['40', '41'].includes(prefix)) return 'revenue'
  if (['50', '51', '52', '53', '54', '55', '56', '57', '58', '59'].includes(prefix)) return 'expense'
  return undefined
}
