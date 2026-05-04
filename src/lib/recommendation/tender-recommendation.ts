import { ScenarioScores } from "../simulation/tender-simulation"

export interface RecommendationOutput {
  type: 'GO' | 'GO_WITH_CONDITIONS' | 'NO_GO';
  confidenceScore: number;
  reasoning: string;
  conditions?: string;
  riskNotes: string;
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
  let type: 'GO' | 'GO_WITH_CONDITIONS' | 'NO_GO';
  if (overallScore >= 75) {
    type = 'GO';
  } else if (overallScore >= 55) {
    type = 'GO_WITH_CONDITIONS';
  } else {
    type = 'NO_GO';
  }

  // Calculate confidence score based on:
  // 1. Data completeness (simulated as 90% for seed data)
  // 2. Scenario consistency (difference between best and worst)
  // 3. Risk clarity
  const bestCase = scenarios.find(s => s.scenarioType === 'BEST_CASE');
  const worstCase = scenarios.find(s => s.scenarioType === 'WORST_CASE');

  let confidenceScore = 70; // Base confidence

  // Adjust based on scenario consistency (smaller gap = higher confidence)
  if (bestCase && worstCase) {
    const gap = bestCase.overallDecisionScore - worstCase.overallDecisionScore;
    if (gap < 15) confidenceScore += 20;
    else if (gap < 25) confidenceScore += 10;
    else if (gap > 40) confidenceScore -= 15;
  }

  // Adjust based on risk level
  if (tenderInput.riskLevel === 'LOW') confidenceScore += 10;
  else if (tenderInput.riskLevel === 'HIGH') confidenceScore -= 15;

  // Adjust based on margin
  if (tenderInput.marginEstimate >= 15) confidenceScore += 10;
  else if (tenderInput.marginEstimate < 5) confidenceScore -= 10;

  confidenceScore = Math.min(Math.max(confidenceScore, 0), 100);

  // Generate reasoning
  let reasoning = '';
  if (type === 'GO') {
    reasoning = `Strong overall score of ${overallScore}/100 with acceptable risk profile. Financial and capacity scores indicate high feasibility.`;
  } else if (type === 'GO_WITH_CONDITIONS') {
    reasoning = `Moderate overall score of ${overallScore}/100. While strategic fit is strong, some risks and capacity constraints need to be addressed.`;
  } else {
    reasoning = `Low overall score of ${overallScore}/100. Significant risks or financial/capacity concerns make this tender unsuitable at current state.`;
  }

  // Generate conditions for GO_WITH_CONDITIONS
  let conditions: string | undefined;
  if (type === 'GO_WITH_CONDITIONS') {
    const conditionsList = [];
    if (expectedCase.capacityScore < 75) {
      conditionsList.push('Reallocate internal capacity or secure additional resources');
    }
    if (expectedCase.financialScore < 70) {
      conditionsList.push('Improve margin through cost optimization or value engineering');
    }
    if (tenderInput.riskLevel !== 'LOW') {
      conditionsList.push('Develop comprehensive risk mitigation plan');
    }
    conditions = conditionsList.length > 0 
      ? conditionsList.map((c, i) => `${i + 1}. ${c}`).join(' ')
      : 'Standard contract review and approval required';
  }

  // Generate risk notes
  let riskNotes = '';
  if (tenderInput.riskLevel === 'HIGH') {
    riskNotes = 'High risks identified. Detailed risk management plan required before proceeding.';
  } else if (tenderInput.riskLevel === 'MEDIUM') {
    riskNotes = 'Medium risks present. Mitigation strategies should be documented and monitored.';
  } else {
    riskNotes = 'Low risk profile. Standard monitoring procedures sufficient.';
  }

  // Add scenario insight
  if (bestCase && worstCase) {
    const gap = bestCase.overallDecisionScore - worstCase.overallDecisionScore;
    riskNotes += ` Scenario variance is ${gap.toFixed(1)} points between best and worst cases.`;
  }

  return {
    type,
    confidenceScore: Math.round(confidenceScore * 10) / 10,
    reasoning,
    conditions,
    riskNotes,
  };
}
