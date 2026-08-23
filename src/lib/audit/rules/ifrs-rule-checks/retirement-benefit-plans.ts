import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const RETIREMENT_HINTS = [
  "retirement benefit plan",
  "retirement plan",
  "pension plan",
  "defined benefit",
  "defined contribution",
  "plan assets",
  "خطة مزايا التقاعد",
  "خطة معاشات",
  "مزايا محددة",
  "مساهمات محددة",
  "أصول الخطة",
];

const FAIR_VALUE_HINTS = [
  "fair value",
  "estimated value",
  "actuarial valuation",
  "قيمة عادلة",
  "تقييم اكتواري",
];

const OBLIGATION_HINTS = [
  "present obligation",
  "present value",
  "expected future payments",
  "actuarial",
  "الالتزام الحالي",
  "القيمة الحالية",
  "مدفوعات مستقبلية متوقعة",
];

const CONTRIBUTION_HINTS = [
  "contributions payable",
  "contribution payable",
  "prepaid contribution",
  "contributions prepaid",
  "employer contribution",
  "مساهمة",
  "مساهمات مستحقة",
  "مساهمات مدفوعة مقدماً",
];

const DISCLOSURE_HINTS = [
  "net assets available",
  "statement of changes",
  "accounting policies",
  "plan disclosure",
  "صافي الأصول المتاحة",
  "التغيرات في صافي الأصول",
  "السياسات المحاسبية",
];

/**
 * IAS 26.8 — Measure retirement benefit plan assets at fair value.
 */
export function handleRetirementPlanAssetMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRetirement = hasMappingHint(ctx, RETIREMENT_HINTS);
  if (!hasRetirement) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود خطط مزايا التقاعد — القاعدة غير قابلة للتطبيق.",
      "No retirement benefit plan accounts — rule not applicable.",
    );
  }

  const hasFv = hasMappingHint(ctx, FAIR_VALUE_HINTS);
  if (!hasFv) {
    return baseEval(
      rule,
      "warning",
      "أصول خطة التقاعد بدون قياس بالقيمة العادلة (IAS 26.8).",
      "Retirement plan assets without fair value measurement (IAS 26.8).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "أصول خطة التقاعد مقاسة بالقيمة العادلة.",
    "Retirement plan assets measured at fair value.",
    ["balance_sheet"],
  );
}

/**
 * IAS 26.18 — Measure defined benefit obligation using actuarial valuation.
 */
export function handleRetirementPlanObligationMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRetirement = hasMappingHint(ctx, RETIREMENT_HINTS);
  if (!hasRetirement) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود خطط مزايا التقاعد.",
      "No retirement benefit plan accounts — skipped.",
    );
  }

  const hasDefinedBenefit = hasMappingHint(ctx, ["defined benefit", "مزايا محددة"]);
  if (!hasDefinedBenefit) {
    return baseEval(
      rule,
      "skipped",
      "ليست خطة مزايا محددة — القاعدة غير قابلة للتطبيق.",
      "Not a defined benefit plan — rule not applicable.",
    );
  }

  const hasObligation = hasMappingHint(ctx, OBLIGATION_HINTS);
  if (!hasObligation) {
    return baseEval(
      rule,
      "warning",
      "خطة مزايا محددة بدون قياس الالتزام الحالي بالقيمة الحالية (IAS 26.18).",
      "Defined benefit plan without present value obligation measurement (IAS 26.18).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "التزام خطة المزايا المحددة مقاس بالقيمة الحالية باستخدام التقييم الاكتواري.",
    "Defined benefit plan obligation measured at present value using actuarial valuation.",
    ["balance_sheet"],
  );
}

/**
 * IAS 26.19 — Recognise contributions payable/prepaid for defined contribution plans.
 */
export function handleRetirementPlanContributionRecognition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRetirement = hasMappingHint(ctx, RETIREMENT_HINTS);
  if (!hasRetirement) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود خطط مزايا التقاعد.",
      "No retirement benefit plan accounts — skipped.",
    );
  }

  const hasDefinedContribution = hasMappingHint(ctx, ["defined contribution", "مساهمات محددة"]);
  if (!hasDefinedContribution) {
    return baseEval(
      rule,
      "skipped",
      "ليست خطة مساهمات محددة — القاعدة غير قابلة للتطبيق.",
      "Not a defined contribution plan — rule not applicable.",
    );
  }

  const hasContribution = hasMappingHint(ctx, CONTRIBUTION_HINTS);
  if (!hasContribution) {
    return baseEval(
      rule,
      "warning",
      "خطة مساهمات محددة بدون اعتراف بالمساهمات المستحقة/المدفوعة مقدماً (IAS 26.19).",
      "Defined contribution plan without recognition of payable/prepaid contributions (IAS 26.19).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "مساهمات خطة المساهمات المحددة معترف بها.",
    "Defined contribution plan contributions recognised.",
    ["balance_sheet"],
  );
}

/**
 * IAS 26.30 — Disclose statement of net assets, changes in net assets, and accounting policies.
 */
export function handleRetirementPlanDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRetirement = hasMappingHint(ctx, RETIREMENT_HINTS);
  if (!hasRetirement) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود خطط مزايا التقاعد.",
      "No retirement benefit plan accounts — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "خطة تقاعد بدون إفصاح عن صافي الأصول والتغيرات والسياسات المحاسبية (IAS 26.30).",
      "Retirement plan without net assets, changes, and accounting policies disclosure (IAS 26.30).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات خطة التقاعد موجودة.",
    "Retirement plan disclosures present.",
  );
}
