// ─── AQLIYA Skill Runtime v0.1 ───
// Thin wrapper around existing AIOrchestrator for skill execution.
// Reads YAML manifests, resolves steps, orchestrates execution, audits results.
// Relies on AIOrchestrator for provider selection, fallback, governance, and RAG.
// ============================================================

import { readFileSync, existsSync } from "fs"
import { join } from "path"
import * as yaml from "js-yaml"

import { aiOrchestrator } from "@/lib/ai/orchestrator"
import type { AIProviderId } from "@/lib/ai/types"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"

import type {
  SkillManifest,
  SkillContext,
  SkillResult,
  StepResult,
  WorkflowStepDef,
  SkillRuntimeConfig,
  InputDef,
} from "./types"
import { SkillManifestError, SkillExecutionError } from "./types"

// ─── Default Config ───

const DEFAULT_CONFIG: SkillRuntimeConfig = {
  skillsRoot: ".skills/manifests",
  auditEnabled: true,
}

// ─── Invocation ID Generator ───

let invocationCounter = 0
function generateInvocationId(): string {
  invocationCounter++
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 6)
  return `skinv-${ts}-${rand}-${invocationCounter}`
}

// ─── Manifest Loader ───

function loadManifest(skillId: string, skillsRoot?: string): SkillManifest {
  // Convert skill:category:name → path
  const parts = skillId.split(":")
  if (parts.length !== 3 || parts[0] !== "skill") {
    throw new SkillManifestError(`Invalid skill ID format: "${skillId}". Expected "skill:{category}:{name}"`)
  }
  const [, category, name] = parts
  const root = skillsRoot ?? DEFAULT_CONFIG.skillsRoot
  const categoryAndName = join(category, `${name}.skill.yaml`)
  // If root is absolute, use it directly; otherwise join with cwd
  const manifestPath = root.startsWith("/") || /^[A-Za-z]:\\/.test(root)
    ? join(root, categoryAndName)
    : join(process.cwd(), root, categoryAndName)

  if (!existsSync(manifestPath)) {
    throw new SkillManifestError(`Manifest not found at: ${manifestPath}`, skillId)
  }

  const raw = readFileSync(manifestPath, "utf-8")
  const manifest = yaml.load(raw) as SkillManifest

  // Basic validation
  if (!manifest.id || !manifest.name || !manifest.version) {
    throw new SkillManifestError(
      `Manifest at "${manifestPath}" is missing required fields (id, name, version)`,
      skillId,
    )
  }
  if (manifest.id !== skillId) {
    throw new SkillManifestError(
      `Manifest ID mismatch: file expected "${skillId}" but manifest declares "${manifest.id}"`,
      skillId,
    )
  }

  return manifest
}

// ─── Input Validation ───

function validateInputs(
  manifest: SkillManifest,
  providedInputs: Record<string, unknown>,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {}

  // Check required inputs
  for (const def of manifest.inputs.required) {
    const value = providedInputs[def.name]
    if (value === undefined || value === null) {
      // Check for template default in the input string
      if (providedInputs[def.name] !== undefined) {
        resolved[def.name] = providedInputs[def.name]
      } else {
        throw new SkillManifestError(
          `Missing required input "${def.name}" for skill "${manifest.id}": ${def.description}`,
          manifest.id,
        )
      }
    } else {
      resolved[def.name] = coerceInput(value, def)
    }
  }

  // Apply optional inputs with defaults
  if (manifest.inputs.optional) {
    for (const def of manifest.inputs.optional) {
      const value = providedInputs[def.name]
      if (value !== undefined && value !== null) {
        resolved[def.name] = coerceInput(value, def)
      } else if (def.default !== undefined) {
        resolved[def.name] = def.default
      }
    }
  }

  return resolved
}

function coerceInput(value: unknown, def: InputDef): unknown {
  switch (def.type) {
    case "number": {
      const n = Number(value)
      if (isNaN(n)) throw new SkillManifestError(`Input "${def.name}" must be a number`)
      return n
    }
    case "boolean":
      if (typeof value === "string") return value === "true" || value === "1"
      return Boolean(value)
    case "array":
      return Array.isArray(value) ? value : [value]
    default:
      return value
  }
}

// ─── Step Template Resolution ───
// Replaces {{inputs.X}}, {{steps.X.output}}, {{context.X}} in prompt strings

