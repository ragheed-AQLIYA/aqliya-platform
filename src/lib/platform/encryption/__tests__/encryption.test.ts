// ─── PII Encryption Tests ───

import { describe, expect, it, beforeEach, jest } from "@jest/globals"

// Stateful key store for prisma mock
const keyStore: Array<Record<string, unknown>> = []

// Mock Prisma to avoid DB dependency in encryption key management
jest.mock("@/lib/prisma", () => ({
  prisma: {
    encryptionKey: {
      findFirst: jest.fn(async ({ where }: { where?: Record<string, unknown> } = {}) => {
        if (where?.status === "active" || !where) {
          if (keyStore.length > 0) return keyStore[keyStore.length - 1]
        }
        return null
      }),
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const record = { id: "mock-key-1", createdAt: new Date(), updatedAt: new Date(), ...data }
        keyStore.push(record)
        return record
      }),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Mock platform audit log to avoid DB writes
jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn(),
}))

import {
  encryptField,
  decryptField,
  rotateField,
  encryptObject,
  decryptObject,
  getMasterKey,
  generateKeyId,
  __resetMasterKeyForTest,
} from "../encryption-service"
import {
  definePiiConfig,
  autoEncrypt,
  autoDecrypt,
} from "../field-transform"
import { initializeEncryption } from "../key-management"
import type { EncryptedFieldValue } from "../types"

// Set up test master key before all tests
const TEST_MASTER_KEY_B64 = "dGVzdC1tYXN0ZXIta2V5LTI1Ni1iaXRzLTEyMzQ1Njc4OTA="

beforeEach(() => {
  __resetMasterKeyForTest()
  process.env.ENCRYPTION_MASTER_KEY = TEST_MASTER_KEY_B64
  keyStore.length = 0 // Reset store
})

describe("encryptField / decryptField roundtrip", () => {
  it("encrypts and decrypts a simple string", () => {
    const plaintext = "hello-world"
    const encrypted = encryptField(plaintext)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it("encrypts and decrypts Arabic text", () => {
    const plaintext = "مرحباً بالعالم"
    const encrypted = encryptField(plaintext)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it("encrypts and decrypts with specific keyId", () => {
    const plaintext = "secret-data"
    const keyId = "v1_1717000000"
    const encrypted = encryptField(plaintext, keyId)
    expect(encrypted.keyId).toBe(keyId)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it("produces different ciphertext for same plaintext (random IV)", () => {
    const plaintext = "same-value"
    const enc1 = encryptField(plaintext)
    const enc2 = encryptField(plaintext)
    expect(enc1.encrypted).not.toBe(enc2.encrypted)
    expect(enc1.iv).not.toBe(enc2.iv)
    expect(enc1.tag).not.toBe(enc2.tag)
  })

  it("handles empty string", () => {
    const plaintext = ""
    const encrypted = encryptField(plaintext)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it("handles long string", () => {
    const plaintext = "x".repeat(10000)
    const encrypted = encryptField(plaintext)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })
})

describe("decrypt with wrong key fails", () => {
  it("throws when decrypting with different keyId", () => {
    const plaintext = "sensitive"
    const encrypted = encryptField(plaintext, "v1_key_a")

    // Tamper with the keyId to simulate wrong key
    const tampered: EncryptedFieldValue = {
      ...encrypted,
      keyId: "v1_key_b",
    }

    expect(() => decryptField(tampered)).toThrow()
  })

  it("throws when ciphertext is tampered", () => {
    const plaintext = "tamper-test"
    const encrypted = encryptField(plaintext)

    const tampered: EncryptedFieldValue = {
      ...encrypted,
      encrypted: Buffer.from("tampered").toString("base64"),
    }

    expect(() => decryptField(tampered)).toThrow()
  })
})

describe("rotateField", () => {
  it("produces different ciphertext with new key", () => {
    const plaintext = "rotate-me"
    const encrypted = encryptField(plaintext, "v1_old")

    const rotated = rotateField(encrypted, "v1_new")
    expect(rotated.keyId).toBe("v1_new")
    expect(rotated.encrypted).not.toBe(encrypted.encrypted)

    const decrypted = decryptField(rotated)
    expect(decrypted).toBe(plaintext)
  })
})

describe("encryptObject / decryptObject", () => {
  it("encrypts and decrypts specified fields", () => {
    const obj = {
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
    }

    encryptObject(obj, ["name", "email"])

    expect(obj.name).not.toBe("John Doe")
    expect(obj.email).not.toBe("john@example.com")
    expect(obj.role).toBe("admin")

    const encryptedName = obj.name as unknown as EncryptedFieldValue
    expect(encryptedName.encrypted).toBeDefined()
    expect(encryptedName.iv).toBeDefined()
    expect(encryptedName.tag).toBeDefined()

    decryptObject(obj, ["name", "email"])

    expect(obj.name).toBe("John Doe")
    expect(obj.email).toBe("john@example.com")
    expect(obj.role).toBe("admin")
  })

  it("skips non-string and empty fields", () => {
    const obj = {
      name: "",
      email: undefined,
      role: null,
    } as Record<string, unknown>

    encryptObject(obj, ["name", "email", "role"])
    // All should remain unchanged (empty, undefined, null)
    expect(obj.name).toBe("")
    expect(obj.email).toBeUndefined()
    expect(obj.role).toBeNull()
  })
})

describe("getMasterKey", () => {
  it("returns a Buffer of 32 bytes", () => {
    const key = getMasterKey()
    expect(Buffer.isBuffer(key)).toBe(true)
    expect(key.length).toBe(32)
  })

  it("throws when ENCRYPTION_MASTER_KEY is not set", () => {
    delete process.env.ENCRYPTION_MASTER_KEY
    __resetMasterKeyForTest()
    expect(() => getMasterKey()).toThrow("ENCRYPTION_MASTER_KEY")
  })
})

describe("generateKeyId", () => {
  it("returns a string starting with v1_", () => {
    const keyId = generateKeyId()
    expect(keyId).toMatch(/^v1_\d+$/)
  })
})

describe("autoEncrypt / autoDecrypt with config", () => {
  beforeEach(async () => {
    await initializeEncryption()
  })

  it("encrypts and decrypts based on registered config", async () => {
    definePiiConfig({
      entityName: "user",
      fieldConfigs: {
        contact: {
          fields: ["email", "phone"],
          strategy: "aes-256-gcm",
        },
        identity: {
          fields: ["nationalId"],
          strategy: "aes-256-gcm",
        },
      },
    })

    const user = {
      id: "user-1",
      email: "test@example.com",
      phone: "+966500000000",
      nationalId: "1010000000",
      role: "viewer",
    }

    await autoEncrypt("user", user)

    // Encrypted shadow fields should exist
    expect((user as Record<string, unknown>).email_enc).toBeDefined()
    expect((user as Record<string, unknown>).phone_enc).toBeDefined()
    expect((user as Record<string, unknown>).nationalId_enc).toBeDefined()

    // Decrypt back
    const decrypted = await autoDecrypt("user", user as unknown as Record<string, unknown>)
    expect((decrypted as unknown as Record<string, unknown>).email).toBe("test@example.com")
    expect((decrypted as unknown as Record<string, unknown>).phone).toBe("+966500000000")
    expect((decrypted as unknown as Record<string, unknown>).nationalId).toBe("1010000000")
  })

  it("returns data unchanged if no config registered", async () => {
    const data = { name: "test" }
    const result = await autoEncrypt("unknown-entity", data)
    expect(result).toBe(data)
  })
})
