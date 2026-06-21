// ─── Unified cross-product task runtime (in-memory, no schema) ───

import type { V1ProductKey } from "@/lib/platform/registry/product-contracts";
import { enforceCoreOnMutation } from "@/lib/platform/integration/core-adoption-enforcer";
import {
  aggregateOpenTasksByProduct,
  sortTaskCenterItems,
  type TaskCenterItem,
  type TaskCenterPriority,
  type TaskCenterStatus,
} from "./task-center";

const orgTaskStore = new Map<string, TaskCenterItem[]>();
let hydrationPromise: Promise<void> | null = null;

async function ensureTasksHydrated(): Promise<void> {
  if (hydrationPromise) return hydrationPromise;
  hydrationPromise = (async () => {
    const { loadTaskSnapshot, isTaskFilePersistenceEnabled } =
      await import("./task-persistence");
    if (!isTaskFilePersistenceEnabled()) return;
    const snapshot = await loadTaskSnapshot();
    if (!snapshot?.organizations) return;
    for (const [orgId, tasks] of Object.entries(snapshot.organizations)) {
      orgTaskStore.set(orgId, tasks as TaskCenterItem[]);
    }
  })();
  await hydrationPromise;
}

async function persistTaskStore(): Promise<void> {
  const { saveTaskSnapshot, isTaskFilePersistenceEnabled } =
    await import("./task-persistence");
  if (!isTaskFilePersistenceEnabled()) return;
  const organizations: Record<string, TaskCenterItem[]> = {};
  for (const [orgId, tasks] of orgTaskStore.entries()) {
    organizations[orgId] = tasks;
  }
  await saveTaskSnapshot(organizations);
}

export function resetUnifiedTaskStoreForTests(): void {
  orgTaskStore.clear();
  hydrationPromise = null;
}

export function registerOrgTask(item: TaskCenterItem): TaskCenterItem {
  enforceCoreOnMutation({
    productSlug: item.productSlug,
    operation: "create",
  });
  const list = orgTaskStore.get(item.organizationId) ?? [];
  const existing = list.findIndex((t) => t.id === item.id);
  if (existing >= 0) list[existing] = item;
  else list.push(item);
  orgTaskStore.set(item.organizationId, list);
  void persistTaskStore();
  return item;
}

export async function listTasksForOrgAsync(
  organizationId: string,
  options?: { productSlug?: V1ProductKey; includeDone?: boolean },
): Promise<TaskCenterItem[]> {
  await ensureTasksHydrated();
  return listTasksForOrg(organizationId, options);
}

export function listTasksForOrg(
  organizationId: string,
  options?: { productSlug?: V1ProductKey; includeDone?: boolean },
): TaskCenterItem[] {
  enforceCoreOnMutation({ productSlug: "audit", operation: "read" });
  let items = [...(orgTaskStore.get(organizationId) ?? [])];
  if (!options?.includeDone) {
    items = items.filter((t) => t.status !== "done");
  }
  if (options?.productSlug) {
    items = items.filter((t) => t.productSlug === options.productSlug);
  }
  return sortTaskCenterItems(items);
}

export function mapEngagementToTask(input: {
  organizationId: string;
  engagementId: string;
  titleAr: string;
  titleEn: string;
  status: string;
  assigneeId?: string;
  dueAt?: string;
}): TaskCenterItem | null {
  const openStatuses = new Set([
    "draft",
    "setup",
    "in_progress",
    "under_review",
    "ready_for_approval",
  ]);
  if (!openStatuses.has(input.status)) return null;

  const status: TaskCenterStatus =
    input.status === "under_review" ? "in_progress" : "open";
  const priority: TaskCenterPriority =
    input.status === "ready_for_approval" ? "high" : "medium";

  return {
    id: `audit-eng-${input.engagementId}`,
    organizationId: input.organizationId,
    productSlug: "audit",
    titleAr: input.titleAr,
    titleEn: input.titleEn,
    assigneeId: input.assigneeId,
    dueAt: input.dueAt,
    priority,
    status,
    resourceType: "AuditEngagement",
    resourceId: input.engagementId,
    href: `/audit/engagements/${input.engagementId}`,
  };
}

