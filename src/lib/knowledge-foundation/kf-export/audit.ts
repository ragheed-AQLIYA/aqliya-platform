import "server-only";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

export async function recordExportAudit(input: {
  versionId: string;
  versionNumber: string;
  format: "pdf" | "json";
  actorId: string;
  actorName?: string;
  platformOrganizationId?: string;
}): Promise<void> {
  await writePlatformAuditLog(
    {
      productKey: "knowledge_foundation",
      action: "knowledge.foundation.exported",
      actorId: input.actorId,
      actorName: input.actorName,
      targetType: "KnowledgeFoundationVersion",
      targetId: input.versionId,
      targetLabel: `v${input.versionNumber}`,
      sourceSystem: "knowledge_foundation",
      severity: "info",
      status: "recorded",
      metadata: {
        versionNumber: input.versionNumber,
        exportFormat: input.format,
        exportedAt: new Date().toISOString(),
      },
    },
    { strict: false },
  );
}
