import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const PROFIT_HINTS = [
  "profit",
  "net income",
  "earnings",
  "profit attributable",
  "net profit",
  "ربح",
  "صافي الدخل",
  "أرباح",
];

const SHARES_HINTS = [
  "ordinary shares",
  "common shares",
  "shares outstanding",
  "weighted average shares",
  "share capital",
  "أسهم",
  "أسهم عادية",
  "رأس المال",
];

const DILUTIVE_HINTS = [
  "diluted",
  "dilutive",
  "potential ordinary shares",
  "convertible",
  "warrants",
  "options",
  "مخففة",
  "قابلة للتحويل",
  "خيارات أسهم",
];

const EPS_DISCLOSURE_HINTS = [
  "eps",
  "earnings per share",
  "eps reconciliation",
  "per share",
  "ربحية السهم",
  "تحليل ربحية السهم",
];

/**
 * IAS 33.9 — Basic EPS = profit attributable to ordinary shareholders / weighted average shares.
 */
export function handleBasicEps(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasProfit = hasMappingHint(ctx, PROFIT_HINTS);
  const hasShares = hasMappingHint(ctx, SHARES_HINTS);

  if (!hasProfit && !hasShares) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أرباح أو أسهم — القاعدة غير قابلة للتطبيق.",
      "No profit or share accounts — rule not applicable.",
    );
  }

  if (hasProfit && !hasShares) {
    return baseEval(
      rule,
      "warning",
      "بنود أرباح موجودة بدون بنود أسهم عادية. تأكد من حساب ربحية السهم الأساسية (IAS 33.9).",
      "Profit accounts present without ordinary share accounts. Ensure basic EPS is calculated (IAS 33.9).",
      ["income_statement"],
    );
  }

  if (!hasProfit && hasShares) {
    return baseEval(
      rule,
      "warning",
      "بنود أسهم موجودة بدون بنود أرباح. تأكد من حساب ربحية السهم الأساسية (IAS 33.9).",
      "Share accounts present without profit accounts. Ensure basic EPS is calculated (IAS 33.9).",
      ["income_statement"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "بنود الأرباح والأسهم العادية موجودة — راجع حساب ربحية السهم الأساسية.",
    "Profit and ordinary share accounts present — review basic EPS calculation.",
    ["income_statement"],
  );
}

/**
 * IAS 33.30 — Diluted EPS adjusts for all dilutive potential ordinary shares.
 */
export function handleDilutedEps(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasProfit = hasMappingHint(ctx, PROFIT_HINTS);
  if (!hasProfit) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أرباح — القاعدة غير قابلة للتطبيق.",
      "No profit accounts — rule not applicable.",
    );
  }

  const hasDilutive = hasMappingHint(ctx, DILUTIVE_HINTS);
  if (!hasDilutive) {
    return baseEval(
      rule,
      "advisory",
      "بنود أرباح موجودة. تأكد من حساب ربحية السهم المخففة إذا كانت هناك أسهم عادية محتملة مخففة (IAS 33.30).",
      "Profit accounts present. Ensure diluted EPS is calculated if dilutive potential ordinary shares exist (IAS 33.30).",
      ["income_statement"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "بنود الأرباح والأدوات المخففة موجودة — راجع حساب ربحية السهم المخففة.",
    "Profit and dilutive instrument accounts present — review diluted EPS calculation.",
    ["income_statement"],
  );
}

/**
 * IAS 33.48 — Disclose numerator amounts and reconciliation to profit.
 */
export function handleEpsReconciliation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasProfit = hasMappingHint(ctx, PROFIT_HINTS);
  if (!hasProfit) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أرباح.",
      "No profit accounts — skipped.",
    );
  }

  const hasEpsDisclosure = hasMappingHint(ctx, EPS_DISCLOSURE_HINTS);
  if (!hasEpsDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "بنود أرباح موجودة بدون إفصاح عن تسوية ربحية السهم (IAS 33.48).",
      "Profit accounts present without EPS reconciliation disclosure (IAS 33.48).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات تسوية ربحية السهم موجودة.",
    "EPS reconciliation disclosures present.",
  );
}

/**
 * IAS 33.66 — Disclose weighted average shares and reconciliation of denominators.
 */
export function handleEpsShareReconciliation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasShares = hasMappingHint(ctx, SHARES_HINTS);
  if (!hasShares) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أسهم — القاعدة غير قابلة للتطبيق.",
      "No share accounts — rule not applicable.",
    );
  }

  const hasEpsDisclosure = hasMappingHint(ctx, EPS_DISCLOSURE_HINTS);
  if (!hasEpsDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "بنود أسهم موجودة بدون إفصاح عن تسوية المتوسط المرجح للأسهم (IAS 33.66).",
      "Share accounts present without weighted average share reconciliation disclosure (IAS 33.66).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات تسوية عدد الأسهم موجودة.",
    "Share count reconciliation disclosures present.",
  );
}
