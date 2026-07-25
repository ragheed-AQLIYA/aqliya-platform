import { prisma } from "./common";
import { createLogger } from "@/lib/observability/logger";
import {
  toAccountMapping,
  protectedAuditReadUnavailable,
} from "./common";
import type { AccountMapping } from "./common";
import { rebuildFinancialStatementsForEngagement } from "./rebuild";

const logger = createLogger({ product: "auditos", action: "financial-mappings" });

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
    logger.error(
      `[AuditDB] confirmMapping(${mappingId}) failed. Mock fallback disabled for mutation path.`,
      error instanceof Error ? error : undefined,
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
    logger.error(
      `[AuditDB] confirmAllSuggestedMappings(${engagementId}) failed.`,
      error instanceof Error ? error : undefined,
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
    logger.warn("[AuditDB] getAccountMappingById(${mappingId}) error", { error: error instanceof Error ? error?.message : String(error) });
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
    logger.warn(
      `[AuditDB] updateManualMapping(${data.mappingId}) error`,
      { error: error instanceof Error ? error?.message : String(error) },
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

export async function createSuggestedMappingsForTrialBalance(
  engagementId: string,
  organizationId: string,
  rows: Array<{
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    balance: number;
    canonicalAccountId: string;
    confidence: number;
    source: string;
  }>,
): Promise<number> {
  const accountCodes = rows.map((r) => r.accountCode);
  const canonicalIds = [...new Set(rows.map((r) => r.canonicalAccountId))];

  const [existingMappings, canonicalAccounts] = await Promise.all([
    prisma.auditAccountMapping.findMany({
      where: { engagementId, sourceAccountCode: { in: accountCodes } },
      select: { sourceAccountCode: true },
    }),
    prisma.auditCanonicalAccount.findMany({
      where: { id: { in: canonicalIds } },
      select: { id: true, category: true },
    }),
  ]);

  const existingCodes = new Set(existingMappings.map((m) => m.sourceAccountCode));
  const canonicalMap = new Map(canonicalAccounts.map((c) => [c.id, c.category]));

  const toCreate = rows
    .filter((r) => !existingCodes.has(r.accountCode))
    .map((r) => ({
      engagementId,
      sourceAccountId: `src-${engagementId}-${r.accountCode}`,
      sourceAccountCode: r.accountCode,
      sourceAccountName: r.accountName,
      debitAmount: r.debitAmount,
      creditAmount: r.creditAmount,
      canonicalAccountId: r.canonicalAccountId,
      confidence: r.confidence,
      mappingType: "ai_suggested" as const,
      status: "pending" as const,
      statementClassification: canonicalMap.get(r.canonicalAccountId) ?? null,
    }));

  if (toCreate.length > 0) {
    await prisma.auditAccountMapping.createMany({ data: toCreate });
  }

  return toCreate.length;
}
