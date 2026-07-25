import { readFileSync, existsSync } from "fs"
import { join } from "path"
import * as yaml from "js-yaml"

import { loadManifest } from "../runtime"
import type { SkillManifest } from "../types"
import type { EvaluationDataset } from "../evaluator-types"
import { EVAL_ROOT } from "./common"

export function loadDataset(skillId: string, manifest: SkillManifest, datasetPath?: string): EvaluationDataset {
  const pathsToTry: string[] = []

  if (datasetPath) {
    pathsToTry.push(datasetPath)
    pathsToTry.push(datasetPath.replace(/:/g, "-"))
  }

  if (!datasetPath && manifest.evaluation?.datasets && manifest.evaluation.datasets.length > 0) {
    const dsPath = manifest.evaluation.datasets[0].path
    pathsToTry.push(dsPath)
    pathsToTry.push(dsPath.replace(/:/g, "-"))
  }

  if (pathsToTry.length === 0) {
    const safeId = skillId.replace(/:/g, "-")
    const constructed = join(EVAL_ROOT, safeId, "datasets", "v1.yaml")
    pathsToTry.push(constructed)
  }

  for (const rawPath of pathsToTry) {
    const absolutePath = rawPath.startsWith("/") || /^[A-Za-z]:\\/.test(rawPath)
      ? rawPath
      : join(process.cwd(), rawPath)

    if (existsSync(absolutePath)) {
      const raw = readFileSync(absolutePath, "utf-8")
      return yaml.load(raw) as EvaluationDataset
    }
  }

  const safeId2 = skillId.replace(/:/g, "-")
  const hyphenDefault = join(process.cwd(), EVAL_ROOT, safeId2, "datasets", "v1.yaml")
  if (existsSync(hyphenDefault)) {
    const raw = readFileSync(hyphenDefault, "utf-8")
    return yaml.load(raw) as EvaluationDataset
  }

  throw new Error(
    `Evaluation dataset not found for skill "${skillId}". Tried:\n  ${pathsToTry.join("\n  ")}`,
  )
}
