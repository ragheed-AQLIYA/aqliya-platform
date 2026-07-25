import { readFileSync, existsSync } from "fs"
import { join, resolve } from "path"

import { aiOrchestrator } from "@/lib/core/ai/orchestrator"
import type { AIProviderId } from "@/lib/core/ai/types"

import type { WorkflowStepDef, SkillContext, StepResult } from "../types"
import { SkillManifestError } from "../types"
import { resolveTemplate, resolveTemplateDeep } from "./templates"
import { sleep, DEFAULT_CONFIG } from "./common"

export async function executeStep(
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

    if (step.retry?.maxAttempts && step.retry.maxAttempts > 1) {
      const maxAttempts = step.retry.maxAttempts
      const delay = step.retry.delay ?? 1000

      for (let attempt = 2; attempt <= maxAttempts; attempt++) {
        await sleep(delay * attempt)
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

async function executePromptStep(
  step: WorkflowStepDef,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): Promise<StepResult> {
  const startMs = Date.now()
  const config = step.config ?? {}
  const promptTemplate = (config.prompt as string) ?? ""
  const resolvedPrompt = resolveTemplate(promptTemplate, context, stepResults)

  const temperature = config.temperature as number | undefined
  const maxTokens = config.maxTokens as number | undefined

  const modelCfg: Record<string, unknown> = {}
  if (temperature !== undefined) modelCfg.temperature = temperature
  if (maxTokens !== undefined) modelCfg.maxTokens = maxTokens

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

  const toolParams = params ?? (toolConfig.params as Record<string, unknown> ?? {})
  const resolvedParams = resolveTemplateDeep(toolParams, context, stepResults) as Record<string, unknown>

  try {
    switch (toolName) {
      case "filesystem:scan": {
        const path = String(resolvedParams.path ?? process.cwd())
        const include = (resolvedParams.include as string[]) ?? ["**/*"]
        const exclude = (resolvedParams.exclude as string[]) ?? []

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
        const resolvedPath = resolve(fullPath)
        if (!resolvedPath.startsWith(resolve(process.cwd()))) {
          return { status: "failed", output: null, error: "Access denied: path escapes project root", durationMs: Date.now() - startMs }
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

async function executeSkillStep(
  step: WorkflowStepDef,
  context: SkillContext,
  _stepResults: Record<string, StepResult>,
): Promise<StepResult> {
  const startMs = Date.now()
  const skillId =
    step.skill ??
    (step.config?.skill as string) ??
    (step.config?.skillId as string) ??
    ""

  if (!skillId) {
    return { status: "failed", output: null, error: "Skill step missing 'skill' id", durationMs: Date.now() - startMs }
  }

  const subSkillInputs =
    (step.config?.inputs as Record<string, unknown> | undefined) ??
    (step.params as Record<string, unknown> | undefined) ??
    {}

  try {
    const { executeSkill } = await import("./engine")
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

async function executeTransformStep(
  step: WorkflowStepDef,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): Promise<StepResult> {
  const startMs = Date.now()
  const config = (step.config as Record<string, unknown>) ?? {}
  const strategy = (config.strategy as string) ?? "sequential"
  const inputs = (config.inputs as { from: string; key: string }[]) ?? []
  const template = (config.template as string) ?? ""

  if (strategy === "aggregate" || strategy === "sequential") {
    const aggregated: Record<string, unknown> = {}
    for (const input of inputs) {
      const result = stepResults[input.from]
      if (result?.status === "completed") {
        aggregated[input.key] = result.output
      } else {
        aggregated[input.key] = `[${input.from}: ${result?.status ?? "not found"}]`
      }
    }

    if (template) {
      const resolvedTemplateStr = resolveTemplate(template, context, stepResults)
      const formatted = resolvedTemplateStr.replace(/\{\{(.+?)\}\}/g, (_, key: string) => {
        return String(aggregated[key.trim()] ?? `[${key.trim()}]`)
      })

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

async function executeDecisionStep(
  _step: WorkflowStepDef,
  _context: SkillContext,
  _stepResults: Record<string, StepResult>,
): Promise<StepResult> {
  return {
    status: "completed",
    output: { decision: "pass", note: "Decision step base implementation" },
    durationMs: 0,
  }
}

async function executeAggregateStep(
  step: WorkflowStepDef,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): Promise<StepResult> {
  return executeTransformStep(step, context, stepResults)
}
