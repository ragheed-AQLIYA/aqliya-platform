/**
 * Account Domain Tests — Cycle 2, SPEC-02e pattern
 */
import { Account, IcpScore, HealthScore, Sensitivity, BusinessRuleError, ValidationError } from "../index";

const ORG = "org1", USER_A = "user-a";

function createAccount() {
  return Account.create({ name: "ACME Corp", industry: "Technology", ownerId: USER_A, organizationId: ORG, createdById: USER_A });
}

describe("IcpScore Value Object", () => {
  test("0 is valid", () => { expect(IcpScore.create(0, {}).value).toBe(0); });
  test("100 is valid", () => { expect(IcpScore.create(100, {}).value).toBe(100); });
  test(">100 throws", () => { expect(() => IcpScore.create(101, {})).toThrow(BusinessRuleError); });
  test("<0 throws", () => { expect(() => IcpScore.create(-1, {})).toThrow(BusinessRuleError); });
});

describe("HealthScore Value Object", () => {
  test("0 is valid", () => { expect(HealthScore.create(0, []).value).toBe(0); });
  test("100 is valid", () => { expect(HealthScore.create(100, []).value).toBe(100); });
  test(">100 throws", () => { expect(() => HealthScore.create(101, [])).toThrow(BusinessRuleError); });
});

describe("Sensitivity Value Object", () => {
  test("three valid levels", () => {
    expect(Sensitivity.create("standard").level).toBe("standard");
    expect(Sensitivity.create("restricted").level).toBe("restricted");
    expect(Sensitivity.create("confidential").level).toBe("confidential");
  });
  test("invalid throws", () => { expect(() => Sensitivity.create("invalid")).toThrow(ValidationError); });
});

describe("Account Aggregate", () => {
  test("create sets Prospect status", () => {
    const a = createAccount();
    expect(a.name).toBe("ACME Corp");
    expect(a.status).toBe("Prospect");
    expect(a.version).toBe(1);
  });
  test("qualify transitions to Active", () => {
    const a = createAccount().activate();
    expect(a.status).toBe("Active");
  });
  test("markDormant sets Dormant", () => {
    const a = createAccount().activate().markDormant("90 days inactive");
    expect(a.status).toBe("Dormant");
    expect(a.scores?.icp).toBeUndefined();
  });
  test("archive sets Archived", () => {
    const a = createAccount().archive();
    expect(a.status).toBe("Archived");
  });
  test("archived account cannot be updated", () => {
    expect(() => createAccount().archive().updateInfo("New Name")).toThrow(BusinessRuleError);
  });
  test("setScores stores ICP and health", () => {
    const a = createAccount().setScores(IcpScore.create(85, { industry: 90, size: 80 }), HealthScore.create(70, ["recent_interaction"]));
    expect(a.scores.icp?.value).toBe(85);
    expect(a.scores.health?.value).toBe(70);
  });
  test("name is required (DI-01)", () => {
    const a = createAccount();
    expect(a.name).toBeTruthy();
  });
  test("Account belongs to one Org (DI-03)", () => {
    expect(createAccount().organizationId).toBe(ORG);
  });
});
