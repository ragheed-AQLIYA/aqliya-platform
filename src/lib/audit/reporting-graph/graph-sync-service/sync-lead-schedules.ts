import { prisma } from "@/lib/prisma";
import {
  REPORTING_GRAPH_NODE_TYPES,
  REPORTING_GRAPH_ENTITY_TYPES,
  REPORTING_GRAPH_EDGE_TYPES,
} from "../graph-constants";
import type { RegisterNodeFn, LinkFn } from "./common";

export async function syncLeadScheduleNodes(
  engagementId: string,
  registerNode: RegisterNodeFn,
  link: LinkFn,
): Promise<void> {
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
}
