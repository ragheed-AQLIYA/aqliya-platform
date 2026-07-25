import { resolvePolicyForProfile } from "@/lib/audit/presentation/presentation-policy-resolver";
import { PresentationProfile } from "@/lib/audit/presentation/presentation-profile";

export const SHALFA_POLICY_FALLBACK = resolvePolicyForProfile(
  PresentationProfile.PILOT_AUDITED,
);
