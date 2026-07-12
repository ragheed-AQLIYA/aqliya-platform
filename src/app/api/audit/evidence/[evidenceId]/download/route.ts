import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStorageProvider } from "@/lib/audit/storage";
import { enforceAuditRateLimit } from "@/lib/audit/rate-limit";
import { verifyDownloadToken } from "@/lib/download-token";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { enforce } from "@/lib/authorization";
import { assertEvidenceDownloadAccess } from "@/lib/core/evidence";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

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
      const user = await getCurrentUser();
      await enforce(
        user,
        { type: "evidence", id: evidenceId, tenantId: user.organizationId },
        "export",
      );
      actor = {
        actorId: user.id,
        actorName: user.name ?? user.email,
        actorRole: user.role,
        organizationId: user.organizationId,
      };
    }

    await enforceAuditRateLimit(actor, "evidence.download", "download");

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
    const { message, code } = sanitizeError(error);
    const status = httpStatusFromCode(code);
    if (status === 500) {
      console.error("[EvidenceDownload] Error serving file:", error);
      return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status });
  }
}
