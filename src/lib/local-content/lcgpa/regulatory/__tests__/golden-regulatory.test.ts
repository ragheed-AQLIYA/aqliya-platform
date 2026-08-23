// ─── Golden regulatory tests (§44) ───
//
// The golden dataset is VERSION-SPECIFIC and structural. It deliberately does
// NOT assert a product count for the real LCGPA Mandatory List: that count is
// only established by a verified official artifact, which has not yet been
// retrieved (see docs/regulatory/LCGPA_SOURCE_REGISTRY.md). Asserting one here
// would be a fabricated regulatory fact.

import { createDelimitedParser } from "../parser";
import { computeSemanticDiff } from "../semantic-diff";
import { datasetFingerprint } from "../versioning";
import { sha256 } from "../integrity";
import type { RegulatoryArtifact } from "../types";
import { CSV_MAPPING, clockAt, csvArtifact, csvRow } from "./fixtures";
import { makeDataset } from "./dataset-helpers";

const CLOCK = clockAt("2026-09-01T02:00:00.000Z");
const parser = createDelimitedParser({ mapping: CSV_MAPPING });

/**
 * LCGPA_GOLDEN_2026_08 — a synthetic, fully-specified fixture used to pin
 * parser + diff + fingerprint behaviour. It is NOT official LCGPA data.
 */
export const LCGPA_GOLDEN_2026_08_ROWS = [
  csvRow("P-00421", { minLc: "40", from: "2026-01-01", category: "CERAMIC" }),
  csvRow("P-00422", { minLc: "", from: "2026-01-01", category: "CERAMIC" }),
  csvRow("P-00423", { minLc: "25", from: "2026-01-01", category: "PUMPS" }),
];

const GOLDEN_ARTIFACT = csvArtifact(LCGPA_GOLDEN_2026_08_ROWS);
const GOLDEN_SHA = sha256(GOLDEN_ARTIFACT);
const ARTIFACT_STUB = { sha256: GOLDEN_SHA } as RegulatoryArtifact;

describe("LCGPA golden dataset :: LCGPA_GOLDEN_2026_08 (§44)", () => {
  it("does not hardcode an official product count — the count comes from the artifact", () => {
    const parsed = parser.parse(ARTIFACT_STUB, GOLDEN_ARTIFACT);
    expect(parsed.ok).toBe(true);
    expect(parsed.products).toHaveLength(LCGPA_GOLDEN_2026_08_ROWS.length);
    expect(parsed.rowsRead).toBe(LCGPA_GOLDEN_2026_08_ROWS.length);
  });

  it("normalizes an unstated minimum LC to null, never to zero (§45)", () => {
    const parsed = parser.parse(ARTIFACT_STUB, GOLDEN_ARTIFACT);
    const p422 = parsed.products.find((p) => p.productCode === "P-00422");
    expect(p422?.minimumLcPct).toBeNull();
    expect(p422?.minimumLcPct).not.toBe(0);
  });

  it("produces a byte-stable fingerprint for the golden artifact", () => {
    const parsed = parser.parse(ARTIFACT_STUB, GOLDEN_ARTIFACT);
    const dataset = makeDataset("LCGPA_GOLDEN_2026_08", parsed.products, {
      sha256: GOLDEN_SHA,
    });
    const first = datasetFingerprint(dataset);
    const second = datasetFingerprint(
      makeDataset("LCGPA_GOLDEN_2026_08", parser.parse(ARTIFACT_STUB, GOLDEN_ARTIFACT).products, {
        sha256: GOLDEN_SHA,
      }),
    );
    expect(first).toBe(second);
    expect(first).toMatch(/^FP-[0-9a-f]{16}$/);
  });

  it("orders products deterministically regardless of input order", () => {
    const shuffled = csvArtifact([...LCGPA_GOLDEN_2026_08_ROWS].reverse());
    const a = makeDataset(
      "g",
      parser.parse(ARTIFACT_STUB, GOLDEN_ARTIFACT).products,
      { sha256: GOLDEN_SHA },
    );
    const b = makeDataset(
      "g",
      parser.parse(ARTIFACT_STUB, shuffled).products,
      { sha256: GOLDEN_SHA },
    );
    expect(a.products.map((p) => p.productCode)).toEqual(
      b.products.map((p) => p.productCode),
    );
    expect(datasetFingerprint(a)).toBe(datasetFingerprint(b));
  });
});

describe("LCGPA golden dataset :: every new dataset diffs against the golden state (§44)", () => {
  const goldenDataset = makeDataset(
    "LCGPA_GOLDEN_2026_08",
    parser.parse(ARTIFACT_STUB, GOLDEN_ARTIFACT).products,
    { sha256: GOLDEN_SHA },
  );

  it("reports zero changes against itself", () => {
    const diff = computeSemanticDiff({
      before: goldenDataset,
      after: goldenDataset,
      clock: CLOCK,
    });
    expect(diff.changes).toHaveLength(0);
    expect(diff.summary.unchanged).toBe(3);
  });

  it("detects the exact regulatory delta of a next official version", () => {
    const next = csvArtifact([
      csvRow("P-00421", { minLc: "50", from: "2026-10-01", category: "CERAMIC" }),
      csvRow("P-00422", { minLc: "", from: "2026-01-01", category: "CERAMIC" }),
      csvRow("P-00424", { minLc: "30", from: "2027-08-01", category: "HVAC" }),
    ]);
    const nextDataset = makeDataset(
      "LCGPA_GOLDEN_2026_09",
      parser.parse({ sha256: sha256(next) } as RegulatoryArtifact, next).products,
      { sha256: sha256(next) },
    );
    const diff = computeSemanticDiff({
      before: goldenDataset,
      after: nextDataset,
      clock: CLOCK,
    });

    expect(diff.summary.added).toBe(1);
    expect(diff.summary.removed).toBe(1);
    const lc = diff.changes.find((c) => c.changeType === "MINIMUM_LC_CHANGED");
    expect(lc?.productCode).toBe("P-00421");
    expect(lc?.oldValue).toBe("40");
    expect(lc?.newValue).toBe("50");
    expect(lc?.severity).toBe("CRITICAL");
    expect(diff.changes.find((c) => c.changeType === "EFFECTIVE_DATE_CHANGED")?.newValue).toBe(
      "2026-10-01T00:00:00.000Z",
    );
  });

  it("keeps the golden fingerprint stable across runs of the whole suite", () => {
    const parsedA = parser.parse(ARTIFACT_STUB, GOLDEN_ARTIFACT);
    const parsedB = parser.parse(ARTIFACT_STUB, GOLDEN_ARTIFACT);
    expect(JSON.stringify(parsedA.products)).toBe(JSON.stringify(parsedB.products));
  });
});
