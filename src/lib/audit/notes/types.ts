// ─── Notes Engine v1 Types ───
// Rule-based note generation types for AuditOS.

export type NoteCategory =
  | 'accounting_policy'
  | 'fixed_assets'
  | 'financial_instruments'
  | 'inventory'
  | 'related_party'
  | 'revenue'
  | 'expenses'
  | 'borrowings'
  | 'equity'
  | 'tax'
  | 'contingencies'
  | 'other'

export type NoteStatus = 'draft' | 'needs_info' | 'reviewed' | 'approved'

export interface NoteTemplate {
  noteNumber: string
  title: string
  noteType: NoteCategory
  contentTemplate: string
  linkedAccountTypes: string[]
  requiredEvidence: string[]
  missingInfoCheckers: MissingInfoChecker[]
  displayOrder: number
}

export interface MissingInfoChecker {
  id: string
  label: string
  check: (context: NoteGenerationContext) => boolean
}

export interface NoteGenerationContext {
  engagementId: string
  trialBalanceLines: Array<{
    accountCode: string
    accountName: string
    debitAmount: number
    creditAmount: number
    balance: number
    accountType?: string
  }>
  mappings: Array<{
    sourceAccountCode: string
    sourceAccountName: string
    canonicalAccountName?: string
    statementClassification?: string
  }>
  financialStatements: Array<{
    statementType: string
    lines: Array<{
      label: string
      amount: number
      isTotal: boolean
      linkedAccountMappings: string[]
    }>
  }>
  existingNotes: Array<{
    title: string
    status: string
  }>
  evidence: Array<{
    filename: string
    state: string
    targetLabel: string
  }>
  findings: Array<{
    title: string
    findingType: string
    severity: string
    relatedAccountIds: string[]
  }>
}

export interface GeneratedNote {
  noteNumber: string
  title: string
  noteType: NoteCategory
  content: string
  linkedStatementLine?: string
  missingInformation: string[]
  aiDrafted: boolean
  status: NoteStatus
  requiresEvidence: string[]
  evidenceProvided: string[]
}