export function mapOpportunityToTask(input: {
  organizationId: string;
  opportunityId: string;
  titleAr: string;
  titleEn: string;
  reviewStatus?: string;
  stage: string;
  ownerId?: string;
}): TaskCenterItem | null {
  const needsReview =
    input.reviewStatus === "Draft" ||
    input.reviewStatus === "InReview" ||
    input.stage === "Qualification";
  if (!needsReview) return null;

  return {
    id: `sales-opp-${input.opportunityId}`,
    organizationId: input.organizationId,
    productSlug: "sales",
    titleAr: input.titleAr,
    titleEn: input.titleEn,
    assigneeId: input.ownerId,
    priority: "medium",
    status: input.reviewStatus === "InReview" ? "in_progress" : "open",
    resourceType: "SalesOpportunity",
    resourceId: input.opportunityId,
    href: `/sales/opportunities/${input.opportunityId}`,
  };
}

export function mapLCProjectToTask(input: {
  organizationId: string;
  projectId: string;
  titleAr: string;
  titleEn: string;
  status: string;
  ownerId?: string;
}): TaskCenterItem | null {
  const open = new Set(["Draft", "InReview", "Returned"]);
  if (!open.has(input.status)) return null;

  return {
    id: `lc-proj-${input.projectId}`,
    organizationId: input.organizationId,
    productSlug: "local_content",
    titleAr: input.titleAr,
    titleEn: input.titleEn,
    assigneeId: input.ownerId,
    priority: input.status === "InReview" ? "high" : "medium",
    status: input.status === "InReview" ? "in_progress" : "open",
    resourceType: "LocalContentProject",
    resourceId: input.projectId,
    href: `/local-content/projects/${input.projectId}`,
  };
}

const DERIVED_TASK_PREFIXES = [
  "audit-eng-",
  "sales-opp-",
  "lc-proj-",
  "audit-review-",
  "audit-approval-",
  "local_content-review-",
  "local_content-approval-",
  "sales-review-",
  "sales-approval-",
];

function isDerivedTaskId(id: string): boolean {
  return DERIVED_TASK_PREFIXES.some((p) => id.startsWith(p));
}

export function syncDerivedTasksForOrg(
  organizationId: string,
  derived: Array<TaskCenterItem | null>,
): TaskCenterItem[] {
  const mapped = derived.filter((t): t is TaskCenterItem => t !== null);
  const existing = orgTaskStore.get(organizationId) ?? [];
  const manual = existing.filter((t) => !isDerivedTaskId(t.id));
  const merged = sortTaskCenterItems([...manual, ...mapped]);
  orgTaskStore.set(organizationId, merged);
  void persistTaskStore();
  return merged;
}

export function getOpenTaskCountsByProduct(organizationId: string) {
  return aggregateOpenTasksByProduct(listTasksForOrg(organizationId));
}

export function countTasksByStatus(
  items: TaskCenterItem[],
): Record<TaskCenterStatus, number> {
  const counts: Record<TaskCenterStatus, number> = {
    open: 0,
    in_progress: 0,
    blocked: 0,
    done: 0,
  };
  for (const item of items) {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
  }
  return counts;
}

export function deriveWorkflowTasks(
  signals: Array<{
    productSlug: string;
    resourceType: string;
    resourceId: string;
    organizationId: string;
    metadata?: Record<string, unknown>;
    summaryAr?: string;
    summaryEn?: string;
  }>,
): TaskCenterItem[] {
  return signals
    .map((s) => {
      const status = String(s.metadata?.status ?? "open");
      if (s.productSlug === "audit" && s.resourceType === "AuditEngagement") {
        return mapEngagementToTask({
          organizationId: s.organizationId,
          engagementId: s.resourceId,
          titleAr: s.summaryAr ?? "مهمة مراجعة",
          titleEn: s.summaryEn ?? "Engagement task",
          status,
          assigneeId: s.metadata?.ownerId as string | undefined,
        });
      }
      if (
        s.productSlug === "local_content" &&
        s.resourceType === "LocalContentProject"
      ) {
        return mapLCProjectToTask({
          organizationId: s.organizationId,
          projectId: s.resourceId,
          titleAr: s.summaryAr ?? "مشروع محتوى محلي",
          titleEn: s.summaryEn ?? "LC project",
          status,
          ownerId: s.metadata?.ownerId as string | undefined,
        });
      }
      if (s.productSlug === "sales" && s.resourceType === "SalesOpportunity") {
        return mapOpportunityToTask({
          organizationId: s.organizationId,
          opportunityId: s.resourceId,
          titleAr: s.summaryAr ?? "فرصة مبيعات",
          titleEn: s.summaryEn ?? "Sales opportunity",
          reviewStatus: s.metadata?.reviewStatus as string | undefined,
          stage: String(s.metadata?.stage ?? "qualification"),
          ownerId: s.metadata?.ownerId as string | undefined,
        });
      }
      return null;
    })
    .filter((t): t is TaskCenterItem => t !== null);
}

