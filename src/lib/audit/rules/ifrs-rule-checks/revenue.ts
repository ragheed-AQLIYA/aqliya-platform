import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

export function handleRevenue(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRevenue = hasMappingHint(ctx, ["revenue", "sales", "إيراد"]);
  if (!hasRevenue) {
    return baseEval(
      rule,
      "skipped",
      "لا حسابات إيرادات مؤكدة — القاعدة غير قابلة للتطبيق.",
      "No confirmed revenue accounts — rule not applicable.",
      ["income_statement"],
    );
  }
  return baseEval(
    rule,
    "pass",
    "حسابات الإيرادات موجودة — راجع IFRS 15 يدوياً.",
    "Revenue accounts mapped — apply IFRS 15 five-step model in review.",
    ["income_statement"],
  );
}
