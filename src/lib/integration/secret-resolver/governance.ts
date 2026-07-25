import "server-only";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { incrementCounter } from "@/lib/integration/metrics";
import { GOVERNANCE_PRODUCT_KEY } from "./common";
import type { GovernanceSecretEvent, OperationalSecretEvent } from "./common";

/**
 * Emit a governance audit event for secret lifecycle operations.
 * These go to PlatformAuditLog — the official audit trail.
 * No secret values are ever written to audit logs.
 */
export async function recordGovernanceEvent(
  event: GovernanceSecretEvent,
  params: {
    organizationId: string;
    integrationId?: string;
    provider?: string;
    type?: string;
    vaultEntryKey?: string;
    version?: number;
    performedById?: string;
    purpose?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await writePlatformAuditLog({
    productKey: GOVERNANCE_PRODUCT_KEY,
    action: event,
    actorId: params.performedById,
    targetType: "TenantIntegration",
    targetId: params.integrationId ?? params.vaultEntryKey,
    targetLabel: `${params.type ?? "unknown"}/${params.provider ?? "unknown"}`,
    severity: event === "SECRET_REVOKED" ? "warning" : "info",
    metadata: {
      organizationId: params.organizationId,
      integrationId: params.integrationId,
      provider: params.provider,
      type: params.type,
      vaultEntryKey: params.vaultEntryKey,
      version: params.version,
      purpose: params.purpose,
      ...params.metadata,
    },
  });
}

/**
 * Emit an operational telemetry counter for secret access.
 * These are metrics counters — NOT audit trail events.
 */
export function emitTelemetryEvent(
  event: OperationalSecretEvent,
  labels: {
    organizationId: string;
    integrationType?: string;
    provider?: string;
    purpose?: string;
    result: string;
    source?: string;
  },
): void {
  incrementCounter(event, {
    organizationId: labels.organizationId,
    integrationType: labels.integrationType,
    provider: labels.provider,
    purpose: labels.purpose,
    result: labels.result,
    source: labels.source,
  });
}
