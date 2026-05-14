import * as svc from "./services"
import type { FinancialStatement, DisclosureNote, Finding, Recommendation, ReviewComment, ApprovalRecord, AuditEvent, EvidenceObject } from "@/types/audit"

export interface ExportPackage {
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
  statements: FinancialStatementExport[]
  notes: DisclosureNote[]
  auditFile?: AuditFileExport
}

export interface FinancialStatementExport {
  statementType: string
  title: string
  status: string
  lines: Array<{ label: string; amount: number; isTotal: boolean; indentLevel: number }>
  notes: string[]
}

export interface AuditFileExport {
  exportedAt: string
  evidenceChecklist: Array<EvidenceObject & { exportedAt: string }>
  findings: Finding[]
  recommendations: Recommendation[]
  reviewComments: ReviewComment[]
  approvalRecords: Array<ApprovalRecord & { exportedAt: string }>
  auditTrail: AuditEvent[]
}

const APPROVED_STATUSES = ["approved", "published"]

function buildLabels(engagementStatus: string, approvals: ApprovalRecord[]): ExportPackage["labels"] {
  const isApproved = APPROVED_STATUSES.includes(engagementStatus)
  const lastApproval = approvals.find(a => a.action === "approved")
  return {
    isDraft: !isApproved,
    isApproved,
    draftWarning: isApproved ? "" : "DRAFT — Not final until approved. This document is a working draft and does not represent final audited financial statements.",
    approvalInfo: isApproved && lastApproval
      ? `Approved by ${lastApproval.approverName} at ${new Date(lastApproval.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
      : null,
  }
}

export async function exportFinancialStatements(engagementId: string): Promise<ExportPackage> {
  const [engagement, statements, notes, approvalRecords] = await Promise.all([
    svc.getEngagement(undefined, engagementId),
    svc.getFinancialStatements(engagementId),
    svc.getDisclosureNotes(engagementId),
    svc.getApprovalRecords(engagementId),
  ])
  if (!engagement) throw new Error("Engagement not found")
  const statementExports: FinancialStatementExport[] = statements.map(fs => ({
    statementType: fs.statementType,
    title: fs.title,
    status: fs.status,
    lines: fs.lines.map(l => ({ label: l.label, amount: l.amount, isTotal: l.isTotal, indentLevel: l.indentLevel })),
    notes: notes.filter(n => n.linkedStatementLine === fs.title).map(n => `${n.noteNumber}. ${n.title}`),
  }))
  return {
    engagementId,
    clientName: engagement.client?.name ?? "",
    fiscalPeriod: engagement.fiscalPeriod,
    reportingFramework: engagement.client?.reportingFramework ?? "IFRS for SMEs",
    currency: engagement.client?.currencyCode ?? "SAR",
    status: engagement.status,
    exportedAt: new Date().toISOString(),
    labels: buildLabels(engagement.status, approvalRecords),
    statements: statementExports,
    notes,
  }
}

export async function exportAuditFile(engagementId: string): Promise<ExportPackage> {
  const base = await exportFinancialStatements(engagementId)
  const [evidence, findings, recommendations, reviewComments, approvalRecords, auditEvents] = await Promise.all([
    svc.getEvidence(engagementId),
    svc.getFindings(engagementId),
    svc.getRecommendations(engagementId),
    svc.getReviewComments(engagementId),
    svc.getApprovalRecords(engagementId),
    svc.getAuditEvents(engagementId),
  ])
  const now = new Date().toISOString()
  return {
    ...base,
    auditFile: {
      exportedAt: now,
      evidenceChecklist: evidence.map(e => ({ ...e, exportedAt: now })),
      findings,
      recommendations,
      reviewComments,
      approvalRecords: approvalRecords.map(a => ({ ...a, exportedAt: now })),
      auditTrail: auditEvents,
    },
  }
}

export async function exportBilingual(engagementId: string, locale: "en" | "ar"): Promise<ExportPackage> {
  const pkg = await exportFinancialStatements(engagementId)
  const prefix = locale === "ar" ? "بيان" : "Statement"
  return {
    ...pkg,
    statements: pkg.statements.map(s => ({
      ...s,
      title: locale === "ar" ? `${prefix}: ${s.title}` : s.title,
    })),
  }
}
