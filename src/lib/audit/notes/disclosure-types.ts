/**
 * Rule citation markers for disclosure notes (shared Phase 8/9)
 */

export type RuleDisclosureSource = "ifrs" | "socpa";

export interface RuleCitation {
  ruleId: string;
  standardCode: string;
  source: RuleDisclosureSource;
}

export const RULE_CITATION_PREFIX = "RULE_CITATION|";

export function formatRuleCitationMarker(citation: RuleCitation): string {
  return `${RULE_CITATION_PREFIX}${citation.source}|${citation.ruleId}|${citation.standardCode}`;
}

export function parseRuleCitationMarker(value: string): RuleCitation | null {
  if (!value.startsWith(RULE_CITATION_PREFIX)) return null;
  const parts = value.slice(RULE_CITATION_PREFIX.length).split("|");
  if (parts.length < 3) return null;
  const [source, ruleId, standardCode] = parts;
  if (source !== "ifrs" && source !== "socpa") return null;
  return { source, ruleId, standardCode };
}

export function extractRuleCitations(
  missingInformation: string[],
): RuleCitation[] {
  return missingInformation
    .map(parseRuleCitationMarker)
    .filter((c): c is RuleCitation => c !== null);
}
