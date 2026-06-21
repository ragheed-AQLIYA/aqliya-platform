import "server-only";

import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────

export type PlatformHealth = {
  healthScore: number;
  aiRunsToday: number;
  pendingReviews: number;
  failedWorkflows: number;
  activeUsersToday: number;
  auditEventsToday: number;
  status: "healthy" | "warning" | "critical";
};

export type PlatformNotification = {
  id: string;
  productKey: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  href: string;
  createdAt: Date;
};

// ─── Health score formula ─────────────────────────────────────────────────
//
// Pending Reviews ............ 25%
// Failed Workflows ........... 25%
// AI Success Rate ............ 25%
// System Activity ............ 15%
// Audit Coverage ............. 10%
//
// >=90 → healthy
// 70-89 → warning
// <70 → critical

export async function getPlatformHealthAction(): Promise<PlatformHealth> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ── Parallel data queries ─────────────────────────────────────────────
  const [
    decisionsInReview,
    workflowFailed,
    workflowCompleted,
    aiOutputCount,
    aiAcceptedCount,
    auditLogsToday,
    auditLogsLast7Days,
    platformAuditLogsToday,
    usersLoggedInToday,
  ] = await Promise.all([
    // Pending reviews: decisions in IN_REVIEW
    prisma.decision.count({ where: { status: "IN_REVIEW" } }).catch(() => 0),

    // Failed workflows: rejected/cancelled
    prisma.workflowRecord
      .count({ where: { status: { in: ["rejected", "cancelled"] } } })
      .catch(() => 0),

    // Completed workflows
    prisma.workflowRecord
      .count({ where: { status: "completed" } })
      .catch(() => 0),

    // AI outputs total
    prisma.auditAiOutput.count().catch(() => 0),

    // AI outputs accepted
    prisma.auditAiOutput
      .count({ where: { status: { in: ["accepted", "approved"] } } })
      .catch(() => 0),

    // Audit events today (AuditOS)
    prisma.auditEvent.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),

    // Audit events last 7 days
    prisma.auditEvent
      .count({ where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } } })
      .catch(() => 0),

    // Platform audit logs today
    prisma.platformAuditLog
      .count({ where: { createdAt: { gte: todayStart } } })
      .catch(() => 0),

    // Active users: distinct actors in platform audit logs today
    prisma.platformAuditLog
      .findMany({
        where: { createdAt: { gte: todayStart } },
        select: { actorId: true },
        distinct: ["actorId"],
      })
      .then((rows) => rows.length)
      .catch(() => 0),
  ]);

  // ── Compute sub-scores ─────────────────────────────────────────────────

  // 1. Pending Reviews (25 points)
  const maxPendingThreshold = 20;
  const pendingScore =
    decisionsInReview <= maxPendingThreshold
      ? 25
      : Math.max(0, 25 - ((decisionsInReview - maxPendingThreshold) / 10) * 5);

  // 2. Failed Workflows (25 points) — base 25 if no failures, scale down
  const totalWorkflows = workflowCompleted + workflowFailed;
  const failureRate = totalWorkflows > 0 ? workflowFailed / totalWorkflows : 0;
  const failedScore = Math.max(0, 25 - failureRate * 100 * 0.5);

  // 3. AI Success Rate (25 points)
  const aiSuccessRate = aiOutputCount > 0 ? aiAcceptedCount / aiOutputCount : 1;
  const aiScore = 25 * aiSuccessRate;

  // 4. System Activity (15 points) — based on active users + engagement today
  const activityThreshold = 5;
  const activityScore = Math.min(15, (usersLoggedInToday / activityThreshold) * 15);

  // 5. Audit Coverage (10 points) — ratio of today's events to 7-day average
  const avgDailyLast7 = Math.max(1, auditLogsLast7Days / 7);
  const dailyRatio = auditLogsToday / avgDailyLast7;
  const auditScore = Math.min(10, dailyRatio * 10);

  // ── Aggregate ──────────────────────────────────────────────────────────
  const healthScore = Math.round(pendingScore + failedScore + aiScore + activityScore + auditScore);
  const clamped = Math.min(100, Math.max(0, healthScore));

  const status: PlatformHealth["status"] =
    clamped >= 90 ? "healthy" : clamped >= 70 ? "warning" : "critical";

  return {
    healthScore: clamped,
    aiRunsToday: aiOutputCount,
    pendingReviews: decisionsInReview,
    failedWorkflows: workflowFailed,
    activeUsersToday: usersLoggedInToday,
    auditEventsToday: auditLogsToday + platformAuditLogsToday,
    status,
  };
}

// ─── Platform Notifications ────────────────────────────────────────────────

