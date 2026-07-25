import type { FinancialStatementLine } from "@/types/audit";
import type { SocpaKnowledgeRule, SocpaRuleEvaluation } from "../types";

export interface SocpaEvaluationContext {
  engagementId: string;
  engagementStatus: string;
  reportingFramework: string;
  currencyCode: string;
  jurisdiction: string;
  statementTypes: string[];
  statements: Array<{ statementType: string; lines: FinancialStatementLine[] }>;
  mappings: Array<{
    sourceAccountCode: string;
    sourceAccountName: string;
    status: string;
    statementClassification: string | null;
    canonicalName?: string | null;
    canonicalCategory?: string | null;
  }>;
  disclosureNoteCount: number;
  disclosureNotes: Array<{ title: string; content: string; noteType: string }>;
}

export function isSocpaJurisdiction(ctx: SocpaEvaluationContext): boolean {
  if (ctx.jurisdiction === "saudi-arabia") return true;
  return ctx.currencyCode === "SAR";
}

export function baseEval(
  rule: SocpaKnowledgeRule,
  status: SocpaRuleEvaluation["status"],
  messageAr: string,
  messageEn: string,
  linkedStatementTypes?: string[],
): SocpaRuleEvaluation {
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

export function confirmedMappings(ctx: SocpaEvaluationContext) {
  return ctx.mappings.filter((m) => m.status === "confirmed");
}

export function hasHint(ctx: SocpaEvaluationContext, hints: string[]): boolean {
  return confirmedMappings(ctx).some((m) => {
    const blob = `${m.sourceAccountName} ${m.canonicalName ?? ""} ${m.statementClassification ?? ""}`.toLowerCase();
    return hints.some((h) => blob.includes(h));
  });
}

export function hasZakatTaxNote(ctx: SocpaEvaluationContext): boolean {
  return ctx.disclosureNotes.some((n) => {
    const blob = `${n.title} ${n.content} ${n.noteType}`.toLowerCase();
    return (
      blob.includes("zakat") ||
      blob.includes("زكاة") ||
      blob.includes("tax") ||
      blob.includes("ضريبة")
    );
  });
}
