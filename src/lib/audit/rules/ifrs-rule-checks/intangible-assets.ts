import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const INTANGIBLE_HINTS = [
  "intangible",
  "intangible asset",
  "goodwill",
  "patent",
  "trademark",
  "copyright",
  "software",
  "licence",
  "brand",
  "research and development",
  "rd",
  "أصول غير ملموسة",
  "شهرة",
  "براءة اختراع",
  "علامة تجارية",
  "حقوق نشر",
  "برمجيات",
  "ترخيص",
];

const RECOGNITION_HINTS = [
  "identifiable",
  "non-monetary",
  "without physical substance",
  "controlled",
  "future economic benefit",
  "قابل للتحديد",
  "غير نقدي",
  "بدون جوهر مادي",
  "منضبط",
  "منافع اقتصادية مستقبلية",
];

const EXPENSE_HINTS = [
  "research",
  "research expense",
  "r&d expense",
  "expensed",
  "بحوث",
  "مصاريف بحث وتطوير",
  "محمّلة على المصاريف",
];

const CAPITALISE_HINTS = [
  "development",
  "development cost",
  "capitalised",
  "capitalised development",
  "تطوير",
  "تكاليف تطوير",
  "مرسملة",
];

const AMORTISATION_HINTS = [
  "amortisation",
  "amortization",
  "useful life",
  "finite life",
  "indefinite life",
  "إهلاك",
  "عمر مفيد",
  "عمر محدود",
  "عير محدود",
];

/**
 * IAS 38.21 — Recognition criteria for intangible assets.
 */
export function handleIntangibleRecognition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasIntangible = hasMappingHint(ctx, INTANGIBLE_HINTS);
  if (!hasIntangible) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أصول غير ملموسة — القاعدة غير قابلة للتطبيق.",
      "No intangible asset accounts — rule not applicable.",
    );
  }

  const hasRecognition = hasMappingHint(ctx, RECOGNITION_HINTS);
  if (!hasRecognition) {
    return baseEval(
      rule,
      "advisory",
      "أصول غير ملموسة موجودة. تأكد من استيفاء معايير الاعتراف: قابلية التحديد، التحكم، المنافع الاقتصادية المستقبلية (IAS 38.21).",
      "Intangible assets present. Ensure recognition criteria are met: identifiability, control, future economic benefits (IAS 38.21).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "معايير الاعتراف بالأصول غير الملموسة مستوفاة.",
    "Intangible asset recognition criteria met.",
    ["balance_sheet"],
  );
}

/**
 * IAS 38.54 — Research costs expensed, development costs capitalised.
 */
export function handleExpenseVsCapitalise(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasIntangible = hasMappingHint(ctx, INTANGIBLE_HINTS);
  if (!hasIntangible) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أصول غير ملموسة.",
      "No intangible asset accounts — skipped.",
    );
  }

  const hasResearch = hasMappingHint(ctx, EXPENSE_HINTS);
  const hasDevelopment = hasMappingHint(ctx, CAPITALISE_HINTS);

  if (hasResearch && !hasDevelopment) {
    return baseEval(
      rule,
      "warning",
      "مصاريف بحث وتطوير موجودة. تأكد من تحميل مصاريف البحث على المصاريف ورسم تكاليف التطوير إذا استوفت المعايير (IAS 38.54).",
      "R&D expenses present. Ensure research costs are expensed and development costs are capitalised if criteria met (IAS 38.54).",
      ["income_statement"],
    );
  }

  if (!hasResearch && !hasDevelopment) {
    return baseEval(
      rule,
      "advisory",
      "أصول غير ملموسة موجودة. تأكد من التمييز بين مصاريف البحث (محمّلة) وتكاليف التطوير (مرسملة) (IAS 38.54).",
      "Intangible assets present. Ensure distinction between research (expensed) and development (capitalised) costs (IAS 38.54).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "التمييز بين مصاريف البحث وتكاليف التطوير موجود.",
    "Research vs development cost distinction present.",
  );
}

/**
 * IAS 38.97 — Amortisation of intangible assets with finite useful life.
 */
export function handleIntangibleAmortisation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasIntangible = hasMappingHint(ctx, INTANGIBLE_HINTS);
  if (!hasIntangible) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود أصول غير ملموسة.",
      "No intangible asset accounts — skipped.",
    );
  }

  const hasAmortisation = hasMappingHint(ctx, AMORTISATION_HINTS);
  if (!hasAmortisation) {
    return baseEval(
      rule,
      "warning",
      "أصول غير ملموسة موجودة بدون إهلاك. تأكد من إهلاك الأصول ذات العمر المحدد وعدم إهلاك الأصول ذات العمر غير المحدد (IAS 38.97).",
      "Intangible assets present without amortisation. Ensure finite-life intangibles are amortised and indefinite-life are not (IAS 38.97).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "إهلاك الأصول غير الملموسة محدد.",
    "Intangible asset amortisation identified.",
    ["balance_sheet"],
  );
}
