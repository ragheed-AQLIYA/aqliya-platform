// ─── Vault Service (خدمة الخزنة) ───
// إدارة آمنة للأسرار: تشفير، تخزين، تدقيق

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { writePlatformAuditLog } from "../audit-log"
import { encryptSecret, decryptSecret } from "./vault-encryption"
import type { VaultEntryInput, VaultSecretResult, VaultEntryData, VaultAuditPayload } from "./types"

// ─── Audit helper ───

async function writeVaultAudit(
  payload: VaultAuditPayload,
  actorId: string,
  severity?: string,
): Promise<void> {
  await writePlatformAuditLog({
    productKey: "vault",
    action: payload.action,
    actorId,
    targetType: "VaultEntry",
    targetLabel: payload.key,
    targetId: payload.key,
    severity: severity ?? "info",
    metadata: {
      ...payload.metadata,
      category: payload.category,
      version: payload.version,
    } as Record<string, unknown>,
  })
}

// ─── Validation ───

function validateKeyName(key: string): void {
  if (!/^[a-zA-Z0-9._-]+$/.test(key)) {
    throw new Error(`Invalid key name: "${key}". Use only letters, numbers, dots, hyphens, underscores.`)
  }
}

// ─── Core operations ───

/**
 * تخزين سر جديد في الخزنة
 * تشفير القيمة، إنشاء سجل، تسجيل التدقيق
 */
export async function storeSecret(
  input: VaultEntryInput,
  userId: string,
): Promise<VaultSecretResult> {
  validateKeyName(input.key)

  const existing = await prisma.vaultEntry.findFirst({
    where: { key: input.key, organizationId: input.organizationId ?? null, deletedAt: null },
  })

  if (existing) {
    throw new Error(`Secret with key "${input.key}" already exists. Use updateSecret to modify.`)
  }

  const { encryptedValue, keyIdentifier } = encryptSecret(input.value)

  const entry = await prisma.vaultEntry.create({
    data: {
      key: input.key,
      displayName: input.displayName ?? null,
      encryptedValue,
      keyIdentifier,
      description: input.description ?? null,
      category: input.category ?? "general",
      environment: input.environment ?? null,
      rotationPeriodDays: input.rotationPeriodDays ?? 90,
      createdById: userId,
      organizationId: input.organizationId ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      metadata: input.metadata as Prisma.InputJsonValue ?? undefined,
      lastRotatedAt: new Date(),
    },
  })

  await writeVaultAudit(
    {
      action: "secret.created",
      key: input.key,
      category: input.category,
      version: entry.version,
    },
    userId,
  )

  return {
    id: entry.id,
    key: entry.key,
    value: input.value,
    version: entry.version,
    keyIdentifier: entry.keyIdentifier,
    metadata: entry.metadata as Record<string, unknown> | undefined,
  }
}

/**
 * استرجاع سر مع فك التشفير
 * يتطلب صلاحية الوصول للمنظمة
 */
export async function getSecret(
  key: string,
  userId: string,
  organizationId?: string,
): Promise<VaultSecretResult> {
  const entry = await prisma.vaultEntry.findFirst({
    where: { key, organizationId: organizationId ?? null, deletedAt: null, status: { not: "ARCHIVED" } },
  })

  if (!entry) {
    throw new Error(`Secret "${key}" not found`)
  }

  const value = decryptSecret(entry.encryptedValue, entry.keyIdentifier)

  await prisma.vaultEntry.update({
    where: { id: entry.id },
    data: {
      lastAccessedAt: new Date(),
      accessCount: { increment: 1 },
    },
  })

  void writeVaultAudit(
    {
      action: "secret.read",
      key,
      category: entry.category,
      version: entry.version,
      metadata: { accessCount: entry.accessCount + 1 },
    },
    userId,
  )

  return {
    id: entry.id,
    key: entry.key,
    value,
    version: entry.version,
    keyIdentifier: entry.keyIdentifier,
    metadata: entry.metadata as Record<string, unknown> | undefined,
  }
}

/**
 * استرجاع بيانات السر فقط (بدون القيمة المفكوكة)
 * لا يسجل تدقيق — حساسية أقل
 */
export async function getSecretMetadata(
  key: string,
  organizationId?: string,
): Promise<VaultEntryData | null> {
  const entry = await prisma.vaultEntry.findFirst({
    where: { key, organizationId: organizationId ?? null, deletedAt: null },
  })

  if (!entry) return null

  return {
    id: entry.id,
    key: entry.key,
    displayName: entry.displayName ?? undefined,
    description: entry.description ?? undefined,
    category: entry.category,
    environment: entry.environment ?? undefined,
    status: entry.status,
    version: entry.version,
    lastRotatedAt: entry.lastRotatedAt ?? undefined,
    lastAccessedAt: entry.lastAccessedAt ?? undefined,
    accessCount: entry.accessCount,
    rotationPeriodDays: entry.rotationPeriodDays,
    expiresAt: entry.expiresAt ?? undefined,
    metadata: entry.metadata as Record<string, unknown> | undefined,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }
}

