import { parseErpStatementSide } from "@/lib/tb-intelligence/engine";
import { matchSynonym } from "@/lib/tb-intelligence/synonyms";

describe("parseErpStatementSide", () => {
  it("parses balance sheet label", () => {
    expect(parseErpStatementSide("Balance Sheet")).toBe("balance_sheet");
  });

  it("parses income statement label", () => {
    expect(parseErpStatementSide("Income Statement")).toBe("income_statement");
  });
});

describe("BS/IS synonym guard (manual)", () => {
  it("maps finance costs on IS rows to expense canonical", () => {
    expect(matchSynonym("Finance costs - Borwings", "3301010001")?.canonicalCode).toBe(
      "CA-2050",
    );
  });

  it("does not map long-term debt synonym to generic finance label", () => {
    const match = matchSynonym("Finance costs - Borwings", "3301010001");
    expect(match?.canonicalCode).not.toBe("CA-2130");
  });
});
