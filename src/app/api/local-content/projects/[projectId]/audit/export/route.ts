import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertProjectAccess } from "@/lib/local-content/guards";
import { requirePermission, Permission, ResourceType } from "@/actions/localcontent-rbac";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  try {
    const { user, project } = await assertProjectAccess(projectId, "view");
    const organizationId = project.organizationId;
    await requirePermission(Permission.AUDIT_LOG_ACCESS, ResourceType.AUDIT_LOG);

    // [MIGRATED] localContentAuditEvent → platformAuditLog (dual-write with productKey: "local_content")
    // const events = await prisma.localContentAuditEvent.findMany({
    //   where: { projectId },
    //   orderBy: { createdAt: "desc" },
    //   take: 10000,
    // });
    const events = await prisma.platformAuditLog.findMany({
      where: { productKey: "local_content", projectId },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    const header = "timestamp,action,actorId,actorName,targetType,targetId,metadata\n";
    const rows = events
      .map((e) =>
        [
          e.createdAt.toISOString(),
          e.action,
          e.actorId,
          e.actorName ?? "",
          e.targetType,
          e.targetId,
          (e.metadata ? JSON.stringify(e.metadata) : "").replace(/,/g, ";"),
        ].join(","),
      )
      .join("\n");

    const csv = header + rows;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="audit-${projectId}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    const { message, code } = sanitizeError(error);
    const status = httpStatusFromCode(code);
    if (status === 500) {
      return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status });
  }
}
