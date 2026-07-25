import type { SkillManifest, SkillResult, StepResult } from "../../types"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"

export function determineOverallStatus(
  stepResults: Record<string, StepResult>,
  totalSteps: number,
): "completed" | "failed" | "degraded" {
  const failedSteps = countStatus(stepResults, "failed")
  const skippedSteps = countStatus(stepResults, "skipped")
  const problematic = failedSteps + skippedSteps
  if (problematic === 0) return "completed"
  if (problematic < totalSteps) return "degraded"
  return "failed"
}

function countStatus(
  stepResults: Record<string, StepResult>,
  status: "failed" | "skipped",
): number {
  return Object.entries(stepResults).filter(([, r]) => r.status === status).length
}

export async function writeAuditEvent(
  manifest: SkillManifest,
  overallStatus: "completed" | "failed" | "degraded",
  executionErrors: string[],
  executionWarnings: string[],
  stepsLength: number,
  failedCount: number,
  durationMs: number,
  session?: { userId?: string; role?: string },
  auditEnabled?: boolean,
): Promise<void> {
  if (auditEnabled !== false) {
    try {
      await writePlatformAuditLog({
        productKey: "skill_runtime",
        action: "skill_execution",
        targetType: "skill",
        targetId: manifest.id,
        targetLabel: `${manifest.name} v${manifest.version}`,
        actorId: session?.userId,
        actorType: session?.role ? `role:${session.role}` : "system",
        status: overallStatus === "completed" ? "success" : "failure",
        severity: executionErrors.length > 0 ? "warning" : "info",
        sourceSystem: "skill_runtime",
        sourceModel: "runtime_v0.1",
        metadata: {
          invocationId: null,
          skillName: manifest.name,
          skillVersion: manifest.version,
          stepCount: stepsLength,
          failedSteps: failedCount,
          durationMs,
          errors: executionErrors,
          warnings: executionWarnings,
        } as Record<string, unknown>,
      })
    } catch {
      // Audit failure must never break execution
    }
  }
}

export function buildFinalResult(
  manifest: SkillManifest,
  invocationId: string,
  overallStatus: "completed" | "failed" | "degraded",
  primary: unknown,
  artifacts: Record<string, unknown>,
  stepResults: Record<string, StepResult>,
  executionErrors: string[],
  executionWarnings: string[],
  durationMs: number,
  startedAt: string,
): SkillResult {
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
    durationMs,
    startedAt,
    completedAt: new Date().toISOString(),
  }
}
