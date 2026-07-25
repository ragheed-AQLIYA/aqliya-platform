import type { SkillManifest, SkillContext, StepResult } from "../../types"
import { executeStep } from "../steps"

export interface WorkflowExecutionResult {
  stepResults: Record<string, StepResult>
  executionErrors: string[]
  executionWarnings: string[]
  artifacts: Record<string, unknown>
}

export async function executeWorkflowSteps(
  manifest: SkillManifest,
  context: SkillContext,
): Promise<WorkflowExecutionResult> {
  const stepResults: Record<string, StepResult> = {}
  const executionErrors: string[] = []
  const executionWarnings: string[] = [...(context.warnings ?? [])]
  const artifacts: Record<string, unknown> = {}
  const steps = manifest.execution.workflow?.steps ?? []
  const maxTimeout = manifest.execution.timeout ?? 120_000
  const overallTimeout = Date.now() + maxTimeout

  const executedSteps = new Set<string>()

  while (executedSteps.size < steps.length) {
    let progressed = false

    for (const step of steps) {
      if (executedSteps.has(step.id)) continue

      const deps = step.dependsOn ?? []
      const depsReady = deps.every((depId) => executedSteps.has(depId))

      if (!depsReady) continue

      if (Date.now() > overallTimeout) {
        executionErrors.push(`Overall timeout exceeded for skill "${manifest.id}"`)
        executionWarnings.push(`Step "${step.id}" skipped due to overall timeout`)
        stepResults[step.id] = {
          status: "skipped",
          output: null,
          error: "Overall timeout",
          durationMs: 0,
        }
        executedSteps.add(step.id)
        progressed = true
        continue
      }

      const stepResult = await executeStep(step, context, stepResults)
      stepResults[step.id] = stepResult
      executedSteps.add(step.id)
      progressed = true

      if (stepResult.status === "failed") {
        executionErrors.push(`Step "${step.id}" failed: ${stepResult.error}`)
      }
    }

    if (!progressed) {
      const pending = steps.filter((s) => !executedSteps.has(s.id)).map((s) => s.id)
      executionErrors.push(`Cannot resolve step dependencies. Pending steps: ${pending.join(", ")}`)
      for (const pendingId of pending) {
        stepResults[pendingId] = {
          status: "skipped",
          output: null,
          error: "Unresolvable dependency",
          durationMs: 0,
        }
        executedSteps.add(pendingId)
      }
      break
    }
  }

  return { stepResults, executionErrors, executionWarnings, artifacts }
}
