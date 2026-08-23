import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const INTERIM_IMPAIRMENT_HINTS = [
  "interim impairment",
  "interim financial report",
  "interim period",
  "ضياع القيمة المرحلي",
  "تقرير مرحلي",
];

const IAS36_LINK_HINTS = [
  "ias 36",
  "impairment test",
  "recoverable amount",
  "reversal of impairment",
  "اختبار الضياع",
  "المبلغ القابل للاسترداد",
  "عكس الضياع",
];

const TESTING_CONSISTENCY_HINTS = [
  "consistency",
  "consistent testing",
  "same indicators",
  "اتساق",
  "اختبار متسق",
  "نفس المؤشرات",
];

/**
 * IFRIC 10.3 — Interim Financial Reporting: Impairment of goodwill at interim date not reversed at later interim date.
 */
export function handleInterimImpairment(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInterimImpairment = hasMappingHint(ctx, INTERIM_IMPAIRMENT_HINTS);
  if (!hasInterimImpairment) {
    return baseEval(
      rule, "skipped",
      "لا بنود ضياع قيمة مرحلي — القاعدة غير قابلة للتطبيق.",
      "No interim impairment accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "ضياع القيمة المرحلي للشهرة موثق وفقاً لـ IFRIC 10.",
    "Interim goodwill impairment documented per IFRIC 10.",
  );
}

/**
 * IFRIC 10.4 — Link to IAS 36: impairment recognised at interim date cannot be reversed in later interim period.
 */
export function handleIas36Link(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInterimImpairment = hasMappingHint(ctx, INTERIM_IMPAIRMENT_HINTS);
  if (!hasInterimImpairment) {
    return baseEval(
      rule, "skipped",
      "لا بنود ضياع قيمة مرحلي.",
      "No interim impairment accounts — skipped.",
    );
  }
  const hasIas36 = hasMappingHint(ctx, IAS36_LINK_HINTS);
  if (!hasIas36) {
    return baseEval(
      rule, "warning",
      "ضياع قيمة مرحلي بدون مرجعية IAS 36 — لا يمكن عكسه في فترة مرحلية لاحقة (IFRIC 10.4).",
      "Interim impairment without IAS 36 linkage — cannot be reversed in later interim period (IFRIC 10.4).",
    );
  }
  return baseEval(
    rule, "pass",
    "الربط مع IAS 36 موثق.",
    "IAS 36 linkage documented.",
  );
}

/**
 * IFRIC 10.5 — Ensure consistency in impairment testing across interim and annual periods.
 */
export function handleTestingConsistency(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInterimImpairment = hasMappingHint(ctx, INTERIM_IMPAIRMENT_HINTS);
  if (!hasInterimImpairment) {
    return baseEval(
      rule, "skipped",
      "لا بنود ضياع قيمة مرحلي.",
      "No interim impairment accounts — skipped.",
    );
  }
  const hasConsistency = hasMappingHint(ctx, TESTING_CONSISTENCY_HINTS);
  if (!hasConsistency) {
    return baseEval(
      rule, "advisory",
      "تأكد من اتساق اختبار الضياع بين الفترات المرحلية والسنوية (IFRIC 10.5).",
      "Ensure consistency in impairment testing across interim and annual periods (IFRIC 10.5).",
    );
  }
  return baseEval(
    rule, "pass",
    "اتساق اختبار الضياع موثق.",
    "Impairment testing consistency documented.",
  );
}

/**
 * IFRIC 10.2 — Scope: goodwill impairment in interim financial reports.
 */
export function handleIfric10Scope(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInterim = hasMappingHint(ctx, [...INTERIM_IMPAIRMENT_HINTS, "goodwill", "شهرة"]);
  if (!hasInterim) {
    return baseEval(
      rule, "skipped",
      "لا بنود ضياع قيمة شهرة مرحلي — القاعدة غير قابلة للتطبيق.",
      "No interim goodwill impairment accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "نطاق IFRIC 10 محدد.",
    "IFRIC 10 scope identified.",
  );
}