function resolveTemplate(
  template: string,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): string {
  return template.replace(/\{\{(.+?)\}\}/g, (match, path: string) => {
    const trimmed = path.trim()

    // {{inputs.X}}
    if (trimmed.startsWith("inputs.")) {
      const key = trimmed.slice(7)
      return String(context.inputs[key] ?? "")
    }

    // {{steps.X.output}}
    if (trimmed.startsWith("steps.") && trimmed.endsWith(".output")) {
      const stepId = trimmed.slice(6, -7) // Remove "steps." prefix and ".output" suffix
      const result = stepResults[stepId]
      if (!result) return `[unresolved: step "${stepId}" not executed yet]`
      return typeof result.output === "string"
        ? result.output
        : JSON.stringify(result.output, null, 2)
    }

    // {{context.X}}
    if (trimmed.startsWith("context.")) {
      const key = trimmed.slice(8)
      if (key === "session.userId") return context.session.userId ?? ""
      if (key === "session.organizationId") return context.session.organizationId ?? ""
      if (key === "session.role") return context.session.role ?? ""
      return String((context.config as Record<string, unknown>)[key] ?? "")
    }

    return match
  })
}

function resolveTemplateDeep(
  value: unknown,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): unknown {
  if (typeof value === "string") {
    return resolveTemplate(value, context, stepResults)
  }
  if (Array.isArray(value)) {
    return value.map((v) => resolveTemplateDeep(v, context, stepResults))
  }
  if (value !== null && typeof value === "object") {
    const resolved: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      resolved[k] = resolveTemplateDeep(v, context, stepResults)
    }
    return resolved
  }
  return value
}

// ─── Step Executor ───

async function executeStep(
  step: WorkflowStepDef,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): Promise<StepResult> {
  const startMs = Date.now()

  try {
    switch (step.type) {
      case "prompt":
        return await executePromptStep(step, context, stepResults)
      case "tool":
        return await executeToolStep(step, context, stepResults)
      case "skill":
        return await executeSkillStep(step, context, stepResults)
      case "transform":
        return await executeTransformStep(step, context, stepResults)
      case "decision":
        return await executeDecisionStep(step, context, stepResults)
      case "aggregate":
        return await executeAggregateStep(step, context, stepResults)
      default:
        return {
          status: "failed",
          output: null,
          error: `Unknown step type: "${step.type}"`,
          durationMs: Date.now() - startMs,
        }
    }
  } catch (err) {
    const durationMs = Date.now() - startMs
    const message = err instanceof Error ? err.message : String(err)

    // Retry logic
    if (step.retry?.maxAttempts && step.retry.maxAttempts > 1) {
      const maxAttempts = step.retry.maxAttempts
      const delay = step.retry.delay ?? 1000

      for (let attempt = 2; attempt <= maxAttempts; attempt++) {
        await sleep(delay * attempt) // Linear backoff
        try {
          switch (step.type) {
            case "prompt":
              return await executePromptStep(step, context, stepResults)
            case "tool":
              return await executeToolStep(step, context, stepResults)
            default:
              break
          }
        } catch {
          // continue to next retry
        }
      }
    }

    return {
      status: "failed",
      output: null,
      error: message,
      durationMs,
    }
  }
}

// ─── Prompt Step ───

async function executePromptStep(
  step: WorkflowStepDef,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): Promise<StepResult> {
  const startMs = Date.now()
  const config = step.config ?? {}
  const promptTemplate = (config.prompt as string) ?? ""
  const resolvedPrompt = resolveTemplate(promptTemplate, context, stepResults)

  // Determine model preference from step config
  const modelConfig = config.model as string | undefined
  const temperature = config.temperature as number | undefined
  const maxTokens = config.maxTokens as number | undefined

  // Build modelConfig for the orchestrator
  const modelCfg: Record<string, unknown> = {}
  if (temperature !== undefined) modelCfg.temperature = temperature
  if (maxTokens !== undefined) modelCfg.maxTokens = maxTokens

  // Extract provider hint from manifest model resilience config
  let preferProvider: AIProviderId | undefined

  try {
    const result = await aiOrchestrator.generate({
      taskType: "skill_execution",
      taskInput: {
        prompt: resolvedPrompt,
        skillId: context.skillId,
        stepId: step.id,
        modelConfig: modelCfg,
        ...context.inputs,
      },
      organizationId: context.session.organizationId,
      userId: context.session.userId,
      userRole: context.session.role,
      preferProvider,
    })

    return {
      status: "completed",
      output: result.response.output,
      durationMs: Date.now() - startMs,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      status: "failed",
      output: null,
      error: message,
      durationMs: Date.now() - startMs,
    }
  }
}

// ─── Tool Step ───

