import "server-only";

import { prisma } from "@/lib/prisma";
import { CORE_ENGINE_KEYS } from "@/lib/core/registry-types";
import { collectProductActivities } from "@/lib/platform/operations/unified-activity-runtime";
import type { ActivityStreamEntry } from "@/lib/platform/operations/activity-stream";
import { isOutboxEnabled } from "@/lib/core/events/outbox-service";
import { CORE_EVENT_SCHEMA_VERSION } from "@/lib/core/contracts/event-envelope";
import { listEventSchemas } from "@/lib/core/events/schema-registry";
import { getAbacShadowMismatchReport } from "@/core/access/abac-shadow-report";

export type IntelligenceWorkspaceSnapshot = {
  coreEngineCount: number;
  coreEngines: readonly string[];
  memory: {
    graphNodes: number;
    events30d: number;
  };
  aiActivity24h: number;
  productSignals: Record<string, number>;
  auditFeed: Array<{
    id: string;
    action: string;
    productKey: string;
    actorName: string | null;
    targetLabel: string | null;
    createdAt: Date;
  }>;
  liveActivities: ActivityStreamEntry[];
  outbox: {
    enabled: boolean;
    pending: number;
    failed: number;
  };
  eventRegistry: {
    schemaVersion: string;
    registeredTypes: number;
  };
  abac: {
    shadowEvaluations30d: number;
    mismatchRate30d: number;
    enforceEnabled: boolean;
    readyForEnforcePilot: boolean;
    recommendation: string;
  };
};

export async function getIntelligenceWorkspaceSnapshot(
  organizationId: string,
  userId: string,
): Promise<IntelligenceWorkspaceSnapshot> {
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    graphNodes,
    memoryEvents30d,
    aiActivity24h,
    auditFeed,
    signalRows,
    liveActivities,
    outboxPending,
    outboxFailed,
    abacReport,
  ] = await Promise.all([
    prisma.intelligenceGraphNode.count({ where: { organizationId } }),
    prisma.institutionalMemoryEvent.count({
      where: { organizationId, createdAt: { gte: since30d } },
    }),
    prisma.officeAiTask.count({
      where: { platformOrganizationId: organizationId, createdAt: { gte: since24h } },
    }),
    prisma.platformAuditLog.findMany({
      where: { platformOrganizationId: organizationId },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        action: true,
        productKey: true,
        actorName: true,
        targetLabel: true,
        createdAt: true,
      },
    }),
    prisma.platformAuditLog.groupBy({
      by: ["productKey"],
      where: { platformOrganizationId: organizationId, createdAt: { gte: since30d } },
      _count: { _all: true },
    }),
    collectProductActivities(organizationId, userId),
    isOutboxEnabled()
      ? prisma.platformOutboxEvent.count({
          where: { organizationId, status: "pending" },
        })
      : Promise.resolve(0),
    isOutboxEnabled()
      ? prisma.platformOutboxEvent.count({
          where: { organizationId, status: "failed" },
        })
      : Promise.resolve(0),
    getAbacShadowMismatchReport(organizationId, 30),
  ]);

  const productSignals: Record<string, number> = {};
  for (const row of signalRows) {
    productSignals[row.productKey] = row._count._all;
  }

  return {
    coreEngineCount: CORE_ENGINE_KEYS.length,
    coreEngines: CORE_ENGINE_KEYS,
    memory: { graphNodes, events30d: memoryEvents30d },
    aiActivity24h,
    productSignals,
    auditFeed,
    liveActivities,
    outbox: {
      enabled: isOutboxEnabled(),
      pending: outboxPending,
      failed: outboxFailed,
    },
    eventRegistry: {
      schemaVersion: CORE_EVENT_SCHEMA_VERSION,
      registeredTypes: listEventSchemas().length,
    },
    abac: {
      shadowEvaluations30d: abacReport.totalEvaluations,
      mismatchRate30d: abacReport.mismatchRate,
      enforceEnabled: abacReport.enforce.enabled,
      readyForEnforcePilot: abacReport.enforce.readyForPilot,
      recommendation: abacReport.enforce.recommendation,
    },
  };
}
