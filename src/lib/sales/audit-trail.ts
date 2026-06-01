import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { SalesAuditActions } from "./audit-events";

export const SALES_AUDIT_TRAIL_DEFAULT_LIMIT = 100;
export const SALES_AUDIT_TRAIL_MAX_LIMIT = 100;
export const DEFAULT_AUDIT_TRAIL_LIMIT = SALES_AUDIT_TRAIL_DEFAULT_LIMIT;

export interface SalesAuditTrailFilters {
  targetType?: string;
  actionPrefix?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  cursor?: string;
}

export interface SalesAuditTrailRow {
  id: string;
  action: string;
  actorId: string;
  actorName: string | null;
  targetType: string;
  targetId: string;
  metadata: unknown;
  createdAt: Date;
}

export function parseSalesAuditTrailFilters(params: {
  targetType?: string;
  action?: string;
  actionPrefix?: string;
  from?: string;
  to?: string;
  limit?: string | number;
  cursor?: string;
}): SalesAuditTrailFilters {
  const filters: SalesAuditTrailFilters = {};

  const targetType = params.targetType?.trim();
  if (targetType) {
    filters.targetType = targetType;
  }

  const actionPrefix = (params.actionPrefix ?? params.action)?.trim();
  if (actionPrefix) {
    filters.actionPrefix = actionPrefix;
  }

  const fromRaw = params.from?.trim();
  if (fromRaw) {
    const fromDate = new Date(fromRaw);
    if (!Number.isNaN(fromDate.getTime())) {
      filters.fromDate = fromDate;
    }
  }

  const toRaw = params.to?.trim();
  if (toRaw) {
    const toDate = new Date(toRaw);
    if (!Number.isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999);
      filters.toDate = toDate;
    }
  }

  if (params.limit != null && String(params.limit).trim() !== "") {
    const parsed = Number(params.limit);
    if (Number.isFinite(parsed) && parsed > 0) {
      filters.limit = Math.min(
        Math.floor(parsed),
        SALES_AUDIT_TRAIL_MAX_LIMIT,
      );
    }
  }

  const cursor = params.cursor?.trim();
  if (cursor) {
    filters.cursor = cursor;
  }

  return filters;
}

export function buildSalesAuditTrailWhere(
  organizationId: string,
  filters: SalesAuditTrailFilters = {},
): Prisma.SalesAuditEventWhereInput {
  const where: Prisma.SalesAuditEventWhereInput = { organizationId };

  if (filters.targetType) {
    where.targetType = filters.targetType;
  }

  if (filters.actionPrefix) {
    where.action = { startsWith: filters.actionPrefix };
  }

  if (filters.fromDate || filters.toDate) {
    where.createdAt = {};
    if (filters.fromDate) {
      where.createdAt.gte = filters.fromDate;
    }
    if (filters.toDate) {
      where.createdAt.lte = filters.toDate;
    }
  }

  return where;
}

export async function listOrgSalesAuditEvents(
  organizationId: string,
  filters: SalesAuditTrailFilters = {},
): Promise<SalesAuditTrailRow[]> {
  const limit = Math.min(
    filters.limit ?? SALES_AUDIT_TRAIL_DEFAULT_LIMIT,
    SALES_AUDIT_TRAIL_MAX_LIMIT,
  );

  return prisma.salesAuditEvent.findMany({
    where: buildSalesAuditTrailWhere(organizationId, filters),
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(filters.cursor
      ? {
          skip: 1,
          cursor: { id: filters.cursor },
        }
      : {}),
    select: {
      id: true,
      action: true,
      actorId: true,
      actorName: true,
      targetType: true,
      targetId: true,
      metadata: true,
      createdAt: true,
    },
  });
}

const ACTION_LABELS_AR: Record<string, string> = {
  [SalesAuditActions.DEAL_CREATED]: "\u0625\u0646\u0634\u0627\u0621 \u0635\u0641\u0642\u0629",
  [SalesAuditActions.DEAL_UPDATED]: "\u062a\u062d\u062f\u064a\u062b \u0635\u0641\u0642\u0629",
  [SalesAuditActions.DEAL_STAGE_CHANGED]: "\u062a\u063a\u064a\u064a\u0631 \u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u0635\u0641\u0642\u0629",
  [SalesAuditActions.DEAL_STATUS_CHANGED]: "\u062a\u063a\u064a\u064a\u0631 \u062d\u0627\u0644\u0629 \u0627\u0644\u0635\u0641\u0642\u0629",
  [SalesAuditActions.DEAL_NEXT_ACTION_SET]: "\u062a\u0639\u064a\u064a\u0646 \u0627\u0644\u0625\u062c\u0631\u0627\u0621 \u0627\u0644\u062a\u0627\u0644\u064a",
  [SalesAuditActions.ACCOUNT_CREATED]: "\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628",
  [SalesAuditActions.ACCOUNT_UPDATED]: "\u062a\u062d\u062f\u064a\u062b \u062d\u0633\u0627\u0628",
  [SalesAuditActions.ACCOUNT_VIEWED]: "\u0639\u0631\u0636 \u062d\u0633\u0627\u0628",
  [SalesAuditActions.PIPELINE_VIEWED]: "\u0639\u0631\u0636 \u0627\u0644\u0645\u0633\u0627\u0631",
  [SalesAuditActions.EVIDENCE_LINKED]: "\u0631\u0628\u0637 \u062f\u0644\u064a\u0644",
  [SalesAuditActions.EVIDENCE_UNLINKED]: "\u0625\u0644\u063a\u0627\u0621 \u0631\u0628\u0637 \u062f\u0644\u064a\u0644",
  [SalesAuditActions.INTERACTION_CREATED]: "\u0625\u0646\u0634\u0627\u0621 \u062a\u0641\u0627\u0639\u0644",
  [SalesAuditActions.INTERACTION_UPDATED]: "\u062a\u062d\u062f\u064a\u062b \u062a\u0641\u0627\u0639\u0644",
  [SalesAuditActions.INTERACTION_DELETED]: "\u062d\u0630\u0641 \u062a\u0641\u0627\u0639\u0644",
  [SalesAuditActions.SIGNAL_CREATED]: "\u0625\u0646\u0634\u0627\u0621 \u0625\u0634\u0627\u0631\u0629",
  [SalesAuditActions.OUTREACH_DRAFT_CREATED]: "\u0645\u0633\u0648\u062f\u0629 outreach",
  [SalesAuditActions.OUTREACH_REVIEWED]: "\u0645\u0631\u0627\u062c\u0639\u0629 outreach",
  [SalesAuditActions.GOVERNANCE_OVERRIDE]: "\u062a\u062c\u0627\u0648\u0632 \u062d\u0648\u0643\u0645\u0629",
  [SalesAuditActions.GOVERNANCE_REVIEW_DECISION]: "\u0642\u0631\u0627\u0631 \u0645\u0631\u0627\u062c\u0639\u0629",
  [SalesAuditActions.REPORTS_VIEWED]: "\u0639\u0631\u0636 \u062a\u0642\u0631\u064a\u0631",
};

export function salesAuditActionLabelAr(action: string): string {
  return ACTION_LABELS_AR[action] ?? action;
}

export function resolveSalesAuditTargetHref(
  targetType: string,
  targetId: string,
): string | null {
  if (targetType === "SalesDeal") {
    return `/sales/deals/${targetId}`;
  }
  if (targetType === "SalesAccount") {
    return `/sales/accounts/${targetId}`;
  }
  return null;
}
