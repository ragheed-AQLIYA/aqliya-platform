import { describe, expect, it } from "@jest/globals"
import {
  computeHash,
  findNonce,
  verifySingle,
  verifyChain,
  detectTampering,
} from "../hash-chain"
import type { ChainEntryData } from "../hash-chain"

const makeEntry = (overrides: Partial<ChainEntryData> = {}): ChainEntryData => ({
  id: "entry-1",
  auditLogId: "log-1",
  previousHash: null,
  chainHash: "",
  nonce: 0,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  action: "user.login",
  actorId: "user-1",
  ...overrides,
})

describe("computeHash", () => {
  it("produces consistent results for same input", () => {
    const a = computeHash({
      auditLogId: "log-1",
      action: "user.login",
      actorId: "user-1",
      timestamp: new Date("2026-01-01T00:00:00Z"),
      previousHash: null,
      nonce: 0,
    })
    const b = computeHash({
      auditLogId: "log-1",
      action: "user.login",
      actorId: "user-1",
      timestamp: new Date("2026-01-01T00:00:00Z"),
      previousHash: null,
      nonce: 0,
    })
    expect(a).toBe(b)
  })

  it("produces different output for different action", () => {
    const a = computeHash({
      auditLogId: "log-1",
      action: "user.login",
      actorId: "user-1",
      timestamp: new Date("2026-01-01T00:00:00Z"),
      nonce: 0,
    })
    const b = computeHash({
      auditLogId: "log-1",
      action: "document.delete",
      actorId: "user-1",
      timestamp: new Date("2026-01-01T00:00:00Z"),
      nonce: 0,
    })
    expect(a).not.toBe(b)
  })

  it("produces different output when linked to previous hash", () => {
    const standalone = computeHash({
      auditLogId: "log-2",
      action: "user.login",
      actorId: "user-1",
      timestamp: new Date("2026-01-01T00:00:00Z"),
      nonce: 0,
    })
    const linked = computeHash({
      auditLogId: "log-2",
      action: "user.login",
      actorId: "user-1",
      timestamp: new Date("2026-01-01T00:00:00Z"),
      previousHash: "abc123",
      nonce: 0,
    })
    expect(standalone).not.toBe(linked)
  })

  it("returns a 64-character hex string", () => {
    const hash = computeHash({
      auditLogId: "log-1",
      action: "test",
      actorId: "u1",
      timestamp: new Date(),
      nonce: 0,
    })
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})

describe("findNonce", () => {
  it("finds nonce producing hash starting with 00", () => {
    const result = findNonce({
      auditLogId: "log-nonce",
      action: "test",
      actorId: "u1",
      timestamp: new Date("2026-06-01T00:00:00Z"),
    })
    expect(result.hash.startsWith("00")).toBe(true)
    expect(result.nonce).toBeGreaterThanOrEqual(0)
  })

  it("returns deterministic result for same input", () => {
    const input = {
      auditLogId: "log-nonce-2",
      action: "test",
      actorId: "u2",
      timestamp: new Date("2026-06-01T00:00:00Z"),
    }
    const a = findNonce(input)
    const b = findNonce(input)
    expect(a.nonce).toBe(b.nonce)
    expect(a.hash).toBe(b.hash)
  })
})

describe("verifySingle", () => {
  it("passes for a valid entry", () => {
    const hash = computeHash({
      auditLogId: "log-1",
      action: "user.login",
      actorId: "user-1",
      timestamp: new Date("2026-01-01T00:00:00Z"),
      nonce: 0,
    })
    const entry = makeEntry({ chainHash: hash })
    expect(verifySingle(entry)).toBe(true)
  })

  it("fails when chainHash is tampered", () => {
    const entry = makeEntry({ chainHash: "tampered_hash_value" })
    expect(verifySingle(entry)).toBe(false)
  })

  it("fails when action is modified", () => {
    const hash = computeHash({
      auditLogId: "log-1",
      action: "user.login",
      actorId: "user-1",
      timestamp: new Date("2026-01-01T00:00:00Z"),
      nonce: 0,
    })
    const entry = makeEntry({
      chainHash: hash,
      action: "admin.delete",
    })
    expect(verifySingle(entry)).toBe(false)
  })

  it("passes with nonce requirement", () => {
    const result = findNonce({
      auditLogId: "log-nonce-v",
      action: "user.login",
      actorId: "user-1",
      timestamp: new Date("2026-06-01T00:00:00Z"),
    })
    const entry = makeEntry({
      id: "entry-nonce",
      auditLogId: "log-nonce-v",
      chainHash: result.hash,
      nonce: result.nonce,
      createdAt: new Date("2026-06-01T00:00:00Z"),
    })
    expect(verifySingle(entry)).toBe(true)
  })
})

describe("verifyChain", () => {
  it("passes for linked valid entries", () => {
    const t = new Date("2026-01-01T00:00:00Z")

    const hash1 = computeHash({
      auditLogId: "log-1",
      action: "user.login",
      actorId: "user-1",
      timestamp: t,
      nonce: 0,
    })
    const hash2 = computeHash({
      auditLogId: "log-2",
      action: "document.view",
      actorId: "user-1",
      timestamp: new Date("2026-01-01T00:01:00Z"),
      previousHash: hash1,
      nonce: 0,
    })

    const entries: ChainEntryData[] = [
      makeEntry({
        id: "e1",
        auditLogId: "log-1",
        chainHash: hash1,
        previousHash: null,
        createdAt: t,
      }),
      makeEntry({
        id: "e2",
        auditLogId: "log-2",
        action: "document.view",
        chainHash: hash2,
        previousHash: hash1,
        createdAt: new Date("2026-01-01T00:01:00Z"),
      }),
    ]

    const result = verifyChain(entries)
    expect(result.verified).toBe(true)
    expect(result.totalEntries).toBe(2)
    expect(result.validEntries).toBe(2)
    expect(result.tamperedEntries).toBe(0)
  })

  it("detects tampered entry in chain", () => {
    const t = new Date("2026-01-01T00:00:00Z")

    const hash1 = computeHash({
      auditLogId: "log-1",
      action: "user.login",
      actorId: "user-1",
      timestamp: t,
      nonce: 0,
    })

    const entries: ChainEntryData[] = [
      makeEntry({
        id: "e1",
        auditLogId: "log-1",
        chainHash: hash1,
        previousHash: null,
        createdAt: t,
      }),
      makeEntry({
        id: "e2",
        auditLogId: "log-2",
        action: "document.view",
        chainHash: "obviously_tampered",
        previousHash: hash1,
        createdAt: new Date("2026-01-01T00:01:00Z"),
      }),
    ]

    const result = verifyChain(entries)
    expect(result.verified).toBe(false)
    expect(result.validEntries).toBe(1)
    expect(result.tamperedEntries).toBe(1)
    expect(result.firstTamperedId).toBe("e2")
  })

  it("detects broken link between entries", () => {
    const t = new Date("2026-01-01T00:00:00Z")

    const hash1 = computeHash({
      auditLogId: "log-1",
      action: "user.login",
      actorId: "user-1",
      timestamp: t,
      nonce: 0,
    })
    const hash2 = computeHash({
      auditLogId: "log-2",
      action: "document.view",
      actorId: "user-1",
      timestamp: new Date("2026-01-01T00:01:00Z"),
      previousHash: hash1,
      nonce: 0,
    })

    const entries: ChainEntryData[] = [
      makeEntry({
        id: "e1",
        auditLogId: "log-1",
        chainHash: hash1,
        previousHash: null,
        createdAt: t,
      }),
      makeEntry({
        id: "e2",
        auditLogId: "log-2",
        action: "document.view",
        chainHash: hash2,
        previousHash: "wrong_previous_hash",
        createdAt: new Date("2026-01-01T00:01:00Z"),
      }),
    ]

    const result = verifyChain(entries)
    expect(result.verified).toBe(false)
    expect(result.validEntries).toBe(1)
    expect(result.tamperedEntries).toBe(1)
  })
})

describe("detectTampering", () => {
  it("returns false for valid chain", () => {
    const t = new Date("2026-01-01T00:00:00Z")
    const hash1 = computeHash({
      auditLogId: "log-1",
      action: "user.login",
      actorId: "user-1",
      timestamp: t,
      nonce: 0,
    })

    const entries: ChainEntryData[] = [
      makeEntry({
        id: "e1",
        auditLogId: "log-1",
        chainHash: hash1,
        previousHash: null,
        createdAt: t,
      }),
    ]

    const result = detectTampering(entries)
    expect(result.tampered).toBe(false)
  })

  it("finds broken index for tampered entry", () => {
    const entries: ChainEntryData[] = [
      makeEntry({
        id: "e1",
        auditLogId: "log-1",
        chainHash: "bad_hash",
        previousHash: null,
      }),
    ]

    const result = detectTampering(entries)
    expect(result.tampered).toBe(true)
    expect(result.firstBrokenIndex).toBe(0)
  })

  it("detects breaking at linking point", () => {
    const t = new Date("2026-01-01T00:00:00Z")

    const hash1 = computeHash({
      auditLogId: "log-1",
      action: "user.login",
      actorId: "user-1",
      timestamp: t,
      nonce: 0,
    })
    const hash2 = computeHash({
      auditLogId: "log-2",
      action: "document.view",
      actorId: "user-1",
      timestamp: new Date("2026-01-01T00:01:00Z"),
      previousHash: hash1,
      nonce: 0,
    })
    const badHash1 = "tampered_first_entry"

    const entries: ChainEntryData[] = [
      makeEntry({
        id: "e1",
        auditLogId: "log-1",
        chainHash: badHash1,
        previousHash: null,
        createdAt: t,
      }),
      makeEntry({
        id: "e2",
        auditLogId: "log-2",
        action: "document.view",
        chainHash: hash2,
        previousHash: hash1,
        createdAt: new Date("2026-01-01T00:01:00Z"),
      }),
    ]

    const result = detectTampering(entries)
    expect(result.tampered).toBe(true)
    expect(result.firstBrokenIndex).toBe(0)
  })
})
