import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const HYPERINFLATION_HINTS = [
  "hyperinflation",
  "hyperinflationary",
  "general price index",
  "purchasing power",
  "تضخم مفرط",
  "مؤشر الأسعار العام",
  "قوة شرائية",
];

const RESTATEMENT_HINTS = [
  "restatement",
  "restated",
  "measuring unit",
  "current at the end",
  "إعادة عرض",
  "وحدة قياس",
];

const COMPARATIVE_HINTS = [
  "comparative",
  "corresponding figures",
  "prior period",
  "مقارنة",
  "أرقام مقابلة",
  "الفترة السابقة",
];

const NON_MONETARY_HINTS = [
  "non-monetary",
  "historical cost",
  "general price index",
  "date of acquisition",
  "غير نقدي",
  "التكلفة التاريخية",
  "تاريخ الاقتناء",
];

const DISCLOSURE_HINTS = [
  "restatement disclosure",
  "general purchasing power",
  "price index",
  "إفصاح إعادة العرض",
  "القوة الشرائية العامة",
];

/**
 * IAS 29.3 — Restate financial statements in measuring unit current at end of reporting period.
 */
export function handleHyperinflationRestatement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasHyperinflation = hasMappingHint(ctx, HYPERINFLATION_HINTS);
  if (!hasHyperinflation) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود اقتصاد تضخم مفرط — القاعدة غير قابلة للتطبيق.",
      "No hyperinflationary economy accounts — rule not applicable.",
    );
  }

  const hasRestatement = hasMappingHint(ctx, RESTATEMENT_HINTS);
  if (!hasRestatement) {
    return baseEval(
      rule,
      "warning",
      "اقتصاد تضخم مفرط بدون إعادة عرض القوائم المالية بوحدة قياس تاريخ نهاية الفترة (IAS 29.3).",
      "Hyperinflationary economy without restatement to measuring unit at period end (IAS 29.3).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إعادة عرض القوائم المالية بوحدة قياس تاريخ نهاية الفترة مطبقة.",
    "Financial statements restated to measuring unit current at period end.",
  );
}

/**
 * IAS 29.8 — Apply same restatement procedures to comparative and corresponding figures.
 */
export function handleHyperinflationComparativeRestatement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasHyperinflation = hasMappingHint(ctx, HYPERINFLATION_HINTS);
  if (!hasHyperinflation) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود اقتصاد تضخم مفرط.",
      "No hyperinflationary economy accounts — skipped.",
    );
  }

  const hasComparative = hasMappingHint(ctx, COMPARATIVE_HINTS);
  if (!hasComparative) {
    return baseEval(
      rule,
      "warning",
      "إعادة عرض التضخم المفرط بدون تطبيق نفس الإجراءات على الأرقام المقارنة (IAS 29.8).",
      "Hyperinflation restatement without applying same procedures to comparative figures (IAS 29.8).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إعادة عرض الأرقام المقارنة مطبقة بنفس إجراءات الفترة الحالية.",
    "Comparative figures restated using same procedures as current period.",
  );
}

/**
 * IAS 29.9 — Restate non-monetary items at historical cost using general price index from acquisition date.
 */
export function handleHyperinflationNonMonetaryItems(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasHyperinflation = hasMappingHint(ctx, HYPERINFLATION_HINTS);
  if (!hasHyperinflation) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود اقتصاد تضخم مفرط.",
      "No hyperinflationary economy accounts — skipped.",
    );
  }

  const hasNonMonetary = hasMappingHint(ctx, NON_MONETARY_HINTS);
  if (!hasNonMonetary) {
    return baseEval(
      rule,
      "warning",
      "إعادة عرض التضخم المفرط بدون تطبيق مؤشر الأسعار العام على البنود غير النقدية بالتكلفة التاريخية (IAS 29.9).",
      "Hyperinflation restatement without general price index for non-monetary items at historical cost (IAS 29.9).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "إعادة عرض البنود غير النقدية بالتكلفة التاريخية باستخدام مؤشر الأسعار العام مطبقة.",
    "Non-monetary items at historical cost restated using general price index.",
    ["balance_sheet"],
  );
}

/**
 * IAS 29.12 — Disclose restatement fact, price index used, and its level at reporting period end.
 */
export function handleHyperinflationDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasHyperinflation = hasMappingHint(ctx, HYPERINFLATION_HINTS);
  if (!hasHyperinflation) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود اقتصاد تضخم مفرط.",
      "No hyperinflationary economy accounts — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "تضخم مفرط بدون إفصاح عن إعادة العرض ومؤشر الأسعار المستخدم ومستواه (IAS 29.12).",
      "Hyperinflation without disclosure of restatement fact and price index used (IAS 29.12).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات التضخم المفرط موجودة.",
    "Hyperinflation disclosures present.",
  );
}
