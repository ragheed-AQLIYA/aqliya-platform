import {
  __resetRagPersistenceForTests,
  __setRagRedisClientForTests,
  __whenRagRestoreSettledForTests,
  flushRagMetricsNow,
  type RagRedisLike,
} from "../rag-persistence"
import {
  recordSearch,
  recordCacheHit,
  recordCacheMiss,
  recordError,
  getMetrics,
  resetMetrics,
} from "../rag-metrics"

const ENV_KEY = "RAG_METRICS_PERSISTENCE"

/** In-memory fake implementing only the Redis surface used by rag-persistence. */
class FakeRagRedis implements RagRedisLike {
  hash = new Map<string, string>()
  latencies: string[] = []
  ops: string[] = []
  failWrites = false
  failReads = false

  async hgetall(_key: string): Promise<Record<string, string>> {
    this.ops.push("hgetall")
    if (this.failReads) throw new Error("read failed")
    const out: Record<string, string> = {}
    for (const [field, value] of this.hash) out[field] = value
    return out
  }

  async hincrby(_key: string, field: string, increment: number): Promise<number> {
    this.ops.push("hincrby " + field)
    if (this.failWrites) throw new Error("write failed")
    const next = Number(this.hash.get(field) ?? "0") + increment
    this.hash.set(field, String(next))
    return next
  }

  async rpush(_key: string, ...values: (string | number)[]): Promise<number> {
    this.ops.push("rpush " + values.length)
    if (this.failWrites) throw new Error("write failed")
    for (const value of values) this.latencies.push(String(value))
    return this.latencies.length
  }

  async ltrim(_key: string, start: number, stop: number): Promise<unknown> {
    this.ops.push("ltrim " + start + " " + stop)
    if (this.failWrites) throw new Error("write failed")
    const from = start < 0 ? Math.max(0, this.latencies.length + start) : start
    const toInclusive =
      stop < 0 ? this.latencies.length + stop : Math.min(stop, this.latencies.length - 1)
    this.latencies = this.latencies.slice(from, toInclusive + 1)
    return "OK"
  }

  async lrange(_key: string, start: number, stop: number): Promise<string[]> {
    this.ops.push("lrange " + start + " " + stop)
    if (this.failReads) throw new Error("read failed")
    const from = start < 0 ? Math.max(0, this.latencies.length + start) : start
    const to = stop < 0 ? this.latencies.length + stop : stop
    return this.latencies.slice(from, to + 1)
  }

  async del(...keys: string[]): Promise<unknown> {
    this.ops.push("del " + keys.length)
    if (this.failWrites) throw new Error("write failed")
    this.hash.clear()
    this.latencies = []
    return keys.length
  }
}

function installWarnSpy() {
  return jest.spyOn(console, "warn").mockImplementation(() => undefined)
}

/** Enable redis mode with a fresh memoized hook and the given client. */
function enableRedis(client: RagRedisLike | null): void {
  process.env[ENV_KEY] = "redis"
  __resetRagPersistenceForTests()
  __setRagRedisClientForTests(client)
}

