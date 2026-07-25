import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, bsLines } from "./common";

export function handleNoOffsetting(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const negativeAssets = bsLines(ctx).filter(
    (l) =>
      !l.isTotal &&
      l.amount < 0 &&
      (l.label.toLowerCase().includes("asset") ||
        l.label.includes("أصول")),
  );
  if (negativeAssets.length > 0) {
    return baseEval(
      rule,
      "warning",
      `${negativeAssets.length} بند(اً) بأرصدة سالبة — راجع عدم المقاصة.`,
      `${negativeAssets.length} line(s) with negative asset presentation.`,
      ["balance_sheet"],
    );
  }
  return baseEval(
    rule,
    "pass",
    "لا توجد أرصدة سالبة ظاهرة في عرض الأصول.",
    "No apparent asset offsetting in balance sheet lines.",
  );
}
