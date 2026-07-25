import type { EvaluationResult, BatchEvaluationResult } from "../evaluator-types"

export function formatEvaluationReport(result: EvaluationResult): string {
  const lines: string[] = []

  lines.push(`# Evaluation Report: ${result.skillName}`)
  lines.push(`**Skill ID:** \`${result.skillId}\`  `)
  lines.push(`**Version:** ${result.skillVersion}  `)
  lines.push(`**Dataset:** ${result.datasetName}  `)
  lines.push(`**Timestamp:** ${result.timestamp}  `)
  lines.push(`**Duration:** ${result.durationMs}ms  `)
  lines.push("")
  lines.push(`## Overall: ${result.passed ? "✅ PASS" : "❌ FAIL"}`)
  lines.push(`**Score:** ${(result.overallScore * 100).toFixed(1)}% (threshold: ${(result.passThreshold * 100).toFixed(1)}%)  `)
  lines.push(`**Samples:** ${result.samples.length}/${result.sampleCount}  `)
  lines.push("")

  if (result.criterionBreakdown.length > 0) {
    lines.push("## Criteria Breakdown")
    lines.push("| Criterion | Type | Score | Weight | Threshold | Passed |")
    lines.push("|-----------|------|-------|--------|-----------|--------|")
    for (const c of result.criterionBreakdown) {
      const check = c.passed ? "✅" : "❌"
      lines.push(`| ${c.name} | - | ${(c.score * 100).toFixed(1)}% | ${(c.weight * 100).toFixed(0)}% | ${(c.threshold * 100).toFixed(0)}% | ${check} |`)
    }
    lines.push("")
  }

  if (result.samples.length > 0) {
    lines.push("## Sample Results")
    for (const sample of result.samples) {
      const icon = sample.status === "completed" ? "✅" : sample.status === "error" ? "💥" : "❌"
      lines.push(`### ${icon} Sample: ${sample.sampleId}`)
      lines.push(`**Description:** ${sample.description}  `)
      lines.push(`**Status:** ${sample.status}  `)
      lines.push(`**Score:** ${(sample.overallScore * 100).toFixed(1)}%  `)
      lines.push(`**Duration:** ${sample.durationMs}ms  `)
      if (sample.error) {
        lines.push(`**Error:** ${sample.error}  `)
      }
      if (sample.output && typeof sample.output === "object") {
        const outputStr = JSON.stringify(sample.output, null, 2)
        lines.push("```json")
        lines.push(outputStr.length > 500 ? outputStr.slice(0, 500) + "..." : outputStr)
        lines.push("```")
      }
      lines.push("")
    }
  }

  if (result.errors.length > 0) {
    lines.push("## Errors")
    for (const err of result.errors) {
      lines.push(`- ${err}`)
    }
    lines.push("")
  }

  return lines.join("\n")
}

export function formatBatchEvaluationReport(result: BatchEvaluationResult): string {
  const lines: string[] = []

  lines.push("# Batch Evaluation Report")
  lines.push(`**Timestamp:** ${result.timestamp}  `)
  lines.push(`**Total Skills:** ${result.totalSkills}  `)
  lines.push(`**Passed:** ${result.passed}  `)
  lines.push(`**Failed:** ${result.failed}  `)
  lines.push(`**Pass Rate:** ${(result.overallPassRate * 100).toFixed(1)}%  `)
  lines.push(`**Duration:** ${result.durationMs}ms  `)
  lines.push("")

  lines.push("## Summary")
  lines.push("| Skill | Score | Threshold | Passed |")
  lines.push("|-------|-------|-----------|--------|")
  for (const r of result.results) {
    const icon = r.passed ? "✅" : "❌"
    const scoreStr = `${(r.overallScore * 100).toFixed(1)}%`
    const thresholdStr = `${(r.passThreshold * 100).toFixed(1)}%`
    lines.push(`| ${r.skillName} | ${scoreStr} | ${thresholdStr} | ${icon} |`)
  }
  lines.push("")

  return lines.join("\n")
}
