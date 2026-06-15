import { prisma } from "@/lib/prisma";
import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import {
  REPORTING_GRAPH_EDGE_TYPES,
  REPORTING_GRAPH_ENTITY_TYPES,
  REPORTING_GRAPH_NODE_TYPES,
} from "./graph-constants";
import {
  bumpReportingGraphVersion,
  clearReportingGraphContent,
  ensureReportingGraph,
  upsertGraphEdge,
  upsertGraphNode,
} from "./graph-repository";

export function isReportingGraphEnabled(): boolean {
  return isEnabled("audit.reporting-graph");
}

async function logGraphSync(
  engagementId: string,
  action: string,
  metadata: Record<string, unknown>,
) {
  try {
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: engagementId },
      select: { organizationId: true },
    });
    await writePlatformAuditLog({
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
  } catch (err) {
    console.error(`[ReportingGraph] audit log failed for ${engagementId}`, err);
  }
}

/**
 * Full resync of persisted graph from engagement artifacts.
 * No-op when feature flag off.
 */
export async function syncReportingGraphForEngagement(
  engagementId: string,
  trigger: "tb_upload" | "mapping" | "fs_rebuild" | "manual" = "manual",
): Promise<{ nodeCount: number; edgeCount: number } | null> {
  if (!isReportingGraphEnabled()) return null;

  const graph = await ensureReportingGraph(engagementId);
  await clearReportingGraphContent(graph.id);

  const nodeIdByEntity = new Map<string, string>();
  let edgeCount = 0;

  const registerNode = async (
    nodeType: string,
    entityType: string,
    entityId: string,
    label: string,
    metadata?: Record<string, unknown>,
  ) => {
    const node = await upsertGraphNode({
      graphId: graph.id,
      nodeType,
      entityType,
      entityId,
      label,
      metadata,
    });
    nodeIdByEntity.set(`${entityType}:${entityId}`, node.id);
    return node.id;
  };

  const link = async (
    edgeType: string,
    sourceKey: string,
    targetKey: string,
  ) => {
    const sourceNodeId = nodeIdByEntity.get(sourceKey);
    const targetNodeId = nodeIdByEntity.get(targetKey);
    if (!sourceNodeId || !targetNodeId) return;
    await upsertGraphEdge({
      graphId: graph.id,
      edgeType,
      sourceNodeId,
      targetNodeId,
    });
    edgeCount += 1;
  };

  const tb = await prisma.auditTrialBalance.findFirst({
    where: { engagementId },
    orderBy: { createdAt: "desc" },
    include: { lines: true },
  });

  for (const line of tb?.lines ?? []) {
    await registerNode(
      REPORTING_GRAPH_NODE_TYPES.TB_ACCOUNT,
      REPORTING_GRAPH_ENTITY_TYPES.TRIAL_BALANCE_LINE,
      line.id,
      `${line.accountCode} — ${line.accountName}`,
      {
        accountCode: line.accountCode,
        balance: line.balance,
      },
    );
  }

  const tbByCode = new Map(
    (tb?.lines ?? []).map((l) => [l.accountCode, l.id] as const),
  );

  const mappings = await prisma.auditAccountMapping.findMany({
    where: { engagementId },
    include: { canonicalAccount: true },
  });

  for (const m of mappings) {
    await registerNode(
      REPORTING_GRAPH_NODE_TYPES.MAPPING,
      REPORTING_GRAPH_ENTITY_TYPES.ACCOUNT_MAPPING,
      m.id,
      m.canonicalAccount?.name ?? m.sourceAccountName,
      {
        status: m.status,
        sourceAccountCode: m.sourceAccountCode,
        canonicalCode: m.canonicalAccount?.code,
      },
    );

    const tbLineId = tbByCode.get(m.sourceAccountCode);
    if (tbLineId) {
      await link(
        REPORTING_GRAPH_EDGE_TYPES.MAPS_TO,
        `${REPORTING_GRAPH_ENTITY_TYPES.TRIAL_BALANCE_LINE}:${tbLineId}`,
        `${REPORTING_GRAPH_ENTITY_TYPES.ACCOUNT_MAPPING}:${m.id}`,
      );
    }

    if (m.canonicalAccountId && m.canonicalAccount) {
      await registerNode(
        REPORTING_GRAPH_NODE_TYPES.CANONICAL_ACCOUNT,
        REPORTING_GRAPH_ENTITY_TYPES.CANONICAL_ACCOUNT,
        m.canonicalAccountId,
        `${m.canonicalAccount.code} — ${m.canonicalAccount.name}`,
        { category: m.canonicalAccount.category },
      );
      await link(
        REPORTING_GRAPH_EDGE_TYPES.MAPS_TO,
        `${REPORTING_GRAPH_ENTITY_TYPES.ACCOUNT_MAPPING}:${m.id}`,
        `${REPORTING_GRAPH_ENTITY_TYPES.CANONICAL_ACCOUNT}:${m.canonicalAccountId}`,
      );
    }
  }

  const statements = await prisma.auditFinancialStatement.findMany({
    where: { engagementId },
  });

  for (const fs of statements) {
    await registerNode(
      REPORTING_GRAPH_NODE_TYPES.FS_STATEMENT,
      REPORTING_GRAPH_ENTITY_TYPES.FINANCIAL_STATEMENT,
      fs.id,
      fs.title,
      { statementType: fs.statementType, status: fs.status },
    );

    let rawLines: unknown[] = [];
    try {
      rawLines =
        typeof fs.lines === "string"
          ? JSON.parse(fs.lines)
          : Array.isArray(fs.lines)
            ? fs.lines
            : [];
    } catch {
      rawLines = [];
    }

    for (const raw of rawLines) {
      const row = raw as Record<string, unknown>;
      const lineId = String(row.id ?? "");
      if (!lineId) continue;

      await registerNode(
        REPORTING_GRAPH_NODE_TYPES.FS_LINE,
        REPORTING_GRAPH_ENTITY_TYPES.FS_LINE,
        lineId,
        String(row.label ?? lineId),
        {
          amount: Number(row.amount ?? 0),
          statementId: fs.id,
          isTotal: Boolean(row.isTotal),
        },
      );

      await link(
        REPORTING_GRAPH_EDGE_TYPES.ROLLS_UP_TO,
        `${REPORTING_GRAPH_ENTITY_TYPES.FINANCIAL_STATEMENT}:${fs.id}`,
        `${REPORTING_GRAPH_ENTITY_TYPES.FS_LINE}:${lineId}`,
      );

      const linkedMappings = Array.isArray(row.linkedAccountMappings)
        ? row.linkedAccountMappings.map(String)
        : [];
      for (const mappingId of linkedMappings) {
        await link(
          REPORTING_GRAPH_EDGE_TYPES.PRESENTS_AS,
          `${REPORTING_GRAPH_ENTITY_TYPES.ACCOUNT_MAPPING}:${mappingId}`,
          `${REPORTING_GRAPH_ENTITY_TYPES.FS_LINE}:${lineId}`,
        );
      }
    }
  }

  const leadSchedules = await prisma.leadSchedule.findMany({
    where: { engagementId },
    include: { lines: true, workingPaperIndex: true },
  });

  for (const ls of leadSchedules) {
    await registerNode(
      REPORTING_GRAPH_NODE_TYPES.LEAD_SCHEDULE,
      REPORTING_GRAPH_ENTITY_TYPES.LEAD_SCHEDULE,
      ls.id,
      ls.workingPaperIndex.paperTitle,
      {
        paperNumber: ls.workingPaperIndex.paperNumber,
        accountCode: ls.accountCode,
        currentYearBalance: ls.currentYearBalance,
      },
    );

    for (const line of ls.lines) {
      await registerNode(
        REPORTING_GRAPH_NODE_TYPES.LEAD_SCHEDULE_LINE,
        REPORTING_GRAPH_ENTITY_TYPES.LEAD_SCHEDULE_LINE,
        line.id,
        line.description,
        { amount: line.amount, lineNumber: line.lineNumber },
      );

      await link(
        REPORTING_GRAPH_EDGE_TYPES.ROLLS_UP_TO,
        `${REPORTING_GRAPH_ENTITY_TYPES.LEAD_SCHEDULE}:${ls.id}`,
        `${REPORTING_GRAPH_ENTITY_TYPES.LEAD_SCHEDULE_LINE}:${line.id}`,
      );

      if (line.reference) {
        await link(
          REPORTING_GRAPH_EDGE_TYPES.PRESENTS_AS,
          `${REPORTING_GRAPH_ENTITY_TYPES.ACCOUNT_MAPPING}:${line.reference}`,
          `${REPORTING_GRAPH_ENTITY_TYPES.LEAD_SCHEDULE_LINE}:${line.id}`,
        );
      }
    }
  }

  const notes = await prisma.auditDisclosureNote.findMany({
    where: { engagementId },
  });

  for (const note of notes) {
    await registerNode(
      REPORTING_GRAPH_NODE_TYPES.DISCLOSURE_NOTE,
      REPORTING_GRAPH_ENTITY_TYPES.DISCLOSURE_NOTE,
      note.id,
      `${note.noteNumber} — ${note.title}`,
      { noteType: note.noteType, status: note.status },
    );

    if (note.linkedStatementLine) {
      await link(
        REPORTING_GRAPH_EDGE_TYPES.DISCLOSES,
        `${REPORTING_GRAPH_ENTITY_TYPES.FS_LINE}:${note.linkedStatementLine}`,
        `${REPORTING_GRAPH_ENTITY_TYPES.DISCLOSURE_NOTE}:${note.id}`,
      );
    } else if (statements[0]) {
      await link(
        REPORTING_GRAPH_EDGE_TYPES.DISCLOSES,
        `${REPORTING_GRAPH_ENTITY_TYPES.FINANCIAL_STATEMENT}:${statements[0].id}`,
        `${REPORTING_GRAPH_ENTITY_TYPES.DISCLOSURE_NOTE}:${note.id}`,
      );
    }
  }

  const nodeCount = nodeIdByEntity.size;
  await bumpReportingGraphVersion(graph.id);
  await logGraphSync(engagementId, "reporting_graph.synced", {
    trigger,
    nodeCount,
    edgeCount,
    version: graph.version + 1,
  });

  return { nodeCount, edgeCount };
}

export async function maybeSyncReportingGraphAfterTbUpload(
  engagementId: string,
): Promise<void> {
  try {
    await syncReportingGraphForEngagement(engagementId, "tb_upload");
  } catch (err) {
    console.error(
      `[ReportingGraph] TB upload sync failed for ${engagementId}`,
      err,
    );
  }
}

export async function maybeSyncReportingGraphAfterFsRebuild(
  engagementId: string,
): Promise<void> {
  try {
    await syncReportingGraphForEngagement(engagementId, "fs_rebuild");
  } catch (err) {
    console.error(
      `[ReportingGraph] FS rebuild sync failed for ${engagementId}`,
      err,
    );
  }
}
