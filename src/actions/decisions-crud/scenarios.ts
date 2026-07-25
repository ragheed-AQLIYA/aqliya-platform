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
  evaluateScenarios,
  ok,
  fail
} from "./common";

export async function getDecisionScenarios(id: string) {
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
        decisionScenarios: true,
        scenarios: { include: { simulation: true } },
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
    const scenarioDrafts = decision.decisionScenarios.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      assumptions: s.assumptions,
      expectedOutcome: s.expectedOutcome,
      affectedStakeholders: s.affectedStakeholders,
      requiredConditions: s.requiredConditions,
    }));
    const scenarioState = evaluateScenarios(decision.decisionScenarios);

    return ok({
        type: decision.type,
        intake,
        frameworkState,
        scenarioState,
        scenarioDrafts,
      });
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      const logger = createLogger({ product: "decisions", action: "getDecisionScenarios" });
      logger.error("Error fetching scenarios", error as Error, { decisionId: id });
      logger.error("Error fetching scenarios:", error instanceof Error ? error : undefined);
    }

const logger = createLogger({ product: "platform", action: "unknown" });

    return fail("Failed to fetch scenarios");
  }
}

export async function updateDecisionScenarios(
  id: string,
  _input: {
    scenarios: {
      id?: string;
      name: string;
      description: string;
      assumptions: string;
      expectedOutcome: string;
      affectedStakeholders: string;
      requiredConditions: string;
    }[];
  },
) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: { decisionScenarios: { select: { id: true } }, organizationId: true },
    });
    if (!decision) return fail("Decision not found");
    await enforce(user, { type: "decision", id, tenantId: decision.organizationId }, "update");
    const existingIds = new Set(
      decision.decisionScenarios.map((s) => s.id) || [],
    );
    const operations = _input.scenarios.map((scenario) => {
      const baseData = {
        name: scenario.name,
        description: scenario.description,
        assumptions: scenario.assumptions,
        expectedOutcome: scenario.expectedOutcome,
        affectedStakeholders: scenario.affectedStakeholders,
        requiredConditions: scenario.requiredConditions,
      };
      if (scenario.id && existingIds.has(scenario.id)) {
        return prisma.decisionScenario.update({
          where: { id: scenario.id },
          data: baseData,
        });
      }
      return prisma.decisionScenario.create({
        data: { decisionId: id, ...baseData },
      });
    });
    await prisma.$transaction(operations);
    await invalidateDashboardCaches(decision.organizationId);
    const updatedScenarios = await prisma.decisionScenario.findMany({
      where: { decisionId: id },
    });
    const scenarioState = evaluateScenarios(updatedScenarios);
    return ok({ decisionScenarios: updatedScenarios, scenarioState });
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      const logger = createLogger({ product: "decisions", action: "updateDecisionScenarios" });
      logger.error("Error updating scenarios", error as Error, { decisionId: id });
      logger.error("Error updating scenarios:", error instanceof Error ? error : undefined);
    }
    return fail("Failed to update scenarios");
  }
}
