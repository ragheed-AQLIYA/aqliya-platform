import "server-only";

import { prisma } from "@/lib/prisma";

export type GovernanceItem = {
  id: string;
  productKey: string;
  productLabel: string;
  type: string;
  title: string;
  description: string | null;
  status: string;
  priority: "high" | "medium" | "low";
  createdBy: string | null;
  createdAt: Date;
  deadline: Date | null;
  href: string;
};

export type GovernanceDashboard = {
  items: GovernanceItem[];
  stats: {
    totalPending: number;
    criticalCount: number;
    byProduct: Record<string, number>;
    averageAge: number;
  };
};

function daysBetween(d1: Date, d2: Date): number {
  const ms = d2.getTime() - d1.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function isOverdue(item: { deadline: Date | null; priority: string }): boolean {
  if (item.deadline && new Date() > item.deadline) return true;
  if (item.priority === "high") return true;
  return false;
}

export async function getGovernanceDashboardAction(): Promise<GovernanceDashboard> {
  const now = new Date();

  const [decisions, workflowRecords, localContentReviews, salesReviews, riskAssessments, auditFindings] =
    await Promise.all([
      prisma.decision
        .findMany({
          where: { status: "IN_REVIEW" },
          select: { id: true, title: true, description: true, status: true, targetDate: true, owner: { select: { name: true } }, createdAt: true },
        })
        .catch(() => []),

      prisma.workflowRecord
        .findMany({
          where: { status: { in: ["in_progress", "pending_approval"] } },
          select: { id: true, title: true, description: true, status: true, dueDate: true, createdById: true, createdAt: true },
        })
        .catch(() => []),

      prisma.localContentReview
        .findMany({
          where: { status: "pending" },
          select: { id: true, project: { select: { name: true } }, status: true, reviewerName: true, createdAt: true, projectId: true },
        })
        .catch(() => []),

      prisma.salesReview
        .findMany({
          where: { status: "pending" },
          select: { id: true, deal: { select: { title: true } }, status: true, reviewerName: true, createdAt: true, dealId: true },
        })
        .catch(() => []),

      prisma.auditRiskAssessment
        .findMany({
          where: { status: { in: ["draft", "in_review"] } },
          select: { id: true, title: true, status: true, assessedById: true, createdAt: true, engagementId: true },
        })
        .catch(() => []),

      prisma.auditFinding
        .findMany({
          where: { status: { in: ["draft", "under_review"] } },
          select: { id: true, title: true, description: true, status: true, severity: true, createdById: true, createdAt: true, engagementId: true },
        })
        .catch(() => []),
    ]);

  const items: GovernanceItem[] = [];

  for (const d of decisions) {
    items.push({
      id: `decision_${d.id}`,
      productKey: "decision",
      productLabel: "DecisionOS",
      type: "مراجعة",
      title: d.title,
      description: d.description,
      status: d.status,
      priority: d.targetDate && now > d.targetDate ? "high" : d.status === "IN_REVIEW" ? "high" : "medium",
      createdBy: d.owner?.name ?? null,
      createdAt: d.createdAt,
      deadline: d.targetDate,
      href: `/decisions/${d.id}`,
    });
  }

  for (const w of workflowRecords) {
    items.push({
      id: `workflow_${w.id}`,
      productKey: "workflow",
      productLabel: "WorkflowOS",
      type: w.status === "pending_approval" ? "اعتماد" : "مراجعة",
      title: w.title,
      description: w.description,
      status: w.status,
      priority: w.status === "pending_approval" ? "high" : "medium",
      createdBy: null,
      createdAt: w.createdAt,
      deadline: w.dueDate,
      href: `/workflowos/records/${w.id}`,
    });
  }

  for (const r of localContentReviews) {
    items.push({
      id: `lcreview_${r.id}`,
      productKey: "localcontent",
      productLabel: "LocalContentOS",
      type: "مراجعة",
      title: r.project?.name ?? "مراجعة محتوى محلي",
      description: null,
      status: r.status,
      priority: "medium",
      createdBy: r.reviewerName ?? null,
      createdAt: r.createdAt,
      deadline: null,
      href: `/local-content/review-center`,
    });
  }

  for (const s of salesReviews) {
    items.push({
      id: `salesreview_${s.id}`,
      productKey: "sales",
      productLabel: "SalesOS",
      type: "اعتماد",
      title: s.deal?.title ?? "مراجعة صفقة",
      description: null,
      status: s.status,
      priority: "medium",
      createdBy: s.reviewerName ?? null,
      createdAt: s.createdAt,
      deadline: null,
      href: s.dealId ? `/sales/deals/${s.dealId}` : "/sales",
    });
  }

  for (const r of riskAssessments) {
    items.push({
      id: `risk_${r.id}`,
      productKey: "risk",
      productLabel: "RiskOS",
      type: "موافقة",
      title: r.title,
      description: null,
      status: r.status,
      priority: r.status === "draft" ? "low" : "medium",
      createdBy: null,
      createdAt: r.createdAt,
      deadline: null,
      href: r.engagementId ? `/audit/engagements/${r.engagementId}` : "/risk",
    });
  }

  for (const f of auditFindings) {
    items.push({
      id: `finding_${f.id}`,
      productKey: "audit",
      productLabel: "AuditOS",
      type: f.severity === "high" || f.severity === "critical" ? "موافقة" : "مراجعة",
      title: f.title,
      description: f.description,
      status: f.status,
      priority: f.severity === "critical" || f.severity === "high" ? "high" : f.status === "under_review" ? "medium" : "low",
      createdBy: null,
      createdAt: f.createdAt,
      deadline: null,
      href: f.engagementId ? `/audit/engagements/${f.engagementId}` : "/audit",
    });
  }

  const totalPending = items.length;
  const criticalItems = items.filter(isOverdue);
  const criticalCount = criticalItems.length;

  const byProduct: Record<string, number> = {};
  for (const item of items) {
    byProduct[item.productLabel] = (byProduct[item.productLabel] ?? 0) + 1;
  }

  const totalAgeDays = items.reduce((sum, item) => sum + daysBetween(item.createdAt, now), 0);
  const averageAge = items.length > 0 ? Math.round(totalAgeDays / items.length) : 0;

  return { items, stats: { totalPending, criticalCount, byProduct, averageAge } };
}
