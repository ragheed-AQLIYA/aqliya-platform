import "server-only"
import os from "os"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { START_TIME, RESOURCE_THRESHOLDS, RESOURCE_ALERT_COOLDOWN_MS, ALERT_HISTORY_MAX } from "./common"
import { getSystemMetrics } from "./system-metrics"
import type { Alert, HealthComponent } from "./types"

const alertHistory: Alert[] = []

export function getAlertHistory(limit = 50): Alert[] {
  return alertHistory.slice(-limit)
}

export function acknowledgeAlert(alertId: string): boolean {
  const alert = alertHistory.find(a => a.id === alertId)
  if (!alert) return false
  alert.acknowledged = true
  return true
}

export function createAlert(component: HealthComponent, severity: Alert["severity"], message: string): void {
  const alert: Alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    component,
    severity,
    message,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  }
  alertHistory.push(alert)
  writePlatformAuditLog({
    productKey: "platform",
    action: `alert_${severity}`,
    severity,
    status: "pending",
    metadata: { alert },
  }).catch(() => {})

  if (alertHistory.length > ALERT_HISTORY_MAX) {
    alertHistory.splice(0, alertHistory.length - ALERT_HISTORY_MAX)
  }
}

let lastResourceAlertAt = 0

export function checkResourceThresholds(): void {
  const now = Date.now()
  if (now - lastResourceAlertAt < RESOURCE_ALERT_COOLDOWN_MS) return

  const metrics = getSystemMetrics()
  const cpuCount = os.cpus().length

  const heapPercent = Math.round((metrics.memory.heapUsedMb / metrics.memory.heapTotalMb) * 100)
  if (heapPercent >= RESOURCE_THRESHOLDS.heapUsedPercent.critical) {
    createAlert("server", "critical", `Heap memory at ${heapPercent}% (${metrics.memory.heapUsedMb}MB / ${metrics.memory.heapTotalMb}MB)`)
    lastResourceAlertAt = now
  } else if (heapPercent >= RESOURCE_THRESHOLDS.heapUsedPercent.warning) {
    createAlert("server", "warning", `Heap memory at ${heapPercent}% (${metrics.memory.heapUsedMb}MB / ${metrics.memory.heapTotalMb}MB)`)
    lastResourceAlertAt = now
  }

  if (metrics.memory.rssMb >= RESOURCE_THRESHOLDS.rssMb.critical) {
    createAlert("server", "critical", `RSS memory at ${metrics.memory.rssMb}MB (threshold: ${RESOURCE_THRESHOLDS.rssMb.critical}MB)`)
    lastResourceAlertAt = now
  } else if (metrics.memory.rssMb >= RESOURCE_THRESHOLDS.rssMb.warning) {
    createAlert("server", "warning", `RSS memory at ${metrics.memory.rssMb}MB (threshold: ${RESOURCE_THRESHOLDS.rssMb.warning}MB)`)
    lastResourceAlertAt = now
  }

  const loadAvg1m = metrics.cpu.loadAvg[0]
  const loadRatio = loadAvg1m / cpuCount
  if (loadRatio >= RESOURCE_THRESHOLDS.loadAvgCpuCount.critical) {
    createAlert("server", "critical", `CPU load average ${loadAvg1m.toFixed(2)} (${(loadRatio * 100).toFixed(0)}% of ${cpuCount} cores)`)
    lastResourceAlertAt = now
  } else if (loadRatio >= RESOURCE_THRESHOLDS.loadAvgCpuCount.warning) {
    createAlert("server", "warning", `CPU load average ${loadAvg1m.toFixed(2)} (${(loadRatio * 100).toFixed(0)}% of ${cpuCount} cores)`)
    lastResourceAlertAt = now
  }
}
