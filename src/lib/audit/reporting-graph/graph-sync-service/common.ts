import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/observability/logger";
import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";

const logger = createLogger({ product: "platform", action: "unknown" });

export type RegisterNodeFn = (
  nodeType: string,
  entityType: string,
  entityId: string,
  label: string,
  metadata?: Record<string, unknown>,
) => Promise<string>;

export type LinkFn = (
  edgeType: string,
  sourceKey: string,
  targetKey: string,
) => Promise<void>;

export function isReportingGraphEnabled(): boolean {
  return isEnabled("audit.reporting-graph");
}

export async function logGraphSync(
  engagementId: string,
  action: string,
  metadata: Record<string, unknown>,
) {
  try {
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: engagementId },
      select: { organizationId: true },
    });
    const platformResult = await writePlatformAuditLog({
      productKey: "auditos",
      action,
      targetType: "reporting_graph",
      targetId: engagementId,
      severity: "info",
      status: "recorded",
      sourceSystem: "reporting_graph_sync",
      sourceModel: "graph_v1",
      metadata: {
        organizationId: engagement?.organizationId,
        ...metadata,
      } as Record<string, unknown>,
    });
    if (platformResult?.ok && platformResult?.id) {
      await appendToAuditChain(
        platformResult.id,
        action,
        "system",
        new Date(),
      );
    }
  } catch (err) {
    logger.error(`[ReportingGraph] audit log failed for ${engagementId}`, err instanceof Error ? err : undefined);
  }
}
