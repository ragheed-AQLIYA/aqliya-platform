export type TaskCenterStatus = "open" | "in_progress" | "blocked" | "done";

export type TaskCenterPriority = "high" | "medium" | "low";

export type TaskEscalationLevel = "executive" | "manager" | "none";

export interface TaskCenterItem {
  id: string;
  organizationId: string;
  productSlug: string;
  titleAr: string;
  titleEn: string;
  assigneeId?: string;
  dueAt?: string;
  priority: TaskCenterPriority;
  status: TaskCenterStatus;
  resourceType: string;
  resourceId: string;
  href?: string;
  escalation?: TaskEscalationLevel;
  intelligenceLink?: string;
}

export function aggregateOpenTasksByProduct(
  items: TaskCenterItem[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    if (item.status !== "done") {
      counts[item.productSlug] = (counts[item.productSlug] ?? 0) + 1;
    }
  }
  return counts;
}

const PRIORITY_RANK: Record<TaskCenterPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function sortTaskCenterItems(
  items: TaskCenterItem[],
): TaskCenterItem[] {
  return [...items].sort((a, b) => {
    const pa = PRIORITY_RANK[a.priority] ?? 99;
    const pb = PRIORITY_RANK[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.id.localeCompare(b.id);
  });
}
