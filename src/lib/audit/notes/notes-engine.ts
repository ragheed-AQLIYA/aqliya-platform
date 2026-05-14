// ─── Notes Engine v1 Generator ───
// Rule-based generation of draft financial statement notes from mapped TB and statements.

import type {
  GeneratedNote,
  NoteGenerationContext,
  NoteTemplate,
} from './types'
import { NOTE_TEMPLATES } from './types'
import { getEvidenceForNoteType } from './evidence-requirements'

export interface GenerateNotesOptions {
  skipExistingTitles?: boolean
}

export function generateNotes(
  context: NoteGenerationContext,
  options: GenerateNotesOptions = {}
): GeneratedNote[] {
  const existingTitles = new Set(
    context.existingNotes.map(n => n.title.toLowerCase())
  )

  const generated: GeneratedNote[] = []

  for (const template of NOTE_TEMPLATES) {
    if (options.skipExistingTitles && existingTitles.has(template.title.toLowerCase())) {
      continue
    }

    const note = buildNoteFromTemplate(template, context)
    if (note) {
      generated.push(note)
    }
  }

  return generated.sort((a, b) => {
    const orderA = NOTE_TEMPLATES.find(t => t.title === a.title)?.displayOrder ?? 99
    const orderB = NOTE_TEMPLATES.find(t => t.title === b.title)?.displayOrder ?? 99
    return orderA - orderB
  })
}

function buildNoteFromTemplate(
  template: NoteTemplate,
  context: NoteGenerationContext
): GeneratedNote | null {
  const balance = calculateBalanceForTemplate(template, context)

  if (template.linkedAccountTypes.length > 0 && balance === 0) {
    return null
  }

  const content = populateTemplate(template.contentTemplate, context, balance)

  const missingInformation = template.missingInfoCheckers
    .filter(checker => checker.check(context))
    .map(checker => checker.label)

  const evidenceReq = getEvidenceForNoteType(template.noteType)
  const requiresEvidence = evidenceReq?.requiredDocuments ?? []

  const evidenceProvided = requiresEvidence.filter(reqDoc =>
    context.evidence.some(e =>
      e.state !== 'missing' &&
      e.filename.toLowerCase().includes(reqDoc.toLowerCase().split(' ')[0])
    )
  )

  const status = missingInformation.length > 0 ? 'needs_info' : 'draft'

  const linkedStatementLine = template.linkedAccountTypes.length > 0
    ? template.linkedAccountTypes.join(', ')
    : undefined

  return {
    noteNumber: template.noteNumber,
    title: template.title,
    noteType: template.noteType,
    content,
    linkedStatementLine,
    missingInformation,
    aiDrafted: false,
    status,
    requiresEvidence,
    evidenceProvided,
  }
}

function calculateBalanceForTemplate(
  template: NoteTemplate,
  context: NoteGenerationContext
): number {
  if (template.linkedAccountTypes.length === 0) {
    return 0
  }

  let total = 0
  for (const line of context.trialBalanceLines) {
    if (template.linkedAccountTypes.includes(line.accountType ?? '')) {
      total += Math.abs(line.balance)
    }
  }
  return total
}

function populateTemplate(
  template: string,
  context: NoteGenerationContext,
  balance: number
): string {
  let content = template

  content = content.replace(/\{\{balance\}\}/g, balance.toLocaleString('en-US'))

  const gross = context.trialBalanceLines
    .filter(l => l.accountType === 'non-current-asset' && l.balance > 0)
    .reduce((sum, l) => sum + l.balance, 0)

  const accumulated = Math.abs(
    context.trialBalanceLines
      .filter(l => l.accountType === 'non-current-asset' && l.balance < 0)
      .reduce((sum, l) => sum + l.balance, 0)
  )

  const net = gross - accumulated

  content = content.replace(/\{\{gross\}\}/g, gross.toLocaleString('en-US'))
  content = content.replace(/\{\{accumulated\}\}/g, accumulated.toLocaleString('en-US'))
  content = content.replace(/\{\{net\}\}/g, net.toLocaleString('en-US'))

  content += `\n\n⚠ DRAFT — This note is auto-generated and requires human review, verification of amounts, and tailoring to the Company's specific circumstances. All figures are preliminary and subject to audit adjustments.`

  return content
}

export function getMissingInfoSummary(notes: GeneratedNote[]): string[] {
  const allMissing = new Set<string>()
  for (const note of notes) {
    for (const item of note.missingInformation) {
      allMissing.add(item)
    }
  }
  return Array.from(allMissing)
}

export function getEvidenceGapSummary(notes: GeneratedNote[]): Array<{
  document: string
  noteType: string
  provided: boolean
}> {
  const gaps: Array<{ document: string; noteType: string; provided: boolean }> = []
  for (const note of notes) {
    for (const doc of note.requiresEvidence) {
      const provided = note.evidenceProvided.includes(doc)
      gaps.push({ document: doc, noteType: note.noteType, provided })
    }
  }
  return gaps
}
