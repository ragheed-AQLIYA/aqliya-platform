// ─── Auto Field Transforms ───
// تحويل تلقائي لحقول البيانات الشخصية

import "server-only"

import { getActiveKey } from "./key-management"
import { encryptField, decryptField } from "./encryption-service"
import type {
  EncryptedFieldValue,
  PiiEntityConfig,
  PiiFieldConfig,
} from "./types"

// ─── In-memory config registry ───

const configRegistry = new Map<string, Record<string, PiiFieldConfig>>()

// ─── Register Config ───

/**
 * Register PII field configuration for an entity.
 * Config is stored in-memory and used by autoEncrypt/autoDecrypt.
 *
 * @param config - The entity PII configuration
 */
export function definePiiConfig(config: PiiEntityConfig): void {
  configRegistry.set(config.entityName, config.fieldConfigs)
}

// ─── Auto Encrypt ───

/**
 * Automatically encrypt matching fields on an entity data object
 * based on registered PII config.
 *
 * Encrypted fields are replaced with EncryptedFieldValue objects.
 * Auxiliary fields store the encrypted value as JSON string under `{field}_enc`.
 *
 * @param entityName - The registered entity name
 * @param data - The data object with plaintext fields
 * @returns The data object with fields encrypted in-place
 */
export async function autoEncrypt<T extends Record<string, unknown>>(
  entityName: string,
  data: T,
): Promise<T> {
  const fieldConfigs = configRegistry.get(entityName)
  if (!fieldConfigs) {
    return data
  }

  const activeKey = await getActiveKey()
  const mutable = data as Record<string, unknown>

  for (const [, config] of Object.entries(fieldConfigs)) {
    for (const field of config.fields) {
      const value = mutable[field]
      if (typeof value === "string" && value.length > 0) {
        const encrypted = encryptField(value, activeKey.keyId)
        mutable[`${field}_enc`] = encrypted
      }
    }
  }

  return data
}

/**
 * Automatically decrypt matching fields on an entity data object
 * based on registered PII config.
 *
 * Reads encrypted values from `{field}_enc` shadow fields.
 *
 * @param entityName - The registered entity name
 * @param data - The data object with encrypted shadow fields
 * @returns The data object with fields decrypted in-place
 */
export async function autoDecrypt<T extends Record<string, unknown>>(
  entityName: string,
  data: T,
): Promise<T> {
  const fieldConfigs = configRegistry.get(entityName)
  if (!fieldConfigs) {
    return data
  }

  const mutable = data as Record<string, unknown>

  for (const [, config] of Object.entries(fieldConfigs)) {
    for (const field of config.fields) {
      const encryptedValue = mutable[`${field}_enc`]
      if (isEncryptedFieldValue(encryptedValue)) {
        mutable[field] = decryptField(encryptedValue)
      }
    }
  }

  return data
}

// ─── User PII Handlers ───

type UserPII = {
  email?: string
  name?: string
  phone?: string
  nationalId?: string
}

/**
 * Encrypt specific user PII fields (email, name, phone, nationalId).
 * Adds shadow fields (`{field}_enc`) while preserving originals.
 */
export async function encryptUserPII(user: UserPII): Promise<UserPII> {
  const result: Record<string, unknown> = { ...user }
  const piiFields = ["email", "name", "phone", "nationalId"] as const

  const activeKey = await getActiveKey()

  for (const field of piiFields) {
    const value = user[field]
    if (value && value.length > 0) {
      const encrypted = encryptField(value, activeKey.keyId)
      result[`${field}_enc`] = encrypted
    }
  }

  return result as UserPII
}

/**
 * Decrypt user PII fields from shadow fields (`{field}_enc`).
 * Restores plaintext values onto the original field names.
 */
export async function decryptUserPII(
  user: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const result = { ...user }
  const piiFields = ["email", "name", "phone", "nationalId"]

  for (const field of piiFields) {
    const encryptedFieldName = `${field}_enc`
    const encryptedValue = result[encryptedFieldName]
    if (isEncryptedFieldValue(encryptedValue)) {
      const plaintext = decryptField(encryptedValue)
      result[field] = plaintext
    }
  }

  return result
}

// ─── Type Guard ───

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
