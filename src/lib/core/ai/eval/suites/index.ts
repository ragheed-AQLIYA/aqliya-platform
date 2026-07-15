import type { EvalSuite } from "@/lib/core/ai/eval/eval-types"
import { financialAnalysisSuite } from "./financial-analysis"
import { disclosureNoteSuite } from "./disclosure-notes"
import { findingSummarySuite } from "./finding-summary"
import { frameworkSelfTestSuite } from "./framework-self-test"
import { lcosScoringSuite } from "./lcos-scoring"
import { salesPipelineSuite } from "./sales-pipeline"
import { decisionAnalysisSuite } from "./decision-analysis"

export const evalSuites: EvalSuite[] = [
  financialAnalysisSuite,
  disclosureNoteSuite,
  findingSummarySuite,
  frameworkSelfTestSuite,
  lcosScoringSuite,
  salesPipelineSuite,
  decisionAnalysisSuite,
]

export function getSuiteById(id: string): EvalSuite | undefined {
  return evalSuites.find((s) => s.id === id)
}

export function getSuitesByTaskType(taskType: string): EvalSuite[] {
  return evalSuites.filter((s) => s.taskType === taskType)
}
