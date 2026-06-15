import {
  PERSISTED_NODE_LAYER,
  REPORTING_GRAPH_NODE_TYPES,
} from "./graph-constants";
import { loadPersistedGraphWithRelations } from "./graph-repository";
import type { ReportingGraph, ReportingGraphStats } from "./types";

const LAYER_BY_NODE_TYPE: Record<string, number> = {
  ...PERSISTED_NODE_LAYER,
  engagement: 0,
  tb_root: 1,
};

export async function loadReportingGraphFromStore(
  engagementId: string,
): Promise<ReportingGraph | null> {
  const stored = await loadPersistedGraphWithRelations(engagementId);
  if (!stored || stored.nodes.length === 0) return null;

  const nodes = [
    {
      id: `eng-${engagementId}`,
      nodeType: "engagement" as const,
      label: "Financial Statement Factory",
      labelAr: "مصنع القوائم المالية",
      layer: 0,
    },
    {
      id: "tb-root",
      nodeType: "tb_root" as const,
      label: "Trial Balance",
      labelAr: "ميزان المراجعة",
      layer: 1,
    },
    ...stored.nodes.map((n) => ({
      id: `pg-${n.id}`,
      nodeType: mapPersistedNodeType(n.nodeType),
      label: n.label,
      layer: LAYER_BY_NODE_TYPE[n.nodeType] ?? 4,
      entityId: n.entityId,
      metadata: (n.metadata ?? undefined) as Record<string, unknown> | undefined,
    })),
  ];

  const prismaIdToViewId = new Map(
    stored.nodes.map((n) => [n.id, `pg-${n.id}`] as const),
  );

  const edges = stored.edges.map((e) => ({
    id: `pe-${e.id}`,
    edgeType: mapPersistedEdgeType(e.edgeType),
    sourceId: prismaIdToViewId.get(e.sourceNodeId) ?? e.sourceNodeId,
    targetId: prismaIdToViewId.get(e.targetNodeId) ?? e.targetNodeId,
  }));

  edges.unshift({
    id: "pe-eng-tb",
    edgeType: "flows_to",
    sourceId: `eng-${engagementId}`,
    targetId: "tb-root",
  });

  for (const n of stored.nodes.filter(
    (x) => x.nodeType === REPORTING_GRAPH_NODE_TYPES.TB_ACCOUNT,
  )) {
    edges.push({
      id: `pe-tb-${n.id}`,
      edgeType: "flows_to",
      sourceId: "tb-root",
      targetId: `pg-${n.id}`,
    });
  }

  const stats: ReportingGraphStats = {
    tbAccounts: stored.nodes.filter(
      (n) => n.nodeType === REPORTING_GRAPH_NODE_TYPES.TB_ACCOUNT,
    ).length,
    mappings: stored.nodes.filter(
      (n) => n.nodeType === REPORTING_GRAPH_NODE_TYPES.MAPPING,
    ).length,
    statements: stored.nodes.filter(
      (n) => n.nodeType === REPORTING_GRAPH_NODE_TYPES.FS_STATEMENT,
    ).length,
    fsLines: stored.nodes.filter(
      (n) => n.nodeType === REPORTING_GRAPH_NODE_TYPES.FS_LINE,
    ).length,
    notes: stored.nodes.filter(
      (n) => n.nodeType === REPORTING_GRAPH_NODE_TYPES.DISCLOSURE_NOTE,
    ).length,
    edges: edges.length,
  };

  return {
    engagementId,
    nodes,
    edges,
    stats,
    builtAt: stored.updatedAt.toISOString(),
    graphVersion: 1,
  };
}

function mapPersistedNodeType(
  nodeType: string,
): ReportingGraph["nodes"][number]["nodeType"] {
  switch (nodeType) {
    case REPORTING_GRAPH_NODE_TYPES.TB_ACCOUNT:
      return "tb_account";
    case REPORTING_GRAPH_NODE_TYPES.MAPPING:
    case REPORTING_GRAPH_NODE_TYPES.CANONICAL_ACCOUNT:
      return "mapping";
    case REPORTING_GRAPH_NODE_TYPES.FS_STATEMENT:
      return "fs_statement";
    case REPORTING_GRAPH_NODE_TYPES.FS_LINE:
      return "fs_line";
    case REPORTING_GRAPH_NODE_TYPES.DISCLOSURE_NOTE:
      return "disclosure_note";
    default:
      return "fs_line";
  }
}

function mapPersistedEdgeType(
  edgeType: string,
): ReportingGraph["edges"][number]["edgeType"] {
  switch (edgeType) {
    case "MAPS_TO":
      return "maps_to";
    case "ROLLS_UP_TO":
    case "PRESENTS_AS":
      return "rolls_into";
    case "DISCLOSES":
      return "discloses";
    default:
      return "flows_to";
  }
}
