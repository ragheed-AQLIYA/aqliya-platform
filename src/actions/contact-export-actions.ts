"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
import { checkExportRestrictions } from "@/lib/localcontactos/compliance-service";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Contact Export Actions]", message);
    return { ok: false, error: message };
  }
}

async function logAuditEvent(params: {
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
        metadata: (params.metadata ?? {}) as any,
      },
    });
  } catch (e) {
    console.error("[Audit Log Error]", e);
  }
}

export async function requestContactExport(contactId: string, reason?: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const contact = await prisma.localContact.findUnique({
      where: { id: contactId },
      select: {
        id: true,
        organizationId: true,
        platformOrganizationId: true,
        sensitivityLevel: true,
        exportStatus: true,
      },
    });
    if (!contact || contact.organizationId !== user.organizationId) {
      throw new Error("Contact not found or access denied");
    }
    if (contact.exportStatus === "requested") {
      throw new Error("Export already requested for this contact");
    }
    if (contact.exportStatus === "exported") {
      throw new Error("Contact has already been exported");
    }

    const restrictions = await checkExportRestrictions(contactId, user);

    const exportRequest = await prisma.contactExportRequest.create({
      data: {
        organizationId: user.organizationId,
        platformOrganizationId: user.platformOrganizationId,
        contactId,
        status: "pending",
        requestedById: user.id,
        requestedByName: user.name,
        reason: reason || null,
        requiresLegalReview: restrictions.requiresLegalReview,
        legalReviewStatus: restrictions.requiresLegalReview ? "pending" : "not_required",
      },
    });

    await prisma.localContact.update({
      where: { id: contactId },
      data: { exportStatus: "requested" },
    });

    await logAuditEvent({
      contactId,
      organizationId: user.organizationId,
      platformOrganizationId: user.platformOrganizationId,
      actorId: user.id,
      actorName: user.name,
      action: "exportRequested",
      details: `Export requested by ${user.name}${reason ? `: ${reason}` : ""}`,
      metadata: { requestId: exportRequest.id, sensitivityLevel: contact.sensitivityLevel, requiresLegalReview: restrictions.requiresLegalReview },
    });

    revalidatePath(`/contacts/${contactId}`);
    return exportRequest;
  });
}

export async function approveContactExport(contactId: string, note?: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
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
    const user = await requireUserContext("OPERATOR");
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

export async function recordExportDownload(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
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
    const user = await requireUserContext("VIEWER");
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

export async function getExportRequests(contactId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    const requests = await prisma.contactExportRequest.findMany({
      where: { organizationId: user.organizationId, contactId },
      orderBy: { createdAt: "desc" },
    });
    return requests;
  });
}

export async function clearLegalReview(contactId: string, cleared: boolean, note?: string) {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
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

export async function updateContactSensitivityLevel(contactId: string, sensitivityLevel: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
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
