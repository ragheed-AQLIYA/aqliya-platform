import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const GOODWILL_HINTS = [
  "goodwill",
  "good will",
  "شهرة",
];

const ACQUISITION_HINTS = [
  "acquisition",
  "acquiree",
  "acquirer",
  "business combination",
  "consolidation",
  "acquisition",
  "استحواذ",
  "اندماج",
];

const FAIR_VALUE_HINTS = [
  "fair value",
  "fvlm",
  "fair market",
  "قيمة عادلة",
];

const NON_CONTROLLING_HINTS = [
  "non-controlling",
  "noncontrolling",
  "minority interest",
  "nci",
  "حقوق الأقلية",
];

/**
 * IFRS 3.4 — Account for each business combination by applying the acquisition method.
 */
export function handleAcquisitionMethod(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasAcquisition = hasMappingHint(ctx, ACQUISITION_HINTS);
  if (!hasAcquisition) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود استحواذ — القاعدة غير قابلة للتطبيق.",
      "No acquisition accounts — rule not applicable.",
    );
  }

  return baseEval(
    rule,
    "pass",
    "بنود استحواذ موجودة — تأكد من تطبيق طريقة الاستحواذ (IFRS 3.4).",
    "Acquisition accounts present — ensure acquisition method is applied (IFRS 3.4).",
    ["balance_sheet"],
  );
}

/**
 * IFRS 3.7 — The acquirer is the entity that obtains control of the acquiree.
 */
export function handleIdentifyAcquirer(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasAcquisition = hasMappingHint(ctx, ACQUISITION_HINTS);
  if (!hasAcquisition) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود استحواذ.",
      "No acquisition accounts — skipped.",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من تحديد المُستحوذ بشكل صحيح — هو الكيان الذي يحصل على السيطرة على المُستحوَذ (IFRS 3.7).",
    "Ensure acquirer is correctly identified — the entity that obtains control of the acquiree (IFRS 3.7).",
  );
}

/**
 * IFRS 3.32 — Measure identifiable assets acquired and liabilities assumed at acquisition-date fair values.
 */
export function handleFairValue(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasAcquisition = hasMappingHint(ctx, ACQUISITION_HINTS);
  if (!hasAcquisition) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود استحواذ.",
      "No acquisition accounts — skipped.",
    );
  }

  const hasFairValue = hasMappingHint(ctx, FAIR_VALUE_HINTS);
  if (!hasFairValue) {
    return baseEval(
      rule,
      "warning",
      "بنود استحواذ موجودة بدون إشارة إلى القيمة العادلة. تأكد من قياس الأصول والالتزامات بالقيمة العادلة عند تاريخ الاستحواذ (IFRS 3.32).",
      "Acquisition accounts present without fair value indication. Ensure assets and liabilities are measured at acquisition-date fair values (IFRS 3.32).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "بنود الاستحواذ والقيمة العادلة موجودة — راجع IFRS 3.32.",
    "Acquisition and fair value accounts present — review IFRS 3.32.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 3.36 — Goodwill is the excess of consideration + NCI + previously held interest over net identifiable assets.
 */
export function handleGoodwill(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasGoodwill = hasMappingHint(ctx, GOODWILL_HINTS);
  if (!hasGoodwill) {
    const hasAcquisition = hasMappingHint(ctx, ACQUISITION_HINTS);
    if (!hasAcquisition) {
      return baseEval(
        rule,
        "skipped",
        "لا بنود استحواذ أو شهرة.",
        "No acquisition or goodwill accounts — skipped.",
      );
    }
    return baseEval(
      rule,
      "warning",
      "بنود استحواذ موجودة بدون الشهرة. تأكد من الاعتراف بالشهرة كزيادة مقابل التحويل + حقوق الأقلية + الفائدة المملوكة سابقاً على صافي الأصول المحددة (IFRS 3.36).",
      "Acquisition accounts present without goodwill. Ensure goodwill is recognised as excess of consideration + NCI + previously held interest over net identifiable assets (IFRS 3.36).",
      ["balance_sheet"],
    );
  }

  const hasNCI = hasMappingHint(ctx, NON_CONTROLLING_HINTS);
  if (!hasNCI) {
    return baseEval(
      rule,
      "advisory",
      "الشهرة معترف بها — تأكد من قياس حقوق الأقلية بشكل صحيح (IFRS 3.36).",
      "Goodwill recognised — ensure non-controlling interest is measured correctly (IFRS 3.36).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "الشهرة وحقوق الأقلية معيّنة — راجع IFRS 3.36.",
    "Goodwill and NCI mapped — review IFRS 3.36.",
    ["balance_sheet"],
  );
}
