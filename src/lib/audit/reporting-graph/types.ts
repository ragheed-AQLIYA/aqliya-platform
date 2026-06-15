/** Computed factory reporting graph (TB → mapping → FS → disclosure). */

export type ReportingGraphNodeType =
  | "engagement"
  | "tb_root"
  | "tb_account"
  | "mapping"
  | "fs_statement"
  | "fs_line"
  | "disclosure_note";

export type ReportingGraphEdgeType =
  | "flows_to"
  | "maps_to"
  | "rolls_into"
  | "discloses";

export interface ReportingGraphNode {
  id: string;
  nodeType: ReportingGraphNodeType;
  label: string;
  labelAr?: string;
  layer: number;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export interface ReportingGraphEdge {
  id: string;
  edgeType: ReportingGraphEdgeType;
  sourceId: string;
  targetId: string;
}

export interface ReportingGraphStats {
  tbAccounts: number;
  mappings: number;
  statements: number;
  fsLines: number;
  notes: number;
  edges: number;
}

export interface ReportingGraph {
  engagementId: string;
  nodes: ReportingGraphNode[];
  edges: ReportingGraphEdge[];
  stats: ReportingGraphStats;
  builtAt: string;
  graphVersion: 1;
}

export interface GraphBuildInput {
  engagementId: string;
  tbLines: Array<{
    id: string;
    accountCode: string;
    accountName: string;
    balance: number;
  }>;
  mappings: Array<{
    id: string;
    sourceAccountId: string;
    sourceAccountCode: string;
    sourceAccountName: string;
    debitAmount: number;
    creditAmount: number;
    canonicalAccountCode?: string;
    canonicalAccountName?: string;
    status: string;
  }>;
  statements: Array<{
    id: string;
    title: string;
    statementType: string;
    status: string;
    lines: Array<{
      id: string;
      label: string;
      amount: number;
      isTotal: boolean;
      linkedAccountMappings: string[];
    }>;
  }>;
  notes: Array<{
    id: string;
    noteNumber: string;
    title: string;
    noteType: string;
    status: string;
    linkedStatementLine?: string;
  }>;
}

export interface GraphSnapshotRecord {
  id: string;
  engagementId: string;
  milestone: "approval" | "manual";
  capturedAt: string;
  stats: ReportingGraphStats;
  graph: ReportingGraph;
}
