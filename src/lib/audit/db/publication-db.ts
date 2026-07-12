import { prisma } from "@/lib/prisma";
import type {
  PublicationPackage,
  AuditEvent,
  FinancialStatement,
  FinancialStatementLine,
  Finding,
  Recommendation,
  ReviewComment,
  ApprovalRecord,
  EvidenceObject,
} from "@/types/audit";
import {
  toFinding,
  toRecommendation,
  toReviewComment,
  toApprovalRecord,
  toAccountMapping,
  toFinancialStatementLine,
  toDisclosureNote,
  toAuditEvent,
  toEvidenceObject,
  protectedAuditReadUnavailable,
} from "./types";
import { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";

export async function getPublicationPackage(
  engagementId: string,
): Promise<PublicationPackage | null> {
  try {
    const pkg = await prisma.auditPublicationPackage.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
    });
    if (!pkg) return null;
    const [
      statements,
      notes,
      findings,
      recommendations,
      reviewComments,
      approvalRecords,
      evidenceList,
    ] = await Promise.all([
      prisma.auditFinancialStatement.findMany({ where: { engagementId } }),
      prisma.auditDisclosureNote.findMany({ where: { engagementId } }),
      prisma.auditFinding.findMany({ where: { engagementId } }),
      prisma.auditRecommendation.findMany({ where: { engagementId } }),
      prisma.auditReviewComment.findMany({ where: { engagementId } }),
      prisma.auditApprovalRecord.findMany({ where: { engagementId } }),
      prisma.auditEvidence.findMany({ where: { engagementId } }),
    ]);
    const mappedComments = reviewComments.map(toReviewComment);
    const mappedFindings = findings.map(toFinding);
    const mappedRecs = recommendations.map(toRecommendation);
    const mappedApprovals = approvalRecords.map(toApprovalRecord);
    const mappingData = await prisma.auditAccountMapping.findMany({
      where: { engagementId },
      include: { canonicalAccount: true },
    });
    const mappedMappings = mappingData.map(toAccountMapping);
    const mappedStatements = statements.map((fs) => {
      const lines: FinancialStatementLine[] =
        typeof fs.lines === "string"
          ? JSON.parse(fs.lines)
          : Array.isArray(fs.lines)
            ? fs.lines
            : [];
      return {
        id: fs.id,
        engagementId: fs.engagementId,
        statementType: fs.statementType as FinancialStatement["statementType"],
        title: fs.title,
        status: fs.status as FinancialStatement["status"],
        lines: lines.map(toFinancialStatementLine),
        linkedAccounts: mappedMappings,
        reviewComments: mappedComments.filter(
          (rc) => rc.targetType === "statement" && rc.targetId === fs.id,
        ),
        createdAt: fs.createdAt.toISOString(),
        updatedAt: fs.updatedAt.toISOString(),
      };
    });
    const mappedNotes = notes.map((n) =>
      toDisclosureNote(
        n,
        mappedComments.filter(
          (rc) => rc.targetType === "note" && rc.targetId === n.id,
        ),
      ),
    );
    const openReviewCount = reviewComments.filter(
      (rc) => rc.status === "open",
    ).length;
    const findingsSummary = `${mappedFindings.length} findings (${mappedFindings.filter((f) => f.status === "draft").length} draft, ${mappedFindings.filter((f) => f.status === "open").length} open, ${mappedFindings.filter((f) => f.status === "in_review").length} in review)`;
    const evidenceSummary = `${evidenceList.length} evidence items (${evidenceList.filter((e) => e.state === "accepted").length} accepted, ${evidenceList.filter((e) => e.state === "reviewed").length} reviewed, ${evidenceList.filter((e) => e.state === "missing").length} missing)`;
    return {
      id: pkg.id,
      engagementId: pkg.engagementId,
      status: pkg.status as PublicationPackage["status"],
      statements: mappedStatements,
      notes: mappedNotes,
      findings: mappedFindings,
      recommendations: mappedRecs,
      reviewSummary: `${openReviewCount} open comment(s)`,
      findingsSummary,
      evidenceSummary,
      approvalHistory: mappedApprovals,
      publishedAt: pkg.publishedAt?.toISOString() ?? undefined,
      publishedBy: pkg.publishedBy ?? undefined,
      lockedAt: pkg.lockedAt?.toISOString() ?? undefined,
    };
  } catch (error) {
    protectedAuditReadUnavailable(
      `getPublicationPackage(${engagementId})`,
      error,
    );
  }
}

export async function getAuditEvents(
  engagementId: string,
): Promise<AuditEvent[]> {
  try {
    const events = await prisma.auditEvent.findMany({
      where: { engagementId },
      orderBy: { timestamp: "desc" },
    });
    if (events.length === 0) return [];
    return events.map(toAuditEvent);
  } catch (error) {
    protectedAuditReadUnavailable(`getAuditEvents(${engagementId})`, error);
  }
}

export async function recordAuditEvent(params: {
  engagementId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetType: string;
  targetId: string;
  previousState?: string;
  newState?: string;
  description: string;
  aiRelated?: boolean;
  metadata?: Record<string, unknown>;
}): Promise<AuditEvent> {
  const event = await recordAuditOsAuditEvent({
    engagementId: params.engagementId,
    eventType: params.eventType,
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    targetType: params.targetType,
    targetId: params.targetId,
    previousState: params.previousState ?? "",
    newState: params.newState ?? "",
    description: params.description,
    aiRelated: params.aiRelated ?? false,
    metadata: params.metadata ?? undefined,
  });
  return toAuditEvent(event);
}

