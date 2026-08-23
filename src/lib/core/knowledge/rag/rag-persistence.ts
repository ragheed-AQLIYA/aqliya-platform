/**
 * Optional Redis persistence for RAG metrics (write-behind hybrid).
 *
 * Modes (RAG_METRICS_PERSISTENCE):
 * - "memory" (default / unset): exact in-memory behavior, zero Redis usage.
 * - "redis": best-effort persistence behind the synchronous metrics API.
 *
 * Sync/async contract:
 * - Memory in rag-metrics.ts remains the single source of truth for reads.
 * - recordDelta()/reset() are synchronous, fire-and-forget hooks: they only
 *   accumulate deltas and schedule a debounced async flush. Nothing in the
 *   hot path ever awaits Redis; every failure is swallowed with at most one
 *   console.warn per failure type.
 * - On hook creation a once-per-boot restore reads the persisted snapshot and
 *   merges it into memory via callback. Flushes are deferred while the restore
 *   is in flight, and anything this process already flushed is subtracted so
 *   restored values are never double-counted.
 * - Missing REDIS_URL, failed ioredis import, or repeated failed write rounds
 *   degrade silently to pure in-memory behavior.
 *
 * Redis data model (durable counters - no TTL; latency list is LTRIM-bounded):
 * - HASH  aqliya:rag:metrics            -> searchCount, errorCount, cacheHitCount,
 *                                          cacheMissCount, citationCount
 * - LIST  aqliya:rag:metrics:latencies  -> newest latency samples at the tail
 *
 * Writes are additive (HINCRBY / RPUSH), so a late restore or a concurrent
 * process can never clobber previously accumulated counters.
 */

type CounterField =
  | "searchCount"
  | "errorCount"
  | "cacheHitCount"
  | "cacheMissCount"
  | "citationCount"

const COUNTER_FIELDS: readonly CounterField[] = [
  "searchCount",
  "errorCount",
  "cacheHitCount",
  "cacheMissCount",
  "citationCount",
] as const

export interface RagMetricsDelta {
  searchCount?: number
  errorCount?: number
  cacheHitCount?: number
  cacheMissCount?: number
  citationCount?: number
  /** Latency samples (ms) in chronological order. */
  latencies?: number[]
}

export interface RestoredRagMetricsSnapshot {
  searchCount: number
  errorCount: number
  cacheHitCount: number
  cacheMissCount: number
  citationCount: number
  /** Persisted samples (oldest -> newest), net of this process's own writes. */
  searchLatencies: number[]
}

export interface RagMetricsPersistenceHook {
  /** Synchronous, fire-and-forget: queue a delta for the next batched flush. */
  recordDelta(delta: RagMetricsDelta): void
  /** Synchronous, fire-and-forget: wipe persisted state, abandon in-flight restore. */
  reset(): void
}

export type RestoredSnapshotMerger = (snapshot: RestoredRagMetricsSnapshot) => void

/**
 * Minimal structural subset of the ioredis client used by this module.
 * Tests inject a fake satisfying this interface; production casts the
 * dynamically imported ioredis client to it.
 */
export interface RagRedisLike {
  hgetall(key: string): Promise<Record<string, string>>
  hincrby(key: string, field: string, increment: number): Promise<number>
  rpush(key: string, ...values: (string | number)[]): Promise<number>
  ltrim(key: string, start: number, stop: number): Promise<unknown>
  lrange(key: string, start: number, stop: number): Promise<string[]>
  del(...keys: string[]): Promise<unknown>
}

const METRICS_KEY = "aqliya:rag:metrics"
const LATENCIES_KEY = "aqliya:rag:metrics:latencies"

/** Must stay in sync with MAX_LATENCY_ENTRIES in rag-metrics.ts. */
const MAX_PERSISTED_LATENCIES = 1000

const FLUSH_DEBOUNCE_MS = 2000
const WRITE_RETRY_BACKOFF_MS: readonly number[] = [2000, 6000, 18000, 60000]
const MAX_WRITE_ATTEMPTS = 5
const SHUTDOWN_FLUSH_TIMEOUT_MS = 3000

