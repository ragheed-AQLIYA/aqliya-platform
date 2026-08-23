import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const HELD_FOR_SALE_HINTS = [
  "held for sale",
  "disposal group",
  "held for distribution",
  "معد للبيع",
  "مجموعة تخليص",
];

const MEASUREMENT_HINTS = [
  "fair value less costs to sell",
  "carrying amount",
  "impairment",
  "قيمة عادلة ناقصة تكاليف البيع",
  "القيمة الدفترية",
  "ضياع القيمة",
];

const DISCONTINUED_HINTS = [
  "discontinued operation",
  "discontinued operations",
  "operation discontinued",
  "عملية متوقفة",
  "عمليات متوقفة",
];

const NO_DEPRECIATION_HINTS = [
  "no depreciation",
  "cease depreciation",
  "stop depreciation",
  "إيقاف الإهلاك",
  "بدون إهلاك",
];

/**
 * IFRS 5.6 — Classify non-current assets as held for sale when sale highly probable and available for immediate sale.
 */
export function handleHeldForSale(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasHeldForSale = hasMappingHint(ctx, HELD_FOR_SALE_HINTS);
  if (!hasHeldForSale) {
    return baseEval(
      rule, "skipped",
      "لا أصول معدة للبيع — القاعدة غير قابلة للتطبيق.",
      "No held-for-sale accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "أصول معدة للبيع مصنفة وفقاً لـ IFRS 5.",
    "Held-for-sale assets classified per IFRS 5.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 5.15 — Measure held-for-sale assets at fair value less costs to sell, not depreciated.
 */
export function handleHeldForSaleMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasHeldForSale = hasMappingHint(ctx, HELD_FOR_SALE_HINTS);
  if (!hasHeldForSale) {
    return baseEval(
      rule, "skipped",
      "لا أصول معدة للبيع.",
      "No held-for-sale accounts — skipped.",
    );
  }
  const hasMeasurement = hasMappingHint(ctx, MEASUREMENT_HINTS);
  if (!hasMeasurement) {
    return baseEval(
      rule, "warning",
      "أصول معدة للبيع بدون قياس بالقيمة العادلة ناقصة تكاليف البيع (IFRS 5.15).",
      "Held-for-sale assets without fair value less costs to sell (IFRS 5.15).",
      ["balance_sheet"],
    );
  }
  return baseEval(
    rule, "pass",
    "أصول معدة للبيع مقاسة بالقيمة العادلة ناقصة تكاليف البيع.",
    "Held-for-sale assets measured at fair value less costs to sell.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 5.33 — Present discontinued operations separately in income statement.
 */
export function handleDiscontinuedOperations(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasDiscontinued = hasMappingHint(ctx, DISCONTINUED_HINTS);
  if (!hasDiscontinued) {
    return baseEval(
      rule, "skipped",
      "لا عمليات متوقفة — القاعدة غير قابلة للتطبيق.",
      "No discontinued operations — rule not applicable.",
    );
  }
  const hasSeparate = hasMappingHint(ctx, ["separate line", "separately presented", "بند مستقل", "عرض مستقل"]);
  if (!hasSeparate) {
    return baseEval(
      rule, "warning",
      "عمليات متوقفة بدون عرض مستقل في قائمة الدخل (IFRS 5.33).",
      "Discontinued operations without separate presentation in income statement (IFRS 5.33).",
      ["income_statement"],
    );
  }
  return baseEval(
    rule, "pass",
    "العمليات المتوقفة معروضة بشكل مستقل.",
    "Discontinued operations presented separately.",
    ["income_statement"],
  );
}

/**
 * IFRS 5.27 — Cease depreciation of held-for-sale assets from classification date.
 */
export function handleNoDepreciation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasHeldForSale = hasMappingHint(ctx, HELD_FOR_SALE_HINTS);
  if (!hasHeldForSale) {
    return baseEval(
      rule, "skipped",
      "لا أصول معدة للبيع.",
      "No held-for-sale accounts — skipped.",
    );
  }
  const hasNoDep = hasMappingHint(ctx, NO_DEPRECIATION_HINTS);
  if (!hasNoDep) {
    return baseEval(
      rule, "warning",
      "أصول معدة للبيع بدون إيقاف الإهلاك من تاريخ التصنيف (IFRS 5.27).",
      "Held-for-sale assets without ceasing depreciation from classification date (IFRS 5.27).",
    );
  }
  return baseEval(
    rule, "pass",
    "إهلاك الأصول المعدة للبيع متوقف.",
    "Depreciation of held-for-sale assets ceased.",
  );
}
