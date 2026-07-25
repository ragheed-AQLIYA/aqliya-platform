import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";
import {
  GENERIC_PRESENTATION_POLICY_V1,
  policyUsesAuditedHeadlineRules,
} from "@/lib/audit/presentation/presentation-policy-types";
import type { PresentationMapping } from "./income-statement-presentation-types";
import { isGlInPolicySet } from "./income-statement-presentation-helpers";

/** Check if a mapping's source GL code is in the policy's operating revenue exclusion set. */
export function isOperatingRevenueExcludedByPolicy(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules,
): boolean {
  return isGlInPolicySet(
    mapping.sourceAccountCode,
    policy.revenue.operatingExclusionGlCodes,
  );
}

/** Check if a mapping's source GL code is excluded from cost-of-revenue presentation by policy. */
export function isCorExcludedByPolicy(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules,
): boolean {
  const code = mapping.sourceAccountCode;
  if (isGlInPolicySet(code, policy.costOfRevenue.exclusionGlCodes)) {
    return true;
  }
  return policy.costOfRevenue.exclusionPrefixPatterns.some((prefix) =>
    code.startsWith(prefix),
  );
}

/** @deprecated Use policy.headline.useAuditedHeadlineRules */
export function isPilotAuditedPresentationProfile(
  policyOrProfile?: PresentationPolicyRules | { value: string },
): boolean {
  return policyUsesAuditedHeadlineRules(
    policyOrProfile as PresentationPolicyRules,
  );
}