type Counters = Record<CounterField, number>

function emptyCounters(): Counters {
  return {
    searchCount: 0,
    errorCount: 0,
    cacheHitCount: 0,
    cacheMissCount: 0,
    citationCount: 0,
  }
}

let hookHolder: { hook: RagMetricsPersistenceHook | null } | null = null

const pendingCounters = emptyCounters()
let pendingLatencies: number[] = []
const flushedCounters = emptyCounters()
let flushedLatencyCount = 0

let injectedClient: RagRedisLike | null = null
let realClient: RagRedisLike | null = null
let realClientHandle: { disconnect?: () => void } | null = null

let flushTimer: ReturnType<typeof setTimeout> | null = null
let flushRunning = false
let restoreInFlight = false
let restoreSettled: Promise<void> = Promise.resolve()
let restoreAbandoned = false
let resetEpoch = 0
let writeFailures = 0
let writesDisabled = false
let shutdownHandlersRegistered = false

const warnedTypes = new Set<string>()

function warnOnce(type: string, errorName?: string): void {
  if (warnedTypes.has(type)) return
  warnedTypes.add(type)
  // Only the error class name is logged - messages may embed connection URLs.
  const suffix = errorName ? " (" + errorName + ")" : ""
  console.warn("[rag-metrics-persistence] " + type + suffix + " - continuing with in-memory metrics")
}

async function acquireClient(): Promise<RagRedisLike | null> {
  if (injectedClient) return injectedClient
  if (realClient) return realClient
  const url = process.env.REDIS_URL
  if (!url) {
    warnOnce("redis-unavailable", "REDIS_URL_NOT_SET")
    return null
  }
  try {
    const { default: Redis } = await import("ioredis")
    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 2000,
      retryStrategy(times: number) {
        return times > 5 ? null : Math.min(times * 200, 1000)
      },
    })
    client.on("error", (err: unknown) => {
      warnOnce("redis-error", err instanceof Error ? err.name : "Error")
    })
    realClient = client as unknown as RagRedisLike
    realClientHandle = client
    return realClient
  } catch (err) {
    warnOnce("redis-unavailable", err instanceof Error ? err.name : "Error")
    return null
  }
}

function hasPending(): boolean {
  return (
    pendingLatencies.length > 0 || COUNTER_FIELDS.some((field) => pendingCounters[field] !== 0)
  )
}

function takePending(): { counters: Counters; latencies: number[] } {
  const batch = { counters: { ...pendingCounters }, latencies: pendingLatencies }
  for (const field of COUNTER_FIELDS) pendingCounters[field] = 0
  pendingLatencies = []
  return batch
}

function mergeBack(batch: { counters: Counters; latencies: number[] }): void {
  for (const field of COUNTER_FIELDS) pendingCounters[field] += batch.counters[field]
  // Failed batch entries are older than anything accumulated since, so they
  // go back to the head of the latency queue.
  pendingLatencies = [...batch.latencies, ...pendingLatencies]
}

function unrefTimer(timer: ReturnType<typeof setTimeout>): void {
  const ref = timer as unknown as { unref?: () => void }
  if (typeof ref.unref === "function") ref.unref()
}

function scheduleFlush(delayMs: number): void {
  if (writesDisabled || flushTimer !== null || flushRunning || restoreInFlight) return
  if (!hasPending()) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    void runFlush()
  }, delayMs)
  unrefTimer(flushTimer)
}

async function runFlush(): Promise<void> {
  if (flushRunning || restoreInFlight || !hasPending()) return
  flushRunning = true
  try {
    await doFlush()
  } finally {
    flushRunning = false
    if (hasPending()) scheduleFlush(FLUSH_DEBOUNCE_MS)
  }
}