async function executeToolStep(
  step: WorkflowStepDef,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): Promise<StepResult> {
  const startMs = Date.now()
  const config = step.config as Record<string, unknown> | undefined
  const params = step.params as Record<string, unknown> | undefined

  if (!config && !params) {
    return { status: "failed", output: null, error: "Tool step has no config", durationMs: Date.now() - startMs }
  }

  const toolConfig = config ?? {}
  const toolName = (toolConfig.tool as string) ?? ""

  if (!toolName) {
    return { status: "failed", output: null, error: "Tool step missing 'tool' in config", durationMs: Date.now() - startMs }
  }

  // Resolve tool parameters
  const toolParams = params ?? (toolConfig.params as Record<string, unknown> ?? {})
  const resolvedParams = resolveTemplateDeep(toolParams, context, stepResults) as Record<string, unknown>

  try {
    switch (toolName) {
      case "filesystem:scan": {
        const path = String(resolvedParams.path ?? process.cwd())
        const include = (resolvedParams.include as string[]) ?? ["**/*"]
        const exclude = (resolvedParams.exclude as string[]) ?? []

        // Use glob pattern matching via simple recursive directory scan
        const { globSync } = await import("glob")
        const files = globSync(include, {
          cwd: path,
          ignore: exclude,
          dot: true,
          nodir: true,
        })
        return {
          status: "completed",
          output: files,
          durationMs: Date.now() - startMs,
        }
      }

      case "filesystem:read": {
        const filePath = String(resolvedParams.path ?? "")
        if (!filePath) {
          return { status: "failed", output: null, error: "filesystem:read requires 'path' parameter", durationMs: Date.now() - startMs }
        }
        const fullPath = filePath.startsWith("/") || /^[A-Za-z]:\\/.test(filePath)
          ? filePath
          : join(process.cwd(), filePath)
        if (!existsSync(fullPath)) {
          return { status: "failed", output: null, error: `File not found: ${fullPath}`, durationMs: Date.now() - startMs }
        }
        const content = readFileSync(fullPath, "utf-8")
        return {
          status: "completed",
          output: content,
          durationMs: Date.now() - startMs,
        }
      }

      default:
        return {
          status: "failed",
          output: null,
          error: `Unknown tool: "${toolName}"`,
          durationMs: Date.now() - startMs,
        }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      status: "failed",
      output: null,
      error: message,
      durationMs: Date.now() - startMs,
    }
  }
}

// ─── Sub-Skill Step ───

async function executeSkillStep(
  step: WorkflowStepDef,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): Promise<StepResult> {
  const startMs = Date.now()
  const skillId = step.skill ?? (step.config?.skill as string) ?? (step.config?.skillId as string) ?? ""

  if (!skillId) {
    return { status: "failed", output: null, error: "Skill step missing 'skill' id", durationMs: Date.now() - startMs }
  }

  // Resolve sub-skill inputs from config.inputs or step.params
  const subSkillInputs =
    (step.config?.inputs as Record<string, unknown> | undefined) ??
    (step.params as Record<string, unknown> | undefined) ??
    {}

  try {
    const subResult = await executeSkill(
      skillId,
      subSkillInputs,
      {
        skillsRoot: context.config.skillsRoot as string ?? DEFAULT_CONFIG.skillsRoot,
        session: context.session,
      },
    )

    return {
      status: subResult.status === "completed" ? "completed" : "failed",
      output: subResult.primary,
      durationMs: Date.now() - startMs,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      status: "failed",
      output: null,
      error: message,
      durationMs: Date.now() - startMs,
    }
  }
}

// ─── Transform Step ───

