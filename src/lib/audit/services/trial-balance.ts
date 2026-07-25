/**
 * Audit Services — Trial Balance domain
 *
 * Trial balance, account mapping, validation, financial statements, canonical accounts.
 */

import { getMockCanonicalAccounts } from "@/lib/audit/coa/canonical-coa";
import { createLogger } from "@/lib/observability/logger";
import type {
  TrialBalance,
  TrialBalanceLine,
  AccountMapping,
  ValidationRun,
  FinancialStatement,
  DisclosureNote,
} from "@/types/audit";
import { classifyTrialBalanceRows } from "@/lib/tb-intelligence";
import { prisma } from "@/lib/prisma";
import type { FinancialStatementLine } from "@/types/audit";
import * as mock from "../mock-data";
import { getDb, tryDb } from "./common";

const logger = createLogger({ product: "platform", action: "lib-audit-services-trial-balance" });

export async function getTrialBalance(
  engagementId: string,
): Promise<TrialBalance | null> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockTrialBalance)
        : Promise.resolve(null),
    (db) => db.getTrialBalance(engagementId),
    `trial balance for ${engagementId}`,
  );
}

export async function getTrialBalanceLines(
  engagementId: string,
): Promise<TrialBalanceLine[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockTBLines)
        : Promise.resolve([]),
    (db) => db.getTrialBalanceLines(engagementId),
  );
}

export async function getMappings(
  engagementId: string,
): Promise<AccountMapping[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockMappings)
        : Promise.resolve([]),
    (db) => db.getMappings(engagementId),
    `account mappings for ${engagementId}`,
  );
}

export async function confirmMapping(
  engagementId: string,
  mappingId: string,
): Promise<AccountMapping | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available for confirmMapping");
  });
  return db.confirmMapping(engagementId, mappingId);
}

export async function confirmAllSuggestedMappings(engagementId: string): Promise<{
  confirmedCount: number;
  mappings: AccountMapping[];
}> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available for confirmAllSuggestedMappings");
  });
  return db.confirmAllSuggestedMappings(engagementId);
}

export async function getAccountMappingById(
  mappingId: string,
): Promise<AccountMapping | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available for getAccountMappingById");
  });
  return db.getAccountMappingById(mappingId);
}

export async function updateManualMapping(data: {
  engagementId: string;
  mappingId: string;
  canonicalAccountId: string | null;
  mappedBy?: string;
}): Promise<AccountMapping | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.updateManualMapping(data);
}

export async function getUnmappedAccounts(
  engagementId: string,
): Promise<AccountMapping[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(
            mock.mockMappings.filter((m) => m.status === "pending"),
          )
        : Promise.resolve([]),
    (db) => db.getUnmappedAccounts(engagementId),
  );
}

export async function getValidationRun(
  engagementId: string,
): Promise<ValidationRun | null> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockValidationRun)
        : Promise.resolve(null),
    (db) => db.getValidationRun(engagementId),
    `validation run for ${engagementId}`,
  );
}

export async function runValidation(
  engagementId: string,
  actorId: string,
): Promise<ValidationRun> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.runValidation(engagementId, actorId);
}

export async function disposeValidationIssue(
  issueId: string,
  action: string,
  rationale: string | undefined,
  actorId: string,
  actorName: string,
): Promise<ValidationRun | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.disposeValidationIssue(
    issueId,
    action,
    rationale,
    actorId,
    actorName,
  );
}

export async function getFinancialStatements(
  engagementId: string,
): Promise<FinancialStatement[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockFinancialStatements)
        : Promise.resolve([]),
    (db) => db.getFinancialStatements(engagementId),
    `financial statements for ${engagementId}`,
  );
}

export async function getEquityStatementLines(): Promise<
  FinancialStatementLine[]
> {
  return tryDb(
    () => Promise.resolve(mock.mockEquityStatementLines),
    (db) => db.getEquityStatementLines(),
  );
}

export async function getDisclosureNotes(
  engagementId: string,
): Promise<DisclosureNote[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockDisclosureNotesGenerated)
        : Promise.resolve([]),
    (db) => db.getDisclosureNotes(engagementId),
  );
}

