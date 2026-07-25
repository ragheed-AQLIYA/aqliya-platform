import type { SocpaKnowledgeRule, SocpaRuleEvaluation } from "../types";
import type { SocpaEvaluationContext } from "./common";
import { baseEval } from "./common";

export function evaluateFrameworkScope(
  rule: SocpaKnowledgeRule,
  ctx: SocpaEvaluationContext,
): SocpaRuleEvaluation | null {
  if (rule.topic !== "framework-scope") return null;

  const core = ["balance_sheet", "income_statement", "equity"];
  const missing = core.filter((t) => !ctx.statementTypes.includes(t));
  if (missing.length > 0) {
    return baseEval(
      rule,
      "fail",
      `نطاق SOCPA: قوائم ناقصة (${missing.join(", ")})`,
      `SOCPA framework scope: missing statements (${missing.join(", ")})`,
    );
  }
  return baseEval(
    rule,
    "pass",
    "نطاق القوائم ضمن إطار SOCPA مقبول.",
    "Statement scope within SOCPA framework.",
  );
}
