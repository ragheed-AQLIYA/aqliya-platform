"use server";

import {
  prisma,
  getCurrentUser,
  enforce,
  isExpectedAccessDeniedError,
  createLogger,
  invalidateDashboardCaches,
  evaluateIntake,
  evaluateFramework,
  ok,
  fail
} from "./common";

export async function getDecisionFramework(id: string) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        type: true,
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
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
    const frameworkState = evaluateFramework(decision.framework);
    return ok({
        type: decision.type,
        framework: decision.framework,
        intake,
        frameworkState,
      });
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      const logger = createLogger({ product: "decisions", action: "getDecisionFramework" });
      logger.error("Error fetching framework", error as Error, { decisionId: id });
      logger.error("Error fetching framework:", error instanceof Error ? error : undefined);
    }

const logger = createLogger({ product: "platform", action: "unknown" });

    return fail("Failed to fetch framework");
  }
}

export async function updateDecisionFramework(
  id: string,
  form: {
    context: string;
    purpose: string;
    options: string;
    criteria: string;
    values: string;
    informationGaps: string;
    certainty: string;
    assumptions: string;
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
        framework: {
          upsert: {
            where: { decisionId: id },
            create: { ...form },
            update: form,
          },
        },
      },
    });
    await invalidateDashboardCaches(decisionLookup.organizationId);
    const frameworkState = evaluateFramework(form);
    return ok({ framework: form, frameworkState });
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      const logger = createLogger({ product: "decisions", action: "updateDecisionFramework" });
      logger.error("Error updating framework", error as Error, { decisionId: id });
      logger.error("Error updating framework:", error instanceof Error ? error : undefined);
    }
    return fail("Failed to update framework");
  }
}
