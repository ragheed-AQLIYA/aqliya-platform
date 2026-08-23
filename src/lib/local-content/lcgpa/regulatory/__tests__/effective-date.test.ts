import {
  buildTimeline,
  currentRegulatoryState,
  evaluateActivation,
  evaluateExpiry,
  findExpiredDatasets,
  futureScheduledStates,
  isInForce,
  resolveForCalculation,
  resolveProductState,
  resolveRegulatoryState,
} from "../effective-date";
import { computeSemanticDiff } from "../semantic-diff";
import { clockAt, product } from "./fixtures";
import { makeDataset } from "./dataset-helpers";

const D2026 = makeDataset("LCGPA_MANDATORY_LIST_2026-01", [product("P-00421", { minimumLcPct: 40 })], {
  status: "SUPERSEDED",
  effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  effectiveTo: new Date("2026-10-01T00:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
});

const D2026_10 = makeDataset(
  "LCGPA_MANDATORY_LIST_2026-08",
  [product("P-00421", { minimumLcPct: 50, effectiveFrom: new Date("2026-10-01T00:00:00.000Z") })],
  {
    status: "ACTIVE",
    effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
    createdAt: new Date("2026-08-21T00:00:00.000Z"),
  },
);

const D2027 = makeDataset(
  "LCGPA_MANDATORY_LIST_2027-01",
  [product("P-00421", { minimumLcPct: 55 })],
  {
    status: "APPROVED",
    effectiveFrom: new Date("2027-01-01T00:00:00.000Z"),
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
  },
);

const ALL = [D2026, D2026_10, D2027];

describe("LCGPA regulatory :: in-force test (§18)", () => {
  it("is not in force before the effective date", () => {
    expect(isInForce(D2026_10, new Date("2026-09-30T00:00:00.000Z"))).toBe(false);
    expect(isInForce(D2026_10, new Date("2026-10-01T00:00:00.000Z"))).toBe(true);
  });

  it("is not in force after the expiry date", () => {
    expect(isInForce(D2026, new Date("2026-10-01T00:00:00.000Z"))).toBe(false);
    expect(isInForce(D2026, new Date("2026-09-30T00:00:00.000Z"))).toBe(true);
  });

  it("a dataset with NO stated effective date is never asserted to be in force (§45)", () => {
    const noDate = makeDataset("no-date", [product("P-001")], { effectiveFrom: null });
    expect(isInForce(noDate, new Date("2030-01-01T00:00:00.000Z"))).toBe(false);
  });
});

describe("LCGPA regulatory :: temporal resolution (§18, §20)", () => {
  it("resolves the HISTORICAL dataset for a past date", () => {
    const state = resolveRegulatoryState(ALL, new Date("2026-05-01T00:00:00.000Z"));
    expect(state.dataset?.datasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-01");
  });

  it("resolves the CURRENT dataset for today", () => {
    const state = currentRegulatoryState(ALL, new Date("2026-11-01T00:00:00.000Z"));
    expect(state.dataset?.datasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-08");
  });

  it("NEVER applies a FUTURE dataset before its effective date (§18)", () => {
    const state = resolveRegulatoryState(ALL, new Date("2026-11-01T00:00:00.000Z"));
    expect(state.dataset?.datasetVersion).not.toBe("LCGPA_MANDATORY_LIST_2027-01");
  });

  it("does NOT silently fall back to the newest dataset", () => {
    const state = resolveRegulatoryState(ALL, new Date("2025-01-01T00:00:00.000Z"));
    expect(state.dataset).toBeNull();
    expect(state.rationale).toMatch(/NO_STATE_RESOLVED/);
  });

  it("explains when datasets exist but state no effective date", () => {
    const noDate = makeDataset("no-date", [product("P-001")], {
      effectiveFrom: null,
      status: "ACTIVE",
    });
    const state = resolveRegulatoryState([noDate], new Date("2026-11-01T00:00:00.000Z"));
    expect(state.dataset).toBeNull();
    expect(state.rationale).toMatch(/never inferred/);
    expect(state.considered).toContain("no-date");
  });

  it("lists FUTURE scheduled states (§19)", () => {
    const future = futureScheduledStates(ALL, new Date("2026-11-01T00:00:00.000Z"));
    expect(future.map((d) => d.datasetVersion)).toEqual([
      "LCGPA_MANDATORY_LIST_2027-01",
    ]);
  });
});

describe("LCGPA regulatory :: product-level resolution (§20, §45)", () => {
  it("resolves a product with its dataset and rule version", () => {
    const result = resolveProductState(ALL, "P-00421", new Date("2026-11-01T00:00:00.000Z"));
    expect(result.outcome).toBe("RESOLVED");
    expect(result.product?.minimumLcPct).toBe(50);
    expect(result.datasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-08");
    expect(result.ruleVersion).toBe("2026-01");
    expect(result.provenance?.artifactSha256).toBeTruthy();
  });

  it("returns UNKNOWN for a product absent from the dataset in force", () => {
    const result = resolveProductState(ALL, "P-99999", new Date("2026-11-01T00:00:00.000Z"));
    expect(result.outcome).toBe("UNKNOWN");
    expect(result.product).toBeNull();
    expect(result.rationale).toMatch(/PRODUCT_NOT_IN_FORCE/);
  });

  it("returns UNKNOWN when the product itself is not yet effective", () => {
    const dataset = makeDataset(
      "v",
      [product("P-1", { effectiveFrom: new Date("2027-06-01T00:00:00.000Z") })],
      { status: "ACTIVE", effectiveFrom: new Date("2026-01-01T00:00:00.000Z") },
    );
    const result = resolveProductState([dataset], "P-1", new Date("2026-11-01T00:00:00.000Z"));
    expect(result.rationale).toMatch(/PRODUCT_NOT_YET_EFFECTIVE/);
  });

  it("returns UNKNOWN when the product has expired", () => {
    const dataset = makeDataset(
      "v",
      [product("P-1", { effectiveTo: new Date("2026-06-01T00:00:00.000Z") })],
      { status: "ACTIVE", effectiveFrom: new Date("2026-01-01T00:00:00.000Z") },
    );
    const result = resolveProductState([dataset], "P-1", new Date("2026-11-01T00:00:00.000Z"));
    expect(result.rationale).toMatch(/PRODUCT_EXPIRED/);
  });
});

describe("LCGPA regulatory :: calculation binding (§20)", () => {
  it("binds a calculation to the versions that applied on its date", () => {
    const historical = resolveForCalculation(ALL, {
      calculationDate: new Date("2026-05-01T00:00:00.000Z"),
      productCodes: ["P-00421"],
    });
    expect(historical.datasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-01");
    expect(historical.products[0].product?.minimumLcPct).toBe(40);
    expect(historical.complete).toBe(true);
  });

  it("gives a DIFFERENT answer for a later calculation date", () => {
    const later = resolveForCalculation(ALL, {
      calculationDate: new Date("2026-11-01T00:00:00.000Z"),
      productCodes: ["P-00421"],
    });
    expect(later.products[0].product?.minimumLcPct).toBe(50);
  });

  it("REFUSES to resolve without an explicit calculation date", () => {
    expect(() =>
      resolveForCalculation(ALL, {
        calculationDate: undefined as unknown as Date,
        productCodes: ["P-00421"],
      }),
    ).toThrow(/CALCULATION_DATE_REQUIRED/);
    expect(() =>
      resolveForCalculation(ALL, {
        calculationDate: new Date("nonsense"),
        productCodes: [],
      }),
    ).toThrow(/CALCULATION_DATE_REQUIRED/);
  });

  it("reports unresolved products rather than substituting values", () => {
    const result = resolveForCalculation(ALL, {
      calculationDate: new Date("2026-11-01T00:00:00.000Z"),
      productCodes: ["P-00421", "P-UNKNOWN"],
    });
    expect(result.complete).toBe(false);
    expect(result.unresolved).toEqual(["P-UNKNOWN"]);
  });
});

describe("LCGPA regulatory :: activation eligibility (§18, §25)", () => {
  it("REFUSES to activate before the effective date", () => {
    const decision = evaluateActivation(
      { ...D2027, status: "PUBLISHED" },
      new Date("2026-11-01T00:00:00.000Z"),
    );
    expect(decision.eligible).toBe(false);
    expect(decision.reason).toMatch(/NOT_YET_EFFECTIVE/);
    expect(decision.activateAt?.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("ALLOWS activation once the effective date has arrived", () => {
    const decision = evaluateActivation(
      { ...D2027, status: "PUBLISHED" },
      new Date("2027-01-02T00:00:00.000Z"),
    );
    expect(decision.eligible).toBe(true);
  });

  it("REFUSES to activate a dataset that is not approved", () => {
    const decision = evaluateActivation(
      { ...D2027, status: "PENDING_REVIEW" },
      new Date("2027-01-02T00:00:00.000Z"),
    );
    expect(decision.reason).toMatch(/NOT_APPROVED/);
  });

  it("REFUSES to activate when the effective date is unknown (§45)", () => {
    const decision = evaluateActivation(
      { ...D2027, status: "APPROVED", effectiveFrom: null },
      new Date("2027-01-02T00:00:00.000Z"),
    );
    expect(decision.reason).toMatch(/EFFECTIVE_DATE_UNKNOWN/);
  });
});

describe("LCGPA regulatory :: timeline (§37)", () => {
  it("merges publication, detection, diff, activation and effect into one order", () => {
    const diff = computeSemanticDiff({
      before: D2026,
      after: D2026_10,
      clock: clockAt("2026-08-21T02:00:00.000Z"),
    });
    const timeline = buildTimeline(
      [D2026, { ...D2026_10, activatedAt: new Date("2026-10-01T00:00:00.000Z") }],
      diff.changes,
    );
    const times = timeline.map((t) => t.at.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(timeline.some((t) => t.kind === "PUBLISHED")).toBe(true);
    expect(timeline.some((t) => t.kind === "ACTIVATED")).toBe(true);
    expect(timeline.some((t) => t.kind === "EFFECTIVE")).toBe(true);
    expect(timeline.some((t) => t.kind === "DIFFED")).toBe(true);
  });
});

describe("LCGPA regulatory :: expiry sweep (§18, §50)", () => {
  const EXPIRED_DATASET = makeDataset(
    "LCGPA_MANDATORY_LIST_EXPIRED",
    [product("P-00100", { minimumLcPct: 30 })],
    {
      status: "ACTIVE",
      effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
      effectiveTo: new Date("2026-06-30T00:00:00.000Z"),
      activatedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  );

  const ACTIVE_NO_EXPIRY = makeDataset(
    "LCGPA_MANDATORY_LIST_OPEN",
    [product("P-00200", { minimumLcPct: 50 })],
    {
      status: "ACTIVE",
      effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
      effectiveTo: null,
    },
  );

  const FUTURE_EXPIRY = makeDataset(
    "LCGPA_MANDATORY_LIST_FUTURE",
    [product("P-00300", { minimumLcPct: 45 })],
    {
      status: "ACTIVE",
      effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
      effectiveTo: new Date("2027-12-31T00:00:00.000Z"),
    },
  );

  const SUPERSEDED = makeDataset(
    "LCGPA_MANDATORY_LIST_OLD",
    [product("P-00400")],
    {
      status: "SUPERSEDED",
      effectiveFrom: new Date("2025-01-01T00:00:00.000Z"),
      effectiveTo: new Date("2025-12-31T00:00:00.000Z"),
    },
  );

  describe("evaluateExpiry", () => {
    it("marks ACTIVE dataset as expired when effectiveTo has passed", () => {
      const decision = evaluateExpiry(EXPIRED_DATASET, new Date("2026-07-01T00:00:00.000Z"));
      expect(decision.expired).toBe(true);
      expect(decision.reason).toMatch(/EXPIRED/);
      expect(decision.effectiveTo?.toISOString()).toBe("2026-06-30T00:00:00.000Z");
    });

    it("marks ACTIVE dataset as not expired when effectiveTo has not yet passed", () => {
      const decision = evaluateExpiry(FUTURE_EXPIRY, new Date("2026-07-01T00:00:00.000Z"));
      expect(decision.expired).toBe(false);
      expect(decision.reason).toMatch(/IN_FORCE/);
    });

    it("marks ACTIVE dataset with no effectiveTo as not expired (§45)", () => {
      const decision = evaluateExpiry(ACTIVE_NO_EXPIRY, new Date("2030-01-01T00:00:00.000Z"));
      expect(decision.expired).toBe(false);
      expect(decision.reason).toMatch(/NO_EXPIRY_DATE/);
      expect(decision.effectiveTo).toBeNull();
    });

    it("ignores non-ACTIVE datasets regardless of effectiveTo", () => {
      const decision = evaluateExpiry(SUPERSEDED, new Date("2026-07-01T00:00:00.000Z"));
      expect(decision.expired).toBe(false);
      expect(decision.reason).toMatch(/NOT_ACTIVE/);
    });

    it("treats the exact effectiveTo moment as expired", () => {
      const decision = evaluateExpiry(
        EXPIRED_DATASET,
        new Date("2026-06-30T00:00:00.000Z"),
      );
      expect(decision.expired).toBe(true);
    });
  });

  describe("findExpiredDatasets", () => {
    it("returns only ACTIVE datasets past their effectiveTo", () => {
      const now = new Date("2026-07-01T00:00:00.000Z");
      const expired = findExpiredDatasets(
        [EXPIRED_DATASET, ACTIVE_NO_EXPIRY, FUTURE_EXPIRY, SUPERSEDED],
        now,
      );
      expect(expired).toHaveLength(1);
      expect(expired[0].datasetVersion).toBe("LCGPA_MANDATORY_LIST_EXPIRED");
    });

    it("returns empty array when no datasets are expired", () => {
      const now = new Date("2026-03-01T00:00:00.000Z");
      const expired = findExpiredDatasets(
        [EXPIRED_DATASET, ACTIVE_NO_EXPIRY, FUTURE_EXPIRY],
        now,
      );
      expect(expired).toHaveLength(0);
    });

    it("returns empty array for an empty dataset list", () => {
      const expired = findExpiredDatasets([], new Date("2030-01-01T00:00:00.000Z"));
      expect(expired).toHaveLength(0);
    });
  });
});