/** Let fire-and-forget promise chains (e.g. reset's DEL) settle. */
async function settleAsyncWork(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

describe("rag-metrics redis persistence", () => {
  let warnSpy: ReturnType<typeof installWarnSpy>

  beforeEach(() => {
    delete process.env[ENV_KEY]
    delete process.env.REDIS_URL
    __resetRagPersistenceForTests()
    resetMetrics()
    warnSpy = installWarnSpy()
  })

  afterEach(() => {
    warnSpy.mockRestore()
    __resetRagPersistenceForTests()
    delete process.env[ENV_KEY]
    delete process.env.REDIS_URL
  })

  it("stays purely in-memory when the flag is unset (default)", async () => {
    const fake = new FakeRagRedis()
    __setRagRedisClientForTests(fake)

    recordSearch(100, 2)
    recordCacheHit()
    recordCacheMiss()
    recordError()
    await flushRagMetricsNow()

    expect(fake.ops).toEqual([])
    const m = getMetrics()
    expect(m.searchCount).toBe(1)
    expect(m.totalCitations).toBe(2)
    expect(m.errorCount).toBe(1)
    expect(m.cacheHitRate).toBeCloseTo(0.5)
  })

  it("stays purely in-memory when the flag is explicitly memory", async () => {
    const fake = new FakeRagRedis()
    process.env[ENV_KEY] = "memory"
    __resetRagPersistenceForTests()
    __setRagRedisClientForTests(fake)

    recordSearch(100, 1)
    await flushRagMetricsNow()

    expect(fake.ops).toEqual([])
    expect(getMetrics().searchCount).toBe(1)
  })

  it("flushes batched counter deltas and latency samples to redis", async () => {
    const fake = new FakeRagRedis()
    enableRedis(fake)

    recordSearch(150, 3)
    recordSearch(200, 5)
    recordCacheHit()
    recordCacheHit()
    recordCacheMiss()
    recordError()
    await __whenRagRestoreSettledForTests()
    await flushRagMetricsNow()

    expect(fake.hash.get("searchCount")).toBe("2")
    expect(fake.hash.get("citationCount")).toBe("8")
    expect(fake.hash.get("cacheHitCount")).toBe("2")
    expect(fake.hash.get("cacheMissCount")).toBe("1")
    expect(fake.hash.get("errorCount")).toBe("1")
    expect(fake.latencies).toEqual(["150", "200"])
    // Deltas recorded between flushes are aggregated into one command per field.
    expect(fake.ops.filter((op) => op === "hincrby searchCount")).toHaveLength(1)
  })

  it("caps the persisted latency list via ltrim", async () => {
    const fake = new FakeRagRedis()
    enableRedis(fake)

    for (let i = 1; i <= 1001; i++) {
      recordSearch(i, 0)
    }
    await __whenRagRestoreSettledForTests()
    await flushRagMetricsNow()

    expect(fake.ops).toContain("ltrim -1000 -1")
    expect(fake.latencies).toHaveLength(1000)
    expect(fake.latencies[0]).toBe("2")
    expect(fake.latencies[999]).toBe("1001")
  })

  it("restores a persisted snapshot into memory on boot", async () => {
    const fake = new FakeRagRedis()
    fake.hash.set("searchCount", "100")
    fake.hash.set("errorCount", "5")
    fake.hash.set("cacheHitCount", "10")
    fake.hash.set("cacheMissCount", "30")
    fake.hash.set("citationCount", "250")
    fake.latencies = ["10", "20", "30"]
    enableRedis(fake)

    getMetrics() // lazy trigger for hook creation + restore
    await __whenRagRestoreSettledForTests()

    const m = getMetrics()
    expect(m.searchCount).toBe(100)
    expect(m.errorCount).toBe(5)
    expect(m.errorRate).toBeCloseTo(0.05)
    expect(m.cacheHitRate).toBeCloseTo(0.25)
    expect(m.totalCitations).toBe(250)
    expect(m.avgLatencyMs).toBeCloseTo(20)
  })

  it("merges restored latencies before locally recorded ones", async () => {
    const fake = new FakeRagRedis()
    fake.latencies = ["10", "20", "30"]
    enableRedis(fake)

    getMetrics()
    await __whenRagRestoreSettledForTests()
    recordSearch(40, 0)

    const m = getMetrics()
    expect(m.searchCount).toBe(1)
    expect(m.avgLatencyMs).toBeCloseTo(25)
  })

  it("does not double-count writes recorded before the restore settles", async () => {
    const fake = new FakeRagRedis()
    fake.hash.set("searchCount", "50")
    enableRedis(fake)

    recordSearch(100, 1) // hook created here; restore in flight; flush deferred
    await __whenRagRestoreSettledForTests()
    await flushRagMetricsNow()

    expect(getMetrics().searchCount).toBe(51)
    expect(fake.hash.get("searchCount")).toBe("51")
    expect(fake.latencies).toEqual(["100"])
  })

  it("resetMetrics wipes redis state and abandons a pending restore", async () => {
    const fake = new FakeRagRedis()
    fake.hash.set("searchCount", "100")
    fake.latencies = ["10"]
    enableRedis(fake)

    getMetrics() // starts restore (not yet settled)
    resetMetrics() // abandon before the restore's merge runs
    await __whenRagRestoreSettledForTests()
    await settleAsyncWork()

    expect(getMetrics().searchCount).toBe(0)
    expect(fake.hash.size).toBe(0)
    expect(fake.latencies).toEqual([])
    expect(fake.ops).toContain("del 2")
  })

  it("reset during an in-flight flush leaves no stale deltas in redis", async () => {
    let releaseWrites: () => void = () => undefined
    const gate = new Promise<void>((resolve) => {
      releaseWrites = resolve
    })
    const gated = new (class extends FakeRagRedis {
      async hincrby(key: string, field: string, increment: number): Promise<number> {
        await gate
        return super.hincrby(key, field, increment)
      }
    })()
    enableRedis(gated)

    recordSearch(10, 0)
    const flushing = flushRagMetricsNow()
    await settleAsyncWork() // flush reaches the gated hincrby
    resetMetrics()
    releaseWrites()
    await flushing
    await settleAsyncWork()

    expect(gated.hash.size).toBe(0)
    expect(gated.latencies).toEqual([])
    expect(getMetrics().searchCount).toBe(0)
  })

  it("degrades silently when redis is unavailable (no REDIS_URL, no client)", async () => {
    enableRedis(null)

    recordSearch(100, 1)
    recordError()
    await __whenRagRestoreSettledForTests()
    await flushRagMetricsNow()

    const m = getMetrics()
    expect(m.searchCount).toBe(1)
    expect(m.errorCount).toBe(1)
    expect(m.errorRate).toBeCloseTo(1)
    const messages = warnSpy.mock.calls.map((call) => String(call[0]))
    expect(messages.some((msg) => msg.includes("redis-unavailable"))).toBe(true)
    // Warned once for the failure type - no spam across restore + flush paths.
    expect(messages.filter((msg) => msg.includes("redis-unavailable"))).toHaveLength(1)
  })

  it("keeps memory metrics intact after repeated write failures and stops retrying", async () => {
    const fake = new FakeRagRedis()
    fake.failWrites = true
    enableRedis(fake)

    recordSearch(100, 1)
    for (let attempt = 0; attempt < 5; attempt++) {
      await flushRagMetricsNow()
    }

    expect(getMetrics().searchCount).toBe(1)

    // Redis recovers, but the writer is disabled after MAX_WRITE_ATTEMPTS.
    fake.failWrites = false
    recordSearch(200, 0)
    await flushRagMetricsNow()
    expect(fake.hash.size).toBe(0)
    expect(getMetrics().searchCount).toBe(2)

    const messages = warnSpy.mock.calls.map((call) => String(call[0]))
    expect(messages.some((msg) => msg.includes("write"))).toBe(true)
    expect(messages.some((msg) => msg.includes("persistence-disabled"))).toBe(true)
  })

  it("re-arms the writer after an admin reset once redis recovers", async () => {
    const fake = new FakeRagRedis()
    fake.failWrites = true
    enableRedis(fake)

    recordSearch(100, 1)
    for (let attempt = 0; attempt < 5; attempt++) {
      await flushRagMetricsNow()
    }

    fake.failWrites = false
    resetMetrics()
    await settleAsyncWork()
    recordSearch(50, 0)
    await flushRagMetricsNow()

    expect(fake.hash.get("searchCount")).toBe("1")
    expect(getMetrics().searchCount).toBe(1)
  })

  it("never installs shutdown signal handlers under Jest", () => {
    const before = {
      sigterm: process.listenerCount("SIGTERM"),
      sigint: process.listenerCount("SIGINT"),
      beforeExit: process.listenerCount("beforeExit"),
    }

    const fake = new FakeRagRedis()
    enableRedis(fake) // redis mode ON — would register handlers in production
    recordSearch(100, 1)

    expect(process.listenerCount("SIGTERM")).toBe(before.sigterm)
    expect(process.listenerCount("SIGINT")).toBe(before.sigint)
    expect(process.listenerCount("beforeExit")).toBe(before.beforeExit)
  })
})
