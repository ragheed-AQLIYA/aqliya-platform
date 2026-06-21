import "server-only";

import { isEnabled } from "@/lib/platform/feature-flags/registry";

export function isIfrsRulesEnabled(): boolean {
  return isEnabled("audit.ifrs-rules");
}

export function isSocpaRulesEnabled(): boolean {
  return isEnabled("audit.socpa-rules");
}

export function isIsaRulesEnabled(): boolean {
  return isEnabled("audit.isa-rules");
}

export {
  runIfrsRulesForEngagement,
  appendIfrsValidationIssues,
} from "./ifrs-rules-engine";

export {
  runSocpaRulesForEngagement,
  appendSocpaValidationIssues,
} from "./socpa-rules-engine";

export { loadIfrsKnowledgeRules, clearIfrsRulesCache } from "./ifrs-rules-loader";
export { loadSocpaKnowledgeRules, clearSocpaRulesCache } from "./socpa-rules-loader";
export { loadIsaKnowledgeRules, getIsa320KnowledgeRules, clearIsaRulesCache } from "./isa-rules-loader";
export { evaluateIsaRule } from "./isa-rule-checks";
export {
  runIsaRulesForEngagement,
  maybeRunIsaRulesAfterFsRebuild,
} from "./isa-rules-engine";
export { evaluateIfrsRule } from "./ifrs-rule-checks";
export { evaluateSocpaRule, isSocpaJurisdiction } from "./socpa-rule-checks";
export { buildDisclosureTriggersFromEvaluations } from "./disclosure-triggers";
export { buildSocpaDisclosureTriggersFromEvaluations } from "./socpa-disclosure-triggers";

export type {
  IfrsRulesRunResult,
  IfrsRuleEvaluation,
  DisclosureTrigger,
  IfrsKnowledgeRule,
  SocpaRulesRunResult,
  SocpaRuleEvaluation,
  SocpaDisclosureTrigger,
  SocpaKnowledgeRule,
  IsaKnowledgeRule,
  IsaRuleEvaluation,
  IsaRulesRunResult,
} from "./types";

/** Non-blocking hook after FS rebuild */
export async function maybeRunIfrsRulesAfterFsRebuild(
  engagementId: string,
  _organizationId?: string,
): Promise<void> {
  if (!isIfrsRulesEnabled()) return;
  try {
    const { runIfrsRulesForEngagement } = await import("./ifrs-rules-engine");
    await runIfrsRulesForEngagement(engagementId);
  } catch (err) {
    console.error(`[IFRS Rules] post-FS hook failed for ${engagementId}`, err);
  }
}

/** Non-blocking hook after IFRS rules (Phase 7) */
export async function maybeRunSocpaRulesAfterFsRebuild(
  engagementId: string,
  _organizationId?: string,
): Promise<void> {
  if (!isSocpaRulesEnabled()) return;
  try {
    const { runSocpaRulesForEngagement } = await import("./socpa-rules-engine");
    await runSocpaRulesForEngagement(engagementId);
  } catch (err) {
    console.error(`[SOCPA Rules] post-FS hook failed for ${engagementId}`, err);
  }
}
