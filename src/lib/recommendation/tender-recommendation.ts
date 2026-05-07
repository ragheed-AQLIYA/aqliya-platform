import { ScenarioScores } from "../simulation/tender-simulation"

export interface RecommendationOutput {
  recommendedAction: string;
  rationale: string;
  expectedNextState: string;
  scopeExclusions: string;
  assumptionsUsed: string;
  risksAccepted: string;
  risksRejected: string;
  humanReviewRequired: boolean;
}

export function generateRecommendation(
  scenarios: ScenarioScores[],
  tenderInput: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    marginEstimate: number;
  }
): RecommendationOutput {
  // Get Expected Case scenario for primary decision
  const expectedCase = scenarios.find(s => s.scenarioType === 'EXPECTED_CASE');
  if (!expectedCase) {
    throw new Error('Expected Case scenario not found');
  }

  const overallScore = expectedCase.overallDecisionScore;

  // Determine recommendation type based on overall score
  let recommendedAction: string;
  if (overallScore >= 75) {
    recommendedAction = 'GO - Proceed with the tender';
  } else if (overallScore >= 55) {
    recommendedAction = 'GO WITH CONDITIONS - Proceed with mitigations';
  } else {
    recommendedAction = 'NO GO - Do not proceed';
  }

  // Generate rationale
  let rationale = '';
  if (overallScore >= 75) {
    rationale = `Strong overall score of ${overallScore}/100 with acceptable risk profile. Financial and capacity scores indicate high feasibility.`;
  } else if (overallScore >= 55) {
    rationale = `Moderate overall score of ${overallScore}/100. While strategic fit is strong, some risks and capacity constraints need to be addressed.`;
  } else {
    rationale = `Low overall score of ${overallScore}/100. Significant risks or financial/capacity concerns make this tender unsuitable at current state.`;
  }

  // Generate expected next state
  let expectedNextState = '';
  if (overallScore >= 75) {
    expectedNextState = 'Contract signed and project initiated within 30 days with full resource allocation';
  } else if (overallScore >= 55) {
    expectedNextState = 'Contract signed with conditions addressed within 45 days, including resource reallocation and risk mitigation';
  } else {
    expectedNextState = 'Decision to not proceed communicated to stakeholders, resources reallocated to higher-value opportunities';
  }

  // Generate scope exclusions
  const scopeExclusions = 'Does not include any work beyond the defined tender scope. Change requests require separate evaluation.';

  // Generate assumptions used
  let assumptionsUsed = `Current risk level is ${tenderInput.riskLevel}. Margin estimate of ${tenderInput.marginEstimate}% is maintained. `;
  const bestCase = scenarios.find(s => s.scenarioType === 'BEST_CASE');
  const worstCase = scenarios.find(s => s.scenarioType === 'WORST_CASE');
  if (bestCase && worstCase) {
    const gap = bestCase.overallDecisionScore - worstCase.overallDecisionScore;
    assumptionsUsed += `Scenario variance is ${gap.toFixed(1)} points between best and worst cases.`;
  }

  // Generate risks accepted and rejected
  let risksAccepted = '';
  let risksRejected = '';
  if (tenderInput.riskLevel === 'HIGH') {
    risksAccepted = 'High risks identified. Detailed risk management plan required before proceeding.';
    risksRejected = 'Risks related to uncapped payment terms - mitigated through contract clauses.';
  } else if (tenderInput.riskLevel === 'MEDIUM') {
    risksAccepted = 'Medium risks present. Mitigation strategies should be documented and monitored.';
    risksRejected = 'Low-impact operational risks that can be managed through standard procedures.';
  } else {
    risksAccepted = 'Low risk profile. Standard monitoring procedures sufficient.';
    risksRejected = 'No significant risks rejected at this level.';
  }

  return {
    recommendedAction,
    rationale,
    expectedNextState,
    scopeExclusions,
    assumptionsUsed,
    risksAccepted,
    risksRejected,
    humanReviewRequired: overallScore < 75,
  };
}
