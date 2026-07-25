import "server-only"
import { getQueue } from "@/lib/platform/operations/queue-runtime"
import { isEnabled } from "@/lib/platform/feature-flags/registry"
import type { QueueMetrics } from "./types"

export async function getQueueMetrics(): Promise<QueueMetrics> {
  const empty: QueueMetrics = { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
  if (!isEnabled("queue.enabled")) return empty
  try {
    const queue = getQueue()
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ])
    return { waiting, active, completed, failed, delayed }
  } catch {
    return empty
  }
}

export async function getFailedJobs(limit = 20): Promise<{ id: string; type: string; failedReason: string; timestamp: string }[]> {
  if (!isEnabled("queue.enabled")) return []
  try {
    const queue = getQueue()
    const failed = await queue.getFailed(0, limit)
    return failed.map(j => ({
      id: String(j.id),
      type: String(j.data?.type ?? "unknown"),
      failedReason: String(j.failedReason ?? "unknown"),
      timestamp: j.finishedOn ? new Date(j.finishedOn).toISOString() : new Date().toISOString(),
    }))
  } catch {
    return []
  }
}
