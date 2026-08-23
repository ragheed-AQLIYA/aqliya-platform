import * as svc from "./services"
import type { DisclosureNote, Finding, Recommendation, ReviewComment, ApprovalRecord, AuditEvent, EvidenceObject } from "@/types/audit"
import { isArabicText } from "./arabic-pdf-support"
import { generateExport } from "./export"
import type { ExportFormat, ExportInput, ExportResult } from "./export"

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
  locale?: "en" | "ar" | "bilingual"
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
  const clientName = engagement.client?.name ?? ""
  const locale = isArabicText(clientName) || notes.some(n => isArabicText(n.title) || isArabicText(n.content)) ? "bilingual" : "en"
  return {
    engagementId,
    clientName,
    fiscalPeriod: engagement.fiscalPeriod,
    reportingFramework: engagement.client?.reportingFramework ?? "IFRS for SMEs",
    currency: engagement.client?.currencyCode ?? "SAR",
    status: engagement.status,
    exportedAt: new Date().toISOString(),
    labels: buildLabels(engagement.status, approvalRecords),
    statements: statementExports,
    notes,
    locale,
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

export async function generateArabicAuditReport(engagementId: string): Promise<ExportPackage> {
  const pkg = await exportFinancialStatements(engagementId)
  const [findings, recommendations, evidence, auditEvents] = await Promise.all([
    svc.getFindings(engagementId).catch(() => []),
    svc.getRecommendations(engagementId).catch(() => []),
    svc.getEvidence(engagementId).catch(() => []),
    svc.getAuditEvents(engagementId).catch(() => []),
  ])
  const approvalRecords = await svc.getApprovalRecords(engagementId)
  const now = new Date().toISOString()
  const arTitle: Record<string, string> = {
    balance_sheet: "قائمة المركز المالي",
    income_statement: "قائمة الدخل",
    equity: "قائمة التغيرات في حقوق الملكية",
    cash_flow: "قائمة التدفقات النقدية",
  }
  return {
    ...pkg,
    locale: "ar",
    statements: pkg.statements.map(s => ({
      ...s,
      title: arTitle[s.statementType] ?? s.title,
    })),
    auditFile: {
      exportedAt: now,
      evidenceChecklist: evidence.map(e => ({ ...e, exportedAt: now })),
      findings,
      recommendations,
      reviewComments: [],
      approvalRecords: approvalRecords.map(a => ({ ...a, exportedAt: now })),
      auditTrail: auditEvents,
    },
  }
}

export async function exportBilingual(engagementId: string, locale: "ar" | "en" | "bilingual"): Promise<ExportPackage> {
  const pkg = await exportFinancialStatements(engagementId)
  if (locale === "en") return { ...pkg, locale: "en" }
  const arPrefix: Record<string, string> = {
    balance_sheet: "قائمة المركز المالي",
    income_statement: "قائمة الدخل",
    equity: "قائمة التغيرات في حقوق الملكية",
    cash_flow: "قائمة التدفقات النقدية",
  }
  const enPrefix: Record<string, string> = {
    balance_sheet: "Statement of Financial Position",
    income_statement: "Statement of Income",
    equity: "Statement of Changes in Equity",
    cash_flow: "Statement of Cash Flows",
  }
  return {
    ...pkg,
    locale,
    statements: pkg.statements.map(s => {
      const arTitle = arPrefix[s.statementType] ?? s.title
      const enTitle = enPrefix[s.statementType] ?? s.title
      if (locale === "ar") {
        return { ...s, title: arTitle }
      }
      return { ...s, title: `${arTitle} / ${enTitle}` }
    }),
    notes: locale === "bilingual" ? pkg.notes : pkg.notes.map(n => ({
      ...n,
      title: locale === "ar" ? n.title : n.title,
    })),
  }
}

/**
 * Bridge an ExportPackage (structured data) into an ExportResult (rendered buffer).
 * Converts the package into ExportInput format and renders via the PDF/XLSX exporter.
 */
export async function renderExportPackage(pkg: ExportPackage, format: ExportFormat): Promise<ExportResult> {
  const input: ExportInput = {
    metadata: {
      engagementId: pkg.engagementId,
      clientName: pkg.clientName,
      fiscalPeriod: pkg.fiscalPeriod,
      reportingFramework: pkg.reportingFramework,
      currency: pkg.currency,
      status: pkg.status,
      exportedAt: pkg.exportedAt,
      labels: pkg.labels,
      locale: pkg.locale,
    },
    statements: pkg.statements.map((s, idx) => ({
      id: `stmt-${idx}`,
      engagementId: pkg.engagementId,
      statementType: s.statementType as "balance_sheet" | "income_statement" | "equity" | "cash_flow",
      title: s.title,
      status: s.status as "draft" | "reviewed" | "approved",
      lines: s.lines.map((l, li) => ({
        id: `line-${idx}-${li}`,
        statementId: `stmt-${idx}`,
        label: l.label,
        amount: l.amount,
        isTotal: l.isTotal,
        indentLevel: l.indentLevel,
        displayOrder: li,
        linkedAccountMappings: [],
      })),
      linkedAccounts: [],
      reviewComments: [],
      createdAt: pkg.exportedAt,
      updatedAt: pkg.exportedAt,
    })),
    notes: pkg.notes,
    ...(pkg.auditFile
      ? {
          evidence: pkg.auditFile.evidenceChecklist,
          findings: pkg.auditFile.findings,
          recommendations: pkg.auditFile.recommendations,
          reviewComments: pkg.auditFile.reviewComments,
          approvalRecords: pkg.auditFile.approvalRecords,
          auditTrail: pkg.auditFile.auditTrail,
        }
      : {}),
  }
  return generateExport(input, format)
}
