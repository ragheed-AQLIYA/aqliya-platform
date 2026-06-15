import "server-only";

import { prisma } from "@/lib/prisma";
import type { FinancialStatementStatus } from "./types";

const ALLOWED: Record<FinancialStatementStatus, FinancialStatementStatus[]> = {
  draft: ["reviewed"],
  reviewed: ["approved"],
  approved: [],
};

export function canTransitionFsStatus(
  from: FinancialStatementStatus,
  to: FinancialStatementStatus,
): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

export async function transitionFinancialStatementStatus(input: {
  engagementId: string;
  statementId: string;
  toStatus: FinancialStatementStatus;
  actorId: string;
  actorName: string;
}): Promise<void> {
  const stmt = await prisma.auditFinancialStatement.findFirst({
    where: { id: input.statementId, engagementId: input.engagementId },
  });
  if (!stmt) {
    throw new Error("Financial statement not found");
  }

  const fromStatus = stmt.status as FinancialStatementStatus;
  if (!canTransitionFsStatus(fromStatus, input.toStatus)) {
    throw new Error(`Invalid FS status transition: ${fromStatus} → ${input.toStatus}`);
  }

  await prisma.auditFinancialStatement.update({
    where: { id: stmt.id },
    data: { status: input.toStatus },
  });

  await prisma.auditEvent.create({
    data: {
      engagementId: input.engagementId,
      eventType: "financial_statement.status_changed",
      actorId: input.actorId,
      actorName: input.actorName,
      actorRole: "reviewer",
      targetType: "financial_statement",
      targetId: stmt.id,
      previousState: fromStatus,
      newState: input.toStatus,
      description: `FS ${stmt.statementType} → ${input.toStatus}`,
    },
  });
}

export async function markAllFinancialStatementsReviewed(input: {
  engagementId: string;
  actorId: string;
  actorName: string;
}): Promise<number> {
  const drafts = await prisma.auditFinancialStatement.findMany({
    where: { engagementId: input.engagementId, status: "draft" },
  });

  for (const stmt of drafts) {
    await transitionFinancialStatementStatus({
      engagementId: input.engagementId,
      statementId: stmt.id,
      toStatus: "reviewed",
      actorId: input.actorId,
      actorName: input.actorName,
    });
  }

  return drafts.length;
}

export async function approveAllFinancialStatementsForEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<number> {
  const pending = await prisma.auditFinancialStatement.findMany({
    where: { engagementId, status: { not: "approved" } },
  });

  for (const stmt of pending) {
    const from = stmt.status as FinancialStatementStatus;
    if (from === "draft") {
      await transitionFinancialStatementStatus({
        engagementId,
        statementId: stmt.id,
        toStatus: "reviewed",
        actorId,
        actorName,
      });
    }
    await transitionFinancialStatementStatus({
      engagementId,
      statementId: stmt.id,
      toStatus: "approved",
      actorId,
      actorName,
    });
  }

  return pending.length;
}
