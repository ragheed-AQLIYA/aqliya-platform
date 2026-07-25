import { prisma, toFinancialStatementLine, toAccountMapping, toEvidenceObject, toFinding, toRecommendation, toReviewComment, toApprovalRecord, toAuditEvent, toAuditEventFromPlatformLog } from "./common";
import { createLogger } from "@/lib/observability/logger";
import type { FinancialStatementLine, EvidenceObject } from "./common";

const logger = createLogger({ product: "platform", action: "unknown" });

export async function getFullTraceability(
  engagementId: string,
  label: string,
): Promise<any> {
  try {
    const statements = await prisma.auditFinancialStatement.findMany({
      where: { engagementId },
    });
    let targetLine: FinancialStatementLine | null = null;
    let targetStatementId = "";
    for (const fs of statements) {
      const lines: FinancialStatementLine[] =
        typeof fs.lines === "string"
          ? JSON.parse(fs.lines)
          : Array.isArray(fs.lines)
            ? fs.lines
            : [];
      const found = lines.find((l) => l.label === label);
      if (found) {
        targetLine = toFinancialStatementLine(found);
        targetStatementId = fs.id;
        break;
      }
    }
    if (!targetLine) {
      return {
        targetLabel: label,
        nodes: [],
        message: "Line not found in database",
      };
    }
    const mappingIds = targetLine.linkedAccountMappings;
    const mappings =
      mappingIds.length > 0
        ? await prisma.auditAccountMapping.findMany({
            where: { id: { in: mappingIds }, engagementId },
            include: { canonicalAccount: true },
          })
        : [];
    const mappedMappings = mappings.map(toAccountMapping);
    const sourceAccountIds = mappedMappings.map((m) => m.sourceAccountId);
    const evidenceLinks =
      sourceAccountIds.length > 0
        ? await prisma.auditEvidenceLink.findMany({
            where: { targetId: { in: sourceAccountIds } },
            include: { evidence: { include: { links: true } } },
          })
        : [];
    const evidenceSet = new Map<string, EvidenceObject>();
    for (const el of evidenceLinks) {
      if (!evidenceSet.has(el.evidenceId)) {
        evidenceSet.set(el.evidenceId, toEvidenceObject(el.evidence));
      }
    }
    const mappedEvidence = Array.from(evidenceSet.values());
    const findings =
      sourceAccountIds.length > 0
        ? await prisma.auditFinding.findMany({ where: { engagementId } })
        : [];
    const relatedFindings = findings.filter((f) => {
      const accountIds: string[] = Array.isArray(f.relatedAccountIds)
        ? (f.relatedAccountIds as string[])
        : [];
      return accountIds.some((aid) => sourceAccountIds.includes(aid));
    });
    const mappedFindings = relatedFindings.map(toFinding);
    const findingIds = mappedFindings.map((f) => f.id);
    const recommendations =
      findingIds.length > 0
        ? await prisma.auditRecommendation.findMany({
            where: { findingId: { in: findingIds }, engagementId },
          })
        : [];
    const mappedRecs = recommendations.map(toRecommendation);
    const allTargetIds = [
      ...sourceAccountIds,
      ...findingIds,
      ...mappedRecs.map((r) => r.id),
      targetStatementId,
    ];
    const reviewComments =
      allTargetIds.length > 0
        ? await prisma.auditReviewComment.findMany({
            where: { engagementId, targetId: { in: allTargetIds } },
          })
        : [];
    const mappedComments = reviewComments.map(toReviewComment);
    const approvalRecords = await prisma.auditApprovalRecord.findMany({
      where: { engagementId },
    });
    const mappedApprovals = approvalRecords.map(toApprovalRecord);
    // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
    const auditEvents = await prisma.platformAuditLog.findMany({
      where: { productKey: "audit_os", sourceId: engagementId },
      orderBy: { createdAt: "asc" },
    });
    const mappedEvents = auditEvents.map(toAuditEventFromPlatformLog);
    const nodes: any[] = [];
    nodes.push({
      id: `line-${targetLine.id}`,
      type: "source_data",
      label: targetLine.label,
      entityType: "financial_statement_line",
      status: "identified",
      amount: targetLine.amount,
    });
    for (const m of mappedMappings) {
      nodes.push({
        id: `mapping-${m.id}`,
        type: "account",
        label: `${m.sourceAccountName} (${m.sourceAccountCode}) → ${m.canonicalAccountName ?? "unmapped"}`,
        entityType: "account_mapping",
        status: m.status,
        mappingType: m.mappingType,
      });
    }
    for (const ev of mappedEvidence) {
      nodes.push({
        id: `evidence-${ev.id}`,
        type: "evidence",
        label: ev.filename,
        entityType: "evidence",
        status: ev.state,
      });
    }
    for (const f of mappedFindings) {
      nodes.push({
        id: `finding-${f.id}`,
        type: "finding",
        label: f.title,
        entityType: "finding",
        status: f.status,
        severity: f.severity,
      });
    }
    for (const r of mappedRecs) {
      nodes.push({
        id: `rec-${r.id}`,
        type: "recommendation",
        label: r.title,
        entityType: "recommendation",
        status: r.status,
        riskLevel: r.riskLevel,
      });
    }
    for (const rc of mappedComments) {
      nodes.push({
        id: `comment-${rc.id}`,
        type: "review",
        label: rc.comment.substring(0, 60),
        entityType: "review_comment",
        status: rc.status,
        reviewerName: rc.reviewerName,
      });
    }
    for (const a of mappedApprovals) {
      nodes.push({
        id: `approval-${a.id}`,
        type: "approval",
        label: `Approval by ${a.approverName}`,
        entityType: "approval_record",
        status: a.action,
      });
    }
    for (const ae of mappedEvents) {
      nodes.push({
        id: `event-${ae.id}`,
        type: "event",
        label: ae.description,
        entityType: "audit_event",
        status: ae.eventType,
        timestamp: ae.timestamp,
      });
    }
    const aiOutputs = await prisma.auditAiOutput.findMany({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    for (const ao of aiOutputs) {
      nodes.push({
        id: `ai-${ao.id}`,
        type: "ai_output",
        label: `${ao.suggestionType}: ${ao.outputContent.substring(0, 60)}`,
        entityType: "ai_output",
        status: ao.status,
        timestamp: ao.createdAt.toISOString(),
      });
    }
    return { targetLabel: label, statementId: targetStatementId, nodes };
  } catch (error) {
    logger.warn("[AuditDB] getFullTraceability(${engagementId}) error", { error: error instanceof Error ? error?.message : String(error) });
    return {
      targetLabel: label,
      nodes: [],
      message: "Error building traceability",
    };
  }
}
