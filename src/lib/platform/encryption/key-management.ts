// ─── Key Lifecycle Management ───
// إدارة دورة حياة مفاتيح التشفير

import "server-only"

import crypto from "node:crypto"
import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "../audit-log"
import { getMasterKey, generateKeyId } from "./encryption-service"
import type { EncryptionKeyData, EncryptionAlgorithm } from "./types"

const ALGORITHM: EncryptionAlgorithm = "aes-256-gcm"

// ─── Initialize ───

/**
 * Create the initial active encryption key if none exists.
 * Safe to call on every startup — no-op if keys already exist.
 */
export async function initializeEncryption(): Promise<void> {
  const existing = await prisma.encryptionKey.findFirst({
    where: { status: "active" },
  })
  if (existing) {
    return
  }

  const keyId = generateKeyId()
  const masterKey = getMasterKey()
  const keyHash = computeKeyHash(masterKey, keyId)

  await prisma.encryptionKey.create({
    data: {
      keyId,
      algorithm: ALGORITHM,
      keyHash,
      status: "active",
      description: "Initial encryption key (auto-created)",
    },
  })

  await writePlatformAuditLog({
    productKey: "platform",
    action: "encryption.key.initialized",
    targetType: "EncryptionKey",
    targetLabel: keyId,
    severity: "info",
    metadata: { keyId, algorithm: ALGORITHM },
  })
}

// ─── Get Active Key ───

/**
 * Retrieve the currently active encryption key from the database.
 * Derives actual key material from master key + keyId (never stored).
 */
export async function getActiveKey(): Promise<EncryptionKeyData> {
  const record = await prisma.encryptionKey.findFirst({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  })

  if (!record) {
    throw new Error(
      "No active encryption key found. Call initializeEncryption() first.",
    )
  }

  return buildKeyData(record)
}

// ─── Get Key By ID ───

/**
 * Retrieve a specific encryption key by its keyId.
 */
export async function getKeyById(keyId: string): Promise<EncryptionKeyData> {
  const record = await prisma.encryptionKey.findUnique({
    where: { keyId },
  })

  if (!record) {
    throw new Error(`Encryption key not found: ${keyId}`)
  }

  return buildKeyData(record)
}

// ─── Rotate ───

/**
 * Rotate the active encryption key.
 * Marks current active key as "retired" and creates a new active key.
 *
 * @param createdBy - Optional identifier of who initiated the rotation
 * @returns The new active EncryptionKeyData
 */
export async function rotateActiveKey(
  createdBy?: string,
): Promise<EncryptionKeyData> {
  const current = await prisma.encryptionKey.findFirst({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  })

  if (current) {
    await prisma.encryptionKey.update({
      where: { id: current.id },
      data: {
        status: "retired",
        retiredAt: new Date(),
      },
    })
  }

  const newKeyId = generateKeyId()
  const masterKey = getMasterKey()
  const keyHash = computeKeyHash(masterKey, newKeyId)

  const record = await prisma.encryptionKey.create({
    data: {
      keyId: newKeyId,
      algorithm: ALGORITHM,
      keyHash,
      status: "active",
      createdBy,
      description: `Rotated from ${current?.keyId ?? "none"}`,
    },
  })

  await writePlatformAuditLog({
    productKey: "platform",
    action: "encryption.key.rotated",
    targetType: "EncryptionKey",
    targetId: record.id,
    targetLabel: newKeyId,
    actorId: createdBy,
    severity: "info",
    metadata: {
      previousKeyId: current?.keyId ?? null,
      newKeyId,
      algorithm: ALGORITHM,
    },
  })

  return buildKeyData(record)
}

// ─── Mark Compromised ───

/**
 * Emergency: mark a key as compromised and force rotation.
 *
 * @param keyId - The compromised key's ID
 * @param reason - Reason for marking compromised
 */
export async function markKeyCompromised(
  keyId: string,
  reason: string,
): Promise<void> {
  const record = await prisma.encryptionKey.findUnique({ where: { keyId } })
  if (!record) {
    throw new Error(`Cannot mark unknown key as compromised: ${keyId}`)
  }

  await prisma.encryptionKey.update({
    where: { id: record.id },
    data: {
      status: "compromised",
      retiredAt: new Date(),
    },
  })

  await writePlatformAuditLog({
    productKey: "platform",
    action: "encryption.key.compromised",
    targetType: "EncryptionKey",
    targetId: record.id,
    targetLabel: keyId,
    severity: "critical",
    metadata: { keyId, reason, algorithm: ALGORITHM },
  })

  // Force immediate rotation
  await rotateActiveKey()
}

// ─── List Keys ───

/**
 * List all encryption keys, optionally filtered by status.
 */
export async function listKeys(status?: string): Promise<EncryptionKeyData[]> {
  const where = status ? { status } : {}
  const records = await prisma.encryptionKey.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return records.map(buildKeyData)
}

// ─── Internal Helpers ───

interface EncryptionKeyRecord {
  keyId: string
  algorithm: string
  createdAt: Date
}

function buildKeyData(record: EncryptionKeyRecord): EncryptionKeyData {
  const masterKey = getMasterKey()
  const key = deriveRawKey(masterKey, record.keyId)

  return {
    keyId: record.keyId,
    key,
    algorithm: record.algorithm as EncryptionAlgorithm,
    createdAt: record.createdAt,
  }
}

/**
 * Derive the raw encryption key from master key + keyId.
 * Uses the same derivation as encryption-service (HMAC-SHA256).
 */
function deriveRawKey(masterKey: Buffer, keyId: string): Buffer {
  const hmac = crypto.createHmac("sha256", `field-key:${keyId}`)
  hmac.update(masterKey)
  return hmac.digest().subarray(0, 32)
}

/**
 * Compute SHA-256 hash of the derived key material for verification.
 * Never stores the actual key in the database.
 */
function computeKeyHash(masterKey: Buffer, keyId: string): string {
  const derived = deriveRawKey(masterKey, keyId)
  return crypto.createHash("sha256").update(derived).digest("hex")
}
