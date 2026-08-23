import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const FAIR_VALUE_HINTS = [
  "fair value",
  "fvlm",
  "fair market",
  "قيمة عادلة",
];

const VALUATION_HINTS = [
  "valuation",
  "appraisal",
  "valuation technique",
  "market approach",
  "income approach",
  "cost approach",
  "تقييم",
];

const HIERARCHY_HINTS = [
  "level 1",
  "level 2",
  "level 3",
  "hierarchy",
  "observable",
  "unobservable",
  "مستوى 1",
  "مستوى 2",
  "مستوى 3",
];

const DISCLOSURE_HINTS = [
  "disclosure",
  "fair value disclosure",
  "valuation disclosure",
  "إفصاح",
];

/**
 * IFRS 13.9 — Fair value is the exit price in an orderly transaction between market participants.
 */
export function handleFairValueDefinition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFairValue = hasMappingHint(ctx, FAIR_VALUE_HINTS);
  if (!hasFairValue) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود قيمة عادلة — القاعدة غير قابلة للتطبيق.",
      "No fair value accounts — rule not applicable.",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "بنود القيمة العادلة موجودة — تأكد من أن القياس يعكس سعر الخروج في معاملة منظمة بين مشاركين في السوق (IFRS 13.9).",
    "Fair value accounts present — ensure measurement reflects exit price in an orderly transaction between market participants (IFRS 13.9).",
  );
}

/**
 * IFRS 13.61 — Use valuation techniques appropriate in the circumstances, maximising observable inputs.
 */
export function handleValuationTechniques(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFairValue = hasMappingHint(ctx, FAIR_VALUE_HINTS);
  if (!hasFairValue) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود قيمة عادلة.",
      "No fair value accounts — skipped.",
    );
  }

  const hasValuation = hasMappingHint(ctx, VALUATION_HINTS);
  if (!hasValuation) {
    return baseEval(
      rule,
      "advisory",
      "بنود قيمة عادلة موجودة بدون إشارة إلى تقنيات التقييم. تأكد من استخدام تقنيات تقييم مناسبة وتعظيم المدخلات القابلة للملاحظة (IFRS 13.61).",
      "Fair value accounts present without valuation technique indication. Ensure appropriate valuation techniques are used, maximising observable inputs (IFRS 13.61).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "بنود القيمة العادلة وتقنيات التقييم موجودة — راجع IFRS 13.61.",
    "Fair value and valuation technique accounts present — review IFRS 13.61.",
  );
}

/**
 * IFRS 13.76 — Classify fair value measurements into Level 1, Level 2, or Level 3.
 */
export function handleFairValueHierarchy(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFairValue = hasMappingHint(ctx, FAIR_VALUE_HINTS);
  if (!hasFairValue) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود قيمة عادلة.",
      "No fair value accounts — skipped.",
    );
  }

  const hasHierarchy = hasMappingHint(ctx, HIERARCHY_HINTS);
  if (!hasHierarchy) {
    return baseEval(
      rule,
      "warning",
      "بنود قيمة عادلة موجودة بدون تصنيف هرمي. تأكد من تصنيف قياسات القيمة العادلة إلى المستوى 1 أو 2 أو 3 (IFRS 13.76).",
      "Fair value accounts present without hierarchy classification. Ensure fair value measurements are classified into Level 1, 2, or 3 (IFRS 13.76).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "تصنيف هرم القيمة العادلة موجود — راجع IFRS 13.76.",
    "Fair value hierarchy classification present — review IFRS 13.76.",
  );
}

/**
 * IFRS 13.91 — Disclose information about fair value measurements and valuation techniques.
 */
export function handleFairValueDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFairValue = hasMappingHint(ctx, FAIR_VALUE_HINTS);
  if (!hasFairValue) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود قيمة عادلة.",
      "No fair value accounts — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  const noteCount = ctx.disclosureNoteCount;

  if (!hasDisclosure && noteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "بنود قيمة عادلة موجودة بدون إفصاحات. تأكد من الإفصاح عن معلومات قياسات القيمة العادلة وتقنيات التقييم المستخدمة (IFRS 13.91).",
      "Fair value accounts present without disclosures. Ensure information about fair value measurements and valuation techniques is disclosed (IFRS 13.91).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات القيمة العادلة موجودة — راجع IFRS 13.91.",
    "Fair value disclosures present — review IFRS 13.91.",
  );
}
