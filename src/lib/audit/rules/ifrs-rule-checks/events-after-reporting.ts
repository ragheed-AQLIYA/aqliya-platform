import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const ADJUSTING_HINTS = [
  "adjusting event",
  "event after reporting",
  "subsequent event",
  "condition existed",
  "حدث لاحق",
  "حدث بعد التقرير",
  "حدث تعديلي",
];

const NON_ADJUSTING_HINTS = [
  "non-adjusting",
  "condition arose after",
  "dividend declared after",
  "غير تعديلي",
  "حدث غير تعديلي",
];

const DIVIDEND_HINTS = [
  "dividend",
  "dividend declared",
  "dividend proposed",
  "توزيعات أرباح",
  "أرباح موزعة",
];

/**
 * IAS 10.3 — Adjusting events after the reporting period.
 */
export function handleAdjustingEvents(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasAdjusting = hasMappingHint(ctx, ADJUSTING_HINTS);
  if (!hasAdjusting) {
    return baseEval(
      rule,
      "advisory",
      "تأكد من الاعتراف بأي أحداث تعديلية بعد تاريخ التقرير التي تشير إلى ظروف موجودة في تاريخ التقرير (IAS 10.3).",
      "Ensure any adjusting events after the reporting date that indicate conditions existing at the reporting date are recognised (IAS 10.3).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "أحداث تعديلية بعد التقرير معيّنة.",
    "Adjusting events after reporting period identified.",
  );
}

/**
 * IAS 10.10 — Non-adjusting events disclosed but not recognised.
 */
export function handleNonAdjustingEvents(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasNonAdjusting = hasMappingHint(ctx, NON_ADJUSTING_HINTS);
  if (!hasNonAdjusting) {
    return baseEval(
      rule,
      "advisory",
      "تأكد من الإفصاح عن أي أحداث غير تعديلية ذات أهمية بعد تاريخ التقرير (IAS 10.10).",
      "Ensure disclosure of material non-adjusting events after the reporting date (IAS 10.10).",
    );
  }

  if (ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "أحداث غير تعديلية موجودة بدون إفصاح (IAS 10.10).",
      "Non-adjusting events present without disclosure (IAS 10.10).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "إفصاحات الأحداث غير التعديلية موجودة.",
    "Non-adjusting event disclosures present.",
  );
}

/**
 * IAS 10.12 — Dividends declared after reporting period not recognised as liability.
 */
export function handleDividends(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasDividend = hasMappingHint(ctx, DIVIDEND_HINTS);
  if (!hasDividend) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود توزيعات أرباح — القاعدة غير قابلة للتطبيق.",
      "No dividend accounts — rule not applicable.",
    );
  }

  const hasLiability = hasMappingHint(ctx, ["dividend payable", "dividend liability", "توزيعات مستحقة"]);
  if (hasLiability) {
    return baseEval(
      rule,
      "warning",
      "توزيعات أرباح مُعلنة بعد تاريخ التقرير قد تكون مُعترف بها كالتزام — لا تعترف بها كالتزام (IAS 10.12).",
      "Dividends declared after reporting period may be recognised as liability — do not recognise as liability (IAS 10.12).",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "توزيعات الأرباح المُعلنة بعد تاريخ التقرير غير مُعترف بها كالتزام.",
    "Dividends declared after reporting period not recognised as liability.",
  );
}
