import { loadManifest, executeSkill } from "../runtime"
import type { SkillManifest, SkillResult } from "../types"
import type {
  EvaluationDataset,
  EvaluationSampleResult,
  EvaluationResult,
  CriterionConfig,
  EvaluationOptions,
} from "../evaluator-types"
import { loadDataset } from "./dataset-loader"
import { scoreSample } from "./scoring"
import { aggregateResults } from "./aggregator"

export async function evaluateSkill(
  skillId: string,
  options: EvaluationOptions = {},
): Promise<EvaluationResult> {
  const startMs = Date.now()

  let manifest: SkillManifest
  try {
    manifest = loadManifest(skillId)
  } catch (err) {
    return {
      skillId,
      skillName: skillId,
      skillVersion: "unknown",
      datasetName: "",
      datasetDescription: "",
      sampleCount: 0,
      timestamp: new Date().toISOString(),
      overallScore: 0,
      passThreshold: 0,
      passed: false,
      criterionBreakdown: [],
      samples: [],
      errors: [err instanceof Error ? err.message : String(err)],
      durationMs: Date.now() - startMs,
    }
  }

  let dataset: EvaluationDataset
  try {
    dataset = loadDataset(skillId, manifest, options.datasetPath)
  } catch (err) {
    return {
      skillId,
      skillName: manifest.name,
      skillVersion: manifest.version,
      datasetName: "",
      datasetDescription: "",
      sampleCount: 0,
      timestamp: new Date().toISOString(),
      overallScore: 0,
      passThreshold: 0,
      passed: false,
      criterionBreakdown: [],
      samples: [],
      errors: [err instanceof Error ? err.message : String(err)],
      durationMs: Date.now() - startMs,
    }
  }

  const criteria: CriterionConfig[] = options.criteria ?? (manifest.evaluation?.criteria as CriterionConfig[]) ?? []

  if (criteria.length === 0) {
    return {
      skillId,
      skillName: manifest.name,
      skillVersion: manifest.version,
      datasetName: dataset.description ?? dataset.skillId,
      datasetDescription: dataset.description ?? "",
      sampleCount: dataset.samples.length,
      timestamp: new Date().toISOString(),
      overallScore: 1.0,
      passThreshold: 1.0,
      passed: true,
      criterionBreakdown: [],
      samples: [],
      errors: ["No evaluation criteria defined — passing by default"],
      durationMs: Date.now() - startMs,
    }
  }

  const sampleResults: EvaluationSampleResult[] = []

  for (const sample of dataset.samples) {
    const sampleStart = Date.now()
    let sampleResult: EvaluationSampleResult

    try {
      const execResult: SkillResult = await executeSkill(skillId, sample.input, {
        session: options.session,
        auditEnabled: options.auditEnabled,
      })

      const durationMs = Date.now() - sampleStart
      const output = execResult.primary

      const criterionScores = scoreSample(output, sample.expected, criteria, durationMs)

      const overallScore = criteria.reduce((sum, c) => sum + (criterionScores[c.name] ?? 0) * c.weight, 0)

      sampleResult = {
        sampleId: sample.id,
        description: sample.description,
        status: execResult.status === "completed" ? "completed" : "failed",
        output,
        error: execResult.errors.length > 0 ? execResult.errors.join("; ") : undefined,
        criterionScores,
        overallScore,
        durationMs,
      }
    } catch (err) {
      sampleResult = {
        sampleId: sample.id,
        description: sample.description,
        status: "error",
        output: null,
        error: err instanceof Error ? err.message : String(err),
        criterionScores: {},
        overallScore: 0,
        durationMs: Date.now() - sampleStart,
      }

      if (options.failFast) {
        sampleResults.push(sampleResult)
        break
      }
    }

    sampleResults.push(sampleResult)
  }

  return aggregateResults(skillId, manifest, dataset, sampleResults, criteria, options, startMs)
}
