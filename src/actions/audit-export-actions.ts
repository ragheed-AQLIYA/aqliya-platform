"use server"

import { getAuditActor, requireRole } from "@/lib/audit/actor-context"
import { assertEngagementAccess } from "@/lib/audit/tenant-guard"
import { enforceAuditRateLimit } from "@/lib/audit/rate-limit"
import { getEvidence as svcGetEvidence, getFindings as svcGetFindings, getRecommendations as svcGetRecommendations, getReviewComments as svcGetReviewComments, getAuditEvents as svcGetAuditEvents } from "@/lib/audit/services"
import { getEngagement as svcGetEngagement, getFinancialStatements as svcGetFinancialStatements, getDisclosureNotes as svcGetDisclosureNotes, getApprovalRecords as svcGetApprovalRecords, recordAuditEvent as svcRecordAuditEvent } from "@/lib/audit/services"
import { generateExport } from "@/lib/audit/export"
import type { ExportFormat, ExportInput } from "@/lib/audit/export/types"
import { isArabicText } from "@/lib/audit/arabic-pdf-support"

const APPROVED_STATUSES = ["approved", "published"]

export async function exportEngagementAction(engagementId: string, format: ExportFormat) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner"])
  await assertEngagementAccess(engagementId, actor)
  await enforceAuditRateLimit(actor, "export_engagement", "export")

  if (format !== 'pdf' && format !== 'xlsx') {
    throw new Error(`Unsupported export format: ${format}. Use 'pdf' or 'xlsx'.`)
  }

  const [engagement, statements, notes, approvalRecords, evidence, findings, recommendations, reviewComments, auditEvents] = await Promise.all([
    svcGetEngagement(actor.organizationId, engagementId),
    svcGetFinancialStatements(engagementId),
    svcGetDisclosureNotes(engagementId),
    svcGetApprovalRecords(engagementId),
    svcGetEvidence(engagementId),
    svcGetFindings(engagementId),
    svcGetRecommendations(engagementId),
    svcGetReviewComments(engagementId),
    svcGetAuditEvents(engagementId),
  ])

  if (!engagement) throw new Error('Engagement not found')
  if (statements.length === 0) throw new Error('No financial statements to export. Complete account mapping first.')

  const isApproved = APPROVED_STATUSES.includes(engagement.status)
  const lastApproval = approvalRecords.find(a => a.action === 'approved')

  const clientName = engagement.client?.name ?? ''
  const locale =
    isArabicText(clientName) ||
    notes.some((n) => isArabicText(n.title) || isArabicText(n.content))
      ? ("bilingual" as const)
      : ("en" as const)

  const input: ExportInput = {
    metadata: {
      engagementId,
      clientName,
      locale,
      fiscalPeriod: engagement.fiscalPeriod,
      reportingFramework: engagement.client?.reportingFramework ?? 'IFRS for SMEs',
      currency: engagement.client?.currencyCode ?? 'SAR',
      status: engagement.status,
      exportedAt: new Date().toISOString(),
      labels: {
        isDraft: !isApproved,
        isApproved,
        draftWarning: isApproved ? '' : 'DRAFT — Not final until approved. This document is a working draft and does not represent final audited financial statements.',
        approvalInfo: isApproved && lastApproval
          ? `Approved by ${lastApproval.approverName} at ${new Date(lastApproval.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
          : null,
      },
    },
    statements,
    notes,
    evidence,
    findings,
    recommendations,
    reviewComments,
    approvalRecords,
    auditTrail: auditEvents,
  }

  const result = await generateExport(input, format)

  await svcRecordAuditEvent({
    engagementId,
    eventType: 'financial_statement.exported',
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: 'engagement',
    targetId: engagementId,
    newState: 'exported',
    description: `${format.toUpperCase()} export generated: ${result.filename} (${(result.sizeBytes / 1024).toFixed(0)}KB)`,
    aiRelated: false,
    metadata: {
      exportFormat: format,
      filename: result.filename,
      fileSizeBytes: result.sizeBytes,
      statementCount: statements.length,
      noteCount: notes.length,
    },
  })

  return {
    ...result,
    buffer: result.buffer.toString('base64'),
  }
}
