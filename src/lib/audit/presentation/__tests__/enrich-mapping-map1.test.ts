import { pickMap1FromHints } from "@/lib/audit/presentation/enrich-mapping-map1";

describe("enrich-mapping-map1", () => {
  it("picks Map1-style hint from classification hints", () => {
    expect(
      pickMap1FromHints([
        "General and administrative expenses",
        "Other Exp.",
      ]),
    ).toBe("General and administrative expenses");
  });

  it("falls back to first hint when no Map1 pattern match", () => {
    expect(pickMap1FromHints(["Misc label", "Bank fees"])).toBe("Misc label");
  });

  it("returns null for invalid hints", () => {
    expect(pickMap1FromHints(null)).toBeNull();
    expect(pickMap1FromHints([])).toBeNull();
  });
});
