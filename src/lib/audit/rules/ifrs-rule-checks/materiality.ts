import { classifyBalanceMateriality } from "@/lib/audit/materiality";
import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, bsLines } from "./common";

export function handleMaterialityPresentation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const threshold = ctx.performanceMateriality ?? 0;
  if (threshold <= 0) {
    return baseEval(
      rule,
      "advisory",
      "مادية الأداء غير محسوبة — فحص العرض المادي استشاري.",
      "Performance materiality not computed — presentation check advisory.",
    );
  }
  const immaterialLines = bsLines(ctx).filter(
    (l) =>
      !l.isTotal &&
      l.amount !== 0 &&
      classifyBalanceMateriality(l.amount, threshold) === "immaterial",
  );
  if (immaterialLines.length > 5) {
    return baseEval(
      rule,
      "warning",
      `${immaterialLines.length} بند(اً) غير مادي — راجع تجميع العرض.`,
      `${immaterialLines.length} immaterial lines — review aggregation.`,
    );
  }
  return baseEval(
    rule,
    "pass",
    "عرض البنود المادية مقبول ضمن العتبة.",
    "Material line presentation within threshold.",
  );
}
