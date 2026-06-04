import { describe, expect, it, jest } from "@jest/globals"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: jest.fn().mockResolvedValue([{ "?column?": 1 }]),
  },
}))

jest.mock("@/lib/platform/runtime-env-check", () => ({
  checkLocalStorageWritable: jest.fn().mockResolvedValue({
    ok: true,
    path: "./uploads",
  }),
}))

jest.mock("@/lib/platform/pgvector-compat", () => ({
  isPgvectorAvailable: jest.fn().mockResolvedValue(true),
}))

jest.mock("@/lib/platform/redis-client", () => ({
  isRedisAvailable: jest.fn().mockResolvedValue(true),
}))

describe("health routes", () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = "x".repeat(32)
    delete process.env.FF_AI_REAL_PROVIDERS
  })

  it("live returns 200 without database dependency", async () => {
    const { GET } = await import("../live/route")
    const res = await GET()
    expect(res.status).toBe(200)
    const body = (await res.json()) as { probe: string; status: string }
    expect(body.probe).toBe("live")
    expect(body.status).toBe("ok")
  })

  it("main health returns JSON with checks", async () => {
    const { GET } = await import("../route")
    const res = await GET()
    const body = (await res.json()) as { checks: Record<string, { ok: boolean }> }
    expect(body.checks.database?.ok).toBe(true)
  })
})
