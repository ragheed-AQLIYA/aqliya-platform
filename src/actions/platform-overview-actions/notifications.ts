import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { PlatformNotification } from "./types";

export async function getPlatformNotificationsAction(): Promise<{
  notifications: PlatformNotification[];
  counts: { critical: number; warning: number; info: number };
}> {
  await getCurrentUser();
  const now = new Date();
  const staleThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const decisionsInReview = await prisma.decision
    .findMany({
      where: { status: "IN_REVIEW" },
      select: { id: true, title: true, updatedAt: true },
      take: 20,
      orderBy: { updatedAt: "desc" },
    })
    .catch(() => []);

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

  const workflowFailed = await prisma.workflowRecord
    .findMany({
      where: { status: { in: ["rejected", "cancelled"] } },
      select: { id: true, title: true, status: true, updatedAt: true },
      take: 20,
      orderBy: { updatedAt: "desc" },
    })
    .catch(() => []);

  const workflowInReview = await prisma.workflowRecord
    .findMany({
      where: { status: "in_progress" },
      select: { id: true, title: true, updatedAt: true },
      take: 20,
      orderBy: { updatedAt: "desc" },
    })
    .catch(() => []);

  const lcPendingReviews = await prisma.localContentReview
    .findMany({
      where: { status: "pending" },
      select: { id: true, projectId: true, comments: true, createdAt: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

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

  const notifications: PlatformNotification[] = [];

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

  notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const counts = {
    critical: notifications.filter((n) => n.severity === "critical").length,
    warning: notifications.filter((n) => n.severity === "warning").length,
    info: notifications.filter((n) => n.severity === "info").length,
  };

  return { notifications, counts };
}
