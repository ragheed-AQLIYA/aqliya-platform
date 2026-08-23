import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const DEBT_RESTRUCTURING_HINTS = [
  "debt restructuring",
  "debt extinguishment",
  "debt modification",
  "forbearance",
  "إعادة هيكلة الديون",
  "إطفاء الديون",
  "تعديل الديون",
];

const MEASUREMENT_HINTS = [
  "fair value",
  "settlement",
  "new debt instrument",
  "قيمة عادلة",
  "تسوية",
  "أداة دين جديدة",
];

const FALLBACK_HINTS = [
  "carrying amount",
  "original debt",
  "difference",
  "القيمة الدفترية",
  "الدين الأصلي",
  "الفرق",
];

const GAIN_LOSS_HINTS = [
  "gain",
  "loss",
  "gain or loss",
  "income statement",
  "ربح",
  "خسارة",
  "قائمة الدخل",
];

/**
 * IFRIC 19.2 — Scope: extinguishing financial liabilities by issuing equity instruments.
 */
export function handleDebtRestructuringScope(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRestructuring = hasMappingHint(ctx, DEBT_RESTRUCTURING_HINTS);
  if (!hasRestructuring) {
    return baseEval(
      rule, "skipped",
      "لا بنود إعادة هيكلة ديون — القاعدة غير قابلة للتطبيق.",
      "No debt restructuring accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "نطاق IFRIC 19 محدد لإطفاء الديون بأدوات حقوق ملكية.",
    "IFRIC 19 scope identified for extinguishing debt with equity instruments.",
  );
}

/**
 * IFRIC 19.5 — Measure equity instruments issued at fair value to settle financial liability.
 */
export function handleDebtMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRestructuring = hasMappingHint(ctx, DEBT_RESTRUCTURING_HINTS);
  if (!hasRestructuring) {
    return baseEval(
      rule, "skipped",
      "لا بنود إعادة هيكلة ديون.",
      "No debt restructuring accounts — skipped.",
    );
  }
  const hasFv = hasMappingHint(ctx, MEASUREMENT_HINTS);
  if (!hasFv) {
    return baseEval(
      rule, "warning",
      "إعادة هيكلة ديون بدون قياس أدوات حقوق الملكية بالقيمة العادلة (IFRIC 19.5).",
      "Debt restructuring without fair value measurement of equity instruments (IFRIC 19.5).",
    );
  }
  return baseEval(
    rule, "pass",
    "قياس أدوات حقوق الملكية بالقيمة العادلة موثق.",
    "Fair value measurement of equity instruments documented.",
  );
}

/**
 * IFRIC 19.8 — If equity instruments' fair value cannot be reliably measured, use liability's carrying amount.
 */
export function handleFallbackMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRestructuring = hasMappingHint(ctx, DEBT_RESTRUCTURING_HINTS);
  if (!hasRestructuring) {
    return baseEval(
      rule, "skipped",
      "لا بنود إعادة هيكلة ديون.",
      "No debt restructuring accounts — skipped.",
    );
  }
  const hasFallback = hasMappingHint(ctx, FALLBACK_HINTS);
  if (!hasFallback) {
    return baseEval(
      rule, "advisory",
      "تأكد من استخدام القيمة الدفترية للالتزام عند تعذر قياس القيمة العادلة لأدوات حقوق الملكية (IFRIC 19.8).",
      "Ensure liability carrying amount is used when equity fair value cannot be reliably measured (IFRIC 19.8).",
    );
  }
  return baseEval(
    rule, "pass",
    "قياس الاحتياطي بالقيمة الدفترية موثق.",
    "Fallback carrying amount measurement documented.",
  );
}

/**
 * IFRIC 19.9 — Recognise difference between liability carrying amount and equity fair value in income statement.
 */
export function handleDebtGainLoss(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRestructuring = hasMappingHint(ctx, DEBT_RESTRUCTURING_HINTS);
  if (!hasRestructuring) {
    return baseEval(
      rule, "skipped",
      "لا بنود إعادة هيكلة ديون.",
      "No debt restructuring accounts — skipped.",
    );
  }
  const hasGainLoss = hasMappingHint(ctx, GAIN_LOSS_HINTS);
  if (!hasGainLoss) {
    return baseEval(
      rule, "warning",
      "إعادة هيكلة ديون بدون الاعتراف بالفرق في قائمة الدخل (IFRIC 19.9).",
      "Debt restructuring without recognising difference in income statement (IFRIC 19.9).",
      ["income_statement"],
    );
  }
  return baseEval(
    rule, "pass",
    "الربح/الخسارة من إعادة الهيكلة معترف بها في قائمة الدخل.",
    "Gain/loss from restructuring recognised in income statement.",
    ["income_statement"],
  );
}
