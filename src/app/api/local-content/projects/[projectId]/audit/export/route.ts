import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertProjectAccess } from "@/lib/local-content/guards";
import { requirePermission, Permission, ResourceType } from "@/actions/localcontent-rbac";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  try {
    const { user } = await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.AUDIT_LOG_ACCESS, ResourceType.AUDIT_LOG);

    const events = await prisma.localContentAuditEvent.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    const header = "timestamp,action,actorId,actorName,entityType,entityId,metadata\n";
    const rows = events
      .map((e) =>
        [
          e.createdAt.toISOString(),
          e.action,
          e.actorId,
          e.actorName ?? "",
          e.entityType,
          e.entityId,
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
    if (error instanceof Error) {
      if (error.message === "Unauthenticated") {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      if (error.message.startsWith("Access denied")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message === "Project not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
