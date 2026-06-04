import type { EvalSuite } from "../eval-types"

export const findingSummarySuite: EvalSuite = {
  id: "finding-summary-v1",
  name: "Audit Finding Summary",
  taskType: "finding_summary",
  description:
    "Validates AI-generated audit finding summaries reflect finding type and severity. Test case inputs are passed as actual output until IC-02 (active LLM wiring).",
  testCases: [
    {
      id: "find-001",
      taskType: "finding_summary",
      input: {
        findingType: "control_deficiency",
        severity: "high",
        area: "AP",
      },
      expectedOutput: "control_deficiency",
      metric: "contains",
      severity: "high",
      tags: ["findings", "control"],
    },
    {
      id: "find-002",
      taskType: "finding_summary",
      input: {
        findingType: "material_misstatement",
        severity: "critical",
        area: "revenue",
      },
      expectedOutput: "material_misstatement",
      metric: "contains",
      severity: "critical",
      tags: ["findings", "materiality"],
    },
    {
      id: "find-003",
      taskType: "finding_summary",
      input: {
        findingType: "compliance_gap",
        severity: "medium",
        regulation: "ZATCA",
      },
      expectedOutput: "ZATCA",
      metric: "contains",
      severity: "high",
      tags: ["findings", "compliance"],
    },
    {
      id: "find-004",
      taskType: "finding_summary",
      input: {
        findingType: "reporting_error",
        severity: "high",
        impact: 250000,
        currency: "SAR",
      },
      expectedOutput: "250000",
      metric: "contains",
      severity: "high",
      tags: ["findings", "reporting"],
    },
    {
      id: "find-005",
      taskType: "finding_summary",
      input: {
        findingType: "system_access_issue",
        severity: "medium",
        usersAffected: 12,
      },
      expectedOutput: "system_access_issue",
      metric: "contains",
      severity: "medium",
      tags: ["findings", "it"],
    },
  ],
}
