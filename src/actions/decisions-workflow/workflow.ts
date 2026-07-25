"use server";

import {
  prisma,
  getCurrentUser,
  enforce,
  lookupDecisionOrg,
  handleError,
  ok,
  fail
} from "./common";

export async function getWorkflowReadiness(decisionId: string) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await lookupDecisionOrg(decisionId);
    if (!decisionLookup) return fail("Decision not found");
    await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "read");

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: {
          include: {
            riskAnalysis: true,
          },
        },
        scenarios: { include: { simulation: true } },
        recommendation: true,
      },
    });

    if (!decision) {
      return fail("Decision not found");
    }

    const intakeAccepted = true;
    const frameworkComplete = !!(
      decision.framework &&
      decision.framework.context &&
      decision.framework.purpose &&
      decision.framework.options &&
      decision.framework.criteria &&
      decision.framework.values
    );

    const scenariosComplete =
      decision.decisionScenarios.length >= 3 &&
      decision.decisionScenarios.every((s) => s.name && s.description);

    const risksComplete =
      decision.decisionScenarios.length > 0 &&
      decision.decisionScenarios.every((s) => s.riskAnalysis);

    const hasSimulationResults = decision.scenarios.some((s) => s.simulation);
    const simulationReady = hasSimulationResults;

    const recommendationReady =
      !!decision.recommendation &&
      decision.recommendation.recommendedAction &&
      decision.recommendation.rationale;

    const { deriveScores, buildScoringData } =
      await import("@/lib/simulation/simulation-engine");
    const scoringData = buildScoringData({
      objectives: decision.objectives,
      constraints: decision.constraints,
      assumptions: decision.assumptions,
      alternatives: decision.alternatives,
      risks: decision.risks,
      framework: decision.framework
        ? {
            context: decision.framework.context,
            purpose: decision.framework.purpose,
            options: decision.framework.options,
            criteria: decision.framework.criteria,
            values: decision.framework.values,
            informationGaps: decision.framework.informationGaps,
            certainty: decision.framework.certainty,
            assumptions: decision.framework.assumptions,
          }
        : null,
      decisionScenarios: decision.decisionScenarios.map((s) => ({
        name: s.name,
        description: s.description,
      })),
      priority: decision.priority,
      targetDate: decision.targetDate,
    });

    const derived = deriveScores(scoringData);

    return ok({
        decisionType: decision.type,
        intakeAccepted,
        frameworkComplete,
        scenariosComplete,
        risksComplete,
        simulationReady,
        recommendationReady,
        dataQuality: derived.dataQuality,
        missingInputs: derived.missingInputs,
        derivedScores: {
          strategicFitScore: derived.strategicFitScore,
          feasibilityScore: derived.feasibilityScore,
          riskScore: derived.riskScore,
          confidenceScore: derived.confidenceScore,
        },
      });
  } catch (error) {
    return handleError(error, "fetching workflow readiness");
  }
}
