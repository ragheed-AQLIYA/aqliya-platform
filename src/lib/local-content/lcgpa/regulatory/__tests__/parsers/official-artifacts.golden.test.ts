// ─── Golden tests against the REAL official LCGPA artifacts (§44) ───
//
// These assert facts about the exact bytes LCGPA published, pinned by SHA-256.
// The artifacts live under `uploads/lcgpa-sources/` which is git-ignored, so the
// suite reports and skips when they are absent rather than failing a clean
// checkout. Nothing here is hardcoded from an assumption: every number was
// derived from the verified artifact and is re-derived on each run.

import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

import { sha256 } from "../../integrity";
import { createMandatoryListParser } from "../../parsers/lcgpa-mandatory-list";
import { createMinimumLcParser } from "../../parsers/lcgpa-minimum-lc";
import type { RegulatoryArtifact } from "../../types";

const STORE = join(process.cwd(), "uploads", "lcgpa-sources", "2026-07");

/** SHA-256 of each artifact as retrieved from lcgpa.gov.sa on 2026-08-22. */
export const OFFICIAL_ARTIFACT_HASHES = {
  governmentList: "93f3e1f4533da8d12644c0c9b964c4712972b1eade347d805458aca0d0d1d632",
  stateOwnedList: "f613722d4017c8b0b2b471b99fba1c61d53bf5f4b29266a4d901671419e83dfc",
  minimumLcSchedule: "acec6451903348b92484c4e0280d26a076e2321219d565e1253a0aa9d111673f",
  deliveryInstructions:
    "c9d553fc233c1ec2ebddf4385565361a1d7c08b21b59d11c64479c415abe598e",
} as const;

function findByHash(expected: string): Buffer | null {
  if (!existsSync(STORE)) return null;
  for (const name of readdirSync(STORE)) {
    const path = join(STORE, name);
    try {
      const body = readFileSync(path);
      if (sha256(body) === expected) return body;
    } catch {
      // unreadable entry — ignore
    }
  }
  return null;
}

const govBody = findByHash(OFFICIAL_ARTIFACT_HASHES.governmentList);
const socBody = findByHash(OFFICIAL_ARTIFACT_HASHES.stateOwnedList);
const minBody = findByHash(OFFICIAL_ARTIFACT_HASHES.minimumLcSchedule);
const haveAll = Boolean(govBody && socBody && minBody);

const ARTIFACT = { sha256: "0".repeat(64) } as RegulatoryArtifact;
const describeGolden = haveAll ? describe : describe.skip;

if (!haveAll) {
  // eslint-disable-next-line no-console
  console.warn(
    `[LCGPA golden] official artifacts not present under ${STORE} — golden assertions skipped. ` +
      "Run the acquisition pipeline to populate them.",
  );
}

