import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

export function handleLeases(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasLease = hasMappingHint(ctx, [
    "lease",
    "right-of-use",
    "rou",
    "إيجار",
  ]);
  if (!hasLease) {
    return baseEval(
      rule,
      "skipped",
      "لا عقود إيجار — IFRS 16 غير قابل للتطبيق.",
      "No lease accounts — IFRS 16 not applicable.",
    );
  }
  return baseEval(
    rule,
    "pass",
    "بنود إيجار موجودة — راجع IFRS 16.",
    "Lease-related accounts mapped — review IFRS 16.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 16.36 — Subsequent measurement of lease liability (interest + payments).
 */
export function handleSubsequentLeaseLiability(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasLease = hasMappingHint(ctx, ["lease", "right-of-use", "rou", "lease liability", "إيجار"]);
  if (!hasLease) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود التزامات إيجار.",
      "No lease liability accounts — skipped.",
    );
  }

  const hasInterest = hasMappingHint(ctx, ["interest", "interest expense", "finance cost", "فائدة", "تكلفة تمويل"]);
  if (!hasInterest) {
    return baseEval(
      rule,
      "warning",
      "التزامات إيجار موجودة بدون حساب فائدة. تأكد من زيادة التزام الإيجار بمبلغ الفائدة وتقليله بالمدفوعات (IFRS 16.36).",
      "Lease liabilities present without interest account. Ensure lease liability is increased by interest and reduced by payments (IFRS 16.36).",
      ["balance_sheet", "income_statement"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "القياس اللاحق للالتزامات الإيجارية محدد.",
    "Subsequent lease liability measurement identified.",
    ["balance_sheet"],
  );
}

/**
 * IFRS 16.32 — Depreciation of RoU asset and separate interest presentation.
 */
export function handleDepreciationInterest(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasRou = hasMappingHint(ctx, ["right-of-use", "rou", "روو", "حق استخدام"]);
  if (!hasRou) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود حق استخدام (RoU).",
      "No RoU asset accounts — skipped.",
    );
  }

  const hasDepreciation = hasMappingHint(ctx, ["depreciation", "dep", "إهلاك"]);
  const hasInterest = hasMappingHint(ctx, ["interest", "interest expense", "finance cost", "فائدة"]);

  if (!hasDepreciation) {
    return baseEval(
      rule,
      "warning",
      "أصل حق استخدام موجود بدون إهلاك. تأكد من إهلاك أصل RoU بشكل خطي (IFRS 16.32).",
      "RoU asset present without depreciation. Ensure RoU asset is depreciated on a straight-line basis (IFRS 16.32).",
      ["income_statement"],
    );
  }

  if (!hasInterest) {
    return baseEval(
      rule,
      "warning",
      "إهلاك أصل RoU موجود ولكن لا يوجد فائدة منفصلة. تأكد من عرض الفائدة على التزام الإيجار بشكل منفصل (IFRS 16.32).",
      "RoU depreciation present but no separate interest. Ensure interest on lease liability is presented separately (IFRS 16.32).",
      ["income_statement"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "إهلاك أصل RoU والفائدة المنفصلة موجودان.",
    "RoU depreciation and separate interest present.",
    ["income_statement"],
  );
}
