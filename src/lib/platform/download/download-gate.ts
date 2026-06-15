// ─── بوابة التحميل الأساسية — Core Download Gate ───
// تصدر تذاكر التحميل، تتحقق من الصلاحية، تسجل الأحداث في سجل التدقيق

import { prisma } from "@/lib/prisma";
import { principalFromCurrentUser } from "@/lib/platform/access/principal";
import { can } from "@/lib/platform/access/permissions";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type {
  DownloadGateResult,
  DownloadTicketData,
  DownloadTicketInput,
} from "./types";

const DEFAULT_EXPIRY_MINUTES = 60;
const DEFAULT_PERMISSION = "export";

function toDownloadTicketData(record: {
  id: string;
  token: string;
  resourceType: string;
  resourceId: string;
  fileName: string;
  mimeType: string;
  fileSize: number | null;
  expiresAt: Date;
  consumedAt: Date | null;
  revokedAt: Date | null;
}): DownloadTicketData {
  return {
    id: record.id,
    token: record.token,
    resourceType: record.resourceType,
    resourceId: record.resourceId,
    fileName: record.fileName,
    mimeType: record.mimeType,
    fileSize: record.fileSize ?? undefined,
    expiresAt: record.expiresAt,
    consumedAt: record.consumedAt ?? undefined,
    revokedAt: record.revokedAt ?? undefined,
  };
}

function getProductKeyFromResourceType(resourceType: string): string {
  const prefix = resourceType.split(".")[0];
  return prefix;
}

/**
 * إنشاء تذكرة تحميل جديدة مع التحقق من الصلاحية وتسجيل الحدث
 */
export async function generateDownloadTicket(
  input: DownloadTicketInput,
  user: { id: string; organizationId: string; role?: string },
): Promise<DownloadGateResult> {
  try {
    const principal = principalFromCurrentUser({
      id: user.id,
      organizationId: user.organizationId,
      role: user.role ?? "VIEWER",
    });

    const permission = input.permissionCheck ?? DEFAULT_PERMISSION;
    const permResult = can(principal, permission as never);
    if (!permResult.allowed) {
      return { allowed: false, reason: "Insufficient permissions for download" };
    }

    const expiresIn = input.expiresInMinutes ?? DEFAULT_EXPIRY_MINUTES;
    const expiresAt = new Date(Date.now() + expiresIn * 60_000);

    const ticket = await prisma.downloadTicket.create({
      data: {
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSize: input.fileSize ?? null,
        filePath: input.filePath ?? null,
        storageKey: input.storageKey ?? null,
        createdById: user.id,
        organizationId: user.organizationId,
        workspaceId: input.workspaceId ?? null,
        permissionCheck: permission,
        expiresAt,
      },
    });

    const productKey = getProductKeyFromResourceType(input.resourceType);
    await writePlatformAuditLog({
      productKey,
      action: "download.ticket_created",
      platformOrganizationId: user.organizationId,
      clientWorkspaceId: input.workspaceId,
      actorId: user.id,
      actorType: "user",
      targetType: input.resourceType,
      targetId: input.resourceId,
      targetLabel: input.fileName,
      severity: "info",
      status: "success",
      sourceSystem: "download_gate",
      sourceId: ticket.id,
      metadata: {
        token: ticket.token.substring(0, 8) + "...",
        expiresAt: expiresAt.toISOString(),
        permissionCheck: permission,
      },
    });

    return {
      allowed: true,
      ticket: toDownloadTicketData(ticket),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate download ticket";
    console.warn(`[DownloadGate] generateDownloadTicket failed: ${message}`);
    return { allowed: false, reason: "Failed to generate download ticket" };
  }
}

/**
 * التحقق من صحة تذكرة التحميل
 */
export async function verifyDownloadTicket(
  token: string,
): Promise<DownloadGateResult> {
  try {
    const ticket = await prisma.downloadTicket.findUnique({
      where: { token },
    });

    if (!ticket) {
      return { allowed: false, reason: "Download link is invalid or expired" };
    }

    if (ticket.revokedAt) {
      return { allowed: false, reason: "Download link is invalid or expired" };
    }

    if (ticket.consumedAt) {
      return { allowed: false, reason: "Download link is invalid or expired" };
    }

    if (new Date() > ticket.expiresAt) {
      return { allowed: false, reason: "Download link is invalid or expired" };
    }

    return {
      allowed: true,
      ticket: toDownloadTicketData(ticket),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify download ticket";
    console.warn(`[DownloadGate] verifyDownloadTicket failed: ${message}`);
    return { allowed: false, reason: "Download link is invalid or expired" };
  }
}

/**
 * استهلاك تذكرة التحميل (تعليمها كمستخدمة)
 */
export async function consumeDownloadTicket(
  token: string,
): Promise<DownloadGateResult> {
  try {
    const ticket = await prisma.downloadTicket.findUnique({
      where: { token },
    });

    if (!ticket) {
      return { allowed: false, reason: "Download link is invalid or expired" };
    }

    if (ticket.consumedAt || ticket.revokedAt || new Date() > ticket.expiresAt) {
      return { allowed: false, reason: "Download link is invalid or expired" };
    }

    const updated = await prisma.downloadTicket.update({
      where: { token },
      data: { consumedAt: new Date() },
    });

    const productKey = getProductKeyFromResourceType(ticket.resourceType);
    await writePlatformAuditLog({
      productKey,
      action: "download.ticket_consumed",
      platformOrganizationId: ticket.organizationId,
      actorId: ticket.createdById,
      actorType: "user",
      targetType: ticket.resourceType,
      targetId: ticket.resourceId,
      targetLabel: ticket.fileName,
      severity: "info",
      status: "success",
      sourceSystem: "download_gate",
      sourceId: ticket.id,
    });

    return {
      allowed: true,
      ticket: toDownloadTicketData(updated),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to consume download ticket";
    console.warn(`[DownloadGate] consumeDownloadTicket failed: ${message}`);
    return { allowed: false, reason: "Download link is invalid or expired" };
  }
}

/**
 * إلغاء تذكرة التحميل
 */
export async function revokeDownloadTicket(
  token: string,
  revokedById: string,
  reason?: string,
): Promise<void> {
  const ticket = await prisma.downloadTicket.findUnique({
    where: { token },
  });

  if (!ticket) return;

  await prisma.downloadTicket.update({
    where: { token },
    data: {
      revokedAt: new Date(),
      revokedById,
      revokeReason: reason ?? null,
    },
  });

  const productKey = getProductKeyFromResourceType(ticket.resourceType);
  await writePlatformAuditLog({
    productKey,
    action: "download.ticket_revoked",
    platformOrganizationId: ticket.organizationId,
    actorId: revokedById,
    actorType: "user",
    targetType: ticket.resourceType,
    targetId: ticket.resourceId,
    targetLabel: ticket.fileName,
    severity: "warning",
    status: "success",
    sourceSystem: "download_gate",
    sourceId: ticket.id,
    metadata: reason ? { revokeReason: reason } : undefined,
  });
}

/**
 * تنظيف التذاكر منتهية الصلاحية — وظيفة مجدولة
 */
export async function cleanExpiredTickets(): Promise<number> {
  const result = await prisma.downloadTicket.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
      consumedAt: null,
      revokedAt: null,
    },
  });
  return result.count;
}

/**
 * سجل تحميلات المستخدم
 */
export async function getUserDownloadHistory(
  userId: string,
  limit?: number,
): Promise<DownloadTicketData[]> {
  const tickets = await prisma.downloadTicket.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: "desc" },
    take: limit ?? 50,
  });

  return tickets.map(toDownloadTicketData);
}
