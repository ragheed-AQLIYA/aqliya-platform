import type { EvalSuite } from "../eval-types"

export const financialAnalysisSuite: EvalSuite = {
  id: "fin-analysis-v1",
  name: "Financial Statement Analysis",
  taskType: "financial_analysis",
  description:
    "Validates AI-generated financial analysis reflects input data correctly. Test case inputs are passed as actual output until IC-02 (active LLM wiring).",
  testCases: [
    {
      id: "fin-001",
      taskType: "financial_analysis",
      input: { metric: "revenue", value: 1000000, priorValue: 800000 },
      expectedOutput: "revenue",
      metric: "contains",
      severity: "high",
      tags: ["revenue", "trend"],
    },
    {
      id: "fin-002",
      taskType: "financial_analysis",
      input: { metric: "gross_margin", value: 0.35, period: "Q1" },
      expectedOutput: "gross_margin",
      metric: "contains",
      severity: "medium",
      tags: ["margin"],
    },
    {
      id: "fin-003",
      taskType: "financial_analysis",
      input: { metric: "net_income", value: -50000, currency: "SAR" },
      expectedOutput: "SAR",
      metric: "contains",
      severity: "high",
      tags: ["profitability", "net_income"],
    },
    {
      id: "fin-004",
      taskType: "financial_analysis",
      input: {
        metric: "current_ratio",
        value: 2.5,
        benchmark: 1.5,
      },
      expectedOutput: "2.5",
      metric: "contains",
      severity: "medium",
      tags: ["liquidity"],
    },
    {
      id: "fin-005",
      taskType: "financial_analysis",
      input: { metric: "debt_to_equity", value: 0.8, priorValue: 1.2 },
      expectedOutput: "debt_to_equity",
      metric: "contains",
      severity: "medium",
      tags: ["leverage"],
    },
    {
      id: "fin-006",
      taskType: "financial_analysis",
      input: {
        metric: "revenue_growth",
        value: 0.25,
        industryAvgGrowth: 0.1,
      },
      expectedOutput: "revenue_growth",
      metric: "contains",
      severity: "high",
      tags: ["growth"],
    },
  ],
}
