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
