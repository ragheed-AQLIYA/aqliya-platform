import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval } from "./common";

export function handleOciPresentation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  return baseEval(
    rule,
    "skipped",
    "لا يوجد OCI منفصل في محرك v1 — متخطى.",
    "Separate OCI not modeled in v1 engine — skipped.",
  );
}
