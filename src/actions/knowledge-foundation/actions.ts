"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  createVersion,
  approveVersion,
  activateVersion,
  deprecateVersion,
  getVersions,
  getVersion,
  getFoundationKPIs,
} from "@/lib/knowledge-foundation/kf-service";
import {
  bindCandidatesToVersion,
  unbindCandidateFromVersion,
  listEligiblePromotedCandidates,
  listBoundCandidates,
} from "@/lib/knowledge-foundation/candidate-bridge";
import { buildVersionProvenanceManifest } from "@/lib/knowledge-foundation/provenance-manifest";
import { summarizeProvenanceManifest } from "@/lib/knowledge-foundation/provenance-summary";
import { evaluateReleaseReadiness } from "@/lib/knowledge-foundation/release-readiness";
import { generateFoundationGovernanceReport } from "@/lib/knowledge-foundation/governance-report";
import { getCandidatePoolOverview } from "@/lib/knowledge-foundation/candidate-pool-overview";
import { verifyFoundationRelease } from "@/lib/knowledge-foundation/release-integrity";
import { emitFoundationEvent } from "@/lib/knowledge-foundation/events";
import { generateReleasePackage } from "@/lib/knowledge-foundation/release-generator";
import { generateDiff, getDiffForVersion } from "@/lib/knowledge-foundation/diff-engine";
import { executeRollback } from "@/lib/knowledge-foundation/rollback-service";


async function assertOperator(user: { role: string }): Promise<void> {
  if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
    throw new Error("Access denied: OPERATOR role required");
  }
}

function revalidateFoundationPaths(versionId?: string) {
  revalidatePath("/knowledge-foundation");
  revalidatePath("/knowledge-foundation/new");
  if (versionId) {
    revalidatePath(`/knowledge-foundation/${versionId}`);
  }
}

// ─── Read Actions (VIEWER minimum) ────────────────────────────────

