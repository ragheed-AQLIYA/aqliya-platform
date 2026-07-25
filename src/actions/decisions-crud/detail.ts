"use server";

import {
  prisma,
  getCurrentUser,
  enforce,
  isExpectedAccessDeniedError,
  logAudit,
  invalidateDashboardCaches,
  isValidDecisionType,
  ok,
  fail,
} from "./common";
import type { DecisionStatus } from "./common";
import { createLogger } from "@/lib/observability/logger";
import { getDecisionAuditLogs } from "@/lib/decision/decision-audit";

export async function getDecisionById(id: string) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id },
      include: {
        organization: true,
        owner: true,
        reviewer: true,
        approver: true,
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        risks: true,
        tenderProfile: true,
        scenarios: {
          include: { simulation: true },
        },
        framework: true,
        decisionScenarios: true,
        riskAnalyses: true,
        recommendation: true,
        approvals: {
          include: { approver: true },
        },
        // [MIGRATED] auditLogs include → separate PlatformAuditLog query (productKey: "decision_os")
        // auditLogs: {
        //   include: { user: true },
        //   orderBy: { createdAt: "desc" },
        // },
      },
    });

    if (!decision) {
      return fail("Decision not found");
    }

    await enforce(user, { type: "decision", id, tenantId: decision.organizationId }, "read");

    // [MIGRATED] Fetch audit logs from PlatformAuditLog with productKey: "decision_os"
    const auditLogs = await getDecisionAuditLogs(id, { orderBy: "desc" });

    return ok({ ...decision, auditLogs });
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      const logger = createLogger({ product: "decisions", action: "getDecisionById" });
      logger.error("Error fetching decision", error as Error, { decisionId: id });
      logger.error("Error fetching decision:", error instanceof Error ? error : undefined);
    }
    return fail("Failed to fetch decision");
  }
}

export async function createDecision(data: {
  title: string;
  type?: string;
  description?: string;
  priority?: string;
  targetDate?: string;
  objectives?: string;
  constraints?: string;
  assumptions?: string;
  alternatives?: string;
  risks?: string;
}) {
  try {
    const user = await getCurrentUser();
    await enforce(user, { type: "decision", id: "new", tenantId: user.organizationId }, "create");

    if (!data.title || data.title.trim().length === 0) {
      return fail("Decision title is required");
    }

    const decisionType = data.type || "TENDER";
    if (!isValidDecisionType(decisionType)) {
      return fail(`Invalid decision type: ${data.type}`);
    }

    const targetDate = data.targetDate ? new Date(data.targetDate) : undefined;

    const decision = await prisma.decision.create({
      data: {
        title: data.title.trim(),
        type: decisionType,
        description: data.description?.trim() || null,
        priority: data.priority || "MEDIUM",
        targetDate,
        ownerId: user.id,
        organizationId: user.organizationId,
        status: "DRAFT",
      },
    });

    await logAudit(
      user.id,
      decision.id,
      "DECISION_CREATED",
      "Decision",
      undefined,
      JSON.stringify({ title: decision.title, type: decision.type }),
      user.organizationId,
    );

    await invalidateDashboardCaches(user.organizationId);

    return ok(decision);
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      const logger = createLogger({ product: "decisions", action: "createDecision" });
      logger.error("Error creating decision", error as Error);
      logger.error("Error creating decision:", error instanceof Error ? error : undefined);
    }
    return fail("Failed to create decision");
  }
}

export async function updateDecisionStatus(id: string, status: string) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await prisma.decision.findUnique({
      where: { id },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return fail("Decision not found");
    }
    await enforce(user, { type: "decision", id, tenantId: decisionLookup.organizationId }, "update");

    // Evidence review gate: require all evidence reviewed before approval
    if (status === "APPROVED" || status === "IMPLEMENTED") {
      const allEvidence = await prisma.decisionEvidence.findMany({
        where: { decisionId: id },
        select: { metadata: true },
      });
      if (allEvidence.length > 0) {
        const unreviewed = allEvidence.filter((e) => {
          const meta = e.metadata as Record<string, unknown> | null;
          return !meta?.reviewedAt;
        });
        if (unreviewed.length > 0) {
          return fail(
            `لا يمكن ${status === "APPROVED" ? "الموافقة" : "التنفيذ"} على القرار قبل مراجعة جميع مستندات الدعم. العدد غير المراجع: ${unreviewed.length}`,
          );
        }
      }
    }

    const decision = await prisma.decision.update({
      where: { id },
      data: { status: status as DecisionStatus },
    });
    await invalidateDashboardCaches(user.organizationId);
    return ok(decision);
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      const logger = createLogger({ product: "decisions", action: "updateDecisionStatus" });
      logger.error("Error updating decision status", error as Error, { decisionId: id, status });
      logger.error("Error updating decision status:", error instanceof Error ? error : undefined);
    }
    return fail("Failed to update decision status");
  }
}
