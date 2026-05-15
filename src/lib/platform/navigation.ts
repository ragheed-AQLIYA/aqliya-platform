// ============================================
// AQLIYA — Navigation Contracts
// ============================================
// Shared navigation semantics across all modules

import type { EntityModule, EntityType } from "./types"

export interface NavigationItem {
  id: string
  label: string
  labelAr?: string
  href: string
  icon: string
  module: EntityModule
  children?: NavigationItem[]
  badge?: number
  disabled?: boolean
}

export interface CommandDefinition {
  id: string
  label: string
  labelAr?: string
  category: CommandCategory
  action: CommandAction
  shortcut?: string
  icon?: string
  module?: EntityModule
  disabled?: boolean
  context?: CommandContext
}

export type CommandCategory =
  | "navigate"
  | "module"
  | "create"
  | "review"
  | "analyze"
  | "recent"
  | "settings"
  | "entity"
  | "workflow"

export type CommandAction =
  | { type: "navigate"; href: string }
  | { type: "create"; entityType: EntityType; href: string }
  | { type: "review"; entityId: string; entityType: EntityType }
  | { type: "analyze"; entityId: string; entityType: EntityType }
  | { type: "switch-module"; module: EntityModule }
  | { type: "action"; action: string; payload?: Record<string, unknown> }

export interface CommandContext {
  currentModule?: EntityModule
  currentEntity?: { id: string; type: EntityType }
  selection?: { ids: string[]; type: EntityType }
}

export interface QuickAction {
  id: string
  label: string
  labelAr?: string
  icon: string
  action: string
  shortcut?: string
  variant: "primary" | "secondary" | "ghost"
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  // Platform
  {
    id: "nav-decisions",
    label: "Decision Intelligence",
    labelAr: "الذكاء القرارات",
    href: "/decisions",
    icon: "layout-dashboard",
    module: "decision",
  },
  {
    id: "nav-organizations",
    label: "Organizations",
    labelAr: "المنظمات",
    href: "/organizations",
    icon: "users",
    module: "decision",
  },
  {
    id: "nav-intelligence",
    label: "Intelligence",
    labelAr: "الذكاء",
    href: "/intelligence/sectors",
    icon: "brain",
    module: "decision",
  },
  {
    id: "nav-settings",
    label: "Settings",
    labelAr: "الإعدادات",
    href: "/settings",
    icon: "settings",
    module: "decision",
  },
  // AuditOS
  {
    id: "nav-audit-dashboard",
    label: "Dashboard",
    labelAr: "لوحة التحكم",
    href: "/audit",
    icon: "layout-dashboard",
    module: "audit",
  },
  {
    id: "nav-audit-engagements",
    label: "Engagements",
    labelAr: "المهام",
    href: "/audit",
    icon: "shield-check",
    module: "audit",
  },
  {
    id: "nav-audit-evidence",
    label: "Evidence",
    labelAr: "الأدلة",
    href: "/audit",
    icon: "folder-open",
    module: "audit",
  },
  {
    id: "nav-audit-findings",
    label: "Findings",
    labelAr: "الملاحظات",
    href: "/audit",
    icon: "search-check",
    module: "audit",
  },
  {
    id: "nav-audit-review",
    label: "Reviews",
    labelAr: "المراجعات",
    href: "/audit",
    icon: "eye",
    module: "audit",
  },
  {
    id: "nav-audit-approval",
    label: "Approval",
    labelAr: "الموافقة",
    href: "/audit",
    icon: "shield-check",
    module: "audit",
  },
  // SalesOS
  {
    id: "nav-sales-dashboard",
    label: "Dashboard",
    labelAr: "لوحة التحكم",
    href: "/sales",
    icon: "layout-dashboard",
    module: "sales",
  },
  {
    id: "nav-sales-pipeline",
    label: "Pipeline",
    labelAr: "قناة المبيعات",
    href: "/sales",
    icon: "trending-up",
    module: "sales",
  },
  {
    id: "nav-sales-deals",
    label: "Deals",
    labelAr: "الصفقات",
    href: "/sales",
    icon: "target",
    module: "sales",
  },
  {
    id: "nav-sales-accounts",
    label: "Accounts",
    labelAr: "الحسابات",
    href: "/sales",
    icon: "building2",
    module: "sales",
  },
]

export function getNavigationForModule(module: EntityModule): NavigationItem[] {
  return NAVIGATION_ITEMS.filter((item) => item.module === module || item.module === "platform")
}
