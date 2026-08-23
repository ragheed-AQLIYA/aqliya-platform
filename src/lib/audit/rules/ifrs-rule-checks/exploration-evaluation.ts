import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const EXPLORATION_HINTS = [
  "exploration",
  "evaluation",
  "mineral resources",
  "exploration and evaluation",
  "mining",
  "drilling",
  "تنقيب",
  "تقييم",
  "موارد معدنية",
  "تعدين",
];

const COST_HINTS = [
  "cost",
  "at cost",
  "carrying amount",
  "تكلفة",
  "بالتكلفة",
];

const CLASSIFICATION_HINTS = [
  "tangible",
  "intangible",
  "classification",
  "ملموس",
  "غير ملموس",
  "تصنيف",
];

const IMPAIRMENT_HINTS = [
  "impairment",
  "impairment test",
  "recoverable amount",
  "indicators",
  "facts and circumstances",
  "ضياع القيمة",
  "اختبار الضياع",
];

const DISCLOSURE_HINTS = [
  "exploration disclosure",
  "evaluation disclosure",
  "mineral resource disclosure",
  "إفصاح عن التنقيب",
  "إفصاح عن التقييم",
];

/**
 * IFRS 6.12 — Measure exploration and evaluation assets at cost less accumulated depreciation and impairment.
 */
export function handleExplorationEvaluationMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasExploration = hasMappingHint(ctx, EXPLORATION_HINTS);
  if (!hasExploration) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود تنقيب وتقييم موارد معدنية — القاعدة غير قابلة للتطبيق.",
      "No exploration and evaluation accounts — rule not applicable.",
    );
  }

  const hasCost = hasMappingHint(ctx, COST_HINTS);
  if (!hasCost) {
    return baseEval(
      rule,
      "warning",
      "أصول تنقيب وتقييم موجودة بدون قياس بالتكلفة (IFRS 6.12).",
      "Exploration and evaluation assets present without cost measurement (IFRS 6.12).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "أصول التنقيب والتقييم مقاسة بالتكلفة.",
    "Exploration and evaluation assets measured at cost.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 6.13 — Classify exploration and evaluation assets as tangible or intangible consistently.
 */
export function handleExplorationEvaluationClassification(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasExploration = hasMappingHint(ctx, EXPLORATION_HINTS);
  if (!hasExploration) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود تنقيب وتقييم.",
      "No exploration and evaluation accounts — skipped.",
    );
  }

  const hasClassification = hasMappingHint(ctx, CLASSIFICATION_HINTS);
  if (!hasClassification) {
    return baseEval(
      rule,
      "warning",
      "أصول تنقيب وتقييم بدون تصنيف ملموس/غير ملموس (IFRS 6.13).",
      "Exploration and evaluation assets without tangible/intangible classification (IFRS 6.13).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "تصنيف أصول التنقيب والتقييم ملموس/غير ملموس مطبق.",
    "Tangible/intangible classification for exploration and evaluation assets applied.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 6.20 — Test exploration and evaluation assets for impairment when indicators exist.
 */
export function handleExplorationEvaluationImpairment(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasExploration = hasMappingHint(ctx, EXPLORATION_HINTS);
  if (!hasExploration) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود تنقيب وتقييم.",
      "No exploration and evaluation accounts — skipped.",
    );
  }

  const hasImpairment = hasMappingHint(ctx, IMPAIRMENT_HINTS);
  if (!hasImpairment) {
    return baseEval(
      rule,
      "advisory",
      "تأكد من اختبار أصول التنقيب والتقييم للضياع عند وجود مؤشرات (IFRS 6.20).",
      "Ensure exploration and evaluation assets are tested for impairment when indicators exist (IFRS 6.20).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "اختبار الضياع لأصول التنقيب والتقييم موثق.",
    "Impairment testing for exploration and evaluation assets documented.",
  );
}

/**
 * IFRS 6.23 — Disclose amounts recognised from exploration and evaluation of mineral resources.
 */
export function handleExplorationEvaluationDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasExploration = hasMappingHint(ctx, EXPLORATION_HINTS);
  if (!hasExploration) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود تنقيب وتقييم.",
      "No exploration and evaluation accounts — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "أصول تنقيب وتقييم بدون إفصاح عن المبالغ المعترف بها (IFRS 6.23).",
      "Exploration and evaluation assets without disclosure of recognised amounts (IFRS 6.23).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات التنقيب والتقييم موجودة.",
    "Exploration and evaluation disclosures present.",
  );
}
