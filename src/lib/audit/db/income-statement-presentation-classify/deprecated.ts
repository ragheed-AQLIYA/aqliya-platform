import type { PresentationMapping } from "../income-statement-presentation-types";
import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";
import { SHALFA_POLICY_FALLBACK } from "./common";
import {
  isOperatingRevenueExcludedByPolicy,
  isCorExcludedByPolicy,
} from "../income-statement-presentation-policy";

/** @deprecated Use isOperatingRevenueExcludedByPolicy */
export function isAuditedOperatingRevenueExcluded(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules = SHALFA_POLICY_FALLBACK,
): boolean {
  return isOperatingRevenueExcludedByPolicy(mapping, policy);
}

/** @deprecated Use isCorExcludedByPolicy */
export function isAuditedCorPresentationExcluded(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules = SHALFA_POLICY_FALLBACK,
): boolean {
  return isCorExcludedByPolicy(mapping, policy);
}
