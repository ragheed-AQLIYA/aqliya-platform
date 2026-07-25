"use server";

import "server-only";

import { prisma } from "@/lib/prisma";
import type { GovernanceItem } from "./common";

export async function fetchAuditFindingItems(skip: number, pageSize: number): Promise<GovernanceItem[]> {
  const findings = await prisma.auditFinding
    .findMany({
      where: { status: { in: ["draft", "under_review"] } },
      select: { id: true, title: true, description: true, status: true, severity: true, createdById: true, createdAt: true, engagementId: true },
      take: pageSize,
      skip,
    })
    .catch(() => []);

  const items: GovernanceItem[] = [];

  for (const f of findings) {
    items.push({
      id: `finding_${f.id}`,
      productKey: "audit",
      productLabel: "AuditOS",
      type: f.severity === "high" || f.severity === "critical" ? "موافقة" : "مراجعة",
      title: f.title,
      description: f.description,
      status: f.status,
      priority: f.severity === "critical" || f.severity === "high" ? "high" : f.status === "under_review" ? "medium" : "low",
      createdBy: null,
      createdAt: f.createdAt,
      deadline: null,
      href: f.engagementId ? `/audit/engagements/${f.engagementId}` : "/audit",
    });
  }

  return items;
}
