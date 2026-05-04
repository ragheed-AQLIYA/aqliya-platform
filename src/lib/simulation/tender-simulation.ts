export interface TenderInput {
  estimatedContractValue: number;
  estimatedCost: number;
  durationMonths: number;
  requiredCapacity: number;
  internalAvailableCapacity: number;
  strategicFitScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  marginEstimate: number;
}

export interface ScenarioScores {
  scenarioType: 'BEST_CASE' | 'EXPECTED_CASE' | 'WORST_CASE';
  feasibilityScore: number;
  financialScore: number;
  capacityScore: number;
  riskScore: number;
  strategicFitScore: number;
  overallDecisionScore: number;
}

// Weights for overall score calculation
const WEIGHTS = {
  financial: 0.30,
  capacity: 0.25,
  risk: 0.25,
  strategicFit: 0.20,
};

// Risk level mapping to score
const RISK_SCORE_MAP = {
  LOW: 85,
  MEDIUM: 65,
  HIGH: 40,
};

export function calculateFinancialScore(
  contractValue: number,
  estimatedCost: number,
  marginEstimate: number,
  scenarioType: 'BEST_CASE' | 'EXPECTED_CASE' | 'WORST_CASE'
): number {
  // Base financial score from margin
  let marginScore = Math.min(marginEstimate * 5, 100); // 20% margin = 100 score

  // Scenario adjustments
  const scenarioMultiplier = {
    BEST_CASE: 1.1,
    EXPECTED_CASE: 1.0,
    WORST_CASE: 0.8,
  }[scenarioType];

  // ROI consideration
  const roi = ((contractValue - estimatedCost) / estimatedCost) * 100;
  const roiScore = Math.min(roi * 2, 100);

  const baseScore = (marginScore * 0.6 + roiScore * 0.4) * scenarioMultiplier;
  return Math.min(Math.max(baseScore, 0), 100);
}

export function calculateCapacityScore(
  requiredCapacity: number,
  internalAvailableCapacity: number,
  scenarioType: 'BEST_CASE' | 'EXPECTED_CASE' | 'WORST_CASE'
): number {
  const ratio = internalAvailableCapacity / requiredCapacity;
  
  // Scenario adjustments
  const scenarioMultiplier = {
    BEST_CASE: 1.15,
    EXPECTED_CASE: 1.0,
    WORST_CASE: 0.85,
  }[scenarioType];

  let score = 0;
  if (ratio >= 1.5) score = 100;
  else if (ratio >= 1.2) score = 85;
  else if (ratio >= 1.0) score = 70;
  else if (ratio >= 0.8) score = 50;
  else score = 30;

  return Math.min(Math.max(score * scenarioMultiplier, 0), 100);
}

export function calculateRiskScore(
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH',
  scenarioType: 'BEST_CASE' | 'EXPECTED_CASE' | 'WORST_CASE'
): number {
  const baseScore = RISK_SCORE_MAP[riskLevel];

  // Scenario adjustments
  const scenarioMultiplier = {
    BEST_CASE: 1.1,
    EXPECTED_CASE: 1.0,
    WORST_CASE: 0.75,
  }[scenarioType];

  return Math.min(Math.max(baseScore * scenarioMultiplier, 0), 100);
}

export function calculateFeasibilityScore(
  financialScore: number,
  capacityScore: number,
  riskScore: number
): number {
  // Feasibility is weighted average of financial, capacity, and risk
  return (
    financialScore * 0.4 +
    capacityScore * 0.4 +
    riskScore * 0.2
  );
}

export function calculateOverallDecisionScore(
  financialScore: number,
  capacityScore: number,
  riskScore: number,
  strategicFitScore: number
): number {
  return (
    financialScore * WEIGHTS.financial +
    capacityScore * WEIGHTS.capacity +
    riskScore * WEIGHTS.risk +
    strategicFitScore * WEIGHTS.strategicFit
  );
}

export function runSimulation(
  tenderInput: TenderInput,
  scenarioTypes: ('BEST_CASE' | 'EXPECTED_CASE' | 'WORST_CASE')[]
): ScenarioScores[] {
  return scenarioTypes.map((scenarioType) => {
    const financialScore = calculateFinancialScore(
      tenderInput.estimatedContractValue,
      tenderInput.estimatedCost,
      tenderInput.marginEstimate,
      scenarioType
    );

    const capacityScore = calculateCapacityScore(
      tenderInput.requiredCapacity,
      tenderInput.internalAvailableCapacity,
      scenarioType
    );

    const riskScore = calculateRiskScore(tenderInput.riskLevel, scenarioType);

    const strategicFitScore = tenderInput.strategicFitScore;

    const feasibilityScore = calculateFeasibilityScore(
      financialScore,
      capacityScore,
      riskScore
    );

    const overallDecisionScore = calculateOverallDecisionScore(
      financialScore,
      capacityScore,
      riskScore,
      strategicFitScore
    );

    return {
      scenarioType,
      feasibilityScore: Math.round(feasibilityScore * 10) / 10,
      financialScore: Math.round(financialScore * 10) / 10,
      capacityScore: Math.round(capacityScore * 10) / 10,
      riskScore: Math.round(riskScore * 10) / 10,
      strategicFitScore,
      overallDecisionScore: Math.round(overallDecisionScore * 10) / 10,
    };
  });
}
