import type {
  EvaluationDataset,
  EvaluationSampleResult,
  EvaluationResult,
  CriterionConfig,
  CriterionScore,
  EvaluationOptions,
} from "../evaluator-types"
import type { SkillManifest } from "../types"

export function aggregateResults(
  skillId: string,
  manifest: SkillManifest,
  dataset: EvaluationDataset,
  sampleResults: EvaluationSampleResult[],
  criteria: CriterionConfig[],
  options: EvaluationOptions,
  startMs: number,
): EvaluationResult {
  const errors: string[] = []
  const failedSamples = sampleResults.filter((s) => s.status !== "completed")

  for (const sample of failedSamples) {
    if (sample.error) errors.push(`Sample "${sample.sampleId}": ${sample.error}`)
    else errors.push(`Sample "${sample.sampleId}" status: ${sample.status}`)
  }

  const criterionBreakdown: CriterionScore[] = criteria.map((c) => {
    const scores = sampleResults
      .filter((s) => s.status === "completed")
      .map((s) => s.criterionScores[c.name] ?? 0)

    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0

    return {
      name: c.name,
      score: avgScore,
      weight: c.weight,
      threshold: c.threshold,
      weighted: avgScore * c.weight,
      passed: avgScore >= c.threshold,
    }
  })

  const overallScore = criterionBreakdown.reduce((sum, c) => sum + c.score * c.weight, 0)
  const passThreshold = options.passThreshold ?? criteria.reduce((sum, c) => sum + c.threshold * c.weight, 0)

  return {
    skillId,
    skillName: manifest.name,
    skillVersion: manifest.version,
    datasetName: dataset.description ?? dataset.skillId,
    datasetDescription: dataset.description ?? "",
    sampleCount: dataset.samples.length,
    timestamp: new Date().toISOString(),
    overallScore,
    passThreshold,
    passed: overallScore >= passThreshold,
    criterionBreakdown,
    samples: sampleResults,
    errors,
    durationMs: Date.now() - startMs,
  }
}
