"use server";

import "server-only";

import { prisma } from "@/lib/prisma";
import type { GovernanceItem } from "./common";

export async function fetchWorkflowItems(skip: number, pageSize: number): Promise<GovernanceItem[]> {
  const records = await prisma.workflowRecord
    .findMany({
      where: { status: { in: ["in_progress", "pending_approval"] } },
      select: { id: true, title: true, description: true, status: true, dueDate: true, createdById: true, createdAt: true },
      take: pageSize,
      skip,
    })
    .catch(() => []);

  const items: GovernanceItem[] = [];

  for (const w of records) {
    items.push({
      id: `workflow_${w.id}`,
      productKey: "workflow",
      productLabel: "WorkflowOS",
      type: w.status === "pending_approval" ? "اعتماد" : "مراجعة",
      title: w.title,
      description: w.description,
      status: w.status,
      priority: w.status === "pending_approval" ? "high" : "medium",
      createdBy: null,
      createdAt: w.createdAt,
      deadline: w.dueDate,
      href: `/workflowos/records/${w.id}`,
    });
  }

  return items;
}
