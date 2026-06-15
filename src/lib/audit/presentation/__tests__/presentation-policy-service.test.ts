import {
  GENERIC_PRESENTATION_POLICY_V1,
  SHALFA_PILOT_PRESENTATION_POLICY_V1,
  getBuiltinPolicyBySlug,
} from "@/lib/audit/presentation/presentation-policy-types";
import { listPresentationPolicyTemplates } from "@/lib/audit/presentation/presentation-policy-service";

describe("presentation policy service helpers", () => {
  it("exposes builtin templates for clone UI", () => {
    const templates = listPresentationPolicyTemplates();
    expect(templates).toHaveLength(2);
    expect(templates.map((t) => t.slug)).toContain("generic-v1");
    expect(templates.map((t) => t.slug)).toContain("shalfa-pilot-audited-v1");
  });

  it("loads shalfa template with pilot exclusion codes", () => {
    const policy = getBuiltinPolicyBySlug("shalfa-pilot-audited-v1");
    expect(policy?.revenue.operatingExclusionGlCodes).toEqual([
      "4401010004",
      "4601010003",
      "4701010001",
    ]);
    expect(policy?.otherIncome.targetNet).toBe(735_915);
  });

  it("generic template has no audited headline rules", () => {
    expect(GENERIC_PRESENTATION_POLICY_V1.headline.useAuditedHeadlineRules).toBe(
      false,
    );
    expect(
      SHALFA_PILOT_PRESENTATION_POLICY_V1.headline.useAuditedHeadlineRules,
    ).toBe(true);
  });
});
