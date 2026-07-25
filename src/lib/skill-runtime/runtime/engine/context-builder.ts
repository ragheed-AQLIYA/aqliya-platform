import type { SkillContext, SkillManifest } from "../../types"

export function buildExecutionContext(
  manifest: SkillManifest,
  invocationId: string,
  resolvedInputs: Record<string, unknown>,
  skillsRoot: string,
  startMs: number,
  session?: { userId?: string; organizationId?: string; role?: string },
): SkillContext {
  return {
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
      userId: session?.userId,
      organizationId: session?.organizationId,
      role: session?.role,
    },
    stepResults: {},
    errors: [],
    warnings: [],
    startedAt: startMs,
  }
}
