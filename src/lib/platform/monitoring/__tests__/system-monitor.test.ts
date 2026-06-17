import { getSystemMetrics, checkEnvironmentHealth, getHealthCheck, getAlertHistory, acknowledgeAlert, createAlert, getQueueMetrics, getFailedJobs } from "../system-monitor"

describe("SystemMonitor", () => {
  describe("getSystemMetrics", () => {
    it("returns uptime and memory metrics", () => {
      const m = getSystemMetrics()
      expect(m.uptimeSeconds).toBeGreaterThanOrEqual(0)
      expect(m.memory.rssMb).toBeGreaterThan(0)
      expect(m.memory.heapTotalMb).toBeGreaterThan(0)
      expect(m.memory.heapUsedMb).toBeGreaterThan(0)
    })
  })

  describe("checkEnvironmentHealth", () => {
    it("returns ok when required env vars exist", async () => {
      const result = await checkEnvironmentHealth()
      expect(result.status).toBe("ok")
    })
  })

  describe("getHealthCheck", () => {
    it("returns health check with server component", async () => {
      const result = await getHealthCheck(["server"])
      expect(result.status).toBe("healthy")
      expect(result.checks.server).toBeDefined()
      expect(result.timestamp).toBeDefined()
      expect(result.version).toBeDefined()
    })

    it("includes env check", async () => {
      const result = await getHealthCheck(["server", "env"])
      expect(result.checks.env).toBeDefined()
    })

    it("returns degraded when component warns", async () => {
      const result = await getHealthCheck(["ai"])
      expect(["healthy", "degraded"]).toContain(result.status)
    })
  })

  describe("getQueueMetrics", () => {
    it("returns empty metrics when queue disabled", async () => {
      const m = await getQueueMetrics()
      expect(m).toEqual({ waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 })
    })
  })

  describe("getFailedJobs", () => {
    it("returns empty array when queue disabled", async () => {
      const jobs = await getFailedJobs()
      expect(jobs).toEqual([])
    })
  })

  describe("alerts", () => {
    it("creates and retrieves alerts", () => {
      createAlert("server", "critical", "Test alert")
      const history = getAlertHistory()
      expect(history.length).toBeGreaterThanOrEqual(1)
      const created = history[history.length - 1]
      expect(created.severity).toBe("critical")
      expect(created.message).toBe("Test alert")
      expect(created.acknowledged).toBe(false)
    })

    it("acknowledges an alert", () => {
      const history = getAlertHistory()
      const last = history[history.length - 1]
      const ok = acknowledgeAlert(last.id)
      expect(ok).toBe(true)
      expect(last.acknowledged).toBe(true)
    })

    it("returns false for unknown alert id", () => {
      const ok = acknowledgeAlert("nonexistent")
      expect(ok).toBe(false)
    })
  })
})
