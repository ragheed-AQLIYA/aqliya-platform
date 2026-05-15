export interface DecisionTypeConfig {
  label: string
  description: string
  intakeGuidance: string
  frameworkGuidance: string
  scenarioGuidance: string
  riskGuidance: string
  keyMetrics: string[]
}

const DECISION_TYPE_CONFIG: Record<string, DecisionTypeConfig> = {
  TENDER: {
    label: "Tender",
    description: "Evaluate and score tender/bid decisions",
    intakeGuidance: "Define the tender scope, client requirements, and your capacity to deliver.",
    frameworkGuidance: "Document the tender context, evaluation criteria, and competitive landscape.",
    scenarioGuidance: "Model best, expected, and worst case tender outcomes.",
    riskGuidance: "Assess financial, capacity, and delivery risks for each scenario.",
    keyMetrics: ["Contract value", "Margin", "Capacity fit", "Delivery risk"],
  },
  INVESTMENT: {
    label: "Investment",
    description: "Evaluate capital allocation and ROI decisions",
    intakeGuidance: "Define the investment thesis, expected returns, and capital requirements.",
    frameworkGuidance: "Document market context, investment criteria, and success metrics.",
    scenarioGuidance: "Model ROI under different market conditions and timelines.",
    riskGuidance: "Assess financial risk, market volatility, and opportunity cost.",
    keyMetrics: ["ROI", "Payback period", "Risk-adjusted return", "Capital efficiency"],
  },
  STRATEGIC: {
    label: "Strategic",
    description: "Evaluate long-term strategic direction decisions",
    intakeGuidance: "Define the strategic question, organizational goals, and competitive position.",
    frameworkGuidance: "Document strategic context, options, and alignment with vision.",
    scenarioGuidance: "Model strategic outcomes under different market and competitive scenarios.",
    riskGuidance: "Assess strategic risk, optionality loss, and competitive exposure.",
    keyMetrics: ["Strategic alignment", "Optionality", "Competitive advantage", "Market position"],
  },
  HIRING: {
    label: "Hiring",
    description: "Evaluate hiring and capacity decisions",
    intakeGuidance: "Define the role, capacity gap, and expected impact on the organization.",
    frameworkGuidance: "Document team context, role requirements, and success criteria.",
    scenarioGuidance: "Model capacity impact under different hiring outcomes and timelines.",
    riskGuidance: "Assess hiring risk, cultural fit, cost, and retention risk.",
    keyMetrics: ["Capacity impact", "Cost per hire", "Time to productivity", "Retention risk"],
  },
  EXPANSION: {
    label: "Expansion",
    description: "Evaluate business expansion decisions",
    intakeGuidance: "Define the expansion scope, target market, and resource requirements.",
    frameworkGuidance: "Document market context, expansion criteria, and success metrics.",
    scenarioGuidance: "Model expansion outcomes under different market conditions.",
    riskGuidance: "Assess market risk, execution risk, and resource strain.",
    keyMetrics: ["Market size", "Execution risk", "Resource requirements", "Timeline"],
  },
  PROCUREMENT: {
    label: "Procurement",
    description: "Evaluate purchasing and vendor decisions",
    intakeGuidance: "Define procurement requirements, budget, and vendor criteria.",
    frameworkGuidance: "Document procurement context, evaluation criteria, and vendor landscape.",
    scenarioGuidance: "Model procurement outcomes under different vendor and market conditions.",
    riskGuidance: "Assess vendor risk, cost overrun, and supply chain disruption.",
    keyMetrics: ["Cost savings", "Vendor reliability", "Quality impact", "Supply risk"],
  },
  PARTNERSHIP: {
    label: "Partnership",
    description: "Evaluate partnership and collaboration decisions",
    intakeGuidance: "Define the partnership scope, mutual benefits, and governance structure.",
    frameworkGuidance: "Document partnership context, alignment, and success criteria.",
    scenarioGuidance: "Model partnership outcomes under different collaboration scenarios.",
    riskGuidance: "Assess partner risk, dependency, and strategic misalignment.",
    keyMetrics: ["Mutual benefit", "Dependency risk", "Strategic fit", "Governance"],
  },
  PRICING: {
    label: "Pricing",
    description: "Evaluate pricing strategy decisions",
    intakeGuidance: "Define the pricing question, market position, and competitive landscape.",
    frameworkGuidance: "Document pricing context, value proposition, and customer segments.",
    scenarioGuidance: "Model pricing outcomes under different market responses.",
    riskGuidance: "Assess revenue risk, competitive response, and customer churn.",
    keyMetrics: ["Revenue impact", "Margin", "Competitive position", "Customer response"],
  },
  OPERATIONS: {
    label: "Operations",
    description: "Evaluate operational change decisions",
    intakeGuidance: "Define the operational change, impact scope, and resource requirements.",
    frameworkGuidance: "Document operational context, change criteria, and success metrics.",
    scenarioGuidance: "Model operational outcomes under different implementation scenarios.",
    riskGuidance: "Assess execution risk, disruption, and resource strain.",
    keyMetrics: ["Efficiency gain", "Disruption risk", "Cost impact", "Timeline"],
  },
  CUSTOM: {
    label: "Custom",
    description: "Evaluate custom decision types",
    intakeGuidance: "Define the decision context, objectives, and key stakeholders.",
    frameworkGuidance: "Document decision context, options, and evaluation criteria.",
    scenarioGuidance: "Model outcomes under different scenarios and assumptions.",
    riskGuidance: "Assess risks and trade-offs for each scenario.",
    keyMetrics: ["Strategic fit", "Feasibility", "Risk level", "Resource impact"],
  },
}

export function getDecisionTypeConfig(type: string): DecisionTypeConfig {
  return DECISION_TYPE_CONFIG[type] ?? DECISION_TYPE_CONFIG.CUSTOM
}