export function deriveReviewTasks(
  reviewSignals: Array<{
    organizationId: string;
    productSlug: string;
    resourceType: string;
    resourceId: string;
    summaryAr?: string;
    summaryEn?: string;
  }>,
): TaskCenterItem[] {
  return reviewSignals.map((s) => ({
    id: `${s.productSlug}-review-${s.resourceId}`,
    organizationId: s.organizationId,
    productSlug: s.productSlug,
    titleAr: s.summaryAr ?? "مراجعة معلقة",
    titleEn: s.summaryEn ?? "Pending review",
    priority: "high" as const,
    status: "in_progress" as const,
    resourceType: s.resourceType,
    resourceId: s.resourceId,
    href:
      s.productSlug === "audit"
        ? `/audit/engagements/${s.resourceId}`
        : s.productSlug === "local_content"
          ? `/local-content/projects/${s.resourceId}`
          : `/sales/opportunities/${s.resourceId}`,
  }));
}

export function deriveApprovalTasks(
  approvalSignals: Array<{
    organizationId: string;
    productSlug: string;
    resourceType: string;
    resourceId: string;
    summaryAr?: string;
    summaryEn?: string;
  }>,
): TaskCenterItem[] {
  return approvalSignals.map((s) => ({
    id: `${s.productSlug}-approval-${s.resourceId}`,
    organizationId: s.organizationId,
    productSlug: s.productSlug,
    titleAr: s.summaryAr ?? "اعتماد معلق",
    titleEn: s.summaryEn ?? "Pending approval",
    priority: "high" as const,
    status: "open" as const,
    resourceType: s.resourceType,
    resourceId: s.resourceId,
    href:
      s.productSlug === "audit"
        ? `/audit/engagements/${s.resourceId}`
        : s.productSlug === "local_content"
          ? `/local-content/projects/${s.resourceId}`
          : `/sales/opportunities/${s.resourceId}`,
  }));
}

import {
  collectAuditApprovalSignals,
  collectAuditReviewSignals,
  collectAuditTaskSignals,
  collectLocalContentApprovalSignals,
  collectLocalContentReviewSignals,
  collectLocalContentTaskSignals,
  collectSalesApprovalSignals,
  collectSalesReviewSignals,
  collectSalesTaskSignals,
} from "@/lib/core/signals";

/** Collect and sync derived tasks from product signals (read-only derivation). */
export async function collectProductTasks(
  organizationId: string,
  ownerId = "system",
): Promise<TaskCenterItem[]> {
  await ensureTasksHydrated();

  const [
    auditTasks,
    lcTasks,
    salesTasks,
    auditReviews,
    lcReviews,
    salesReviews,
    auditApprovals,
    lcApprovals,
    salesApprovals,
  ] = await Promise.all([
    collectAuditTaskSignals(organizationId),
    collectLocalContentTaskSignals(organizationId),
    collectSalesTaskSignals(organizationId, ownerId),
    collectAuditReviewSignals(organizationId),
    collectLocalContentReviewSignals(organizationId),
    collectSalesReviewSignals(organizationId, ownerId),
    collectAuditApprovalSignals(organizationId),
    collectLocalContentApprovalSignals(organizationId),
    collectSalesApprovalSignals(organizationId, ownerId),
  ]);

  const workflow = deriveWorkflowTasks([
    ...auditTasks,
    ...lcTasks,
    ...salesTasks,
  ]);
  const reviews = deriveReviewTasks([
    ...auditReviews,
    ...lcReviews,
    ...salesReviews,
  ]);
  const approvals = deriveApprovalTasks([
    ...auditApprovals,
    ...lcApprovals,
    ...salesApprovals,
  ]);

  return syncDerivedTasksForOrg(organizationId, [
    ...workflow,
    ...reviews,
    ...approvals,
  ]);
}

export function escalateTask(
  organizationId: string,
  taskId: string,
  level: import("./task-center").TaskEscalationLevel,
): TaskCenterItem | null {
  const list = orgTaskStore.get(organizationId) ?? [];
  const idx = list.findIndex((t) => t.id === taskId);
  if (idx < 0) return null;
  const task = list[idx];
  const priority: TaskCenterItem["priority"] =
    level === "executive" || level === "manager" ? "high" : task.priority;
  const updated: TaskCenterItem = {
    ...task,
    escalation: level,
    priority,
    intelligenceLink:
      task.intelligenceLink ?? `/platform/institutional?task=${task.id}`,
  };
  list[idx] = updated;
  orgTaskStore.set(organizationId, list);
  void persistTaskStore();
  return updated;
}