/**
 * قائمة الأسرار (بدون قيم مفوككة)
 */
export async function listSecrets(
  options?: {
    category?: string
    organizationId?: string
    status?: string
  },
): Promise<VaultEntryData[]> {
  const where: Record<string, unknown> = { deletedAt: null }

  if (options?.category) where.category = options.category
  if (options?.organizationId) where.organizationId = options.organizationId
  if (options?.status) where.status = options.status

  const entries = await prisma.vaultEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return entries.map((entry) => ({
    id: entry.id,
    key: entry.key,
    displayName: entry.displayName ?? undefined,
    description: entry.description ?? undefined,
    category: entry.category,
    environment: entry.environment ?? undefined,
    status: entry.status,
    version: entry.version,
    lastRotatedAt: entry.lastRotatedAt ?? undefined,
    lastAccessedAt: entry.lastAccessedAt ?? undefined,
    accessCount: entry.accessCount,
    rotationPeriodDays: entry.rotationPeriodDays,
    expiresAt: entry.expiresAt ?? undefined,
    metadata: entry.metadata as Record<string, unknown> | undefined,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }))
}

/**
 * تحديث سر موجود
 * إذا تغيرت القيمة، إعادة تشفير مع نسخة جديدة من المفتاح
 */
export async function updateSecret(
  key: string,
  input: Partial<VaultEntryInput>,
  userId: string,
): Promise<VaultSecretResult> {
  const existing = await prisma.vaultEntry.findFirst({
    where: { key, deletedAt: null },
  })

  if (!existing) {
    throw new Error(`Secret "${key}" not found`)
  }

  let finalValue: string
  let newEncryptedValue = existing.encryptedValue
  let newKeyIdentifier = existing.keyIdentifier

  if (input.value !== undefined) {
    const encrypted = encryptSecret(input.value)
    newEncryptedValue = encrypted.encryptedValue
    newKeyIdentifier = encrypted.keyIdentifier
    finalValue = input.value
  } else {
    finalValue = decryptSecret(existing.encryptedValue, existing.keyIdentifier)
  }

  const updateData: Record<string, unknown> = {
    displayName: input.displayName ?? existing.displayName,
    description: input.description ?? existing.description ?? null,
    category: input.category ?? existing.category,
    environment: input.environment ?? existing.environment,
    rotationPeriodDays: input.rotationPeriodDays ?? existing.rotationPeriodDays,
    organizationId: input.organizationId ?? existing.organizationId,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : existing.expiresAt,
    metadata: input.metadata ?? existing.metadata,
  }

  if (input.value !== undefined) {
    updateData.encryptedValue = newEncryptedValue
    updateData.keyIdentifier = newKeyIdentifier
    updateData.previousVersionId = existing.id
    updateData.version = existing.version + 1
  }

  const updated = await prisma.vaultEntry.update({
    where: { id: existing.id },
    data: updateData,
  })

  await writeVaultAudit(
    {
      action: "secret.updated",
      key,
      category: updated.category,
      version: updated.version,
      metadata: { valueChanged: input.value !== undefined },
    },
    userId,
  )

  return {
    id: updated.id,
    key: updated.key,
    value: finalValue,
    version: updated.version,
    keyIdentifier: newKeyIdentifier,
    metadata: updated.metadata as Record<string, unknown> | undefined,
  }
}

/**
 * حذف ناعم لسر (تعيين deletedAt)
 */
export async function deleteSecret(key: string, userId: string): Promise<void> {
  const existing = await prisma.vaultEntry.findFirst({
    where: { key, deletedAt: null },
  })

  if (!existing) {
    throw new Error(`Secret "${key}" not found`)
  }

  await prisma.vaultEntry.update({
    where: { id: existing.id },
    data: { deletedAt: new Date() },
  })

  await writeVaultAudit(
    {
      action: "secret.deleted",
      key,
      category: existing.category,
      version: existing.version,
    },
    userId,
  )
}

/**
 * تعليم سر كمخترق — يجبر التدوير الفوري
 */
export async function markSecretCompromised(
  key: string,
  userId: string,
  reason: string,
): Promise<void> {
  const existing = await prisma.vaultEntry.findFirst({
    where: { key, deletedAt: null },
  })

  if (!existing) {
    throw new Error(`Secret "${key}" not found`)
  }

  await prisma.vaultEntry.update({
    where: { id: existing.id },
    data: { status: "COMPROMISED" as const },
  })

  await writeVaultAudit(
    {
      action: "secret.compromised",
      key,
      category: existing.category,
      version: existing.version,
      metadata: { reason },
    },
    userId,
    "critical",
  )
}
