"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  notifyExportRequested,
  notifyExportApproved,
  notifyExportRejected,
} from "@/lib/workflowos/notification-service";

function mapAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : "";
  if (msg === "Unauthenticated") return "يجب تسجيل الدخول أولاً";
  if (msg.startsWith("Access denied:")) return "لا تملك صلاحية تنفيذ هذا الإجراء";
  return msg || "فشل العملية";
}

async function assertRecordAccess(recordId: string) {
  const user = await requireUserContext();
  const record = await prisma.workflowRecord.findUnique({
    where: { id: recordId },
  });
  if (!record) throw new Error("السجل غير موجود");
  if (record.organizationId !== user.organizationId)
    throw new Error("Access denied: record belongs to a different organization");
  return { user, record };
}

async function logExportAuditEvent(
  recordId: string,
  organizationId: string,
  actorId: string,
  action: string,
  comment?: string,
  metadata?: Record<string, unknown>,
) {
  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { name: true },
  });
  await prisma.workflowAuditEvent.create({
    data: {
      organizationId,
      recordId,
      actorId,
      actorName: actor?.name ?? null,
      action,
      comment: comment ?? null,
      metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function requestWorkflowExport(recordId: string) {
  try {
    const { user, record } = await assertRecordAccess(recordId);

    if (record.status !== "completed")
      return { success: false, error: "يمكن طلب التصدير فقط للسجلات المكتملة" };
    if (record.exportStatus === "requested")
      return { success: false, error: "طلب التصدير قيد المراجعة بالفعل" };
    if (record.exportStatus === "approved")
      return { success: false, error: "تم اعتماد التصدير مسبقاً" };

    const updated = await prisma.workflowRecord.update({
      where: { id: recordId },
      data: {
        exportStatus: "requested",
        exportRequestedAt: new Date(),
        exportRequestedById: user.id,
      },
    });

    await logExportAuditEvent(
      recordId,
      record.organizationId,
      user.id,
      "export_requested",
      "طلب تصدير السجل",
      { requestedBy: user.id },
    );

    await notifyExportRequested(
      recordId,
      record.title,
      record.organizationId,
      user.name ?? user.id,
    );

    revalidatePath(`/workflowos/records/${recordId}`);
    return { success: true, data: updated };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error requesting Workflow export:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function approveWorkflowExport(recordId: string) {
  try {
    const { user, record } = await assertRecordAccess(recordId);

    if (record.exportStatus !== "requested")
      return { success: false, error: "لا يوجد طلب تصدير قيد المراجعة" };

    const updated = await prisma.workflowRecord.update({
      where: { id: recordId },
      data: {
        exportStatus: "approved",
        exportApprovedAt: new Date(),
        exportApprovedById: user.id,
      },
    });

    await logExportAuditEvent(
      recordId,
      record.organizationId,
      user.id,
      "export_approved",
      "تم اعتماد طلب التصدير",
      { approvedBy: user.id },
    );

    if (record.exportRequestedById) {
      await notifyExportApproved(
        recordId,
        record.title,
        record.organizationId,
        record.exportRequestedById,
        user.name ?? user.id,
      );
    }

    revalidatePath(`/workflowos/records/${recordId}`);
    return { success: true, data: updated };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error approving Workflow export:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function rejectWorkflowExport(
  recordId: string,
  reason: string,
) {
  try {
    const { user, record } = await assertRecordAccess(recordId);

    if (record.exportStatus !== "requested")
      return { success: false, error: "لا يوجد طلب تصدير قيد المراجعة" };
    if (!reason || reason.trim().length === 0)
      return { success: false, error: "الرجاء إدخال سبب الرفض" };

    const updated = await prisma.workflowRecord.update({
      where: { id: recordId },
      data: {
        exportStatus: "rejected",
        exportRejectedReason: reason.trim(),
        exportApprovedAt: new Date(),
        exportApprovedById: user.id,
      },
    });

    await logExportAuditEvent(
      recordId,
      record.organizationId,
      user.id,
      "export_rejected",
      `رفض التصدير: ${reason.trim()}`,
      { rejectedBy: user.id, reason: reason.trim() },
    );

    if (record.exportRequestedById) {
      await notifyExportRejected(
        recordId,
        record.title,
        record.organizationId,
        record.exportRequestedById,
        reason.trim(),
        user.name ?? user.id,
      );
    }

    revalidatePath(`/workflowos/records/${recordId}`);
    return { success: true, data: updated };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error rejecting Workflow export:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function downloadWorkflowExport(recordId: string) {
  try {
    const { user, record } = await assertRecordAccess(recordId);

    if (record.exportStatus !== "approved")
      return {
        success: false,
        error: "يجب اعتماد التصدير أولاً قبل التنزيل",
      };

    const evidence = await prisma.workflowEvidence.findMany({
      where: { organizationId: record.organizationId, recordId },
      orderBy: { createdAt: "desc" },
    });

    const auditEvents = await prisma.workflowAuditEvent.findMany({
      where: { organizationId: record.organizationId, recordId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const template = await prisma.workflowTemplate.findUnique({
      where: { id: record.templateId },
      select: { name: true, category: true },
    });

    await logExportAuditEvent(
      recordId,
      record.organizationId,
      user.id,
      "export_downloaded",
      "تم تنزيل التصدير",
      { downloadedBy: user.id },
    );

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: user.name ?? user.id,
      record: {
        id: record.id,
        title: record.title,
        description: record.description,
        status: record.status,
        priority: record.priority,
        templateName: template?.name ?? null,
        templateCategory: template?.category ?? null,
        createdAt: record.createdAt.toISOString(),
        completedAt: record.completedAt?.toISOString() ?? null,
      },
      evidence: evidence.map((e) => ({
        filename: e.filename,
        fileType: e.fileType,
        description: e.description,
        uploadedAt: e.createdAt.toISOString(),
      })),
      auditEvents: auditEvents.map((e) => ({
        action: e.action,
        actorName: e.actorName,
        comment: e.comment,
        fromStatus: e.fromStatus,
        toStatus: e.toStatus,
        createdAt: e.createdAt.toISOString(),
      })),
      governance: {
        disclaimer:
          "هذا التقرير يعرض بيانات السجل والأدلة وسجل التدقيق كما هي محفوظة داخل المنصة وقت التصدير. لا يُعد هذا التقرير قراراً آلياً.",
        aiAssists: true,
        humanDecides: true,
        evidenceGoverns: true,
      },
    };

    return {
      success: true,
      data: {
        content: JSON.stringify(exportData, null, 2),
        filename: `workflow_export_${recordId.substring(0, 8)}.json`,
        mimeType: "application/json",
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error downloading Workflow export:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function getWorkflowExportStatus(recordId: string) {
  try {
    const { user, record } = await assertRecordAccess(recordId);

    return {
      success: true,
      data: {
        exportStatus: record.exportStatus,
        exportRequestedAt: record.exportRequestedAt,
        exportRequestedById: record.exportRequestedById,
        exportApprovedAt: record.exportApprovedAt,
        exportApprovedById: record.exportApprovedById,
        exportRejectedReason: record.exportRejectedReason,
        escalatedAt: record.escalatedAt,
        escalatedToId: record.escalatedToId,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting Workflow export status:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function getCurrentUserPendingExportCount() {
  try {
    const user = await import("@/lib/auth").then((m) => m.requireUserContext());
    const count = await prisma.workflowRecord.count({
      where: {
        organizationId: user.organizationId,
        exportStatus: "requested",
      },
    });
    const escalated = await prisma.workflowRecord.count({
      where: {
        organizationId: user.organizationId,
        exportStatus: "requested",
        escalatedAt: { not: null },
      },
    });
    return {
      success: true,
      data: { pending: count, escalated },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting pending export count:", error);
    return { success: false, error: "فشل الحصول على إحصائيات التصدير" };
  }
}

export async function getPendingExportRequests(organizationId: string) {
  try {
    const user = await requireUserContext();
    if (user.organizationId !== organizationId)
      return { success: false, error: "Access denied" };

    const records = await prisma.workflowRecord.findMany({
      where: {
        organizationId,
        exportStatus: "requested",
      },
      orderBy: { exportRequestedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        exportRequestedAt: true,
        exportRequestedById: true,
        escalatedAt: true,
      },
    });

    return { success: true, data: records };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting pending export requests:", error);
    return { success: false, error: "Failed to get pending export requests" };
  }
}