export async function listPlatformAuditLogs(productKey: string, take = 100) {
  const { prisma } = await import("@/lib/prisma");
  await getCurrentUser();
  return prisma.platformAuditLog.findMany({
    where: {
      productKey,
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function listVersions() {
  await getCurrentUser();
  return getVersions();
}

export async function getVersionDetail(id: string) {
  await getCurrentUser();
  return getVersion(id);
}

export async function getFoundationDashboardKPIs() {
  await getCurrentUser();
  return getFoundationKPIs();
}

export async function getVersionDiffs(versionId: string) {
  await getCurrentUser();
  return getDiffForVersion(versionId);
}

export async function getEligibleFoundationCandidates() {
  const user = await getCurrentUser();
  await assertOperator(user);
  return listEligiblePromotedCandidates();
}

export async function getBoundFoundationCandidates(versionId: string) {
  await getCurrentUser();
  return listBoundCandidates(versionId);
}

export async function getFoundationProvenanceManifest(versionId: string) {
  const user = await getCurrentUser();
  await assertOperator(user);
  return buildVersionProvenanceManifest(versionId);
}

export async function getFoundationProvenanceSummary(versionId: string) {
  const user = await getCurrentUser();
  await assertOperator(user);
  const manifest = await buildVersionProvenanceManifest(versionId);
  return summarizeProvenanceManifest(manifest);
}

export async function getFoundationReleaseReadiness(versionId: string) {
  const user = await getCurrentUser();
  await assertOperator(user);
  const readiness = await evaluateReleaseReadiness(versionId);
  await emitFoundationEvent({
    type: "knowledge.foundation.readiness.generated",
    versionId,
    actorId: user.id,
    timestamp: new Date().toISOString(),
    payload: {
      ready: readiness.ready,
      score: readiness.score,
      blockerCount: readiness.blockers.length,
      warningCount: readiness.warnings.length,
    },
  });
  return readiness;
}

export async function generateFoundationGovernanceReportAction(versionId: string) {
  const user = await getCurrentUser();
  await assertOperator(user);
  const report = await generateFoundationGovernanceReport(versionId);
  await emitFoundationEvent({
    type: "knowledge.foundation.report.generated",
    versionId,
    actorId: user.id,
    timestamp: new Date().toISOString(),
    versionNumber: report.versionNumber,
    payload: {
      versionNumber: report.versionNumber,
      readinessScore: report.readiness.score,
      candidateCount: report.candidateMetrics.boundCandidateCount,
    },
  });
  return report;
}

export async function getFoundationCandidatePoolOverview() {
  const user = await getCurrentUser();
  await assertOperator(user);
  return getCandidatePoolOverview();
}

export async function verifyFoundationReleaseAction(versionId: string) {
  const user = await getCurrentUser();
  await assertOperator(user);
  return verifyFoundationRelease(versionId, user.id);
}

// ─── Mutation Actions (role-gated by service) ─────────────────────

export async function createFoundationVersion(input: {
  versionNumber: string;
  notes?: string;
  candidateIds?: string[];
}) {
  const user = await getCurrentUser();
  await assertOperator(user);
  const version = await createVersion({
    versionNumber: input.versionNumber,
    notes: input.notes,
    createdById: user.id,
    candidateIds: input.candidateIds,
  });
  revalidateFoundationPaths(version.id);
  return version;
}

export async function bindFoundationCandidates(input: {
  versionId: string;
  candidateIds: string[];
  notes?: string;
}) {
  const user = await getCurrentUser();
  await assertOperator(user);
  const result = await bindCandidatesToVersion({
    versionId: input.versionId,
    candidateIds: input.candidateIds,
    boundById: user.id,
    notes: input.notes,
  });
  revalidateFoundationPaths(input.versionId);
  return result;
}

export async function unbindFoundationCandidate(input: {
  versionId: string;
  candidateId: string;
}) {
  const user = await getCurrentUser();
  await assertOperator(user);
  const result = await unbindCandidateFromVersion({
    versionId: input.versionId,
    candidateId: input.candidateId,
    actorId: user.id,
  });
  revalidateFoundationPaths(input.versionId);
  return result;
}

export async function approveFoundationVersion(input: { versionId: string; notes?: string }) {
  const user = await getCurrentUser();
  return approveVersion({
    versionId: input.versionId,
    approvedById: user.id,
    notes: input.notes,
  });
}

export async function releaseFoundationVersion(_input: { versionId: string; releaseNotes?: string }) {
  throw new Error(
    "releaseFoundationVersion is deprecated after Phase 28.2. Use generateFoundationRelease.",
  );
}

export async function generateFoundationRelease(input: {
  versionId: string;
  versionNumber: string;
  releaseNotes?: string;
}) {
  const user = await getCurrentUser();
  await assertOperator(user);
  return generateReleasePackage({
    versionId: input.versionId,
    versionNumber: input.versionNumber,
    actorId: user.id,
    releaseNotes: input.releaseNotes,
  });
}

export async function activateFoundationVersion(input: { versionId: string }) {
  return activateVersion({
    versionId: input.versionId,
  });
}

export async function deprecateFoundationVersion(input: { versionId: string; notes?: string }) {
  return deprecateVersion({
    versionId: input.versionId,
    notes: input.notes,
  });
}

export async function rollbackFoundationVersion(input: {
  versionId: string;
  targetVersionId: string;
  reason: string;
}) {
  const user = await getCurrentUser();
  return executeRollback({
    versionId: input.versionId,
    targetVersionId: input.targetVersionId,
    actorId: user.id,
    reason: input.reason,
  });
}

export async function generateFoundationDiff(input: {
  fromVersionId: string;
  toVersionId: string;
}) {
  const user = await getCurrentUser();
  
  // RBAC: Check if user has ADMIN or OPERATOR role
  if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
    throw new Error("Access denied: ADMIN or OPERATOR role required");
  }
  
  return generateDiff(input.fromVersionId, input.toVersionId, user.id);
}

// ─── Export Actions ───────────────────────────────────────────────

export async function exportKnowledgeFoundationVersionAction(
  versionId: string,
  format: "pdf" | "json",
) {
  const user = await getCurrentUser();
  const version = await getVersion(versionId);

  if (!version) {
    throw new Error("Version not found");
  }

  const {
    buildKnowledgeFoundationPDF,
    buildKnowledgeFoundationJSON,
    recordExportAudit,
  } = await import("@/lib/knowledge-foundation/kf-export");

  const input = {
    versionId: version.id,
    versionNumber: version.versionNumber,
    status: version.status,
    notes: version.notes,
    candidateCount: version.candidateCount,
    artifactPath: version.artifactPath,
    createdByName: version.createdByName,
    approvedByName: version.approvedByName,
    activatedAt: version.activatedAt?.toISOString?.() ?? null,
    createdAt: version.createdAt,
    rollbackVersionId: version.rollbackVersionId,
    releases: (version.releases ?? []).map((r: { id: string; releaseNotes: string | null; createdAt: { toISOString: () => string }; createdBy: { name: string | null } | null }) => ({
      id: r.id,
      releaseNotes: r.releaseNotes,
      createdAt: r.createdAt.toISOString(),
      createdByName: r.createdBy?.name ?? null,
    })),
    diffsAsFrom: (version.diffsAsFrom ?? []).map((d: { toVersion: { versionNumber: string }; riskScore: number; breakingChange: boolean; summary: string | null; generatedAt: { toISOString?: () => string } | null }) => ({
      toVersion: d.toVersion.versionNumber,
      riskScore: d.riskScore,
      breakingChange: d.breakingChange,
      summary: d.summary,
      generatedAt: d.generatedAt?.toISOString?.() ?? "",
    })),
    candidateBindings: [],
  };

  const result =
    format === "pdf"
      ? await buildKnowledgeFoundationPDF(input)
      : await buildKnowledgeFoundationJSON(input);

  // Record audit event (safe — never blocks)
  await recordExportAudit({
    versionId: version.id,
    versionNumber: version.versionNumber,
    format,
    actorId: user.id,
    actorName: user.name ?? undefined,
  }).catch(() => {});

  return {
    format: result.format,
    filename: result.filename,
    mimeType: result.mimeType,
    content: result.content.toString("base64"),
  };
}
