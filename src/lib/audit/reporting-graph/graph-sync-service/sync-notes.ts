import { prisma } from "@/lib/prisma";
import {
  REPORTING_GRAPH_NODE_TYPES,
  REPORTING_GRAPH_ENTITY_TYPES,
  REPORTING_GRAPH_EDGE_TYPES,
} from "../graph-constants";
import type { RegisterNodeFn, LinkFn } from "./common";

export async function syncDisclosureNoteNodes(
  engagementId: string,
  registerNode: RegisterNodeFn,
  link: LinkFn,
  statements: readonly { id: string }[],
): Promise<void> {
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
}
