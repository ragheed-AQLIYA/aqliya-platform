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
  evaluateRisks,
  ok,
  fail
} from "./common";

export async function getDecisionRiskAnalysis(id: string) {
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
        decisionScenarios: { select: { id: true, name: true } },
        riskAnalyses: true,
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
    const scenarioState = evaluateScenarios(decision.decisionScenarios);
    const riskAnalysisState = evaluateRisks(
      decision.decisionScenarios,
      decision.riskAnalyses,
    );
    const analysisDrafts = decision.riskAnalyses.map((r) => ({
      id: r.id,
      scenarioId: r.scenarioId,
      risks: r.risks,
      tradeoffs: r.tradeoffs,
      sacrifices: r.sacrifices,
      opportunityCosts: r.opportunityCosts,
      stakeholderRisks: r.stakeholderRisks,
      operationalRisks: r.operationalRisks,
      strategicRisks: r.strategicRisks,
      knowledgeRisks: r.knowledgeRisks,
      uncertaintyLevel: r.uncertaintyLevel,
    }));

    return ok({
        type: decision.type,
        intake,
        frameworkState,
        scenarioState,
        riskAnalysisState,
        decisionScenarios: decision.decisionScenarios as {
          id: string;
          name: string;
        }[],
        analysisDrafts,
      });
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      const logger = createLogger({ product: "decisions", action: "getDecisionRiskAnalysis" });
      logger.error("Error fetching risks", error as Error, { decisionId: id });
      logger.error("Error fetching risks:", error instanceof Error ? error : undefined);
    }

const logger = createLogger({ product: "platform", action: "unknown" });

    return fail("Failed to fetch risks");
  }
}

export async function updateDecisionRiskAnalysis(
  id: string,
  _input: {
    analyses: {
      scenarioId: string;
      risks: string;
      tradeoffs: string;
      sacrifices: string;
      opportunityCosts: string;
      stakeholderRisks: string;
      operationalRisks: string;
      strategicRisks: string;
      knowledgeRisks: string;
      uncertaintyLevel: string;
    }[];
  },
) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await prisma.decision.findUnique({
      where: { id },
      select: { organizationId: true },
    });
    if (!decisionLookup) return fail("Decision not found");
    await enforce(user, { type: "decision", id, tenantId: decisionLookup.organizationId }, "update");
    // Batch-read existing analyses to avoid N+1
    const scenarioIds = _input.analyses.map((a) => a.scenarioId);
    const existingAnalyses = await prisma.decisionRiskAnalysis.findMany({
      where: { decisionId: id, scenarioId: { in: scenarioIds } },
      select: { id: true, scenarioId: true },
    });
    const existingMap = new Map(existingAnalyses.map((a) => [a.scenarioId, a.id]));

    const operations = _input.analyses.map((analysis) => {
      const analysisData = {
        risks: analysis.risks,
        tradeoffs: analysis.tradeoffs,
        sacrifices: analysis.sacrifices,
        opportunityCosts: analysis.opportunityCosts,
        stakeholderRisks: analysis.stakeholderRisks,
        operationalRisks: analysis.operationalRisks,
        strategicRisks: analysis.strategicRisks,
        knowledgeRisks: analysis.knowledgeRisks,
        uncertaintyLevel: analysis.uncertaintyLevel,
      };
      const existingId = existingMap.get(analysis.scenarioId);
      if (existingId) {
        return prisma.decisionRiskAnalysis.update({
          where: { id: existingId },
          data: analysisData,
        });
      }
      return prisma.decisionRiskAnalysis.create({
        data: { decisionId: id, scenarioId: analysis.scenarioId, ...analysisData },
      });
    });
    await prisma.$transaction(operations);
    await invalidateDashboardCaches(decisionLookup.organizationId);
    const updatedAnalyses = await prisma.decisionRiskAnalysis.findMany({
      where: { decisionId: id },
      include: { scenario: true },
    });
    const scenarios = await prisma.decisionScenario.findMany({
      where: { decisionId: id },
    });
    const riskAnalysisState = evaluateRisks(scenarios, updatedAnalyses);
    return ok({ riskAnalyses: updatedAnalyses, riskAnalysisState });
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      const logger = createLogger({ product: "decisions", action: "updateDecisionRiskAnalysis" });
      logger.error("Error updating risks", error as Error, { decisionId: id });
      logger.error("Error updating risks:", error instanceof Error ? error : undefined);
    }
    return fail("Failed to update risks");
  }
}
