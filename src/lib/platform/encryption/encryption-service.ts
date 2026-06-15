// ─── Core Encryption Service ───
// تشفير وفك تشفير على مستوى الحقول باستخدام AES-256-GCM

import "server-only"

import crypto from "node:crypto"
import type { EncryptedFieldValue, EncryptionAlgorithm } from "./types"

const ALGORITHM: EncryptionAlgorithm = "aes-256-gcm"
const IV_LENGTH = 12
const TAG_LENGTH = 16
const KEY_LENGTH = 32 // 256 bits

// ─── Master Key ───

let cachedMasterKey: Buffer | null = null

/**
 * Reads ENCRYPTION_MASTER_KEY env var (base64), derives 256-bit key via HKDF.
 * Caches in module-level variable after first load.
 */
export function getMasterKey(): Buffer {
  if (cachedMasterKey) {
    return cachedMasterKey
  }

  const encoded = process.env.ENCRYPTION_MASTER_KEY
  if (!encoded) {
    throw new Error(
      "ENCRYPTION_MASTER_KEY environment variable is not set. " +
      "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
    )
  }

  const raw = Buffer.from(encoded, "base64")
  if (raw.length < 16) {
    throw new Error(
      "ENCRYPTION_MASTER_KEY must be at least 16 bytes when decoded from base64",
    )
  }

  // HKDF-style derivation: HMAC-SHA256 with info salt
  const hmac = crypto.createHmac("sha256", "aqliya-encryption-master-v1")
  hmac.update(raw)
  const derived = hmac.digest().subarray(0, KEY_LENGTH)

  cachedMasterKey = derived
  return cachedMasterKey
}

/**
 * Generate a key ID based on version and timestamp.
 */
export function generateKeyId(): string {
  return `v1_${Date.now()}`
}

// ─── Key Derivation ───

/**
 * Derive a field-specific key from master key + keyId using HKDF-style derivation.
 */
function deriveFieldKey(masterKey: Buffer, keyId: string): Buffer {
  const hmac = crypto.createHmac("sha256", `field-key:${keyId}`)
  hmac.update(masterKey)
  return hmac.digest().subarray(0, KEY_LENGTH)
}

// ─── Encrypt ───

/**
 * Encrypt a plaintext string into a structured EncryptedFieldValue.
 * Generates random IV (12 bytes) and uses AES-256-GCM.
 *
 * @param plaintext - The value to encrypt
 * @param keyId - Optional key ID (defaults to "default")
 * @returns Structured encrypted value with base64-encoded fields
 */
export function encryptField(
  plaintext: string,
  keyId?: string,
): EncryptedFieldValue {
  const kid = keyId ?? "default"
  const masterKey = getMasterKey()
  const fieldKey = deriveFieldKey(masterKey, kid)
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, fieldKey, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf-8"),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    keyId: kid,
    algorithm: ALGORITHM,
  }
}

// ─── Decrypt ───

/**
 * Decrypt an EncryptedFieldValue back to plaintext.
 *
 * @param encrypted - The structured encrypted value
 * @returns The original plaintext string
 * @throws If authentication fails (tampered ciphertext or wrong key)
 */
export function decryptField(encrypted: EncryptedFieldValue): string {
  const masterKey = getMasterKey()
  const fieldKey = deriveFieldKey(masterKey, encrypted.keyId)

  const iv = Buffer.from(encrypted.iv, "base64")
  const tag = Buffer.from(encrypted.tag, "base64")
  const ciphertext = Buffer.from(encrypted.encrypted, "base64")

  const decipher = crypto.createDecipheriv(ALGORITHM, fieldKey, iv)
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])

  return decrypted.toString("utf-8")
}

// ─── Rotate ───

/**
 * Decrypt with old key, re-encrypt with new key.
 *
 * @param encrypted - Current encrypted field value
 * @param newKeyId - The new key ID to encrypt with
 * @returns New encrypted field value under the new key
 */
export function rotateField(
  encrypted: EncryptedFieldValue,
  newKeyId: string,
): EncryptedFieldValue {
  const plaintext = decryptField(encrypted)
  return encryptField(plaintext, newKeyId)
}

// ─── Object-level helpers ───

/**
 * Encrypt specified fields of an object in-place.
 * Encrypted values are stored as JSON-serialized EncryptedFieldValue.
 *
 * @param obj - The source object (mutable)
 * @param fields - Array of field names to encrypt
 * @returns The same object with specified fields encrypted
 */
export function encryptObject<T extends Record<string, unknown>>(
  obj: T,
  fields: string[],
): T {
  const mutable = obj as Record<string, unknown>
  for (const field of fields) {
    const value = mutable[field]
    if (typeof value === "string" && value.length > 0) {
      mutable[field] = encryptField(value)
    }
  }
  return obj
}

/**
 * Decrypt specified fields of an object in-place.
 * Expects fields to contain JSON-serialized EncryptedFieldValue.
 *
 * @param obj - The source object (mutable)
 * @param fields - Array of field names to decrypt
 * @returns The same object with specified fields decrypted
 */
export function decryptObject<T extends Record<string, unknown>>(
  obj: T,
  fields: string[],
): T {
  const mutable = obj as Record<string, unknown>
  for (const field of fields) {
    const value = mutable[field]
    if (isEncryptedFieldValue(value)) {
      mutable[field] = decryptField(value)
    }
  }
  return obj
}

// ─── Type guard ───

function isEncryptedFieldValue(value: unknown): value is EncryptedFieldValue {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.encrypted === "string" &&
    typeof candidate.iv === "string" &&
    typeof candidate.tag === "string" &&
    typeof candidate.keyId === "string"
  )
}

// ─── Reset (for testing) ───

/**
 * Reset the cached master key. Intended for testing only.
 */
export function __resetMasterKeyForTest(): void {
  cachedMasterKey = null
}
