"use server";

import "server-only";

import { prisma } from "@/lib/prisma";
import type { GovernanceItem } from "./common";

export async function fetchDecisionItems(skip: number, pageSize: number): Promise<GovernanceItem[]> {
  const decisions = await prisma.decision
    .findMany({
      where: { status: "IN_REVIEW" },
      select: { id: true, title: true, description: true, status: true, targetDate: true, owner: { select: { name: true } }, createdAt: true },
      take: pageSize,
      skip,
    })
    .catch(() => []);

  const now = new Date();
  const items: GovernanceItem[] = [];

  for (const d of decisions) {
    items.push({
      id: `decision_${d.id}`,
      productKey: "decision",
      productLabel: "DecisionOS",
      type: "مراجعة",
      title: d.title,
      description: d.description,
      status: d.status,
      priority: d.targetDate && now > d.targetDate ? "high" : d.status === "IN_REVIEW" ? "high" : "medium",
      createdBy: d.owner?.name ?? null,
      createdAt: d.createdAt,
      deadline: d.targetDate,
      href: `/decisions/${d.id}`,
    });
  }

  return items;
}
