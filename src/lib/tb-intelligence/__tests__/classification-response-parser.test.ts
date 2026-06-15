import { parseClassificationModelOutput } from "@/lib/tb-intelligence/classification-response-parser";

describe("parseClassificationModelOutput", () => {
  it("parses structured JSON with accountCode", () => {
    const parsed = parseClassificationModelOutput(
      JSON.stringify({
        accountCode: "CA-4010",
        confidence: 0.92,
        reasoning: "Sales revenue account",
      }),
    );
    expect(parsed?.accountCode).toBe("CA-4010");
    expect(parsed?.confidence).toBe(0.92);
    expect(parsed?.reasoning).toContain("Sales");
  });

  it("parses JSON inside markdown fences", () => {
    const parsed = parseClassificationModelOutput(
      'Here is the result:\n```json\n{"accountCode":"CA-5030","confidence":0.8,"reasoning":"Rent"}\n```',
    );
    expect(parsed?.accountCode).toBe("CA-5030");
  });

  it("falls back to CA-XXXX regex", () => {
    const parsed = parseClassificationModelOutput(
      "Suggested mapping: CA-5020 for payroll",
    );
    expect(parsed?.accountCode).toBe("CA-5020");
  });
});
