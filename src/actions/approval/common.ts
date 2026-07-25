import { Prisma } from "@prisma/client";

export function buildSnapshotData(
  recommendation: {
    id: string;
    recommendedAction: string;
    rationale: string;
    expectedNextState: string;
    scopeExclusions: string;
    assumptionsUsed: string;
    risksAccepted: string;
    risksRejected: string;
    humanReviewRequired: boolean;
    confidence?: number | null;
    score?: number | null;
    risks?: unknown;
    nextActions?: unknown;
  } | null,
  overrideReason?: string,
) {
  if (!recommendation) {
    return {
      recommendationId: null,
      snapshotAction: null,
      snapshotRationale: null,
      snapshotExpectedNextState: null,
      snapshotScopeExclusions: null,
      snapshotAssumptionsUsed: null,
      snapshotRisksAccepted: null,
      snapshotRisksRejected: null,
      snapshotConditions: null,
      snapshotRisks: Prisma.JsonNull,
      snapshotNextActions: Prisma.JsonNull,
      snapshotConfidence: null,
      snapshotScore: null,
      snapshotOverrideReason: overrideReason || null,
      snapshotCreatedAt: new Date(),
    };
  }
  return {
    recommendationId: recommendation.id,
    snapshotAction: recommendation.recommendedAction,
    snapshotRationale: recommendation.rationale,
    snapshotExpectedNextState: recommendation.expectedNextState,
    snapshotScopeExclusions: recommendation.scopeExclusions,
    snapshotAssumptionsUsed: recommendation.assumptionsUsed,
    snapshotRisksAccepted: recommendation.risksAccepted,
    snapshotRisksRejected: recommendation.risksRejected,
    snapshotConditions: null,
    snapshotRisks: recommendation.risks
      ? (recommendation.risks as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    snapshotNextActions: recommendation.nextActions
      ? (recommendation.nextActions as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    snapshotConfidence: recommendation.confidence || null,
    snapshotScore: recommendation.score || null,
    snapshotOverrideReason: overrideReason || null,
    snapshotCreatedAt: new Date(),
  };
}
