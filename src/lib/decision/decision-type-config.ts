import type { DecisionType } from "@prisma/client"

export interface DecisionModuleConfig {
  id: string
  label: string
  href: string
  description: string
  required: boolean
  tenderOnly: boolean
}

export interface DecisionTypeConfig {
  type: DecisionType
  label: string
  description: string
  icon: string
  modules: DecisionModuleConfig[]
  requiresTenderProfile: boolean
  defaultPriority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}

const GENERIC_MODULES: DecisionModuleConfig[] = [
  { id: "intake", label: "Intake", href: "/intake", description: "Define objectives, alternatives, and risks", required: true, tenderOnly: false },
  { id: "framework", label: "Framework", href: "/framework", description: "Capture context, purpose, options, and criteria", required: true, tenderOnly: false },
  { id: "scenarios", label: "Scenarios", href: "/scenarios", description: "Define possible future paths", required: true, tenderOnly: false },
  { id: "risks", label: "Risks", href: "/risks", description: "Analyze risks and trade-offs per scenario", required: true, tenderOnly: false },
  { id: "recommendation", label: "Recommendation", href: "/recommendation", description: "Define recommended action and rationale", required: true, tenderOnly: false },
  { id: "simulation", label: "Simulation", href: "/simulation", description: "Run scenario-based scoring simulation", required: false, tenderOnly: false },
  { id: "insight", label: "Insight", href: "/insight", description: "Strategic decision insight summary", required: false, tenderOnly: false },
  { id: "what-to-do", label: "What to Do", href: "/what-to-do", description: "Immediate next steps and blockers", required: false, tenderOnly: false },
  { id: "executive", label: "Executive", href: "/overview", description: "Executive quality overview", required: false, tenderOnly: false },
  { id: "sector", label: "Sector", href: "/sector", description: "Sector assignment and benchmarks", required: false, tenderOnly: false },
  { id: "signals", label: "Signals", href: "/signals", description: "Post-decision monitoring signals", required: false, tenderOnly: false },
  { id: "alerts", label: "Alerts", href: "/alerts", description: "Risk alerts requiring human review", required: false, tenderOnly: false },
  { id: "governance", label: "Governance", href: "/governance", description: "Roles, audit trail, and approvals", required: false, tenderOnly: false },
  { id: "outcome", label: "Outcome", href: "/outcome", description: "Track actual vs expected outcomes", required: false, tenderOnly: false },
  { id: "report", label: "Report", href: "/report", description: "Printable decision report", required: false, tenderOnly: false },
]

const TENDER_MODULE: DecisionModuleConfig = {
  id: "tender",
  label: "Tender",
  href: "/tender",
  description: "Tender-specific financial and capacity details",
  required: false,
  tenderOnly: true,
}

export const DECISION_TYPE_CONFIGS: Record<DecisionType, DecisionTypeConfig> = {
  TENDER: {
    type: "TENDER",
    label: "Tender",
    description: "Evaluate whether to bid on or accept a tender/proposal",
    icon: "FileText",
    modules: [...GENERIC_MODULES, TENDER_MODULE],
    requiresTenderProfile: true,
    defaultPriority: "HIGH",
  },
  INVESTMENT: {
    type: "INVESTMENT",
    label: "Investment",
    description: "Evaluate a capital or operational investment decision",
    icon: "TrendingUp",
    modules: GENERIC_MODULES,
    requiresTenderProfile: false,
    defaultPriority: "HIGH",
  },
  EXPANSION: {
    type: "EXPANSION",
    label: "Expansion",
    description: "Evaluate business or market expansion opportunities",
    icon: "MoveUpRight",
    modules: GENERIC_MODULES,
    requiresTenderProfile: false,
    defaultPriority: "MEDIUM",
  },
  PROCUREMENT: {
    type: "PROCUREMENT",
    label: "Procurement",
    description: "Evaluate vendor selection or procurement decisions",
    icon: "ShoppingCart",
    modules: GENERIC_MODULES,
    requiresTenderProfile: false,
    defaultPriority: "MEDIUM",
  },
  HIRING: {
    type: "HIRING",
    label: "Hiring",
    description: "Evaluate key hiring or team structure decisions",
    icon: "Users",
    modules: GENERIC_MODULES,
    requiresTenderProfile: false,
    defaultPriority: "MEDIUM",
  },
  PARTNERSHIP: {
    type: "PARTNERSHIP",
    label: "Partnership",
    description: "Evaluate strategic partnership or collaboration decisions",
    icon: "Handshake",
    modules: GENERIC_MODULES,
    requiresTenderProfile: false,
    defaultPriority: "MEDIUM",
  },
  PRICING: {
    type: "PRICING",
    label: "Pricing",
    description: "Evaluate pricing strategy or adjustment decisions",
    icon: "Tag",
    modules: GENERIC_MODULES,
    requiresTenderProfile: false,
    defaultPriority: "MEDIUM",
  },
  STRATEGIC: {
    type: "STRATEGIC",
    label: "Strategic",
    description: "Evaluate high-level strategic direction decisions",
    icon: "Compass",
    modules: GENERIC_MODULES,
    requiresTenderProfile: false,
    defaultPriority: "HIGH",
  },
  OPERATIONS: {
    type: "OPERATIONS",
    label: "Operations",
    description: "Evaluate operational process or resource decisions",
    icon: "Settings",
    modules: GENERIC_MODULES,
    requiresTenderProfile: false,
    defaultPriority: "MEDIUM",
  },
  CUSTOM: {
    type: "CUSTOM",
    label: "Custom",
    description: "Custom decision type for specialized use cases",
    icon: "Box",
    modules: GENERIC_MODULES,
    requiresTenderProfile: false,
    defaultPriority: "MEDIUM",
  },
}

export function getDecisionTypeConfig(type: DecisionType): DecisionTypeConfig {
  return DECISION_TYPE_CONFIGS[type] ?? DECISION_TYPE_CONFIGS.CUSTOM
}

export function getDecisionWorkflow(type: DecisionType): DecisionModuleConfig[] {
  const config = getDecisionTypeConfig(type)
  return config.modules.filter((m) => m.required)
}

export function getAllModules(type: DecisionType): DecisionModuleConfig[] {
  return getDecisionTypeConfig(type).modules
}

export function canUseTenderModule(type: DecisionType): boolean {
  return type === "TENDER"
}

export function getTenderModule(): DecisionModuleConfig {
  return TENDER_MODULE
}
