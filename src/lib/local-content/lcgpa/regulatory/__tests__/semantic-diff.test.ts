import { computeSemanticDiff, describeChange, normalizeValue } from "../semantic-diff";
import { clockAt, product } from "./fixtures";
import { makeDataset } from "./dataset-helpers";

const CLOCK = clockAt("2026-09-01T02:00:00.000Z");

function diffOf(before: ReturnType<typeof makeDataset> | null, after: ReturnType<typeof makeDataset>) {
  return computeSemanticDiff({ before, after, clock: CLOCK });
}

describe("LCGPA regulatory :: value normalisation", () => {
  it("keeps null null and trims strings", () => {
    expect(normalizeValue(null)).toBeNull();
    expect(normalizeValue(undefined)).toBeNull();
    expect(normalizeValue("  ")).toBeNull();
    expect(normalizeValue(" 40 ")).toBe("40");
  });

  it("serialises dates and sorts arrays deterministically", () => {
    expect(normalizeValue(new Date("2026-10-01T00:00:00.000Z"))).toBe(
      "2026-10-01T00:00:00.000Z",
    );
    expect(normalizeValue(["b", "a"])).toBe("a,b");
  });

  it("distinguishes 0 from null", () => {
    expect(normalizeValue(0)).toBe("0");
    expect(normalizeValue(NaN)).toBeNull();
  });
});

describe("LCGPA regulatory :: product additions and removals (§15)", () => {
  it("detects PRODUCT_ADDED", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-001")]),
      makeDataset("v2", [product("P-001"), product("P-002")]),
    );
    const added = diff.changes.filter((c) => c.changeType === "PRODUCT_ADDED");
    expect(added).toHaveLength(1);
    expect(added[0].productCode).toBe("P-002");
    expect(diff.summary.added).toBe(1);
  });

  it("detects PRODUCT_REMOVED", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-001"), product("P-002")]),
      makeDataset("v2", [product("P-001")]),
    );
    expect(diff.changes.filter((c) => c.changeType === "PRODUCT_REMOVED")).toHaveLength(1);
    expect(diff.summary.removed).toBe(1);
  });

  it("detects PRODUCT_RESTORED when a removed product returns", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-001", { regulatoryStatus: "REMOVED" })]),
      makeDataset("v2", [product("P-001", { regulatoryStatus: "ACTIVE" })]),
    );
    expect(diff.changes.some((c) => c.changeType === "PRODUCT_RESTORED")).toBe(true);
    expect(diff.changes.some((c) => c.changeType === "REGULATORY_STATUS_CHANGED")).toBe(
      false,
    );
  });

  it("reports every product as added on the FIRST observation", () => {
    const diff = diffOf(null, makeDataset("v1", [product("P-001"), product("P-002")]));
    expect(diff.datasetBefore).toBeNull();
    expect(diff.summary.added).toBe(2);
    expect(diff.summary.productsBefore).toBe(0);
  });

  it("reports no changes for identical datasets", () => {
    const products = [product("P-001"), product("P-002")];
    const diff = diffOf(makeDataset("v1", products), makeDataset("v2", products));
    expect(diff.changes).toHaveLength(0);
    expect(diff.summary.unchanged).toBe(2);
  });
});

