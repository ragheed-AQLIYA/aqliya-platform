import { prisma } from "./common";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "platform", action: "unknown" });

export async function getTraceability(
  engagementId: string,
  targetType: string,
  targetId: string,
): Promise<any> {
  try {
    const forwardTrace: any[] = [];
    const backwardTrace: any[] = [];

    const [
      trialBalance,
      mapping,
      evidence,
      evidenceLinks,
      finding,
      rec,
      recById,
      comments,
      pkg,
      approvals,
      events,
      aiOutputs,
    ] = await Promise.all([
      prisma.auditTrialBalance.findFirst({
        where: { engagementId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditAccountMapping.findFirst({
        where: {
          OR: [
            { id: targetId },
            { sourceAccountId: targetId },
            { sourceAccountCode: targetId },
          ],
          engagementId,
        },
        include: { canonicalAccount: true },
      }),
      prisma.auditEvidence.findFirst({
        where: {
          OR: [{ id: targetId }, { links: { some: { targetId } } }],
          engagementId,
        },
        include: { links: true },
      }),
      prisma.auditEvidenceLink.findMany({
        where: { OR: [{ targetId }, { evidenceId: targetId }] },
        include: { evidence: true },
        take: 5,
      }),
      prisma.auditFinding.findFirst({
        where: { id: targetId, engagementId },
      }),
      prisma.auditRecommendation.findFirst({
        where: { engagementId, findingId: targetId },
      }),
      prisma.auditRecommendation.findFirst({
        where: { id: targetId, engagementId },
      }),
      prisma.auditReviewComment.findMany({
        where: { engagementId, targetId },
        take: 5,
      }),
      prisma.auditPublicationPackage.findFirst({
        where: { engagementId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditApprovalRecord.findMany({
        where: { engagementId },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
      prisma.platformAuditLog.findMany({
        where: { productKey: "audit_os", sourceId: engagementId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.auditAiOutput.findMany({
        where: {
          OR: [{ id: targetId }, { sourceEntityId: targetId }],
          engagementId,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

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

    if (mapping) {
      forwardTrace.push({
        id: `map-${mapping.id}`,
        type: "account",
        label: `${mapping.sourceAccountName} → ${mapping.canonicalAccount?.name ?? "unmapped"}`,
        status: mapping.status,
        mappingType: mapping.mappingType,
      });
    }

    if (evidence) {
      forwardTrace.push({
        id: `ev-${evidence.id}`,
        type: "evidence",
        label: evidence.filename,
        status: evidence.state,
      });
    }

    for (const el of evidenceLinks) {
      forwardTrace.push({
        id: `evlink-${el.id}`,
        type: "evidence",
        label: el.evidence.filename,
        status: el.evidence.state,
        linkType: el.linkType,
      });
    }

    if (finding) {
      forwardTrace.push({
        id: `find-${finding.id}`,
        type: "finding",
        label: finding.title,
        status: finding.status,
        severity: finding.severity,
      });
    }

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

    for (const c of comments) {
      forwardTrace.push({
        id: `rc-${c.id}`,
        type: "review",
        label: c.comment.substring(0, 60),
        status: c.status,
        reviewer: c.reviewerName,
      });
    }

    if (pkg) {
      backwardTrace.push({
        id: `pub-${pkg.id}`,
        type: "publication",
        label: "Published Output",
        status: pkg.status,
      });
    }

    for (const a of approvals) {
      backwardTrace.push({
        id: `appr-${a.id}`,
        type: "approval",
        label: `Approval by ${a.approverName}`,
        status: a.action,
      });
    }

    for (const ae of events) {
      backwardTrace.push({
        id: `event-${ae.id}`,
        type: "event",
        label: ae.eventDescription,
        status: ae.action,
        actor: ae.actorName,
        timestamp: ae.createdAt.toISOString(),
      });
    }

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
    logger.warn("[AuditDB] getTraceability(${engagementId}) error", { error: error instanceof Error ? error?.message : String(error) });
    return { targetType, targetId, forwardTrace: [], backwardTrace: [] };
  }
}
