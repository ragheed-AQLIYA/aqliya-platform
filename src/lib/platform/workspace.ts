// ============================================
// AQLIYA — Workspace Context Contracts
// ============================================
// Shared workspace semantics across all modules

import type { EntityModule, EntityType, PlatformEntity } from "./types"
import type { IntelligenceSummary, WorkflowHealth } from "./intelligence"

export interface WorkspaceContext {
  currentModule: EntityModule
  currentEntity?: PlatformEntity
  currentWorkflow?: WorkflowHealth
  intelligence?: IntelligenceSummary
  recentEntities: RecentEntity[]
  contextualActions: ContextualAction[]
  breadcrumbs: Breadcrumb[]
  permissions: WorkspacePermissions
}

export interface RecentEntity {
  id: string
  type: EntityType
  module: EntityModule
  title: string
  status: string
  accessedAt: Date
  href: string
}

export interface ContextualAction {
  id: string
  label: string
  labelAr?: string
  icon: string
  action: string
  variant: "primary" | "secondary" | "ghost" | "destructive"
  disabled?: boolean
  shortcut?: string
  module?: EntityModule
}

export interface Breadcrumb {
  label: string
  labelAr?: string
  href?: string
  module?: EntityModule
}

export interface WorkspacePermissions {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canReview: boolean
  canApprove: boolean
  canPublish: boolean
  canExport: boolean
}

export interface ModuleConfig {
  id: EntityModule
  name: string
  nameAr: string
  icon: string
  href: string
  accentColor: string
  description: string
  features: string[]
}

export const MODULES: ModuleConfig[] = [
  {
    id: "audit",
    name: "AuditOS",
    nameAr: "نظام التدقيق",
    icon: "shield-check",
    href: "/audit",
    accentColor: "module-audit",
    description: "Financial intelligence and audit assurance",
    features: ["engagements", "evidence", "findings", "review", "approval"],
  },
  {
    id: "decision",
    name: "DecisionOS",
    nameAr: "نظام القرارات",
    icon: "brain",
    href: "/decisions",
    accentColor: "module-decision",
    description: "Executive decision infrastructure",
    features: ["decisions", "scenarios", "simulation", "recommendations"],
  },
  {
    id: "sales",
    name: "SalesOS",
    nameAr: "نظام المبيعات",
    icon: "trending-up",
    href: "/sales",
    accentColor: "module-sales",
    description: "Revenue intelligence and pipeline operations",
    features: ["pipeline", "deals", "accounts", "activities"],
  },
]

export function getModuleConfig(moduleId: EntityModule): ModuleConfig {
  return MODULES.find((m) => m.id === moduleId) || MODULES[0]
}

export function getModuleHref(moduleId: EntityModule): string {
  return getModuleConfig(moduleId).href
}
