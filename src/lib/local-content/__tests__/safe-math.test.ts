import { evaluateFormula, type LineValueMap } from "@/lib/local-content/workbook/population";

// evaluateFormula is the public API that internally uses safeEvaluateExpression.
// It replaces line codes with values, validates the expression, then evaluates.

describe("evaluateFormula (via safeEvaluateExpression)", () => {
  // Helper: wrap evaluateFormula for pure arithmetic tests by using line code "X"
  // and providing the value in lineValues so the code gets replaced.
  const evalExpr = (expr: string): number | null => {
    const lineValues: LineValueMap = { X: 1 }; // dummy; we won't use codes in pure exprs
    // For pure arithmetic, we can pass the expression directly since it's valid chars
    return evaluateFormula(expr, lineValues);
  };

  describe("basic arithmetic", () => {
    it("evaluates addition", () => {
      expect(evalExpr("2 + 3")).toBe(5);
    });

    it("evaluates subtraction", () => {
      expect(evalExpr("10 - 4")).toBe(6);
    });

    it("evaluates multiplication", () => {
      expect(evalExpr("6 * 7")).toBe(42);
    });

    it("evaluates division", () => {
      expect(evalExpr("20 / 4")).toBe(5);
    });

    it("evaluates decimal numbers", () => {
      expect(evalExpr("3.14 + 2.86")).toBeCloseTo(6.0);
    });

    it("evaluates complex nested expression", () => {
      // (2 + 3) * (10 - 5) = 25
      expect(evalExpr("(2 + 3) * (10 - 5)")).toBe(25);
    });

    it("evaluates deeply nested parentheses", () => {
      // ((2 + 3) * (10 - 5)) + 1 = 26
      expect(evalExpr("((2 + 3) * (10 - 5)) + 1")).toBe(26);
    });
  });

  describe("division edge cases", () => {
    it("returns null for division by zero", () => {
      // safeEvaluateExpression returns null when right === 0 for division
      expect(evalExpr("10 / 0")).toBeNull();
    });

    it("returns null for expression resulting in Infinity", () => {
      // evaluateFormula wraps result with Math.abs and checks isFinite
      expect(evalExpr("1 / 0")).toBeNull();
    });
  });

  describe("operator precedence", () => {
    it("multiplication before addition", () => {
      expect(evalExpr("2 + 3 * 4")).toBe(14);
    });

    it("parentheses override precedence", () => {
      expect(evalExpr("(2 + 3) * 4")).toBe(20);
    });

    it("left-to-right evaluation for same precedence", () => {
      expect(evalExpr("10 - 3 - 2")).toBe(5);
    });
  });

  describe("formula with line code substitution", () => {
    it("substitutes line codes and evaluates", () => {
      const lineValues: LineValueMap = { "REV-03": 1000, "COS-03": 400 };
      const result = evaluateFormula("REV-03 - COS-03", lineValues);
      expect(result).toBe(600);
    });

    it("returns absolute value of result", () => {
      const lineValues: LineValueMap = { "A-01": 100, "B-01": 200 };
      // 100 - 200 = -100, abs = 100
      const result = evaluateFormula("A-01 - B-01", lineValues);
      expect(result).toBe(100);
    });

    it("returns null when a referenced dependency is missing", () => {
      const lineValues: LineValueMap = { "REV-03": 500 }; // COS-03 missing
      const result = evaluateFormula("REV-03 - COS-03", lineValues);
      expect(result).toBeNull();
    });

    it("handles multiplication of line codes", () => {
      const lineValues: LineValueMap = { "RATE": 5, "QTY": 10 };
      const result = evaluateFormula("RATE * QTY", lineValues);
      expect(result).toBe(50);
    });
  });

  describe("injection prevention", () => {
    it("rejects expressions with letters (code injection)", () => {
      const lineValues: LineValueMap = {};
      expect(evaluateFormula("require('fs')", lineValues)).toBeNull();
    });

    it("rejects process.exit() attempts", () => {
      const lineValues: LineValueMap = {};
      expect(evaluateFormula("process.exit()", lineValues)).toBeNull();
    });

    it("rejects function call syntax", () => {
      const lineValues: LineValueMap = {};
      expect(evaluateFormula("Math.max(1,2)", lineValues)).toBeNull();
    });

    it("rejects variable references", () => {
      const lineValues: LineValueMap = {};
      expect(evaluateFormula("foo + bar", lineValues)).toBeNull();
    });

    it("rejects template literal injection", () => {
      const lineValues: LineValueMap = {};
      expect(evaluateFormula("${alert(1)}", lineValues)).toBeNull();
    });
  });

  describe("empty and malformed input", () => {
    it("returns null for empty string", () => {
      const lineValues: LineValueMap = {};
      expect(evaluateFormula("", lineValues)).toBeNull();
    });

    it("returns null for whitespace-only expression", () => {
      const lineValues: LineValueMap = {};
      expect(evaluateFormula("   ", lineValues)).toBeNull();
    });

    it("returns null for unbalanced parentheses", () => {
      const lineValues: LineValueMap = {};
      expect(evaluateFormula("(2 + 3", lineValues)).toBeNull();
    });

    it("returns null for trailing operator", () => {
      const lineValues: LineValueMap = {};
      // "2 +" — parser will fail because there's no right operand after +
      expect(evaluateFormula("2 +", lineValues)).toBeNull();
    });
  });
});
