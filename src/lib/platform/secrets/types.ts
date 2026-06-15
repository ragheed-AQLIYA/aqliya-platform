// ─── Vault (إدارة الأسرار) Types ───
// أنواع نظام خزنة الأسرار الخاص بالمنصة

export interface VaultEntryInput {
  key: string
  value: string
  displayName?: string
  description?: string
  category?: string   // "api_key" | "database" | "credentials" | "certificate" | "token" | "general"
  environment?: string // "production" | "staging" | "development"
  organizationId?: string
  rotationPeriodDays?: number
  expiresAt?: string | Date
  metadata?: Record<string, unknown>
}

export interface VaultEntryData {
  id: string
  key: string
  displayName?: string
  description?: string
  category: string
  environment?: string
  status: string
  version: number
  lastRotatedAt?: Date
  lastAccessedAt?: Date
  accessCount: number
  rotationPeriodDays: number
  expiresAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface VaultSecretResult {
  id: string
  key: string
  value: string
  version: number
  keyIdentifier: string
  metadata?: Record<string, unknown>
}

export interface VaultAuditPayload {
  action:
    | "secret.created"
    | "secret.read"
    | "secret.updated"
    | "secret.deleted"
    | "secret.rotated"
    | "secret.compromised"
    | "secret.archived"
  key: string
  category?: string
  version?: number
  metadata?: Record<string, unknown>
}

export type VaultPermission = "manage" | "read" | "admin"
