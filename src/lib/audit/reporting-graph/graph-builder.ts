import type {
  GraphBuildInput,
  ReportingGraph,
  ReportingGraphEdge,
  ReportingGraphNode,
  ReportingGraphStats,
} from "./types";

function edgeId(sourceId: string, targetId: string, suffix: string): string {
  return `e-${sourceId}-${targetId}-${suffix}`;
}

/**
 * Builds a read-only factory pipeline graph from engagement artifacts.
 * Pure function — no I/O.
 */
export function buildReportingGraph(input: GraphBuildInput): ReportingGraph {
  const nodes: ReportingGraphNode[] = [];
  const edges: ReportingGraphEdge[] = [];
  const nodeIds = new Set<string>();

  const addNode = (node: ReportingGraphNode) => {
    if (nodeIds.has(node.id)) return;
    nodeIds.add(node.id);
    nodes.push(node);
  };

  const addEdge = (edge: ReportingGraphEdge) => {
    edges.push(edge);
  };

  const engId = `eng-${input.engagementId}`;
  addNode({
    id: engId,
    nodeType: "engagement",
    label: "Financial Statement Factory",
    labelAr: "مصنع القوائم المالية",
    layer: 0,
  });

  addNode({
    id: "tb-root",
    nodeType: "tb_root",
    label: "Trial Balance",
    labelAr: "ميزان المراجعة",
    layer: 1,
  });
  addEdge({
    id: edgeId(engId, "tb-root", "flow"),
    edgeType: "flows_to",
    sourceId: engId,
    targetId: "tb-root",
  });

  const tbByCode = new Map<
    string,
    { code: string; name: string; balance: number; id: string }
  >();
  for (const line of input.tbLines) {
    tbByCode.set(line.accountCode, {
      code: line.accountCode,
      name: line.accountName,
      balance: line.balance,
      id: line.id,
    });
  }

  for (const m of input.mappings) {
    const tbFromLine = tbByCode.get(m.sourceAccountCode);
    const tbNodeId = `tb-${m.sourceAccountCode}`;
    if (!nodeIds.has(tbNodeId)) {
      addNode({
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
      addEdge({
        id: edgeId("tb-root", tbNodeId, "flow"),
        edgeType: "flows_to",
        sourceId: "tb-root",
        targetId: tbNodeId,
      });
    }

    const mapNodeId = `map-${m.id}`;
    addNode({
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
    addEdge({
      id: edgeId(tbNodeId, mapNodeId, "map"),
      edgeType: "maps_to",
      sourceId: tbNodeId,
      targetId: mapNodeId,
    });
  }

  for (const stmt of input.statements) {
    const stmtNodeId = `fs-${stmt.id}`;
    addNode({
      id: stmtNodeId,
      nodeType: "fs_statement",
      label: stmt.title,
      layer: 4,
      entityId: stmt.id,
      metadata: {
        statementType: stmt.statementType,
        status: stmt.status,
      },
    });
    addEdge({
      id: edgeId(engId, stmtNodeId, "fs"),
      edgeType: "flows_to",
      sourceId: engId,
      targetId: stmtNodeId,
    });

    for (const line of stmt.lines) {
      const lineNodeId = `fsl-${line.id}`;
      addNode({
        id: lineNodeId,
        nodeType: "fs_line",
        label: line.label,
        layer: 5,
        entityId: line.id,
        metadata: {
          amount: line.amount,
          isTotal: line.isTotal,
          statementId: stmt.id,
        },
      });
      addEdge({
        id: edgeId(stmtNodeId, lineNodeId, "roll"),
        edgeType: "rolls_into",
        sourceId: stmtNodeId,
        targetId: lineNodeId,
      });

      for (const mappingId of line.linkedAccountMappings) {
        const mapNodeId = `map-${mappingId}`;
        if (nodeIds.has(mapNodeId)) {
          addEdge({
            id: edgeId(mapNodeId, lineNodeId, "roll"),
            edgeType: "rolls_into",
            sourceId: mapNodeId,
            targetId: lineNodeId,
          });
        }
      }
    }
  }

  for (const note of input.notes) {
    const noteNodeId = `note-${note.id}`;
    addNode({
      id: noteNodeId,
      nodeType: "disclosure_note",
      label: `${note.noteNumber} — ${note.title}`,
      labelAr: "إيضاح",
      layer: 6,
      entityId: note.id,
      metadata: {
        noteType: note.noteType,
        status: note.status,
      },
    });

    const linkedLineId = note.linkedStatementLine
      ? `fsl-${note.linkedStatementLine}`
      : null;
    if (linkedLineId && nodeIds.has(linkedLineId)) {
      addEdge({
        id: edgeId(linkedLineId, noteNodeId, "disc"),
        edgeType: "discloses",
        sourceId: linkedLineId,
        targetId: noteNodeId,
      });
    } else if (input.statements[0]) {
      const fallbackId = `fs-${input.statements[0].id}`;
      addEdge({
        id: edgeId(fallbackId, noteNodeId, "disc"),
        edgeType: "discloses",
        sourceId: fallbackId,
        targetId: noteNodeId,
      });
    }
  }

  const stats: ReportingGraphStats = {
    tbAccounts: nodes.filter((n) => n.nodeType === "tb_account").length,
    mappings: nodes.filter((n) => n.nodeType === "mapping").length,
    statements: nodes.filter((n) => n.nodeType === "fs_statement").length,
    fsLines: nodes.filter((n) => n.nodeType === "fs_line").length,
    notes: nodes.filter((n) => n.nodeType === "disclosure_note").length,
    edges: edges.length,
  };

  return {
    engagementId: input.engagementId,
    nodes,
    edges,
    stats,
    builtAt: new Date().toISOString(),
    graphVersion: 1,
  };
}