export async function getTraceability(
  engagementId: string,
  targetType: string,
  targetId: string,
): Promise<any> {
  try {
    const forwardTrace: any[] = [];
    const backwardTrace: any[] = [];

    const trialBalance = await prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });
    if (trialBalance) {
      forwardTrace.push({
        id: `tb-${trialBalance.id}`,
        type: "source_data",
        label: `Trial Balance: ${trialBalance.sourceFile}`,
        status: trialBalance.trustState,
      });
      const matchingLines = trialBalance.lines.filter(
        (l) => l.id === targetId || l.accountCode === targetId,
      );
      for (const line of matchingLines) {
        forwardTrace.push({
          id: `tbl-${line.id}`,
          type: "source_data",
          label: `${line.accountCode} - ${line.accountName}`,
          status: "imported",
          amount: line.balance,
        });
      }
    }

    const mapping = await prisma.auditAccountMapping.findFirst({
      where: {
        OR: [
          { id: targetId },
          { sourceAccountId: targetId },
          { sourceAccountCode: targetId },
        ],
        engagementId,
      },
      include: { canonicalAccount: true },
    });
    if (mapping) {
      forwardTrace.push({
        id: `map-${mapping.id}`,
        type: "account",
        label: `${mapping.sourceAccountName} → ${mapping.canonicalAccount?.name ?? "unmapped"}`,
        status: mapping.status,
        mappingType: mapping.mappingType,
      });
    }

    const evidence = await prisma.auditEvidence.findFirst({
      where: {
        OR: [{ id: targetId }, { links: { some: { targetId } } }],
        engagementId,
      },
      include: { links: true },
    });
    if (evidence) {
      forwardTrace.push({
        id: `ev-${evidence.id}`,
        type: "evidence",
        label: evidence.filename,
        status: evidence.state,
      });
    }

    // Also check for evidence linked to target via EvidenceLink
    const evidenceLinks = await prisma.auditEvidenceLink.findMany({
      where: { OR: [{ targetId }, { evidenceId: targetId }] },
      include: { evidence: true },
      take: 5,
    });
    for (const el of evidenceLinks) {
      forwardTrace.push({
        id: `evlink-${el.id}`,
        type: "evidence",
        label: el.evidence.filename,
        status: el.evidence.state,
        linkType: el.linkType,
      });
    }

    const finding = await prisma.auditFinding.findFirst({
      where: { id: targetId, engagementId },
    });
    if (finding) {
      forwardTrace.push({
        id: `find-${finding.id}`,
        type: "finding",
        label: finding.title,
        status: finding.status,
        severity: finding.severity,
      });
    }

    const rec = await prisma.auditRecommendation.findFirst({
      where: { engagementId, findingId: targetId },
    });
    const recById = await prisma.auditRecommendation.findFirst({
      where: { id: targetId, engagementId },
    });
    const foundRec = rec ?? recById;
    if (foundRec) {
      forwardTrace.push({
        id: `rec-${foundRec.id}`,
        type: "recommendation",
        label: foundRec.title,
        status: foundRec.status,
        riskLevel: foundRec.riskLevel,
      });
    }

    const comments = await prisma.auditReviewComment.findMany({
      where: { engagementId, targetId },
      take: 5,
    });
    for (const c of comments) {
      forwardTrace.push({
        id: `rc-${c.id}`,
        type: "review",
        label: c.comment.substring(0, 60),
        status: c.status,
        reviewer: c.reviewerName,
      });
    }

    const pkg = await prisma.auditPublicationPackage.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
    });
    if (pkg) {
      backwardTrace.push({
        id: `pub-${pkg.id}`,
        type: "publication",
        label: "Published Output",
        status: pkg.status,
      });
    }

    const approvals = await prisma.auditApprovalRecord.findMany({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    for (const a of approvals) {
      backwardTrace.push({
        id: `appr-${a.id}`,
        type: "approval",
        label: `Approval by ${a.approverName}`,
        status: a.action,
      });
    }

    const events = await prisma.auditEvent.findMany({
      where: { engagementId },
      orderBy: { timestamp: "desc" },
      take: 10,
    });
    for (const ae of events) {
      backwardTrace.push({
        id: `event-${ae.id}`,
        type: "event",
        label: ae.description,
        status: ae.eventType,
        actor: ae.actorName,
        timestamp: ae.timestamp.toISOString(),
      });
    }

    const aiOutputs = await prisma.auditAiOutput.findMany({
      where: {
        OR: [{ id: targetId }, { sourceEntityId: targetId }],
        engagementId,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    for (const ao of aiOutputs) {
      backwardTrace.push({
        id: `ai-${ao.id}`,
        type: "ai_output",
        label: `${ao.suggestionType}: ${ao.outputContent.substring(0, 60)}`,
        status: ao.status,
        timestamp: ao.createdAt.toISOString(),
      });
    }

    return { targetType, targetId, forwardTrace, backwardTrace };
  } catch (error) {
    console.warn(`[AuditDB] getTraceability(${engagementId}) error`, error);
    return { targetType, targetId, forwardTrace: [], backwardTrace: [] };
  }
}

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
    const auditEvents = await prisma.auditEvent.findMany({
      where: { engagementId },
      orderBy: { timestamp: "asc" },
    });
    const mappedEvents = auditEvents.map(toAuditEvent);
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
    console.warn(`[AuditDB] getFullTraceability(${engagementId}) error`, error);
    return {
      targetLabel: label,
      nodes: [],
      message: "Error building traceability",
    };
  }
}
