"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { safe, logAuditEvent } from "./common";

export async function approveContactExport(contactId: string, note?: string) {
  return safe(async () => {
    const user = await getCurrentUser();
    await enforce(user, { type: "contact", id: contactId, tenantId: user.organizationId }, "approve");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, platformOrganizationId: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const request = await prisma.contactExportRequest.findFirst({
      where: { contactId, status: "pending" },
      orderBy: { createdAt: "desc" },
    });
    if (!request) {
      throw new Error("No pending export request found");
    }
    if (request.requiresLegalReview && request.legalReviewStatus !== "cleared") {
      throw new Error("Export requires legal review clearance first");
    }

    const [updatedRequest] = await prisma.$transaction([
      prisma.contactExportRequest.update({
        where: { id: request.id },
        data: {
          status: "approved",
          reviewedById: user.id,
          reviewedByName: user.name,
          reviewNote: note || null,
          reviewedAt: new Date(),
        },
      }),
      prisma.localContact.update({
        where: { id: contactId },
        data: { exportStatus: "approved" },
      }),
    ]);

    await logAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "exportApproved",
      details: `Export approved by ${user.name}${note ? `: ${note}` : ""}`,
      metadata: { requestId: updatedRequest.id },
    });

    revalidatePath(`/contacts/${contactId}`);
    return updatedRequest;
  });
}

export async function rejectContactExport(contactId: string, reason: string) {
  return safe(async () => {
    const user = await getCurrentUser();
    await enforce(user, { type: "contact", id: contactId, tenantId: user.organizationId }, "reject");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, platformOrganizationId: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const request = await prisma.contactExportRequest.findFirst({
      where: { contactId, status: "pending" },
      orderBy: { createdAt: "desc" },
    });
    if (!request) {
      throw new Error("No pending export request found");
    }

    if (!reason) {
      throw new Error("Rejection reason is required");
    }

    const [updatedRequest] = await prisma.$transaction([
      prisma.contactExportRequest.update({
        where: { id: request.id },
        data: {
          status: "rejected",
          reviewedById: user.id,
          reviewedByName: user.name,
          reviewNote: reason,
          reviewedAt: new Date(),
        },
      }),
      prisma.localContact.update({
        where: { id: contactId },
        data: { exportStatus: "rejected" },
      }),
    ]);

    await logAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "exportRejected",
      details: `Export rejected by ${user.name}: ${reason}`,
      metadata: { requestId: updatedRequest.id },
    });

    revalidatePath(`/contacts/${contactId}`);
    return updatedRequest;
  });
}

export async function clearLegalReview(contactId: string, cleared: boolean, note?: string) {
  return safe(async () => {
    const user = await getCurrentUser();
    await enforce(user, { type: "contact", id: contactId, tenantId: user.organizationId }, "update");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: { id: true, organizationId: true, platformOrganizationId: true },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }

    const request = await prisma.contactExportRequest.findFirst({
      where: { contactId, status: "pending", requiresLegalReview: true },
      orderBy: { createdAt: "desc" },
    });
    if (!request) {
      throw new Error("No pending export request requiring legal review found");
    }

    const updated = await prisma.contactExportRequest.update({
      where: { id: request.id },
      data: {
        legalReviewStatus: cleared ? "cleared" : "blocked",
        reviewNote: note || null,
      },
    });

    await logAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "complianceOverride",
      details: `Legal review ${cleared ? "cleared" : "blocked"} by ${user.name}${note ? `: ${note}` : ""}`,
      metadata: { requestId: updated.id, cleared },
    });

    revalidatePath(`/contacts/${contactId}`);
    return updated;
  });
}
