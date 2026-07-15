import { evalSuites, getSuiteById, getSuitesByTaskType } from "@/lib/core/ai/eval/suites";

describe("Eval Suites", () => {
  describe("evalSuites", () => {
    it("contains all registered suites", () => {
      expect(evalSuites.length).toBe(7);
    });

    it("each suite has required fields", () => {
      for (const suite of evalSuites) {
        expect(suite.id).toBeDefined();
        expect(suite.name).toBeDefined();
        expect(suite.taskType).toBeDefined();
        expect(suite.testCases.length).toBeGreaterThan(0);
      }
    });

    it("each test case has required fields", () => {
      for (const suite of evalSuites) {
        for (const testCase of suite.testCases) {
          expect(testCase.id).toBeDefined();
          expect(testCase.taskType).toBeDefined();
          expect(testCase.input).toBeDefined();
          expect(testCase.expectedOutput).toBeDefined();
          expect(testCase.metric).toBeDefined();
          expect(testCase.severity).toBeDefined();
        }
      }
    });
  });

  describe("getSuiteById", () => {
    it("returns suite by id", () => {
      const suite = getSuiteById("fin-analysis-v1");
      expect(suite).toBeDefined();
      expect(suite?.name).toBe("Financial Statement Analysis");
    });

    it("returns undefined for unknown id", () => {
      const suite = getSuiteById("nonexistent");
      expect(suite).toBeUndefined();
    });
  });

  describe("getSuitesByTaskType", () => {
    it("returns suites for analysis task type", () => {
      const suites = getSuitesByTaskType("analysis");
      expect(suites.length).toBeGreaterThan(0);
      for (const suite of suites) {
        expect(suite.taskType).toBe("analysis");
      }
    });

    it("returns suites for classification task type", () => {
      const suites = getSuitesByTaskType("classification");
      expect(suites.length).toBeGreaterThan(0);
      for (const suite of suites) {
        expect(suite.taskType).toBe("classification");
      }
    });

    it("returns empty array for unknown task type", () => {
      const suites = getSuitesByTaskType("nonexistent");
      expect(suites).toHaveLength(0);
    });
  });

  describe("Non-audit eval suites", () => {
    it("lcos-scoring suite has Saudi-specific test cases", () => {
      const suite = getSuiteById("lcos-scoring-v1");
      expect(suite).toBeDefined();
      const tags = suite?.testCases.flatMap((tc) => tc.tags);
      expect(tags).toContain("nitaqat");
    });

    it("sales-pipeline suite has deal health test cases", () => {
      const suite = getSuiteById("sales-pipeline-v1");
      expect(suite).toBeDefined();
      const tags = suite?.testCases.flatMap((tc) => tc.tags);
      expect(tags).toContain("pipeline");
    });

    it("decision-analysis suite has strategic decision test cases", () => {
      const suite = getSuiteById("decision-analysis-v1");
      expect(suite).toBeDefined();
      const tags = suite?.testCases.flatMap((tc) => tc.tags);
      expect(tags).toContain("decision");
    });

    it("non-audit suites use llm_judge metric for complex cases", () => {
      const lcos = getSuiteById("lcos-scoring-v1");
      const sales = getSuiteById("sales-pipeline-v1");
      const decision = getSuiteById("decision-analysis-v1");

      expect(lcos?.testCases.some((tc) => tc.metric === "llm_judge")).toBe(true);
      expect(sales?.testCases.some((tc) => tc.metric === "llm_judge")).toBe(true);
      expect(decision?.testCases.some((tc) => tc.metric === "llm_judge")).toBe(true);
    });
  });
});
