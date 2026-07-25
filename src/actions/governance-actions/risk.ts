"use server";

import "server-only";

import { prisma } from "@/lib/prisma";
import type { GovernanceItem } from "./common";

export async function fetchRiskAssessmentItems(skip: number, pageSize: number): Promise<GovernanceItem[]> {
  const assessments = await prisma.auditRiskAssessment
    .findMany({
      where: { status: { in: ["draft", "in_review"] } },
      select: { id: true, title: true, status: true, assessedById: true, createdAt: true, engagementId: true },
      take: pageSize,
      skip,
    })
    .catch(() => []);

  const items: GovernanceItem[] = [];

  for (const r of assessments) {
    items.push({
      id: `risk_${r.id}`,
      productKey: "risk",
      productLabel: "RiskOS",
      type: "موافقة",
      title: r.title,
      description: null,
      status: r.status,
      priority: r.status === "draft" ? "low" : "medium",
      createdBy: null,
      createdAt: r.createdAt,
      deadline: null,
      href: r.engagementId ? `/audit/engagements/${r.engagementId}` : "/risk",
    });
  }

  return items;
}