describeGolden("LCGPA golden :: official Mandatory List, July 2026", () => {
  it("parses the government-entities workbook without a single error", async () => {
    const parser = createMandatoryListParser({ variant: "GOVERNMENT_ENTITIES" });
    const result = await parser.parse(ARTIFACT, govBody as Buffer);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("yields 1,727 products across 14 sector sheets", async () => {
    const parser = createMandatoryListParser({ variant: "GOVERNMENT_ENTITIES" });
    const result = await parser.parse(ARTIFACT, govBody as Buffer);
    expect(result.products).toHaveLength(1727);
    expect(new Set(result.products.map((p) => p.sectorNameAr)).size).toBe(14);
    expect(result.rowsRead).toBe(1727);
    // No sector code is published, so none exists.
    expect(result.products.every((p) => p.sectorCode === null)).toBe(true);
  });

  it("has globally unique product codes", async () => {
    const parser = createMandatoryListParser({ variant: "GOVERNMENT_ENTITIES" });
    const result = await parser.parse(ARTIFACT, govBody as Buffer);
    const codes = result.products.map((p) => p.productCode);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("carries the published sector names, price ceilings and effective dates", async () => {
    const parser = createMandatoryListParser({ variant: "GOVERNMENT_ENTITIES" });
    const result = await parser.parse(ARTIFACT, govBody as Buffer);
    const sectors = new Set(result.products.map((p) => p.sectorNameAr));
    expect(sectors).toContain("الأدوية و المستحضرات الطبية");
    expect(sectors).toContain("البناء و التشييد");
    expect(result.products.some((p) => p.priceCeilingRaw !== null)).toBe(true);
    expect(result.products.every((p) => p.effectiveFrom instanceof Date ||
      p.effectiveFrom === null)).toBe(true);
  });

  it("parses the state-owned-companies workbook to the same product population", async () => {
    const parser = createMandatoryListParser({ variant: "STATE_OWNED_COMPANIES" });
    const result = await parser.parse(ARTIFACT, socBody as Buffer);
    expect(result.errors).toEqual([]);
    expect(result.products).toHaveLength(1727);
  });

  it("is reproducible: the same bytes parse to identical output", async () => {
    const parser = createMandatoryListParser({ variant: "GOVERNMENT_ENTITIES" });
    const a = await parser.parse(ARTIFACT, govBody as Buffer);
    const b = await parser.parse(ARTIFACT, govBody as Buffer);
    expect(JSON.stringify(a.products)).toBe(JSON.stringify(b.products));
  });
});

describeGolden("LCGPA golden :: official minimum local content schedule, July 2026", () => {
  it("parses without error and yields 1,198 products", async () => {
    const result = await createMinimumLcParser({ effectiveYear: 2026 })
      .parse(ARTIFACT, minBody as Buffer);
    expect(result.errors).toEqual([]);
    expect(result.products).toHaveLength(1198);
  });

  it("publishes six schedule years, 2026 through 2031", async () => {
    const result = await createMinimumLcParser({ effectiveYear: 2026 })
      .parse(ARTIFACT, minBody as Buffer);
    expect(result.warnings.join(" ")).toMatch(
      /PUBLISHED_YEARS: 2026, 2027, 2028, 2029, 2030, 2031/,
    );
    expect(result.products[0].minimumLcSchedule).toHaveLength(6);
  });

  it("groups products into the three published commencement cohorts", async () => {
    const result = await createMinimumLcParser({ effectiveYear: 2026 })
      .parse(ARTIFACT, minBody as Buffer);
    const cohorts = new Map<string, number>();
    for (const p of result.products) {
      const key = p.effectiveFrom ? p.effectiveFrom.toISOString().slice(0, 10) : "UNKNOWN";
      cohorts.set(key, (cohorts.get(key) ?? 0) + 1);
    }
    expect(cohorts.get("2026-08-01")).toBe(2);
    expect(cohorts.get("2027-08-01")).toBe(231);
    expect(cohorts.get("2028-06-01")).toBe(965);
    // 2 + 231 is the 233-product cohort announced by SPA for 2026-08-01.
    expect((cohorts.get("2026-08-01") ?? 0) + (cohorts.get("2027-08-01") ?? 0)).toBe(233);
  });

  it("binds only the 2026 cohort to a 2026 percentage", async () => {
    const result = await createMinimumLcParser({ effectiveYear: 2026 })
      .parse(ARTIFACT, minBody as Buffer);
    const stated = result.products.filter((p) => p.minimumLcPct !== null);
    expect(stated).toHaveLength(2);
    const tiles = result.products.find((p) => p.productCode === "2353");
    expect(tiles?.productNameAr).toBe("بلاط سيراميك");
    expect(tiles?.minimumLcPct).toBe(23);
  });

  it("never turns «-» or «TBD» into a zero", async () => {
    const result = await createMinimumLcParser({ effectiveYear: 2026 })
      .parse(ARTIFACT, minBody as Buffer);
    for (const p of result.products) {
      for (const entry of p.minimumLcSchedule ?? []) {
        if (entry.state !== "STATED") expect(entry.pct).toBeNull();
        else expect(entry.pct).toBeGreaterThan(0);
      }
    }
  });
});

describeGolden("LCGPA golden :: cross-artifact join (§29)", () => {
  it("joins the schedule to the mandatory list on the canonical Etimad code", async () => {
    const gov = await createMandatoryListParser({ variant: "GOVERNMENT_ENTITIES" })
      .parse(ARTIFACT, govBody as Buffer);
    const min = await createMinimumLcParser({ effectiveYear: 2026 })
      .parse(ARTIFACT, minBody as Buffer);

    const listed = new Set(gov.products.map((p) => p.productCode));
    const matched = min.products.filter((p) => listed.has(p.productCode));
    const unmatched = min.products.filter((p) => !listed.has(p.productCode));

    expect(matched).toHaveLength(1192);
    // Six products carry a published minimum but are absent from the July 2026
    // mandatory list. Two official artifacts disagree; this is a regulatory
    // conflict for human review, not something the engine may resolve.
    expect(unmatched.map((p) => p.productCode).sort()).toEqual([
      "2802", "2804", "2805", "2808", "2809", "2814",
    ]);
  });

  it("would NOT join on the raw published codes — canonicalisation is required", async () => {
    const gov = await createMandatoryListParser({ variant: "GOVERNMENT_ENTITIES" })
      .parse(ARTIFACT, govBody as Buffer);
    const min = await createMinimumLcParser({ effectiveYear: 2026 })
      .parse(ARTIFACT, minBody as Buffer);
    const rawListed = new Set(gov.products.map((p) => p.productCodeRaw));
    const rawMatched = min.products.filter((p) => rawListed.has(p.productCodeRaw));
    expect(rawMatched.length).toBeLessThan(1192);
  });
});
