import type { FinancialStatement, DisclosureNote, EvidenceObject, Finding, Recommendation, ReviewComment, ApprovalRecord, AuditEvent } from "@/types/audit"

export type ExportFormat = 'pdf' | 'xlsx'

export interface ExportMetadata {
  engagementId: string
  clientName: string
  fiscalPeriod: string
  reportingFramework: string
  currency: string
  status: string
  exportedAt: string
  labels: {
    isDraft: boolean
    isApproved: boolean
    draftWarning: string
    approvalInfo: string | null
  }
  locale?: "en" | "ar" | "bilingual"
}

export interface ExportInput {
  metadata: ExportMetadata
  statements: FinancialStatement[]
  notes: DisclosureNote[]
  evidence?: EvidenceObject[]
  findings?: Finding[]
  recommendations?: Recommendation[]
  reviewComments?: ReviewComment[]
  approvalRecords?: ApprovalRecord[]
  auditTrail?: AuditEvent[]
}

export interface ExportResult {
  format: ExportFormat
  filename: string
  mimeType: string
  buffer: Buffer
  sizeBytes: number
}

export interface Exporter {
  readonly format: ExportFormat
  generate(input: ExportInput): Promise<ExportResult>
}
