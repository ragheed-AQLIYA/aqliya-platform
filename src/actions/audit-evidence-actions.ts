"use server";

import { createEvidenceVersion } from "@/lib/audit/evidence-versioning-service";
import {
  createEvidence as svcCreateEvidence,
  updateEvidenceState as svcUpdateEvidenceState,
  updateEvidenceStateWithEvent as svcUpdateEvidenceStateWithEvent,
  updateEvidenceStorageService as svcUpdateEvidenceStorage,
  linkEvidenceToEntity as svcLinkEvidenceToEntity,
  getEvidence as svcGetEvidence,
  recordAuditEvent as svcRecordAuditEvent,
} from "@/lib/audit/services";
import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import { enforceAuditRateLimit } from "@/lib/audit/rate-limit";
import { isScanRejected, scanEvidenceFile } from "@/lib/audit/file-scanner";
import { evaluateEvidenceEscalation } from "@/lib/audit/governance-bridge";
import { getStorageProvider, buildStorageKey } from "@/lib/audit/storage";
import { createHash } from "crypto";
import { validateFileContent } from "@/lib/security/file-validation";
import { publishDomainEvent } from "@/lib/kernel/publish";
import { publishAuditOSEvent } from "@/lib/kernel/events/audit-events";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "audit-os", action: "evidence-actions" });

const ALLOWED_FILE_TYPES = [
  "pdf",
  "xlsx",
  "xls",
  "docx",
  "jpg",
  "jpeg",
  "png",
  "csv",
];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export async function createEvidenceAction(params: {
  engagementId: string;
  filename: string;
  fileType: string;
  fileSize?: number;
  state?: string;
  uploadedBy?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(params.engagementId, actor);
  if (!ALLOWED_FILE_TYPES.includes(params.fileType.toLowerCase())) {
    throw new Error(
      `Unsupported file type: ${params.fileType}. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`,
    );
  }
  if (params.fileSize && params.fileSize > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File too large: ${(params.fileSize / 1024 / 1024).toFixed(1)}MB. Maximum: ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
    );
  }
  // File scanning
  const scanResult = await scanEvidenceFile({
    filename: params.filename,
    fileType: params.fileType,
    fileSize: params.fileSize,
  });
  if (isScanRejected(scanResult)) {
    throw new Error(scanResult.details || "File rejected by security scanner");
  }
  const evidence = await svcCreateEvidence({
    ...params,
    actorId: actor.actorId,
    actorName: actor.actorName,
  });
  const escalation = evaluateEvidenceEscalation(evidence.evidence.state);
  const eventMetadata: Record<string, unknown> = {
    scanStatus: scanResult.status,
    scanProvider: scanResult.provider,
    scannedAt: scanResult.scannedAt,
  };
  if (escalation.triggers.length > 0) {
    eventMetadata.governanceEscalationLevel = escalation.level;
    eventMetadata.governanceEscalationTriggers = escalation.triggers.map(
      (t) => t.trigger,
    );
    eventMetadata.governanceRequiresHumanResolution =
      escalation.requiresHumanResolution;
  }
  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType:
      escalation.triggers.length > 0
        ? "evidence.escalation_triggered"
        : "evidence.file_scanned",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "evidence",
    targetId: evidence.evidence.id,
    newState: evidence.evidence.state,
    description:
      escalation.triggers.length > 0
        ? `File scanned: ${params.filename} — governance escalation: ${escalation.message}`
        : `File scanned: ${params.filename} → ${scanResult.status} (${scanResult.provider})`,
    metadata: eventMetadata,
  });
  return evidence;
}

/** @deprecated Use updateEvidenceStateWithEventAction instead — records audit event */
export async function updateEvidenceStateAction(id: string, state: string) {
  logger.warn(
    "updateEvidenceStateAction called without audit event — use updateEvidenceStateWithEventAction instead",
  );
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  await enforceAuditRateLimit(actor, "update_evidence_state", "mutation");
  return svcUpdateEvidenceState(id, state, {
    userId: actor.actorId,
    actorName: actor.actorName,
  });
}

export async function updateEvidenceStateWithEventAction(
  id: string,
  state: string,
  engagementId: string,
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer"]);
  await assertEngagementAccess(engagementId, actor);
  await enforceAuditRateLimit(actor, "update_evidence_state", "mutation");
  const escalation = evaluateEvidenceEscalation(state);
  const result = await svcUpdateEvidenceStateWithEvent(
    id,
    state,
    engagementId,
    actor,
  );
  try {
    await createEvidenceVersion(
      id,
      { state },
      actor.actorId,
      actor.actorName,
      `تغيير الحالة إلى ${state}`,
    );
  } catch {
    /* versioning optional until migration applied */
  }
  if (escalation.triggers.length > 0) {
    await svcRecordAuditEvent({
      engagementId,
      eventType: "evidence.escalation_triggered",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "evidence",
      targetId: id,
      newState: state,
      description: `Evidence state change triggered escalation: ${escalation.message}`,
      aiRelated: false,
      metadata: {
        governanceEscalationLevel: escalation.level,
        governanceEscalationTriggers: escalation.triggers.map((t) => t.trigger),
        governanceRequiresHumanResolution: escalation.requiresHumanResolution,
      },
    });
  }
  return result;
}

