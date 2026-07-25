import "server-only";
import { SALESOS_PRODUCT_KEY } from "@/products/sales/product-definition";
import { normalizeSalesEventType, resolveSalesTenantId } from "./common";
import type { SalesAuditActor, SalesLocalAuditCacheEntry } from "./types";
import { mapSalesAuditCategoryToPlatform, resolveSalesEventType } from "./mapping";
import { writeCoreSalesAuditEvent } from "./writer";

// NOTE: Feature planned for v0.2 — see docs/strategy/AQLIYA_STRATEGIC_ROADMAP.md
async function recordAuditEventSafe(_input: {
  category: string;
  productSlug: string;
  action: string;
  actorId: string;
  organizationId: string;
  platformOrganizationId?: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  persist?: boolean;
}): Promise<void> {
  // noop
}

export async function recordSalesAuditEvent(input: {
  user: SalesAuditActor;
  eventType: string;
  resourceType: string;
  resourceId: string;
  summary: string;
  accountId?: string;
  opportunityId?: string;
  metadata?: Record<string, unknown>;
  changes?: Record<string, { from: unknown; to: unknown }>;
  correlationId?: string;
  cacheContract?: boolean;
  onLocalCache?: (entry: SalesLocalAuditCacheEntry) => void;
}): Promise<void> {
  const eventType = normalizeSalesEventType(input.eventType);
  const metadata = {
    ...input.metadata,
    ...(input.accountId && { accountId: input.accountId }),
    ...(input.opportunityId && { opportunityId: input.opportunityId }),
  };

  try {
    await writeCoreSalesAuditEvent({
      tenantId: resolveSalesTenantId(input.user),
      eventType,
      actorId: input.user.id,
      actorRole: input.user.role ?? "OPERATOR",
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      summary: input.summary,
      metadata,
      changes: input.changes,
      correlationId: input.correlationId,
      accountId: input.accountId,
      opportunityId: input.opportunityId,
    });

    if (input.cacheContract !== false) {
      recordAuditEventSafe({
        category: mapSalesAuditCategoryToPlatform(eventType),
        productSlug: SALESOS_PRODUCT_KEY,
        action: eventType,
        actorId: input.user.id,
        organizationId: input.user.organizationId,
        platformOrganizationId: input.user.platformOrganizationId,
        targetType: input.resourceType,
        targetId: input.resourceId,
        metadata,
        persist: true,
      });
    }

    input.onLocalCache?.({
      organizationId: input.user.organizationId,
      action: eventType,
      actorId: input.user.id,
      targetType: input.resourceType,
      targetId: input.resourceId,
      metadata,
    });
  } catch {
    // Unified audit path is fail-soft — must never block callers
  }
}

export async function recordSalesMutationAudit(
  user: SalesAuditActor,
  mutation: "create" | "update" | "transition" | "export" | "ai",
  resourceType: string,
  resourceId: string,
  details?: Record<string, unknown>,
  onLocalCache?: (entry: SalesLocalAuditCacheEntry) => void,
): Promise<void> {
  const eventType = resolveSalesEventType({ mutation, resourceType, details });
  await recordSalesAuditEvent({
    user,
    eventType,
    resourceType,
    resourceId,
    summary: `Sales ${resourceType} ${mutation}`,
    accountId: details?.accountId as string | undefined,
    opportunityId: details?.opportunityId as string | undefined,
    metadata: details,
    onLocalCache,
  });
}
