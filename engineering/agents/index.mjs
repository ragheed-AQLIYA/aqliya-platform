/**
 * Agent registry — Engineering Excellence + Engineering Intelligence
 */

import * as codeHealth from "./code-health.mjs";
import * as security from "./security.mjs";
import * as performance from "./performance.mjs";
import * as testIntelligence from "./test-intelligence.mjs";
import * as documentation from "./documentation.mjs";
import * as uxQuality from "./ux-quality.mjs";
import * as dependency from "./dependency.mjs";
import * as technicalDebt from "./technical-debt.mjs";
import * as architectureDrift from "./architecture-drift.mjs";
import * as engineeringIntelligence from "./engineering-intelligence.mjs";
import * as trendAnalysis from "./trend-analysis.mjs";
import * as regressionDetector from "./regression-detector.mjs";
import * as recommendationRanking from "./recommendation-ranking.mjs";
import * as engineeringCost from "./engineering-cost.mjs";
import * as predictiveRisk from "./predictive-risk.mjs";

/** Phase-1 quality agents (scan source) */
export const agentModules = {
  "code-health": codeHealth,
  security,
  performance,
  "test-intelligence": testIntelligence,
  documentation,
  "ux-quality": uxQuality,
  dependency,
  "technical-debt": technicalDebt,
  "architecture-drift": architectureDrift,
  "engineering-intelligence": engineeringIntelligence,
  "trend-analysis": trendAnalysis,
  "regression-detector": regressionDetector,
  "recommendation-ranking": recommendationRanking,
  "engineering-cost": engineeringCost,
  "predictive-risk": predictiveRisk,
};

/** Agents that require data-lake history (run after ingest) */
export const INTELLIGENCE_AGENTS = [
  "engineering-intelligence",
  "trend-analysis",
  "regression-detector",
  "recommendation-ranking",
  "engineering-cost",
  "predictive-risk",
];

export const agentReportNames = {
  "code-health": "code-health",
  security: "security",
  performance: "performance",
  "test-intelligence": "testing",
  documentation: "documentation",
  "ux-quality": "ui-quality",
  dependency: "dependencies",
  "technical-debt": "technical-debt",
  "architecture-drift": "architecture-drift",
  "engineering-intelligence": "engineering-intelligence",
  "trend-analysis": "trend-analysis",
  "regression-detector": "regression-detector",
  "recommendation-ranking": "recommendation-ranking",
  "engineering-cost": "engineering-cost",
  "predictive-risk": "predictive-risk",
};
