import type { SkillResult } from "../../types"
import { generateInvocationId, DEFAULT_CONFIG } from "../common"
import { buildErrorResult } from "./common"
import { loadManifestPhase } from "./manifest-loader"
import { validateInputsPhase } from "./input-validator"
import { buildExecutionContext } from "./context-builder"
import { executeWorkflowSteps } from "./workflow-executor"
import { collectArtifacts, countFailedSteps } from "./output-collector"
import { determineOverallStatus, writeAuditEvent, buildFinalResult } from "./result-builder"

export interface ExecuteSkillOptions {
  skillsRoot?: string
  session?: {
    userId?: string
    organizationId?: string
    role?: string
  }
  auditEnabled?: boolean
}

export async function executeSkill(
  skillId: string,
  inputs: Record<string, unknown>,
  options?: ExecuteSkillOptions,
): Promise<SkillResult> {
  const startMs = Date.now()
  const startedAt = new Date().toISOString()
  const invocationId = generateInvocationId()
  const skillsRoot = options?.skillsRoot ?? DEFAULT_CONFIG.skillsRoot

  // ─── Phase 1: Load Manifest ───
  let manifest
  try {
    manifest = loadManifestPhase(skillId, skillsRoot)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return buildErrorResult(skillId, skillId, invocationId, "unknown", [message], [], startMs, startedAt)
  }

  // ─── Phase 2: Validate Inputs ───
  let resolvedInputs
  try {
    resolvedInputs = validateInputsPhase(manifest, inputs)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return buildErrorResult(manifest.id, manifest.name, invocationId, manifest.version, [message], [], startMs, startedAt)
  }

  // ─── Phase 3: Build Context ───
  const context = buildExecutionContext(manifest, invocationId, resolvedInputs, skillsRoot, startMs, options?.session)

  // ─── Phase 4: Execute Workflow Steps ───
  const steps = manifest.execution.workflow?.steps ?? []
  if (steps.length === 0) {
    return buildErrorResult(manifest.id, manifest.name, invocationId, manifest.version, ["No workflow steps defined"], [], startMs, startedAt)
  }

  const { stepResults, executionErrors, executionWarnings, artifacts: workflowArtifacts } =
    await executeWorkflowSteps(manifest, context)

  // ─── Phase 5: Collect Outputs ───
  const completedSteps = Object.entries(stepResults).filter(([, r]) => r.status === "completed")
  const lastCompleted = completedSteps[completedSteps.length - 1]
  const primary = lastCompleted?.[1]?.output ?? null

  const artifacts = collectArtifacts(manifest, stepResults)

  // ─── Phase 6: Determine Overall Status ───
  const overallStatus = determineOverallStatus(stepResults, steps.length)

  // ─── Phase 7: Audit Trail ───
  const durationMs = Date.now() - startMs
  const failedCount = countFailedSteps(stepResults)
  await writeAuditEvent(
    manifest,
    overallStatus,
    executionErrors,
    executionWarnings,
    steps.length,
    failedCount,
    durationMs,
    context.session,
    options?.auditEnabled,
  )

  return buildFinalResult(
    manifest,
    invocationId,
    overallStatus,
    primary,
    artifacts,
    stepResults,
    executionErrors,
    executionWarnings,
    durationMs,
    startedAt,
  )
}
