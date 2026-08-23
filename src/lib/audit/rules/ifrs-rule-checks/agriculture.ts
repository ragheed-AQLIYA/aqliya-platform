import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const BIOLOGICAL_HINTS = [
  "biological asset",
  "biological assets",
  "livestock",
  "crops",
  "plants",
  "agricultural",
  "أصول بيولوجية",
  "ثروة حيوانية",
  "محاصيل",
  "زراعي",
];

const FAIR_VALUE_HINTS = [
  "fair value",
  "fair value less costs to sell",
  "قيمة عادلة",
  "قيمة عادلة ناقصة تكاليف البيع",
];

const PRODUCE_HINTS = [
  "agricultural produce",
  "harvest",
  "produce",
  "at harvest",
  "منتج زراعي",
  "محصول",
  "حصاد",
];

const DISCLOSURE_HINTS = [
  "biological asset disclosure",
  "gain or loss",
  "fair value change",
  "agricultural disclosure",
  "إفصاح عن الأصول البيولوجية",
  "ربح أو خسارة",
  "تغير القيمة العادلة",
];

/**
 * IAS 41.12 — Recognise biological asset when control, probable benefits, and reliable measurement exist.
 */
export function handleBiologicalAssetRecognition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasBiological = hasMappingHint(ctx, BIOLOGICAL_HINTS);
  if (!hasBiological) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أصول بيولوجية — القاعدة غير قابلة للتطبيق.",
      "No biological asset accounts — rule not applicable.",
    );
  }

  const hasFairValue = hasMappingHint(ctx, FAIR_VALUE_HINTS);
  if (!hasFairValue) {
    return baseEval(
      rule,
      "warning",
      "أصول بيولوجية موجودة بدون قياس بالقيمة العادلة (IAS 41.12).",
      "Biological assets present without fair value measurement (IAS 41.12).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "الأصول البيولوجية معترف بها ومقاسة بالقيمة العادلة.",
    "Biological assets recognised and measured at fair value.",
    ["balance_sheet"],
  );
}

/**
 * IAS 41.13 — Measure biological assets at fair value less costs to sell.
 */
export function handleBiologicalAssetMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasBiological = hasMappingHint(ctx, BIOLOGICAL_HINTS);
  if (!hasBiological) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أصول بيولوجية.",
      "No biological asset accounts — skipped.",
    );
  }

  const hasFvLessCosts = hasMappingHint(ctx, ["fair value less costs to sell", "قيمة عادلة ناقصة تكاليف البيع"]);
  const hasFv = hasMappingHint(ctx, FAIR_VALUE_HINTS);

  if (!hasFv) {
    return baseEval(
      rule,
      "warning",
      "أصول بيولوجية بدون تحديد القيمة العادلة ناقصة تكاليف البيع (IAS 41.13).",
      "Biological assets without fair value less costs to sell (IAS 41.13).",
      ["balance_sheet"],
    );
  }

  if (!hasFvLessCosts) {
    return baseEval(
      rule,
      "advisory",
      "تأكد من أن الأصول البيولوجية مقاسة بالقيمة العادلة ناقصة تكاليف البيع (IAS 41.13).",
      "Ensure biological assets are measured at fair value less costs to sell (IAS 41.13).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "الأصول البيولوجية مقاسة بالقيمة العادلة ناقصة تكاليف البيع.",
    "Biological assets measured at fair value less costs to sell.",
    ["balance_sheet"],
  );
}

/**
 * IAS 41.13 — Measure agricultural produce at fair value less costs to sell at harvest.
 */
export function handleAgriculturalProduceMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasProduce = hasMappingHint(ctx, PRODUCE_HINTS);
  if (!hasProduce) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود منتجات زراعية — القاعدة غير قابلة للتطبيق.",
      "No agricultural produce accounts — rule not applicable.",
    );
  }

  const hasFv = hasMappingHint(ctx, FAIR_VALUE_HINTS);
  if (!hasFv) {
    return baseEval(
      rule,
      "warning",
      "منتجات زراعية بدون قياس بالقيمة العادلة عند الحصاد (IAS 41.13).",
      "Agricultural produce without fair value measurement at harvest (IAS 41.13).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "المنتجات الزراعية مقاسة بالقيمة العادلة ناقصة تكاليف البيع عند الحصاد.",
    "Agricultural produce measured at fair value less costs to sell at harvest.",
    ["balance_sheet"],
  );
}

/**
 * IAS 41.40 — Disclose gain/loss from initial recognition and changes in fair value of biological assets.
 */
export function handleAgriculturalDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasBiological = hasMappingHint(ctx, BIOLOGICAL_HINTS);
  if (!hasBiological) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أصول بيولوجية.",
      "No biological asset accounts — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "أصول بيولوجية بدون إفصاح عن الربح/الخسارة وتغير القيمة العادلة (IAS 41.40).",
      "Biological assets without gain/loss and fair value change disclosure (IAS 41.40).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات الأصول البيولوجية موجودة.",
    "Biological asset disclosures present.",
  );
}
