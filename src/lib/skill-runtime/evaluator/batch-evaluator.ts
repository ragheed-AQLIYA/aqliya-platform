import { readdirSync } from "fs"
import { join } from "path"

import { loadManifest } from "../runtime"
import type {
  EvaluationResult,
  BatchEvaluationResult,
  EvaluationOptions,
} from "../evaluator-types"
import { evaluateSkill } from "./evaluate-skill"

export async function evaluateSkillsByLevel(
  level?: number,
  options: EvaluationOptions = {},
): Promise<BatchEvaluationResult> {
  const startMs = Date.now()

  const manifestRoot = ".skills/manifests"
  const categories = readdirSync(join(process.cwd(), manifestRoot), { withFileTypes: true })

  const skillIds: string[] = []
  for (const category of categories) {
    if (!category.isDirectory()) continue
    const categoryPath = join(process.cwd(), manifestRoot, category.name)
    let files: string[] = []
    try {
      files = readdirSync(categoryPath).filter((f) => f.endsWith(".skill.yaml"))
    } catch {
      continue
    }
    for (const file of files) {
      const skillName = file.replace(".skill.yaml", "")
      const fullId = `skill:${category.name}:${skillName}`
      try {
        const manifest = loadManifest(fullId)
        if (level === undefined || manifest.level === level) {
          skillIds.push(fullId)
        }
      } catch {
        // Skip skills that fail to load
      }
    }
  }

  const results: EvaluationResult[] = []
  for (const skillId of skillIds) {
    try {
      const result = await evaluateSkill(skillId, options)
      results.push(result)
    } catch (err) {
      results.push({
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
        durationMs: 0,
      })
    }
  }

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length

  return {
    timestamp: new Date().toISOString(),
    totalSkills: results.length,
    passed,
    failed,
    errored: results.filter((r) => r.errors.length > 0 && !r.passed).length,
    overallPassRate: results.length > 0 ? passed / results.length : 0,
    results,
    durationMs: Date.now() - startMs,
  }
}
