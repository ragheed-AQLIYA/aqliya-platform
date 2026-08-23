import {
  bindCalculation,
  canRecordCalculation,
  renderBinding,
} from "../calculation-binding";
import {
  describeCoverage,
  renderCoverage,
  unresolvableEntities,
} from "../persistence/impact-resolver";
import { product } from "./fixtures";
import { makeDataset } from "./dataset-helpers";

const OLD = makeDataset("LCGPA_MANDATORY_LIST_2026-01", [product("2353", { minimumLcPct: 40 })], {
  status: "SUPERSEDED",
  effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  effectiveTo: new Date("2026-10-01T00:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
});

const CURRENT = makeDataset("LCGPA_MANDATORY_LIST_2026-08", [product("2353", { minimumLcPct: 50 })], {
  status: "ACTIVE",
  effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
  createdAt: new Date("2026-08-21T00:00:00.000Z"),
});

const DATASETS = [OLD, CURRENT];

describe("LCGPA regulatory :: calculation binding (§20, §36)", () => {
  it("binds a calculation to the dataset in force on its own date", () => {
    const binding = bindCalculation({
      datasets: DATASETS,
      calculationDate: new Date("2026-05-01T00:00:00.000Z"),
      productCodes: ["2353"],
    });
    expect(binding.regulatoryDatasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-01");
    expect(binding.regulatoryArtifactSha256).toBe(OLD.artifactSha256);
    expect(binding.ruleVersion).toBe("2026-01");
    expect(binding.resolution[0].minimumLcPct).toBe(40);
    expect(binding.complete).toBe(true);
  });

  it("binds a later calculation to a different version — no implicit latest", () => {
    const binding = bindCalculation({
      datasets: DATASETS,
      calculationDate: new Date("2026-11-01T00:00:00.000Z"),
      productCodes: ["2353"],
    });
    expect(binding.regulatoryDatasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-08");
    expect(binding.resolution[0].minimumLcPct).toBe(50);
  });

  it("records UNKNOWN rather than substituting a value", () => {
    const binding = bindCalculation({
      datasets: DATASETS,
      calculationDate: new Date("2026-11-01T00:00:00.000Z"),
      productCodes: ["2353", "9999"],
    });
    expect(binding.complete).toBe(false);
    expect(binding.unresolved).toEqual(["9999"]);
    const unknown = binding.resolution.find((r) => r.productCode === "9999");
    expect(unknown?.outcome).toBe("UNKNOWN");
    expect(unknown?.minimumLcPct).toBeNull();
    expect(unknown?.rationale).toMatch(/PRODUCT_NOT_IN_FORCE/);
  });

  it("REFUSES a calculation date that was never supplied", () => {
    expect(() =>
      bindCalculation({
        datasets: DATASETS,
        calculationDate: undefined as unknown as Date,
        productCodes: [],
      }),
    ).toThrow(/CALCULATION_DATE_REQUIRED/);
  });

  it("carries no dataset when nothing was in force", () => {
    const binding = bindCalculation({
      datasets: DATASETS,
      calculationDate: new Date("2020-01-01T00:00:00.000Z"),
      productCodes: ["2353"],
    });
    expect(binding.regulatoryDatasetVersion).toBeNull();
    expect(binding.regulatoryArtifactSha256).toBeNull();
    expect(binding.ruleVersion).toBe("2026-01");
  });
});

describe("LCGPA regulatory :: recording gate", () => {
  const bound = bindCalculation({
    datasets: DATASETS,
    calculationDate: new Date("2026-11-01T00:00:00.000Z"),
    productCodes: ["2353"],
  });
  const incomplete = bindCalculation({
    datasets: DATASETS,
    calculationDate: new Date("2026-11-01T00:00:00.000Z"),
    productCodes: ["2353", "9999"],
  });
  const unbound = bindCalculation({
    datasets: DATASETS,
    calculationDate: new Date("2020-01-01T00:00:00.000Z"),
    productCodes: [],
  });

  it("permits a fully-resolved calculation", () => {
    const gate = canRecordCalculation(bound);
    expect(gate.allowed).toBe(true);
    expect(gate.reason).toMatch(/BOUND: LCGPA_MANDATORY_LIST_2026-08/);
  });

  it("REFUSES an unbound calculation by default", () => {
    expect(canRecordCalculation(unbound).allowed).toBe(false);
    expect(canRecordCalculation(unbound).reason).toMatch(/REGULATORY_STATE_UNRESOLVED/);
  });

  it("REFUSES an incompletely-resolved calculation by default", () => {
    const gate = canRecordCalculation(incomplete);
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/PRODUCTS_UNRESOLVED.*9999/);
  });

  it("allows both only under an explicit policy", () => {
    expect(canRecordCalculation(unbound, { allowUnboundDataset: true }).allowed).toBe(true);
    expect(
      canRecordCalculation(incomplete, { allowIncompleteResolution: true }).allowed,
    ).toBe(true);
  });

  it("renders the binding for an operator", () => {
    const rendered = renderBinding(bound);
    expect(rendered).toMatch(/Dataset: {10}LCGPA_MANDATORY_LIST_2026-08/);
    expect(rendered).toMatch(/Rule version: {5}2026-01/);
    expect(rendered).toMatch(/Resolved: {9}1\/1/);
  });
});

describe("LCGPA regulatory :: impact resolver coverage (§45)", () => {
  it("declares which entity classes it can and cannot resolve", () => {
    const coverage = describeCoverage();
    expect(coverage.find((c) => c.entity === "calculationIds")?.state).toBe("RESOLVED");
    expect(coverage.find((c) => c.entity === "projectIds")?.state).toBe("DERIVED");
    expect(coverage.find((c) => c.entity === "contractIds")?.state).toBe("NOT_LINKED");
  });

  it("names the entity classes whose emptiness means UNKNOWN, not zero", () => {
    expect(unresolvableEntities()).toEqual(["contractIds"]);
  });

  it("explains every entity class", () => {
    for (const entry of describeCoverage()) {
      expect(entry.explanation.length).toBeGreaterThan(20);
    }
    expect(renderCoverage()).toMatch(/NOT_LINKED\s+contractIds/);
  });
});
