import {
  EMPTY_AFFECTED,
  analyzeImpact,
  deriveImpactLevel,
  nullImpactResolver,
  renderImpactSummary,
} from "../impact-analysis";
import { computeSemanticDiff } from "../semantic-diff";
import { clockAt, ids, product, resolverReturning } from "./fixtures";
import { makeDataset } from "./dataset-helpers";

const CLOCK = clockAt("2026-09-01T02:00:00.000Z");

const LC_DIFF = computeSemanticDiff({
  before: makeDataset("v1", [product("P-00421", { minimumLcPct: 40 })]),
  after: makeDataset("v2", [
    product("P-00421", {
      minimumLcPct: 50,
      effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
    }),
  ]),
  clock: CLOCK,
});

const RENAME_DIFF = computeSemanticDiff({
  before: makeDataset("v1", [product("P-001", { productNameAr: "أ" })]),
  after: makeDataset("v2", [product("P-001", { productNameAr: "ب" })]),
  clock: CLOCK,
});

describe("LCGPA regulatory :: impact policy (§21)", () => {
  it("reports NONE when nothing is touched and nothing is severe", () => {
    const { level } = deriveImpactLevel("LOW", EMPTY_AFFECTED);
    expect(level).toBe("NONE");
  });

  it("keeps a CRITICAL change at HIGH even when nothing local is touched", () => {
    const { level, rationale } = deriveImpactLevel("CRITICAL", EMPTY_AFFECTED);
    expect(level).toBe("HIGH");
    expect(rationale).toMatch(/highest change severity CRITICAL/);
    expect(rationale).toMatch(/blast radius 0 entities/);
  });

  it("keeps a MEDIUM change at LOW when nothing local is touched", () => {
    expect(deriveImpactLevel("MEDIUM", EMPTY_AFFECTED).level).toBe("LOW");
  });

  it("escalates with blast radius", () => {
    expect(
      deriveImpactLevel("MEDIUM", { ...EMPTY_AFFECTED, reportIds: ids("R", 3) }).level,
    ).toBe("LOW");
    expect(
      deriveImpactLevel("MEDIUM", { ...EMPTY_AFFECTED, reportIds: ids("R", 30) }).level,
    ).toBe("HIGH");
    expect(
      deriveImpactLevel("MEDIUM", { ...EMPTY_AFFECTED, reportIds: ids("R", 200) }).level,
    ).toBe("CRITICAL");
  });

  it("weights binding entities more heavily than passive records", () => {
    const passive = deriveImpactLevel("LOW", {
      ...EMPTY_AFFECTED,
      reportIds: ids("R", 3),
    });
    const binding = deriveImpactLevel("LOW", {
      ...EMPTY_AFFECTED,
      calculationIds: ids("C", 3),
    });
    expect(passive.level).toBe("LOW");
    expect(binding.level).toBe("MEDIUM");
  });

  it("always explains how the level was derived", () => {
    const { rationale } = deriveImpactLevel("HIGH", {
      ...EMPTY_AFFECTED,
      calculationIds: ids("C", 14),
    });
    expect(rationale).toMatch(/blast radius 14 entities/);
    expect(rationale).toMatch(/binding entities .* 14/);
    expect(rationale).toMatch(/resolved impact/);
  });
});

describe("LCGPA regulatory :: impact assessment (§22)", () => {
  it("derives every count from the resolver — never invents one", async () => {
    const assessment = await analyzeImpact({
      diff: LC_DIFF,
      resolver: resolverReturning({
        calculationIds: ids("CALC", 14),
        tenderIds: ids("TND", 3),
        supplierIds: ids("SUP", 7),
        reportIds: ids("RPT", 2),
      }),
      clock: CLOCK,
    });
    expect(assessment.estimatedScope.calculations).toBe(14);
    expect(assessment.estimatedScope.tenders).toBe(3);
    expect(assessment.estimatedScope.suppliers).toBe(7);
    expect(assessment.estimatedScope.reports).toBe(2);
    expect(assessment.estimatedScope.projects).toBe(0);
    expect(assessment.affectedProducts).toEqual(["P-00421"]);
    expect(assessment.impactLevel).toBe("HIGH");
    expect(assessment.requiresReview).toBe(true);
  });

  it("renders the §22 operator summary", async () => {
    const assessment = await analyzeImpact({
      diff: LC_DIFF,
      resolver: resolverReturning({
        calculationIds: ids("CALC", 14),
        tenderIds: ids("TND", 3),
        supplierIds: ids("SUP", 7),
        reportIds: ids("RPT", 2),
      }),
      clock: CLOCK,
    });
    const rendered = renderImpactSummary(assessment);
    expect(rendered).toMatch(/Impact: HIGH/);
    expect(rendered).toMatch(/14 calculations/);
    expect(rendered).toMatch(/3 tenders/);
    expect(rendered).toMatch(/7 suppliers/);
    expect(rendered).toMatch(/Review: REQUIRED/);
  });

  it("reports NONE and no review for a label-only change with no affected entities", async () => {
    const assessment = await analyzeImpact({
      diff: RENAME_DIFF,
      resolver: nullImpactResolver,
      clock: CLOCK,
    });
    expect(assessment.impactLevel).toBe("NONE");
    expect(assessment.requiresReview).toBe(false);
  });

  it("reports NONE for an empty diff without calling the resolver", async () => {
    const emptyDiff = computeSemanticDiff({
      before: makeDataset("v1", [product("P-001")]),
      after: makeDataset("v2", [product("P-001")]),
      clock: CLOCK,
    });
    let called = false;
    const assessment = await analyzeImpact({
      diff: emptyDiff,
      resolver: {
        async findAffected() {
          called = true;
          return EMPTY_AFFECTED;
        },
      },
      clock: CLOCK,
    });
    expect(called).toBe(false);
    expect(assessment.impactLevel).toBe("NONE");
    expect(assessment.rationale).toMatch(/NO_CHANGES/);
  });

  it("supports filtering to a single product", async () => {
    const diff = computeSemanticDiff({
      before: makeDataset("v1", [product("P-001"), product("P-002")]),
      after: makeDataset("v2", [
        product("P-001", { minimumLcPct: 60 }),
        product("P-002", { minimumLcPct: 70 }),
      ]),
      clock: CLOCK,
    });
    const assessment = await analyzeImpact({
      diff,
      resolver: resolverReturning({ calculationIds: ids("C", 1) }),
      clock: CLOCK,
      changeFilter: (c) => c.productCode === "P-001",
    });
    expect(assessment.affectedProducts).toEqual(["P-001"]);
  });

  it("produces a deterministic impact id", async () => {
    const run = () =>
      analyzeImpact({
        diff: LC_DIFF,
        resolver: resolverReturning({ calculationIds: ids("C", 2) }),
        clock: CLOCK,
      });
    const [a, b] = await Promise.all([run(), run()]);
    expect(a.impactId).toBe(b.impactId);
  });
});
