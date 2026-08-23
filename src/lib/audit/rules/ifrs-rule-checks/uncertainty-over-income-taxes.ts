import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const UNCERTAINTY_HINTS = [
  "uncertainty over income tax treatment",
  "tax treatment uncertainty",
  "tax position",
  "uncertain tax treatment",
  "عدم يقين المعالجة الضريبية",
  "موقف ضريبي",
  "معالجة ضريبية غير مؤكدة",
];

const UNIT_OF_ACCOUNT_HINTS = [
  "unit of account",
  "separate approach",
  "aggregate approach",
  "وحدة القياس",
  "نهج منفصل",
  "نهج مجمع",
];

const EXAMINATION_HINTS = [
  "examination",
  "tax authority",
  " probable",
  "accepted",
  "tax examination",
  "فحص ضريبي",
  "هيئة ضريبية",
  "مقبول",
];

const REFLECT_HINTS = [
  "reflect uncertainty",
  "probability",
  "expected value",
  "most likely amount",
  "انعكاس عدم اليقين",
  "احتمال",
  "القيمة المتوقعة",
  "المبلغ الأكثر احتمالاً",
];

/**
 * IFRIC 23.2 — Scope: uncertainty over income tax treatments when it is probable the tax authority will accept the treatment.
 */
export function handleUncertaintyScope(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasUncertainty = hasMappingHint(ctx, UNCERTAINTY_HINTS);
  if (!hasUncertainty) {
    return baseEval(
      rule, "skipped",
      "لا بنود عدم يقين ضريبي — القاعدة غير قابلة للتطبيق.",
      "No tax uncertainty accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "نطاق IFRIC 23 محدد لعدم اليقين في المعالجات الضريبية.",
    "IFRIC 23 scope identified for tax treatment uncertainty.",
  );
}

/**
 * IFRIC 23.9 — Determine unit of account for each uncertain tax treatment separately or in aggregate.
 */
export function handleUnitOfAccount(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasUncertainty = hasMappingHint(ctx, UNCERTAINTY_HINTS);
  if (!hasUncertainty) {
    return baseEval(
      rule, "skipped",
      "لا بنود عدم يقين ضريبي.",
      "No tax uncertainty accounts — skipped.",
    );
  }
  const hasUnit = hasMappingHint(ctx, UNIT_OF_ACCOUNT_HINTS);
  if (!hasUnit) {
    return baseEval(
      rule, "warning",
      "عدم يقين ضريبي بدون تحديد وحدة القياس لكل معالجة (IFRIC 23.9).",
      "Tax uncertainty without unit of account determination (IFRIC 23.9).",
    );
  }
  return baseEval(
    rule, "pass",
    "وحدة القياس للمعالجة الضريبية موثقة.",
    "Unit of account for tax treatment documented.",
  );
}

/**
 * IFRIC 23.5 — Assume tax authority will examine uncertain treatments; consider probability of acceptance.
 */
export function handleExaminationAssumption(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasUncertainty = hasMappingHint(ctx, UNCERTAINTY_HINTS);
  if (!hasUncertainty) {
    return baseEval(
      rule, "skipped",
      "لا بنود عدم يقين ضريبي.",
      "No tax uncertainty accounts — skipped.",
    );
  }
  const hasExamination = hasMappingHint(ctx, EXAMINATION_HINTS);
  if (!hasExamination) {
    return baseEval(
      rule, "warning",
      "عدم يقين ضريبي بدون افتراض فحص الهيئة الضريبية واحتمال القبول (IFRIC 23.5).",
      "Tax uncertainty without examination assumption and acceptance probability (IFRIC 23.5).",
    );
  }
  return baseEval(
    rule, "pass",
    "افتراض الفحص الضريبي موثق.",
    "Tax examination assumption documented.",
  );
}

/**
 * IFRIC 23.10 — Reflect uncertainty in income tax using probability-weighted expected value or most likely amount.
 */
export function handleReflectUncertainty(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasUncertainty = hasMappingHint(ctx, UNCERTAINTY_HINTS);
  if (!hasUncertainty) {
    return baseEval(
      rule, "skipped",
      "لا بنود عدم يقين ضريبي.",
      "No tax uncertainty accounts — skipped.",
    );
  }
  const hasReflect = hasMappingHint(ctx, REFLECT_HINTS);
  if (!hasReflect) {
    return baseEval(
      rule, "warning",
      "عدم يقين ضريبي بدون انعكاس عدم اليقين باستخدام القيمة المتوقعة أو المبلغ الأكثر احتمالاً (IFRIC 23.10).",
      "Tax uncertainty without reflecting uncertainty using expected value or most likely amount (IFRIC 23.10).",
    );
  }
  return baseEval(
    rule, "pass",
    "انعكاس عدم اليقين في الضريبة موثق.",
    "Reflection of tax uncertainty documented.",
  );
}
