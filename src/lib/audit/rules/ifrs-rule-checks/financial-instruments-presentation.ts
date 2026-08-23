import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const EQUITY_INSTRUMENT_HINTS = [
  "equity instrument",
  "ordinary share",
  "preferred share",
  "share capital",
  "stock",
  "أداة حقوق ملكية",
  "أسهم عادية",
  "أسهم ممتازة",
  "رأس المال",
];

const FINANCIAL_LIABILITY_HINTS = [
  "financial liability",
  "bond payable",
  "loan payable",
  "debenture",
  "borrowing",
  "التزام مالي",
  "سند مستحق",
  "قرض مستحق",
];

const TREASURY_SHARES_HINTS = [
  "treasury share",
  "treasury stock",
  "own share",
  "buyback",
  "share buyback",
  "أسهم الخزينة",
  "إعادة شراء أسهم",
];

/**
 * IAS 32.11 — Equity instrument classification.
 */
export function handleEquityInstrument(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasEquity = hasMappingHint(ctx, EQUITY_INSTRUMENT_HINTS);
  if (!hasEquity) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أدوات حقوق ملكية — القاعدة غير قابلة للتطبيق.",
      "No equity instrument accounts — rule not applicable.",
    );
  }

  return baseEval(
    rule,
    "pass",
    "أدوات حقوق الملكية معيّنة.",
    "Equity instruments identified.",
    ["balance_sheet"],
  );
}

/**
 * IAS 32.15 — Financial liability classification.
 */
export function handleFinancialLiability(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasLiability = hasMappingHint(ctx, FINANCIAL_LIABILITY_HINTS);
  if (!hasLiability) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود التزامات مالية — القاعدة غير قابلة للتطبيق.",
      "No financial liability accounts — rule not applicable.",
    );
  }

  const hasEquity = hasMappingHint(ctx, EQUITY_INSTRUMENT_HINTS);
  if (hasEquity && hasLiability) {
    return baseEval(
      rule,
      "advisory",
      "أدوات حقوق ملكية والالتزامات المالية موجودة. تأكد من التصنيف الصحيح بين حقوق الملكية والالتزامات (IAS 32.15).",
      "Equity instruments and financial liabilities present. Ensure correct classification between equity and liabilities (IAS 32.15).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "الالتزامات المالية معيّنة.",
    "Financial liabilities identified.",
    ["balance_sheet"],
  );
}

/**
 * IAS 32.33 — Treasury shares deducted from equity.
 */
export function handleTreasuryShares(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasTreasury = hasMappingHint(ctx, TREASURY_SHARES_HINTS);
  if (!hasTreasury) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أسهم خزينة — القاعدة غير قابلة للتطبيق.",
      "No treasury share accounts — rule not applicable.",
    );
  }

  const hasEquityDeduction = hasMappingHint(ctx, ["deducted from equity", "contra equity", "مخصوم من حقوق الملكية"]);
  if (!hasEquityDeduction) {
    return baseEval(
      rule,
      "warning",
      "أسهم خزينة موجودة بدون تحديد خصمها من حقوق الملكية (IAS 32.33). تأكد من عرض أسهم الخزينة كمخصوم من حقوق الملكية.",
      "Treasury shares present without equity deduction (IAS 32.33). Ensure treasury shares are presented as deduction from equity.",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "أسهم الخزينة مخصومة من حقوق الملكية.",
    "Treasury shares deducted from equity.",
    ["balance_sheet"],
  );
}
