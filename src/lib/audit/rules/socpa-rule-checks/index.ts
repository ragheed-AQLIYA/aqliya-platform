import type { SocpaKnowledgeRule, SocpaRuleEvaluation } from "../types";
import { isSocpaJurisdiction, baseEval } from "./common";
import type { SocpaEvaluationContext } from "./common";
import { evaluateRoutingGate } from "./routing";
import { evaluateOverlay } from "./overlay";
import { evaluateFrameworkScope } from "./framework-scope";
import { evaluateFairPresentation } from "./fair-presentation";
import { evaluateDisclosures } from "./disclosures";
import { evaluateFullIfrs, evaluateIfrsSmesEligibility } from "./ifrs";
import { evaluateZakatPresentation, evaluateReconciliation } from "./zakat-tax";

export type { SocpaEvaluationContext };
export { isSocpaJurisdiction } from "./common";

const jurisdictionHandlers = [
  evaluateRoutingGate,
  evaluateOverlay,
  evaluateFrameworkScope,
  evaluateFairPresentation,
  evaluateDisclosures,
  evaluateFullIfrs,
  evaluateIfrsSmesEligibility,
  evaluateZakatPresentation,
  evaluateReconciliation,
];

export function evaluateSocpaRule(
  rule: SocpaKnowledgeRule,
  ctx: SocpaEvaluationContext,
): SocpaRuleEvaluation {
  if (!isSocpaJurisdiction(ctx)) {
    return skipOutsideJurisdiction(rule);
  }

  for (const handler of jurisdictionHandlers) {
    const result = handler(rule, ctx as Parameters<typeof handler>[1]);
    if (result) return result;
  }

  return baseEval(
    rule,
    "skipped",
    "موضوع SOCPA غير مُنفّذ في Phase 7.",
    "SOCPA topic not executable in Phase 7.",
  );
}

function skipOutsideJurisdiction(
  rule: SocpaKnowledgeRule,
): SocpaRuleEvaluation {
  if (rule.topic === "routing-gate") {
    return baseEval(
      rule,
      "skipped",
      "التكليف خارج نطاق SOCPA السعودي — متخطى.",
      "Engagement outside Saudi SOCPA scope — skipped.",
    );
  }
  return baseEval(
    rule,
    "skipped",
    "SOCPA لا ينطبق — العملة/الاختصاص غير سعودي.",
    "SOCPA not applicable — non-Saudi jurisdiction.",
  );
}
