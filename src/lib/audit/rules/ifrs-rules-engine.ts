import "server-only";

import { prisma } from "@/lib/prisma";
import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { calculatePerformanceMateriality } from "@/lib/audit/materiality";
import type { FinancialStatementLine } from "@/types/audit";
import { formatRuleCitationMarker } from "@/lib/audit/notes/disclosure-types";
import { buildDisclosureTriggersFromEvaluations } from "./disclosure-triggers";
import { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";
import {
  evaluateIfrsRule,
  type IfrsEvaluationContext,
} from "./ifrs-rule-checks";
import { loadIfrsKnowledgeRules } from "./ifrs-rules-loader";
import type { IfrsRulesRunResult } from "./types";

function parseStatementLines(raw: unknown): FinancialStatementLine[] {
  if (!raw) return [];
  try {
    const rows =
      typeof raw === "string"
        ? JSON.parse(raw)
        : Array.isArray(raw)
          ? raw
          : [];
    return rows as FinancialStatementLine[];
  } catch {
    return [];
  }
}

async function loadIfrsEvaluationContext(
  engagementId: string,
): Promise<IfrsEvaluationContext> {
  const [engagement, statements, mappings, tb, noteCount] = await Promise.all([
    prisma.auditEngagement.findUnique({
      where: { id: engagementId },
      select: {
        status: true,
        client: {
          select: { reportingFramework: true, currencyCode: true },
        },
      },
    }),
    prisma.auditFinancialStatement.findMany({ where: { engagementId } }),
    prisma.auditAccountMapping.findMany({
      where: { engagementId },
      include: { canonicalAccount: true },
    }),
    prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      include: { lines: true },
    }),
    prisma.auditDisclosureNote.count({ where: { engagementId } }),
  ]);

  const revenueLine = statements
    .flatMap((s) => parseStatementLines(s.lines))
    .find((l) => l.label.toLowerCase().includes("revenue"));
  const totalAssets = statements
    .flatMap((s) => parseStatementLines(s.lines))
    .find((l) => l.label.toUpperCase().includes("TOTAL ASSETS"));

  const performanceMateriality = calculatePerformanceMateriality({
    revenue: revenueLine?.amount,
    totalAssets: totalAssets?.amount,
  });

  return {
    engagementId,
    engagementStatus: engagement?.status ?? "draft",
    reportingFramework: engagement?.client?.reportingFramework ?? "ifrs",
    currencyCode: engagement?.client?.currencyCode ?? "SAR",
    statementTypes: statements.map((s) => s.statementType),
    statements: statements.map((s) => ({
      statementType: s.statementType,
      lines: parseStatementLines(s.lines),
    })),
    mappings: mappings.map((m) => ({
      sourceAccountCode: m.sourceAccountCode,
      sourceAccountName: m.sourceAccountName,
      status: m.status,
      statementClassification: m.statementClassification,
      canonicalName: m.canonicalAccount?.name ?? null,
      canonicalCategory: m.canonicalAccount?.category ?? null,
    })),
    tbLines: (tb?.lines ?? []).map((l) => ({
      accountCode: l.accountCode,
      accountName: l.accountName,
      debitAmount: l.debitAmount,
      creditAmount: l.creditAmount,
      balance: l.balance,
    })),
    disclosureNoteCount: noteCount,
    performanceMateriality,
  };
}

async function attachIfrsCitationsToStatements(
  engagementId: string,
  evaluations: IfrsRulesRunResult["evaluations"],
): Promise<void> {
  const statements = await prisma.auditFinancialStatement.findMany({
    where: { engagementId },
  });

  for (const stmt of statements) {
    const lines = parseStatementLines(stmt.lines);
    let changed = false;

    const updated = lines.map((line) => {
      const matching = evaluations.filter(
        (ev) =>
          (ev.status === "pass" || ev.status === "warning") &&
          ev.linkedStatementTypes?.includes(stmt.statementType) &&
          (line.label.toLowerCase().includes("revenue") ||
            line.label.toLowerCase().includes("asset") ||
            line.label.toLowerCase().includes("cash") ||
            line.isTotal),
      );

      if (matching.length === 0) return line;

      const citations = matching.map((ev) =>
        formatRuleCitationMarker({
          source: "ifrs",
          ruleId: ev.ruleId,
          standardCode: ev.standardCode,
        }),
      );

      changed = true;
      return { ...line, ifrsCitations: citations };
    });

    if (changed) {
      await prisma.auditFinancialStatement.update({
        where: { id: stmt.id },
        data: { lines: updated as unknown as object },
      });
    }
  }
}

export async function runIfrsRulesForEngagement(
  engagementId: string,
): Promise<IfrsRulesRunResult> {
  const ctx = await loadIfrsEvaluationContext(engagementId);
  const rules = loadIfrsKnowledgeRules();
  const evaluations = rules.map((rule) => evaluateIfrsRule(rule, ctx));

  const failedCount = evaluations.filter((e) => e.status === "fail").length;
  const warningCount = evaluations.filter((e) => e.status === "warning").length;
  const disclosureTriggers =
    buildDisclosureTriggersFromEvaluations(evaluations);

  const result: IfrsRulesRunResult = {
    engagementId,
    passed: failedCount === 0,
    ruleCount: evaluations.length,
    failedCount,
    warningCount,
    evaluations,
    disclosureTriggers,
    runAt: new Date().toISOString(),
  };

  await attachIfrsCitationsToStatements(engagementId, evaluations);

  await recordAuditOsAuditEvent({
    engagementId,
    eventType: "ifrs_rules.completed",
    actorId: "system",
    actorName: "IFRS Rules Engine",
    actorRole: "system",
    targetType: "ifrs_rules",
    targetId: engagementId,
    newState: result.passed ? "passed" : "failed",
    description: `IFRS rules: ${result.ruleCount} evaluated, ${result.failedCount} failed, ${result.warningCount} warnings`,
    metadata: {
      failedCount: result.failedCount,
      warningCount: result.warningCount,
      triggerCount: result.disclosureTriggers.length,
    } as Record<string, unknown>,
  });

  return result;
}

export async function appendIfrsValidationIssues(
  engagementId: string,
  runId: string,
  issues: Array<Record<string, unknown>>,
  startIdx: number,
  now: Date,
): Promise<number> {
  if (!isEnabled("audit.ifrs-rules")) return startIdx;

  const result = await runIfrsRulesForEngagement(engagementId);
  let idx = startIdx;

  for (const ev of result.evaluations) {
    if (ev.status !== "fail" && ev.status !== "warning") continue;
    idx += 1;
    issues.push({
      id: `${runId}-i-${idx}`,
      validationRunId: runId,
      engagementId,
      checkType: "ifrs_rule",
      severity: ev.status === "fail" ? "high" : "medium",
      status: "open",
      title: `[${ev.standardCode}] ${ev.paragraphReference}`,
      description: ev.messageAr,
      message: ev.messageEn,
      accountCode: null,
      accountName: null,
      expectedValue: null,
      actualValue: null,
      difference: null,
      createdAt: now,
    });
  }

  return idx;
}