async function doFlush(): Promise<void> {
  if (writesDisabled) return
  const client = await acquireClient()
  if (!client) {
    registerWriteFailure("redis-unavailable")
    return
  }
  const epoch = resetEpoch
  const batch = takePending()
  try {
    for (const field of COUNTER_FIELDS) {
      const delta = batch.counters[field]
      if (delta !== 0) await client.hincrby(METRICS_KEY, field, delta)
    }
    if (batch.latencies.length > 0) {
      await client.rpush(LATENCIES_KEY, ...batch.latencies)
      await client.ltrim(LATENCIES_KEY, -MAX_PERSISTED_LATENCIES, -1)
    }
    for (const field of COUNTER_FIELDS) flushedCounters[field] += batch.counters[field]
    flushedLatencyCount += batch.latencies.length
  } catch (err) {
    mergeBack(batch)
    registerWriteFailure("write", err)
    return
  }
  // A reset happened while this batch was in flight: its DEL may have landed
  // before these writes did. Compensate so post-reset state stays clean.
  if (epoch !== resetEpoch) {
    void client.del(METRICS_KEY, LATENCIES_KEY).catch(() => undefined)
  }
}

function registerWriteFailure(type: string, err?: unknown): void {
  warnOnce(type, err instanceof Error ? err.name : undefined)
  writeFailures += 1
  if (writeFailures >= MAX_WRITE_ATTEMPTS) {
    writesDisabled = true
    pendingLatencies = []
    for (const field of COUNTER_FIELDS) pendingCounters[field] = 0
    if (flushTimer !== null) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
    warnOnce("persistence-disabled")
  } else {
    const backoff = WRITE_RETRY_BACKOFF_MS[Math.min(writeFailures - 1, WRITE_RETRY_BACKOFF_MS.length - 1)]
    scheduleFlush(backoff)
  }
}

function parseCounter(raw: string | undefined): number {
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0
}

function buildNetSnapshot(
  hash: Record<string, string>,
  latencies: string[],
): RestoredRagMetricsSnapshot {
  const snapshot: RestoredRagMetricsSnapshot = {
    searchCount: 0,
    errorCount: 0,
    cacheHitCount: 0,
    cacheMissCount: 0,
    citationCount: 0,
    searchLatencies: [],
  }
  for (const field of COUNTER_FIELDS) {
    // Subtract deltas this process already flushed to avoid double counting.
    snapshot[field] = Math.max(0, parseCounter(hash[field]) - flushedCounters[field])
  }
  const samples = latencies.map(parseCounter)
  const own = Math.min(flushedLatencyCount, samples.length)
  snapshot.searchLatencies = samples.slice(0, samples.length - own)
  return snapshot
}

function startRestore(merge: RestoredSnapshotMerger): void {
  // Set synchronously before any await so deferred flushes cannot interleave
  // with the restore reads.
  restoreInFlight = true
  restoreSettled = (async () => {
    try {
      const client = await acquireClient()
      if (!client) return
      const [hash, latencies] = await Promise.all([
        client.hgetall(METRICS_KEY),
        client.lrange(LATENCIES_KEY, 0, -1),
      ])
      if (restoreAbandoned) return
      merge(buildNetSnapshot(hash, latencies))
    } catch (err) {
      warnOnce("restore", err instanceof Error ? err.name : "Error")
    } finally {
      restoreInFlight = false
      if (hasPending()) scheduleFlush(FLUSH_DEBOUNCE_MS)
    }
  })()
}

/**
 * Wire a bounded graceful-shutdown flush so at most SHUTDOWN_FLUSH_TIMEOUT_MS
 * of deltas are lost on SIGTERM/SIGINT instead of the full debounce window.
 *
 * Registered ONLY when persistence is enabled (redis mode) and never under
 * Jest (JEST_WORKER_ID) so test runners keep full control of signals.
 * Handlers exit the process explicitly: installing a signal listener
 * disables Node's default termination, so the exit must be reinstated.
 */
