import { describe, expect, it, jest } from "@jest/globals"
import crypto from "crypto"

// ─── Set encryption key before any module imports ───

const TEST_MASTER_KEY = crypto.randomBytes(32).toString("base64")
process.env.ENCRYPTION_VAULT_KEY = TEST_MASTER_KEY

// ─── Mocks ───
// Following existing pattern: simple jest.fn(), no generics

jest.mock("@/lib/prisma", () => ({
  prisma: {
    vaultEntry: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    platformAuditLog: {
      findMany: jest.fn(),
    },
  },
}))

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true, id: "audit-1" }),
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = jest.requireMock("@/lib/prisma").prisma as any

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── Imports (after mocks) ───

import { encryptSecret } from "../vault-encryption"
import { storeSecret, getSecret, getSecretMetadata, listSecrets, updateSecret, deleteSecret, markSecretCompromised } from "../vault-service"
import { getSecretsDueForRotation, rotateSecret, rotateAllDueSecrets, getRotationHealth } from "../key-rotation"
import { getVaultHealth, getAccessAudit, purgeArchived } from "../vault-admin"

// ─── Helpers ───

let _defaultEncrypted: { encryptedValue: string; keyIdentifier: string } | null = null

function getDefaultEncrypted(): { encryptedValue: string; keyIdentifier: string } {
  if (!_defaultEncrypted) {
    _defaultEncrypted = encryptSecret("test-value")
  }
  return _defaultEncrypted
}

function makeEntry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const def = getDefaultEncrypted()
  return {
    id: "entry-1",
    key: "api.stripe.prod",
    displayName: "Stripe API Key",
    encryptedValue: def.encryptedValue,
    keyIdentifier: def.keyIdentifier,
    description: "Stripe production API key",
    category: "api_key",
    environment: "production",
    status: "ACTIVE",
    version: 1,
    rotationPeriodDays: 90,
    lastRotatedAt: new Date("2026-01-01"),
    lastAccessedAt: null,
    accessCount: 0,
    createdById: "user-1",
    organizationId: "org-1",
    previousVersionId: null,
    expiresAt: null,
    metadata: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    deletedAt: null,
    ...overrides,
  }
}

// ─── Vault Service Tests ───

describe("encrypt / decrypt roundtrip", () => {
  it("encrypts and decrypts a secret value", async () => {
    mockPrisma.vaultEntry.findFirst.mockResolvedValue(null)
    mockPrisma.vaultEntry.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(makeEntry({ key: "test.key", ...data })),
    )

    const stored = await storeSecret(
      { key: "test.key", value: "super-secret-value", category: "general" },
      "user-1",
    )

    expect(stored.key).toBe("test.key")
    expect(stored.value).toBe("super-secret-value")
    expect(stored.keyIdentifier).toBeDefined()
    expect(stored.keyIdentifier.length).toBeGreaterThan(0)

    mockPrisma.vaultEntry.findFirst.mockResolvedValue(
      mockPrisma.vaultEntry.create.mock.results[0]?.value ?? null,
    )
    mockPrisma.vaultEntry.update.mockResolvedValue(
      mockPrisma.vaultEntry.create.mock.results[0]?.value ?? null,
    )

    const retrieved = await getSecret("test.key", "user-1")
    expect(retrieved.value).toBe("super-secret-value")
    expect(retrieved.keyIdentifier).toBe(stored.keyIdentifier)
  })
})

describe("storeSecret", () => {
  it("creates a secret with encrypted value", async () => {
    mockPrisma.vaultEntry.findFirst.mockResolvedValue(null)
    mockPrisma.vaultEntry.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(makeEntry({ key: "db.password", ...data })),
    )

    const result = await storeSecret(
      { key: "db.password", value: "p@ssw0rd", category: "credentials" },
      "user-1",
    )

    expect(result.key).toBe("db.password")
    expect(result.value).toBe("p@ssw0rd")
    expect(mockPrisma.vaultEntry.create).toHaveBeenCalled()
    const createCall = mockPrisma.vaultEntry.create.mock.calls[0][0]
    expect(createCall.data.encryptedValue).not.toBe("p@ssw0rd")
    expect(createCall.data.keyIdentifier).toBeDefined()
  })

  it("rejects duplicate key", async () => {
    mockPrisma.vaultEntry.findFirst.mockResolvedValue(makeEntry())

    await expect(
      storeSecret({ key: "api.stripe.prod", value: "sk_test_xxx" }, "user-1"),
    ).rejects.toThrow("already exists")
  })

  it("rejects invalid key names", async () => {
    await expect(
      storeSecret({ key: "bad key!", value: "x" }, "user-1"),
    ).rejects.toThrow("Invalid key name")
  })
})

