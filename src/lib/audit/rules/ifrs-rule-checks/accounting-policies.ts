import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const POLICY_HINTS = [
  "accounting policy",
  "accounting policies",
  "policy selection",
  "سياسات محاسبية",
  "اختيار سياسة",
];

const POLICY_CHANGE_HINTS = [
  "policy change",
  "change in accounting policy",
  "voluntary change",
  "mandatory change",
  "تغيير في السياسة المحاسبية",
  "تغيير اختياري",
  "تغيير إلزامي",
];

const ESTIMATE_CHANGE_HINTS = [
  "estimate change",
  "change in estimate",
  "revision of estimate",
  "تغيير في التقدير",
  "مراجعة التقدير",
];

const ERROR_CORRECTION_HINTS = [
  "error correction",
  "prior period error",
  "restatement",
  "retrospective restatement",
  "تصحيح خطأ",
  "خطأ فترة سابقة",
  "إعادة عرض",
];

/**
 * IAS 8.7 — Select and apply accounting policies consistently per relevant IFRS standards.
 */
export function handlePolicySelection(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasPolicy = hasMappingHint(ctx, POLICY_HINTS);
  if (!hasPolicy) {
    return baseEval(
      rule, "skipped",
      "لا بنود سياسات محاسبية — القاعدة غير قابلة للتطبيق.",
      "No accounting policy accounts — rule not applicable.",
    );
  }
  const hasConsistency = hasMappingHint(ctx, ["consistent", "consistently applied", "متسقة", "مطبقة بشكل متسق"]);
  if (!hasConsistency) {
    return baseEval(
      rule, "advisory",
      "تأكد من تطبيق السياسات المحاسبية بشكل متسق (IAS 8.7).",
      "Ensure accounting policies are applied consistently (IAS 8.7).",
    );
  }
  return baseEval(
    rule, "pass",
    "السياسات المحاسبية مطبقة بشكل متسق.",
    "Accounting policies applied consistently.",
  );
}

/**
 * IAS 8.19 — Apply voluntary changes in accounting policy retrospectively.
 */
export function handlePolicyChange(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasChange = hasMappingHint(ctx, POLICY_CHANGE_HINTS);
  if (!hasChange) {
    return baseEval(
      rule, "skipped",
      "لا تغييرات في السياسات المحاسبية.",
      "No accounting policy changes — skipped.",
    );
  }
  const hasRetrospective = hasMappingHint(ctx, ["retrospective", "retrospectively", "إعادة عرض بأثر رجعي", "بأثر رجعي"]);
  if (!hasRetrospective) {
    return baseEval(
      rule, "warning",
      "تغيير في السياسة المحاسبية بدون تطبيق بأثر رجعي (IAS 8.19).",
      "Accounting policy change without retrospective application (IAS 8.19).",
    );
  }
  return baseEval(
    rule, "pass",
    "تغيير السياسة المحاسبية مطبق بأثر رجعي.",
    "Accounting policy change applied retrospectively.",
  );
}

/**
 * IAS 8.36 — Apply changes in accounting estimates prospectively.
 */
export function handleEstimateChange(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasEstimate = hasMappingHint(ctx, ESTIMATE_CHANGE_HINTS);
  if (!hasEstimate) {
    return baseEval(
      rule, "skipped",
      "لا تغييرات في التقديرات المحاسبية.",
      "No accounting estimate changes — skipped.",
    );
  }
  const hasProspective = hasMappingHint(ctx, ["prospective", "prospectively", "أثر مستقبلي", "بأثر مستقبلي"]);
  if (!hasProspective) {
    return baseEval(
      rule, "warning",
      "تغيير في التقدير بدون تطبيق بأثر مستقبلي (IAS 8.36).",
      "Estimate change without prospective application (IAS 8.36).",
    );
  }
  return baseEval(
    rule, "pass",
    "تغيير التقدير مطبق بأثر مستقبلي.",
    "Estimate change applied prospectively.",
  );
}

/**
 * IAS 8.41 — Correct material prior period errors by retrospective restatement.
 */
export function handleErrorCorrection(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasError = hasMappingHint(ctx, ERROR_CORRECTION_HINTS);
  if (!hasError) {
    return baseEval(
      rule, "skipped",
      "لا تصحيحات أخطاء فترات سابقة.",
      "No prior period error corrections — skipped.",
    );
  }
  const hasRestatement = hasMappingHint(ctx, ["restatement", "retrospective restatement", "إعادة عرض", "إعادة عرض بأثر رجعي"]);
  if (!hasRestatement) {
    return baseEval(
      rule, "warning",
      "تصحيح خطأ فترة سابقة بدون إعادة عرض بأثر رجعي (IAS 8.41).",
      "Prior period error correction without retrospective restatement (IAS 8.41).",
    );
  }
  return baseEval(
    rule, "pass",
    "تصحيح الخطأ بإعادة عرض بأثر رجعي موثق.",
    "Error correction by retrospective restatement documented.",
  );
}
