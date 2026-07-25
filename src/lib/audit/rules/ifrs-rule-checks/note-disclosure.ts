import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval } from "./common";

export function handleNoteDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  if (ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "لا توجد إيضاحات — مطلوب إيضاحات IFRS لتحقيق العرض العادل.",
      "No disclosure notes — IFRS notes required for fair presentation.",
    );
  }
  return baseEval(
    rule,
    "pass",
    `${ctx.disclosureNoteCount} إيضاح(ات) مسجّلة.`,
    `${ctx.disclosureNoteCount} disclosure note(s) on file.`,
  );
}
