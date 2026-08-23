import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const IMPAIRMENT_HINTS = [
  "impairment",
  "impairment loss",
  "write down",
  "خسارة",
  "تخفيض",
  "إهلاك",
];

const ASSET_HINTS = [
  "asset",
  "goodwill",
  "intangible",
  "ppe",
  "property",
  "plant",
  "equipment",
  "أصول",
  "أصل",
];

const REVERSAL_HINTS = [
  "reversal",
  "recover",
  "recovered",
  "استرداد",
  "عكس",
];

/**
 * IAS 36.9 — Assess at each reporting date whether there is any indication that an asset may be impaired.
 */
export function handleIndicatorAssessment(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasAssets = hasMappingHint(ctx, ASSET_HINTS);
  if (!hasAssets) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أصول — القاعدة غير قابلة للتطبيق.",
      "No asset accounts — rule not applicable.",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من تقييم مؤشرات الانخفاض في القيمة عند كل تاريخ إعداد القوائم المالية (IAS 36.9). تشمل المؤشرات: الانخفاض في القيمة السوقية، التغيرات في البيئة الاقتصادية، تجاوز صافي دخل الأصل للتوقعات.",
    "Ensure impairment indicators are assessed at each reporting date (IAS 36.9). Indicators include: decline in market value, changes in economic environment, net cash flows exceeding expectations.",
  );
}

/**
 * IAS 36.59 — Recoverable amount is the higher of fair value less costs of disposal and value in use.
 */
export function handleRecoverableAmount(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasAssets = hasMappingHint(ctx, ASSET_HINTS);
  const hasImpairment = hasMappingHint(ctx, IMPAIRMENT_HINTS);

  if (!hasAssets) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أصول.",
      "No asset accounts — skipped.",
    );
  }

  if (hasImpairment) {
    return baseEval(
      rule,
      "advisory",
      "تم الاعتراف بخسارة انخفاض في القيمة. تأكد من أن المبلغ القابل للاسترداد هو الأعلى من القيمة العادلة ناقص تكاليف البيع والقيمة في الاستخدام (IAS 36.59).",
      "Impairment loss recognised. Ensure recoverable amount is the higher of fair value less costs of disposal and value in use (IAS 36.59).",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من تحديد المبلغ القابل للاسترداد عند وجود مؤشرات الانخفاض (IAS 36.59).",
    "Ensure recoverable amount is determined when impairment indicators exist (IAS 36.59).",
  );
}

/**
 * IAS 36.104 — Impairment loss recognised immediately in P&L unless carried at revalued amount.
 */
export function handleImpairmentLoss(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasImpairment = hasMappingHint(ctx, IMPAIRMENT_HINTS);
  const hasAssets = hasMappingHint(ctx, ASSET_HINTS);

  if (!hasAssets) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أصول.",
      "No asset accounts — skipped.",
    );
  }

  if (hasImpairment) {
    return baseEval(
      rule,
      "pass",
      "خسارة انخفاض في القيمة معترف بها — تأكد من الاعتراف في الأرباح والخسائر (IAS 36.104).",
      "Impairment loss recognised — ensure it is recognised in profit or loss (IAS 36.104).",
      ["income_statement"],
    );
  }

  return baseEval(
    rule,
    "advisory",
    "لا يوجد اعتراف بخسارة انخفاض. تأكد من تقييم الحاجة للاعتراف بخسائر الانخفاض (IAS 36.104).",
    "No impairment loss recognised. Ensure need for impairment loss recognition is assessed (IAS 36.104).",
  );
}

/**
 * IAS 36.117 — Assess at each reporting date whether impairment loss may have decreased.
 */
export function handleReversal(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasImpairment = hasMappingHint(ctx, IMPAIRMENT_HINTS);
  const hasReversal = hasMappingHint(ctx, REVERSAL_HINTS);
  const hasAssets = hasMappingHint(ctx, ASSET_HINTS);

  if (!hasAssets) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أصول.",
      "No asset accounts — skipped.",
    );
  }

  if (hasImpairment && !hasReversal) {
    return baseEval(
      rule,
      "advisory",
      "خسائر انخفاض معترف بها بدون عكس. تأكد من تقييم ما إذا كان الانخفاض قد لا يكون موجوداً أو قد انخفض (IAS 36.117).",
      "Impairment losses recognised without reversal. Assess whether impairment may no longer exist or may have decreased (IAS 36.117).",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من تقييم عكس خسائر الانخفاض عند كل تاريخ إعداد القوائم المالية (IAS 36.117).",
    "Ensure reversal of impairment losses is assessed at each reporting date (IAS 36.117).",
  );
}
