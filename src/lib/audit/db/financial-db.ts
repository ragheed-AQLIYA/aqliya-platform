import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  TrialBalance,
  TrialBalanceLine,
  AccountMapping,
  FinancialStatement,
  FinancialStatementLine,
} from "@/types/audit";
import {
  toTrialBalance,
  toTrialBalanceLine,
  toAccountMapping,
  toFinancialStatementLine,
  toReviewComment,
  protectedAuditReadUnavailable,
} from "./types";
import {
  buildStatementLinesFromMappings,
  type MappingWithCanonical,
} from "./statement-builder";

export async function getTrialBalance(
  engagementId: string,
): Promise<TrialBalance | null> {
  try {
    const tb = await prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });
    if (!tb) return null;
    return toTrialBalance(tb);
  } catch (error) {
    protectedAuditReadUnavailable(`getTrialBalance(${engagementId})`, error);
  }
}

export async function getTrialBalanceLines(
  engagementId: string,
): Promise<TrialBalanceLine[]> {
  try {
    const tb = await prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      include: { lines: true },
    });
    if (!tb || tb.lines.length === 0) return [];
    return tb.lines.map(toTrialBalanceLine);
  } catch (error) {
    protectedAuditReadUnavailable(
      `getTrialBalanceLines(${engagementId})`,
      error,
    );
  }
}

export async function getMappings(
  engagementId: string,
): Promise<AccountMapping[]> {
  try {
    const mappings = await prisma.auditAccountMapping.findMany({
      where: { engagementId },
      include: { canonicalAccount: true },
      orderBy: { createdAt: "asc" },
    });
    if (mappings.length === 0) return [];

    const { getLatestClassificationSources } = await import(
      "@/lib/tb-intelligence/firm-memory"
    );
    const { getMappingClassificationExplanations } = await import(
      "@/lib/tb-intelligence/classification-explanation"
    );
    const mapped = mappings.map(toAccountMapping);
    const [sources, explanations] = await Promise.all([
      getLatestClassificationSources(engagementId),
      getMappingClassificationExplanations(engagementId, mapped),
    ]);

    return mapped.map((m) => ({
      ...m,
      classificationSource: sources[m.sourceAccountCode],
      classificationExplanation: explanations[m.sourceAccountCode],
    }));
  } catch (error) {
    protectedAuditReadUnavailable(`getMappings(${engagementId})`, error);
  }
}

