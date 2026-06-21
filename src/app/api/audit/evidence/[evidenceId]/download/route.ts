import { NextRequest, NextResponse } from "next/server";
import { getStorageProvider } from "@/lib/audit/storage";
import { getAuditActor } from "@/lib/audit/actor-context";
import { enforceAuditRateLimit } from "@/lib/audit/rate-limit";
import { verifyDownloadToken } from "@/lib/download-token";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { requireAuditCoreAccess } from "@/core/access/audit-access-adapter";
import { assertEvidenceDownloadAccess } from "@/lib/core/evidence";

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
      await requireAuditCoreAccess(
        actor,
        "audit_evidence",
        "read",
        evidenceId,
      );
    }

    enforceAuditRateLimit(actor, "evidence.download", "download");

    const evidenceRecord = await assertEvidenceDownloadAccess({
      productSlug: "audit",
      evidenceId,
      organizationId: actor.organizationId,
    });

    const storage = getStorageProvider();
    const file = await storage.retrieve(evidenceRecord.storageKey!);

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
        label: evidenceRecord.filename,
      },
      { status: "success" },
    );

    const body = new Uint8Array(file.content);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${evidenceRecord.filename.replace(/["\r\n]/g, "_")}"`,
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
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (
      error instanceof Error &&
      error.message.includes("Evidence not found")
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("[EvidenceDownload] Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 },
    );
  }
}