export async function uploadEvidenceFileAction(params: {
  engagementId: string;
  filename: string;
  fileType: string;
  fileData: string; // base64-encoded file content
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(params.engagementId, actor);
  await enforceAuditRateLimit(actor, "upload_evidence_file", "upload");

  if (!ALLOWED_FILE_TYPES.includes(params.fileType.toLowerCase())) {
    throw new Error(
      `Unsupported file type: ${params.fileType}. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`,
    );
  }

  const content = Buffer.from(params.fileData, "base64");
  if (content.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File too large: ${(content.length / 1024 / 1024).toFixed(1)}MB. Maximum: ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
    );
  }

  // Compute file hash
  const fileHash = createHash("sha256").update(content).digest("hex");

  // Validate file content matches its claimed extension (magic bytes check)
  const auditMagicValidation = validateFileContent(content, params.fileType);
  if (!auditMagicValidation.valid) {
    throw new Error(auditMagicValidation.error || "File content does not match its claimed extension");
  }

  // File scanning
  const scanResult = await scanEvidenceFile({
    filename: params.filename,
    fileType: params.fileType,
    fileSize: content.length,
    content,
  });
  if (isScanRejected(scanResult)) {
    throw new Error(scanResult.details || "File rejected by security scanner");
  }

  // Create evidence record first to get the ID
  const { evidence } = await svcCreateEvidence({
    engagementId: params.engagementId,
    filename: params.filename,
    fileType: params.fileType,
    fileSize: content.length,
    state: "missing",
    actorId: actor.actorId,
    actorName: actor.actorName,
  });

  // Store the file
  const storageKey = buildStorageKey(
    params.engagementId,
    evidence.id,
    params.filename,
  );
  const storageProvider = getStorageProvider();
  await storageProvider.store(storageKey, {
    filename: params.filename,
    mimeType: params.fileType,
    content,
  });

  // Update evidence record with storage metadata
  await svcUpdateEvidenceStorage(evidence.id, {
    fileHash,
    storageKey,
    fileSize: content.length,
  });

  try {
    await createEvidenceVersion(
      evidence.id,
      {
        state: "uploaded",
        fileHash,
        storageKey,
        fileSize: content.length,
      },
      actor.actorId,
      actor.actorName,
      "رفع ملف الدليل",
    );
  } catch {
    /* versioning optional until migration applied */
  }

  await svcRecordAuditEvent({
    engagementId: params.engagementId,
    eventType: "evidence.uploaded",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "evidence",
    targetId: evidence.id,
    newState: "uploaded",
    description: `Evidence file uploaded: ${params.filename} (${(content.length / 1024).toFixed(1)}KB, scan: ${scanResult.status})`,
    aiRelated: false,
    metadata: {
      fileSize: content.length,
      fileHash: fileHash.substring(0, 12),
      storageKey,
      scanMethod: scanResult.provider,
      scanStatus: scanResult.status,
    },
  });

  try {
    await publishDomainEvent(publishAuditOSEvent("evidence.uploaded", {
      actorId: actor.actorId,
      organizationId: actor.organizationId,
      resourceId: evidence.id,
      resourceType: "evidence",
      metadata: {
        engagementId: params.engagementId,
        evidenceId: evidence.id,
      },
    }));
  } catch {
    // Event publishing is fire-and-forget
  }

  return {
    evidence,
    storageKey,
    fileHash: fileHash.substring(0, 12),
    downloadUrl: `/api/audit/evidence/${evidence.id}/download`,
  };
}

export async function getEvidenceDownloadUrlAction(
  evidenceId: string,
  engagementId: string,
): Promise<{
  url: string;
  filename: string;
  fileType: string;
  fileSize: number;
} | null> {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"]);
  await assertEngagementAccess(engagementId, actor);
  const evidenceList = await svcGetEvidence(engagementId);
  const evidence = evidenceList.find((e) => e.id === evidenceId);
  if (!evidence || !evidence.storageKey) return null;
  const storageProvider = getStorageProvider();
  const exists = await storageProvider.exists(evidence.storageKey);
  if (!exists) return null;
  await svcRecordAuditEvent({
    engagementId,
    eventType: "evidence.download_requested",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "evidence",
    targetId: evidenceId,
    newState: evidence.state,
    description: `Evidence download requested: ${evidence.filename}`,
    aiRelated: false,
    metadata: { storageKey: evidence.storageKey },
  });
  return {
    url: `/api/audit/evidence/${evidenceId}/download`,
    filename: evidence.filename,
    fileType: evidence.fileType,
    fileSize: evidence.fileSize,
  };
}

export async function linkEvidenceToEntityAction(params: {
  engagementId: string;
  evidenceId: string;
  targetType: string;
  targetId: string;
  context?: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator"]);
  await assertEngagementAccess(params.engagementId, actor);
  return svcLinkEvidenceToEntity({
    ...params,
    actorId: actor.actorId,
    actorName: actor.actorName,
  });
}
