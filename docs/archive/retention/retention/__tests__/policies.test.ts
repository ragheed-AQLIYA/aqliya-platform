import {
  DEFAULT_RETENTION_POLICIES,
  getDefaultPolicies,
  getPolicyForModel,
  getAllPolicies,
  setPolicyOverride,
  resetPolicyOverride,
} from "../policies";

describe("Retention Policies", () => {
  beforeEach(() => {
    resetPolicyOverride("PlatformAuditLog");
  });

  it("returns default policies", () => {
    const policies = getDefaultPolicies();
    expect(policies.length).toBeGreaterThan(0);
    expect(policies.find((p) => p.modelName === "PlatformAuditLog")).toBeDefined();
    expect(policies.find((p) => p.modelName === "PlatformAuditLog")?.retentionDays).toBe(365);
  });

  it("PlatformAuditLog defaults to 365 days delete", () => {
    const policy = getPolicyForModel("PlatformAuditLog");
    expect(policy).toBeDefined();
    expect(policy!.retentionDays).toBe(365);
    expect(policy!.action).toBe("delete");
    expect(policy!.enabled).toBe(true);
  });

  it("User defaults to never delete (0 days, disabled)", () => {
    const policy = getPolicyForModel("User");
    expect(policy).toBeDefined();
    expect(policy!.retentionDays).toBe(0);
    expect(policy!.enabled).toBe(false);
  });

  it("AuditEngagement defaults to 7 years archive", () => {
    const policy = getPolicyForModel("AuditEngagement");
    expect(policy).toBeDefined();
    expect(policy!.retentionDays).toBe(2555);
    expect(policy!.action).toBe("archive");
  });

  it("Decision has notifyBeforeDelete flag", () => {
    const policy = getPolicyForModel("Decision");
    expect(policy).toBeDefined();
    expect(policy!.notifyBeforeDelete).toBe(true);
  });

  it("supports per-organization overrides", () => {
    const orgId = "org-test-1";
    setPolicyOverride({
      modelName: "PlatformAuditLog",
      retentionDays: 180,
      action: "delete",
      enabled: true,
      notifyBeforeDelete: false,
      organizationId: orgId,
    });

    const policyWithOrg = getPolicyForModel("PlatformAuditLog", orgId);
    expect(policyWithOrg).toBeDefined();
    expect(policyWithOrg!.retentionDays).toBe(180);
    expect(policyWithOrg!.overridden).toBe(true);

    const policyWithoutOrg = getPolicyForModel("PlatformAuditLog");
    expect(policyWithoutOrg!.retentionDays).toBe(365);
    expect(policyWithoutOrg!.overridden).toBeUndefined();
  });

  it("resets override to default", () => {
    setPolicyOverride({
      modelName: "PlatformAuditLog",
      retentionDays: 90,
      action: "archive",
      enabled: false,
      notifyBeforeDelete: false,
    });

    expect(getPolicyForModel("PlatformAuditLog")!.retentionDays).toBe(90);

    const reset = resetPolicyOverride("PlatformAuditLog");
    expect(reset).toBe(true);

    expect(getPolicyForModel("PlatformAuditLog")!.retentionDays).toBe(365);
  });

  it("returns consistent results from getAllPolicies", () => {
    const policies = getAllPolicies();
    expect(policies.length).toBe(DEFAULT_RETENTION_POLICIES.length);

    for (const def of DEFAULT_RETENTION_POLICIES) {
      const p = policies.find((x) => x.modelName === def.modelName);
      expect(p).toBeDefined();
      expect(p!.retentionDays).toBe(def.retentionDays);
      expect(p!.action).toBe(def.action);
    }
  });

  it("handles unknown model returning undefined", () => {
    const policy = getPolicyForModel("NonExistentModel");
    expect(policy).toBeUndefined();
  });
});
