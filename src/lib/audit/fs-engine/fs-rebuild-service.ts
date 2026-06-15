import "server-only";

import { prisma } from "@/lib/prisma";
import {
  buildStatementLinesFromMappings,
  type MappingWithCanonical,
} from "@/lib/audit/db/statement-builder";
import type { FinancialStatementLine } from "@/types/audit";
import {
  buildCashFlowLinesFromContext,
  deriveCashFlowContext,
} from "./cash-flow-builder";
import type { FsRebuildSummary, FsStatementType } from "./types";
import { loadEngagementPresentationContext } from "@/lib/audit/presentation/engagement-presentation-config";
import { enrichMappingsWithErpMap1 } from "@/lib/audit/presentation/enrich-mapping-map1";

const FS_TITLES: Record<FsStatementType, string> = {
  income_statement: "Statement of Profit or Loss",
  balance_sheet: "Statement of Financial Position",
  equity: "Statement of Changes in Equity",
  cash_flow: "Statement of Cash Flows",
};

const FS_TYPES: FsStatementType[] = [
  "income_statement",
  "balance_sheet",
  "equity",
  "cash_flow",
];

export async function rebuildFinancialStatementsV2(
  engagementId: string,
): Promise<FsRebuildSummary> {
  const [mappings, existingStatements, presentationContext] = await Promise.all([
    prisma.auditAccountMapping.findMany({
      where: { engagementId },
      include: { canonicalAccount: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.auditFinancialStatement.findMany({ where: { engagementId } }),
    loadEngagementPresentationContext(engagementId),
  ]);

  const mappingRows = await enrichMappingsWithErpMap1(
    engagementId,
    mappings as MappingWithCanonical[],
  );
  let incomeLines: FinancialStatementLine[] = [];

  for (const statementType of FS_TYPES) {
    const existing = existingStatements.find(
      (s) => s.statementType === statementType,
    );
    const statementId = existing?.id ?? `fs-${statementType}-${engagementId}`;

    let lines: FinancialStatementLine[];
    if (statementType === "cash_flow") {
      const ctx = deriveCashFlowContext({
        mappings: mappingRows,
        incomeStatementLines: incomeLines,
      });
      lines = buildCashFlowLinesFromContext(statementId, ctx);
    } else {
      lines = buildStatementLinesFromMappings(
        statementId,
        statementType,
        mappingRows,
        {
          presentationProfile: presentationContext.presentationProfile,
          presentationPolicy: presentationContext.policy,
        },
      );
      if (statementType === "income_statement") {
        incomeLines = lines;
      }
    }

    const preserveStatus =
      existing?.status === "approved" || existing?.status === "reviewed";
    const nextStatus = preserveStatus ? existing!.status : "draft";

    if (existing) {
      await prisma.auditFinancialStatement.update({
        where: { id: existing.id },
        data: {
          lines: lines as unknown as object,
          title: FS_TITLES[statementType],
          status: nextStatus,
        },
      });
    } else {
      await prisma.auditFinancialStatement.create({
        data: {
          id: statementId,
          engagementId,
          statementType,
          title: FS_TITLES[statementType],
          status: "draft",
          lines: lines as unknown as object,
        },
      });
    }
  }

  await prisma.auditEvent.create({
    data: {
      engagementId,
      eventType: "financial_statement.v2_rebuilt",
      actorId: "system",
      actorName: "FS Engine v2",
      actorRole: "system",
      targetType: "engagement",
      targetId: engagementId,
      description: `Rebuilt ${FS_TYPES.length} financial statements (v2)`,
      metadata: { statementTypes: FS_TYPES } as object,
    },
  });

  return {
    engagementId,
    statementTypes: FS_TYPES,
    rebuiltAt: new Date().toISOString(),
  };
}
