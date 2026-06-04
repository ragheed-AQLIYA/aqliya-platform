import type { EvalSuite } from "../eval-types"
import { financialAnalysisSuite } from "./financial-analysis"
import { disclosureNoteSuite } from "./disclosure-notes"
import { findingSummarySuite } from "./finding-summary"
import { frameworkSelfTestSuite } from "./framework-self-test"

export const evalSuites: EvalSuite[] = [
  financialAnalysisSuite,
  disclosureNoteSuite,
  findingSummarySuite,
  frameworkSelfTestSuite,
]

export function getSuiteById(id: string): EvalSuite | undefined {
  return evalSuites.find((s) => s.id === id)
}

export function getSuitesByTaskType(taskType: string): EvalSuite[] {
  return evalSuites.filter((s) => s.taskType === taskType)
}