export async function rebuildFinancialStatementsForEngagement(
  engagementId: string,
): Promise<void> {
  let rebuiltViaV2 = false;
  try {
    const { maybeRebuildFinancialStatements } = await import(
      "@/lib/audit/fs-engine"
    );
    rebuiltViaV2 = await maybeRebuildFinancialStatements(engagementId);
  } catch (fsErr) {
    console.error(
      `[AuditDB] FS v2 rebuild failed for ${engagementId}`,
      fsErr,
    );
  }

  if (!rebuiltViaV2) {
  const { loadEngagementPresentationContext } = await import(
    "@/lib/audit/presentation/engagement-presentation-config"
  );
  const { enrichMappingsWithErpMap1 } = await import(
    "@/lib/audit/presentation/enrich-mapping-map1"
  );
  const [mappings, existingStatements, presentationContext] = await Promise.all([
    prisma.auditAccountMapping.findMany({
      where: { engagementId },
      include: { canonicalAccount: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.auditFinancialStatement.findMany({ where: { engagementId } }),
    loadEngagementPresentationContext(engagementId),
  ]);

  const enrichedMappings = await enrichMappingsWithErpMap1(
    engagementId,
    mappings as MappingWithCanonical[],
  );

  const titles: Record<string, string> = {
    income_statement: "Statement of Profit or Loss",
    balance_sheet: "Statement of Financial Position",
    equity: "Statement of Changes in Equity",
  };

  for (const statementType of [
    "income_statement",
    "balance_sheet",
    "equity",
  ] as const) {
    const existing = existingStatements.find(
      (statement) => statement.statementType === statementType,
    );
    const statementId = existing?.id ?? `fs-${statementType}-${engagementId}`;
    const lines = buildStatementLinesFromMappings(
      statementId,
      statementType,
      enrichedMappings,
      {
        presentationProfile: presentationContext.presentationProfile,
        presentationPolicy: presentationContext.policy,
      },
    );
    if (existing) {
      await prisma.auditFinancialStatement.update({
        where: { id: existing.id },
        data: { lines: lines as unknown as object },
      });
    } else {
      await prisma.auditFinancialStatement.create({
        data: {
          id: statementId,
          engagementId,
          statementType,
          title: titles[statementType],
          status: "draft",
          lines: lines as unknown as object,
        },
      });
    }
  }
  }

  try {
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: engagementId },
      select: { organizationId: true },
    });
    const { maybeRunAuditIntelligenceAfterDisclosure } = await import(
      "@/lib/audit/intelligence"
    );
    await maybeRunAuditIntelligenceAfterDisclosure(
      engagementId,
      engagement?.organizationId,
    );
  } catch (intelErr) {
    console.error(
      `[AuditDB] audit intelligence hook failed for ${engagementId}`,
      intelErr,
    );
  }

  try {
    const { maybeGenerateLeadSchedules, isLeadScheduleAutoEnabled } =
      await import("@/lib/audit/lead-schedule");
    if (isLeadScheduleAutoEnabled()) {
      await maybeGenerateLeadSchedules(engagementId, "mapping_confirm");
    } else {
      const { maybeSyncReportingGraphAfterFsRebuild } = await import(
        "@/lib/audit/reporting-graph/graph-sync-service"
      );
      await maybeSyncReportingGraphAfterFsRebuild(engagementId);
    }
  } catch (hookErr) {
    console.error(
      `[AuditDB] lead schedule / graph hook failed for ${engagementId}`,
      hookErr,
    );
  }

  try {
    const { maybeRunReconciliationAfterPipeline } = await import(
      "@/lib/audit/reconciliation"
    );
    await maybeRunReconciliationAfterPipeline(engagementId);
  } catch (reconErr) {
    console.error(
      `[AuditDB] reconciliation hook failed for ${engagementId}`,
      reconErr,
    );
  }

  try {
    const { maybeRunIfrsRulesAfterFsRebuild } = await import(
      "@/lib/audit/rules"
    );
    await maybeRunIfrsRulesAfterFsRebuild(engagementId);
  } catch (ifrsErr) {
    console.error(
      `[AuditDB] IFRS rules hook failed for ${engagementId}`,
      ifrsErr,
    );
  }

  try {
    const { maybeRunSocpaRulesAfterFsRebuild } = await import(
      "@/lib/audit/rules"
    );
    await maybeRunSocpaRulesAfterFsRebuild(engagementId);
  } catch (socpaErr) {
    console.error(
      `[AuditDB] SOCPA rules hook failed for ${engagementId}`,
      socpaErr,
    );
  }

  try {
    const { maybeRunIsaRulesAfterFsRebuild } = await import(
      "@/lib/audit/rules"
    );
    await maybeRunIsaRulesAfterFsRebuild(engagementId);
  } catch (isaErr) {
    console.error(
      `[AuditDB] ISA rules hook failed for ${engagementId}`,
      isaErr,
    );
  }

  try {
    const { maybeAutoGenerateDisclosureNotes } = await import(
      "@/lib/audit/notes/disclosure-auto"
    );
    await maybeAutoGenerateDisclosureNotes(engagementId);
  } catch (disclosureErr) {
    console.error(
      `[AuditDB] disclosure auto hook failed for ${engagementId}`,
      disclosureErr,
    );
  }
}

export async function confirmMapping(
  engagementId: string,
  mappingId: string,
): Promise<AccountMapping | null> {
  try {
    const updated = await prisma.auditAccountMapping.update({
      where: { id: mappingId },
      data: {
        status: "confirmed",
        mappingType: "human_mapped",
        mappedAt: new Date(),
      },
      include: { canonicalAccount: true },
    });
    await rebuildFinancialStatementsForEngagement(engagementId);
    return toAccountMapping(updated);
  } catch (error) {
    console.error(
      `[AuditDB] confirmMapping(${mappingId}) failed. Mock fallback disabled for mutation path.`,
      error,
    );
    throw new Error(
      `AuditOS mutation unavailable: confirmMapping(${mappingId}). Mock fallback disabled.`,
    );
  }
}

export async function confirmAllSuggestedMappings(engagementId: string): Promise<{
  confirmedCount: number;
  mappings: AccountMapping[];
}> {
  try {
    const pending = await prisma.auditAccountMapping.findMany({
      where: {
        engagementId,
        status: "pending",
        canonicalAccountId: { not: null },
      },
      select: { id: true },
    });

    if (pending.length === 0) {
      return { confirmedCount: 0, mappings: [] };
    }

    const ids = pending.map((p) => p.id);
    await prisma.auditAccountMapping.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "confirmed",
        mappingType: "confirmed_ai",
        mappedAt: new Date(),
      },
    });

    await rebuildFinancialStatementsForEngagement(engagementId);

    const updated = await prisma.auditAccountMapping.findMany({
      where: { id: { in: ids } },
      include: { canonicalAccount: true },
      orderBy: { sourceAccountCode: "asc" },
    });

    return {
      confirmedCount: updated.length,
      mappings: updated.map((m) => toAccountMapping(m)),
    };
  } catch (error) {
    console.error(
      `[AuditDB] confirmAllSuggestedMappings(${engagementId}) failed.`,
      error,
    );
    throw new Error(
      `AuditOS mutation unavailable: confirmAllSuggestedMappings(${engagementId}).`,
    );
  }
}

