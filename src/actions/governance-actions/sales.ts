"use server";

import "server-only";

import { prisma } from "@/lib/prisma";
import type { GovernanceItem } from "./common";

export async function fetchSalesReviewItems(skip: number, pageSize: number): Promise<GovernanceItem[]> {
  const reviews = await prisma.salesReview
    .findMany({
      where: { status: "pending" },
      select: { id: true, deal: { select: { title: true } }, status: true, reviewerName: true, createdAt: true, dealId: true },
      take: pageSize,
      skip,
    })
    .catch(() => []);

  const items: GovernanceItem[] = [];

  for (const s of reviews) {
    items.push({
      id: `salesreview_${s.id}`,
      productKey: "sales",
      productLabel: "SalesOS",
      type: "اعتماد",
      title: s.deal?.title ?? "مراجعة صفقة",
      description: null,
      status: s.status,
      priority: "medium",
      createdBy: s.reviewerName ?? null,
      createdAt: s.createdAt,
      deadline: null,
      href: s.dealId ? `/sales/deals/${s.dealId}` : "/sales",
    });
  }

  return items;
}
