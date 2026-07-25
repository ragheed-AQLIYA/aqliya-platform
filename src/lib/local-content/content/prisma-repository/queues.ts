import "server-only";

import { prisma } from "@/lib/prisma";
import type { ContentItem } from "../types";
import { mapContentItem } from "./common";

export async function listReviewQueue(organizationId: string): Promise<ContentItem[]> {
  const rows = await prisma.contentStudioItem.findMany({
    take: 100,
    where: {
      organizationId,
      status: { in: ["in_review", "draft"] },
    },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapContentItem);
}

export async function listApprovalQueue(organizationId: string): Promise<ContentItem[]> {
  const rows = await prisma.contentStudioItem.findMany({
    take: 100,
    where: { organizationId, status: "in_review" },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapContentItem);
}
