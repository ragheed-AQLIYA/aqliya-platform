import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const IP_HINTS = [
  "investment property",
  "rental property",
  "capital appreciation",
  "property held for rental",
  "استثمار عقاري",
  "عقار استثماري",
  "إيجار",
  "عقارات مؤجرة",
];

const FAIR_VALUE_MODEL_HINTS = [
  "fair value model",
  "fvm",
  "fair value",
  "fvlm",
  "قيمة عادلة",
  "نموذج القيمة العادلة",
];

const COST_MODEL_HINTS = [
  "cost model",
  "depreciated cost",
  "carrying amount",
  "نموذج التكلفة",
  "تكلفة مستهلكة",
];

const IP_DISCLOSURE_HINTS = [
  "measurement policy",
  "valuation method",
  "fair value determination",
  "property type",
  "إفصاح عقاري",
  "سياسة القياس",
];

/**
 * IAS 40.5 — Investment property is held for rental or capital appreciation.
 */
export function handleIpDefinition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasIp = hasMappingHint(ctx, IP_HINTS);
  if (!hasIp) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود عقار استثماري — القاعدة غير قابلة للتطبيق.",
      "No investment property accounts — rule not applicable.",
    );
  }

  const hasPpe = hasMappingHint(ctx, ["property, plant", "ppe", "owner-occupied", "ممتلكات"]);
  if (hasPpe && !hasIp) {
    return baseEval(
      rule,
      "warning",
      "بنود ممتلكات موجودة. تأكد من تمييز العقار الاستثماري عن الممتلكات المستخدمة ذاتياً (IAS 40.5).",
      "PPE accounts present. Ensure investment property is distinguished from owner-occupied property (IAS 40.5).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "بنود العقار الاستثماري موجودة.",
    "Investment property accounts present.",
    ["balance_sheet"],
  );
}

/**
 * IAS 40.30 — Choose either fair value model or cost model consistently.
 */
export function handleIpMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasIp = hasMappingHint(ctx, IP_HINTS);
  if (!hasIp) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود عقار استثماري.",
      "No investment property accounts — skipped.",
    );
  }

  const hasFvm = hasMappingHint(ctx, FAIR_VALUE_MODEL_HINTS);
  const hasCostModel = hasMappingHint(ctx, COST_MODEL_HINTS);

  if (!hasFvm && !hasCostModel) {
    return baseEval(
      rule,
      "warning",
      "عقار استثماري بدون تحديد نموذج القياس (IAS 40.30). اختر إما نموذج القيمة العادلة أو نموذج التكلفة.",
      "Investment property without measurement model identification (IAS 40.30). Choose either fair value or cost model.",
      ["balance_sheet"],
    );
  }

  if (hasFvm && hasCostModel) {
    return baseEval(
      rule,
      "advisory",
      "كلا النموذجين موجود. تأكد من تطبيق نموذج واحد بشكل ثابت (IAS 40.30).",
      "Both models present. Ensure a single model is applied consistently (IAS 40.30).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "نموذج القياس محدد للعقار الاستثماري.",
    "Measurement model identified for investment property.",
    ["balance_sheet"],
  );
}

/**
 * IAS 40.55 — Under fair value model, changes in fair value in P&L.
 */
export function handleIpFairValue(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasIp = hasMappingHint(ctx, IP_HINTS);
  if (!hasIp) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود عقار استثماري.",
      "No investment property accounts — skipped.",
    );
  }

  const hasFvm = hasMappingHint(ctx, FAIR_VALUE_MODEL_HINTS);
  if (!hasFvm) {
    return baseEval(
      rule,
      "advisory",
      "عقار استثماري موجود. إذا تم استخدام نموذج القيمة العادلة، تأكد من الاعتراف بالتغيرات في الأرباح أو الخسائر (IAS 40.55).",
      "Investment property present. If fair value model is used, ensure fair value changes are recognised in P&L (IAS 40.55).",
    );
  }

  const hasGainLoss = hasMappingHint(ctx, [
    "fair value gain",
    "fair value loss",
    "fair value change",
    "revaluation",
    "ربح القيمة العادلة",
    "خسارة القيمة العادلة",
    "تغير القيمة",
  ]);
  if (!hasGainLoss) {
    return baseEval(
      rule,
      "warning",
      "نموذج القيمة العادلة محدد بدون حساب تغيرات القيمة العادلة (IAS 40.55).",
      "Fair value model identified without fair value change account (IAS 40.55).",
      ["income_statement"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "نموذج القيمة العادلة وحساب التغيرات موجود.",
    "Fair value model and change account present.",
    ["income_statement"],
  );
}

/**
 * IAS 40.75 — Disclose measurement model, basis, and amount.
 */
export function handleIpDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasIp = hasMappingHint(ctx, IP_HINTS);
  if (!hasIp) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود عقار استثماري.",
      "No investment property accounts — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, IP_DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "عقار استثماري بدون إفصاحات عن نموذج القياس وأساس التحديد (IAS 40.75).",
      "Investment property without measurement model and basis disclosures (IAS 40.75).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات العقار الاستثماري موجودة.",
    "Investment property disclosures present.",
  );
}
