import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const TAX_HINTS = [
  "tax",
  "zakat",
  "ضريبة",
  "زكاة",
];

const CURRENT_TAX_HINTS = [
  "tax payable",
  "current tax",
  "income tax payable",
  "ضريبة مستحقة",
  "ضريبة حالية",
];

const DEFERRED_TAX_LIAB_HINTS = [
  "deferred tax liability",
  "deferred tax",
  "ضريبة مؤجلة",
];

const DEFERRED_TAX_ASSET_HINTS = [
  "deferred tax asset",
  "dta",
  "أصل ضريبي مؤجل",
];

const TAX_EXPENSE_HINTS = [
  "tax expense",
  "income tax expense",
  "tax charge",
  "ضريبة الدخل",
  "مصروف ضريبي",
];

/**
 * IAS 12.15 — Recognise current tax liability for tax payable on taxable profit.
 */
export function handleCurrentTaxLiability(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasTax = hasMappingHint(ctx, TAX_HINTS);
  if (!hasTax) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود ضريبية — القاعدة غير قابلة للتطبيق.",
      "No tax accounts — rule not applicable.",
    );
  }

  const hasCurrentTax = hasMappingHint(ctx, CURRENT_TAX_HINTS);
  if (!hasCurrentTax) {
    return baseEval(
      rule,
      "warning",
      "بنود ضريبية موجودة بدون التزام ضريبي حالي معيّن. تأكد من الاعتراف بالالتزام الضريبي الحالي (IAS 12.15).",
      "Tax accounts present without current tax liability mapping. Ensure current tax liability is recognised (IAS 12.15).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "الالتزام الضريبي الحالي معيّن — راجع IAS 12.15.",
    "Current tax liability mapped — review IAS 12.15.",
    ["balance_sheet"],
  );
}

/**
 * IAS 12.24 — Recognise deferred tax liability for taxable temporary differences.
 */
export function handleDeferredTaxLiability(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasTax = hasMappingHint(ctx, TAX_HINTS);
  if (!hasTax) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود ضريبية.",
      "No tax accounts — skipped.",
    );
  }

  const hasDeferredLiab = hasMappingHint(ctx, DEFERRED_TAX_LIAB_HINTS);
  if (!hasDeferredLiab) {
    return baseEval(
      rule,
      "warning",
      "بنود ضريبية موجودة بدون التزام ضريبي مؤجل. تأكد من الاعتراف بالالتزامات الضريبية المؤجلة للفروق المؤقتة الخاضعة للضريبة (IAS 12.24).",
      "Tax accounts present without deferred tax liability. Ensure deferred tax liabilities are recognised for taxable temporary differences (IAS 12.24).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "الالتزام الضريبي المؤجل معيّن — راجع IAS 12.24.",
    "Deferred tax liability mapped — review IAS 12.24.",
    ["balance_sheet"],
  );
}

/**
 * IAS 12.34 — Recognise deferred tax asset for deductible temporary differences.
 */
export function handleDeferredTaxAsset(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasTax = hasMappingHint(ctx, TAX_HINTS);
  if (!hasTax) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود ضريبية.",
      "No tax accounts — skipped.",
    );
  }

  const hasDeferredAsset = hasMappingHint(ctx, DEFERRED_TAX_ASSET_HINTS);
  if (!hasDeferredAsset) {
    return baseEval(
      rule,
      "advisory",
      "بنود ضريبية موجودة بدون أصل ضريبي مؤجل. تأكد من الاعتراف بالأصول الضريبية المؤجلة للفروق المؤقتة القابلة للخصم (IAS 12.34).",
      "Tax accounts present without deferred tax asset. Ensure deferred tax assets are recognised for deductible temporary differences (IAS 12.34).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "الأصل الضريبي المؤجل معيّن — راجع IAS 12.34.",
    "Deferred tax asset mapped — review IAS 12.34.",
    ["balance_sheet"],
  );
}

/**
 * IAS 12.46 — Tax expense recognised in P&L except for OCI/equity items.
 */
export function handleTaxExpenseRecognition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasTax = hasMappingHint(ctx, TAX_HINTS);
  if (!hasTax) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود ضريبية.",
      "No tax accounts — skipped.",
    );
  }

  const hasTaxExpense = hasMappingHint(ctx, TAX_EXPENSE_HINTS);
  if (!hasTaxExpense) {
    return baseEval(
      rule,
      "warning",
      "بنود ضريبية موجودة بدون مصروف ضريبي في قائمة الدخل. تأكد من الاعتراف بمصروف الضريبة في الأرباح والخسائر (IAS 12.46).",
      "Tax accounts present without tax expense in P&L. Ensure tax expense is recognised in profit or loss (IAS 12.46).",
      ["income_statement"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "مصروف الضريبة معيّن في قائمة الدخل — راجع IAS 12.46.",
    "Tax expense mapped in income statement — review IAS 12.46.",
    ["income_statement"],
  );
}

/**
 * IAS 12.51 — Deferred tax measured at enacted or substantively enacted rates.
 */
export function handleTaxRateMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasTax = hasMappingHint(ctx, TAX_HINTS);
  if (!hasTax) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود ضريبية.",
      "No tax accounts — skipped.",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من قياس الضرائب المؤجلة بمعدلات الضرائب المقررة أو المُقررة فعلياً (IAS 12.51).",
    "Ensure deferred tax is measured at enacted or substantively enacted tax rates (IAS 12.51).",
  );
}

/**
 * IAS 12.74 — Offset current tax assets and liabilities only with legally enforceable right.
 */
export function handleTaxOffsetting(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasTax = hasMappingHint(ctx, TAX_HINTS);
  if (!hasTax) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود ضريبية.",
      "No tax accounts — skipped.",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من عدم مقاصة الأصول والالتزامات الضريبية إلا بوجود حق قانوني قابل للتنفيذ (IAS 12.74).",
    "Ensure current tax assets and liabilities are offset only with legally enforceable right (IAS 12.74).",
  );
}
