import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const INSURANCE_HINTS = [
  "insurance contract",
  "insurance liability",
  "insurance service",
  "ifrs 17",
  "insurance revenue",
  "insurance expense",
  "عقد تأمين",
  "التزامات تأمين",
  "خدمة تأمين",
  "إيراد تأمين",
];

const GENERAL_MODEL_HINTS = [
  "general model",
  "building block approach",
  "fulfilment cash flow",
  "risk adjustment",
  "discount rate",
  "النموذج العام",
  "نهج الكتل البنائية",
  "التدفقات النقدية للوفاء",
];

const RECOGNITION_HINTS = [
  "insurance liability recognition",
  "group of contracts",
  "initial recognition",
  "الاعتراف بالتزامات التأمين",
  "مجموعة عقود",
];

const REVENUE_SEPARATION_HINTS = [
  "insurance service revenue",
  "separation of components",
  "investment component",
  "embedded derivative",
  "إيراد خدمة التأمين",
  "فصل المكونات",
  "مكون استثماري",
];

/**
 * IFRS 17.3 — Scope: insurance contracts, reinsurance contracts, and investment contracts with discretionary participation features.
 */
export function handleInsuranceContractScope(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInsurance = hasMappingHint(ctx, INSURANCE_HINTS);
  if (!hasInsurance) {
    return baseEval(
      rule, "skipped",
      "لا بنود عقود تأمين ضمن نطاق IFRS 17 — القاعدة غير قابلة للتطبيق.",
      "No insurance contract accounts within IFRS 17 scope — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "عقود التأمين ضمن نطاق IFRS 17 محددة.",
    "Insurance contracts within IFRS 17 scope identified.",
  );
}

/**
 * IFRS 17.16 — Measure insurance liabilities using general model (building block approach).
 */
export function handleGeneralModel(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInsurance = hasMappingHint(ctx, INSURANCE_HINTS);
  if (!hasInsurance) {
    return baseEval(
      rule, "skipped",
      "لا بنود عقود تأمين.",
      "No insurance contract accounts — skipped.",
    );
  }
  const hasGeneralModel = hasMappingHint(ctx, GENERAL_MODEL_HINTS);
  if (!hasGeneralModel) {
    return baseEval(
      rule, "warning",
      "عقود تأمين بدون استخدام النموذج العام (بناء الكتل) لقياس الالتزامات (IFRS 17.16).",
      "Insurance contracts without general model (building block) for liability measurement (IFRS 17.16).",
      ["balance_sheet"],
    );
  }
  return baseEval(
    rule, "pass",
    "النموذج العام مطبق لقياس التزامات التأمين.",
    "General model applied for insurance liability measurement.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 17.32 — Recognise insurance liabilities at group level from initial recognition.
 */
export function handleInsuranceRecognition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInsurance = hasMappingHint(ctx, INSURANCE_HINTS);
  if (!hasInsurance) {
    return baseEval(
      rule, "skipped",
      "لا بنود عقود تأمين.",
      "No insurance contract accounts — skipped.",
    );
  }
  const hasGroup = hasMappingHint(ctx, RECOGNITION_HINTS);
  if (!hasGroup) {
    return baseEval(
      rule, "warning",
      "عقود تأمين بدون الاعتراف على مستوى المجموعة من تاريخ الاعتراف الأولي (IFRS 17.32).",
      "Insurance contracts without group-level recognition from initial recognition (IFRS 17.32).",
    );
  }
  return baseEval(
    rule, "pass",
    "الاعتراف بالتزامات التأمين على مستوى المجموعة موثق.",
    "Insurance liability recognition at group level documented.",
  );
}

/**
 * IFRS 17.45 — Separate insurance service revenue from investment component and embedded derivatives.
 */
export function handleRevenueSeparation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInsurance = hasMappingHint(ctx, INSURANCE_HINTS);
  if (!hasInsurance) {
    return baseEval(
      rule, "skipped",
      "لا بنود عقود تأمين.",
      "No insurance contract accounts — skipped.",
    )
  }
  const hasSeparation = hasMappingHint(ctx, REVENUE_SEPARATION_HINTS)
  if (!hasSeparation) {
    return baseEval(
      rule, "warning",
      "عقود تأمين بدون فصل إيراد خدمة التأمين عن المكون الاستثماري والمشتقات المضمّنة (IFRS 17.45).",
      "Insurance contracts without separation of service revenue from investment component and embedded derivatives (IFRS 17.45).",
      ["income_statement"],
    )
  }
  return baseEval(
    rule, "pass",
    "فصل إيراد خدمة التأمين موثق.",
    "Insurance service revenue separation documented.",
    ["income_statement"],
  )
}
