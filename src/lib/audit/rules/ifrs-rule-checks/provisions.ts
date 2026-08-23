import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const PROVISION_HINTS = [
  "provision",
  "provisions",
  "liability of uncertain timing",
  "liability of uncertain amount",
  "مخصص",
  "مخصصات",
  "التزام بتوقيت غير مؤكد",
];

const RECOGNITION_HINTS = [
  "obligation",
  "present obligation",
  "legal obligation",
  "constructive obligation",
  "outflow",
  "probable outflow",
  "التزام حالي",
  "التزام قانوني",
  "التزام ضمني",
  "تدفق محتمل",
];

const MEASUREMENT_HINTS = [
  "best estimate",
  "present value",
  "discount rate",
  "risk adjustment",
  "أفضل تقدير",
  "القيمة الحالية",
  "معدل خصم",
  "تعديل المخاطر",
];

const CONTINGENT_HINTS = [
  "contingent liability",
  "contingent asset",
  "possible obligation",
  "remote",
  "التزام محتمل",
  "أصل محتمل",
  "التزام ممكن",
  "بعيد",
];

/**
 * IAS 37.10 — Provision definition: present obligation from past event, probable outflow, reliable estimate.
 */
export function handleProvisionDefinition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasProvision = hasMappingHint(ctx, PROVISION_HINTS);
  if (!hasProvision) {
    return baseEval(
      rule, "skipped",
      "لا بنود مخصصات — القاعدة غير قابلة للتطبيق.",
      "No provision accounts — rule not applicable.",
    );
  }
  const hasObligation = hasMappingHint(ctx, RECOGNITION_HINTS);
  if (!hasObligation) {
    return baseEval(
      rule, "warning",
      "مخصصات موجودة بدون تحديد التزام حالي وتدفق محتمل (IAS 37.10).",
      "Provisions present without identifying present obligation and probable outflow (IAS 37.10).",
      ["balance_sheet"],
    );
  }
  return baseEval(
    rule, "pass",
    "تعريف المخصص متوافق مع IAS 37.10.",
    "Provision definition compliant with IAS 37.10.",
    ["balance_sheet"],
  );
}

/**
 * IAS 37.14 — Recognise provision when present obligation, probable outflow, and reliable estimate exist.
 */
export function handleProvisionRecognition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasProvision = hasMappingHint(ctx, PROVISION_HINTS);
  if (!hasProvision) {
    return baseEval(
      rule, "skipped",
      "لا بنود مخصصات.",
      "No provision accounts — skipped.",
    );
  }
  const hasObligation = hasMappingHint(ctx, RECOGNITION_HINTS);
  if (!hasObligation) {
    return baseEval(
      rule, "warning",
      "مخصص معترف به بدون توثيق التزام حالي وتدفق محتمل (IAS 37.14).",
      "Provision recognised without documenting present obligation and probable outflow (IAS 37.14).",
      ["balance_sheet"],
    );
  }
  return baseEval(
    rule, "pass",
    "معايير الاعتراف بالمخصص متوافرة.",
    "Provision recognition criteria met.",
    ["balance_sheet"],
  );
}

/**
 * IAS 37.36 — Measure provision at best estimate of expenditure to settle the obligation.
 */
export function handleProvisionMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasProvision = hasMappingHint(ctx, PROVISION_HINTS);
  if (!hasProvision) {
    return baseEval(
      rule, "skipped",
      "لا بنود مخصصات.",
      "No provision accounts — skipped.",
    );
  }
  const hasMeasurement = hasMappingHint(ctx, MEASUREMENT_HINTS);
  if (!hasMeasurement) {
    return baseEval(
      rule, "warning",
      "مخصص بدون قياس بأفضل تقدير/قيمة حالية (IAS 37.36).",
      "Provision without best estimate/present value measurement (IAS 37.36).",
      ["balance_sheet"],
    );
  }
  return baseEval(
    rule, "pass",
    "قياس المخصص بأفضل تقدير موثق.",
    "Provision measured at best estimate documented.",
    ["balance_sheet"],
  );
}

/**
 * IAS 37.27 — Do not recognise contingent liabilities; disclose unless probable.
 */
export function handleContingentLiability(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasContingent = hasMappingHint(ctx, CONTINGENT_HINTS);
  if (!hasContingent) {
    return baseEval(
      rule, "skipped",
      "لا بنود التزامات محتملة — القاعدة غير قابلة للتطبيق.",
      "No contingent liability accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "advisory",
      "التزام محتمل — تأكد من عدم الاعتراف به كمخصص والإفصاح عنه ما لم يكن احتمال التدفق بعيداً (IAS 37.27).",
      "Contingent liability — ensure not recognised as provision and disclosed unless outflow is remote (IAS 37.27).",
  );
}
