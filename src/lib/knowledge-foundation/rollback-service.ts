import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { emitFoundationEvent } from "./events";
import { registerFoundationAuditHandler } from "./audit-handler";
import { verifyReleaseIntegrity } from "./release-integrity";
import type { RollbackInput } from "./types";

registerFoundationAuditHandler();

/** Explicit rollback target policy (Phase 28 final hotfix R-02). */
export const ROLLBACK_ALLOWED_TARGET_STATUSES = ["RELEASED", "ACTIVE"] as const;

export type RollbackAllowedTargetStatus =
  (typeof ROLLBACK_ALLOWED_TARGET_STATUSES)[number];

function assertRollbackTargetStatus(status: string): void {
  if (
    !ROLLBACK_ALLOWED_TARGET_STATUSES.includes(
      status as RollbackAllowedTargetStatus,
    )
  ) {
    throw new Error(
      `Rollback target must be RELEASED or ACTIVE; got "${status}". DRAFT, APPROVED, and DEPRECATED are not allowed.`,
    );
  }
}

/**
 * Rollback from current active version to a target version.
 *
 * Rules:
 * - ADMIN only
 * - Audit required (writes to PlatformAuditLog)
 * - Reason required
 * - Target must be RELEASED or ACTIVE (R-02)
 * - Target must pass verifyReleaseIntegrity before ACTIVE (R-01)
 * - Previous version is preserved (not deleted)
 */
export async function executeRollback(input: RollbackInput) {
  const actor = await getCurrentUser();
  if (actor.role !== "ADMIN") {
    throw new Error("Access denied: ADMIN role required for rollback");
  }

  if (!input.reason || input.reason.trim().length === 0) {
    throw new Error("Rollback reason is required");
  }

  const [currentVersion, targetVersion] = await Promise.all([
    prisma.knowledgeFoundationVersion.findFirst({
      where: { status: "ACTIVE" },
    }),
    prisma.knowledgeFoundationVersion.findUniqueOrThrow({
      where: { id: input.targetVersionId },
    }),
  ]);

  if (currentVersion && currentVersion.id === targetVersion.id) {
    throw new Error("Target version is already active. No rollback needed.");
  }

  assertRollbackTargetStatus(targetVersion.status);

  const integrity = await verifyReleaseIntegrity(targetVersion.id, {
    actorId: actor.id,
    versionNumber: targetVersion.versionNumber,
    emitAudit: true,
    forActivation: true,
  });

  if (!integrity.valid) {
    throw new Error(
      `Rollback integrity verification failed: ${integrity.blockers.join("; ")}`,
    );
  }

  // Deprecate current active version
  if (currentVersion) {
    await prisma.knowledgeFoundationVersion.update({
      where: { id: currentVersion.id },
      data: { status: "DEPRECATED" },
    });

    await emitFoundationEvent({
      type: "knowledge.foundation.version.deprecated",
      versionId: currentVersion.id,
      actorId: actor.id,
      timestamp: new Date().toISOString(),
      versionNumber: currentVersion.versionNumber,
      previousStatus: currentVersion.status,
      newStatus: "DEPRECATED",
      notes: `Rollback to v${targetVersion.versionNumber}: ${input.reason}`,
    });
  }

  const updated = await prisma.knowledgeFoundationVersion.update({
    where: { id: targetVersion.id },
    data: {
      status: "ACTIVE",
      activatedAt: new Date(),
      rollbackVersionId: currentVersion?.id ?? null,
    },
  });

  await emitFoundationEvent({
    type: "knowledge.foundation.rollback.executed",
    versionId: targetVersion.id,
    actorId: actor.id,
    timestamp: new Date().toISOString(),
    versionNumber: targetVersion.versionNumber,
    previousStatus: targetVersion.status,
    newStatus: "ACTIVE",
    rollbackVersionId: currentVersion?.id ?? undefined,
    notes: input.reason,
    payload: {
      reason: input.reason,
      fromVersionId: currentVersion?.id ?? null,
      fromVersionNumber: currentVersion?.versionNumber ?? null,
      integrityVerified: true,
      releaseId: integrity.releaseId,
    },
  });

  return updated;
}
