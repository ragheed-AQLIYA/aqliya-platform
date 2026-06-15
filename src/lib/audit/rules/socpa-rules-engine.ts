import "server-only";

import { prisma } from "@/lib/prisma";
import { isEnabled } from "@/lib/platform/feature-flags/registry";
import type { FinancialStatementLine } from "@/types/audit";
import { formatRuleCitationMarker } from "@/lib/audit/notes/disclosure-types";
import { buildSocpaDisclosureTriggersFromEvaluations } from "./socpa-disclosure-triggers";
import {
  evaluateSocpaRule,
  isSocpaJurisdiction,
  type SocpaEvaluationContext,
} from "./socpa-rule-checks";
import { loadSocpaKnowledgeRules } from "./socpa-rules-loader";
import type { SocpaRulesRunResult } from "./types";

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

async function loadSocpaEvaluationContext(
  engagementId: string,
): Promise<SocpaEvaluationContext> {
  const [engagement, statements, mappings, notes] = await Promise.all([
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
    prisma.auditDisclosureNote.findMany({
      where: { engagementId },
      select: { title: true, content: true, noteType: true },
    }),
  ]);

  const currencyCode = engagement?.client?.currencyCode ?? "SAR";
  const reportingFramework =
    engagement?.client?.reportingFramework ?? "ifrs_for_smes";

  return {
    engagementId,
    engagementStatus: engagement?.status ?? "draft",
    reportingFramework,
    currencyCode,
    jurisdiction: currencyCode === "SAR" ? "saudi-arabia" : "other",
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
    disclosureNoteCount: notes.length,
    disclosureNotes: notes,
  };
}

async function attachSocpaCitationsToStatements(
  engagementId: string,
  evaluations: SocpaRulesRunResult["evaluations"],
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
          (line.label.toLowerCase().includes("tax") ||
            line.label.toLowerCase().includes("zakat") ||
            line.label.toLowerCase().includes("equity") ||
            line.isTotal),
      );

      if (matching.length === 0) return line;

      const citations = matching.map((ev) =>
        formatRuleCitationMarker({
          source: "socpa",
          ruleId: ev.ruleId,
          standardCode: ev.standardCode,
        }),
      );

      changed = true;
      return { ...line, socpaCitations: citations };
    });

    if (changed) {
      await prisma.auditFinancialStatement.update({
        where: { id: stmt.id },
        data: { lines: updated as unknown as object },
      });
    }
  }
}

export async function runSocpaRulesForEngagement(
  engagementId: string,
): Promise<SocpaRulesRunResult> {
  const ctx = await loadSocpaEvaluationContext(engagementId);
  const jurisdictionApplicable = isSocpaJurisdiction(ctx);
  const rules = loadSocpaKnowledgeRules();
  const evaluations = rules.map((rule) => evaluateSocpaRule(rule, ctx));

  const failedCount = evaluations.filter((e) => e.status === "fail").length;
  const warningCount = evaluations.filter((e) => e.status === "warning").length;
  const disclosureTriggers =
    buildSocpaDisclosureTriggersFromEvaluations(evaluations);

  const result: SocpaRulesRunResult = {
    engagementId,
    jurisdictionApplicable,
    passed: failedCount === 0,
    ruleCount: evaluations.length,
    failedCount,
    warningCount,
    evaluations,
    disclosureTriggers,
    runAt: new Date().toISOString(),
  };

  if (jurisdictionApplicable) {
    await attachSocpaCitationsToStatements(engagementId, evaluations);
  }

  await prisma.auditEvent.create({
    data: {
      engagementId,
      eventType: "socpa_rules.completed",
      actorId: "system",
      actorName: "SOCPA Rules Engine",
      actorRole: "system",
      targetType: "socpa_rules",
      targetId: engagementId,
      newState: result.passed ? "passed" : "failed",
      description: `SOCPA rules: ${result.ruleCount} evaluated, ${result.failedCount} failed (jurisdiction: ${jurisdictionApplicable ? "SA" : "skipped"})`,
      metadata: {
        jurisdictionApplicable,
        failedCount: result.failedCount,
        warningCount: result.warningCount,
        triggerCount: result.disclosureTriggers.length,
      } as object,
    },
  });

  return result;
}

export async function appendSocpaValidationIssues(
  engagementId: string,
  runId: string,
  issues: Array<Record<string, unknown>>,
  startIdx: number,
  now: Date,
): Promise<number> {
  if (!isEnabled("audit.socpa-rules")) return startIdx;

  const result = await runSocpaRulesForEngagement(engagementId);
  if (!result.jurisdictionApplicable) return startIdx;

  let idx = startIdx;

  for (const ev of result.evaluations) {
    if (ev.status !== "fail" && ev.status !== "warning") continue;
    idx += 1;
    issues.push({
      id: `${runId}-i-${idx}`,
      validationRunId: runId,
      engagementId,
      checkType: "socpa_rule",
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
