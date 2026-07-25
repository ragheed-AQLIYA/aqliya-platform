import type { SkillManifest, StepResult } from "../../types"

export function collectArtifacts(
  manifest: SkillManifest,
  stepResults: Record<string, StepResult>,
): Record<string, unknown> {
  const artifacts: Record<string, unknown> = {}

  if (manifest.outputs.artifacts) {
    for (const artifact of manifest.outputs.artifacts) {
      const matchingStep = Object.entries(stepResults).find(
        ([id]) => artifact.name && id.includes(artifact.name.replace(/-/g, "")),
      )
      if (matchingStep) {
        artifacts[artifact.name] = matchingStep[1].output
      }
    }
    for (const [stepId, result] of Object.entries(stepResults)) {
      if (result.status === "completed" && !artifacts[stepId]) {
        artifacts[stepId] = result.output
      }
    }
  }

  return artifacts
}

export function countFailedSteps(stepResults: Record<string, StepResult>): number {
  return Object.entries(stepResults).filter(([, r]) => r.status === "failed").length
}

export function countSkippedSteps(stepResults: Record<string, StepResult>): number {
  return Object.entries(stepResults).filter(([, r]) => r.status === "skipped").length
}
