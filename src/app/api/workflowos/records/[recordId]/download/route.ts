import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserContext } from "@/lib/auth";
import { buildDownloadResponse } from "@/lib/platform/download";
import { buildExportMetadata } from "@/lib/platform/production-export";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> },
) {
  try {
    const { recordId } = await params;
    const user = await requireUserContext();

    const record = await prisma.workflowRecord.findUnique({
      where: { id: recordId },
    });
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    if (record.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    if (record.exportStatus !== "approved") {
      return NextResponse.json(
        { error: "Export must be approved before download" },
        { status: 403 },
      );
    }

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

    await prisma.workflowAuditEvent.create({
      data: {
        organizationId: record.organizationId,
        recordId,
        actorId: user.id,
        actorName: user.name ?? null,
        action: "export_downloaded",
        comment: "تم تنزيل التصدير",
        metadata: { downloadedBy: user.id },
      },
    });

    const exportHeader = buildExportMetadata({
      exportedBy: user.name ?? user.id,
      exportType: "workflow_record",
      organizationId: record.organizationId,
      source: "workflowos",
    });

    const exportData = {
      ...exportHeader,
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
        disclaimer: exportHeader.disclaimer,
        localeNotice:
          "هذا التقرير يعرض بيانات السجل والأدلة وسجل التدقيق كما هي محفوظة داخل المنصة وقت التصدير. لا يُعد هذا التقرير قراراً آلياً.",
        aiAssists: true,
        humanDecides: true,
        evidenceGoverns: true,
      },
    };

    const content = JSON.stringify(exportData, null, 2);
    const filename = `workflow_export_${recordId.substring(0, 8)}.json`;

    return buildDownloadResponse({
      content,
      filename,
      mimeType: "application/json",
      sizeBytes: Buffer.byteLength(content, "utf-8"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export download failed";
    if (message === "Unauthenticated") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    console.error("[WorkflowExportDownload] Error:", message);
    return NextResponse.json({ error: "Export download failed" }, { status: 500 });
  }
}