describe("LCGPA regulatory :: field-level semantic changes (§15, §16)", () => {
  it("detects MINIMUM_LC_CHANGED with old value, new value and effective date", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-00421", { minimumLcPct: 40 })]),
      makeDataset("v2", [
        product("P-00421", {
          minimumLcPct: 50,
          effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
        }),
      ]),
    );
    const change = diff.changes.find((c) => c.changeType === "MINIMUM_LC_CHANGED");
    expect(change).toBeDefined();
    expect(change?.productCode).toBe("P-00421");
    expect(change?.field).toBe("minimumLcPct");
    expect(change?.oldValue).toBe("40");
    expect(change?.newValue).toBe("50");
    expect(change?.effectiveFrom?.toISOString()).toBe("2026-10-01T00:00:00.000Z");
    expect(change?.severity).toBe("CRITICAL");
    expect(change?.sourceArtifactBefore).toBe(
      makeDataset("v1", []).artifactSha256,
    );
  });

  it("detects PRODUCT_RENAMED", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-001", { productNameAr: "أ" })]),
      makeDataset("v2", [product("P-001", { productNameAr: "ب" })]),
    );
    expect(diff.changes.some((c) => c.changeType === "PRODUCT_RENAMED")).toBe(true);
  });

  it("detects SECTOR_CHANGED, CATEGORY_CHANGED and HS_CODE_CHANGED", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-001")]),
      makeDataset("v2", [
        product("P-001", { sectorCode: "S09", category: "CAT-B", hsCode: "841810" }),
      ]),
    );
    const types = diff.changes.map((c) => c.changeType);
    expect(types).toContain("SECTOR_CHANGED");
    expect(types).toContain("CATEGORY_CHANGED");
    expect(types).toContain("HS_CODE_CHANGED");
  });

  it("detects EFFECTIVE_DATE_CHANGED and EXPIRY_DATE_CHANGED", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-001")]),
      makeDataset("v2", [
        product("P-001", {
          effectiveFrom: new Date("2027-01-01T00:00:00.000Z"),
          effectiveTo: new Date("2030-01-01T00:00:00.000Z"),
        }),
      ]),
    );
    const types = diff.changes.map((c) => c.changeType);
    expect(types).toContain("EFFECTIVE_DATE_CHANGED");
    expect(types).toContain("EXPIRY_DATE_CHANGED");
  });

  it("detects APPLICABILITY_CHANGED", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-001", { applicability: "Government" })]),
      makeDataset("v2", [product("P-001", { applicability: "Government and SOEs" })]),
    );
    expect(diff.changes.some((c) => c.changeType === "APPLICABILITY_CHANGED")).toBe(true);
  });

  it("detects requirement additions and removals individually", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-001", { requirements: ["LC_CERTIFICATE"] })]),
      makeDataset("v2", [
        product("P-001", { requirements: ["SASO_STANDARD", "ISO_9001"] }),
      ]),
    );
    expect(
      diff.changes.filter((c) => c.changeType === "REQUIREMENT_ADDED").map((c) => c.newValue),
    ).toEqual(["ISO_9001", "SASO_STANDARD"]);
    expect(
      diff.changes.filter((c) => c.changeType === "REQUIREMENT_REMOVED"),
    ).toHaveLength(1);
  });

  it("detects PRODUCT_CODE_CHANGED instead of an unrelated add + remove", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-OLD", { productNameAr: "بلاط" })]),
      makeDataset("v2", [product("P-NEW", { productNameAr: "بلاط" })]),
    );
    const codeChange = diff.changes.find((c) => c.changeType === "PRODUCT_CODE_CHANGED");
    expect(codeChange).toBeDefined();
    expect(codeChange?.oldValue).toBe("P-OLD");
    expect(codeChange?.newValue).toBe("P-NEW");
    expect(diff.summary.added).toBe(0);
    expect(diff.summary.removed).toBe(0);
  });

  it("does NOT treat a differently-named product as a code change", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-OLD", { productNameAr: "بلاط" })]),
      makeDataset("v2", [product("P-NEW", { productNameAr: "مضخة" })]),
    );
    expect(diff.changes.some((c) => c.changeType === "PRODUCT_CODE_CHANGED")).toBe(false);
    expect(diff.summary.added).toBe(1);
    expect(diff.summary.removed).toBe(1);
  });
});

describe("LCGPA regulatory :: diff determinism (§33)", () => {
  it("produces identical change ids for identical inputs", () => {
    const before = makeDataset("v1", [product("P-001", { minimumLcPct: 40 })]);
    const after = makeDataset("v2", [product("P-001", { minimumLcPct: 50 })]);
    const a = diffOf(before, after);
    const b = diffOf(before, after);
    expect(a.diffId).toBe(b.diffId);
    expect(a.changes.map((c) => c.changeId)).toEqual(b.changes.map((c) => c.changeId));
  });

  it("sorts changes by product, type and field", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-002"), product("P-001")]),
      makeDataset("v2", [
        product("P-002", { minimumLcPct: 55 }),
        product("P-001", { sectorCode: "S09" }),
      ]),
    );
    const codes = diff.changes.map((c) => c.productCode);
    expect(codes).toEqual([...codes].sort());
  });

  it("summarises by type and severity", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-001", { minimumLcPct: 40 })]),
      makeDataset("v2", [
        product("P-001", { minimumLcPct: 50 }),
        product("P-002"),
      ]),
    );
    expect(diff.summary.byType.MINIMUM_LC_CHANGED).toBe(1);
    expect(diff.summary.byType.PRODUCT_ADDED).toBe(1);
    expect(diff.summary.bySeverity.CRITICAL).toBeGreaterThanOrEqual(1);
    expect(diff.summary.productsAfter).toBe(2);
  });
});

describe("LCGPA regulatory :: change rendering", () => {
  it("renders additions, removals and field changes readably", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-001", { minimumLcPct: 40 })]),
      makeDataset("v2", [product("P-001", { minimumLcPct: 50 }), product("P-002")]),
    );
    const rendered = diff.changes.map(describeChange).join("\n");
    expect(rendered).toMatch(/P-001 MINIMUM_LC_CHANGED minimumLcPct: 40 → 50/);
    expect(rendered).toMatch(/P-002 added/);
  });

  it("states plainly when no effective date was published", () => {
    const diff = diffOf(
      makeDataset("v1", [product("P-001", { effectiveFrom: null })], {
        effectiveFrom: null,
      }),
      makeDataset("v2", [product("P-001", { effectiveFrom: null, minimumLcPct: 60 })], {
        effectiveFrom: null,
      }),
    );
    expect(describeChange(diff.changes[0])).toMatch(/effective date not stated/);
  });
});
