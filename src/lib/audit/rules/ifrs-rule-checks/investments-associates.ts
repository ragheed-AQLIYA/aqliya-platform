import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const ASSOCIATE_HINTS = [
  "investment in associate",
  "associate",
  "significant influence",
  "joint venture",
  "jointly controlled",
  "investment in joint venture",
  "استثمار في شركة شقيقة",
  "تأثير جوهري",
  "مشروع مشترك",
];

const EQUITY_METHOD_HINTS = [
  "equity method",
  "equity accounting",
  "share of profit",
  "share of loss",
  "share of associate",
  "طريقة حقوق الملكية",
  "حصة من الربح",
  "حصة من الخسارة",
];

const COST_HINTS = [
  "cost",
  "at cost",
  "initial cost",
  "تكلفة",
  "بالتكلفة",
];

const DISCLOSURE_HINTS = [
  "summarised financial",
  "significant judgement",
  "associate disclosure",
  "jv disclosure",
  "إفصاح عن الشركات الشقيقة",
  "معلومات مالية ملخصة",
];

/**
 * IAS 28.10 — Use equity method for investments in associates and JVs in consolidated FS.
 */
export function handleEquityMethodApplication(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasAssociate = hasMappingHint(ctx, ASSOCIATE_HINTS);
  if (!hasAssociate) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود استثمار في شركات شقيقة أو مشاريع مشتركة — القاعدة غير قابلة للتطبيق.",
      "No associate or JV investment accounts — rule not applicable.",
    );
  }

  const hasEquityMethod = hasMappingHint(ctx, EQUITY_METHOD_HINTS);
  if (!hasEquityMethod) {
    return baseEval(
      rule,
      "warning",
      "بنود استثمار في شركات شقيقة موجودة بدون طريقة حقوق الملكية (IAS 28.10).",
      "Associate investment accounts present without equity method (IAS 28.10).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "طريقة حقوق الملكية مطبقة على الاستثمارات في الشركات الشقيقة والمشاريع المشتركة.",
    "Equity method applied to associate and JV investments.",
    ["balance_sheet"],
  );
}

/**
 * IAS 28.24 — Initial recognition at cost, adjusted for share of profit/loss.
 */
export function handleEquityMethodInitialRecognition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasAssociate = hasMappingHint(ctx, ASSOCIATE_HINTS);
  if (!hasAssociate) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود استثمار في شركات شقيقة.",
      "No associate investment accounts — skipped.",
    );
  }

  const hasCost = hasMappingHint(ctx, COST_HINTS);
  const hasShareProfit = hasMappingHint(ctx, ["share of profit", "share of loss", "حصة من الربح", "حصة من الخسارة"]);

  if (!hasCost && !hasShareProfit) {
    return baseEval(
      rule,
      "warning",
      "استثمار في شركة شقيقة بدون تحديد التكلفة الأولية أو حصة الربح/الخسارة (IAS 28.24).",
      "Associate investment without initial cost or share of profit/loss (IAS 28.24).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "الاعتراف الأولي بحقوق الملكية محدد.",
    "Equity method initial recognition identified.",
    ["balance_sheet"],
  );
}

/**
 * IAS 28.38 — Discontinue equity method when investment ceases to be associate/JV.
 */
export function handleEquityMethodCessation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasAssociate = hasMappingHint(ctx, ASSOCIATE_HINTS);
  if (!hasAssociate) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود استثمار في شركات شقيقة.",
      "No associate investment accounts — skipped.",
    );
  }

  const hasFvTransition = hasMappingHint(ctx, ["fair value", "ifrs 9", "reclassification", "قيمة عادلة", "إعادة تصنيف"]);
  if (hasFvTransition) {
    return baseEval(
      rule,
      "advisory",
      "إعادة تصنيف استثمار في شركة شقيقة إلى IFRS 9 — تأكد من التوقف عن طريقة حقوق الملكية (IAS 28.38).",
      "Associate investment reclassification to IFRS 9 — ensure equity method is discontinued (IAS 28.38).",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من التوقف عن طريقة حقوق الملكية عند زوال التأثير الجوهري أو السيطرة المشتركة (IAS 28.38).",
    "Ensure equity method is discontinued when significant influence or joint control ceases (IAS 28.38).",
  );
}

/**
 * IAS 28.50 — Disclose significant judgements and summarised financial information.
 */
export function handleEquityMethodDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasAssociate = hasMappingHint(ctx, ASSOCIATE_HINTS);
  if (!hasAssociate) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود استثمار في شركات شقيقة.",
      "No associate investment accounts — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "استثمار في شركات شقيقة بدون إفصاح عن الأحكام الجوهرية والمعلومات المالية الملخصة (IAS 28.50).",
      "Associate investments without significant judgement and summarised financial info disclosure (IAS 28.50).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات الاستثمار في الشركات الشقيقة موجودة.",
    "Associate investment disclosures present.",
  );
}
