import { prisma } from "@/lib/prisma";
import {
  REPORTING_GRAPH_NODE_TYPES,
  REPORTING_GRAPH_ENTITY_TYPES,
} from "../graph-constants";
import type { RegisterNodeFn } from "./common";

export async function syncTrialBalanceNodes(
  engagementId: string,
  registerNode: RegisterNodeFn,
): Promise<Map<string, string>> {
  const tb = await prisma.auditTrialBalance.findFirst({
    where: { engagementId },
    orderBy: { createdAt: "desc" },
    include: { lines: true },
  });

  for (const line of tb?.lines ?? []) {
    await registerNode(
      REPORTING_GRAPH_NODE_TYPES.TB_ACCOUNT,
      REPORTING_GRAPH_ENTITY_TYPES.TRIAL_BALANCE_LINE,
      line.id,
      `${line.accountCode} — ${line.accountName}`,
      {
        accountCode: line.accountCode,
        balance: line.balance,
      },
    );
  }

  return new Map(
    (tb?.lines ?? []).map((l) => [l.accountCode, l.id] as const),
  );
}
