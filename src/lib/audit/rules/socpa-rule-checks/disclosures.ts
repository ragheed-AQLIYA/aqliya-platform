import type { SocpaKnowledgeRule, SocpaRuleEvaluation } from "../types";
import type { SocpaEvaluationContext } from "./common";
import { baseEval } from "./common";

const TOPICS = new Set(["framework-disclosure", "supplementary-disclosure"]);

export function evaluateDisclosures(
  rule: SocpaKnowledgeRule,
  ctx: SocpaEvaluationContext,
): SocpaRuleEvaluation | null {
  if (!TOPICS.has(rule.topic)) return null;

  if (ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule,
      "warning",
      "إيضاحات SOCPA/IFRS مكملة مطلوبة — لا إيضاحات مسجّلة.",
      "SOCPA supplementary disclosures required — no notes on file.",
    );
  }
  return baseEval(
    rule,
    "pass",
    `${ctx.disclosureNoteCount} إيضاح(ات) مسجّلة.`,
    `${ctx.disclosureNoteCount} disclosure note(s) on file.`,
  );
}
