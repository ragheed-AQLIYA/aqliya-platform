import "server-only"

import * as crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"

// Local types (aliases for the vault's data shapes)
interface SecretEntry {
  key: string
  value: string
  description?: string
  rotationPeriodDays?: number | null
  lastRotatedAt?: Date | null
  createdAt: Date
}

interface SecretsVault {
  get(key: string): Promise<string | null>
  set(key: string, value: string, description?: string): Promise<void>
  delete(key: string): Promise<boolean>
  list(): Promise<SecretEntry[]>
  rotate(key: string): Promise<void>
}

const ENCRYPTION_KEY_ENV = "VAULT_ENCRYPTION_KEY"

function getEncryptionKey(): Buffer {
  const key = process.env[ENCRYPTION_KEY_ENV]
  if (!key) {
    throw new Error("VAULT_ENCRYPTION_KEY is not set — required for secrets vault")
  }
  return crypto.scryptSync(key, "aqliya-vault-salt", 32)
}

function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  let encrypted = cipher.update(plaintext, "utf8", "hex")
  encrypted += cipher.final("hex")
  const tag = cipher.getAuthTag().toString("hex")
  return `${iv.toString("hex")}:${tag}:${encrypted}`
}

function decrypt(ciphertext: string): string {
  const key = getEncryptionKey()
  const [ivHex, tagHex, encrypted] = ciphertext.split(":")
  if (!ivHex || !tagHex || !encrypted) {
    throw new Error("Invalid ciphertext format")
  }
  const iv = Buffer.from(ivHex, "hex")
  const tag = Buffer.from(tagHex, "hex")
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
  decipher.setAuthTag(tag)
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

class SecretsVaultImpl implements SecretsVault {
  async get(key: string): Promise<string | null> {
    const row = await prisma.platformSecret.findUnique({ where: { key } })
    if (!row) return null
    return decrypt(row.encryptedValue)
  }

  async set(key: string, value: string, description?: string): Promise<void> {
    const encryptedValue = encrypt(value)

    await prisma.platformSecret.upsert({
      where: { key },
      update: { encryptedValue, updatedAt: new Date() },
      create: { key, encryptedValue, description },
    })

    await writePlatformAuditLog({
      productKey: "platform",
      action: "secret.set",
      targetType: "platform_secret",
      targetId: key,
      actorId: "system",
      severity: "info",
      status: "recorded",
      sourceSystem: "secrets_vault",
      metadata: { key },
    })
  }

  async delete(key: string): Promise<boolean> {
    const existing = await prisma.platformSecret.findUnique({ where: { key } })
    if (!existing) return false

    await prisma.platformSecret.delete({ where: { key } })

    await writePlatformAuditLog({
      productKey: "platform",
      action: "secret.delete",
      targetType: "platform_secret",
      targetId: key,
      actorId: "system",
      severity: "warn",
      status: "recorded",
      sourceSystem: "secrets_vault",
      metadata: { key },
    })

    return true
  }

  async list(): Promise<SecretEntry[]> {
    const rows = await prisma.platformSecret.findMany({
      orderBy: { createdAt: "desc" },
    })

    return rows.map((r) => ({
      key: r.key,
      value: "***encrypted***",
      description: r.description ?? undefined,
      rotationPeriodDays: r.rotationPeriodDays ?? undefined,
      lastRotatedAt: r.lastRotatedAt ?? undefined,
      createdAt: r.createdAt,
    }))
  }

  async rotate(key: string): Promise<void> {
    const row = await prisma.platformSecret.findUnique({ where: { key } })
    if (!row) throw new Error(`Secret "${key}" not found`)

    const decrypted = decrypt(row.encryptedValue)
    const reEncrypted = encrypt(decrypted)

    await prisma.platformSecret.update({
      where: { key },
      data: { encryptedValue: reEncrypted, lastRotatedAt: new Date() },
    })

    await writePlatformAuditLog({
      productKey: "platform",
      action: "secret.rotate",
      targetType: "platform_secret",
      targetId: key,
      actorId: "system",
      severity: "info",
      status: "recorded",
      sourceSystem: "secrets_vault",
      metadata: { key },
    })
  }
}

export const secretsVault: SecretsVault = new SecretsVaultImpl()
