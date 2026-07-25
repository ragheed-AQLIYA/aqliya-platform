import type { SkillContext, StepResult } from "../types"

export function resolveTemplate(
  template: string,
  context: SkillContext,
  stepResults: Record<string, StepResult>,
): string {
  return template.replace(/\{\{(.+?)\}\}/g, (match, path: string) => {
    const trimmed = path.trim()

    if (trimmed.startsWith("inputs.")) {
      const key = trimmed.slice(7)
      return String(context.inputs[key] ?? "")
    }

    if (trimmed.startsWith("steps.") && trimmed.endsWith(".output")) {
      const stepId = trimmed.slice(6, -7)
      const result = stepResults[stepId]
      if (!result) return `[unresolved: step "${stepId}" not executed yet]`
      return typeof result.output === "string"
        ? result.output
        : JSON.stringify(result.output, null, 2)
    }

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

export function resolveTemplateDeep(
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
