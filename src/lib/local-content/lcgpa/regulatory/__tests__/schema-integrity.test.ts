// ─── Regulatory history must be impossible to lose (P0.1) ───
//
// These assertions are about the DATABASE CONTRACT, not about TypeScript. They
// read prisma/schema.prisma directly, so a future edit that re-introduces a
// destructive cascade fails the build rather than silently shipping.

import { readFileSync } from "fs";
import { join } from "path";

import { productVersionDigest } from "../versioning";
import { product } from "./fixtures";

const SCHEMA = readFileSync(join(process.cwd(), "prisma", "schema.prisma"), "utf8");

/** Extract one model block by name. */
function model(name: string): string {
  const start = SCHEMA.indexOf(`model ${name} {`);
  if (start < 0) throw new Error(`model ${name} not found in schema.prisma`);
  return SCHEMA.slice(start, SCHEMA.indexOf("\n}", start));
}

const REGULATORY_MODELS = [
  "LcRegulatorySource",
  "LcRegulatoryCheck",
  "LcRegulatoryArtifact",
  "LcRegulatoryDataset",
  "LcRegulatoryProduct",
  "LcRegulatoryChange",
  "LcRegulatoryCase",
  "LcRegulatoryAlert",
  "LcRegulatoryChangeEvent",
  "LcRegulatoryConflict",
  "LcRegulatoryImpactAssessment",
  "LcRegulatoryEffectiveDateEvidence",
];

describe("LCGPA schema :: no cascade may destroy regulatory history", () => {
  it("defines every regulatory model", () => {
    for (const name of REGULATORY_MODELS) {
      expect(() => model(name)).not.toThrow();
    }
  });

  it("uses NO onDelete: Cascade anywhere in the regulatory models", () => {
    for (const name of REGULATORY_MODELS) {
      const block = model(name);
      expect({ model: name, hasCascade: block.includes("onDelete: Cascade") }).toEqual({
        model: name,
        hasCascade: false,
      });
    }
  });

  it("uses NO onDelete: SetNull, which would silently rewrite a diff's before-side", () => {
    for (const name of REGULATORY_MODELS) {
      expect({ model: name, hasSetNull: model(name).includes("onDelete: SetNull") }).toEqual({
        model: name,
        hasSetNull: false,
      });
    }
  });

  it("makes every regulatory relation RESTRICT", () => {
    for (const name of REGULATORY_MODELS) {
      const block = model(name);
      const relations = block.match(/@relation\([^)]*\)/g) ?? [];
      for (const rel of relations) {
        // Back-relations (list sides) carry no onDelete.
        if (!rel.includes("fields:")) continue;
        expect({ model: name, rel, restrict: rel.includes("onDelete: Restrict") }).toEqual({
          model: name,
          rel,
          restrict: true,
        });
      }
    }
  });

  it("prevents a dataset that produced a calculation from being deleted", () => {
    const run = model("LcCalculationRun");
    expect(run).toMatch(/regulatoryDataset\s+LcRegulatoryDataset\?\s+@relation\([^)]*onDelete: Restrict/);
    expect(run).toContain("regulatoryArtifactSha256");
    expect(run).toContain("regulatoryAsOf");
  });
});

describe("LCGPA schema :: identity and uniqueness", () => {
  it("content-addresses artifacts so the same bytes cannot be stored twice", () => {
    expect(model("LcRegulatoryArtifact")).toContain("@@unique([sourceId, sha256])");
  });

  it("keeps one product row per code per dataset version", () => {
    expect(model("LcRegulatoryProduct")).toContain("@@unique([datasetId, productCode])");
  });

  it("keeps dataset versions globally unique — resolution looks them up by version", () => {
    expect(model("LcRegulatoryDataset")).toMatch(/datasetVersion\s+String\s+@unique/);
  });

  it("de-duplicates journal entries on artifact + dataset", () => {
    expect(model("LcRegulatoryChangeEvent")).toContain(
      "@@unique([artifactSha256, datasetVersion])",
    );
  });

  it("gives every product a deterministic version identity", () => {
    expect(model("LcRegulatoryProduct")).toContain("productVersionId");
    expect(model("LcRegulatoryProduct")).toContain("@@index([productVersionId])");
  });

  it("anchors conflicts to real sources", () => {
    const block = model("LcRegulatoryConflict");
    expect(block).toContain('@relation("ConflictSourceA"');
    expect(block).toContain('@relation("ConflictSourceB"');
  });
});

describe("LCGPA schema :: sector codes are never invented (§45)", () => {
  it("stores the official sector code as nullable", () => {
    expect(model("LcRegulatoryProduct")).toMatch(/sectorCode\s+String\?/);
  });

  it("indexes products by sector NAME, because that is the published identity", () => {
    expect(model("LcRegulatoryProduct")).toContain("@@index([datasetId, sectorNameAr])");
  });
});

describe("LCGPA schema :: effective-date evidence is a first-class record (P0.7)", () => {
  const block = model("LcRegulatoryEffectiveDateEvidence");

  it("carries its own source, scope, confidence and evidence", () => {
    for (const field of [
      "sourceId",
      "scope",
      "cohortLabel",
      "productCodes",
      "effectiveFrom",
      "confidence",
      "evidence",
      "recordedById",
    ]) {
      expect(block).toContain(field);
    }
  });

  it("can be superseded rather than overwritten", () => {
    expect(block).toContain("supersededById");
    expect(block).toContain("supersededAt");
  });
});

describe("LCGPA :: product version identity", () => {
  it("is stable for identical facts", () => {
    const a = productVersionDigest("DS-1", product("2353", { minimumLcPct: 23 }));
    const b = productVersionDigest("DS-1", product("2353", { minimumLcPct: 23 }));
    expect(a).toBe(b);
    expect(a).toMatch(/^PV-[0-9a-f]{16}$/);
  });

  it("changes when any regulatory fact changes", () => {
    const base = productVersionDigest("DS-1", product("2353", { minimumLcPct: 23 }));
    expect(productVersionDigest("DS-1", product("2353", { minimumLcPct: 27 }))).not.toBe(base);
    expect(
      productVersionDigest("DS-1", product("2353", { minimumLcPct: 23, hsCode: "841810" })),
    ).not.toBe(base);
    expect(
      productVersionDigest("DS-1", product("2353", { minimumLcPct: 23, sectorNameAr: "الأثاث" })),
    ).not.toBe(base);
    expect(
      productVersionDigest("DS-1", product("2353", { minimumLcPct: 23, priceCeilingRaw: 0.1 })),
    ).not.toBe(base);
  });

  it("changes when the dataset version changes, even for identical facts", () => {
    expect(productVersionDigest("DS-1", product("2353"))).not.toBe(
      productVersionDigest("DS-2", product("2353")),
    );
  });

  it("distinguishes a schedule change", () => {
    const withSchedule = product("2353", {
      minimumLcSchedule: [{ year: 2026, pct: 23, state: "STATED", raw: "0.23" }],
    });
    const moved = product("2353", {
      minimumLcSchedule: [{ year: 2027, pct: 23, state: "STATED", raw: "0.23" }],
    });
    expect(productVersionDigest("DS-1", withSchedule)).not.toBe(
      productVersionDigest("DS-1", moved),
    );
  });
});
