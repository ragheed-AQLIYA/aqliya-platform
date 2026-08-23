import {
  ALLOWED_TRANSITIONS,
  DEFAULT_AUTO_APPROVAL_POLICY,
  SYSTEM_PRINCIPAL,
  activateDataset,
  approveCase,
  assertGovernedActivation,
  autoApproveCase,
  canTransition,
  createGovernanceCase,
  evaluateAutoApproval,
  expireDataset,
  publishCase,
  publishDataset,
  rejectCase,
  requestReview,
  rollbackDataset,
  transitionCase,
} from "../governance";
import { computeSemanticDiff } from "../semantic-diff";
import { decideRuleVersion, ACTIVE_RULE_VERSION } from "../versioning";
import type { GovernanceCase } from "../types";
import { clockAt, product, steppingClock, verifiedTier1Source, tier2Source } from "./fixtures";
import { makeDataset } from "./dataset-helpers";

const CLOCK = steppingClock("2026-09-01T02:00:00.000Z", 1000);
const REVIEWER = { actorId: "user-reg-officer-1", actorName: "Reg Officer", correlationId: "corr-1" };

function freshCase(clock = CLOCK): GovernanceCase {
  return createGovernanceCase(
    {
      sourceId: "lcgpa-mandatory-list-documents",
      artifactSha256: "a".repeat(64),
      datasetVersion: "LCGPA_MANDATORY_LIST_2026-08",
      correlationId: "corr-1",
    },
    clock,
  );
}

/** Drive a case through the automated stages to PENDING_REVIEW. */
function toPendingReview(clock = CLOCK): GovernanceCase {
  let c = freshCase(clock);
  for (const to of ["VERIFIED", "PARSED", "DIFFED", "CLASSIFIED", "IMPACT_ANALYZED"] as const) {
    c = transitionCase(c, {
      to,
      actorId: SYSTEM_PRINCIPAL,
      reason: `advance to ${to}`,
      correlationId: "corr-1",
      clock,
    });
  }
  return requestReview(c, "DIFF-1", "IMP-1", { ...REVIEWER, clock });
}

describe("LCGPA regulatory :: lifecycle state machine (§24)", () => {
  it("opens at DETECTED with an attributable transition", () => {
    const c = freshCase();
    expect(c.state).toBe("DETECTED");
    expect(c.history).toHaveLength(1);
    expect(c.history[0].actorId).toBe(SYSTEM_PRINCIPAL);
  });

  it("permits only the documented transitions", () => {
    expect(canTransition("DETECTED", "VERIFIED")).toBe(true);
    expect(canTransition("DETECTED", "ACTIVE")).toBe(false);
    expect(canTransition("PENDING_REVIEW", "APPROVED")).toBe(true);
    expect(canTransition("REJECTED", "APPROVED")).toBe(false);
    expect(ALLOWED_TRANSITIONS.REJECTED).toEqual([]);
  });

  it("THROWS on an illegal transition — there is no force path", () => {
    expect(() =>
      transitionCase(freshCase(), {
        to: "ACTIVE",
        actorId: "user-1",
        reason: "shortcut",
        correlationId: "c",
        clock: CLOCK,
      }),
    ).toThrow(/ILLEGAL_TRANSITION: DETECTED → ACTIVE/);
  });

  it("REQUIRES an actor on every transition", () => {
    expect(() =>
      transitionCase(freshCase(), {
        to: "VERIFIED",
        actorId: "",
        reason: "r",
        correlationId: "c",
        clock: CLOCK,
      }),
    ).toThrow(/ACTOR_REQUIRED/);
  });

  it("appends to history without losing prior transitions", () => {
    const c = toPendingReview();
    expect(c.state).toBe("PENDING_REVIEW");
    expect(c.history.map((h) => h.to)).toEqual([
      "DETECTED",
      "VERIFIED",
      "PARSED",
      "DIFFED",
      "CLASSIFIED",
      "IMPACT_ANALYZED",
      "PENDING_REVIEW",
    ]);
    expect(c.diffId).toBe("DIFF-1");
    expect(c.impactId).toBe("IMP-1");
  });
});

