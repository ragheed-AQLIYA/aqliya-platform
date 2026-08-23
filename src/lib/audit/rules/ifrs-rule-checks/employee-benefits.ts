import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const EMPLOYEE_BENEFIT_HINTS = [
  "employee benefit",
  "employee benefits",
  "pension",
  "post-employment",
  "defined benefit",
  "defined contribution",
  "short-term benefit",
  "long-term benefit",
  "مزايا الموظفين",
  "معاش",
  "مزايا بعد التوظيف",
  "مزايا محددة",
  "مساهمات محددة",
];

const SHORT_TERM_HINTS = [
  "short-term benefit",
  "wages",
  "salaries",
  "annual leave",
  "bonus",
  "مزايا قصيرة الأجل",
  "رواتب",
  "إجازة سنوية",
  "مكافأة",
];

const DEFINED_BENEFIT_HINTS = [
  "defined benefit",
  "benefit obligation",
  "plan assets",
  "actuarial",
  "net interest",
  "service cost",
  "مزايا محددة",
  "التزام المزايا",
  "أصول الخطة",
  "اكتواري",
];

const PUC_HINTS = [
  "projected unit credit",
  "puc method",
  "current service cost",
  "past service cost",
  "طريقة الوحدات المتوقعة",
  "تكلفة الخدمة الحالية",
];

/**
 * IAS 19.4 — Scope: employee benefits including short-term, post-employment, and termination benefits.
 */
export function handleEmployeeBenefitScope(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasBenefits = hasMappingHint(ctx, EMPLOYEE_BENEFIT_HINTS);
  if (!hasBenefits) {
    return baseEval(
      rule, "skipped",
      "لا بنود مزايا الموظفين — القاعدة غير قابلة للتطبيق.",
      "No employee benefit accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "بنود مزايا الموظفين موجودة ضمن نطاق IAS 19.",
    "Employee benefit accounts present within IAS 19 scope.",
  );
}

/**
 * IAS 19.11 — Recognise short-term employee benefits as expense when service is rendered.
 */
export function handleShortTermBenefits(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasShortTerm = hasMappingHint(ctx, SHORT_TERM_HINTS);
  const hasBenefits = hasMappingHint(ctx, EMPLOYEE_BENEFIT_HINTS);
  if (!hasShortTerm && !hasBenefits) {
    return baseEval(
      rule, "skipped",
      "لا بنود مزايا قصيرة الأجل.",
      "No short-term employee benefit accounts — skipped.",
    );
  }
  if (!hasShortTerm) {
    return baseEval(
      rule, "advisory",
      "تأكد من الاعتراف بالمزايا قصيرة الأجل كمصروف عند تقديم الخدمة (IAS 19.11).",
      "Ensure short-term benefits are recognised as expense when service is rendered (IAS 19.11).",
      ["income_statement"],
    );
  }
  return baseEval(
    rule, "pass",
    "المزايا قصيرة الأجل معترف بها كمصروف.",
    "Short-term employee benefits recognised as expense.",
    ["income_statement"],
  );
}

/**
 * IAS 19.54 — Measure defined benefit obligation using projected unit credit method.
 */
export function handleDefinedBenefit(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasDefinedBenefit = hasMappingHint(ctx, DEFINED_BENEFIT_HINTS);
  if (!hasDefinedBenefit) {
    return baseEval(
      rule, "skipped",
      "لا بنود مزايا محددة — القاعدة غير قابلة للتطبيق.",
      "No defined benefit plan accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "خطة المزايا المحددة موجودة ومحددة.",
    "Defined benefit plan identified and present.",
    ["balance_sheet"],
  );
}

/**
 * IAS 19.67 — Use projected unit credit method to measure present obligation.
 */
export function handlePucMethod(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasDefinedBenefit = hasMappingHint(ctx, DEFINED_BENEFIT_HINTS);
  if (!hasDefinedBenefit) {
    return baseEval(
      rule, "skipped",
      "لا بنود مزايا محددة.",
      "No defined benefit plan accounts — skipped.",
    );
  }
  const hasPuc = hasMappingHint(ctx, PUC_HINTS);
  if (!hasPuc) {
    return baseEval(
      rule, "warning",
      "خطة مزايا محددة بدون استخدام طريقة الوحدات المتوقعة (IAS 19.67).",
      "Defined benefit plan without projected unit credit method (IAS 19.67).",
      ["balance_sheet"],
    );
  }
  return baseEval(
    rule, "pass",
    "طريقة الوحدات المتوقعة المستخدمة لقياس الالتزام.",
    "Projected unit credit method used to measure obligation.",
    ["balance_sheet"],
  );
}
