import "server-only";

import { prisma } from "@/lib/prisma";
import { requireServerActionAccess } from "@/core/access/server-action-guard";
import { requireClientAccess } from "@/lib/workflowos/tenant-guard";
import { createWorkflowAuditEvent } from "@/lib/workflowos/audit";
import { generateWorkflowPdf } from "@/lib/workflowos/export/pdf-export";

export interface WorkflowExportInput {
  clientId: string;
  recordId: string;
}

export interface WorkflowExportResult {
  filename: string;
  mimeType: string;
  buffer: Buffer;
  sizeBytes: number;
}

export async function exportWorkflowRecord(
  input: WorkflowExportInput,
): Promise<WorkflowExportResult> {
  const ctx = await requireClientAccess(input.clientId);
  await requireServerActionAccess("workflow", "export", {
    organizationId: ctx.organizationId,
    resourceId: input.recordId,
  });

  const record = await prisma.sunbulRecord.findFirst({
    where: { id: input.recordId, clientId: input.clientId },
  });
  if (!record) throw new Error("Record not found");
  if (record.status === "Draft" || record.status === "UnderReview") {
    throw new Error("Cannot export record before approval");
  }

  const client = await prisma.sunbulClient.findUnique({
    where: { id: input.clientId },
  });

  const documents = await prisma.sunbulDocument.findMany({
    where: { clientId: input.clientId, recordId: input.recordId },
    orderBy: { createdAt: "desc" },
  });

  const reviews = await prisma.sunbulReview.findMany({
    where: { clientId: input.clientId, recordId: input.recordId },
    orderBy: { createdAt: "desc" },
  });

  const auditEvents = await prisma.sunbulAuditEvent.findMany({
    where: { clientId: input.clientId, recordId: input.recordId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const labelAr = {
    platform: "سير العمل الذكي",
    reportTitle: "تقرير قضية سير العمل",
    exportDate: new Date().toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    caseInfo: "معلومات القضية",
    clientInfo: "معلومات العميل",
    status: "حالة القضية",
    description: "الوصف",
    noDescription: "لا يوجد وصف",
    documents: "المستندات المرتبطة",
    fileName: "اسم الملف",
    fileType: "النوع",
    fileSize: "الحجم",
    uploadedDate: "تاريخ الرفع",
    noDocuments: "لا توجد مستندات مرتبطة",
    reviews: "سجل المراجعات",
    reviewer: "المراجع",
    reviewStatus: "الحالة",
    reviewNotes: "الملاحظات",
    reviewDate: "التاريخ",
    noReviews: "لا توجد مراجعات",
    auditTrail: "سجل الأثر",
    action: "الإجراء",
    actor: "الفاعل",
    entity: "الكيان",
    auditDate: "التاريخ",
    noAudit: "لا توجد أحداث",
    governanceTitle: "تنبيه حوكمي",
    governanceBody:
      "هذا التقرير يعرض بيانات القضية والمستندات والمراجعات وسجل الأثر كما هي محفوظة داخل المنصة وقت التصدير. لا يُعد هذا التقرير قراراً آلياً، ولا يستبدل المراجعة البشرية أو الاعتماد الإداري. الإنسان يقرر، والدليل يحكم.",
  };

  const caseData = {
    title: record.title,
    id: record.id,
    clientName: client?.name ?? input.clientId,
    status: record.status,
    description: record.description,
    createdAt: record.createdAt,
    submittedAt: record.submittedAt,
    approvedAt: record.approvedAt,
    archivedAt: record.archivedAt,
  };

  const buffer = await generateWorkflowPdf({
    labels: labelAr,
    caseData,
    documents,
    reviews,
    auditEvents,
  });

  const filename = `workflow_record_${input.recordId.substring(0, 8)}.pdf`;

  await createWorkflowAuditEvent({
    clientId: input.clientId,
    recordId: input.recordId,
    actorId: ctx.id,
    action: "RECORD_EXPORTED",
    entityType: "SunbulRecord",
    entityId: input.recordId,
    metadata: {
      action: "exported",
      format: "pdf",
      filename,
      sizeBytes: buffer.length,
    },
  });

  return {
    filename,
    mimeType: "application/pdf",
    buffer,
    sizeBytes: buffer.length,
  };
}
