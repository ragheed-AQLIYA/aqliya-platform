import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const INVESTMENT_HINTS = [
  "investment in subsidiary",
  "investment in associate",
  "investment in joint venture",
  "investment in subsidiary",
  "subsidiary investment",
  "associate investment",
  "joint venture investment",
  "استثمار في شركة تابعة",
  "استثمار في شركة شقيقة",
  "استثمار في مشروع مشترك",
];

const COST_HINTS = [
  "cost",
  "at cost",
  "cost model",
  "historical cost",
  "تكلفة",
  "بالتكلفة",
];

const FAIR_VALUE_HINTS = [
  "fair value",
  "fvlm",
  "fair value through oci",
  "fair value through profit or loss",
  "fvoci",
  "fvtpl",
  "قيمة عادلة",
];

const EQUITY_METHOD_HINTS = [
  "equity method",
  "equity accounting",
  "share of profit",
  "share of loss",
  "طريقة حقوق الملكية",
  "حصة من الربح",
];

const SEPARATE_FS_DISCLOSURE_HINTS = [
  "separate financial statements",
  "accounting policy",
  "measurement basis",
  "قوائم مالية منفصلة",
  "سياسة محاسبية",
];

const JUDGEMENT_HINTS = [
  "significant influence",
  "control assessment",
  "judgement",
  "assumption",
  "تأثير جوهري",
  "تقييم السيطرة",
  "أحكام",
];

/**
 * IAS 27.10 — Investments in subsidiaries/JVs/associates at cost, fair value, or equity method.
 */
export function handleSeparateFsMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInvestment = hasMappingHint(ctx, INVESTMENT_HINTS);
  if (!hasInvestment) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود استثمار في شركات تابعة أو شقيقة أو مشروع مشترك — القاعدة غير قابلة للتطبيق.",
      "No investment in subsidiaries/associates/JVs — rule not applicable.",
    );
  }

  const hasCost = hasMappingHint(ctx, COST_HINTS);
  const hasFv = hasMappingHint(ctx, FAIR_VALUE_HINTS);
  const hasEquity = hasMappingHint(ctx, EQUITY_METHOD_HINTS);

  if (!hasCost && !hasFv && !hasEquity) {
    return baseEval(
      rule,
      "warning",
      "بنود استثمار موجودة بدون تحديد أساس القياس (تكلفة، قيمة عادلة، أو طريقة حقوق الملكية). راجع IAS 27.10.",
      "Investment accounts present without measurement basis (cost, fair value, or equity method). Review IAS 27.10.",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "أساس قياس الاستثمارات محدد في القوائم المالية المنفصلة.",
    "Investment measurement basis identified in separate financial statements.",
    ["balance_sheet"],
  );
}

/**
 * IAS 27.11 — Same accounting policy for all categories of investments.
 */
export function handleSeparateFsConsistency(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInvestment = hasMappingHint(ctx, INVESTMENT_HINTS);
  if (!hasInvestment) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود استثمار.",
      "No investment accounts — skipped.",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من تطبيق نفس السياسة المحاسبية لجميع الاستثمارات في الشركات التابعة والشقيقة والمشاريع المشتركة (IAS 27.11).",
    "Ensure the same accounting policy is applied to all investments in subsidiaries, associates and JVs (IAS 27.11).",
  );
}

/**
 * IAS 27.12 — Disclose accounting policy for investments in separate FS.
 */
export function handleSeparateFsDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInvestment = hasMappingHint(ctx, INVESTMENT_HINTS);
  if (!hasInvestment) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود استثمار.",
      "No investment accounts — skipped.",
    );
  }

  const hasDisclosure = hasMappingHint(ctx, SEPARATE_FS_DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "بنود استثمار موجودة بدون إفصاح عن السياسة المحاسبية في القوائم المالية المنفصلة (IAS 27.12).",
      "Investment accounts present without accounting policy disclosure for separate FS (IAS 27.12).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاح السياسة المحاسبية للاستثمارات موجود.",
    "Accounting policy disclosure for investments present.",
  );
}

/**
 * IAS 27.13 — Disclose significant judgements about control, joint control, or significant influence.
 */
export function handleSeparateFsJudgements(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInvestment = hasMappingHint(ctx, INVESTMENT_HINTS);
  if (!hasInvestment) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود استثمار.",
      "No investment accounts — skipped.",
    );
  }

  const hasJudgement = hasMappingHint(ctx, JUDGEMENT_HINTS);
  if (!hasJudgement && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "advisory",
      "بنود استثمار موجودة. تأكد من الإفصاح عن الأحكام الجوهرية المتعلقة بالسيطرة أو التأثير الجوهري (IAS 27.13).",
      "Investment accounts present. Ensure disclosure of significant judgements about control or significant influence (IAS 27.13).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات الأحكام الجوهرية موجودة.",
    "Significant judgement disclosures present.",
  );
}
