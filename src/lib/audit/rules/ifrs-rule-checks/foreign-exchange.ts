import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const FX_HINTS = [
  "foreign",
  "exchange",
  "fx",
  "currency",
  "translation",
  "monetary",
  "spot rate",
  "closing rate",
  "أجنبي",
  "صرف",
  "عملة",
  "تحويل",
  "نقدية",
];

const FUNCTIONAL_CURRENCY_HINTS = [
  "functional currency",
  "presentation currency",
  "primary economic",
  "عملة وظيفية",
  "عملة العرض",
];

const EXCHANGE_DIFF_HINTS = [
  "exchange difference",
  "fx gain",
  "fx loss",
  "exchange gain",
  "exchange loss",
  "retranslation",
  "فروق صرف",
  "ربح صرف",
  "خسارة صرف",
];

const FX_DISCLOSURE_HINTS = [
  "exchange difference disclosure",
  "fx disclosure",
  "net investment",
  "cumulative exchange",
  "equity reserve",
  "إفصاح صرف",
];

/**
 * IAS 21.9 — Functional currency is the currency of the primary economic environment.
 */
export function handleFunctionalCurrency(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFx = hasMappingHint(ctx, FX_HINTS);
  if (!hasFx) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود عملة أجنبية — القاعدة غير قابلة للتطبيق.",
      "No foreign currency accounts — rule not applicable.",
    );
  }

  const hasFunctional = hasMappingHint(ctx, FUNCTIONAL_CURRENCY_HINTS);
  if (!hasFunctional) {
    return baseEval(
      rule,
      "advisory",
      "بنود عملة أجنبية موجودة. تأكد من تحديد العملة الوظيفية وفق IAS 21.9.",
      "Foreign currency accounts present. Ensure functional currency is determined per IAS 21.9.",
    );
  }

  return baseEval(
    rule,
    "pass",
    "العملة الوظيفية محددة وبنود العملة الأجنبية موجودة.",
    "Functional currency identified and foreign currency accounts present.",
  );
}

/**
 * IAS 21.20 — Record foreign currency transactions at spot exchange rate.
 */
export function handleTransactionRate(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFx = hasMappingHint(ctx, FX_HINTS);
  if (!hasFx) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود عملة أجنبية.",
      "No foreign currency accounts — skipped.",
    );
  }

  const hasSpotRate = hasMappingHint(ctx, ["spot rate", "transaction rate", "rate", "سعر", "تاريخ المعاملة"]);
  if (!hasSpotRate) {
    return baseEval(
      rule,
      "warning",
      "بنود عملة أجنبية بدون تحديد سعر الصرف بتاريخ المعاملة (IAS 21.20).",
      "Foreign currency accounts without spot rate identification at transaction date (IAS 21.20).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "سعر الصرف بتاريخ المعاملة محدد.",
    "Spot exchange rate at transaction date identified.",
  );
}

/**
 * IAS 21.23 — Monetary items at closing rate, non-monetary at historical rate.
 */
export function handleReportingRate(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasMonetary = hasMappingHint(ctx, [
    "monetary",
    "cash",
    "receivable",
    "payable",
    "loan",
    "borrowing",
    "نقدية",
    "ذمم",
    "قرض",
  ]);
  if (!hasMonetary) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود نقدية بالعملة الأجنبية.",
      "No monetary foreign currency accounts — skipped.",
    );
  }

  const hasClosingRate = hasMappingHint(ctx, [
    "closing rate",
    "end of period",
    "reporting date",
    "سعر الإغلاق",
    "تاريخ التقرير",
  ]);
  if (!hasClosingRate) {
    return baseEval(
      rule,
      "warning",
      "بنود نقدية موجودة بدون تحديد سعر الإغلاق (IAS 21.23). تأكد من ترجمة البنود النقدية بسعر الإغلاق.",
      "Monetary items present without closing rate identification (IAS 21.23). Ensure monetary items are translated at closing rate.",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "البنود النقدية وسعر الإغلاق محددة.",
    "Monetary items and closing rate identified.",
    ["balance_sheet"],
  );
}

/**
 * IAS 21.28 — Exchange differences recognised in profit or loss.
 */
export function handleExchangeDifferences(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFx = hasMappingHint(ctx, FX_HINTS);
  if (!hasFx) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود عملة أجنبية.",
      "No foreign currency accounts — skipped.",
    );
  }

  const hasExchDiff = hasMappingHint(ctx, EXCHANGE_DIFF_HINTS);
  if (!hasExchDiff) {
    return baseEval(
      rule,
      "warning",
      "بنود عملة أجنبية بدون حساب فروق صرف (IAS 21.28). تأكد من الاعتراف بفروق الصرف في الأرباح أو الخسائر.",
      "Foreign currency accounts without exchange difference account (IAS 21.28). Ensure exchange differences are recognised in profit or loss.",
      ["income_statement"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "حساب فروق الصرف موجود — راجع الاعتراف في قائمة الدخل.",
    "Exchange difference account present — review P&L recognition.",
    ["income_statement"],
  );
}

/**
 * IAS 21.48 — Disclose exchange differences in P&L and equity.
 */
export function handleFxDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFx = hasMappingHint(ctx, FX_HINTS);
  if (!hasFx) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود عملة أجنبية.",
      "No foreign currency accounts — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, FX_DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "بنود عملة أجنبية بدون إفصاحات عن فروق الصرف (IAS 21.48).",
      "Foreign currency accounts without exchange difference disclosures (IAS 21.48).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "الإفصاحات عن فروق الصرف موجودة.",
    "Exchange difference disclosures present.",
  );
}
