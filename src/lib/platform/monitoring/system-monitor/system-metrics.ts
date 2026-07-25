import "server-only"
import os from "os"
import { START_TIME } from "./common"
import type { SystemMetrics } from "./types"

export function getSystemMetrics(): SystemMetrics {
  const mem = process.memoryUsage()
  return {
    uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
    memory: {
      rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      externalMb: Math.round((mem.external / 1024 / 1024) * 100) / 100,
    },
    cpu: { loadAvg: os.loadavg() },
  }
}
