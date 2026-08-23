import {
  UNRESOLVED_ARTIFACT_BLOCKER,
  createDelimitedParser,
  createParserRegistry,
  runParser,
  parseIsoDate,
  parsePercent,
  readDelimited,
  unresolvedArtifactParser,
  validateColumnMapping,
} from "../parser";
import type { RegulatoryArtifact } from "../types";
import { CSV_HEADER, CSV_MAPPING, csvArtifact, csvRow } from "./fixtures";

const ARTIFACT = { sha256: "a".repeat(64) } as RegulatoryArtifact;

const parser = createDelimitedParser({ mapping: CSV_MAPPING });

describe("LCGPA regulatory :: evidence boundary (§45)", () => {
  it("the DEFAULT parser fails closed — no artifact structure is assumed", () => {
    const result = unresolvedArtifactParser.parse(ARTIFACT, Buffer.from("anything"));
    expect(result.ok).toBe(false);
    expect(result.products).toEqual([]);
    expect(result.errors[0]).toBe(UNRESOLVED_ARTIFACT_BLOCKER);
  });

  it("the registry returns the fail-closed parser for unregistered sources", async () => {
    const registry = createParserRegistry();
    expect(registry.has("lcgpa-mandatory-list-documents")).toBe(false);
    const result = await runParser(
      registry.forSource("lcgpa-mandatory-list-documents"),
      ARTIFACT,
      Buffer.from("x"),
    );
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/EVIDENCE_BOUNDARY/);
  });

  it("returns a registered parser once an operator supplies a verified mapping", async () => {
    const registry = createParserRegistry();
    registry.register("lcgpa-mandatory-list-documents", parser);
    const result = await runParser(
      registry.forSource("lcgpa-mandatory-list-documents"),
      ARTIFACT,
      csvArtifact([csvRow("P-001")]),
    );
    expect(result.ok).toBe(true);
  });
});

describe("LCGPA regulatory :: column mapping", () => {
  it("requires product code, Arabic name and sector", () => {
    expect(validateColumnMapping({})).toHaveLength(3);
    expect(validateColumnMapping(CSV_MAPPING)).toEqual([]);
  });

  it("fails the whole parse when the mapping is incomplete", () => {
    const incomplete = createDelimitedParser({
      mapping: { ...CSV_MAPPING, productCode: "" },
    });
    const result = incomplete.parse(ARTIFACT, csvArtifact([csvRow("P-001")]));
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/COLUMN_MAPPING_INCOMPLETE/);
  });
});

describe("LCGPA regulatory :: delimited reader", () => {
  it("handles quoted fields, embedded commas and doubled quotes", () => {
    const rows = readDelimited('a,b\n"x,1","he said ""hi"""');
    expect(rows[1]).toEqual(["x,1", 'he said "hi"']);
  });

  it("strips a UTF-8 BOM", () => {
    const rows = readDelimited("﻿a,b\n1,2");
    expect(rows[0][0]).toBe("a");
  });

  it("skips blank lines", () => {
    expect(readDelimited("a,b\n\n1,2\n")).toHaveLength(2);
  });
});

describe("LCGPA regulatory :: value coercion fails closed (§45)", () => {
  it("parses plain and percent-suffixed values", () => {
    expect(parsePercent("40").value).toBe(40);
    expect(parsePercent("40%").value).toBe(40);
    expect(parsePercent("").value).toBeNull();
    expect(parsePercent(undefined).value).toBeNull();
  });

  it("REJECTS an unparseable percentage rather than defaulting it", () => {
    const result = parsePercent("forty");
    expect(result.value).toBeNull();
    expect(result.error).toMatch(/MINIMUM_LC_UNPARSEABLE/);
  });

  it("REJECTS an out-of-range percentage", () => {
    expect(parsePercent("150").error).toMatch(/MINIMUM_LC_OUT_OF_RANGE/);
    expect(parsePercent("-1").error).toMatch(/MINIMUM_LC_OUT_OF_RANGE/);
  });

  it("accepts only unambiguous ISO dates", () => {
    expect(parseIsoDate("2026-10-01").value?.toISOString()).toBe(
      "2026-10-01T00:00:00.000Z",
    );
    expect(parseIsoDate("01/10/2026").error).toMatch(/DATE_FORMAT_AMBIGUOUS/);
    expect(parseIsoDate("").value).toBeNull();
  });
});

describe("LCGPA regulatory :: parsing a valid artifact", () => {
  it("normalizes every mapped field", () => {
    const result = parser.parse(
      ARTIFACT,
      csvArtifact([
        csvRow("P-00421", { minLc: "40", from: "2026-01-01" }),
        csvRow("P-00422", { minLc: "", from: "" }),
      ]),
    );
    expect(result.ok).toBe(true);
    expect(result.rowsRead).toBe(2);
    expect(result.products).toHaveLength(2);

    const first = result.products[0];
    expect(first.productCode).toBe("P-00421");
    expect(first.minimumLcPct).toBe(40);
    expect(first.effectiveFrom?.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(first.requirements).toEqual(["cert"]);
    expect(first.regulatoryStatus).toBe("ACTIVE");

    // Unstated values stay null — never zero, never a default.
    expect(result.products[1].minimumLcPct).toBeNull();
    expect(result.products[1].effectiveFrom).toBeNull();
  });
});

describe("LCGPA regulatory :: parser failure modes (§28)", () => {
  it("fails on a malformed artifact with no data rows", () => {
    const result = parser.parse(ARTIFACT, Buffer.from(CSV_HEADER, "utf8"));
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/ARTIFACT_EMPTY/);
  });

  it("fails when a mapped column is missing from the header", () => {
    const result = parser.parse(
      ARTIFACT,
      Buffer.from("wrong,headers\n1,2", "utf8"),
    );
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/MISSING_COLUMNS/);
  });

  it("fails the WHOLE dataset when one row has an invalid value", () => {
    const result = parser.parse(
      ARTIFACT,
      csvArtifact([csvRow("P-001"), csvRow("P-002", { minLc: "abc" })]),
    );
    expect(result.ok).toBe(false);
    expect(result.products).toEqual([]);
    expect(result.errors.join(" ")).toMatch(/MINIMUM_LC_UNPARSEABLE/);
  });

  it("fails on a duplicate product code within one artifact", () => {
    const result = parser.parse(
      ARTIFACT,
      csvArtifact([csvRow("P-001"), csvRow("P-001")]),
    );
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/DUPLICATE_PRODUCT_CODE/);
  });

  it("fails on a missing product code, name or sector", () => {
    const result = parser.parse(
      ARTIFACT,
      csvArtifact([",name,en,S01,قطاع,CAT,690721,40,app,2026-01-01,,cert"]),
    );
    expect(result.errors.join(" ")).toMatch(/PRODUCT_CODE_MISSING/);
  });

  it("fails on an ambiguous date rather than guessing the format", () => {
    const result = parser.parse(
      ARTIFACT,
      csvArtifact([csvRow("P-001", { from: "01/10/2026" })]),
    );
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/DATE_FORMAT_AMBIGUOUS/);
  });
});
