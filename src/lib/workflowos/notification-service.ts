import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { dispatch } from "@/lib/platform/notification/engine";

export type NotificationType =
  | "export_requested"
  | "export_approved"
  | "export_rejected"
  | "escalation_triggered";

export interface NotificationInput {
  type: NotificationType;
  subject: string;
  body: string;
  recipientId: string;
  recipientEmail?: string;
  organizationId: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(input: NotificationInput) {
  return prisma.platformNotification.create({
    data: {
      type: input.type,
      subject: input.subject,
      body: input.body,
      channel: "in_app",
      severity: "info",
      recipientId: input.recipientId,
      recipientEmail: input.recipientEmail ?? null,
      organizationId: input.organizationId,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function getUnreadNotifications(recipientId: string) {
  return prisma.platformNotification.findMany({
    where: { recipientId, readAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationRead(notificationId: string) {
  return prisma.platformNotification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

export async function getReviewersForOrganization(organizationId: string) {
  const reviewers = await prisma.user.findMany({
    where: { organizationId, role: { in: ["ADMIN", "OPERATOR"] } },
    select: { id: true, name: true, email: true },
  });
  return reviewers;
}

export async function getManagersForOrganization(organizationId: string) {
  const managers = await prisma.user.findMany({
    where: { organizationId, role: "ADMIN" },
    select: { id: true, name: true, email: true },
  });
  return managers;
}

export async function notifyExportRequested(
  recordId: string,
  recordTitle: string,
  organizationId: string,
  requestedBy: string,
) {
  const reviewers = await getReviewersForOrganization(organizationId);
  const results = [];
  for (const reviewer of reviewers) {
    const notif = await createNotification({
      type: "export_requested",
      subject: "طلب تصدير جديد",
      body: `تم طلب تصدير السجل "${recordTitle}" بواسطة المستخدم ${requestedBy}. يرجى مراجعة الطلب.`,
      recipientId: reviewer.id,
      recipientEmail: reviewer.email ?? undefined,
      organizationId,
      metadata: { recordId, requestedBy, type: "export_requested" },
    });
    results.push(notif);

    try {
      await dispatch(
        "on_create",
        { recipientId: reviewer.id, recipientEmail: reviewer.email ?? undefined, organizationId },
        {
          type: "workflowos_workflowos_export_approved",
          subjectAr: `تم اعتماد طلب التصدير`,
          bodyAr: `تم اعتماد طلب تصدير السجل "${recordTitle}" بواسطة ${requestedBy}. يمكنك الآن مراجعة الطلب.\n\nتاريخ الطلب: ${new Date().toISOString()}`,
          subjectEn: "Export Request Approved",
          bodyEn: `The export request for record "${recordTitle}" has been approved by ${requestedBy}. You may now review the request.\n\nRequested: ${new Date().toISOString()}`,
          metadata: { recordId, sourceEvent: "export_requested" },
        },
      );
    } catch {
      // Dispatch must not block the primary action
    }
  }
  return results;
}

export async function notifyExportApproved(
  recordId: string,
  recordTitle: string,
  organizationId: string,
  requesterId: string,
  approvedBy: string,
) {
  const notif = await createNotification({
    type: "export_approved",
    subject: "تم اعتماد التصدير",
    body: `تم اعتماد طلب تصدير السجل "${recordTitle}" بواسطة ${approvedBy}. يمكنك الآن تنزيل التصدير.`,
    recipientId: requesterId,
    organizationId,
    metadata: { recordId, approvedBy, type: "export_approved" },
  });

  try {
    await dispatch(
      "on_approval",
      { recipientId: requesterId, organizationId },
      {
        type: "workflowos_workflowos_export_approved",
        subjectAr: "تم اعتماد طلب التصدير",
        bodyAr: `تم اعتماد طلب تصدير السجل "${recordTitle}" بواسطة ${approvedBy}. يمكنك الآن تنزيل التصدير.\n\nتاريخ الاعتماد: ${new Date().toISOString()}`,
        subjectEn: "Export Request Approved",
        bodyEn: `The export request for record "${recordTitle}" has been approved by ${approvedBy}. You may now download the export.\n\nApproved: ${new Date().toISOString()}`,
        metadata: { recordId, sourceEvent: "export_approved" },
      },
    );
  } catch {
    // Dispatch must not block the primary action
  }

  return notif;
}

export async function notifyExportRejected(
  recordId: string,
  recordTitle: string,
  organizationId: string,
  requesterId: string,
  reason: string,
  rejectedBy: string,
) {
  const notif = await createNotification({
    type: "export_rejected",
    subject: "تم رفض طلب التصدير",
    body: `تم رفض طلب تصدير السجل "${recordTitle}" بواسطة ${rejectedBy}. السبب: ${reason}`,
    recipientId: requesterId,
    organizationId,
    metadata: { recordId, reason, rejectedBy, type: "export_rejected" },
  });

  try {
    await dispatch(
      "on_rejection",
      { recipientId: requesterId, organizationId },
      {
        type: "workflowos_workflowos_export_rejected",
        subjectAr: "تم رفض طلب التصدير",
        bodyAr: `تم رفض طلب تصدير السجل "${recordTitle}". السبب: ${reason}.\n\nيرجى مراجعة الملاحظات وإعادة تقديم الطلب.`,
        subjectEn: "Export Request Rejected",
        bodyEn: `The export request for record "${recordTitle}" has been rejected. Reason: ${reason}.\n\nPlease review the feedback and resubmit.`,
        metadata: { recordId, reason, sourceEvent: "export_rejected" },
      },
    );
  } catch {
    // Dispatch must not block the primary action
  }

  return notif;
}

export async function notifyEscalation(
  recordId: string,
  recordTitle: string,
  organizationId: string,
  daysPending: number,
) {
  const managers = await getManagersForOrganization(organizationId);
  const results = [];
  for (const manager of managers) {
    const notif = await createNotification({
      type: "escalation_triggered",
      subject: "تصعيد طلب تصدير",
      body: `طلب تصدير السجل "${recordTitle}" معلق منذ ${daysPending} يوم. يرجى اتخاذ إجراء.`,
      recipientId: manager.id,
      recipientEmail: manager.email ?? undefined,
      organizationId,
      metadata: { recordId, daysPending, type: "escalation_triggered" },
    });
    results.push(notif);

    try {
      await dispatch(
        "on_review",
        { recipientId: manager.id, recipientEmail: manager.email ?? undefined, organizationId },
        {
          type: "workflowos_workflowos_escalation_alert",
          subjectAr: "تنبيه تصعيد: طلب تصدير معلق",
          bodyAr: `طلب تصدير السجل "${recordTitle}" معلق منذ ${daysPending} يوم. يرجى اتخاذ إجراء.\n\nتاريخ التصعيد: ${new Date().toISOString()}`,
          subjectEn: "Escalation Alert: Pending Export Request",
          bodyEn: `The export request for record "${recordTitle}" has been pending for ${daysPending} days. Please take action.\n\nEscalated: ${new Date().toISOString()}`,
          metadata: { recordId, daysPending, sourceEvent: "escalation_triggered" },
        },
      );
    } catch {
      // Dispatch must not block the primary action
    }
  }
  return results;
}