describe("LCGPA regulatory :: human approval (§48)", () => {
  it("records an attributable approval", () => {
    const approved = approveCase(toPendingReview(), {
      ...REVIEWER,
      clock: CLOCK,
      note: "Verified against the official artifact.",
    });
    expect(approved.state).toBe("APPROVED");
    expect(approved.approval?.approvedById).toBe("user-reg-officer-1");
    expect(approved.approval?.automatic).toBe(false);
  });

  it("REFUSES approval by a system principal", () => {
    expect(() =>
      approveCase(toPendingReview(), {
        actorId: SYSTEM_PRINCIPAL,
        correlationId: "c",
        clock: CLOCK,
        note: "auto",
      }),
    ).toThrow(/HUMAN_APPROVAL_REQUIRED/);
  });

  it("records a rejection with a mandatory reason", () => {
    const rejected = rejectCase(toPendingReview(), {
      ...REVIEWER,
      clock: CLOCK,
      reason: "Source artifact could not be confirmed.",
    });
    expect(rejected.state).toBe("REJECTED");
    expect(rejected.rejection?.reason).toMatch(/could not be confirmed/);
    expect(() =>
      rejectCase(toPendingReview(), { ...REVIEWER, clock: CLOCK, reason: "" }),
    ).toThrow(/REJECTION_REASON_REQUIRED/);
  });

  it("REFUSES to publish without an approval record", () => {
    expect(() => publishCase(toPendingReview(), { ...REVIEWER, clock: CLOCK })).toThrow(
      /PUBLISH_WITHOUT_APPROVAL/,
    );
  });
});

describe("LCGPA regulatory :: auto-approval policy (§24)", () => {
  const labelDiff = computeSemanticDiff({
    before: makeDataset("v1", [product("P-001", { productNameAr: "أ" })]),
    after: makeDataset("v2", [product("P-001", { productNameAr: "ب" })]),
    clock: clockAt("2026-09-01T02:00:00.000Z"),
  });
  const lcDiff = computeSemanticDiff({
    before: makeDataset("v1", [product("P-001", { minimumLcPct: 40 })]),
    after: makeDataset("v2", [product("P-001", { minimumLcPct: 50 })]),
    clock: clockAt("2026-09-01T02:00:00.000Z"),
  });

  it("is DISABLED by default — human review is the default path", () => {
    expect(DEFAULT_AUTO_APPROVAL_POLICY.enabled).toBe(false);
    const decision = evaluateAutoApproval(
      DEFAULT_AUTO_APPROVAL_POLICY,
      labelDiff,
      verifiedTier1Source(),
    );
    expect(decision.eligible).toBe(false);
    expect(decision.reason).toMatch(/POLICY_DISABLED/);
  });

  it("permits label-only changes when explicitly enabled", () => {
    const decision = evaluateAutoApproval(
      { ...DEFAULT_AUTO_APPROVAL_POLICY, enabled: true },
      labelDiff,
      verifiedTier1Source(),
    );
    expect(decision.eligible).toBe(true);
  });

  it("REFUSES a change type outside the policy", () => {
    const decision = evaluateAutoApproval(
      { ...DEFAULT_AUTO_APPROVAL_POLICY, enabled: true },
      lcDiff,
      verifiedTier1Source(),
    );
    expect(decision.eligible).toBe(false);
    expect(decision.reason).toMatch(/CHANGE_TYPE_NOT_ALLOWED.*MINIMUM_LC_CHANGED/);
  });

  it("REFUSES a source below the required tier", () => {
    const decision = evaluateAutoApproval(
      { ...DEFAULT_AUTO_APPROVAL_POLICY, enabled: true },
      labelDiff,
      tier2Source(),
    );
    expect(decision.reason).toMatch(/TIER_INSUFFICIENT/);
  });

  it("REFUSES when the change count exceeds the policy", () => {
    const decision = evaluateAutoApproval(
      { ...DEFAULT_AUTO_APPROVAL_POLICY, enabled: true, maxChangeCount: 0 },
      labelDiff,
      verifiedTier1Source(),
    );
    expect(decision.reason).toMatch(/CHANGE_COUNT_EXCEEDED/);
  });

  it("REFUSES when severity exceeds the policy ceiling", () => {
    const decision = evaluateAutoApproval(
      {
        ...DEFAULT_AUTO_APPROVAL_POLICY,
        enabled: true,
        allowedChangeTypes: ["MINIMUM_LC_CHANGED"],
      },
      lcDiff,
      verifiedTier1Source(),
    );
    expect(decision.reason).toMatch(/SEVERITY_EXCEEDED/);
  });

  it("records an auditable automatic approval", () => {
    let c = freshCase();
    for (const to of ["VERIFIED", "PARSED", "DIFFED", "CLASSIFIED", "IMPACT_ANALYZED"] as const) {
      c = transitionCase(c, {
        to,
        actorId: SYSTEM_PRINCIPAL,
        reason: "advance",
        correlationId: "c",
        clock: CLOCK,
      });
    }
    const decision = evaluateAutoApproval(
      { ...DEFAULT_AUTO_APPROVAL_POLICY, enabled: true },
      labelDiff,
      verifiedTier1Source(),
    );
    const approved = autoApproveCase(c, decision, {
      actorId: SYSTEM_PRINCIPAL,
      correlationId: "c",
      clock: CLOCK,
    });
    expect(approved.state).toBe("AUTO_APPROVED");
    expect(approved.approval?.automatic).toBe(true);
    expect(approved.approval?.policyId).toBe("AUTO-LABEL-ONLY-V1");
  });

  it("THROWS when auto-approval is attempted without eligibility", () => {
    expect(() =>
      autoApproveCase(
        toPendingReview(),
        { eligible: false, policyId: "P", reason: "POLICY_DISABLED" },
        { actorId: SYSTEM_PRINCIPAL, correlationId: "c", clock: CLOCK },
      ),
    ).toThrow(/AUTO_APPROVAL_REFUSED/);
  });
});

