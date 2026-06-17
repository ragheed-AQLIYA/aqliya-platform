import { runSuite, reportRequiresAttention } from "../../src/lib/ai/eval/eval-runner"
import { evalSuites } from "../../src/lib/ai/eval/suites"
import type { EvalSeverity } from "../../src/lib/ai/eval/eval-types"

const isCI = process.argv.includes("--ci")

function main() {
  console.log("=== AQLIYA AI Evaluation Suite ===\n")

  let totalTests = 0
  let totalPassed = 0
  let totalFailed = 0
  let criticalFailures = 0
  let highFailures = 0

  for (const suite of evalSuites) {
    console.log(`Suite: ${suite.name} (${suite.id})`)
    console.log(`  ${suite.description}`)
    console.log(`  Task type: ${suite.taskType}`)
    console.log(`  Test cases: ${suite.testCases.length}`)

    const actualOutputs = new Map<string, string>()

    for (const tc of suite.testCases) {
      actualOutputs.set(tc.id, JSON.stringify(tc.input))
    }

    const report = runSuite(suite, actualOutputs)
    totalTests += report.totalTests
    totalPassed += report.passed
    totalFailed += report.failed
    criticalFailures += report.failuresBySeverity.critical
    highFailures += report.failuresBySeverity.high

    console.log(`  Results: ${report.passed}/${report.totalTests} passed (${report.passRate}%)`)
    if (report.failed > 0) {
      console.log(`  Failures by severity: ${JSON.stringify(report.failuresBySeverity)}`)
    }
    console.log(`  Duration: ${report.durationMs}ms\n`)
  }

  const gateFailures = criticalFailures + highFailures

  console.log("=== Summary ===")
  console.log(`Total: ${totalTests} | Passed: ${totalPassed} | Failed: ${totalFailed} | Critical/High: ${gateFailures}`)

  if (gateFailures > 0 && isCI) {
    console.error(`\n❌ ${gateFailures} critical/high AI eval failures detected in CI mode. Blocking build.`)
    process.exit(1)
  }

  if (gateFailures > 0) {
    console.log(`\n⚠️  ${gateFailures} critical/high failures found. Review immediately.`)
  }

  if (totalFailed > 0) {
    console.log(`  (${totalFailed - gateFailures} low/medium failures — may include intentional negative tests)`)
  }

  console.log("\n✅ AI eval complete.")
}

main()
