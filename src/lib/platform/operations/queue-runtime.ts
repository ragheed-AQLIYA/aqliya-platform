import "server-only"

import Queue from "bull"
import { getRedisUrl } from "@/lib/platform/redis-config"
import { isEnabled } from "@/lib/platform/feature-flags/registry"

export interface QueueTask {
  id: string
  type: string
  payload: Record<string, unknown>
  priority?: number
  delay?: number
  attempts?: number
  createdAt: Date
}

export interface QueueResult {
  id: string
  status: "queued" | "completed" | "failed"
  error?: string
  completedAt?: Date
}

type JobHandler = (task: QueueTask) => Promise<void>

const handlers = new Map<string, JobHandler>()

const globalForQueue = globalThis as unknown as {
  bullQueue?: Queue.Queue
}

function getRedisUrlForBull(): string {
  const url = process.env.REDIS_URL || "redis://localhost:6379"
  return url
}

export function getQueue(): Queue.Queue {
  if (globalForQueue.bullQueue) return globalForQueue.bullQueue

  const queue = new Queue("aqliya-workflows", getRedisUrlForBull(), {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  })

  queue.on("error", (err) => {
    console.error("[queue] Bull error:", err.message)
  })

  queue.on("failed", (job, err) => {
    console.error(`[queue] Job ${job.id} (${job.data.type}) failed:`, err.message)
  })

  globalForQueue.bullQueue = queue
  return queue
}

export function registerHandler(type: string, handler: JobHandler): void {
  if (handlers.has(type)) {
    throw new Error(`Handler already registered for queue type: ${type}`)
  }
  handlers.set(type, handler)
}

export async function enqueueTask(
  type: string,
  payload: Record<string, unknown>,
  options?: { priority?: number; delay?: number; attempts?: number },
): Promise<string> {
  if (!isEnabled("queue.enabled")) {
    const fakeId = `queue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    return fakeId
  }

  const queue = getQueue()
  const job = await queue.add(
    { type, payload, createdAt: new Date().toISOString() },
    {
      priority: options?.priority,
      delay: options?.delay,
      attempts: options?.attempts,
    },
  )
  return job.id!.toString()
}

export async function getJobStatus(jobId: string): Promise<QueueResult | null> {
  if (!isEnabled("queue.enabled")) {
    return { id: jobId, status: "completed", completedAt: new Date() }
  }

  try {
    const queue = getQueue()
    const job = await queue.getJob(jobId)
    if (!job) return null

    const state = await job.getState()
    const status = state === "completed" ? "completed" : state === "failed" ? "failed" : "queued"

    return {
      id: jobId,
      status,
      error: (job.failedReason as string) ?? undefined,
      completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
    }
  } catch {
    return null
  }
}

export async function startWorkers(): Promise<void> {
  if (!isEnabled("queue.enabled")) return

  const queue = getQueue()

  queue.process(async (job) => {
      const { type, payload, createdAt } = job.data as {
        type: string
        payload: Record<string, unknown>
        createdAt: string
      }

    const handler = handlers.get(type)
    if (!handler) {
      throw new Error(`No handler registered for queue type: ${type}`)
    }

    const task: QueueTask = {
      id: String(job.id),
      type,
      payload,
      createdAt: new Date(createdAt),
    }

    await handler(task)
  })

  console.log(`[queue] Worker started with ${handlers.size} registered handler(s)`)
}
