export const START_TIME = Date.now()

export const RESOURCE_THRESHOLDS = {
  heapUsedPercent: { warning: 70, critical: 85 },
  rssMb: { warning: 512, critical: 1024 },
  loadAvgCpuCount: { warning: 0.8, critical: 1.5 },
} as const

export const RESOURCE_ALERT_COOLDOWN_MS = 5 * 60 * 1000
export const ALERT_HISTORY_MAX = 1000
