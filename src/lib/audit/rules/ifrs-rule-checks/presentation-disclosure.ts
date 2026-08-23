import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const PROFIT_HINTS = [
  "profit",
  "net income",
  "profit or loss",
  "ربح",
  "صافي الدخل",
];

const OPERATING_HINTS = [
  "operating",
  "operating expense",
  "operating income",
  "تشغيلي",
  "إيرادات تشغيلية",
  "مصاريف تشغيلية",
];

const INVESTING_HINTS = [
  "investing",
  "investment income",
  "interest income",
  "dividend",
  "استثماري",
  "إيرادات استثمار",
];

const FINANCING_HINTS = [
  "financing",
  "interest expense",
  "borrowing cost",
  "finance cost",
  "تمويلي",
  "تكلفة التمويل",
];

const MPM_HINTS = [
  "management-defined",
  "mpm",
  "alternative performance",
  "adjusted ebitda",
  "adjusted profit",
  "مقياس الأداء",
  "مقياس مخصص",
];

const EXPENSE_NATURE_HINTS = [
  "depreciation",
  "amortisation",
  "employee benefit",
  "raw material",
  "impairment",
  "إهلاك",
  "إهلاك شهرة",
  "مزايا الموظفين",
  "مواد خام",
];

const EXPENSE_FUNCTION_HINTS = [
  "cost of sales",
  "cogs",
  "selling expense",
  "administrative expense",
  "general expense",
  "تكلفة المبيعات",
  "مصاريف بيع",
  "مصاريف إدارية",
];

/**
 * IFRS 18.14 — Classify income and expenses into operating, investing, and financing categories.
 */
export function handleIncomeExpenseCategorisation(
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

  const hasOperating = hasMappingHint(ctx, OPERATING_HINTS);
  const hasInvesting = hasMappingHint(ctx, INVESTING_HINTS);
  const hasFinancing = hasMappingHint(ctx, FINANCING_HINTS);

  if (!hasOperating && !hasInvesting && !hasFinancing) {
    return baseEval(
      rule,
      "warning",
      "بنود أرباح موجودة بدون تصنيف إلى فئات (تشغيلي، استثماري، تمويلي) — راجع IFRS 18.14.",
      "Profit accounts present without category classification (operating, investing, financing) — review IFRS 18.14.",
      ["income_statement"],
    );
  }

  if (hasOperating && hasInvesting && hasFinancing) {
    return baseEval(
      rule,
      "pass",
      "تصنيف الإيرادات والمصاريف إلى فئات تشغيلي/استثماري/تمويلي موجود.",
      "Income and expense categorisation into operating/investing/financing present.",
      ["income_statement"],
    );
  }

  return baseEval(
    rule,
    "advisory",
      "بعض الفئات موجودة. تأكد من التصنيف الكامل إلى تشغيلي/استثماري/تمويلي (IFRS 18.14).",
      "Some categories present. Ensure full classification into operating/investing/financing (IFRS 18.14).",
    ["income_statement"],
  );
}

/**
 * IFRS 18.23 — Present operating expense category by nature or function.
 */
export function handleOperatingExpenseClassification(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasOperating = hasMappingHint(ctx, OPERATING_HINTS);
  if (!hasOperating) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود مصاريف تشغيلية — القاعدة غير قابلة للتطبيق.",
      "No operating expense accounts — rule not applicable.",
    );
  }

  const hasNature = hasMappingHint(ctx, EXPENSE_NATURE_HINTS);
  const hasFunction = hasMappingHint(ctx, EXPENSE_FUNCTION_HINTS);

  if (!hasNature && !hasFunction) {
    return baseEval(
      rule,
      "warning",
      "مصاريف تشغيلية موجودة بدون تصنيف حسب الطبيعة أو الوظيفة (IFRS 18.23).",
      "Operating expenses present without classification by nature or function (IFRS 18.23).",
      ["income_statement"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "تصنيف المصاريف التشغيلية حسب الطبيعة أو الوظيفة موجود.",
    "Operating expense classification by nature or function present.",
    ["income_statement"],
  );
}

/**
 * IFRS 18.50 — Disclose significant management-defined performance measures (MPMs).
 */
export function handleMpmDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasMpm = hasMappingHint(ctx, MPM_HINTS);
  if (!hasMpm) {
    return baseEval(
      rule,
      "skipped",
      "لا مقاييس أداء مُعرّفة من الإدارة (MPM) — القاعدة غير قابلة للتطبيق.",
      "No management-defined performance measures — rule not applicable.",
    );
  }

  if (ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "مقاييس أداء مُعرّفة من الإدارة موجودة بدون إفصاح (IFRS 18.50).",
      "MPMs present without disclosure (IFRS 18.50).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات مقاييس الأداء المُعرّفة من الإدارة موجودة.",
    "MPM disclosures present.",
  );
}

/**
 * IFRS 18.60 — Disclose significant operating expenses by nature and disaggregation.
 */
export function handleExpenseDisaggregation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasOperating = hasMappingHint(ctx, OPERATING_HINTS);
  if (!hasOperating) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود مصاريف تشغيلية.",
      "No operating expense accounts — skipped.",
    );
  }

  const hasNature = hasMappingHint(ctx, EXPENSE_NATURE_HINTS);
  if (!hasNature && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "مصاريف تشغيلية بدون تفصيل حسب الطبيعة (IFRS 18.60).",
      "Operating expenses without disaggregation by nature (IFRS 18.60).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "تفصيل المصاريف التشغيلية حسب الطبيعة موجود.",
    "Operating expense disaggregation by nature present.",
  );
}
