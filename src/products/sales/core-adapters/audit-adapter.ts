import "server-only";
import { PrismaAuditLedger } from "@/core/audit/audit-ledger-prisma";
import type {
  AuditEventCategory,
  AuditEventSeverity,
} from "@/core/audit/types";
// SALESOS_PLACEHOLDER: inline type — implement when @/lib/platform/contracts/audit-event-contract exists
type PlatformAuditCategory =
  | "financial"
  | "compliance"
  | "operational"
  | "security"
  | "workflow_transition"
  | "data_change"
  | "ai_action"
  | "user_action"
  | "ai_execution"
  | "evidence"
  | "output"
  | "review"
  | "approval";

// SALESOS_PLACEHOLDER: TODO: implement when @/lib/platform/contracts/audit-trail-runtime exists
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
import { SALESOS_PRODUCT_KEY } from "@/products/sales/product-definition";

const ledger = new PrismaAuditLedger();

export const SALES_CORE_AUDIT_PREFIXES = [
  "sales.account.",
  "sales.opportunity.",
  "sales.intelligence.",
  "sales.proof.",
  "sales.output.",
  "sales.recommendation.",
  "sales.review.",
  "sales.approval.",
] as const;

export type SalesAuditActor = {
  id: string;
  role?: string;
  organizationId: string;
  platformOrganizationId?: string;
};

export type SalesLocalAuditCacheEntry = {
  organizationId: string;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
};

export function mapSalesAuditCategory(eventType: string): AuditEventCategory {
  if (eventType.startsWith("sales.account.")) return "mutation";
  if (eventType.startsWith("sales.opportunity.")) return "mutation";
  if (eventType.startsWith("sales.intelligence.")) return "ai";
  if (eventType.startsWith("sales.proof.")) return "evidence";
  if (eventType.startsWith("sales.output.")) return "export";
  if (eventType.startsWith("sales.recommendation.")) return "governance";
  if (eventType.startsWith("sales.review.")) return "review";
  if (eventType.startsWith("sales.approval.")) return "approval";
  if (eventType === "sales.opportunity.submitted_for_review") return "review";
  if (eventType === "sales.opportunity.approved") return "approval";
  if (eventType.startsWith("sales.evidence.")) return "evidence";
  return "system";
}

/** Maps sales.* event types to platform audit-trail contract categories. */
export function mapSalesAuditCategoryToPlatform(
  eventType: string,
): PlatformAuditCategory {
  const normalized = normalizeSalesEventType(eventType);
  if (normalized.startsWith("sales.intelligence.")) return "ai_execution";
  if (normalized.startsWith("sales.proof.")) return "evidence";
  if (normalized.startsWith("sales.output.")) return "output";
  if (normalized.startsWith("sales.review.")) return "review";
  if (normalized.startsWith("sales.approval.")) return "approval";
  if (normalized.startsWith("sales.recommendation.")) return "workflow_transition";
  if (
    normalized.startsWith("sales.account.") ||
    normalized.startsWith("sales.opportunity.")
  ) {
    return "workflow_transition";
  }
  return "workflow_transition";
}

/** Alias kept for barrel exports and legacy imports. */
export const mapSalesToContractCategory = mapSalesAuditCategoryToPlatform;

function mapSeverity(eventType: string): AuditEventSeverity {
  if (eventType.includes("reject") || eventType.includes("blocked"))
    return "warning";
  if (eventType.includes("approve") || eventType.includes("approved"))
    return "info";
  if (eventType.includes("error") || eventType.includes("fail")) return "error";
  return "info";
}

export function normalizeSalesEventType(eventType: string): string {
  if (eventType === "sales.opportunity.submitted_for_review")
    return "sales.review.submitted";
  if (eventType === "sales.opportunity.approved")
    return "sales.approval.approved";
  if (eventType === "sales.evidence.linked") return "sales.proof.linked";
  if (eventType === "evidence.linked") return "sales.proof.linked";
  if (eventType.startsWith("sales.")) return eventType;
  return eventType;
}

export function resolveSalesTenantId(user: {
  organizationId: string;
  platformOrganizationId?: string;
}): string {
  return user.platformOrganizationId ?? user.organizationId;
}

export function resolveSalesEventType(input: {
  mutation: "create" | "update" | "transition" | "export" | "ai";
  resourceType: string;
  explicitAction?: string;
  details?: Record<string, unknown>;
}): string {
  if (input.explicitAction)
    return normalizeSalesEventType(input.explicitAction);
  const { mutation, resourceType, details } = input;
  switch (resourceType) {
    case "SalesAccount":
      return mutation === "create"
        ? "sales.account.created"
        : "sales.account.updated";
    case "SalesOpportunity":
      if (mutation === "create") return "sales.opportunity.created";
      if (mutation === "transition") {
        if (details?.approvalStatus === "Approved")
          return "sales.approval.approved";
        if (details?.reviewStatus && details.reviewStatus !== "Draft") {
          return "sales.review.submitted";
        }
        return "sales.opportunity.stage_changed";
      }
      return "sales.opportunity.updated";
    case "SalesInteractionLog":
      return "sales.intelligence.interaction_logged";
    case "SalesEvidenceRef":
      return "sales.proof.linked";
    case "SalesOutput":
      return mutation === "export"
        ? "sales.output.exported"
        : "sales.output.queued";
    case "SalesRecommendation":
      return "sales.recommendation.persisted";
    default:
      return (
        "sales." +
        resourceType.replace(/^Sales/, "").toLowerCase() +
        "." +
        mutation
      );
  }
}

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

/**
 * Unified SalesOS audit path: Core PlatformAuditEvent primary,
 * platform audit logger best-effort, optional local store cache.
 */
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
  /** Mirror to in-memory contract buffer (default true). */
  cacheContract?: boolean;
  /** Optional local store cache callback (e.g. appendAuditEntry). */
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
