import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const BORROWING_COST_HINTS = [
  "borrowing cost",
  "borrowing costs",
  "interest on loan",
  "loan interest",
  "capitalised interest",
  "تكاليف الاقتراض",
  "فائدة قرض",
  "فائدة رأسمالية",
];

const QUALIFYING_ASSET_HINTS = [
  "qualifying asset",
  "construction",
  "production period",
  "asset under construction",
  "أصل مؤهل",
  "إنشاء",
  "فترة الإنتاج",
];

/**
 * IAS 23.8 — Capitalise borrowing costs directly attributable to acquisition/construction of qualifying assets.
 */
export function handleBorrowingCostCapitalisation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasBorrowing = hasMappingHint(ctx, BORROWING_COST_HINTS);
  if (!hasBorrowing) {
    return baseEval(
      rule, "skipped",
      "لا بنود تكاليف اقتراض — القاعدة غير قابلة للتطبيق.",
      "No borrowing cost accounts — rule not applicable.",
    );
  }
  const hasQualifying = hasMappingHint(ctx, QUALIFYING_ASSET_HINTS);
  if (!hasQualifying) {
    return baseEval(
      rule, "advisory",
      "تكاليف اقتراض موجودة — تأكد من رسملة التكاليف المتعلقة بأصول مؤهلة (IAS 23.8).",
      "Borrowing costs present — ensure costs related to qualifying assets are capitalised (IAS 23.8).",
    );
  }
  return baseEval(
    rule, "pass",
    "تكاليف الاقتراض المرتبطة بأصول مؤهلة مرسملة.",
    "Borrowing costs related to qualifying assets capitalised.",
    ["balance_sheet"],
  );
}

/**
 * IAS 23.10 — Eligible costs include interest on actual borrowings less investment income from temporary investment.
 */
export function handleEligibleBorrowingCosts(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasBorrowing = hasMappingHint(ctx, BORROWING_COST_HINTS);
  if (!hasBorrowing) {
    return baseEval(
      rule, "skipped",
      "لا بنود تكاليف اقتراض.",
      "No borrowing cost accounts — skipped.",
    );
  }
  const hasInvestment = hasMappingHint(ctx, ["temporary investment", "investment income", "استثمار مؤقت", "دخل استثمار"]);
  if (hasInvestment) {
    return baseEval(
      rule, "pass",
      "تكاليف الاقتراض المؤهلة محددة مع خصم دخل الاستثمار المؤقت.",
      "Eligible borrowing costs determined net of temporary investment income.",
    );
  }
  return baseEval(
    rule, "advisory",
      "تأكد من خصم دخل الاستثمار المؤقت من تكاليف الاقتراض المؤهلة (IAS 23.10).",
      "Ensure temporary investment income is deducted from eligible borrowing costs (IAS 23.10).",
  );
}

/**
 * IAS 23.13 — Commence capitalisation when expenditures, borrowing costs, and activities are in progress.
 */
export function handleCapitalisationCommencement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasBorrowing = hasMappingHint(ctx, BORROWING_COST_HINTS);
  if (!hasBorrowing) {
    return baseEval(
      rule, "skipped",
      "لا بنود تكاليف اقتراض.",
      "No borrowing cost accounts — skipped.",
    );
  }
  const hasExpenditure = hasMappingHint(ctx, ["expenditure", "construction in progress", "مصروفات", "إنشاء تحت التنفيذ"]);
  if (!hasExpenditure) {
    return baseEval(
      rule, "advisory",
      "تأكد من بدء الرسملة عند توفر المصروفات وتكاليف الاقتراض والأنشطة (IAS 23.13).",
      "Ensure capitalisation commences when expenditures, borrowing costs, and activities are in progress (IAS 23.13).",
    );
  }
  return baseEval(
    rule, "pass",
    "شروط بدء الرسملة متوفرة.",
    "Capitalisation commencement conditions met.",
  );
}

/**
 * IAS 23.22 — Cease capitalisation when qualifying asset is substantially complete.
 */
export function handleCapitalisationCessation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasBorrowing = hasMappingHint(ctx, BORROWING_COST_HINTS);
  if (!hasBorrowing) {
    return baseEval(
      rule, "skipped",
      "لا بنود تكاليف اقتراض.",
      "No borrowing cost accounts — skipped.",
    );
  }
  const hasComplete = hasMappingHint(ctx, ["substantially complete", "ready for use", "completed", "مكتمل جوهرياً", "جاهز للاستخدام"]);
  if (hasComplete) {
    return baseEval(
      rule, "pass",
      "إيقاف الرسملة عند اكتمال الأصل المؤهل جوهرياً موثق.",
      "Capitalisation cessation on substantial completion of qualifying asset documented.",
    );
  }
  return baseEval(
    rule, "advisory",
      "تأكد من إيقاف الرسملة عند اكتمال الأصل المؤهل جوهرياً (IAS 23.22).",
      "Ensure capitalisation ceases when qualifying asset is substantially complete (IAS 23.22).",
  );
}
