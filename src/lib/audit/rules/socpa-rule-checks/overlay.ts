import type { SocpaKnowledgeRule, SocpaRuleEvaluation } from "../types";
import { baseEval } from "./common";

const TOPICS = new Set(["overlay-principle", "lineage-required"]);

export function evaluateOverlay(
  rule: SocpaKnowledgeRule,
): SocpaRuleEvaluation | null {
  if (!TOPICS.has(rule.topic)) return null;
  return baseEval(
    rule,
    "advisory",
    "طبقة SOCPA تكمّل IFRS — راجع lineage في knowledge-foundation.",
    "SOCPA overlay supplements IFRS — review knowledge lineage.",
  );
}
