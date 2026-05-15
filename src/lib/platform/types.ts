// ============================================
// AQLIYA — Shared Platform Entity Types
// ============================================
// Unified entity contracts across all modules

export type EntityModule = "audit" | "sales" | "decision" | "platform"

export type EntityType =
  | "organization"
  | "client"
  | "engagement"
  | "deal"
  | "decision"
  | "evidence"
  | "finding"
  | "recommendation"
  | "approval"
  | "workflow"
  | "activity"
  | "signal"
  | "report"
  | "document"
  | "stakeholder"

export interface PlatformEntity {
  id: string
  type: EntityType
  module: EntityModule
  title: string
  description?: string
  status: string
  createdAt: Date
  updatedAt: Date
  organizationId: string
  ownerId?: string
  metadata?: Record<string, unknown>
}

export interface EntityRelation {
  id: string
  sourceId: string
  sourceType: EntityType
  targetId: string
  targetType: EntityType
  relationType: "parent" | "child" | "related" | "evidence" | "approval" | "dependency" | "reference"
  strength?: number
  metadata?: Record<string, unknown>
}

export interface EntityReference {
  id: string
  type: EntityType
  module: EntityModule
  title: string
  status: string
  href?: string
}

export interface EntityBreadcrumb {
  label: string
  href?: string
  module?: EntityModule
}

export type EntityStatus =
  | "draft"
  | "active"
  | "in_progress"
  | "under_review"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "published"
  | "archived"
  | "blocked"
  | "completed"
  | "cancelled"
