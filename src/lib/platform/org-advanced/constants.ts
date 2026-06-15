// Shared constants for Org Advanced — no Prisma dependency

export const LIFECYCLE_EVENT_TYPES = [
  'CREATED',
  'UPDATED',
  'USER_ADDED',
  'USER_REMOVED',
  'SETTINGS_CHANGED',
  'HIERARCHY_CHANGED',
  'SUSPENDED',
  'REACTIVATED',
  'MERGED',
] as const

export type LifecycleEventType = (typeof LIFECYCLE_EVENT_TYPES)[number]

export const KNOWN_SETTINGS: Record<string, string> = {
  default_locale: 'ar',
  timezone: 'Asia/Riyadh',
  max_users: '100',
  require_mfa: 'false',
  audit_retention_days: '365',
  content_approval_required: 'true',
}

export const ORG_HEALTH_WEIGHTS = {
  hasSettingsConfigured: 20,
  hasActiveUsers: 25,
  hasHierarchy: 15,
  hasRecentActivity: 20,
  noCriticalEvents: 20,
} as const
