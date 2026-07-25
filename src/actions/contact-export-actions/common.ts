import type { Prisma } from "@prisma/client";
import { createLogger } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";
import { isExpectedAccessDeniedError } from "@/lib/auth";
import type PDFDocument from "pdfkit";

const logger = createLogger({ product: "platform", action: "unknown" });

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("[Contact Export Actions]", error instanceof Error ? error : undefined);
    return { ok: false, error: message };
  }
}

export async function logAuditEvent(params: {
  contactId: string;
  organizationId: string;
  platformOrganizationId?: string | null;
  actorId: string;
  actorName?: string | null;
  action: string;
  details?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: params.platformOrganizationId,
        clientWorkspaceId: null,
        productKey: "localcontactos",
        actorId: params.actorId,
        actorName: params.actorName,
        actorEmail: null,
        action: params.action,
        targetType: "LocalContact",
        targetId: params.contactId,
        targetLabel: null,
        severity: "info",
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (e) {
    logger.error("[Audit Log Error]", e instanceof Error ? e : undefined);
  }
}

export function drawPdfDivider(doc: PDFKit.PDFDocument, x: number) {
  doc.moveTo(x, doc.y).lineTo(545, doc.y).strokeColor("#cccccc").stroke();
}