describe("getSecret", () => {
  it("decrypts and returns secret value", async () => {
    mockPrisma.vaultEntry.findFirst.mockResolvedValue(null)
    mockPrisma.vaultEntry.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(makeEntry({ key: "test.read", ...data })),
    )

    const stored = await storeSecret({ key: "test.read", value: "read-value" }, "user-1")

    mockPrisma.vaultEntry.findFirst.mockResolvedValue(
      mockPrisma.vaultEntry.create.mock.results[0]?.value ?? null,
    )
    mockPrisma.vaultEntry.update.mockResolvedValue(
      mockPrisma.vaultEntry.create.mock.results[0]?.value ?? null,
    )

    const result = await getSecret("test.read", "user-1")
    expect(result.value).toBe("read-value")
  })

  it("throws on missing secret", async () => {
    mockPrisma.vaultEntry.findFirst.mockResolvedValue(null)

    await expect(getSecret("nonexistent", "user-1")).rejects.toThrow("not found")
  })
})

describe("decrypt with wrong key fails", () => {
  it("throws on tampered encrypted value", async () => {
    mockPrisma.vaultEntry.findFirst.mockResolvedValue(
      makeEntry({ encryptedValue: '{"iv":"AAAA","tag":"AAAA","ciphertext":"AAAA"}' }),
    )
    mockPrisma.vaultEntry.update.mockResolvedValue(makeEntry())

    await expect(getSecret("api.stripe.prod", "user-1")).rejects.toThrow()
  })
})

describe("getSecretMetadata", () => {
  it("returns metadata without decrypted value", async () => {
    mockPrisma.vaultEntry.findFirst.mockResolvedValue(makeEntry())

    const meta = await getSecretMetadata("api.stripe.prod")
    expect(meta).not.toBeNull()
    expect(meta!.key).toBe("api.stripe.prod")
  })

  it("returns null for missing secret", async () => {
    mockPrisma.vaultEntry.findFirst.mockResolvedValue(null)

    const result = await getSecretMetadata("nonexistent")
    expect(result).toBeNull()
  })
})

describe("listSecrets", () => {
  it("returns metadata only (no values)", async () => {
    mockPrisma.vaultEntry.findMany.mockResolvedValue([makeEntry(), makeEntry({ key: "api.stripe.test" })])

    const secrets = await listSecrets({ category: "api_key" })
    expect(secrets.length).toBeGreaterThan(0)
    for (const s of secrets) {
      expect("value" in s).toBe(false)
      expect("encryptedValue" in s).toBe(false)
    }
  })
})

describe("updateSecret", () => {
  it("increments version when value changes", async () => {
    mockPrisma.vaultEntry.findFirst.mockResolvedValue(null)
    mockPrisma.vaultEntry.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(makeEntry({ key: "test.update", ...data })),
    )

    await storeSecret({ key: "test.update", value: "old-value" }, "user-1")

    mockPrisma.vaultEntry.findFirst.mockResolvedValue(
      mockPrisma.vaultEntry.create.mock.results[0]?.value ?? null,
    )
    mockPrisma.vaultEntry.update.mockResolvedValue(
      makeEntry({ version: 2, keyIdentifier: "new-key-id", previousVersionId: "entry-1" }),
    )

    const updated = await updateSecret("test.update", { value: "new-value" }, "user-1")
    expect(updated.version).toBeGreaterThanOrEqual(2)
  })
})

describe("markSecretCompromised", () => {
  it("changes status to COMPROMISED", async () => {
    mockPrisma.vaultEntry.findFirst.mockResolvedValue(makeEntry())
    mockPrisma.vaultEntry.update.mockResolvedValue(makeEntry({ status: "COMPROMISED" }))

    await markSecretCompromised("api.stripe.prod", "user-1", "Found in public repo")
    const updateCall = mockPrisma.vaultEntry.update.mock.calls[0]?.[0]
    expect(updateCall.data.status).toBe("COMPROMISED")
  })
})

describe("deleteSecret", () => {
  it("soft deletes by setting deletedAt", async () => {
    mockPrisma.vaultEntry.findFirst.mockResolvedValue(makeEntry())
    mockPrisma.vaultEntry.update.mockResolvedValue(makeEntry({ deletedAt: new Date() }))

    await deleteSecret("api.stripe.prod", "user-1")
    const updateCall = mockPrisma.vaultEntry.update.mock.calls[0]?.[0]
    expect(updateCall.data.deletedAt).toBeInstanceOf(Date)
  })
})

// ─── Rotation Tests ───

describe("getSecretsDueForRotation", () => {
  it("returns secrets past rotation date", async () => {
    const pastDate = new Date()
    pastDate.setFullYear(pastDate.getFullYear() - 1)

    mockPrisma.vaultEntry.findMany.mockResolvedValue([
      makeEntry({ lastRotatedAt: pastDate, rotationPeriodDays: 30 }),
    ])

    const due = await getSecretsDueForRotation()
    expect(due.length).toBeGreaterThan(0)
  })
})

