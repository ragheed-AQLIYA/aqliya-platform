import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";

export interface ExportRestrictions {
  canExport: boolean;
  requiresExportApproval: boolean;
  requiresLegalReview: boolean;
  reason?: string;
}

export interface ComplianceSummary {
  sensitivityLevel: string;
  exportStatus: string;
  canExport: boolean;
  requiresExportApproval: boolean;
  requiresLegalReview: boolean;
  hasPendingExportRequest: boolean;
  hasApprovedExport: boolean;
  hasRejectedExport: boolean;
  hasExported: boolean;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  evidenceCount: number;
}

export async function checkExportRestrictions(
  contactId: string,
  user: CurrentUser,
): Promise<ExportRestrictions> {
  const contact = await prisma.localContact.findUnique({
    where: { id: contactId },
    select: {
      sensitivityLevel: true,
      exportStatus: true,
      organizationId: true,
      _count: { select: { evidence: true, reviews: true } },
    },
  });

  if (!contact || contact.organizationId !== user.organizationId) {
    return { canExport: false, requiresExportApproval: false, requiresLegalReview: false, reason: "Access denied" };
  }

  // Sensitivity-based restriction rules
  const requiresExportApproval =
    contact.sensitivityLevel === "confidential" ||
    contact.sensitivityLevel === "sensitive";

  const requiresLegalReview =
    contact.sensitivityLevel === "confidential";

  if (contact.exportStatus === "rejected") {
    return {
      canExport: false,
      requiresExportApproval,
      requiresLegalReview,
      reason: "Previous export request was rejected",
    };
  }

  if (contact.exportStatus === "exported") {
    return {
      canExport: false,
      requiresExportApproval: false,
      requiresLegalReview: false,
      reason: "Contact has already been exported",
    };
  }

  if (contact.exportStatus === "requested") {
    return {
      canExport: false,
      requiresExportApproval,
      requiresLegalReview,
      reason: "Export request is pending approval",
    };
  }

  return {
    canExport: !requiresExportApproval || contact.exportStatus === "approved",
    requiresExportApproval,
    requiresLegalReview,
  };
}

export async function getExportComplianceSummary(
  contactId: string,
  user: CurrentUser,
): Promise<ComplianceSummary> {
  const contact = await prisma.localContact.findUnique({
    where: { id: contactId },
    select: {
      sensitivityLevel: true,
      exportStatus: true,
      organizationId: true,
      _count: { select: { evidence: true, reviews: true } },
    },
  });

  if (!contact || contact.organizationId !== user.organizationId) {
    throw new Error("Contact not found or access denied");
  }

  const exportRequests = await prisma.contactExportRequest.findMany({
    where: { contactId },
    select: { status: true },
  });

  const reviews = await prisma.contactReview.findMany({
    where: { organizationId: user.organizationId, contactId },
    select: { status: true },
  });

  return {
    sensitivityLevel: contact.sensitivityLevel,
    exportStatus: contact.exportStatus,
    canExport: contact.exportStatus === "approved" ||
      (contact.exportStatus === "none" &&
        contact.sensitivityLevel === "normal"),
    requiresExportApproval:
      contact.sensitivityLevel === "confidential" ||
      contact.sensitivityLevel === "sensitive",
    requiresLegalReview: contact.sensitivityLevel === "confidential",
    hasPendingExportRequest: exportRequests.some((r) => r.status === "pending"),
    hasApprovedExport: exportRequests.some((r) => r.status === "approved"),
    hasRejectedExport: exportRequests.some((r) => r.status === "rejected"),
    hasExported: contact.exportStatus === "exported",
    pendingReviews: reviews.filter((r) => r.status === "pending").length,
    approvedReviews: reviews.filter((r) => r.status === "approved").length,
    rejectedReviews: reviews.filter((r) => r.status === "rejected").length,
    evidenceCount: contact._count.evidence,
  };
}
