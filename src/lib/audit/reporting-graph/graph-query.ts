import { prisma } from "@/lib/prisma";
import { buildReportingGraph } from "./graph-builder";
import { loadReportingGraphFromStore } from "./graph-store-query";
import { isReportingGraphEnabled } from "./graph-sync-service";
import type { ReportingGraph } from "./types";

/** Loads graph — persisted store when flag on, else computed from artifacts. */
export async function loadReportingGraph(
  engagementId: string,
): Promise<ReportingGraph> {
  if (isReportingGraphEnabled()) {
    const stored = await loadReportingGraphFromStore(engagementId);
    if (stored) return stored;
  }
  return loadComputedReportingGraph(engagementId);
}

async function loadComputedReportingGraph(
  engagementId: string,
): Promise<ReportingGraph> {
  const [tb, mappings, statements, notes] = await Promise.all([
    prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      include: { lines: true },
    }),
    prisma.auditAccountMapping.findMany({
      where: { engagementId },
      include: { canonicalAccount: true },
    }),
    prisma.auditFinancialStatement.findMany({
      where: { engagementId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.auditDisclosureNote.findMany({
      where: { engagementId },
      orderBy: { noteNumber: "asc" },
    }),
  ]);

  const tbLines =
    tb?.lines.map((line) => ({
      id: line.id,
      accountCode: line.accountCode,
      accountName: line.accountName,
      balance: line.balance,
    })) ?? [];

  const mappedMappings = mappings.map((m) => ({
    id: m.id,
    sourceAccountId: m.sourceAccountId,
    sourceAccountCode: m.sourceAccountCode,
    sourceAccountName: m.sourceAccountName,
    debitAmount: m.debitAmount,
    creditAmount: m.creditAmount,
    canonicalAccountCode: m.canonicalAccount?.code,
    canonicalAccountName: m.canonicalAccount?.name,
    status: m.status,
  }));

  const mappedStatements = statements.map((fs) => {
    let rawLines: unknown[] = [];
    try {
      rawLines =
        typeof fs.lines === "string"
          ? JSON.parse(fs.lines)
          : Array.isArray(fs.lines)
            ? fs.lines
            : [];
    } catch {
      rawLines = [];
    }
    if (!Array.isArray(rawLines)) rawLines = [];

    const lines = rawLines.map((raw) => {
      const row = raw as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        label: String(row.label ?? ""),
        amount: Number(row.amount ?? 0),
        isTotal: Boolean(row.isTotal),
        linkedAccountMappings: Array.isArray(row.linkedAccountMappings)
          ? row.linkedAccountMappings.map(String)
          : [],
      };
    });

    return {
      id: fs.id,
      title: fs.title,
      statementType: fs.statementType,
      status: fs.status,
      lines,
    };
  });

  const mappedNotes = notes.map((n) => ({
    id: n.id,
    noteNumber: n.noteNumber,
    title: n.title,
    noteType: n.noteType,
    status: n.status,
    linkedStatementLine: n.linkedStatementLine ?? undefined,
  }));

  return buildReportingGraph({
    engagementId,
    tbLines,
    mappings: mappedMappings,
    statements: mappedStatements,
    notes: mappedNotes,
  });
}