async function executeTransformStep(
  step: WorkflowStepDef,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): Promise<StepResult> {
  const startMs = Date.now()
  const config = step.config as Record<string, unknown> ?? {}
  const strategy = config.strategy as string ?? "sequential"
  const inputs = config.inputs as { from: string; key: string }[] ?? []
  const template = config.template as string ?? ""

  if (strategy === "aggregate" || strategy === "sequential") {
    // Aggregate multiple step outputs
    const aggregated: Record<string, unknown> = {}
    for (const input of inputs) {
      const result = stepResults[input.from]
      if (result?.status === "completed") {
        aggregated[input.key] = result.output
      } else {
        aggregated[input.key] = `[${input.from}: ${result?.status ?? "not found"}]`
      }
    }

    // If there's a template, use it to format the output
    if (template) {
      const resolvedTemplateStr = resolveTemplate(template, context, stepResults)
      // Replace {{key}} placeholders with aggregated values
      const formatted = resolvedTemplateStr.replace(/\{\{(.+?)\}\}/g, (_, key: string) => {
        return String(aggregated[key.trim()] ?? `[${key.trim()}]`)
      })

      // Compute executive summary with AI if template includes it
      let output = formatted
      if (template.includes("executive_summary")) {
        try {
          const summaryResult = await aiOrchestrator.generate({
            taskType: "skill_execution",
            taskInput: {
              prompt: `Generate a 3-5 bullet executive summary of the following audit findings:\n\n${JSON.stringify(aggregated, null, 2)}`,
              skillId: context.skillId,
              stepId: step.id,
            },
            organizationId: context.session.organizationId,
          })
          output = formatted.replace(/\{\{executive_summary\}\}/g, summaryResult.response.output)
        } catch {
          output = formatted.replace(/\{\{executive_summary\}\}/g, "[Executive summary generation failed]")
        }
      }

      return {
        status: "completed",
        output,
        durationMs: Date.now() - startMs,
      }
    }

    return {
      status: "completed",
      output: aggregated,
      durationMs: Date.now() - startMs,
    }
  }

  return {
    status: "failed",
    output: null,
    error: `Unknown transform strategy: "${strategy}"`,
    durationMs: Date.now() - startMs,
  }
}

// ─── Decision Step ───

async function executeDecisionStep(
  step: WorkflowStepDef,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): Promise<StepResult> {
  // Decision steps evaluate a condition and branch — for now, pass through
  return {
    status: "completed",
    output: { decision: "pass", note: "Decision step base implementation" },
    durationMs: 0,
  }
}

// ─── Aggregate Step ───

async function executeAggregateStep(
  step: WorkflowStepDef,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): Promise<StepResult> {
  return executeTransformStep(step, context, stepResults)
}

