"use server";

import "server-only";

import { prisma } from "@/lib/prisma";
import type { GovernanceItem } from "./common";

export async function fetchLocalContentReviewItems(skip: number, pageSize: number): Promise<GovernanceItem[]> {
  const reviews = await prisma.localContentReview
    .findMany({
      where: { status: "pending" },
      select: { id: true, project: { select: { name: true } }, status: true, reviewerName: true, createdAt: true, projectId: true },
      take: pageSize,
      skip,
    })
    .catch(() => []);

  const items: GovernanceItem[] = [];

  for (const r of reviews) {
    items.push({
      id: `lcreview_${r.id}`,
      productKey: "localcontent",
      productLabel: "LocalContentOS",
      type: "مراجعة",
      title: r.project?.name ?? "مراجعة محتوى محلي",
      description: null,
      status: r.status,
      priority: "medium",
      createdBy: r.reviewerName ?? null,
      createdAt: r.createdAt,
      deadline: null,
      href: `/local-content/review-center`,
    });
  }

  return items;
}
