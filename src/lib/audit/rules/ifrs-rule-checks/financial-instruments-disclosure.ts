import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const FINANCIAL_INSTRUMENT_HINTS = [
  "financial instrument",
  "financial asset",
  "financial liability",
  "financial risk",
  "credit risk",
  "market risk",
  "liquidity risk",
  "أداة مالية",
  "أصل مالي",
  "التزام مالي",
  "مخاطر مالية",
  "مخاطر ائتمان",
  "مخاطر سيولة",
];

const DISCLOSURE_HINTS = [
  "significance",
  "carrying amount",
  "risk disclosure",
  "significance disclosure",
  "الأهمية",
  "القيمة الدفترية",
  "إفصاح عن المخاطر",
];

const RISK_HINTS = [
  "risk disclosure",
  "credit risk",
  "market risk",
  "liquidity risk",
  "interest rate risk",
  "currency risk",
  "إفصاح عن المخاطر",
  "مخاطر الفائدة",
  "مخاطر العملة",
];

const ECL_HINTS = [
  "expected credit loss",
  "ecl",
  "credit loss allowance",
  "loss allowance",
  "خسارة ائتمانية متوقعة",
  "مخصص خسائر",
];

/**
 * IFRS 7.21 — Disclose significance of financial instruments for entity's financial position and performance.
 */
export function handleSignificanceDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFinancial = hasMappingHint(ctx, FINANCIAL_INSTRUMENT_HINTS);
  if (!hasFinancial) {
    return baseEval(
      rule, "skipped",
      "لا بنود أدوات مالية — القاعدة غير قابلة للتطبيق.",
      "No financial instrument accounts — rule not applicable.",
    );
  }
  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule, "warning",
      "أدوات مالية بدون إفصاح عن الأهمية والقيمة الدفترية (IFRS 7.21).",
      "Financial instruments without significance and carrying amount disclosure (IFRS 7.21).",
    );
  }
  return baseEval(
    rule, "pass",
    "إفصاحات أهمية الأدوات المالية موجودة.",
    "Financial instrument significance disclosures present.",
  );
}

/**
 * IFRS 7.14 — Disclose carrying amounts of financial assets and liabilities by category.
 */
export function handleCarryingAmounts(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFinancial = hasMappingHint(ctx, FINANCIAL_INSTRUMENT_HINTS);
  if (!hasFinancial) {
    return baseEval(
      rule, "skipped",
      "لا بنود أدوات مالية.",
      "No financial instrument accounts — skipped.",
    );
  }
  const hasCarrying = hasMappingHint(ctx, ["carrying amount", "amortised cost", "fair value", "القيمة الدفترية", "تكلفة مطفأة"]);
  if (!hasCarrying) {
    return baseEval(
      rule, "warning",
      "أدوات مالية بدون إفصاح عن القيمة الدفترية حسب الفئة (IFRS 7.14).",
      "Financial instruments without carrying amount disclosure by category (IFRS 7.14).",
      ["balance_sheet"],
    );
  }
  return baseEval(
    rule, "pass",
    "القيم الدفترية للأدوات المالية مفصح عنها حسب الفئة.",
    "Carrying amounts of financial instruments disclosed by category.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 7.31 — Disclose nature and extent of risks arising from financial instruments.
 */
export function handleRiskDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFinancial = hasMappingHint(ctx, FINANCIAL_INSTRUMENT_HINTS);
  if (!hasFinancial) {
    return baseEval(
      rule, "skipped",
      "لا بنود أدوات مالية.",
      "No financial instrument accounts — skipped.",
    );
  }
  const hasRisk = hasMappingHint(ctx, RISK_HINTS);
  if (!hasRisk && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule, "warning",
      "أدوات مالية بدون إفصاح عن طبيعة ومدى المخاطر (IFRS 7.31).",
      "Financial instruments without nature and extent of risks disclosure (IFRS 7.31).",
    );
  }
  return baseEval(
    rule, "pass",
    "إفصاحات مخاطر الأدوات المالية موجودة.",
    "Financial instrument risk disclosures present.",
  );
}

/**
 * IFRS 7.35 — Disclose expected credit loss measurement, reconciliation, and significant assumptions.
 */
export function handleEclDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasFinancial = hasMappingHint(ctx, FINANCIAL_INSTRUMENT_HINTS);
  if (!hasFinancial) {
    return baseEval(
      rule, "skipped",
      "لا بنود أدوات مالية.",
      "No financial instrument accounts — skipped.",
    );
  }
  const hasEcl = hasMappingHint(ctx, ECL_HINTS);
  if (!hasEcl) {
    return baseEval(
      rule, "advisory",
      "تأكد من الإفصاح عن قياس الخسائر الائتمانية المتوقعة ومطابقتها والافتراضات الجوهرية (IFRS 7.35).",
      "Ensure disclosure of ECL measurement, reconciliation, and significant assumptions (IFRS 7.35).",
    );
  }
  return baseEval(
    rule, "pass",
    "إفصاحات الخسائر الائتمانية المتوقعة موجودة.",
    "Expected credit loss disclosures present.",
  );
}
