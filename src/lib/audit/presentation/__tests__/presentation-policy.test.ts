import {
  GENERIC_PRESENTATION_POLICY_V1,
  SHALFA_PILOT_PRESENTATION_POLICY_V1,
  getBuiltinPolicyBySlug,
  policyUsesAuditedHeadlineRules,
} from "@/lib/audit/presentation/presentation-policy-types";
import {
  policyIdForProfile,
  resolvePolicyForProfile,
  resolvePresentationContextFromParts,
} from "@/lib/audit/presentation/presentation-policy-resolver";
import { PresentationProfile } from "@/lib/audit/presentation/presentation-profile";

describe("presentation policy resolver", () => {
  it("maps generic profile to generic-v1 policy", () => {
    const policy = resolvePolicyForProfile(PresentationProfile.GENERIC);
    expect(policy.slug).toBe(GENERIC_PRESENTATION_POLICY_V1.slug);
    expect(policyUsesAuditedHeadlineRules(policy)).toBe(false);
  });

  it("maps pilot-audited profile to shalfa pilot policy", () => {
    const policy = resolvePolicyForProfile(PresentationProfile.PILOT_AUDITED);
    expect(policy.slug).toBe(SHALFA_PILOT_PRESENTATION_POLICY_V1.slug);
    expect(policyUsesAuditedHeadlineRules(policy)).toBe(true);
  });

  it("returns stable policy ids for profile defaults", () => {
    expect(policyIdForProfile(PresentationProfile.GENERIC)).toBe(
      "pol-generic-v1",
    );
    expect(policyIdForProfile(PresentationProfile.PILOT_AUDITED)).toBe(
      "pol-shalfa-pilot-audited-v1",
    );
  });

  it("prefers DB policy rules when provided", () => {
    const context = resolvePresentationContextFromParts({
      presentationProfile: "generic",
      presentationProfileVersion: "generic-v1",
      presentationPolicyId: "pol-shalfa-pilot-audited-v1",
      policyRules: SHALFA_PILOT_PRESENTATION_POLICY_V1,
    });
    expect(context.policy.slug).toBe("shalfa-pilot-audited-v1");
    expect(context.presentationPolicyId).toBe("pol-shalfa-pilot-audited-v1");
  });

  it("falls back to profile default when policy rules missing", () => {
    const context = resolvePresentationContextFromParts({
      presentationProfile: "pilot-audited",
      presentationProfileVersion: "pilot-audited-v1",
      presentationPolicyId: null,
    });
    expect(context.policy.slug).toBe("shalfa-pilot-audited-v1");
  });

  it("loads seeded shalfa policy with pilot exclusion codes", () => {
    const policy = getBuiltinPolicyBySlug("shalfa-pilot-audited-v1");
    expect(policy?.revenue.operatingExclusionGlCodes).toEqual([
      "4401010004",
      "4601010003",
      "4701010001",
    ]);
    expect(policy?.otherIncome.targetNet).toBe(735_915);
    expect(policy?.finance.netOffset).toBe(334_011);
  });
});
