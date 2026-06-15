import { isEnabled } from "@/lib/platform/feature-flags/registry";

export { buildReportingGraph } from "./graph-builder";
export { loadReportingGraph } from "./graph-query";
export {
  captureReportingGraphSnapshot,
  getGraphSnapshotById,
  listGraphSnapshots,
} from "./snapshot";
export {
  isReportingGraphEnabled,
  maybeSyncReportingGraphAfterFsRebuild,
  maybeSyncReportingGraphAfterTbUpload,
  syncReportingGraphForEngagement,
} from "./graph-sync-service";
export {
  REPORTING_GRAPH_EDGE_TYPES,
  REPORTING_GRAPH_ENTITY_TYPES,
  REPORTING_GRAPH_NODE_TYPES,
} from "./graph-constants";
export type {
  GraphBuildInput,
  GraphSnapshotRecord,
  ReportingGraph,
  ReportingGraphEdge,
  ReportingGraphNode,
  ReportingGraphStats,
} from "./types";

export function isMindMapEnabled(): boolean {
  return isEnabled("audit.mind-map");
}
