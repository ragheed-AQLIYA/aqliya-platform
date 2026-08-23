import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const REGULATORY_HINTS = [
  "regulatory deferral",
  "rate-regulated",
  "regulatory account",
  "deferral account",
  "حسابات تأجيل تنظيمية",
  "تنظيم التعريفة",
];

const CLASSIFICATION_HINTS = [
  "separate line item",
  "separate column",
  "regulatory asset",
  "regulatory liability",
  "بند مستقل",
  "عمود مستقل",
];

const CASH_FLOW_HINTS = [
  "cash flow",
  "operating",
  "investing",
  "financing",
  "تدفق نقدي",
  "تشغيلي",
  "استثماري",
  "تمويلي",
];

const DISCLOSURE_HINTS = [
  "regulatory disclosure",
  "rate-regulated activities",
  "deferral account balance",
  "deferral account movement",
  "إفصاح تنظيمي",
  "أنشطة تنظيم التعريفة",
];

/**
 * IFRS 14.8 — Classify regulatory deferral account balances as separate line items.
 */
export function handleRegulatoryDeferralClassification(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRegulatory = hasMappingHint(ctx, REGULATORY_HINTS);
  if (!hasRegulatory) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود حسابات تأجيل تنظيمية — القاعدة غير قابلة للتطبيق.",
      "No regulatory deferral account balances — rule not applicable.",
    );
  }

  const hasSeparateLine = hasMappingHint(ctx, CLASSIFICATION_HINTS);
  if (!hasSeparateLine) {
    return baseEval(
      rule,
      "warning",
      "حسابات تأجيل تنظيمية بدون تصنيف كبنود مستقلة في الميزانية (IFRS 14.8).",
      "Regulatory deferral accounts without separate line item classification (IFRS 14.8).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "حسابات التأجيل التنظيمية مصنفة كبنود مستقلة.",
    "Regulatory deferral accounts classified as separate line items.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 14.9 — Present regulatory deferral account movements in separate column or line items in comprehensive income.
 */
export function handleRegulatoryDeferralPresentation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRegulatory = hasMappingHint(ctx, REGULATORY_HINTS);
  if (!hasRegulatory) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود حسابات تأجيل تنظيمية.",
      "No regulatory deferral account balances — skipped.",
    );
  }

  const hasSeparateColumn = hasMappingHint(ctx, ["separate column", "separate line", "عمود مستقل", "بند مستقل"]);
  if (!hasSeparateColumn) {
    return baseEval(
      rule,
      "warning",
      "حركات حسابات التأجيل التنظيمية بدون عرض في عمود/بنود مستقلة في قائمة الدخل الشامل (IFRS 14.9).",
      "Regulatory deferral account movements without separate column/line presentation in comprehensive income (IFRS 14.9).",
      ["income_statement"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "حركات حسابات التأجيل التنظيمية معروضة في بنود/أعمدة مستقلة.",
    "Regulatory deferral account movements presented in separate column/line items.",
    ["income_statement"],
  );
}

/**
 * IFRS 14.10 — Present regulatory deferral account movements in statement of cash flows consistently.
 */
export function handleRegulatoryDeferralCashFlow(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRegulatory = hasMappingHint(ctx, REGULATORY_HINTS);
  if (!hasRegulatory) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود حسابات تأجيل تنظيمية.",
      "No regulatory deferral account balances — skipped.",
    );
  }

  const hasCashFlow = hasMappingHint(ctx, CASH_FLOW_HINTS);
  if (!hasCashFlow) {
    return baseEval(
      rule,
      "warning",
      "حركات حسابات التأجيل التنظيمية بدون عرض في قائمة التدفقات النقدية (IFRS 14.10).",
      "Regulatory deferral account movements without presentation in statement of cash flows (IFRS 14.10).",
      ["cash_flow"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "حركات حسابات التأجيل التنظيمية معروضة في قائمة التدفقات النقدية.",
    "Regulatory deferral account movements presented in statement of cash flows.",
    ["cash_flow"],
  );
}

/**
 * IFRS 14.22 — Disclose nature of rate-regulated activities and amounts of regulatory deferral accounts.
 */
export function handleRegulatoryDeferralDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRegulatory = hasMappingHint(ctx, REGULATORY_HINTS);
  if (!hasRegulatory) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود حسابات تأجيل تنظيمية.",
      "No regulatory deferral account balances — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "حسابات تأجيل تنظيمية بدون إفصاح عن طبيعة الأنشطة والمبالغ (IFRS 14.22).",
      "Regulatory deferral accounts without disclosure of activities nature and amounts (IFRS 14.22).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات الحسابات التنظيمية موجودة.",
    "Regulatory deferral account disclosures present.",
  );
}
