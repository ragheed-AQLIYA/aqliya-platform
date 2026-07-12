"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const PAGE_SIZE = 50;

export async function getContactEvidence(contactId: string, orgId: string, offset?: number) {
  const where = { organizationId: orgId, contactId };
  const skip = offset || 0;
  const [evidence, totalCount] = await Promise.all([
    prisma.contactEvidence.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.contactEvidence.count({ where }),
  ]);
  return { evidence, totalCount, hasMore: skip + PAGE_SIZE < totalCount };
}

export async function getContactReviewsAndReviewers(
  contactId: string,
  orgId: string,
  userRole: string,
  offset?: number,
) {
  const skip = offset || 0;
  const reviewWhere = { organizationId: orgId, contactId };
    const [reviews, reviewTotalCount, availableReviewers] = await Promise.all([
    prisma.contactReview.findMany({
      where: reviewWhere,
      include: { approvals: true },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.contactReview.count({ where: reviewWhere }),
    userRole === "ADMIN" || userRole === "OPERATOR"
      ? prisma.user.findMany({
          where: { organizationId: orgId, role: { in: ["ADMIN", "OPERATOR"] } },
          select: { id: true, name: true, email: true, role: true },
          orderBy: { name: "asc" },
          take: PAGE_SIZE,
          skip,
        })
      : [],
  ]);
  return { reviews, reviewTotalCount, hasMore: skip + PAGE_SIZE < reviewTotalCount, availableReviewers };
}

export async function getContactExportData(contactId: string, orgId: string, offset?: number) {
  const skip = offset || 0;
  const exportWhere = { organizationId: orgId, contactId };
  const [contact, exportRequests, exportTotalCount] = await Promise.all([
    prisma.localContact.findUnique({
      where: { id: contactId },
      select: { sensitivityLevel: true, exportStatus: true },
    }),
    prisma.contactExportRequest.findMany({
      where: exportWhere,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.contactExportRequest.count({ where: exportWhere }),
  ]);
  return { contact, exportRequests, exportTotalCount, hasMore: skip + PAGE_SIZE < exportTotalCount };
}
