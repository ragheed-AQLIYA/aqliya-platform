import { confidenceFromHitCount } from "@/lib/tb-intelligence/firm-memory";
import { matchSynonym } from "@/lib/tb-intelligence/synonyms";
import { classifyByPrefix } from "@/lib/tb-intelligence/coa-loader";

describe("firm-memory confidenceFromHitCount", () => {
  it("returns 0.99 at 10+ hits", () => {
    expect(confidenceFromHitCount(10)).toBe(0.99);
    expect(confidenceFromHitCount(15)).toBe(0.99);
  });

  it("scales below 10 hits", () => {
    expect(confidenceFromHitCount(1)).toBe(0.75);
    expect(confidenceFromHitCount(5)).toBeGreaterThan(0.75);
    expect(confidenceFromHitCount(5)).toBeLessThan(0.99);
  });
});

describe("tb-intelligence synonyms", () => {
  it("maps Arabic cash aliases to CA-1010", () => {
    const match = matchSynonym("صندوق النقدية", "1101");
    expect(match?.canonicalCode).toBe("CA-1010");
  });

  it("maps English petty cash", () => {
    const match = matchSynonym("Petty Cash", "1105");
    expect(match?.canonicalCode).toBe("CA-1010");
  });

  it("maps spare parts to CA-5010", () => {
    const match = matchSynonym("Spare Parts & Consumables", "3204010001");
    expect(match?.canonicalCode).toBe("CA-5010");
  });

  it("maps finance costs to CA-2050", () => {
    const match = matchSynonym("Finance costs - Borwings", "3301010001");
    expect(match?.canonicalCode).toBe("CA-2050");
  });
});

describe("classifyByPrefix", () => {
  it("classifies asset prefix", () => {
    expect(classifyByPrefix("1010")).toBe("asset");
  });
});
