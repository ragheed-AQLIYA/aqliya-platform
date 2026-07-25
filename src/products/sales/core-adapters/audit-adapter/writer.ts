import "server-only";
import { PrismaAuditLedger } from "@/lib/core/audit/audit-ledger-prisma";
import { SALESOS_PRODUCT_KEY } from "@/products/sales/product-definition";
import { normalizeSalesEventType } from "./common";
import { mapSalesAuditCategory, mapSeverity } from "./mapping";

const ledger = new PrismaAuditLedger();

export async function writeCoreSalesAuditEvent(params: {
  tenantId: string;
  eventType: string;
  actorId: string;
  actorRole: string;
  resourceType: string;
  resourceId: string;
  summary: string;
  metadata?: Record<string, unknown>;
  changes?: Record<string, { from: unknown; to: unknown }>;
  correlationId?: string;
  accountId?: string;
  opportunityId?: string;
}): Promise<void> {
  const eventType = normalizeSalesEventType(params.eventType);
  try {
    await ledger.write({
      tenantId: params.tenantId,
      productKey: SALESOS_PRODUCT_KEY,
      action: eventType,
      actorId: params.actorId,
      actorRole: params.actorRole,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      category: mapSalesAuditCategory(eventType),
      severity: mapSeverity(eventType),
      summary: params.summary,
      metadata: {
        ...params.metadata,
        ...(params.accountId && { accountId: params.accountId }),
        ...(params.opportunityId && { opportunityId: params.opportunityId }),
      },
      changes: params.changes,
      ipAddress: undefined,
      userAgent: undefined,
      sessionId: undefined,
      correlationId: params.correlationId,
    });
  } catch {
    // Core ledger failure must never affect the primary action
  }
}

export function getAuditLedger(): PrismaAuditLedger {
  return ledger;
}
