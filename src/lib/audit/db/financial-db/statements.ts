import { prisma } from "./common";
import {
  toFinancialStatementLine,
  toReviewComment,
  toAccountMapping,
  protectedAuditReadUnavailable,
} from "./common";
import type { FinancialStatement, FinancialStatementLine } from "./common";

export async function getFinancialStatements(
  engagementId: string,
): Promise<FinancialStatement[]> {
  try {
    const statements = await prisma.auditFinancialStatement.findMany({
      where: { engagementId },
      orderBy: { createdAt: "asc" },
    });
    if (statements.length === 0) return [];
    const [mappings, reviewComments] = await Promise.all([
      prisma.auditAccountMapping.findMany({
        where: { engagementId },
        include: { canonicalAccount: true },
      }),
      prisma.auditReviewComment.findMany({ where: { engagementId } }),
    ]);
    const mappedMappings = mappings.map(toAccountMapping);
    const mappedComments = reviewComments.map(toReviewComment);
    return statements.map((fs) => {
      let lines: FinancialStatementLine[] = [];
      try {
        lines =
          typeof fs.lines === "string"
            ? JSON.parse(fs.lines)
            : Array.isArray(fs.lines)
              ? fs.lines
              : [];
      } catch {
        lines = [];
      }
      if (!Array.isArray(lines)) lines = [];
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
  } catch (error) {
    protectedAuditReadUnavailable(
      `getFinancialStatements(${engagementId})`,
      error,
    );
  }
}

export async function getEquityStatementLines(): Promise<
  FinancialStatementLine[]
> {
  try {
    const eq = await prisma.auditFinancialStatement.findFirst({
      where: { statementType: "equity" },
      orderBy: { createdAt: "desc" },
    });
    if (!eq) return [];
    const lines: FinancialStatementLine[] =
      typeof eq.lines === "string"
        ? JSON.parse(eq.lines)
        : Array.isArray(eq.lines)
          ? eq.lines
          : [];
    return lines.map(toFinancialStatementLine);
  } catch (error) {
    protectedAuditReadUnavailable("getEquityStatementLines", error);
  }
}
