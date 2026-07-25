import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval } from "./common";

export function handleGoingConcern(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  if (ctx.engagementStatus === "liquidation") {
    return baseEval(
      rule,
      "warning",
      "التكليف في حالة تصفية — راجع افتراض الاستمرارية.",
      "Engagement in liquidation — going concern assumption requires review.",
    );
  }
  return baseEval(
    rule,
    "advisory",
    "افتراض الاستمرارية — لا مؤشرات تصفية في حالة التكليف.",
    "Going concern — no liquidation indicators on engagement status.",
  );
}
