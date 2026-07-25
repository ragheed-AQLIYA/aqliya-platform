import type { FinancialStatementLine } from "@/types/audit";
import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./types";

export type { IfrsEvaluationContext };

export function baseEval(
  rule: IfrsKnowledgeRule,
  status: IfrsRuleEvaluation["status"],
  messageAr: string,
  messageEn: string,
  linkedStatementTypes?: string[],
): IfrsRuleEvaluation {
  return {
    ruleId: rule.ruleId,
    standardCode: rule.standardCode,
    paragraphReference: rule.paragraphReference,
    topic: rule.topic,
    status,
    messageAr,
    messageEn,
    linkedStatementTypes,
  };
}

export function confirmedMappings(ctx: IfrsEvaluationContext) {
  return ctx.mappings.filter((m) => m.status === "confirmed");
}

export function hasMappingHint(
  ctx: IfrsEvaluationContext,
  hints: string[],
): boolean {
  return confirmedMappings(ctx).some((m) => {
    const blob = `${m.sourceAccountName} ${m.canonicalName ?? ""} ${m.canonicalCategory ?? ""} ${m.statementClassification ?? ""}`.toLowerCase();
    return hints.some((h) => blob.includes(h));
  });
}

export function bsLines(ctx: IfrsEvaluationContext): FinancialStatementLine[] {
  return (
    ctx.statements.find((s) => s.statementType === "balance_sheet")?.lines ??
    []
  );
}

export function cfLines(ctx: IfrsEvaluationContext): FinancialStatementLine[] {
  return (
    ctx.statements.find((s) => s.statementType === "cash_flow")?.lines ?? []
  );
}
