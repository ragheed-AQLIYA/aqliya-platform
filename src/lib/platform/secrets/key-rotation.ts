// ─── Key Rotation (تدوير المفاتيح) ───
// محرك التدوير الدوري للأسرار

import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "../audit-log"
import { encryptSecret, decryptSecret } from "./vault-encryption"
import type { VaultEntryData, VaultSecretResult } from "./types"

// ─── Rotation operations ───

/**
 * جلب الأسرار المستحقة للتدوير
 * (آخر تدوير + فترة التدوير < الآن) أو الأسرار المخترقة
 */
export async function getSecretsDueForRotation(): Promise<VaultEntryData[]> {
  const now = new Date()

  const expired = await prisma.vaultEntry.findMany({
    where: {
      deletedAt: null,
      status: { not: "ARCHIVED" },
      OR: [
        { status: "COMPROMISED" },
        {
          lastRotatedAt: { not: null },
        },
      ],
    },
  })

  const due: VaultEntryData[] = []

  for (const entry of expired) {
    if (entry.status === "COMPROMISED") {
      due.push(mapEntry(entry))
      continue
    }

    if (entry.lastRotatedAt) {
      const dueDate = new Date(entry.lastRotatedAt)
      dueDate.setDate(dueDate.getDate() + entry.rotationPeriodDays)

      if (dueDate <= now) {
        due.push(mapEntry(entry))
      }
    }
  }

  return due
}

/**
 * تدوير سر واحد: فك التشفير، إعادة تشفير بمفتاح جديد، إنشاء نسخة
 */
export async function rotateSecret(
  key: string,
  userId: string,
): Promise<VaultSecretResult> {
  const entry = await prisma.vaultEntry.findFirst({
    where: { key, deletedAt: null },
  })

  if (!entry) {
    throw new Error(`Secret "${key}" not found`)
  }

  const currentValue = decryptSecret(entry.encryptedValue, entry.keyIdentifier)
  const { encryptedValue: newEncryptedValue, keyIdentifier: newKeyIdentifier } =
    encryptSecret(currentValue)

  const updated = await prisma.vaultEntry.update({
    where: { id: entry.id },
    data: {
      encryptedValue: newEncryptedValue,
      keyIdentifier: newKeyIdentifier,
      previousVersionId: entry.id,
      version: entry.version + 1,
      lastRotatedAt: new Date(),
      status: "ROTATED" as const,
    },
  })

  await writePlatformAuditLog({
    productKey: "vault",
    action: "secret.rotated",
    actorId: userId,
    targetType: "VaultEntry",
    targetLabel: key,
    targetId: key,
    severity: "warning",
    metadata: {
      previousVersion: entry.version,
      newVersion: updated.version,
      category: entry.category,
    } as Record<string, unknown>,
  })

  return {
    id: updated.id,
    key: updated.key,
    value: currentValue,
    version: updated.version,
    keyIdentifier: newKeyIdentifier,
    metadata: updated.metadata as Record<string, unknown> | undefined,
  }
}

/**
 * تدوير جميع الأسرار المستحقة
 */
export async function rotateAllDueSecrets(
  userId?: string,
): Promise<{ rotated: number; failed: Array<{ key: string; error: string }> }> {
  const due = await getSecretsDueForRotation()
  const effectiveUserId = userId ?? "system"
  const failed: Array<{ key: string; error: string }> = []
  let rotated = 0

  for (const secret of due) {
    try {
      await rotateSecret(secret.key, effectiveUserId)
      rotated++
    } catch (err) {
      failed.push({
        key: secret.key,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }
  }

  return { rotated, failed }
}

/**
 * تدوير جميع الأسرار في تصنيف معين
 */
export async function bulkRotateByCategory(
  category: string,
  userId: string,
): Promise<number> {
  const entries = await prisma.vaultEntry.findMany({
    where: {
      category,
      deletedAt: null,
      status: { not: "ARCHIVED" },
    },
  })

  let rotated = 0

  for (const entry of entries) {
    try {
      await rotateSecret(entry.key, userId)
      rotated++
    } catch {
      // Skip failed rotations per secret
    }
  }

  return rotated
}

/**
 * تقرير صحة التدوير
 */
export async function getRotationHealth(): Promise<{
  total: number
  due: number
  compliant: number
  nonCompliant: number
}> {
  const allActive = await prisma.vaultEntry.findMany({
    where: {
      deletedAt: null,
      status: { not: "ARCHIVED" },
    },
  })

  const now = new Date()
  let dueCount = 0
  let nonCompliant = 0

  for (const entry of allActive) {
    if (entry.status === "COMPROMISED") {
      dueCount++
      nonCompliant++
      continue
    }

    if (entry.lastRotatedAt) {
      const dueDate = new Date(entry.lastRotatedAt)
      dueDate.setDate(dueDate.getDate() + entry.rotationPeriodDays)

      if (dueDate <= now) {
        dueCount++
        nonCompliant++
      }
    }
  }

  return {
    total: allActive.length,
    due: dueCount,
    compliant: allActive.length - nonCompliant,
    nonCompliant,
  }
}

// ─── Helpers ───

function mapEntry(e: {
  id: string
  key: string
  displayName: string | null
  description: string | null
  category: string
  environment: string | null
  status: string
  version: number
  lastRotatedAt: Date | null
  lastAccessedAt: Date | null
  accessCount: number
  rotationPeriodDays: number
  expiresAt: Date | null
  metadata: unknown
  createdAt: Date
  updatedAt: Date
}): VaultEntryData {
  return {
    id: e.id,
    key: e.key,
    displayName: e.displayName ?? undefined,
    description: e.description ?? undefined,
    category: e.category,
    environment: e.environment ?? undefined,
    status: e.status,
    version: e.version,
    lastRotatedAt: e.lastRotatedAt ?? undefined,
    lastAccessedAt: e.lastAccessedAt ?? undefined,
    accessCount: e.accessCount,
    rotationPeriodDays: e.rotationPeriodDays,
    expiresAt: e.expiresAt ?? undefined,
    metadata: e.metadata as Record<string, unknown> | undefined,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }
}