describe("rotateSecret", () => {
  it("produces new keyIdentifier after rotation", async () => {
    mockPrisma.vaultEntry.findFirst.mockResolvedValue(null)
    mockPrisma.vaultEntry.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(makeEntry({ key: "test.rotate", ...data })),
    )

    const stored = await storeSecret({ key: "test.rotate", value: "rotate-me" }, "user-1")
    const oldKeyId = stored.keyIdentifier

    mockPrisma.vaultEntry.findFirst.mockResolvedValue(
      mockPrisma.vaultEntry.create.mock.results[0]?.value ?? null,
    )
    mockPrisma.vaultEntry.update.mockResolvedValue(
      makeEntry({ version: 2, keyIdentifier: "__rotated_keyid__", lastRotatedAt: new Date() }),
    )

    const rotated = await rotateSecret("test.rotate", "user-1")
    expect(rotated.keyIdentifier).not.toBe(oldKeyId)
    expect(rotated.value).toBe("rotate-me")
  })
})

describe("rotateAllDueSecrets", () => {
  it("returns count of rotated secrets", async () => {
    const pastDate = new Date()
    pastDate.setFullYear(pastDate.getFullYear() - 1)

    mockPrisma.vaultEntry.findMany.mockResolvedValue([
      makeEntry({ key: "secret.1", id: "entry-1", lastRotatedAt: pastDate, rotationPeriodDays: 30 }),
      makeEntry({ key: "secret.2", id: "entry-2", lastRotatedAt: pastDate, rotationPeriodDays: 30 }),
    ])

    mockPrisma.vaultEntry.findFirst.mockImplementation(
      ({ where }: { where: Record<string, unknown> }) => {
        if (where.key === "secret.1") {
          return Promise.resolve(makeEntry({ key: "secret.1", id: "entry-1", lastRotatedAt: pastDate, rotationPeriodDays: 30 }))
        }
        if (where.key === "secret.2") {
          return Promise.resolve(makeEntry({ key: "secret.2", id: "entry-2", lastRotatedAt: pastDate, rotationPeriodDays: 30 }))
        }
        return Promise.resolve(null)
      },
    )

    mockPrisma.vaultEntry.update.mockResolvedValue(
      makeEntry({ version: 2, keyIdentifier: "__rotated__", lastRotatedAt: new Date() }),
    )

    const result = await rotateAllDueSecrets("admin-1")
    expect(result.rotated).toBeGreaterThanOrEqual(1)
  })
})

describe("getRotationHealth", () => {
  it("returns compliance numbers", async () => {
    const recent = new Date()
    const past = new Date()
    past.setFullYear(past.getFullYear() - 1)

    mockPrisma.vaultEntry.findMany.mockResolvedValue([
      makeEntry({ lastRotatedAt: recent, rotationPeriodDays: 90 }),
      makeEntry({ key: "old.secret", lastRotatedAt: past, rotationPeriodDays: 30 }),
    ])

    const health = await getRotationHealth()
    expect(health.total).toBeGreaterThanOrEqual(2)
  })
})

// ─── Admin Tests ───

describe("getVaultHealth", () => {
  it("returns categorized health report", async () => {
    mockPrisma.vaultEntry.findMany.mockResolvedValue([
      makeEntry({ category: "api_key", status: "ACTIVE" }),
      makeEntry({ key: "db.pass", category: "credentials", status: "ACTIVE" }),
    ])

    const health = await getVaultHealth()
    expect(health.totalSecrets).toBeGreaterThanOrEqual(2)
    expect(health.byCategory).toBeDefined()
    expect(health.byStatus).toBeDefined()
  })
})

describe("getAccessAudit", () => {
  it("returns audit logs for a key", async () => {
    mockPrisma.platformAuditLog.findMany.mockResolvedValue([
      {
        id: "log-1",
        productKey: "vault",
        action: "secret.read",
        platformOrganizationId: "org-1",
        clientWorkspaceId: null,
        projectId: null,
        environment: "test",
        actorId: "user-1",
        actorType: null,
        actorEmail: null,
        actorName: null,
        targetType: "VaultEntry",
        targetId: "api.stripe.prod",
        targetLabel: "api.stripe.prod",
        severity: "info",
        status: "recorded",
        sourceSystem: null,
        sourceModel: null,
        sourceId: null,
        requestId: null,
        sessionId: null,
        ipAddress: null,
        userAgent: null,
        aiProvider: null,
        aiModel: null,
        aiPromptVersion: null,
        aiOutputReviewStatus: null,
        evidenceRefs: null,
        metadata: null,
        createdAt: new Date(),
      },
    ])

    const audit = await getAccessAudit("api.stripe.prod")
    expect(audit.length).toBeGreaterThan(0)
    expect(audit[0].action).toBe("secret.read")
  })
})

describe("purgeArchived", () => {
  it("hard deletes archived secrets older than date", async () => {
    mockPrisma.vaultEntry.deleteMany.mockResolvedValue({ count: 3 })

    const count = await purgeArchived(new Date("2026-01-01"))
    expect(count).toBe(3)
  })
})
