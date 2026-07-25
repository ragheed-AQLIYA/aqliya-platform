"use server";

import { evaluateIntake, evaluateFramework, evaluateScenarios, evaluateRisks } from "@/lib/decision";
import {
  prisma,
  getCurrentUser,
  enforce,
  lookupDecisionOrg,
  handleError,
  ok,
  fail
} from "./common";

function validateRecommendationGate(_decisionId: string) {
  const intake = evaluateIntake({ title: "" });
  const framework = evaluateFramework(null);
  const scenarios = evaluateScenarios([]);
  const risks = evaluateRisks([], []);

  const missing: string[] = [];
  if (intake.status !== "accepted") missing.push("intake_not_accepted");
  if (!framework.isComplete) missing.push("framework_incomplete");
  if (!scenarios.isComplete) missing.push("scenarios_incomplete");
  if (!risks.isComplete) missing.push("risks_incomplete");

  return { allowed: missing.length === 0, missing };
}

export async function getDecisionRecommendation(id: string) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        recommendation: true,
        organizationId: true,
      },
    });
    if (!decision) return fail("Decision not found");
    await enforce(user, { type: "decision", id, tenantId: decision.organizationId }, "read");

    if (user.role === "VIEWER") {
      const { getPublishedRecommendationViewAction } = await import("./publishing");
      return await getPublishedRecommendationViewAction(id);
    }

    if (!decision.recommendation) {
      return fail("Recommendation not found");
    }

    return ok({
        id: decision.id,
        recommendation: decision.recommendation,
        decisionType: decision.type,
        currentUserRole: user.role,
      });
  } catch (error) {
    return handleError(error, "fetching recommendation");
  }
}

export async function updateDecisionRecommendation(
  id: string,
  data: {
    recommendedAction: string;
    rationale: string;
    expectedNextState: string;
    scopeExclusions: string;
    assumptionsUsed: string;
    risksAccepted: string;
    risksRejected: string;
    humanReviewRequired: boolean;
  },
) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await lookupDecisionOrg(id);
    if (!decisionLookup) return fail("Decision not found");
    await enforce(user, { type: "decision", id, tenantId: decisionLookup.organizationId }, "update");
    const recommendation = await prisma.recommendation.upsert({
      where: { decisionId: id },
      create: {
        decisionId: id,
        recommendedAction: data.recommendedAction,
        rationale: data.rationale,
        expectedNextState: data.expectedNextState,
        scopeExclusions: data.scopeExclusions,
        assumptionsUsed: data.assumptionsUsed,
        risksAccepted: data.risksAccepted,
        risksRejected: data.risksRejected,
        humanReviewRequired: data.humanReviewRequired ?? true,
      },
      update: {
        recommendedAction: data.recommendedAction,
        rationale: data.rationale,
        expectedNextState: data.expectedNextState,
        scopeExclusions: data.scopeExclusions,
        assumptionsUsed: data.assumptionsUsed,
        risksAccepted: data.risksAccepted,
        risksRejected: data.risksRejected,
        humanReviewRequired: data.humanReviewRequired ?? true,
      },
    });
    return ok(recommendation);
  } catch (error) {
    return handleError(error, "updating recommendation");
  }
}

export async function checkRecommendationGate(decisionId: string) {
  const user = await getCurrentUser();
  const decisionLookup = await lookupDecisionOrg(decisionId);
  if (!decisionLookup) return { allowed: false, missing: ["decision_not_found"] };
  await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "update");
  return await validateRecommendationGate(decisionId);
}
