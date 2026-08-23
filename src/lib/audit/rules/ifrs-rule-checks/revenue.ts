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

/**
 * IFRS 15.14 — Identify performance obligations.
 */
export function handlePerformanceObligations(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRevenue = hasMappingHint(ctx, ["revenue", "sales", "إيراد"]);
  if (!hasRevenue) {
    return baseEval(
      rule,
      "skipped",
      "لا حسابات إيرادات.",
      "No revenue accounts — skipped.",
    );
  }

  const hasPo = hasMappingHint(ctx, ["performance obligation", "deferred revenue", "contract liability", "التزام أداء", "إيراد مؤجل"]);
  if (!hasPo) {
    return baseEval(
      rule,
      "advisory",
      "إيرادات موجودة. تأكد من تحديد التزامات الأداء في العقود وتقديمها بشكل منفصل (IFRS 15.14).",
      "Revenue present. Ensure performance obligations in contracts are identified and presented separately (IFRS 15.14).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "التزامات الأداء محددة.",
    "Performance obligations identified.",
  );
}

/**
 * IFRS 15.22 — Identify distinct goods or services.
 */
export function handleDistinctGoodsServices(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRevenue = hasMappingHint(ctx, ["revenue", "sales", "إيراد"]);
  if (!hasRevenue) {
    return baseEval(
      rule,
      "skipped",
      "لا حسابات إيرادات.",
      "No revenue accounts — skipped.",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من أن السلع أو الخدمات في العقد متميزة (قابلة للمستهلك منفرداً ومميزة داخل العقد) (IFRS 15.22).",
    "Ensure goods or services in the contract are distinct (capable of being consumed separately and distinct within the contract) (IFRS 15.22).",
  );
}

/**
 * IFRS 15.70 — Allocate transaction price to performance obligations.
 */
export function handleTransactionPriceAllocation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRevenue = hasMappingHint(ctx, ["revenue", "sales", "إيراد"]);
  if (!hasRevenue) {
    return baseEval(
      rule,
      "skipped",
      "لا حسابات إيرادات.",
      "No revenue accounts — skipped.",
    );
  }

  const hasAllocation = hasMappingHint(ctx, ["allocation", "standalone selling price", "ssp", "توزيع السعر", "سعر بيع مستقل"]);
  if (!hasAllocation) {
    return baseEval(
      rule,
      "advisory",
      "إيرادات موجودة. تأكد من توزيع سعر المعاملة على التزامات الأداء بناءً على أسعار البيع المستقلة (IFRS 15.70).",
      "Revenue present. Ensure transaction price is allocated to performance obligations based on standalone selling prices (IFRS 15.70).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "توزيع سعر المعاملة محدد.",
    "Transaction price allocation identified.",
  );
}

/**
 * IFRS 15.31 — Revenue recognition timing (point in time vs over time).
 */
export function handleRevenueRecognitionTiming(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRevenue = hasMappingHint(ctx, ["revenue", "sales", "إيراد"]);
  if (!hasRevenue) {
    return baseEval(
      rule,
      "skipped",
      "لا حسابات إيرادات.",
      "No revenue accounts — skipped.",
    );
  }

  const hasTiming = hasMappingHint(ctx, ["over time", "point in time", "progress", "completion", "عبر الزمن", "نقطة زمنية", "نسبة إنجاز"]);
  if (!hasTiming) {
    return baseEval(
      rule,
      "advisory",
      "إيرادات موجودة. تأكد من تحديد توقيت الاعتراف بالإيراد (نقطة زمنية أو عبر الزمن) وفق IFRS 15.31.",
      "Revenue present. Ensure revenue recognition timing (point in time or over time) is determined per IFRS 15.31.",
    );
  }

  return baseEval(
    rule,
    "pass",
    "توقيت الاعتراف بالإيراد محدد.",
    "Revenue recognition timing identified.",
  );
}
