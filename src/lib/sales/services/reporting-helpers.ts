export function partitionPipelineDeals<T extends { status: string }>(deals: T[]) {
  const openDeals = deals.filter((deal) => deal.status === "open");
  const closedDeals = deals.filter((deal) => deal.status !== "open");
  return { openDeals, closedDeals };
}

export type DueNextActionItem = {
  dealId: string;
  title: string;
  accountName?: string;
  dueAt: string | null;
  isOverdue: boolean;
};

function readNextActionDue(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const nextAction = (metadata as Record<string, unknown>).nextAction;
  if (!nextAction || typeof nextAction !== "object" || Array.isArray(nextAction)) return null;
  const dueAt = (nextAction as Record<string, unknown>).dueAt;
  return typeof dueAt === "string" ? dueAt : null;
}

export function buildDueNextActions(
  deals: Array<{ id: string; title: string; metadata: unknown; account?: { name: string } | null }>,
): DueNextActionItem[] {
  const now = Date.now();
  return deals
    .map((deal) => {
      const dueAt = readNextActionDue(deal.metadata);
      if (!dueAt) return null;
      const dueMs = Date.parse(dueAt);
      return {
        dealId: deal.id,
        title: deal.title,
        accountName: deal.account?.name,
        dueAt,
        isOverdue: Number.isFinite(dueMs) && dueMs < now,
      };
    })
    .filter((item): item is DueNextActionItem => item !== null);
}
