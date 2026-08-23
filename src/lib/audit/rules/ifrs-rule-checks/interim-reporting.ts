import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const INTERIM_HINTS = [
  "interim",
  "quarterly",
  "semi-annual",
  "half-year",
  "interim report",
  "تقرير مرحلي",
  "تقرير ربع سنوي",
  "نصف سنوي",
];

const POLICY_CONSISTENCY_HINTS = [
  "accounting policy",
  "accounting policies",
  "consistent",
  "same policies",
  "سياسات محاسبية",
  "متسقة",
];

const DISCLOSURE_HINTS = [
  "interim disclosure",
  "significant events",
  "significant transactions",
  "explanation of changes",
  "إفصاح مرحلي",
  "أحداث جوهرية",
  "معاملات جوهرية",
];

const TAX_RECONCILIATION_HINTS = [
  "tax reconciliation",
  "effective tax rate",
  "annual tax rate",
  "interim tax",
  "مطابقة ضريبية",
  "معدل ضريبة سنوي",
];

const IMPAIRMENT_HINTS = [
  "impairment",
  "impairment test",
  "recoverable amount",
  "indicators of impairment",
  "ضياع القيمة",
  "اختبار الضياع",
];

/**
 * IAS 34.14 — Same accounting policies in interim reports as annual financial statements.
 */
export function handleInterimPeriodMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInterim = hasMappingHint(ctx, INTERIM_HINTS);
  if (!hasInterim) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود تقارير مرحلية — القاعدة غير قابلة للتطبيق.",
      "No interim reporting accounts — rule not applicable.",
    );
  }

  const hasPolicyConsistency = hasMappingHint(ctx, POLICY_CONSISTENCY_HINTS);
  if (!hasPolicyConsistency) {
    return baseEval(
      rule,
      "warning",
      "بنود تقارير مرحلية موجودة بدون تأكيد اتساق السياسات المحاسبية (IAS 34.14).",
      "Interim reporting accounts present without accounting policy consistency confirmation (IAS 34.14).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "السياسات المحاسبية في التقارير المرحلية متسقة مع القوائم السنوية.",
    "Accounting policies in interim reports consistent with annual financial statements.",
  );
}

/**
 * IAS 34.15 — Disclose significant events and transactions in interim reports.
 */
export function handleInterimDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInterim = hasMappingHint(ctx, INTERIM_HINTS);
  if (!hasInterim) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود تقارير مرحلية.",
      "No interim reporting accounts — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "تقرير مرحلي بدون إفصاح عن الأحداث والمعاملات الجوهرية (IAS 34.15).",
      "Interim report without disclosure of significant events and transactions (IAS 34.15).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات التقارير المرحلية عن الأحداث الجوهرية موجودة.",
    "Interim report disclosures for significant events present.",
  );
}

/**
 * IAS 34.28 — Reconciliation of interim tax expense to annual tax rate.
 */
export function handleInterimTaxReconciliation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInterim = hasMappingHint(ctx, INTERIM_HINTS);
  if (!hasInterim) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود تقارير مرحلية.",
      "No interim reporting accounts — skipped.",
    );
  }

  const hasTaxRecon = hasMappingHint(ctx, TAX_RECONCILIATION_HINTS);
  if (!hasTaxRecon) {
    return baseEval(
      rule,
      "warning",
      "تقرير مرحلي بدون مطابقة مصروف الضريبة مع معدل الضريبة السنوي (IAS 34.28).",
      "Interim report without tax expense reconciliation to annual tax rate (IAS 34.28).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "مطابقة الضريبة المرحلية مع المعدل السنوي موجودة.",
    "Interim tax reconciliation with annual rate present.",
  );
}

/**
 * IAS 34.37 — Assess impairment indicators at each interim reporting date.
 */
export function handleInterimImpairmentAssessment(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInterim = hasMappingHint(ctx, INTERIM_HINTS);
  if (!hasInterim) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود تقارير مرحلية.",
      "No interim reporting accounts — skipped.",
    );
  }

  const hasImpairment = hasMappingHint(ctx, IMPAIRMENT_HINTS);
  if (!hasImpairment) {
    return baseEval(
      rule,
      "advisory",
      "تأكد من تقييم مؤشرات الضياع في كل تاريخ إعداد تقرير مرحلي (IAS 34.37).",
      "Ensure impairment indicators are assessed at each interim reporting date (IAS 34.37).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "تقييم الضياع في التقرير المرحلي موجود.",
    "Impairment assessment in interim report present.",
  );
}
