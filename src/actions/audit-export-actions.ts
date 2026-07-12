"use server";

import {
  recordAuditEvent as svcRecordAuditEvent,
} from "@/lib/audit/services";
import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import { enforceAuditRateLimit } from "@/lib/audit/rate-limit";
import { assertFactoryApprovalGatesPass } from "@/lib/audit/governance";

export async function exportFinancialStatementsAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  await assertFactoryApprovalGatesPass(engagementId);
  await enforceAuditRateLimit(actor, "export_financial_statements", "export");
  const { exportFinancialStatements } =
    await import("@/lib/audit/export-service");
  const pkg = await exportFinancialStatements(engagementId);
  await svcRecordAuditEvent({
    engagementId,
    eventType: "export.financial_statements_generated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "engagement",
    targetId: engagementId,
    newState: "exported",
    description: `Financial statements exported (${pkg.statements.length} statements, ${pkg.notes.length} notes)`,
    metadata: { exportType: "financial_statements", status: pkg.status },
  });
  return pkg;
}

export async function exportAuditFileAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  await assertFactoryApprovalGatesPass(engagementId);
  await enforceAuditRateLimit(actor, "export_audit_file", "export");
  const { exportAuditFile } = await import("@/lib/audit/export-service");
  const pkg = await exportAuditFile(engagementId);
  await svcRecordAuditEvent({
    engagementId,
    eventType: "export.audit_file_generated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "engagement",
    targetId: engagementId,
    newState: "exported",
    description: `Audit file exported (${pkg.auditFile?.evidenceChecklist.length ?? 0} evidence items, ${pkg.auditFile?.findings.length ?? 0} findings)`,
    metadata: { exportType: "audit_file", status: pkg.status },
  });
  return pkg;
}

export async function exportBilingualAction(
  engagementId: string,
  locale: "en" | "ar" | "bilingual",
) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  await assertFactoryApprovalGatesPass(engagementId);
  await enforceAuditRateLimit(actor, "export_bilingual", "export");
  const { exportBilingual } = await import("@/lib/audit/export-service");
  const pkg = await exportBilingual(engagementId, locale);
  await svcRecordAuditEvent({
    engagementId,
    eventType: "export.financial_statements_generated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "engagement",
    targetId: engagementId,
    newState: "exported",
    description: `Bilingual export generated (${locale})`,
    metadata: { exportType: "bilingual", locale },
  });
  return pkg;
}
