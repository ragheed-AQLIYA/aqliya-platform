"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { checkExportRestrictions } from "@/lib/localcontactos/compliance-service";
import { safe, logAuditEvent } from "./common";

export async function requestContactExport(contactId: string, reason?: string) {
  return safe(async () => {
    const user = await getCurrentUser();
    await enforce(user, { type: "contact", id: contactId, tenantId: user.organizationId }, "export");
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
