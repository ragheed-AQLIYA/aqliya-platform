import type {
  GraphBuildInput,
  ReportingGraphEdge,
  ReportingGraphNode,
} from "../types";
import { edgeId } from "./common";

export function addNoteNodes(
  input: GraphBuildInput,
  nodes: ReportingGraphNode[],
  edges: ReportingGraphEdge[],
  nodeIds: Set<string>,
): void {
  for (const note of input.notes) {
    const noteNodeId = `note-${note.id}`;
    nodeIds.add(noteNodeId);
    nodes.push({
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
      edges.push({
        id: edgeId(linkedLineId, noteNodeId, "disc"),
        edgeType: "discloses",
        sourceId: linkedLineId,
        targetId: noteNodeId,
      });
    } else if (input.statements[0]) {
      const fallbackId = `fs-${input.statements[0].id}`;
      edges.push({
        id: edgeId(fallbackId, noteNodeId, "disc"),
        edgeType: "discloses",
        sourceId: fallbackId,
        targetId: noteNodeId,
      });
    }
  }
}
