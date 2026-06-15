// ─── PII Field-Level Encryption Types ───
// تشفير على مستوى الحقول للبيانات الشخصية

export type EncryptionAlgorithm = "aes-256-gcm"

export interface EncryptedFieldValue {
  encrypted: string       // base64 ciphertext
  iv: string             // base64 initialization vector
  tag: string            // base64 auth tag (GCM)
  keyId: string          // which key was used
  algorithm: EncryptionAlgorithm
}

export interface EncryptionKeyData {
  keyId: string
  key: Buffer
  algorithm: EncryptionAlgorithm
  createdAt: Date
}

export interface PiiFieldConfig {
  fields: string[]
  strategy: "aes-256-gcm" | "deterministic"
}

export interface PiiEntityConfig {
  entityName: string
  fieldConfigs: Record<string, PiiFieldConfig>
}
