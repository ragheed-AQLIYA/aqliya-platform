import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/audit/storage";
import { getAuditActor } from "@/lib/audit/actor-context";
import { enforceAuditRateLimit } from "@/lib/audit/rate-limit";
import { verifyDownloadToken } from "@/lib/download-token";
import { auditLogger, Product } from "@/lib/platform/audit-logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ evidenceId: string }> },
) {
  const { evidenceId } = await params;

  try {
    const tokenParam = request.nextUrl.searchParams.get("token");
    let actor: {
      actorId: string;
      actorName: string;
      actorRole: string;
      organizationId: string;
    };

    if (tokenParam) {
      const payload = await verifyDownloadToken(tokenParam);
      if (payload.type !== "audit_evidence" || payload.file !== evidenceId) {
        return NextResponse.json(
          { error: "Download not found" },
          { status: 404 },
        );
      }
      actor = {
        actorId: payload.sub,
        actorName: "token",
        actorRole: "viewer",
        organizationId: payload.org,
      };
    } else {
      actor = await getAuditActor();
    }

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

    const alog = auditLogger({
      productKey: Product.AUDIT,
      sourceSystem: "audit_evidence_download",
      organization: { platformOrganizationId: actor.organizationId },
      actor: {
        id: actor.actorId,
        name: actor.actorName,
        type: actor.actorRole,
      },
    });
    await alog.record(
      "evidence.download",
      {
        type: "audit_evidence",
        id: evidenceId,
        label: evidence.filename,
      },
      { status: "success" },
    );

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