export interface EvidenceRequirement {
  noteType: NoteCategory
  requiredDocuments: string[]
  standardReference?: string
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    noteNumber: '1',
    title: 'General Information and Basis of Preparation',
    noteType: 'accounting_policy',
    contentTemplate: `The Company is incorporated in the Kingdom of Saudi Arabia. These financial statements have been prepared in accordance with IFRS for SMEs on a historical cost basis.`,
    linkedAccountTypes: [],
    requiredEvidence: ['Certificate of incorporation', 'Articles of association'],
    missingInfoCheckers: [
      { id: 'legal-form', label: 'Legal form of entity', check: () => true },
      { id: 'incorporation-date', label: 'Date of incorporation', check: () => true },
    ],
    displayOrder: 1,
  },
  {
    noteNumber: '2',
    title: 'Cash and Cash Equivalents',
    noteType: 'financial_instruments',
    contentTemplate: `Cash and cash equivalents include cash on hand and balances with banks. The balance as at the reporting date is SAR {{balance}}.`,
    linkedAccountTypes: ['asset'],
    requiredEvidence: ['Bank confirmation letters', 'Bank statements'],
    missingInfoCheckers: [
      { id: 'bank-confirmation', label: 'Bank confirmation for all accounts', check: (ctx) => !hasEvidence(ctx, 'bank') },
    ],
    displayOrder: 2,
  },
  {
    noteNumber: '3',
    title: 'Trade Receivables',
    noteType: 'financial_instruments',
    contentTemplate: `Trade receivables are carried at original invoice amount less allowance for expected credit losses. The balance as at the reporting date is SAR {{balance}}.`,
    linkedAccountTypes: ['asset'],
    requiredEvidence: ['AR aging report', 'ECL assessment'],
    missingInfoCheckers: [
      { id: 'ar-aging', label: 'Aging analysis of receivables', check: (ctx) => !hasEvidence(ctx, 'ar_aging') },
      { id: 'ecl-assessment', label: 'Expected credit loss assessment', check: () => true },
    ],
    displayOrder: 3,
  },
  {
    noteNumber: '4',
    title: 'Inventories',
    noteType: 'inventory',
    contentTemplate: `Inventories are stated at the lower of cost and net realisable value. The balance as at the reporting date is SAR {{balance}}.`,
    linkedAccountTypes: ['asset'],
    requiredEvidence: ['Inventory count sheet', 'Inventory valuation report', 'NRV assessment'],
    missingInfoCheckers: [
      { id: 'inventory-count', label: 'Physical inventory count sheet', check: (ctx) => !hasEvidence(ctx, 'inventory') },
      { id: 'costing-method', label: 'Inventory costing method (FIFO/Weighted Average)', check: () => true },
      { id: 'nrv-assessment', label: 'Net realisable value assessment', check: () => true },
    ],
    displayOrder: 4,
  },
  {
    noteNumber: '5',
    title: 'Property, Plant and Equipment',
    noteType: 'fixed_assets',
    contentTemplate: `Property, plant and equipment are stated at cost less accumulated depreciation. Depreciation is computed on a straight-line basis over the estimated useful lives. Gross book value: SAR {{gross}}, Accumulated depreciation: SAR {{accumulated}}, Net book value: SAR {{net}}.`,
    linkedAccountTypes: ['non-current-asset'],
    requiredEvidence: ['Fixed asset register', 'Depreciation schedule', 'Addition/disposal invoices'],
    missingInfoCheckers: [
      { id: 'depreciation-rates', label: 'Depreciation rates/useful lives by asset class', check: () => true },
      { id: 'additions-disposals', label: 'Addition and disposal details', check: () => true },
      { id: 'collateral', label: 'Collateral details if pledged', check: () => true },
    ],
    displayOrder: 5,
  },
  {
    noteNumber: '6',
    title: 'Trade Payables',
    noteType: 'financial_instruments',
    contentTemplate: `Trade payables are obligations to suppliers for goods and services acquired in the ordinary course of business. The balance as at the reporting date is SAR {{balance}}.`,
    linkedAccountTypes: ['liability'],
    requiredEvidence: ['Supplier statements', 'AP aging report'],
    missingInfoCheckers: [],
    displayOrder: 6,
  },
  {
    noteNumber: '7',
    title: 'Short-term Borrowings',
    noteType: 'borrowings',
    contentTemplate: `Short-term borrowings consist of financing facilities from banks. The balance as at the reporting date is SAR {{balance}}.`,
    linkedAccountTypes: ['liability'],
    requiredEvidence: ['Loan/financing agreement', 'Repayment schedule', 'Bank confirmation'],
    missingInfoCheckers: [
      { id: 'loan-terms', label: 'Financing facility terms and conditions', check: () => true },
      { id: 'maturity-date', label: 'Maturity date (verify current/non-current classification)', check: () => true },
      { id: 'profit-rate', label: 'Profit/interest rate', check: () => true },
    ],
    displayOrder: 7,
  },
  {
    noteNumber: '8',
    title: 'Revenue',
    noteType: 'revenue',
    contentTemplate: `Revenue is recognised when control of goods or services is transferred to the customer. Total revenue for the period: SAR {{balance}}.`,
    linkedAccountTypes: ['revenue'],
    requiredEvidence: ['Revenue breakdown by stream', 'Sample contracts'],
    missingInfoCheckers: [
      { id: 'revenue-segments', label: 'Revenue by segment/product line', check: () => true },
      { id: 'customer-concentration', label: 'Customer concentration details', check: () => true },
    ],
    displayOrder: 8,
  },
  {
    noteNumber: '9',
    title: 'Expenses by Nature',
    noteType: 'expenses',
    contentTemplate: `Operating expenses include cost of goods sold, salaries and wages, depreciation, and other administrative expenses. Total operating expenses: SAR {{balance}}.`,
    linkedAccountTypes: ['expense'],
    requiredEvidence: ['Expense breakdown', 'Employee benefit details'],
    missingInfoCheckers: [
      { id: 'expense-nature', label: 'Nature of expenses breakdown', check: () => true },
      { id: 'employee-benefits', label: 'Employee benefit details', check: () => true },
    ],
    displayOrder: 9,
  },
  {
    noteNumber: '10',
    title: 'Finance Cost',
    noteType: 'borrowings',
    contentTemplate: `Finance cost of SAR {{balance}} represents charges on financing arrangements during the period.`,
    linkedAccountTypes: ['expense'],
    requiredEvidence: ['Finance cost schedule', 'Bank statements showing charges'],
    missingInfoCheckers: [
      { id: 'finance-cost-breakdown', label: 'Finance cost breakdown by facility', check: () => true },
    ],
    displayOrder: 10,
  },
  {
    noteNumber: '11',
    title: 'Zakat and Tax',
    noteType: 'tax',
    contentTemplate: `The Company is subject to Zakat and income tax regulations in the Kingdom of Saudi Arabia. Zakat/Tax payable as at the reporting date: SAR {{balance}}.`,
    linkedAccountTypes: ['liability'],
    requiredEvidence: ['Zakat/Tax filings', 'Correspondence with GAZT'],
    missingInfoCheckers: [
      { id: 'zakat-filing', label: 'Latest Zakat filing certificate', check: () => true },
    ],
    displayOrder: 11,
  },
  {
    noteNumber: '12',
    title: 'Share Capital',
    noteType: 'equity',
    contentTemplate: `Share capital as at the reporting date is SAR {{balance}}.`,
    linkedAccountTypes: ['equity'],
    requiredEvidence: ['Capital resolution', 'Commercial register'],
    missingInfoCheckers: [],
    displayOrder: 12,
  },
  {
    noteNumber: '13',
    title: 'Related Party Transactions',
    noteType: 'related_party',
    contentTemplate: `Related party transactions are disclosed based on management representations.`,
    linkedAccountTypes: [],
    requiredEvidence: ['Management representation letter', 'Related party declarations'],
    missingInfoCheckers: [
      { id: 'related-parties', label: 'Identity of related parties', check: () => true },
      { id: 'related-transactions', label: 'Nature and volume of transactions', check: () => true },
      { id: 'related-balances', label: 'Outstanding balances', check: () => true },
    ],
    displayOrder: 13,
  },
  {
    noteNumber: '14',
    title: 'Commitments and Contingencies',
    noteType: 'contingencies',
    contentTemplate: `The Company has no material capital commitments or contingent liabilities as at the reporting date, other than those arising in the ordinary course of business.`,
    linkedAccountTypes: [],
    requiredEvidence: ['Legal letter', 'Management representation on contingencies'],
    missingInfoCheckers: [
      { id: 'capital-commitments', label: 'Capital commitments', check: () => true },
      { id: 'contingent-liabilities', label: 'Contingent liabilities', check: () => true },
      { id: 'litigation', label: 'Litigation status', check: () => true },
    ],
    displayOrder: 14,
  },
]

function hasEvidence(ctx: NoteGenerationContext, keyword: string): boolean {
  return ctx.evidence.some(e =>
    e.state !== 'missing' &&
    e.filename.toLowerCase().includes(keyword) ||
    e.targetLabel.toLowerCase().includes(keyword)
  )
}
