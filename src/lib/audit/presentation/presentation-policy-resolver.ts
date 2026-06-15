import {
  GENERIC_PRESENTATION_POLICY_V1,
  getBuiltinPolicyBySlug,
  parsePresentationPolicyRules,
  PROFILE_DEFAULT_POLICY_SLUG,
  type PresentationPolicyRules,
  type ResolvedPresentationContext,
} from "@/lib/audit/presentation/presentation-policy-types";
import {
  resolveEngagementPresentationConfig,
  resolvePresentationProfile,
  type PresentationProfile,
} from "@/lib/audit/presentation/presentation-profile";

export function resolvePolicyForProfile(
  profile: PresentationProfile | string,
): PresentationPolicyRules {
  const slug =
    PROFILE_DEFAULT_POLICY_SLUG[resolvePresentationProfile(profile)] ??
    GENERIC_PRESENTATION_POLICY_V1.slug;
  return getBuiltinPolicyBySlug(slug) ?? GENERIC_PRESENTATION_POLICY_V1;
}

export function resolvePresentationContextFromParts(input: {
  presentationProfile?: string | null;
  presentationProfileVersion?: string | null;
  presentationPolicyId?: string | null;
  policyRules?: unknown;
  policySlug?: string | null;
}): ResolvedPresentationContext {
  const profileConfig = resolveEngagementPresentationConfig({
    presentationProfile: input.presentationProfile,
    presentationProfileVersion: input.presentationProfileVersion,
  });

  const fromDb =
    parsePresentationPolicyRules(input.policyRules) ??
    (input.policySlug ? getBuiltinPolicyBySlug(input.policySlug) : null);

  const policy =
    fromDb ?? resolvePolicyForProfile(profileConfig.presentationProfile);

  return {
    presentationProfile: profileConfig.presentationProfile,
    presentationProfileVersion: profileConfig.presentationProfileVersion,
    presentationPolicyId: input.presentationPolicyId ?? null,
    policy,
  };
}

export function policyIdForProfile(profile: PresentationProfile): string {
  const slug = PROFILE_DEFAULT_POLICY_SLUG[profile];
  if (slug === "shalfa-pilot-audited-v1") {
    return "pol-shalfa-pilot-audited-v1";
  }
  return "pol-generic-v1";
}
