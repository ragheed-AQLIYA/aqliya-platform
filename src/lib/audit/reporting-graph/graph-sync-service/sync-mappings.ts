import { prisma } from "@/lib/prisma";
import {
  REPORTING_GRAPH_NODE_TYPES,
  REPORTING_GRAPH_ENTITY_TYPES,
  REPORTING_GRAPH_EDGE_TYPES,
} from "../graph-constants";
import type { RegisterNodeFn, LinkFn } from "./common";

export async function syncMappingNodes(
  engagementId: string,
  registerNode: RegisterNodeFn,
  link: LinkFn,
  tbByCode: Map<string, string>,
): Promise<void> {
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
}
