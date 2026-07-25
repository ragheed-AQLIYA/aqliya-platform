"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { safe, logAuditEvent } from "./common";

export async function recordExportDownload(contactId: string) {
  return safe(async () => {
    const user = await getCurrentUser();
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, platformOrganizationId: true, exportStatus: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    if (contact.exportStatus !== "approved") {
      throw new Error("Export not approved for this contact");
    }

    await prisma.localContact.update({
      where: { id: contactId },
      data: { exportStatus: "exported" },
    });

    await prisma.contactExportRequest.updateMany({
      where: { contactId, status: "approved" },
      data: { exportedAt: new Date() },
    });

    await logAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "exportDownloaded",
      details: `Export downloaded by ${user.name}`,
    });

    revalidatePath(`/contacts/${contactId}`);
    return { ok: true, data: { downloaded: true } };
  });
}

export async function getExportStatus(contactId: string) {
  return safe(async () => {
    const user = await getCurrentUser();
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, exportStatus: true, sensitivityLevel: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const latestRequest = await prisma.contactExportRequest.findFirst({
      where: { contactId },
      orderBy: { createdAt: "desc" },
    });

    return {
      exportStatus: contact.exportStatus,
      sensitivityLevel: contact.sensitivityLevel,
      request: latestRequest,
    };
  });
}

export async function getExportRequests(contactId: string, offset?: number) {
  return safe(async () => {
    const user = await getCurrentUser();
    const where = { organizationId: user.organizationId, contactId };
    const PAGE_SIZE = 50;
    const skip = offset || 0;
    const [requests, totalCount] = await Promise.all([
      prisma.contactExportRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip,
      }),
      prisma.contactExportRequest.count({ where }),
    ]);
    return { requests, totalCount, hasMore: skip + PAGE_SIZE < totalCount };
  });
}

export async function updateContactSensitivityLevel(contactId: string, sensitivityLevel: string) {
  return safe(async () => {
    const user = await getCurrentUser();
    await enforce(user, { type: "contact", id: contactId, tenantId: user.organizationId }, "update");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, platformOrganizationId: true, sensitivityLevel: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }
    if (!["normal", "sensitive", "confidential"].includes(sensitivityLevel)) {
      throw new Error("Invalid sensitivity level");
    }

    const oldLevel = contact.sensitivityLevel;
    const updated = await prisma.localContact.update({
      where: { id: contactId },
      data: { sensitivityLevel },
    });

    if (oldLevel !== sensitivityLevel) {
      await logAuditEvent({
        contactId,
        organizationId: user.organizationId,
        platformOrganizationId: user.platformOrganizationId,
        actorId: user.id,
        actorName: user.name,
        action: "sensitivityLevelChanged",
        details: `Sensitivity changed from ${oldLevel} to ${sensitivityLevel} by ${user.name}`,
        metadata: { from: oldLevel, to: sensitivityLevel },
      });
    }

    revalidatePath(`/contacts/${contactId}`);
    return updated;
  });
}
