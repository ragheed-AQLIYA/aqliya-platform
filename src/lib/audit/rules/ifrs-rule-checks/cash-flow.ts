import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, cfLines, hasMappingHint } from "./common";

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

/**
 * IAS 7.6 — Investing activities section.
 */
export function handleInvestingActivities(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  if (!ctx.statementTypes.includes("cash_flow")) {
    return baseEval(
      rule,
      "skipped",
      "لا قائمة تدفقات نقدية.",
      "No cash flow statement — skipped.",
    );
  }

  const hasInvesting = cfLines(ctx).some((l) =>
    l.label.toUpperCase().includes("INVESTING"),
  );
  if (!hasInvesting) {
    return baseEval(
      rule,
      "warning",
      "قائمة التدفقات النقدية بدون قسم الأنشطة الاستثمارية (IAS 7.6).",
      "Cash flow statement missing investing activities section (IAS 7.6).",
      ["cash_flow"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "قسم الأنشطة الاستثمارية موجود.",
    "Investing activities section present.",
    ["cash_flow"],
  );
}

/**
 * IAS 7.6 — Financing activities section.
 */
export function handleFinancingActivities(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  if (!ctx.statementTypes.includes("cash_flow")) {
    return baseEval(
      rule,
      "skipped",
      "لا قائمة تدفقات نقدية.",
      "No cash flow statement — skipped.",
    );
  }

  const hasFinancing = cfLines(ctx).some((l) =>
    l.label.toUpperCase().includes("FINANCING"),
  );
  if (!hasFinancing) {
    return baseEval(
      rule,
      "warning",
      "قائمة التدفقات النقدية بدون قسم الأنشطة التمويلية (IAS 7.6).",
      "Cash flow statement missing financing activities section (IAS 7.6).",
      ["cash_flow"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "قسم الأنشطة التمويلية موجود.",
    "Financing activities section present.",
    ["cash_flow"],
  );
}
