// ─── Vault Encryption (تشفير الخزنة) ───
// تشفير AES-256-GCM مستقل باستخدام مفتاح رئيسي من المتغيرات البيئية

import crypto from "crypto"

interface EncryptedPayload {
  iv: string
  tag: string
  ciphertext: string
}

function getVaultMasterKey(): Buffer {
  const encoded = process.env.ENCRYPTION_VAULT_KEY
  if (!encoded) {
    throw new Error("ENCRYPTION_VAULT_KEY environment variable is required")
  }
  const key = Buffer.from(encoded, "base64")
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_VAULT_KEY must be a base64-encoded 32-byte key")
  }
  return key
}

function deriveSecretKey(secretKeyIdentifier: string): Buffer {
  const masterKey = getVaultMasterKey()
  return crypto.createHmac("sha256", masterKey).update(secretKeyIdentifier).digest()
}

/**
 * تشفير نص عادي باستخدام AES-256-GCM مع مفتاح مشتق لكل سر
 */
export function encryptSecret(plaintext: string): { encryptedValue: string; keyIdentifier: string } {
  const keyIdentifier = crypto.randomUUID()
  const secretKey = deriveSecretKey(keyIdentifier)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey, iv)

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  const payload: EncryptedPayload = {
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: encrypted.toString("base64"),
  }

  return { encryptedValue: JSON.stringify(payload), keyIdentifier }
}

/**
 * فك تشفير قيمة مشفرة باستخدام معرف المفتاح
 */
export function decryptSecret(encryptedValue: string, keyIdentifier: string): string {
  const secretKey = deriveSecretKey(keyIdentifier)
  const payload: EncryptedPayload = JSON.parse(encryptedValue)

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    secretKey,
    Buffer.from(payload.iv, "base64"),
  )
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ])

  return decrypted.toString("utf8")
}
