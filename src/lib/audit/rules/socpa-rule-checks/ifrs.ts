import type { SocpaKnowledgeRule, SocpaRuleEvaluation } from "../types";
import type { SocpaEvaluationContext } from "./common";
import { baseEval } from "./common";

const FULL_IFRS_TOPIC = "full-ifrs";
const SMES_TOPIC = "ifrs-smes-eligibility";

export function evaluateFullIfrs(
  rule: SocpaKnowledgeRule,
  ctx: SocpaEvaluationContext,
): SocpaRuleEvaluation | null {
  if (rule.topic !== FULL_IFRS_TOPIC) return null;

  const fw = ctx.reportingFramework.toLowerCase();
  if (fw.includes("sme")) {
    return baseEval(
      rule,
      "warning",
      "إطار IFRS for SMEs — تحقق من أهلية SOCPA للشركات المدرجة.",
      "IFRS for SMEs framework — verify SOCPA full IFRS eligibility.",
    );
  }
  return baseEval(
    rule,
    "pass",
    "إطار تقرير يتوافق مع تبني IFRS الكامل.",
    "Reporting framework aligned with full IFRS adoption.",
  );
}

export function evaluateIfrsSmesEligibility(
  rule: SocpaKnowledgeRule,
  ctx: SocpaEvaluationContext,
): SocpaRuleEvaluation | null {
  if (rule.topic !== SMES_TOPIC) return null;

  const fw = ctx.reportingFramework.toLowerCase();
  if (fw.includes("sme")) {
    return baseEval(
      rule,
      "pass",
      "IFRS for SMEs مُعلَن — راجع معايير الأهلية SOCPA.",
      "IFRS for SMEs declared — review SOCPA eligibility criteria.",
    );
  }
  return baseEval(
    rule,
    "advisory",
    "ليس IFRS for SMEs — قاعدة الأهلية استشارية.",
    "Not IFRS for SMEs — eligibility rule advisory.",
  );
}