function registerShutdownFlush(): void {
  if (shutdownHandlersRegistered) return
  if (process.env.JEST_WORKER_ID) return
  shutdownHandlersRegistered = true

  const boundedFlush = (): Promise<void> =>
    Promise.race([
      flushRagMetricsNow(),
      new Promise<void>((resolve) => setTimeout(resolve, SHUTDOWN_FLUSH_TIMEOUT_MS)),
    ])

  const onSignal = (signal: NodeJS.Signals): void => {
    void boundedFlush()
      .catch(() => undefined)
      .finally(() => {
        realClientHandle?.disconnect?.()
        process.exit(0)
      })
  }

  process.once("SIGTERM", onSignal)
  process.once("SIGINT", onSignal)
  // Natural exit: flush attempt only — beforeExit must never force-exit.
  process.once("beforeExit", () => {
    void boundedFlush().catch(() => undefined)
  })
}

/**
 * Returns the memoized persistence hook, or null when persistence is disabled.
 * Disabled is the default and keeps rag-metrics.ts behavior identical to the
 * pure in-memory implementation (the nullish call short-circuits to a no-op).
 *
 * The first caller's merge callback wins; rag-metrics.ts passes a stable
 * module-level function.
 */
export function getRagMetricsPersistence(
  merge: RestoredSnapshotMerger,
): RagMetricsPersistenceHook | null {
  if (hookHolder) return hookHolder.hook
  const mode = process.env.RAG_METRICS_PERSISTENCE?.trim().toLowerCase()
  if (mode !== "redis") {
    hookHolder = { hook: null }
    return null
  }

  const hook: RagMetricsPersistenceHook = {
    recordDelta(delta: RagMetricsDelta): void {
      if (writesDisabled) return
      for (const field of COUNTER_FIELDS) {
        const value = delta[field]
        if (typeof value === "number" && value !== 0) pendingCounters[field] += value
      }
      if (delta.latencies !== undefined) {
        for (const sample of delta.latencies) pendingLatencies.push(sample)
      }
      scheduleFlush(FLUSH_DEBOUNCE_MS)
    },
    reset(): void {
      resetEpoch += 1
      restoreAbandoned = true
      // Re-arm the writer: an admin reset is a fresh start, so a previously
      // degraded writer gets a chance to recover against a healthy Redis.
      writesDisabled = false
      writeFailures = 0
      pendingLatencies = []
      for (const field of COUNTER_FIELDS) pendingCounters[field] = 0
      for (const field of COUNTER_FIELDS) flushedCounters[field] = 0
      flushedLatencyCount = 0
      // Fire-and-forget wipe of persisted state.
      void acquireClient()
        .then((client) => (client ? client.del(METRICS_KEY, LATENCIES_KEY) : undefined))
        .catch(() => undefined)
    },
  }
  hookHolder = { hook }
  registerShutdownFlush()
  startRestore(merge)
  return hook
}

/**
 * Flush pending deltas immediately (bypasses the debounce). Useful for
 * graceful shutdown wiring; never throws.
 */
export async function flushRagMetricsNow(): Promise<void> {
  if (restoreInFlight) {
    await restoreSettled.catch(() => undefined)
  }
  if (flushRunning) return
  flushRunning = true
  try {
    await doFlush()
  } finally {
    flushRunning = false
    if (hasPending()) scheduleFlush(FLUSH_DEBOUNCE_MS)
  }
}

/** Test hook: inject a fake Redis client (takes precedence over the real one). */
export function __setRagRedisClientForTests(client: RagRedisLike | null): void {
  injectedClient = client
}

/** Test hook: restore pristine module state between scenarios. */
export function __resetRagPersistenceForTests(): void {
  if (flushTimer !== null) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  if (realClientHandle) realClientHandle.disconnect?.()
  realClient = null
  realClientHandle = null
  injectedClient = null
  hookHolder = null
  for (const field of COUNTER_FIELDS) pendingCounters[field] = 0
  pendingLatencies = []
  for (const field of COUNTER_FIELDS) flushedCounters[field] = 0
  flushedLatencyCount = 0
  flushRunning = false
  restoreInFlight = false
  restoreSettled = Promise.resolve()
  restoreAbandoned = false
  resetEpoch = 0
  writeFailures = 0
  writesDisabled = false
  shutdownHandlersRegistered = false
  warnedTypes.clear()
}

/** Test hook: await completion of the once-per-boot restore. */
export function __whenRagRestoreSettledForTests(): Promise<void> {
  return restoreSettled
}
