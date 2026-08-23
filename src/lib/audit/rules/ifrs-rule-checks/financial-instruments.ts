import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const FINANCIAL_ASSET_HINTS = [
  "financial asset",
  "bond",
  "debenture",
  "loan receivable",
  "trade receivable",
  "investment in debt",
  "أصل مالي",
  "سند",
  "قرض مستحق",
];

const AMORTISED_COST_HINTS = [
  "amortised cost",
  "amortization",
  "effective interest",
  "effective interest rate",
  "eir",
  "تكلفة مستهلكة",
  "فائدة فعالة",
];

const LIABILITY_MEASUREMENT_HINTS = [
  "financial liability",
  "borrowing",
  "loan payable",
  "bond payable",
  "debenture payable",
  "التزام مالي",
  "قرض مستحق الدفع",
  "سند مستحق",
];

const ECL_HINTS = [
  "expected credit loss",
  "ecl",
  "impairment loss",
  "credit risk",
  "provision for credit",
  "خسارة ائتمانية متوقعة",
  "خطر ائتماني",
  "مخصص ائتماني",
];

const ECL_STAGING_HINTS = [
  "stage 1",
  "stage 2",
  "stage 3",
  "12-month ecl",
  "lifetime ecl",
  "significant increase",
  "credit impaired",
  "مرحلة 1",
  "مرحلة 2",
  "مرحلة 3",
];

const HEDGE_HINTS = [
  "hedge",
  "hedging",
  "hedge accounting",
  "derivative",
  "fair value hedge",
  "cash flow hedge",
  "net investment hedge",
  "تحوط",
  "مشتقات",
  "محاسبة التحوط",
];

/**
 * IFRS 9.4.1 — Financial assets at amortised cost.
 */
export function handleAmortisedCost(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFa = hasMappingHint(ctx, FINANCIAL_ASSET_HINTS);
  if (!hasFa) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أصول مالية — القاعدة غير قابلة للتطبيق.",
      "No financial asset accounts — rule not applicable.",
    );
  }

  const hasAmortised = hasMappingHint(ctx, AMORTISED_COST_HINTS);
  if (!hasAmortised) {
    return baseEval(
      rule,
      "advisory",
      "أصول مالية موجودة. تأكد من قياس الأصول المالية ذات الدفعات الثابتة بتكلفة مستهلكة إذا كان نموذج الأعمال هو تحصيل التدفقات التعاقدية (IFRS 9.4.1).",
      "Financial assets present. Ensure assets with contractual cash flows are measured at amortised cost if the business model is to collect contractual cash flows (IFRS 9.4.1).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "قياس الأصول المالية بتكلفة مستهلكة محدد.",
    "Financial asset amortised cost measurement identified.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 9.4.2 — Financial liability measurement.
 */
export function handleLiabilityMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasLiability = hasMappingHint(ctx, LIABILITY_MEASUREMENT_HINTS);
  if (!hasLiability) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود التزامات مالية — القاعدة غير قابلة للتطبيق.",
      "No financial liability accounts — rule not applicable.",
    );
  }

  const hasFvtpl = hasMappingHint(ctx, ["fair value through profit or loss", "fvtpl", "fair value", "قيمة عادلة"]);
  const hasAmortised = hasMappingHint(ctx, AMORTISED_COST_HINTS);

  if (!hasFvtpl && !hasAmortised) {
    return baseEval(
      rule,
      "warning",
      "التزامات مالية موجودة بدون تحديد أساس القياس (تكلفة مستهلكة أو قيمة عادلة عبر الأرباح/الخسائر) — راجع IFRS 9.4.2.",
      "Financial liabilities present without measurement basis (amortised cost or FVTPL) — review IFRS 9.4.2.",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "أساس قياس الالتزامات المالية محدد.",
    "Financial liability measurement basis identified.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 9.5.5 — Expected credit loss model.
 */
export function handleExpectedCreditLoss(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFa = hasMappingHint(ctx, FINANCIAL_ASSET_HINTS) || hasMappingHint(ctx, ["trade receivable", "ذمم مدينة"]);
  if (!hasFa) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أصول مالية — القاعدة غير قابلة للتطبيق.",
      "No financial asset accounts — rule not applicable.",
    );
  }

  const hasEcl = hasMappingHint(ctx, ECL_HINTS);
  if (!hasEcl) {
    return baseEval(
      rule,
      "warning",
      "أصول مالية موجودة بدون خسارة ائتمانية متوقعة (ECL). تأكد من حساب ECL وفق IFRS 9.5.5.",
      "Financial assets present without expected credit loss (ECL). Ensure ECL is calculated per IFRS 9.5.5.",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "خسارة ائتمانية متوقعة (ECL) معيّنة.",
    "Expected credit loss (ECL) identified.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 9.5.5 — ECL three-stage model.
 */
export function handleEclStaging(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasEcl = hasMappingHint(ctx, ECL_HINTS);
  if (!hasEcl) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود خسارة ائتمانية متوقعة.",
      "No ECL accounts — skipped.",
    );
  }

  const hasStaging = hasMappingHint(ctx, ECL_STAGING_HINTS);
  if (!hasStaging) {
    return baseEval(
      rule,
      "advisory",
      "خسارة ائتمانية متوقعة موجودة. تأكد من تصنيف الأصول إلى المراحل الثلاث (IFRS 9.5.5).",
      "ECL present. Ensure assets are classified into three stages (IFRS 9.5.5).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "تصنيف الأصول إلى المراحل الثلاث موجود.",
    "Three-stage ECL classification present.",
  );
}

/**
 * IFRS 9.6.5 — Hedge accounting.
 */
export function handleHedgeAccounting(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasHedge = hasMappingHint(ctx, HEDGE_HINTS);
  if (!hasHedge) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود تحوط — القاعدة غير قابلة للتطبيق.",
      "No hedge accounts — rule not applicable.",
    );
  }

  const hasHedgeType = hasMappingHint(ctx, ["fair value hedge", "cash flow hedge", "net investment hedge", "تحوط القيمة العادلة", "تحوط التدفق النقدي"]);
  if (!hasHedgeType) {
    return baseEval(
      rule,
      "warning",
      "بنود تحوط موجودة بدون تحديد نوع التحوط (قيمة عادلة، تدفق نقدي، استثمار صافٍ) — راجع IFRS 9.6.5.",
      "Hedge accounts present without hedge type designation (fair value, cash flow, net investment) — review IFRS 9.6.5.",
    );
  }

  return baseEval(
    rule,
    "pass",
    "نوع التحوط محدد.",
    "Hedge type designated.",
  );
}
