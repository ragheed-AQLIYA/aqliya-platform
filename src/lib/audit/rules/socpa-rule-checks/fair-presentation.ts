import type { SocpaKnowledgeRule, SocpaRuleEvaluation } from "../types";
import type { SocpaEvaluationContext } from "./common";
import { baseEval } from "./common";

export function evaluateFairPresentation(
  rule: SocpaKnowledgeRule,
  ctx: SocpaEvaluationContext,
): SocpaRuleEvaluation | null {
  if (rule.topic !== "fair-presentation") return null;

  if (ctx.statementTypes.length === 0) {
    return baseEval(
      rule,
      "fail",
      "لا قوائم مالية — العرض العادل غير ممكن.",
      "No financial statements — fair presentation not possible.",
    );
  }
  return baseEval(
    rule,
    "pass",
    "القوائم المالية موجودة لدعم العرض العادل.",
    "Financial statements present for fair presentation.",
  );
}
