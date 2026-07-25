import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval } from "./common";

export function handleCompleteSet(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const required = ["balance_sheet", "income_statement", "equity"];
  const missing = required.filter((t) => !ctx.statementTypes.includes(t));
  if (missing.length > 0) {
    return baseEval(
      rule,
      "fail",
      `قوائم مالية ناقصة: ${missing.join(", ")}`,
      `Missing core statements: ${missing.join(", ")}`,
      missing,
    );
  }
  if (!ctx.statementTypes.includes("cash_flow")) {
    return baseEval(
      rule,
      "warning",
      "مجموعة القوائم الأساسية موجودة — قائمة التدفقات النقدية غير مُولّدة (فعّل FS v2).",
      "Core set present; cash flow statement not generated (enable FS v2).",
      ["cash_flow"],
    );
  }
  return baseEval(
    rule,
    "pass",
    "مجموعة القوائم المالية الكاملة متوفرة.",
    "Complete set of financial statements present.",
  );
}