export async function uploadTrialBalance(
  engagementId: string,
  sourceFile: string,
  rows: Array<{
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    classificationHints?: string[];
  }>,
  actorId?: string,
  actorName?: string,
): Promise<{ trialBalance: TrialBalance }> {
  const db = await getDb();
  const normalised = rows.map((r) => ({
    accountCode: r.accountCode,
    accountName: r.accountName,
    debitAmount: r.debit,
    creditAmount: r.credit,
    balance: r.debit - r.credit,
    accountType: classifyAccount(r.accountCode),
  }));
  const trialBalance = await db.saveTrialBalance(
    engagementId,
    sourceFile,
    normalised,
  );

  const organizationId = await db.getEngagementOrganizationId(engagementId);
  if (organizationId) {
    const classified = await classifyTrialBalanceRows(
      organizationId,
      engagementId,
      normalised.map((r, i) => ({
        accountCode: r.accountCode,
        accountName: r.accountName,
        debitAmount: r.debitAmount,
        creditAmount: r.creditAmount,
        classificationHints: rows[i]?.classificationHints,
      })),
      { enableCloudAi: true },
    );

    const mappingRows = classified
      .filter((c) => c.classification?.canonicalAccountId)
      .map((c) => ({
        accountCode: c.row.accountCode,
        accountName: c.row.accountName,
        debitAmount: c.row.debitAmount,
        creditAmount: c.row.creditAmount,
        balance: c.row.debitAmount - c.row.creditAmount,
        canonicalAccountId: c.classification!.canonicalAccountId,
        confidence: c.classification!.confidence,
        source: c.classification!.source,
      }));

    const mappingCount = await db.createSuggestedMappingsForTrialBalance(
      engagementId,
      organizationId,
      mappingRows,
    );

    if (mappingCount > 0) {
      await db.recordAuditEvent({
        engagementId,
        eventType: "mapping.ai_suggested",
        actorId: actorId ?? "system",
        actorName: actorName ?? "System",
        actorRole: "operator",
        targetType: "account_mapping",
        targetId: trialBalance.id,
        newState: "pending",
        description: `AI suggested ${mappingCount} account mappings from trial balance upload`,
        aiRelated: true,
        metadata: { mappingCount, source: "tb-intelligence" },
      });
    }
  }

  await db.recordAuditEvent({
    engagementId,
    eventType: "trial_balance.uploaded",
    actorId: actorId ?? "system",
    actorName: actorName ?? "System",
    actorRole: "operator",
    targetType: "trial_balance",
    targetId: trialBalance.id,
    newState: "uploaded",
    description: `Trial balance uploaded: ${sourceFile} (${rows.length} accounts)`,
  });

  try {
    const { maybeSyncReportingGraphAfterTbUpload } = await import(
      "@/lib/audit/reporting-graph/graph-sync-service"
    );
    await maybeSyncReportingGraphAfterTbUpload(engagementId);
  } catch (graphErr) {
    logger.error(`[AuditOS] reporting graph sync after TB upload failed for ${engagementId}`, graphErr instanceof Error ? graphErr : new Error(String(graphErr)));
  }

  return { trialBalance };
}

export async function getCanonicalAccounts(
  limit?: number,
): Promise<Array<{ id: string; code: string; name: string }>> {
  return tryDb(
    () => Promise.resolve(getMockCanonicalAccounts().slice(0, limit ?? 100)),
    (db) => db.getCanonicalAccounts(limit),
  );
}

function classifyAccount(code: string): string | undefined {
  if (!code || code.length < 4) return undefined;
  const prefix = code.substring(0, 2);
  if (["10", "11", "12"].includes(prefix)) return "asset";
  if (["13", "14"].includes(prefix)) return "non-current-asset";
  if (["20", "21"].includes(prefix)) return "liability";
  if (["30", "31"].includes(prefix)) return "equity";
  if (["40", "41"].includes(prefix)) return "revenue";
  if (
    ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"].includes(
      prefix,
    )
  )
    return "expense";
  return undefined;
}
