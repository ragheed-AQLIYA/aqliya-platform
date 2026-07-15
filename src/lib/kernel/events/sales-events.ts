import { publishDomainEvent } from "../publish";

export const SALES_EVENTS = {
  DEAL_CREATED: "deal.created",
  DEAL_STAGE_CHANGED: "deal.stage_changed",
  DEAL_STATUS_CHANGED: "deal.status_changed",
  DEAL_WON: "deal.won",
  DEAL_LOST: "deal.lost",
} as const;

export type SalesEventAction =
  (typeof SALES_EVENTS)[keyof typeof SALES_EVENTS];

export async function publishSalesEvent(
  action: SalesEventAction,
  params: {
    actorId: string;
    organizationId: string;
    resourceId: string;
    resourceType?: string;
    metadata?: Record<string, unknown>;
    correlationId?: string;
  },
): Promise<void> {
  await publishDomainEvent({
    productSlug: "salesos",
    domain: "sales",
    action,
    actorId: params.actorId,
    organizationId: params.organizationId,
    resourceType: params.resourceType ?? "SalesDeal",
    resourceId: params.resourceId,
    correlationId: params.correlationId ?? "",
    metadata: params.metadata,
  });
}
