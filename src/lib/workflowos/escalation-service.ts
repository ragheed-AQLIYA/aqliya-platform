import "server-only";

import { prisma } from "@/lib/prisma";
import { notifyEscalation } from "@/lib/workflowos/notification-service";
import { recordWorkflowAuditEvent } from "@/lib/workflowos/audit";

const ESCALATION_THRESHOLD_DAYS = 2;

export interface EscalationResult {
  escalated: number;
  skipped: number;
  errors: string[];
}

export async function checkPendingExports(): Promise<EscalationResult> {
  const result: EscalationResult = { escalated: 0, skipped: 0, errors: [] };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ESCALATION_THRESHOLD_DAYS);

  const pendingRecords = await prisma.workflowRecord.findMany({
    where: {
      exportStatus: "requested",
      exportRequestedAt: { lte: cutoff },
      escalatedAt: null,
    },
    select: {
      id: true,
      title: true,
      organizationId: true,
      exportRequestedById: true,
    },
  });

  for (const record of pendingRecords) {
    try {
      await escalateExportRequest(record.id, record.organizationId);
      result.escalated++;
    } catch (error) {
      result.errors.push(
        `Record ${record.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  return result;
}

export async function escalateExportRequest(
  recordId: string,
  organizationId: string,
) {
  const managers = await prisma.user.findMany({
    where: { organizationId, role: "ADMIN" },
    select: { id: true },
  });

  const escalatedToId = managers.length > 0 ? managers[0].id : null;

  const record = await prisma.workflowRecord.update({
    where: { id: recordId },
    data: {
      escalatedAt: new Date(),
      escalatedToId,
    },
  });

  await recordWorkflowAuditEvent({
    organizationId,
    recordId,
    actorId: "system",
    actorName: "النظام",
    action: "escalation_triggered",
    comment: `تصعيد تلقائي: طلب التصدير معلق منذ أكثر من ${ESCALATION_THRESHOLD_DAYS} أيام`,
    metadata: { escalatedToId },
  });

  const daysPending = Math.floor(
    (Date.now() - (record.exportRequestedAt?.getTime() ?? Date.now())) /
      (1000 * 60 * 60 * 24),
  );

  await notifyEscalation(
    record.id,
    record.title,
    organizationId,
    daysPending,
  );

  return record;
}

export async function getEscalatedRecords(organizationId: string) {
  return prisma.workflowRecord.findMany({
    where: {
      organizationId,
      escalatedAt: { not: null },
    },
    orderBy: { escalatedAt: "desc" },
    take: 50,
  });
}
