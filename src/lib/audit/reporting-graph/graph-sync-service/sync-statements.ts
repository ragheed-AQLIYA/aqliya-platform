import { prisma } from "@/lib/prisma";
import {
  REPORTING_GRAPH_NODE_TYPES,
  REPORTING_GRAPH_ENTITY_TYPES,
  REPORTING_GRAPH_EDGE_TYPES,
} from "../graph-constants";
import type { RegisterNodeFn, LinkFn } from "./common";

export async function syncStatementNodes(
  engagementId: string,
  registerNode: RegisterNodeFn,
  link: LinkFn,
) {
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

  return statements;
}
