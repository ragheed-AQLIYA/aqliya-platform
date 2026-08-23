import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const SUBSIDIARY_HINTS = [
  "subsidiary",
  "subsidiary without public accountability",
  "non-public subsidiary",
  "reduced disclosure",
  "ifrs 19",
  "شركة تابعة",
  "بدون محاسبية عامة",
  "إفصاحات مخفضة",
];

const ELECTION_HINTS = [
  "election",
  "elected",
  "applied ifrs 19",
  "reduced disclosure requirements",
  "اختيار",
  "متطلبات إفصاح مخفضة",
];

const ELIGIBILITY_HINTS = [
  "public accountability",
  "securities regulator",
  "public market",
  "instruments in public market",
  "محاسبية عامة",
  "هيئة الأوراق المالية",
  "سوق عام",
];

const EFFECTIVE_DATE_HINTS = [
  "effective date",
  "1 january 2027",
  "early adoption",
  "earlier application",
  "تاريخ السريان",
  "تطبيق مبكر",
];

/**
 * IFRS 19.3 — Subsidiary without public accountability may elect reduced disclosure requirements.
 */
export function handleSubsidiaryScopeElection(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSubsidiary = hasMappingHint(ctx, SUBSIDIARY_HINTS);
  if (!hasSubsidiary) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود شركات تابعة بدون محاسبية عامة — القاعدة غير قابلة للتطبيق.",
      "No subsidiary without public accountability accounts — rule not applicable.",
    );
  }

  const hasElection = hasMappingHint(ctx, ELECTION_HINTS);
  if (!hasElection) {
    return baseEval(
      rule,
      "advisory",
      "شركة تابعة موجودة — تأكد من توثيق اختيار تطبيق IFRS 19 (IFRS 19.3).",
      "Subsidiary present — ensure IFRS 19 election is documented (IFRS 19.3).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "اختيار IFRS 19 للشركة التابعة موثق.",
    "IFRS 19 election for subsidiary documented.",
  );
}

/**
 * IFRS 19.6 — Disclose subsidiary status and election to apply reduced disclosure requirements.
 */
export function handleSubsidiaryElectionDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSubsidiary = hasMappingHint(ctx, SUBSIDIARY_HINTS);
  if (!hasSubsidiary) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود شركات تابعة.",
      "No subsidiary accounts — skipped.",
    );
  }

  const hasElection = hasMappingHint(ctx, ELECTION_HINTS);
  if (!hasElection && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "شركة تابعة بدون إفصاح عن حالة عدم المحاسبية العامة واختيار IFRS 19 (IFRS 19.6).",
      "Subsidiary without disclosure of non-public accountability status and IFRS 19 election (IFRS 19.6).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاح حالة الشركة التابعة واختيار IFRS 19 موجود.",
    "Subsidiary status and IFRS 19 election disclosure present.",
  );
}

/**
 * IFRS 19.B2 — Subsidiary without public accountability does not file with securities regulator.
 */
export function handleSubsidiaryEligibilityAssessment(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSubsidiary = hasMappingHint(ctx, SUBSIDIARY_HINTS);
  if (!hasSubsidiary) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود شركات تابعة.",
      "No subsidiary accounts — skipped.",
    );
  }

  const hasEligibility = hasMappingHint(ctx, ELIGIBILITY_HINTS);
  if (!hasEligibility) {
    return baseEval(
      rule,
      "advisory",
      "تأكد من تقييم أهلية الشركة التابعة — عدم الإيداع لدى هيئة الأوراق المالية (IFRS 19.B2).",
      "Ensure subsidiary eligibility assessment — no filing with securities regulator (IFRS 19.B2).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "تقييم أهلية الشركة التابعة موثق.",
    "Subsidiary eligibility assessment documented.",
  );
}

/**
 * IFRS 19.C5 — Apply IFRS 19 for periods beginning on or after 1 January 2027, early adoption permitted.
 */
export function handleSubsidiaryEffectiveDate(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSubsidiary = hasMappingHint(ctx, SUBSIDIARY_HINTS);
  if (!hasSubsidiary) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود شركات تابعة.",
      "No subsidiary accounts — skipped.",
    );
  }

  const hasEffectiveDate = hasMappingHint(ctx, EFFECTIVE_DATE_HINTS);
  if (!hasEffectiveDate) {
    return baseEval(
      rule,
      "advisory",
      "IFRS 19 ساري اعتباراً من 1 يناير 2027 — تأكد من تاريخ التطبيق المبكر الموثق (IFRS 19.C5).",
      "IFRS 19 effective from 1 January 2027 — ensure early adoption date is documented (IFRS 19.C5).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "تاريخ تطبيق IFRS 19 موثق.",
    "IFRS 19 adoption date documented.",
  );
}
