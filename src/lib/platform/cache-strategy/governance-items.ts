import { prisma } from "@/lib/prisma";
import { cacheAdapter } from "../redis-cache-adapter";
import { DASHBOARD_CACHE_TTL_MS, WarmResult } from "./common";

export async function warmGovernanceItems(
  organizationId: string,
  results: WarmResult[],
): Promise<void> {
  const governanceKey = `dashboard:governance:${organizationId}:items`;
  try {
    const items: any[] = [];

    // Pending decisions
    try {
      const decisions = await prisma.decision.findMany({
        take: 100,
        where: { status: "IN_REVIEW" },
        select: { id: true, title: true, description: true, status: true, targetDate: true, owner: { select: { name: true } }, createdAt: true },
      });
      for (const d of decisions) {
        items.push({
          id: d.id, productKey: "decision", productLabel: "DecisionOS",
          type: "مراجعة", title: d.title, description: d.description,
          status: d.status, priority: "medium", createdBy: d.owner?.name || null,
          createdAt: d.createdAt, deadline: d.targetDate, href: `/decisions/${d.id}`,
        });
      }
    } catch { /* skip on error */ }

    // Pending workflows
    try {
      const workflows = await prisma.workflowRecord.findMany({
        take: 100,
        where: { status: { in: ["in_progress", "pending_approval"] } },
        select: { id: true, title: true, description: true, status: true, dueDate: true, createdById: true, createdAt: true },
      });
      for (const w of workflows) {
        items.push({
          id: w.id, productKey: "workflow", productLabel: "WorkflowOS",
          type: "موافقة", title: w.title, description: w.description,
          status: w.status, priority: "medium", createdBy: w.createdById,
          createdAt: w.createdAt, deadline: w.dueDate, href: "/workflows",
        });
      }
    } catch { /* skip on error */ }

    // Local content reviews
    try {
      const reviews = await prisma.localContentReview.findMany({
        take: 100,
        where: { status: "pending" },
        select: { id: true, project: { select: { name: true } }, status: true, reviewerName: true, createdAt: true, projectId: true },
      });
      for (const r of reviews) {
        items.push({
          id: r.id, productKey: "localcontent", productLabel: "LocalContentOS",
          type: "مراجعة", title: r.project?.name || "مراجعة محتوى محلي",
          description: null, status: r.status, priority: "high",
          createdBy: r.reviewerName, createdAt: r.createdAt, deadline: null,
          href: `/local-content/reviews/${r.id}`,
        });
      }
    } catch { /* skip on error */ }

    // Sales reviews
    try {
      const reviews = await prisma.salesReview.findMany({
        take: 100,
        where: { status: "pending" },
        select: { id: true, deal: { select: { title: true } }, status: true, reviewerName: true, createdAt: true, dealId: true },
      });
      for (const r of reviews) {
        items.push({
          id: r.id, productKey: "sales", productLabel: "SalesOS",
          type: "مراجعة", title: r.deal?.title || "مراجعة صفقة",
          description: null, status: r.status, priority: "high",
          createdBy: r.reviewerName, createdAt: r.createdAt, deadline: null,
          href: `/sales/reviews/${r.id}`,
        });
      }
    } catch { /* skip on error */ }

    // Risk assessments
    try {
      const assessments = await prisma.auditRiskAssessment.findMany({
        take: 100,
        where: { status: "pending_review" },
        select: { id: true, title: true, inherentLevel: true, assessedAt: true, assessedById: true, createdAt: true, status: true },
      });
      for (const r of assessments) {
        items.push({
          id: r.id, productKey: "risk", productLabel: "RiskOS",
          type: "موافقة", title: r.title, description: null,
          status: r.status, priority: r.inherentLevel === "critical" ? "high" : "medium",
          createdBy: r.assessedById, createdAt: r.createdAt, deadline: null,
          href: `/risk/${r.id}`,
        });
      }
    } catch { /* skip on error */ }

    // Audit findings
    try {
      const findings = await prisma.auditFinding.findMany({
        take: 100,
        where: { status: { in: ["open", "under_review"] } },
        select: { id: true, title: true, description: true, severity: true, status: true, assignedTo: true, engagementId: true, createdAt: true },
      });
      for (const f of findings) {
        items.push({
          id: f.id, productKey: "audit", productLabel: "AuditOS",
          type: "اعتماد", title: f.title, description: f.description,
          status: f.status, priority: (f.severity === "critical" || f.severity === "high") ? "high" : "medium",
          createdBy: f.assignedTo, createdAt: f.createdAt, deadline: null,
          href: `/audit/engagements/${f.engagementId}/findings`,
        });
      }
    } catch { /* skip on error */ }

    const totalPending = items.length;
    const criticalCount = items.filter((i) => i.priority === "high").length;
    const byProduct = items.reduce<Record<string, number>>(
      (acc, i) => { acc[i.productKey as string] = (acc[i.productKey as string] || 0) + 1; return acc; },
      {},
    );
    const avgAge = items.length > 0
      ? Math.round(items.reduce((sum, i) => sum + (Date.now() - new Date(i.createdAt as Date).getTime()), 0) / items.length / (1000 * 60 * 60 * 24))
      : 0;

    const value = { items, stats: { totalPending, criticalCount, byProduct, averageAge: avgAge } };

    await cacheAdapter.set(governanceKey, value, DASHBOARD_CACHE_TTL_MS);
    results.push({ key: governanceKey, status: "warmed" });
  } catch (err) {
    results.push({
      key: governanceKey,
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
