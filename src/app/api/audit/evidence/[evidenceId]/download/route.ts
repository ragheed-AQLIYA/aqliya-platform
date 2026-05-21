import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/audit/storage";
import { getAuditActor } from "@/lib/audit/actor-context";
import {
  assertEngagementAccess,
  TenantAccessError,
} from "@/lib/audit/tenant-guard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ evidenceId: string }> },
) {
  const { evidenceId } = await params;

  try {
    const actor = await getAuditActor();
    const evidence = await prisma.auditEvidence.findUnique({
      where: { id: evidenceId },
      include: { engagement: { select: { id: true } } },
    });

    if (!evidence || !evidence.storageKey) {
      return NextResponse.json(
        { error: "Evidence not found or no file stored" },
        { status: 404 },
      );
    }

    await assertEngagementAccess(evidence.engagement.id, actor);

    const storage = getStorageProvider();
    const file = await storage.retrieve(evidence.storageKey);

    if (!file) {
      return NextResponse.json(
        { error: "File not found in storage" },
        { status: 404 },
      );
    }

    const body = new Uint8Array(file.content);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${evidence.filename.replace(/["\r\n]/g, "_")}"`,
        "Content-Length": String(file.sizeBytes),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    if (
      error instanceof TenantAccessError ||
      (error instanceof Error && error.message.startsWith("Access denied:"))
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthenticated") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    console.error("[EvidenceDownload] Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 },
    );
  }
}
