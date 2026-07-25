import { prisma } from "./common";
import {
  buildStatementLinesFromMappings,
  type MappingWithCanonical,
} from "./common";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "auditos", action: "financial-rebuild" });

export async function rebuildFinancialStatementsForEngagement(
  engagementId: string,
): Promise<void> {
  let rebuiltViaV2 = false;
  try {
    const { maybeRebuildFinancialStatements } = await import(
      "@/lib/audit/fs-engine"
    );
    rebuiltViaV2 = await maybeRebuildFinancialStatements(engagementId);
  } catch (fsErr) {
    logger.error(
      `[AuditDB] FS v2 rebuild failed for ${engagementId}`,
      fsErr instanceof Error ? fsErr : undefined,
    );
  }

  if (!rebuiltViaV2) {
    const { loadEngagementPresentationContext } = await import(
      "@/lib/audit/presentation/engagement-presentation-config"
    );
    const { enrichMappingsWithErpMap1 } = await import(
      "@/lib/audit/presentation/enrich-mapping-map1"
    );
    const [mappings, existingStatements, presentationContext] = await Promise.all([
      prisma.auditAccountMapping.findMany({
        where: { engagementId },
        include: { canonicalAccount: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.auditFinancialStatement.findMany({ where: { engagementId } }),
      loadEngagementPresentationContext(engagementId),
    ]);

    const enrichedMappings = await enrichMappingsWithErpMap1(
      engagementId,
      mappings as MappingWithCanonical[],
    );

    const titles: Record<string, string> = {
      income_statement: "Statement of Profit or Loss",
      balance_sheet: "Statement of Financial Position",
      equity: "Statement of Changes in Equity",
    };

    for (const statementType of [
      "income_statement",
      "balance_sheet",
      "equity",
    ] as const) {
      const existing = existingStatements.find(
        (statement) => statement.statementType === statementType,
      );
      const statementId = existing?.id ?? `fs-${statementType}-${engagementId}`;
      const lines = buildStatementLinesFromMappings(
        statementId,
        statementType,
        enrichedMappings,
        {
          presentationProfile: presentationContext.presentationProfile,
          presentationPolicy: presentationContext.policy,
        },
      );
      if (existing) {
        await prisma.auditFinancialStatement.update({
          where: { id: existing.id },
          data: { lines: lines as unknown as object },
        });
      } else {
        await prisma.auditFinancialStatement.create({
          data: {
            id: statementId,
            engagementId,
            statementType,
            title: titles[statementType],
            status: "draft",
            lines: lines as unknown as object,
          },
        });
      }
    }
  }

  try {
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: engagementId },
      select: { organizationId: true },
    });
    const { maybeRunAuditIntelligenceAfterDisclosure } = await import(
      "@/lib/audit/intelligence"
    );
    await maybeRunAuditIntelligenceAfterDisclosure(
      engagementId,
      engagement?.organizationId,
    );
  } catch (intelErr) {
    logger.error(
      `[AuditDB] audit intelligence hook failed for ${engagementId}`,
      intelErr instanceof Error ? intelErr : undefined,
    );
  }

  try {
    const { maybeGenerateLeadSchedules, isLeadScheduleAutoEnabled } =
      await import("@/lib/audit/lead-schedule");
    if (isLeadScheduleAutoEnabled()) {
      await maybeGenerateLeadSchedules(engagementId, "mapping_confirm");
    } else {
      const { maybeSyncReportingGraphAfterFsRebuild } = await import(
        "@/lib/audit/reporting-graph/graph-sync-service"
      );
      await maybeSyncReportingGraphAfterFsRebuild(engagementId);
    }
  } catch (hookErr) {
    logger.error(
      `[AuditDB] lead schedule / graph hook failed for ${engagementId}`,
      hookErr instanceof Error ? hookErr : undefined,
    );
  }

  try {
    const { maybeRunReconciliationAfterPipeline } = await import(
      "@/lib/audit/reconciliation"
    );
    await maybeRunReconciliationAfterPipeline(engagementId);
  } catch (reconErr) {
    logger.error(
      `[AuditDB] reconciliation hook failed for ${engagementId}`,
      reconErr instanceof Error ? reconErr : undefined,
    );
  }

  try {
    const { maybeRunIfrsRulesAfterFsRebuild } = await import(
      "@/lib/audit/rules"
    );
    await maybeRunIfrsRulesAfterFsRebuild(engagementId);
  } catch (ifrsErr) {
    logger.error(
      `[AuditDB] IFRS rules hook failed for ${engagementId}`,
      ifrsErr instanceof Error ? ifrsErr : undefined,
    );
  }

  try {
    const { maybeRunSocpaRulesAfterFsRebuild } = await import(
      "@/lib/audit/rules"
    );
    await maybeRunSocpaRulesAfterFsRebuild(engagementId);
  } catch (socpaErr) {
    logger.error(
      `[AuditDB] SOCPA rules hook failed for ${engagementId}`,
      socpaErr instanceof Error ? socpaErr : undefined,
    );
  }

  try {
    const { maybeRunIsaRulesAfterFsRebuild } = await import(
      "@/lib/audit/rules"
    );
    await maybeRunIsaRulesAfterFsRebuild(engagementId);
  } catch (isaErr) {
    logger.error(
      `[AuditDB] ISA rules hook failed for ${engagementId}`,
      isaErr instanceof Error ? isaErr : undefined,
    );
  }

  try {
    const { maybeAutoGenerateDisclosureNotes } = await import(
      "@/lib/audit/notes/disclosure-auto"
    );
    await maybeAutoGenerateDisclosureNotes(engagementId);
  } catch (disclosureErr) {
    logger.error(
      `[AuditDB] disclosure auto hook failed for ${engagementId}`,
      disclosureErr instanceof Error ? disclosureErr : undefined,
    );
  }
}
