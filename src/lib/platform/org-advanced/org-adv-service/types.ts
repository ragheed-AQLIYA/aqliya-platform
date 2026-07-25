import type { LifecycleEventType } from '../constants'

export interface OrgHierarchyNode {
  id: string
  organizationId: string
  parentOrgId: string | null
  level: number
  sortOrder: number
  metadata: Record<string, unknown> | null
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface OrgSetting {
  id: string
  organizationId: string
  key: string
  value: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface OrgLifecycleEvent {
  id: string
  organizationId: string
  eventType: string
  description: string
  metadata: Record<string, unknown> | null
  actorId: string | null
  createdAt: Date
}

export interface OrgHealth {
  score: number
  breakdown: {
    hasSettings: { score: number; max: number; detail: string }
    hasActiveUsers: { score: number; max: number; detail: string }
    hasHierarchy: { score: number; max: number; detail: string }
    recentActivity: { score: number; max: number; detail: string }
    noCriticalEvents: { score: number; max: number; detail: string }
  }
}

export interface CreateOrgNodeData {
  sortOrder?: number
  metadata?: Record<string, unknown>
}

export interface LifecycleEventFilter {
  eventType?: LifecycleEventType | string
  fromDate?: Date
  toDate?: Date
}
