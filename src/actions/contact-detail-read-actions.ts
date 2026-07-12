"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function getContactEvidence(contactId: string, orgId: string) {
  return prisma.contactEvidence.findMany({
    where: { organizationId: orgId, contactId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getContactReviewsAndReviewers(
  contactId: string,
  orgId: string,
  userRole: string,
) {
  const [reviews, availableReviewers] = await Promise.all([
    prisma.contactReview.findMany({
      where: { organizationId: orgId, contactId },
      include: { approvals: true },
      orderBy: { createdAt: "desc" },
    }),
    userRole === "ADMIN" || userRole === "OPERATOR"
      ? prisma.user.findMany({
          where: { organizationId: orgId, role: { in: ["ADMIN", "OPERATOR"] } },
          select: { id: true, name: true, email: true, role: true },
          orderBy: { name: "asc" },
        })
      : [],
  ]);
  return { reviews, availableReviewers };
}

export async function getContactExportData(contactId: string, orgId: string) {
  const [contact, exportRequests] = await Promise.all([
    prisma.localContact.findUnique({
      where: { id: contactId },
      select: { sensitivityLevel: true, exportStatus: true },
    }),
    prisma.contactExportRequest.findMany({
      where: { organizationId: orgId, contactId },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { contact, exportRequests };
}
