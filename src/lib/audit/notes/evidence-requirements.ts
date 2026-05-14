// ─── Evidence Requirements for Notes ───
// Maps note types to required evidence documents per IFRS for SMEs audit standards.

import type { EvidenceRequirement, NoteCategory } from './types'

export const EVIDENCE_REQUIREMENTS: EvidenceRequirement[] = [
  {
    noteType: 'accounting_policy',
    requiredDocuments: [
      'Certificate of incorporation',
      'Articles of association',
      'Management representation letter',
    ],
    standardReference: 'IFRS for SMEs Section 3',
  },
  {
    noteType: 'financial_instruments',
    requiredDocuments: [
      'Bank confirmation letters',
      'Bank statements (year-end)',
      'AR aging report',
      'AP aging report',
      'Supplier statements',
      'ECL assessment methodology',
    ],
    standardReference: 'IFRS for SMEs Section 11',
  },
  {
    noteType: 'inventory',
    requiredDocuments: [
      'Physical inventory count sheet',
      'Inventory valuation report',
      'NRV assessment for slow-moving items',
      'Costing method documentation (FIFO/Weighted Average)',
    ],
    standardReference: 'IFRS for SMEs Section 13',
  },
  {
    noteType: 'fixed_assets',
    requiredDocuments: [
      'Fixed asset register',
      'Depreciation schedule by asset class',
      'Addition invoices',
      'Disposal documentation',
      'Impairment assessment (if applicable)',
    ],
    standardReference: 'IFRS for SMEs Section 17',
  },
  {
    noteType: 'borrowings',
    requiredDocuments: [
      'Loan/financing agreements',
      'Repayment schedules',
      'Bank confirmations for facilities',
      'Finance cost schedule',
      'Covenant compliance certificates',
    ],
    standardReference: 'IFRS for SMEs Section 11',
  },
  {
    noteType: 'revenue',
    requiredDocuments: [
      'Revenue breakdown by stream/product',
      'Sample sales contracts',
      'Revenue recognition policy documentation',
      'Customer concentration analysis',
    ],
    standardReference: 'IFRS for SMEs Section 23',
  },
  {
    noteType: 'expenses',
    requiredDocuments: [
      'Expense breakdown by nature',
      'Employee benefit schedule',
      'Payroll records',
      'Major expense invoices',
    ],
    standardReference: 'IFRS for SMEs Section 23',
  },
  {
    noteType: 'equity',
    requiredDocuments: [
      'Share capital resolution',
      'Commercial register',
      'Dividend distribution records (if any)',
    ],
    standardReference: 'IFRS for SMEs Section 22',
  },
  {
    noteType: 'tax',
    requiredDocuments: [
      'Latest Zakat filing certificate',
      'Income tax filings (if applicable)',
      'Correspondence with GAZT',
      'Tax provision calculations',
    ],
    standardReference: 'IFRS for SMEs Section 29',
  },
  {
    noteType: 'related_party',
    requiredDocuments: [
      'Management representation letter',
      'Related party declarations',
      'Related party transaction schedule',
      'Board minutes (if applicable)',
    ],
    standardReference: 'IFRS for SMEs Section 33',
  },
  {
    noteType: 'contingencies',
    requiredDocuments: [
      'Legal letter from external counsel',
      'Management representation on contingencies',
      'Board minutes regarding litigation',
      'Guarantee documentation (if any)',
    ],
    standardReference: 'IFRS for SMEs Section 21',
  },
  {
    noteType: 'other',
    requiredDocuments: [],
  },
]

export function getEvidenceForNoteType(noteType: NoteCategory): EvidenceRequirement | undefined {
  return EVIDENCE_REQUIREMENTS.find(r => r.noteType === noteType)
}

export function getAllRequiredEvidence(): string[] {
  const all = new Set<string>()
  for (const req of EVIDENCE_REQUIREMENTS) {
    for (const doc of req.requiredDocuments) {
      all.add(doc)
    }
  }
  return Array.from(all)
}
