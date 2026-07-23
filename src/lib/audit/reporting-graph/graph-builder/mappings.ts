import type {
  GraphBuildInput,
  ReportingGraphEdge,
  ReportingGraphNode,
} from "../types";
import { edgeId } from "./common";
import type { TbLineInfo } from "./trial-balance";

export function addMappingNodes(
  input: GraphBuildInput,
  tbByCode: Map<string, TbLineInfo>,
  nodes: ReportingGraphNode[],
  edges: ReportingGraphEdge[],
  nodeIds: Set<string>,
): void {
  for (const m of input.mappings) {
    const tbFromLine = tbByCode.get(m.sourceAccountCode);
    const tbNodeId = `tb-${m.sourceAccountCode}`;
    if (!nodeIds.has(tbNodeId)) {
      nodeIds.add(tbNodeId);
      nodes.push({
        id: tbNodeId,
        nodeType: "tb_account",
        label: `${m.sourceAccountCode} — ${m.sourceAccountName}`,
        layer: 2,
        entityId: tbFromLine?.id ?? m.sourceAccountId,
        metadata: {
          accountCode: m.sourceAccountCode,
          balance: tbFromLine?.balance ?? m.debitAmount - m.creditAmount,
        },
      });
      edges.push({
        id: edgeId("tb-root", tbNodeId, "flow"),
        edgeType: "flows_to",
        sourceId: "tb-root",
        targetId: tbNodeId,
      });
    }

    const mapNodeId = `map-${m.id}`;
    nodeIds.add(mapNodeId);
    nodes.push({
      id: mapNodeId,
      nodeType: "mapping",
      label: m.canonicalAccountName
        ? `${m.canonicalAccountCode ?? ""} ${m.canonicalAccountName}`.trim()
        : m.sourceAccountName,
      labelAr: "تعيين حساب",
      layer: 3,
      entityId: m.id,
      metadata: {
        status: m.status,
        sourceCode: m.sourceAccountCode,
        canonicalCode: m.canonicalAccountCode,
      },
    });
    edges.push({
      id: edgeId(tbNodeId, mapNodeId, "map"),
      edgeType: "maps_to",
      sourceId: tbNodeId,
      targetId: mapNodeId,
    });
  }
}
