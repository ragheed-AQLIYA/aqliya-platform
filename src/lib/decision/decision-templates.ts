export interface DecisionTemplate {
  id: string
  type: string
  label: string
  description: string
  titlePattern: string
  descriptionPrompt: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  suggestedObjectives: string[]
  suggestedConstraints: string[]
  suggestedAssumptions: string[]
  suggestedAlternatives: string[]
  frameworkGuidance: {
    context: string
    purpose: string
    options: string
    criteria: string
    values: string
    informationGaps: string
    certainty: string
    assumptions: string
  }
  scenarioSuggestions: {
    name: string
    description: string
  }[]
  commonRisks: string[]
  recommendedNextStep: string
}

export const DECISION_TEMPLATES: Record<string, DecisionTemplate> = {
  TENDER: {
    id: "tender",
    type: "TENDER",
    label: "Tender Evaluation",
    description: "Structured evaluation for bidding on or accepting a tender/proposal",
    titlePattern: "Tender: [Client/Project Name]",
    descriptionPrompt: "Describe the tender opportunity, client, estimated value, and key requirements.",
    priority: "HIGH",
    suggestedObjectives: [
      "Evaluate financial viability and expected margin",
      "Assess capacity availability and resource requirements",
      "Determine strategic fit with organizational goals",
      "Identify key risks and mitigation strategies",
    ],
    suggestedConstraints: [
      "Budget ceiling and cost structure",
      "Available capacity and timeline constraints",
      "Regulatory and compliance requirements",
      "Client-specific technical requirements",
    ],
    suggestedAssumptions: [
      "Client requirements are stable and well-defined",
      "Cost estimates are within ±10% accuracy",
      "Required resources are available within timeline",
      "Payment terms follow standard schedule",
    ],
    suggestedAlternatives: [
      "Full bid submission with complete scope",
      "Partial bid with selected scope items",
      "Decline to bid with documented rationale",
      "Partner with another entity for joint bid",
    ],
    frameworkGuidance: {
      context: "Describe the tender background, client organization, market conditions, and competitive landscape.",
      purpose: "Define whether the goal is to win the tender, establish a relationship, or evaluate strategic value.",
      options: "List all possible responses: full bid, partial bid, no bid, joint venture, or alternative approach.",
      criteria: "Define evaluation criteria: financial margin, strategic fit, capacity, risk level, client relationship value.",
      values: "Identify organizational values that guide the decision: quality, profitability, growth, reputation.",
      informationGaps: "List missing information: detailed scope, client budget, competitor landscape, resource availability.",
      certainty: "Assess confidence level in cost estimates, timeline, client expectations, and market conditions.",
      assumptions: "Document all assumptions about costs, timeline, resources, client behavior, and market conditions.",
    },
    scenarioSuggestions: [
      { name: "Win Full Tender", description: "Tender is awarded with full scope at expected margin." },
      { name: "Win Partial Scope", description: "Tender is awarded with reduced scope or negotiated terms." },
      { name: "No Award", description: "Tender is not awarded; resources are freed for other opportunities." },
    ],
    commonRisks: [
      "Cost overrun due to scope creep or inaccurate estimates",
      "Resource unavailability during execution period",
      "Client payment delays or financial instability",
      "Regulatory changes affecting tender requirements",
      "Competitor underpricing leading to margin pressure",
    ],
    recommendedNextStep: "Complete the Tender Profile with financial details, then proceed to Framework analysis.",
  },
  INVESTMENT: {
    id: "investment",
    type: "INVESTMENT",
    label: "Investment Decision",
    description: "Evaluate capital or operational investment opportunities with risk-adjusted returns",
    titlePattern: "Investment: [Project/Asset Name]",
    descriptionPrompt: "Describe the investment opportunity, expected returns, timeline, and capital requirements.",
    priority: "HIGH",
    suggestedObjectives: [
      "Maximize risk-adjusted return on investment",
      "Align investment with strategic growth objectives",
      "Ensure financial capacity and cash flow stability",
      "Identify and mitigate downside risks",
    ],
    suggestedConstraints: [
      "Available capital and financing options",
      "Regulatory and compliance requirements",
      "Timeline constraints for deployment",
      "Organizational risk tolerance thresholds",
    ],
    suggestedAssumptions: [
      "Market conditions remain stable over investment horizon",
      "Revenue projections are based on realistic growth rates",
      "Operating costs are within estimated ranges",
      "No major regulatory changes during investment period",
    ],
    suggestedAlternatives: [
      "Full investment with committed capital",
      "Phased investment with milestone-based tranches",
      "Alternative investment with different risk/return profile",
      "Defer investment and monitor market conditions",
    ],
    frameworkGuidance: {
      context: "Describe the investment opportunity, market conditions, competitive landscape, and organizational context.",
      purpose: "Define the investment goal: growth, diversification, cost reduction, market entry, or strategic positioning.",
      options: "List all investment options: full commitment, phased approach, alternative investments, or deferral.",
      criteria: "Define evaluation criteria: NPV, IRR, payback period, strategic alignment, risk level, liquidity.",
      values: "Identify values guiding the decision: financial discipline, growth orientation, risk management, sustainability.",
      informationGaps: "List missing data: detailed financial models, market research, regulatory analysis, competitor intelligence.",
      certainty: "Assess confidence in financial projections, market trends, regulatory environment, and execution capability.",
      assumptions: "Document assumptions about market growth, cost structures, revenue streams, and competitive dynamics.",
    },
    scenarioSuggestions: [
      { name: "Best Case", description: "Investment exceeds projections with strong returns and favorable market conditions." },
      { name: "Expected Case", description: "Investment meets projections with moderate returns and stable conditions." },
      { name: "Worst Case", description: "Investment underperforms with losses or extended payback period." },
    ],
    commonRisks: [
      "Market downturn affecting investment returns",
      "Cost overruns during implementation",
      "Regulatory changes impacting investment viability",
      "Liquidity constraints limiting flexibility",
      "Execution risk from organizational capability gaps",
    ],
    recommendedNextStep: "Define financial projections and risk parameters in the Framework, then model scenarios.",
  },
  STRATEGIC: {
    id: "strategic",
    type: "STRATEGIC",
    label: "Strategic Direction",
    description: "Evaluate high-level strategic direction and organizational positioning decisions",
    titlePattern: "Strategic: [Initiative/Direction]",
    descriptionPrompt: "Describe the strategic decision, its impact on the organization, and the time horizon.",
    priority: "HIGH",
    suggestedObjectives: [
      "Align decision with long-term organizational vision",
      "Evaluate competitive positioning and market dynamics",
      "Assess organizational readiness and capability",
      "Balance short-term costs with long-term benefits",
    ],
    suggestedConstraints: [
      "Available resources and budget allocation",
      "Organizational culture and change capacity",
      "Stakeholder alignment and governance requirements",
      "External market and regulatory environment",
    ],
    suggestedAssumptions: [
      "Current market trends will continue over planning horizon",
      "Organizational capabilities can be developed or acquired",
      "Key stakeholders will support the strategic direction",
      "Competitive landscape will evolve predictably",
    ],
    suggestedAlternatives: [
      "Pursue strategic initiative with full commitment",
      "Pilot the initiative with limited scope and scale",
      "Maintain current strategy and monitor environment",
      "Pivot to alternative strategic direction",
    ],
    frameworkGuidance: {
      context: "Describe the strategic context, market dynamics, competitive pressures, and organizational position.",
      purpose: "Define the strategic goal: market leadership, diversification, innovation, cost leadership, or partnership.",
      options: "List strategic options: pursue, pilot, maintain status quo, pivot, or exit.",
      criteria: "Define evaluation criteria: strategic fit, competitive advantage, resource requirements, risk level, time to impact.",
      values: "Identify core values: innovation, sustainability, growth, quality, stakeholder value, ethical conduct.",
      informationGaps: "List missing strategic intelligence: market research, competitor analysis, capability assessment, stakeholder sentiment.",
      certainty: "Assess confidence in market forecasts, competitive responses, organizational readiness, and execution capability.",
      assumptions: "Document assumptions about market evolution, competitive behavior, organizational change capacity, and regulatory environment.",
    },
    scenarioSuggestions: [
      { name: "Strategic Success", description: "Initiative achieves strategic objectives with strong market positioning." },
      { name: "Partial Achievement", description: "Initiative delivers some benefits but falls short of full objectives." },
      { name: "Strategic Failure", description: "Initiative fails to deliver expected value; organization faces competitive disadvantage." },
    ],
    commonRisks: [
      "Misalignment between strategy and organizational capability",
      "Competitive response undermining strategic advantage",
      "Market shifts making strategy obsolete",
      "Stakeholder resistance to strategic change",
      "Resource constraints limiting execution",
    ],
    recommendedNextStep: "Complete the strategic Framework with clear objectives and criteria, then define scenarios.",
  },
  HIRING: {
    id: "hiring",
    type: "HIRING",
    label: "Key Hiring Decision",
    description: "Evaluate key hiring decisions including role definition, candidate assessment, and team structure",
    titlePattern: "Hiring: [Role/Position]",
    descriptionPrompt: "Describe the hiring need, role requirements, team impact, and organizational context.",
    priority: "MEDIUM",
    suggestedObjectives: [
      "Identify the right candidate for organizational needs",
      "Ensure role alignment with team and organizational goals",
      "Balance cost considerations with talent quality",
      "Minimize time-to-fill while maintaining quality standards",
    ],
    suggestedConstraints: [
      "Budget allocation for the role",
      "Timeline for filling the position",
      "Required skills and experience level",
      "Team dynamics and cultural fit requirements",
    ],
    suggestedAssumptions: [
      "Candidate market has sufficient talent pool",
      "Compensation package is competitive",
      "Role requirements are realistic and achievable",
      "Onboarding resources are available",
    ],
    suggestedAlternatives: [
      "Hire full-time employee with complete role scope",
      "Hire contractor or consultant for specific needs",
      "Redistribute existing team responsibilities",
      "Delay hiring and reassess in next planning cycle",
    ],
    frameworkGuidance: {
      context: "Describe the organizational need, team structure, current gaps, and business impact of the role.",
      purpose: "Define the hiring goal: fill critical gap, build capability, support growth, or replace departure.",
      options: "List hiring options: full-time, contract, internal promotion, outsourcing, or role redesign.",
      criteria: "Define evaluation criteria: skills match, cultural fit, cost, availability, growth potential, team impact.",
      values: "Identify values: meritocracy, diversity, growth mindset, collaboration, accountability.",
      informationGaps: "List missing information: market salary benchmarks, candidate pipeline, team capacity analysis, role prioritization.",
      certainty: "Assess confidence in candidate availability, role definition accuracy, team readiness, and budget allocation.",
      assumptions: "Document assumptions about market conditions, candidate expectations, team dynamics, and organizational needs.",
    },
    scenarioSuggestions: [
      { name: "Ideal Hire", description: "Perfect candidate found quickly, integrates well, and delivers strong performance." },
      { name: "Acceptable Hire", description: "Good candidate found after extended search, requires some development." },
      { name: "No Suitable Candidate", description: "No suitable candidate found; role remains unfilled or redesigned." },
    ],
    commonRisks: [
      "Hiring mismatch leading to poor performance or turnover",
      "Extended vacancy impacting team productivity",
      "Compensation misalignment with market rates",
      "Cultural misfit affecting team dynamics",
      "Budget overrun due to recruitment costs or higher salary",
    ],
    recommendedNextStep: "Define the role framework with clear criteria, then evaluate candidate scenarios.",
  },
  PROCUREMENT: {
    id: "procurement",
    type: "PROCUREMENT",
    label: "Procurement Decision",
    description: "Evaluate vendor selection, procurement strategy, and supplier relationship decisions",
    titlePattern: "Procurement: [Product/Service]",
    descriptionPrompt: "Describe the procurement need, vendor landscape, budget constraints, and quality requirements.",
    priority: "MEDIUM",
    suggestedObjectives: [
      "Select the best vendor for quality, cost, and reliability",
      "Ensure procurement aligns with organizational standards",
      "Optimize total cost of ownership over contract period",
      "Build sustainable supplier relationships",
    ],
    suggestedConstraints: [
      "Budget ceiling and payment terms",
      "Quality and compliance standards",
      "Delivery timeline requirements",
      "Vendor qualification and due diligence requirements",
    ],
    suggestedAssumptions: [
      "Vendor proposals are accurate and complete",
      "Quality standards are clearly defined and measurable",
      "Delivery timelines are realistic and achievable",
      "Contract terms are negotiable within reasonable bounds",
    ],
    suggestedAlternatives: [
      "Single vendor with comprehensive offering",
      "Multiple vendors for different components",
      "Build in-house capability instead of procurement",
      "Delay procurement and reassess requirements",
    ],
    frameworkGuidance: {
      context: "Describe the procurement need, current state, vendor landscape, and organizational requirements.",
      purpose: "Define the procurement goal: cost reduction, quality improvement, capability building, or risk mitigation.",
      options: "List procurement options: single vendor, multi-vendor, in-house build, delay, or alternative solution.",
      criteria: "Define evaluation criteria: cost, quality, reliability, support, scalability, vendor reputation, compliance.",
      values: "Identify values: cost efficiency, quality, reliability, sustainability, ethical sourcing, innovation.",
      informationGaps: "List missing data: vendor references, detailed pricing, quality certifications, delivery track records.",
      certainty: "Assess confidence in vendor capabilities, pricing accuracy, quality claims, and delivery commitments.",
      assumptions: "Document assumptions about vendor stability, market pricing, quality consistency, and contract enforceability.",
    },
    scenarioSuggestions: [
      { name: "Optimal Vendor", description: "Best vendor selected with favorable terms, quality delivery, and strong partnership." },
      { name: "Acceptable Vendor", description: "Adequate vendor selected with some compromises on cost or quality." },
      { name: "Procurement Failure", description: "Vendor underperforms; quality issues, delays, or cost overruns occur." },
    ],
    commonRisks: [
      "Vendor underperformance or delivery failure",
      "Hidden costs beyond initial pricing",
      "Quality issues affecting downstream operations",
      "Vendor lock-in limiting future flexibility",
      "Supply chain disruption affecting delivery",
    ],
    recommendedNextStep: "Define vendor evaluation criteria in the Framework, then assess vendor scenarios.",
  },
  CUSTOM: {
    id: "custom",
    type: "CUSTOM",
    label: "Custom Decision",
    description: "Flexible template for specialized or unique decision scenarios",
    titlePattern: "Decision: [Custom Title]",
    descriptionPrompt: "Describe the decision context, stakeholders involved, and expected outcomes.",
    priority: "MEDIUM",
    suggestedObjectives: [
      "Define clear objectives for this decision",
      "Identify all relevant stakeholders and their interests",
      "Establish evaluation criteria aligned with organizational goals",
      "Document assumptions and constraints for transparency",
    ],
    suggestedConstraints: [
      "Budget and resource limitations",
      "Timeline and deadline requirements",
      "Regulatory or compliance obligations",
      "Organizational policies and governance requirements",
    ],
    suggestedAssumptions: [
      "Information available is accurate and current",
      "Stakeholder positions are stable during decision period",
      "External conditions remain relatively stable",
      "Resources will be available as planned",
    ],
    suggestedAlternatives: [
      "Proceed with primary option",
      "Modify scope or approach",
      "Defer decision for more information",
      "Pursue alternative solution",
    ],
    frameworkGuidance: {
      context: "Describe the decision background, stakeholders, current situation, and why this decision is needed now.",
      purpose: "Define what this decision aims to achieve and the desired end state.",
      options: "List all viable options including the status quo, modified approaches, and alternatives.",
      criteria: "Define how options will be evaluated: cost, impact, feasibility, risk, alignment with goals.",
      values: "Identify organizational values that should guide this decision.",
      informationGaps: "List what information is missing or uncertain that could affect the decision.",
      certainty: "Assess confidence level in available information, assumptions, and expected outcomes.",
      assumptions: "Document all assumptions that underpin the decision analysis.",
    },
    scenarioSuggestions: [
      { name: "Best Outcome", description: "Decision achieves all objectives with minimal risk and maximum benefit." },
      { name: "Expected Outcome", description: "Decision achieves most objectives with manageable trade-offs." },
      { name: "Worst Outcome", description: "Decision fails to achieve key objectives with significant negative impacts." },
    ],
    commonRisks: [
      "Incomplete information leading to suboptimal decision",
      "Stakeholder misalignment or resistance",
      "Resource constraints limiting implementation",
      "External factors changing decision context",
      "Implementation challenges after decision is made",
    ],
    recommendedNextStep: "Complete the Intake section with your specific objectives, constraints, and alternatives.",
  },
}

export function getTemplate(type: string): DecisionTemplate | undefined {
  return DECISION_TEMPLATES[type]
}

export function getAllTemplates(): DecisionTemplate[] {
  return Object.values(DECISION_TEMPLATES)
}

export function getTemplatesByType(types: string[]): DecisionTemplate[] {
  return types.map((t) => DECISION_TEMPLATES[t]).filter(Boolean)
}
