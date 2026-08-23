import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const SME_HINTS = [
  "ifrs for smes",
  "smes",
  "small and medium",
  "small and medium-sized",
  "private entity",
  "non-public",
  "منشآت صغيرة ومتوسطة",
  "كيانات خاصة",
];

const FAIR_PRESENTATION_HINTS = [
  "fair presentation",
  "fairly presented",
  "faithful representation",
  "عرض عادل",
  "مقدم بشكل عادل",
  "تمثيل صادق",
];

const REVENUE_HINTS = [
  "revenue from goods",
  "revenue from services",
  "sale of goods",
  "rendering of services",
  "إيراد بيع السلع",
  "إيراد تقديم الخدمات",
];

const PPE_HINTS = [
  "property plant equipment",
  "ppe",
  "cost model",
  "depreciation",
  "أصول ثابتة",
  "ممتلكات وآلات",
  "نموذج التكلفة",
  "إهلاك",
];

const INCOME_TAX_HINTS = [
  "income tax",
  "tax expense",
  "deferred tax",
  "current tax",
  "ضريبة الدخل",
  "مصروف ضريبي",
  "ضريبة مؤجلة",
  "ضريبة جارية",
];

const CONSISTENCY_HINTS = [
  "consistency",
  "consistent",
  "same accounting policies",
  "متسقة",
  "نفس السياسات",
];

/**
 * IFRS for SMEs.2 — Scope: small and medium-sized entities without public accountability.
 */
export function handleSmesScope(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSme = hasMappingHint(ctx, SME_HINTS);
  if (!hasSme) {
    return baseEval(
      rule, "skipped",
      "لا بنود منشآت صغيرة ومتوسطة — القاعدة غير قابلة للتطبيق.",
      "No SME accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "نطاق IFRS for SMEs محدد للمنشآت بدون محاسبية عامة.",
    "IFRS for SMEs scope identified for entities without public accountability.",
  );
}

/**
 * IFRS for SMEs.3.2 — Prepare financial statements that fairly present the entity's financial position and performance.
 */
export function handleSmesFairPresentation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSme = hasMappingHint(ctx, SME_HINTS);
  if (!hasSme) {
    return baseEval(
      rule, "skipped",
      "لا بنود منشآت صغيرة ومتوسطة.",
      "No SME accounts — skipped.",
    );
  }
  const hasFair = hasMappingHint(ctx, FAIR_PRESENTATION_HINTS);
  if (!hasFair) {
    return baseEval(
      rule, "warning",
      "قوائم SMEs بدون تأكيد العرض العادل (IFRS for SMEs.3.2).",
      "SME financial statements without fair presentation confirmation (IFRS for SMEs.3.2).",
    );
  }
  return baseEval(
    rule, "pass",
    "العرض العادل لقوائم SMEs موثق.",
    "Fair presentation of SME financial statements documented.",
  );
}

/**
 * IFRS for SMEs.23 — Recognise revenue from sale of goods when risks and rewards transferred.
 */
export function handleSmesRevenueGoods(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSme = hasMappingHint(ctx, SME_HINTS);
  if (!hasSme) {
    return baseEval(
      rule, "skipped",
      "لا بنود منشآت صغيرة ومتوسطة.",
      "No SME accounts — skipped.",
    );
  }
  const hasRevenue = hasMappingHint(ctx, REVENUE_HINTS);
  if (!hasRevenue) {
    return baseEval(
      rule, "advisory",
      "تأكد من الاعتراف بإيراد بيع السلع عند نقل المخاطر والمزايا (IFRS for SMEs.23).",
      "Ensure revenue from goods recognised when risks and rewards transferred (IFRS for SMEs.23).",
      ["income_statement"],
    );
  }
  return baseEval(
    rule, "pass",
    "إيراد بيع السلع في قوائم SMEs معترف به.",
    "Revenue from goods in SME financial statements recognised.",
    ["income_statement"],
  );
}

/**
 * IFRS for SMEs.17 — Measure PPE at cost less accumulated depreciation and impairment losses.
 */
export function handleSmesPpeMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSme = hasMappingHint(ctx, SME_HINTS);
  if (!hasSme) {
    return baseEval(
      rule, "skipped",
      "لا بنود منشآت صغيرة ومتوسطة.",
      "No SME accounts — skipped.",
    );
  }
  const hasPpe = hasMappingHint(ctx, PPE_HINTS);
  if (!hasPpe) {
    return baseEval(
      rule, "advisory",
      "تأكد من قياس الأصول الثابتة بالتكلفة ناقص الإهلاك والضياء (IFRS for SMEs.17).",
      "Ensure PPE measured at cost less depreciation and impairment (IFRS for SMEs.17).",
      ["balance_sheet"],
    );
  }
  return baseEval(
    rule, "pass",
    "قياس الأصول الثابتة في قوائم SMEs موثق.",
    "PPE measurement in SME financial statements documented.",
    ["balance_sheet"],
  );
}

/**
 * IFRS for SMEs.29 — Recognise current and deferred tax expense in income statement.
 */
export function handleSmesIncomeTax(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSme = hasMappingHint(ctx, SME_HINTS);
  if (!hasSme) {
    return baseEval(
      rule, "skipped",
      "لا بنود منشآت صغيرة ومتوسطة.",
      "No SME accounts — skipped.",
    );
  }
  const hasTax = hasMappingHint(ctx, INCOME_TAX_HINTS);
  if (!hasTax) {
    return baseEval(
      rule, "advisory",
      "تأكد من الاعتراف بمصروف الضريبة الجارية والمؤجلة (IFRS for SMEs.29).",
      "Ensure current and deferred tax expense recognised (IFRS for SMEs.29).",
      ["income_statement"],
    );
  }
  return baseEval(
    rule, "pass",
    "مصروف ضريبة الدخل في قوائم SMEs معترف به.",
    "Income tax expense in SME financial statements recognised.",
    ["income_statement"],
  );
}

/**
 * IFRS for SMEs.10 — Apply accounting policies consistently across all periods.
 */
export function handleSmesConsistency(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSme = hasMappingHint(ctx, SME_HINTS);
  if (!hasSme) {
    return baseEval(
      rule, "skipped",
      "لا بنود منشآت صغيرة ومتوسطة.",
      "No SME accounts — skipped.",
    );
  }
  const hasConsistency = hasMappingHint(ctx, CONSISTENCY_HINTS);
  if (!hasConsistency) {
    return baseEval(
      rule, "warning",
      "قوائم SMEs بدون تأكيد اتساق السياسات المحاسبية (IFRS for SMEs.10).",
      "SME financial statements without accounting policy consistency (IFRS for SMEs.10).",
    );
  }
  return baseEval(
    rule, "pass",
    "اتساق السياسات المحاسبية في قوائم SMEs موثق.",
    "Accounting policy consistency in SME financial statements documented.",
  );
}
