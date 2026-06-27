import "server-only";
import { onAnyFoundationEvent } from "./events";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type { KnowledgeFoundationEventType } from "./events";

const eventActionMap: Record<KnowledgeFoundationEventType, string> = {
  "knowledge.foundation.version.created": "knowledge.foundation.version.created",
  "knowledge.foundation.version.approved": "knowledge.foundation.version.approved",
  "knowledge.foundation.version.released": "knowledge.foundation.version.released",
  "knowledge.foundation.version.activated": "knowledge.foundation.version.activated",
  "knowledge.foundation.version.deprecated": "knowledge.foundation.version.deprecated",
  "knowledge.foundation.rollback.executed": "knowledge.foundation.rollback.executed",
  "knowledge.foundation.diff.generated": "knowledge.foundation.diff.generated",
  "knowledge.foundation.candidate.bound": "knowledge.foundation.candidate.bound",
  "knowledge.foundation.candidate.unbound": "knowledge.foundation.candidate.unbound",
  "knowledge.foundation.readiness.generated": "knowledge.foundation.readiness.generated",
  "knowledge.foundation.report.generated": "knowledge.foundation.report.generated",
  "knowledge.foundation.integrity.verified": "knowledge.foundation.integrity.verified",
  "knowledge.foundation.integrity.failed": "knowledge.foundation.integrity.failed",
};

const severityMap: Record<KnowledgeFoundationEventType, string> = {
  "knowledge.foundation.version.created": "info",
  "knowledge.foundation.version.approved": "info",
  "knowledge.foundation.version.released": "info",
  "knowledge.foundation.version.activated": "info",
  "knowledge.foundation.version.deprecated": "warning",
  "knowledge.foundation.rollback.executed": "warning",
  "knowledge.foundation.diff.generated": "info",
  "knowledge.foundation.candidate.bound": "info",
  "knowledge.foundation.candidate.unbound": "warning",
  "knowledge.foundation.readiness.generated": "info",
  "knowledge.foundation.report.generated": "info",
  "knowledge.foundation.integrity.verified": "info",
  "knowledge.foundation.integrity.failed": "warning",
};

const statusMap: Record<KnowledgeFoundationEventType, string> = {
  "knowledge.foundation.version.created": "success",
  "knowledge.foundation.version.approved": "success",
  "knowledge.foundation.version.released": "success",
  "knowledge.foundation.version.activated": "success",
  "knowledge.foundation.version.deprecated": "success",
  "knowledge.foundation.rollback.executed": "success",
  "knowledge.foundation.diff.generated": "success",
  "knowledge.foundation.candidate.bound": "success",
  "knowledge.foundation.candidate.unbound": "success",
  "knowledge.foundation.readiness.generated": "recorded",
  "knowledge.foundation.report.generated": "recorded",
  "knowledge.foundation.integrity.verified": "success",
  "knowledge.foundation.integrity.failed": "failure",
};

let registered = false;

export function registerFoundationAuditHandler(): () => void {
  if (registered) return () => {};
  registered = true;

  const unsub = onAnyFoundationEvent(async (event) => {
    await writePlatformAuditLog({
      productKey: "knowledge-foundation",
      action: eventActionMap[event.type] ?? event.type,
      severity: severityMap[event.type] ?? "info",
      status: statusMap[event.type] ?? "recorded",
      actorId: event.actorId,
      targetType: "KnowledgeFoundationVersion",
      targetId: event.versionId,
      targetLabel: event.versionNumber ?? event.versionId,
      metadata: {
        eventType: event.type,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
        rollbackVersionId: event.rollbackVersionId,
        diffId: event.diffId,
        notes: event.notes,
        candidateId:
          typeof event.payload?.candidateId === "string"
            ? event.payload.candidateId
            : undefined,
        candidateIds: Array.isArray(event.payload?.candidateIds)
          ? event.payload.candidateIds
          : undefined,
        ...event.payload,
      },
    });
  });

  return unsub;
}
