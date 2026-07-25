import type { SocpaKnowledgeRule, SocpaRuleEvaluation } from "../types";
import type { SocpaEvaluationContext } from "./common";
import { baseEval, hasHint, hasZakatTaxNote } from "./common";

const ZAKAT_TOPICS = new Set(["zakat-presentation", "separate-disclosure"]);
const RECON_TOPICS = new Set(["reconciliation", "ias12-overlay"]);

export function evaluateZakatPresentation(
  rule: SocpaKnowledgeRule,
  ctx: SocpaEvaluationContext,
): SocpaRuleEvaluation | null {
  if (!ZAKAT_TOPICS.has(rule.topic)) return null;

  const hasZakatTax = hasHint(ctx, [
    "zakat",
    "زكاة",
    "tax",
    "ضريبة",
    "income tax",
  ]);
  if (!hasZakatTax) {
    return baseEval(
      rule,
      "skipped",
      "لا حسابات زكاة/ضريبة — القاعدة غير قابلة للتطبيق.",
      "No zakat/tax accounts — rule not applicable.",
    );
  }
  if (!hasZakatTaxNote(ctx)) {
    return baseEval(
      rule,
      "warning",
      "حسابات زكاة/ضريبة بدون إيضاح منفصل.",
      "Zakat/tax accounts without separate disclosure note.",
    );
  }
  return baseEval(
    rule,
    "pass",
    "عرض/إيضاح الزكاة والضريبة موثّق.",
    "Zakat/tax presentation/disclosure documented.",
  );
}

export function evaluateReconciliation(
  rule: SocpaKnowledgeRule,
  ctx: SocpaEvaluationContext,
): SocpaRuleEvaluation | null {
  if (!RECON_TOPICS.has(rule.topic)) return null;

  const hasTax = hasHint(ctx, ["tax", "ضريبة", "deferred tax"]);
  const hasZakat = hasHint(ctx, ["zakat", "زكاة"]);
  if (hasTax && hasZakat && !hasZakatTaxNote(ctx)) {
    return baseEval(
      rule,
      "warning",
      "زكاة وضريبة معاً — مطلوب إيضاح مطابقة IAS 12/SOCPA.",
      "Both zakat and tax — IAS 12/SOCPA reconciliation disclosure required.",
    );
  }
  if (!hasTax && !hasZakat) {
    return baseEval(rule, "skipped", "لا زكاة/ضريبة.", "No zakat/tax — skipped.");
  }
  return baseEval(
    rule,
    "pass",
    "بنود الزكاة/الضريبة مع إيضاح أو بدون تعارض ظاهر.",
    "Zakat/tax items with disclosure or no apparent conflict.",
  );
}
