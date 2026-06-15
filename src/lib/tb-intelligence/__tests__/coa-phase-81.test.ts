import { matchSynonym } from "@/lib/tb-intelligence/synonyms";
import {
  CANONICAL_COA_ACCOUNTS,
  PHASE_81_CANONICAL_CODES,
} from "@/lib/audit/coa/canonical-coa";

describe("Phase 8.1 canonical COA", () => {
  it("defines 33 canonical accounts (23 baseline + 10 expansion)", () => {
    expect(CANONICAL_COA_ACCOUNTS).toHaveLength(33);
    expect(PHASE_81_CANONICAL_CODES.size).toBe(10);
  });

  it("maps ROU assets before PPE bucket", () => {
    expect(
      matchSynonym("Right of-use-assets", "1301010011")?.canonicalCode,
    ).toBe("CA-1070");
  });

  it("maps ROU accumulated depreciation to CA-1071", () => {
    expect(
      matchSynonym("مجمع اهلاك اصول حق الاستخدام", "2302010009")
        ?.canonicalCode,
    ).toBe("CA-1071");
  });

  it("maps contract assets to CA-1080", () => {
    expect(matchSynonym("Contract Assets", "1106010021")?.canonicalCode).toBe(
      "CA-1080",
    );
  });

  it("maps zakat provision to CA-2035", () => {
    expect(matchSynonym("Zakat provision", "2303010003")?.canonicalCode).toBe(
      "CA-2035",
    );
  });

  it("maps long-term debt to CA-2130", () => {
    expect(
      matchSynonym("Long term loans ( Non current )", "2108020001")
        ?.canonicalCode,
    ).toBe("CA-2130");
  });

  it("maps actuarial reserve to CA-3030", () => {
    expect(matchSynonym("Actuarial reserve", "2303020009")?.canonicalCode).toBe(
      "CA-3030",
    );
  });

  it("maps lease liabilities current to CA-2110", () => {
    expect(
      matchSynonym("Lease liabilities - Current Portion", "2105010001")
        ?.canonicalCode,
    ).toBe("CA-2110");
  });

  it("maps deferred tax to CA-2140", () => {
    expect(matchSynonym("Deferred tax liability", "2304010001")?.canonicalCode).toBe(
      "CA-2140",
    );
  });

  it("maps zakat expense away from liability lines", () => {
    expect(matchSynonym("zakat expense", "3101020005")?.canonicalCode).toBe(
      "CA-5070",
    );
  });
});
