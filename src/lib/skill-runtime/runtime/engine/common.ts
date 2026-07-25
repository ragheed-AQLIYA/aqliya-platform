import type { SkillResult } from "../../types"

export function buildErrorResult(
  skillId: string,
  skillName: string,
  invocationId: string,
  version: string,
  errors: string[],
  warnings: string[],
  startMs: number,
  startedAt: string,
): SkillResult {
  return {
    skillId,
    skillName,
    invocationId,
    version,
    status: "failed",
    primary: null,
    artifacts: {},
    steps: {},
    errors,
    warnings,
    durationMs: Date.now() - startMs,
    startedAt,
    completedAt: new Date().toISOString(),
  }
}
