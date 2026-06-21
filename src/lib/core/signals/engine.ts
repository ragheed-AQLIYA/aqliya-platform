import "server-only";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type { RuntimeSignal, RuntimeSignalSeverity } from "./types";

export interface SignalEngineProduceInput {
  organizationId: string;
  productSlug: string;
  action: string;
  severity?: RuntimeSignalSeverity;
  summaryEn?: string;
  summaryAr?: string;
  resourceId: string;
  resourceType: string;
  kind?: string;
  metadata?: Record<string, unknown>;
}

export interface SignalEngineAckInput {
  signalId: string;
  organizationId: string;
  acknowledgedBy: string;
  notes?: string;
}

export interface SignalEngineResolveInput {
  signalId: string;
  organizationId: string;
  resolvedBy: string;
  resolution?: string;
}

export const SignalEngine = {
  /**
   * Produce a signal — audit-logged cross-product notification.
   * Returns the generated signal object.
   */
  async produce(
    input: SignalEngineProduceInput,
  ): Promise<RuntimeSignal> {
    const signal: RuntimeSignal = {
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: input.organizationId,
      productSlug: input.productSlug,
      action: input.action,
      severity: input.severity ?? "info",
      summaryEn: input.summaryEn,
      summaryAr: input.summaryAr,
      resourceId: input.resourceId,
      resourceType: input.resourceType,
      kind: input.kind,
      timestamp: new Date().toISOString(),
      metadata: input.metadata,
    };

    await writePlatformAuditLog({
      productKey: input.productSlug,
      action: `signal.produced.${input.action}`,
      platformOrganizationId: input.organizationId,
      severity: input.severity ?? "info",
      status: "recorded",
      sourceSystem: "signal_engine",
      targetType: input.resourceType,
      targetId: input.resourceId,
      metadata: {
        signalId: signal.id,
        kind: input.kind,
        summaryEn: input.summaryEn,
        summaryAr: input.summaryAr,
      },
    }).catch(() => {});

    return signal;
  },

  /**
   * Acknowledge a signal — marks it as seen by a user.
   */
  async acknowledge(
    input: SignalEngineAckInput,
  ): Promise<void> {
    await writePlatformAuditLog({
      productKey: "platform",
      action: "signal.acknowledged",
      platformOrganizationId: input.organizationId,
      actorId: input.acknowledgedBy,
      severity: "info",
      status: "recorded",
      sourceSystem: "signal_engine",
      targetType: "signal",
      targetId: input.signalId,
      metadata: { notes: input.notes },
    }).catch(() => {});
  },

  /**
   * Resolve a signal — marks it as closed/completed.
   */
  async resolve(
    input: SignalEngineResolveInput,
  ): Promise<void> {
    await writePlatformAuditLog({
      productKey: "platform",
      action: "signal.resolved",
      platformOrganizationId: input.organizationId,
      actorId: input.resolvedBy,
      severity: "info",
      status: "recorded",
      sourceSystem: "signal_engine",
      targetType: "signal",
      targetId: input.signalId,
      metadata: { resolution: input.resolution },
    }).catch(() => {});
  },
};
