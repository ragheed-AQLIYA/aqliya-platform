"use server";

import {
  prisma,
  getCurrentUser,
  enforce,
  isExpectedAccessDeniedError,
  createLogger,
  invalidateDashboardCaches,
  evaluateIntake,
  ok,
  fail
} from "./common";

export async function getDecisionIntake(id: string) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        type: true,
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        risks: true,
        organizationId: true,
      },
    });
    if (!decision) return fail("Decision not found");
    await enforce(user, { type: "decision", id, tenantId: decision.organizationId }, "read");
    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    });
    return ok({ ...decision, intake });
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      const logger = createLogger({ product: "decisions", action: "getDecisionIntake" });
      logger.error("Error fetching intake", error as Error, { decisionId: id });
      logger.error("Error fetching intake:", error instanceof Error ? error : undefined);
    }

const logger = createLogger({ product: "platform", action: "unknown" });

    return fail("Failed to fetch intake");
  }
}

export async function updateDecisionIntake(
  id: string,
  data: {
    objectives?: string;
    constraints?: string;
    assumptions?: string;
    alternatives?: string;
    risks?: string;
  },
) {
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
    await prisma.decision.update({
      where: { id },
      data: {
        objectives: data.objectives
          ? { deleteMany: {}, create: [{ description: data.objectives }] }
          : undefined,
        constraints: data.constraints
          ? { deleteMany: {}, create: [{ description: data.constraints }] }
          : undefined,
        assumptions: data.assumptions
          ? { deleteMany: {}, create: [{ description: data.assumptions }] }
          : undefined,
        alternatives: data.alternatives
          ? { deleteMany: {}, create: [{ description: data.alternatives }] }
          : undefined,
        risks: data.risks
          ? { deleteMany: {}, create: [{ description: data.risks, level: "MEDIUM" }] }
          : undefined,
      },
    });
    const result = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        objectives: true,
        alternatives: true,
        risks: true,
      },
    });
    const intake = result
      ? evaluateIntake({
          title: result.title,
          objectives: result.objectives,
          alternatives: result.alternatives,
          risks: result.risks,
        })
      : {
          status: "reframe_required" as const,
          readyForFramework: false,
          reasonCodes: [],
          reasons: [],
          requiredNextSteps: [],
        };
    await invalidateDashboardCaches(decisionLookup.organizationId);
    await invalidateDashboardCaches(decisionLookup.organizationId);
    return ok({ ...result, intake });
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      const logger = createLogger({ product: "decisions", action: "updateDecisionIntake" });
      logger.error("Error updating intake", error as Error, { decisionId: id });
      logger.error("Error updating intake:", error instanceof Error ? error : undefined);
    }
    return fail("Failed to update intake");
  }
}
