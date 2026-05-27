import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/audit/storage";
import { getAuditActor } from "@/lib/audit/actor-context";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { enforceAuditRateLimit } from "@/lib/audit/rate-limit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ evidenceId: string }> },
) {
  const { evidenceId } = await params;

  try {
    const actor = await getAuditActor();
    enforceAuditRateLimit(actor, "evidence.download", "download");

    const evidence = await prisma.auditEvidence.findUnique({
      where: { id: evidenceId },
      include: { engagement: { select: { organizationId: true } } },
    });

    if (
      !evidence ||
      !evidence.storageKey ||
      evidence.engagement.organizationId !== actor.organizationId
    ) {
      return NextResponse.json(
        { error: "Evidence not found or no file stored" },
        { status: 404 },
      );
    }

    const storage = getStorageProvider();
    const file = await storage.retrieve(evidence.storageKey);

    if (!file) {
      return NextResponse.json(
        { error: "File not found in storage" },
        { status: 404 },
      );
    }

    await writePlatformAuditLog({
      productKey: "audit",
      action: "evidence.download",
      platformOrganizationId: actor.organizationId,
      actorId: actor.actorId,
      actorType: actor.actorRole,
      actorName: actor.actorName,
      targetType: "audit_evidence",
      targetId: evidenceId,
      targetLabel: evidence.filename,
      sourceSystem: "audit_evidence_download",
      status: "success",
    });

    const body = new Uint8Array(file.content);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${evidence.filename.replace(/["\r\n]/g, "_")}"`,
        "Content-Length": String(file.sizeBytes),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
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
