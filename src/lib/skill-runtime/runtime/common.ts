import type { SkillRuntimeConfig } from "../types"

export const DEFAULT_CONFIG: SkillRuntimeConfig = {
  skillsRoot: ".skills/manifests",
  auditEnabled: true,
}

let invocationCounter = 0
export function generateInvocationId(): string {
  invocationCounter++
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 6)
  return `skinv-${ts}-${rand}-${invocationCounter}`
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