export async function getPlatformNotificationsAction(): Promise<{
  notifications: PlatformNotification[];
  counts: { critical: number; warning: number; info: number };
}> {
  const now = new Date();
  const staleThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ── DecisionOS: decisions IN_REVIEW ────────────────────────────────────
  const decisionsInReview = await prisma.decision
    .findMany({
      where: { status: "IN_REVIEW" },
      select: { id: true, title: true, updatedAt: true },
      take: 20,
      orderBy: { updatedAt: "desc" },
    })
    .catch(() => []);

  // ── DecisionOS: decisions past targetDate without completion ──────────
  const decisionsOverdue = await prisma.decision
    .findMany({
      where: {
        targetDate: { lt: now },
        status: { notIn: ["APPROVED", "REJECTED", "ARCHIVED"] },
      },
      select: { id: true, title: true, targetDate: true, updatedAt: true },
      take: 20,
      orderBy: { targetDate: "asc" },
    })
    .catch(() => []);

  // ── WorkflowOS: rejected/cancelled records ────────────────────────────
  const workflowFailed = await prisma.workflowRecord
    .findMany({
      where: { status: { in: ["rejected", "cancelled"] } },
      select: { id: true, title: true, status: true, updatedAt: true },
      take: 20,
      orderBy: { updatedAt: "desc" },
    })
    .catch(() => []);

  // ── WorkflowOS: records in review ─────────────────────────────────────
  const workflowInReview = await prisma.workflowRecord
    .findMany({
      where: { status: "in_progress" },
      select: { id: true, title: true, updatedAt: true },
      take: 20,
      orderBy: { updatedAt: "desc" },
    })
    .catch(() => []);

  // ── LocalContentOS: pending reviews ───────────────────────────────────
  const lcPendingReviews = await prisma.localContentReview
    .findMany({
      where: { status: "pending" },
      select: { id: true, projectId: true, comments: true, createdAt: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  // ── SalesOS: stale deals (not updated in 30 days) ────────────────────
  const staleDeals = await prisma.salesDeal
    .findMany({
      where: {
        status: { notIn: ["closed_won", "closed_lost"] },
        updatedAt: { lt: staleThreshold },
      },
      select: { id: true, title: true, updatedAt: true },
      take: 20,
      orderBy: { updatedAt: "asc" },
    })
    .catch(() => []);

  // ── PlatformAuditLog: critical/warning entries today ──────────────────
  const criticalLogs = await prisma.platformAuditLog
    .findMany({
      where: {
        createdAt: { gte: todayStart },
        severity: { in: ["error", "critical"] },
      },
      select: { id: true, action: true, targetLabel: true, actorName: true, createdAt: true, severity: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  // ── Assemble notifications ────────────────────────────────────────────
  const notifications: PlatformNotification[] = [];

  // DecisionOS: IN_REVIEW
  for (const d of decisionsInReview) {
    notifications.push({
      id: `decision-review-${d.id}`,
      productKey: "decision",
      severity: "warning",
      title: "قرار بانتظار المراجعة",
      description: d.title,
      href: `/decisions/${d.id}`,
      createdAt: d.updatedAt,
    });
  }

  // DecisionOS: overdue
  for (const d of decisionsOverdue) {
    notifications.push({
      id: `decision-overdue-${d.id}`,
      productKey: "decision",
      severity: "critical",
      title: "قرار تجاوز تاريخه",
      description: `${d.title} — كان مستحقاً في ${d.targetDate?.toLocaleDateString("ar-SA")}`,
      href: `/decisions/${d.id}`,
      createdAt: d.updatedAt,
    });
  }

  // WorkflowOS: failed
  for (const w of workflowFailed) {
    notifications.push({
      id: `workflow-failed-${w.id}`,
      productKey: "workflow",
      severity: "critical",
      title: w.status === "rejected" ? "إجراء مرفوض" : "إجراء ملغي",
      description: w.title,
      href: `/workflowos/${w.id}`,
      createdAt: w.updatedAt,
    });
  }

  // WorkflowOS: in review
  for (const w of workflowInReview) {
    notifications.push({
      id: `workflow-review-${w.id}`,
      productKey: "workflow",
      severity: "warning",
      title: "إجراء بانتظار المراجعة",
      description: w.title,
      href: `/workflowos/${w.id}`,
      createdAt: w.updatedAt,
    });
  }

  // LocalContentOS: pending reviews
  for (const r of lcPendingReviews) {
    notifications.push({
      id: `lc-review-${r.id}`,
      productKey: "localcontent",
      severity: "warning",
      title: "مراجعة محتوى محلي معلقة",
      description: r.comments?.slice(0, 100) ?? "مشروع بانتظار المراجعة",
      href: `/local-content/${r.projectId}`,
      createdAt: r.createdAt,
    });
  }

  // SalesOS: stale deals
  for (const s of staleDeals) {
    notifications.push({
      id: `sales-stale-${s.id}`,
      productKey: "sales",
      severity: "warning",
      title: "صفقة قديمة بدون تحديث",
      description: `${s.title} — آخر تحديث: ${s.updatedAt.toLocaleDateString("ar-SA")}`,
      href: `/sales/${s.id}`,
      createdAt: s.updatedAt,
    });
  }

  // Platform: critical logs
  for (const l of criticalLogs) {
    notifications.push({
      id: `platform-critical-${l.id}`,
      productKey: "platform",
      severity: "critical",
      title: l.action,
      description: l.targetLabel ?? l.actorName ?? "حدث حرج في المنصة",
      href: "/settings/audit-logs",
      createdAt: l.createdAt,
    });
  }

  // ── Sort by creation date descending ──────────────────────────────────
  notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // ── Counts ────────────────────────────────────────────────────────────
  const counts = {
    critical: notifications.filter((n) => n.severity === "critical").length,
    warning: notifications.filter((n) => n.severity === "warning").length,
    info: notifications.filter((n) => n.severity === "info").length,
  };

  return { notifications, counts };
}
