import { prisma, toFinding, toRecommendation, toReviewComment, toApprovalRecord, toAccountMapping, toFinancialStatementLine, toDisclosureNote, protectedAuditReadUnavailable } from "./common";
import type { PublicationPackage, FinancialStatement, FinancialStatementLine } from "./common";

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