// ─── Main Execution ───

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
  let manifest: SkillManifest
  try {
    manifest = loadManifest(skillId, skillsRoot)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      skillId,
      skillName: skillId,
      invocationId,
      version: "unknown",
      status: "failed",
      primary: null,
      artifacts: {},
      steps: {},
      errors: [message],
      warnings: [],
      durationMs: Date.now() - startMs,
      startedAt,
      completedAt: new Date().toISOString(),
    }
  }

  // ─── Phase 2: Validate Inputs ───
  let resolvedInputs: Record<string, unknown>
  try {
    resolvedInputs = validateInputs(manifest, inputs)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      skillId: manifest.id,
      skillName: manifest.name,
      invocationId,
      version: manifest.version,
      status: "failed",
      primary: null,
      artifacts: {},
      steps: {},
      errors: [message],
      warnings: [],
      durationMs: Date.now() - startMs,
      startedAt,
      completedAt: new Date().toISOString(),
    }
  }

  // ─── Phase 3: Build Context ───
  const context: SkillContext = {
    skillId: manifest.id,
    skillName: manifest.name,
    version: manifest.version,
    invocationId,
    inputs: resolvedInputs,
    config: {
      skillsRoot,
      timeout: manifest.execution.timeout ?? 120,
      maxRetries: manifest.execution.maxRetries ?? 2,
    },
    session: {
      userId: options?.session?.userId,
      organizationId: options?.session?.organizationId,
      role: options?.session?.role,
    },
    stepResults: {},
    errors: [],
    warnings: [],
    startedAt: startMs,
  }

  // ─── Phase 4: Execute Workflow Steps ───
  const stepResults: Record<string, StepResult> = {}
  const executionErrors: string[] = []
  const executionWarnings: string[] = [...(context.warnings ?? [])]
  const artifacts: Record<string, unknown> = {}
  const steps = manifest.execution.workflow?.steps ?? []
  const maxTimeout = manifest.execution.timeout ?? 120_000
  const overallTimeout = Date.now() + maxTimeout

  if (steps.length === 0) {
    return {
      skillId: manifest.id,
      skillName: manifest.name,
      invocationId,
      version: manifest.version,
      status: "failed",
      primary: null,
      artifacts: {},
      steps: {},
      errors: ["No workflow steps defined"],
      warnings: executionWarnings,
      durationMs: Date.now() - startMs,
      startedAt,
      completedAt: new Date().toISOString(),
    }
  }

  // Simple step execution (no DAG — executes in order, handles dependsOn)
  const executedSteps = new Set<string>()

  while (executedSteps.size < steps.length) {
    let progressed = false

    for (const step of steps) {
      if (executedSteps.has(step.id)) continue

      // Check if this step is ready (dependencies met or no dependencies)
      const deps = step.dependsOn ?? []
      const depsReady = deps.every((depId) => executedSteps.has(depId))

      if (!depsReady) continue

      // Check timeout
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

      // Execute step
      const stepResult = await executeStep(step, context, stepResults)
      stepResults[step.id] = stepResult
      executedSteps.add(step.id)
      progressed = true

      if (stepResult.status === "failed") {
        executionErrors.push(`Step "${step.id}" failed: ${stepResult.error}`)
      }
    }

    if (!progressed) {
      // Circular dependency or unresolvable steps
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

  // ─── Phase 5: Collect Outputs ───
  // Primary output is the last completed step's output, or the first artifact
  const completedSteps = Object.entries(stepResults).filter(([, r]) => r.status === "completed")
  const lastCompleted = completedSteps[completedSteps.length - 1]

  const primary = lastCompleted?.[1]?.output ?? null

  // Collect artifacts from output definitions
  if (manifest.outputs.artifacts) {
    for (const artifact of manifest.outputs.artifacts) {
      // Try to find matching step output
      const matchingStep = Object.entries(stepResults).find(
        ([id]) => artifact.name && id.includes(artifact.name.replace(/-/g, "")),
      )
      if (matchingStep) {
        artifacts[artifact.name] = matchingStep[1].output
      }
    }
    // Also add all completed step outputs as artifacts
    for (const [stepId, result] of Object.entries(stepResults)) {
      if (result.status === "completed" && !artifacts[stepId]) {
        artifacts[stepId] = result.output
      }
    }
  }

  // ─── Phase 6: Determine Overall Status ───
  const failedSteps = Object.entries(stepResults).filter(([, r]) => r.status === "failed")
  const skippedSteps = Object.entries(stepResults).filter(([, r]) => r.status === "skipped")
  const problematicSteps = failedSteps.length + skippedSteps.length
  const overallStatus =
    problematicSteps === 0
      ? "completed"
      : problematicSteps < steps.length
        ? "degraded"
        : "failed"

  // ─── Phase 7: Audit Trail ───
  if (options?.auditEnabled !== false) {
    try {
      await writePlatformAuditLog({
        productKey: "skill_runtime",
        action: "skill_execution",
        targetType: "skill",
        targetId: manifest.id,
        targetLabel: `${manifest.name} v${manifest.version}`,
        actorId: context.session.userId,
        actorType: context.session.role ? `role:${context.session.role}` : "system",
        status: overallStatus === "completed" ? "success" : "failure",
        severity: executionErrors.length > 0 ? "warning" : "info",
        sourceSystem: "skill_runtime",
        sourceModel: "runtime_v0.1",
        metadata: {
          invocationId,
          skillName: manifest.name,
          skillVersion: manifest.version,
          stepCount: steps.length,
          failedSteps: failedSteps.length,
          durationMs: Date.now() - startMs,
          errors: executionErrors,
          warnings: executionWarnings,
        } as Record<string, unknown>,
      })
    } catch {
      // Audit failure must never break execution
    }
  }

  // ─── Return Result ───
  return {
    skillId: manifest.id,
    skillName: manifest.name,
    invocationId,
    version: manifest.version,
    status: overallStatus,
    primary,
    artifacts,
    steps: stepResults,
    errors: executionErrors,
    warnings: executionWarnings,
    durationMs: Date.now() - startMs,
    startedAt,
    completedAt: new Date().toISOString(),
  }
}

// ─── Utility ───

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── Registry Query ───

export async function listAvailableSkills(skillsRoot?: string): Promise<string[]> {
  const root = skillsRoot ?? DEFAULT_CONFIG.skillsRoot
  const { readdirSync } = await import("fs")
  const { join: pathJoin } = await import("path")

  const skills: string[] = []
    const fullPath = root.startsWith("/") || /^[A-Za-z]:\\/.test(root)
      ? root
      : pathJoin(process.cwd(), root)

  if (!existsSync(fullPath)) return skills

  const categories = readdirSync(fullPath, { withFileTypes: true })
  for (const category of categories) {
    if (!category.isDirectory()) continue
    const categoryPath = pathJoin(fullPath, category.name)
    const files = readdirSync(categoryPath).filter((f) => f.endsWith(".skill.yaml"))
    for (const file of files) {
      const skillName = file.replace(".skill.yaml", "")
      skills.push(`skill:${category.name}:${skillName}`)
    }
  }

  return skills.sort()
}

export { loadManifest, validateInputs }