export async function getAccountMappingById(
  mappingId: string,
): Promise<AccountMapping | null> {
  try {
    const row = await prisma.auditAccountMapping.findUnique({
      where: { id: mappingId },
      include: { canonicalAccount: true },
    });
    return row ? toAccountMapping(row) : null;
  } catch (error) {
    console.warn(`[AuditDB] getAccountMappingById(${mappingId}) error`, error);
    return null;
  }
}

export async function updateManualMapping(data: {
  engagementId: string;
  mappingId: string;
  canonicalAccountId: string | null;
  mappedBy?: string;
}): Promise<AccountMapping | null> {
  try {
    const canonicalAccount = data.canonicalAccountId
      ? await prisma.auditCanonicalAccount.findUnique({
          where: { id: data.canonicalAccountId },
        })
      : null;

    const updated = await prisma.auditAccountMapping.update({
      where: { id: data.mappingId },
      data: {
        canonicalAccountId: data.canonicalAccountId,
        statementClassification: canonicalAccount?.category ?? null,
        status: data.canonicalAccountId ? "confirmed" : "pending",
        mappingType: data.canonicalAccountId ? "human_mapped" : "ai_suggested",
        mappedBy: data.mappedBy ?? null,
        mappedAt: data.canonicalAccountId ? new Date() : null,
      },
      include: { canonicalAccount: true },
    });

    await rebuildFinancialStatementsForEngagement(data.engagementId);
    return toAccountMapping(updated);
  } catch (error) {
    console.warn(
      `[AuditDB] updateManualMapping(${data.mappingId}) error`,
      error,
    );
    return null;
  }
}

export async function getUnmappedAccounts(
  engagementId: string,
): Promise<AccountMapping[]> {
  try {
    const mappings = await prisma.auditAccountMapping.findMany({
      where: { engagementId, status: "pending" },
      include: { canonicalAccount: true },
    });
    return mappings.map(toAccountMapping);
  } catch (error) {
    protectedAuditReadUnavailable(
      `getUnmappedAccounts(${engagementId})`,
      error,
    );
  }
}

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

export async function saveTrialBalance(
  engagementId: string,
  sourceFile: string,
  rows: Array<{
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    balance: number;
    accountType?: string;
  }>,
): Promise<TrialBalance> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { client: { select: { currencyCode: true } } },
  });
  const currency = engagement?.client?.currencyCode ?? "SAR";

  const totalDebits = rows.reduce((s, r) => s + r.debitAmount, 0);
  const totalCredits = rows.reduce((s, r) => s + r.creditAmount, 0);
  const variance = totalDebits - totalCredits;
  const tb = await prisma.auditTrialBalance.create({
    data: {
      engagementId,
      sourceFile,
      trustState: Math.abs(variance) < 1 ? "trusted" : "conditional",
      totalDebits,
      totalCredits,
      variance,
      lines: {
        create: rows.map((r) => ({
          accountCode: r.accountCode,
          accountName: r.accountName,
          debitAmount: r.debitAmount,
          creditAmount: r.creditAmount,
          balance: r.balance,
          accountType: r.accountType ?? null,
          currency,
        })),
      },
    },
    include: { lines: true },
  });
  return toTrialBalance(tb);
}

export async function createSuggestedMappingsForTrialBalance(
  engagementId: string,
  organizationId: string,
  rows: Array<{
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    canonicalAccountId: string;
    confidence: number;
    source: string;
  }>,
): Promise<number> {
  let created = 0;
  for (const row of rows) {
    const sourceAccountId = `src-${engagementId}-${row.accountCode}`;
    const existing = await prisma.auditAccountMapping.findFirst({
      where: { engagementId, sourceAccountCode: row.accountCode },
    });
    if (existing) continue;

    const canonical = await prisma.auditCanonicalAccount.findUnique({
      where: { id: row.canonicalAccountId },
    });

    await prisma.auditAccountMapping.create({
      data: {
        engagementId,
        sourceAccountId,
        sourceAccountCode: row.accountCode,
        sourceAccountName: row.accountName,
        debitAmount: row.debitAmount,
        creditAmount: row.creditAmount,
        canonicalAccountId: row.canonicalAccountId,
        confidence: row.confidence,
        mappingType: "ai_suggested",
        status: "pending",
        statementClassification: canonical?.category ?? null,
      },
    });
    created++;
  }
  return created;
}
