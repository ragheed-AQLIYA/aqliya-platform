import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const SHARE_PAYMENT_HINTS = [
  "share-based payment",
  "share option",
  "equity-settled",
  "cash-settled",
  "stock option",
  "employee share",
  "دفع على أسهم",
  "خيار أسهم",
  "أسهم عاملين",
];

const EQUITY_SETTLED_HINTS = [
  "equity-settled",
  "equity instrument",
  "share option granted",
  "أداة حقوق ملكية",
  "خيار أسهم منح",
];

const CASH_SETTLED_HINTS = [
  "cash-settled",
  "share appreciation right",
  "sar",
  "cash alternative",
  "م settled نقداً",
  "حق تقدير الأسهم",
];

const VESTING_HINTS = [
  "vesting period",
  "vesting condition",
  "service condition",
  "performance condition",
  "فترة الاستحقاق",
  "شرط الاستحقاق",
  "شرط الخدمة",
  "شرط الأداء",
];

/**
 * IFRS 2.2 — Scope: share-based payment arrangements including equity-settled, cash-settled, and mixed.
 */
export function handleSharePaymentScope(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSharePayment = hasMappingHint(ctx, SHARE_PAYMENT_HINTS);
  if (!hasSharePayment) {
    return baseEval(
      rule, "skipped",
      "لا بنود دفع على أساس الأسهم — القاعدة غير قابلة للتطبيق.",
      "No share-based payment accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "ترتيبات الدفع على أساس الأسهم موجودة ضمن نطاق IFRS 2.",
    "Share-based payment arrangements present within IFRS 2 scope.",
  );
}

/**
 * IFRS 2.11 — Measure equity-settled payments at fair value of equity instruments at grant date.
 */
export function handleEquitySettled(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasEquitySettled = hasMappingHint(ctx, EQUITY_SETTLED_HINTS);
  if (!hasEquitySettled) {
    return baseEval(
      rule, "skipped",
      "لا ترتيبات دفع تسوى بأسهم — القاعدة غير قابلة للتطبيق.",
      "No equity-settled share payment accounts — rule not applicable.",
    );
  }
  const hasFv = hasMappingHint(ctx, ["fair value", "grant date", "قيمة عادلة", "تاريخ المنح"]);
  if (!hasFv) {
    return baseEval(
      rule, "warning",
      "دفع تسوى بأسهم بدون قياس بالقيمة العادلة عند تاريخ المنح (IFRS 2.11).",
      "Equity-settled payment without fair value at grant date (IFRS 2.11).",
    );
  }
  return baseEval(
    rule, "pass",
    "الدفع المسوى بأسهم مقاس بالقيمة العادلة عند تاريخ المنح.",
    "Equity-settled payment measured at fair value at grant date.",
  );
}

/**
 * IFRS 2.23 — Measure cash-settled payments at fair value of liability at each reporting date.
 */
export function handleCashSettled(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasCashSettled = hasMappingHint(ctx, CASH_SETTLED_HINTS);
  if (!hasCashSettled) {
    return baseEval(
      rule, "skipped",
      "لا ترتيبات دفع تسوى نقداً — القاعدة غير قابلة للتطبيق.",
      "No cash-settled share payment accounts — rule not applicable.",
    );
  }
  const hasFv = hasMappingHint(ctx, ["fair value", "liability", "قيمة عادلة", "التزام"]);
  if (!hasFv) {
    return baseEval(
      rule, "warning",
      "دفع تسوى نقداً بدون قياس بالقيمة العادلة للالتزام (IFRS 2.23).",
      "Cash-settled payment without fair value of liability (IFRS 2.23).",
      ["balance_sheet"],
    );
  }
  return baseEval(
    rule, "pass",
    "الدفع المسوى نقداً مقاس بالقيمة العادلة للالتزام.",
    "Cash-settled payment measured at fair value of liability.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 2.17 — Recognise expense over vesting period based on expected vesting conditions.
 */
export function handleVestingPeriod(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSharePayment = hasMappingHint(ctx, SHARE_PAYMENT_HINTS);
  if (!hasSharePayment) {
    return baseEval(
      rule, "skipped",
      "لا بنود دفع على أساس الأسهم.",
      "No share-based payment accounts — skipped.",
    );
  }
  const hasVesting = hasMappingHint(ctx, VESTING_HINTS);
  if (!hasVesting) {
    return baseEval(
      rule, "warning",
      "دفع على أساس الأسهم بدون تحديد فترة وشروط الاستحقاق (IFRS 2.17).",
      "Share-based payment without vesting period and conditions (IFRS 2.17).",
    );
  }
  return baseEval(
    rule, "pass",
    "فترة وشروط الاستحقاق موثقة.",
    "Vesting period and conditions documented.",
  );
}