describe("LCGPA regulatory :: publication and activation (§25)", () => {
  const dataset = makeDataset("LCGPA_MANDATORY_LIST_2026-08", [product("P-001")], {
    status: "APPROVED",
    effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
  });

  function approvedCase(): GovernanceCase {
    return approveCase(toPendingReview(), {
      ...REVIEWER,
      clock: CLOCK,
      note: "approved",
    });
  }

  it("publishes an approved dataset without putting it into use", () => {
    const { dataset: published, case: c } = publishDataset(dataset, approvedCase(), {
      ...REVIEWER,
      clock: CLOCK,
    });
    expect(published.status).toBe("PUBLISHED");
    expect(published.activatedAt).toBeNull();
    expect(c.state).toBe("PUBLISHED");
  });

  it("REFUSES to publish an unapproved case", () => {
    expect(() => publishDataset(dataset, toPendingReview(), { ...REVIEWER, clock: CLOCK })).toThrow(
      /PUBLISH_BLOCKED/,
    );
  });

  it("REFUSES activation before the effective date", () => {
    const { dataset: published, case: c } = publishDataset(dataset, approvedCase(), {
      ...REVIEWER,
      clock: CLOCK,
    });
    const result = activateDataset(published, c, {
      ...REVIEWER,
      clock: clockAt("2026-09-15T00:00:00.000Z"),
      currentActive: null,
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/NOT_YET_EFFECTIVE/);
    expect(result.activated).toBeNull();
  });

  it("activates once effective and supersedes the previous dataset", () => {
    const previous = makeDataset("LCGPA_MANDATORY_LIST_2026-01", [product("P-001")], {
      status: "ACTIVE",
    });
    const { dataset: published, case: c } = publishDataset(dataset, approvedCase(), {
      ...REVIEWER,
      clock: CLOCK,
    });
    const result = activateDataset(published, c, {
      ...REVIEWER,
      clock: clockAt("2026-10-02T00:00:00.000Z"),
      currentActive: previous,
    });
    expect(result.ok).toBe(true);
    expect(result.activated?.status).toBe("ACTIVE");
    expect(result.activated?.activatedAt?.toISOString()).toBe(
      "2026-10-02T00:00:00.000Z",
    );
    expect(result.superseded?.status).toBe("SUPERSEDED");
    expect(result.case.state).toBe("ACTIVE");
  });

  it("REFUSES activation when the case has not been published", () => {
    const result = activateDataset(
      { ...dataset, status: "PUBLISHED" },
      approvedCase(),
      { ...REVIEWER, clock: clockAt("2026-10-02T00:00:00.000Z"), currentActive: null },
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/ACTIVATION_BLOCKED/);
  });
});

describe("LCGPA regulatory :: silent-mutation guard (§25)", () => {
  it("detects an ACTIVE dataset whose case never reached ACTIVE", () => {
    const dataset = makeDataset("v", [product("P-001")], {
      status: "ACTIVE",
      activatedAt: new Date("2026-10-01T00:00:00.000Z"),
    });
    expect(() => assertGovernedActivation(dataset, toPendingReview())).toThrow(
      /SILENT_MUTATION_DETECTED/,
    );
  });

  it("ignores datasets that are not ACTIVE", () => {
    const dataset = makeDataset("v", [product("P-001")], { status: "DRAFT" });
    expect(() => assertGovernedActivation(dataset, toPendingReview())).not.toThrow();
  });
});

describe("LCGPA regulatory :: rollback (§50)", () => {
  const active = makeDataset("LCGPA_MANDATORY_LIST_2026-08", [product("P-001")], {
    status: "ACTIVE",
    activatedAt: new Date("2026-10-02T00:00:00.000Z"),
  });
  const previous = makeDataset("LCGPA_MANDATORY_LIST_2026-01", [product("P-001")], {
    status: "SUPERSEDED",
  });

  function activeCase(): GovernanceCase {
    const approved = approveCase(toPendingReview(), { ...REVIEWER, clock: CLOCK, note: "ok" });
    const published = publishCase(approved, { ...REVIEWER, clock: CLOCK });
    return transitionCase(published, {
      to: "ACTIVE",
      actorId: REVIEWER.actorId,
      reason: "effective",
      correlationId: "c",
      clock: CLOCK,
    });
  }

  it("quarantines the invalid dataset and restores the previous one", () => {
    const result = rollbackDataset(active, previous, activeCase(), {
      ...REVIEWER,
      clock: clockAt("2026-10-05T00:00:00.000Z"),
      reason: "Parsed rows did not match the official artifact.",
    });
    expect(result.quarantined.status).toBe("QUARANTINED");
    expect(result.quarantined.artifactSha256).toBe(active.artifactSha256);
    expect(result.restored?.status).toBe("ACTIVE");
    expect(result.case.state).toBe("ROLLED_BACK");
  });

  it("NEVER destroys the invalid dataset", () => {
    const result = rollbackDataset(active, previous, activeCase(), {
      ...REVIEWER,
      clock: CLOCK,
      reason: "invalid",
    });
    expect(result.quarantined.products).toEqual(active.products);
    expect(result.quarantined.provenance).toEqual(active.provenance);
  });

  it("REQUIRES a reason and an ACTIVE dataset", () => {
    expect(() =>
      rollbackDataset(active, previous, activeCase(), { ...REVIEWER, clock: CLOCK, reason: "" }),
    ).toThrow(/ROLLBACK_REASON_REQUIRED/);
    expect(() =>
      rollbackDataset({ ...active, status: "DRAFT" }, previous, activeCase(), {
        ...REVIEWER,
        clock: CLOCK,
        reason: "x",
      }),
    ).toThrow(/ROLLBACK_BLOCKED/);
  });

  it("handles a rollback with no previous verified dataset", () => {
    const result = rollbackDataset(active, null, activeCase(), {
      ...REVIEWER,
      clock: CLOCK,
      reason: "invalid",
    });
    expect(result.restored).toBeNull();
  });
});

describe("LCGPA regulatory :: rule vs dataset version (§42)", () => {
  it("a product-data change never bumps the rule version", () => {
    const decision = decideRuleVersion([]);
    expect(decision.requiresNewRuleVersion).toBe(false);
    expect(decision.currentRuleVersion).toBe(ACTIVE_RULE_VERSION);
    expect(decision.rationale).toMatch(/DATASET_CHANGE_ONLY/);
  });

  it("a reviewer-confirmed methodology change requires a new rule version", () => {
    const decision = decideRuleVersion(["CALCULATION_METHODOLOGY"]);
    expect(decision.requiresNewRuleVersion).toBe(true);
    expect(decision.rationale).toMatch(/RULE_CHANGE_CONFIRMED/);
  });

  it("keeps the frozen rule version at 2026-01", () => {
    expect(ACTIVE_RULE_VERSION).toBe("2026-01");
  });
});

describe("LCGPA regulatory :: dataset expiry (§18, §50)", () => {
  const activeDataset = makeDataset("LCGPA_MANDATORY_LIST_2026-08", [product("P-001")], {
    status: "ACTIVE",
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: new Date("2026-06-30T00:00:00.000Z"),
    activatedAt: new Date("2026-01-01T00:00:00.000Z"),
  });

  function activeGovernanceCase(): GovernanceCase {
    const approved = approveCase(toPendingReview(), { ...REVIEWER, clock: CLOCK, note: "ok" });
    const published = publishCase(approved, { ...REVIEWER, clock: CLOCK });
    return transitionCase(published, {
      to: "ACTIVE",
      actorId: REVIEWER.actorId,
      reason: "effective",
      correlationId: "c",
      clock: CLOCK,
    });
  }

  it("quarantines the dataset and transitions governance case to ROLLED_BACK", () => {
    const result = expireDataset(activeDataset, activeGovernanceCase(), {
      ...REVIEWER,
      clock: clockAt("2026-07-01T00:00:00.000Z"),
      reason: "EXPIRED: effectiveTo 2026-06-30 has passed",
    });
    expect(result.expired.status).toBe("QUARANTINED");
    expect(result.expired.deactivatedAt?.toISOString()).toBe("2026-07-01T00:00:00.000Z");
    expect(result.case.state).toBe("ROLLED_BACK");
  });

  it("preserves the dataset provenance and products (never destroys evidence)", () => {
    const result = expireDataset(activeDataset, activeGovernanceCase(), {
      ...REVIEWER,
      clock: clockAt("2026-07-01T00:00:00.000Z"),
      reason: "effectiveTo passed",
    });
    expect(result.expired.products).toEqual(activeDataset.products);
    expect(result.expired.provenance).toEqual(activeDataset.provenance);
    expect(result.expired.artifactSha256).toBe(activeDataset.artifactSha256);
  });

  it("REQUIRES a reason", () => {
    expect(() =>
      expireDataset(activeDataset, activeGovernanceCase(), {
        ...REVIEWER,
        clock: CLOCK,
        reason: "",
      }),
    ).toThrow(/EXPIRY_REASON_REQUIRED/);
  });

  it("REFUSES to expire a non-ACTIVE dataset", () => {
    const draft = makeDataset("v", [product("P-001")], { status: "DRAFT" });
    expect(() =>
      expireDataset(draft, activeGovernanceCase(), {
        ...REVIEWER,
        clock: CLOCK,
        reason: "expired",
      }),
    ).toThrow(/EXPIRY_BLOCKED: dataset.*is DRAFT/);
  });

  it("REFUSES when the governance case is not ACTIVE", () => {
    expect(() =>
      expireDataset(activeDataset, toPendingReview(), {
        ...REVIEWER,
        clock: CLOCK,
        reason: "expired",
      }),
    ).toThrow(/EXPIRY_BLOCKED: governance case is PENDING_REVIEW/);
  });

  it("records the expiry reason in the governance case history", () => {
    const result = expireDataset(activeDataset, activeGovernanceCase(), {
      ...REVIEWER,
      clock: clockAt("2026-07-01T00:00:00.000Z"),
      reason: "EXPIRED: effectiveTo 2026-06-30 has passed as of 2026-07-01",
    });
    const lastTransition = result.case.history[result.case.history.length - 1];
    expect(lastTransition.from).toBe("ACTIVE");
    expect(lastTransition.to).toBe("ROLLED_BACK");
    expect(lastTransition.reason).toMatch(/EXPIRED/);
    expect(lastTransition.actorId).toBe(REVIEWER.actorId);
  });
});
