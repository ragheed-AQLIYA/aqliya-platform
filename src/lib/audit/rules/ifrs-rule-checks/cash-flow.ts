import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, cfLines } from "./common";

export function handleCashFlow(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  if (!ctx.statementTypes.includes("cash_flow")) {
    return baseEval(
      rule,
      "warning",
      "لا قائمة تدفقات نقدية — IAS 7 غير مُحقق.",
      "No cash flow statement — IAS 7 not satisfied.",
      ["cash_flow"],
    );
  }
  const hasSections = cfLines(ctx).some((l) =>
    l.label.toUpperCase().includes("OPERATING"),
  );
  if (!hasSections) {
    return baseEval(
      rule,
      "warning",
      "قائمة التدفقات بدون أقسام تشغيل/استثمار/تمويل.",
      "Cash flow missing operating/investing/financing sections.",
      ["cash_flow"],
    );
  }
  return baseEval(
    rule,
    "pass",
    "قائمة التدفقات النقدية مصنّفة.",
    "Cash flow statement classified per IAS 7.",
    ["cash_flow"],
  );
}
