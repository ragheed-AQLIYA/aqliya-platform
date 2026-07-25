import type { SocpaKnowledgeRule, SocpaRuleEvaluation } from "../types";
import { baseEval } from "./common";

export function evaluateRoutingGate(
  rule: SocpaKnowledgeRule,
): SocpaRuleEvaluation | null {
  if (rule.topic !== "routing-gate") return null;
  return baseEval(
    rule,
    "pass",
    "اختصاص سعودي — محرك SOCPA نشط.",
    "Saudi jurisdiction — SOCPA engine active.",
  );
}
