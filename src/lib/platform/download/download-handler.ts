// ─── معالج التحميل الآمن — Secure Download Handler ───
// يتحقق من التذكرة، يقرأ الملف، يبني الاستجابة، يستهلك التذكرة

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildDownloadResponse } from "@/lib/platform/download";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { generateDownloadTicket, verifyDownloadTicket, consumeDownloadTicket } from "./download-gate";
import type { DownloadTicketInput } from "./types";

function getProductKeyFromResourceType(resourceType: string): string {
  return resourceType.split(".")[0];
}

function getDownloadErrorResponse(status: number): NextResponse {
  const messages: Record<number, string> = {
    401: "Download link is invalid or expired",
    403: "Download link is invalid or expired",
    404: "Download link is invalid or expired",
  };
  return NextResponse.json(
    { error: messages[status] ?? "Download link is invalid or expired" },
    { status },
  );
}

/**
 * معالجة تحميل آمن عبر تذكرة
 */
export async function handleSecureDownload(
  token: string,
  req: Request,
): Promise<NextResponse> {
  try {
    const verification = await verifyDownloadTicket(token);
    if (!verification.allowed || !verification.ticket) {
      return getDownloadErrorResponse(404);
    }

    const ticket = await prisma.downloadTicket.findUnique({
      where: { token },
    });

    if (!ticket) {
      return getDownloadErrorResponse(404);
    }

    let content: Buffer | Uint8Array | string;
    let mimeType = ticket.mimeType;
    let fileName = ticket.fileName;

    if (ticket.filePath) {
      const fs = await import("fs");
      const buffer = fs.readFileSync(ticket.filePath);
      content = buffer;
    } else if (ticket.storageKey) {
      return NextResponse.json(
        { error: "Cloud storage download requires storage provider integration" },
        { status: 501 },
      );
    } else {
      return getDownloadErrorResponse(404);
    }

    const productKey = getProductKeyFromResourceType(ticket.resourceType);
    await writePlatformAuditLog({
      productKey,
      action: "download.completed",
      platformOrganizationId: ticket.organizationId,
      clientWorkspaceId: ticket.workspaceId ?? undefined,
      actorId: ticket.createdById,
      actorType: "user",
      targetType: ticket.resourceType,
      targetId: ticket.resourceId,
      targetLabel: fileName,
      severity: "info",
      status: "success",
      sourceSystem: "download_handler",
      sourceId: ticket.id,
      ipAddress: req.headers?.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers?.get("user-agent") ?? undefined,
    });

    await consumeDownloadTicket(token);

    return buildDownloadResponse({
      content,
      filename: fileName,
      mimeType,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed";
    console.warn(`[DownloadHandler] handleSecureDownload failed: ${message}`);
    return getDownloadErrorResponse(500);
  }
}

/**
 * إنشاء تذكرة ومعالجة التحميل في خطوة واحدة
 */
export async function createAndHandleDownload(
  input: DownloadTicketInput,
  user: { id: string; organizationId: string; role?: string },
  req: Request,
): Promise<NextResponse> {
  const generation = await generateDownloadTicket(input, user);
  if (!generation.allowed || !generation.ticket) {
    return NextResponse.json(
      { error: generation.reason ?? "Download not available" },
      { status: 403 },
    );
  }

  return handleSecureDownload(generation.ticket.token, req);
}
