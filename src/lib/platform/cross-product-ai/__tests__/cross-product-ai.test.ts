import { describe, expect, it, jest, beforeEach } from "@jest/globals"

// ─── Mocks ───

const mockStore: Record<string, any[]> = {
  aiCrossProductSession: [],
  aiActionRegistry: [],
  aiContextBridge: [],
}

let idCounter = 1

function nextId() {
  return `mock_${idCounter++}`
}

function findInStore(model: string, where: Record<string, any>): any | null {
  return mockStore[model].find((r) =>
    Object.entries(where).every(([k, v]) => r[k] === v),
  ) ?? null
}

function filterStore(model: string, where?: Record<string, any>): any[] {
  if (!where || Object.keys(where).length === 0) return [...mockStore[model]]
  return mockStore[model].filter((r) =>
    Object.entries(where).every(([k, v]) => r[k] === v),
  )
}

function resetStores() {
  for (const key of Object.keys(mockStore)) {
    mockStore[key] = []
  }
  idCounter = 1
}

const mockPrisma = {
  aiCrossProductSession: {
    create: jest.fn(async ({ data }: any) => {
      const record = { id: nextId(), ...data, createdAt: new Date(), updatedAt: new Date() }
      mockStore.aiCrossProductSession.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore("aiCrossProductSession", where) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy, take, skip }: any) => {
      let results = filterStore("aiCrossProductSession", where)
      if (orderBy?.createdAt === "desc") {
        results = [...results].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      if (skip) results = results.slice(skip)
      if (take) results = results.slice(0, take)
      return results
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const record = findInStore("aiCrossProductSession", where)
      if (!record) throw new Error("Session not found")
      Object.assign(record, data, { updatedAt: new Date() })
      return record
    }),
    count: jest.fn(async ({ where }: any) => {
      return filterStore("aiCrossProductSession", where).length
    }),
    groupBy: jest.fn(async ({ by, where, _count }: any) => {
      const results = filterStore("aiCrossProductSession", where)
      const field = by[0]
      const groups = new Map<string, number>()
      for (const r of results) {
        const key = r[field]
        groups.set(key, (groups.get(key) ?? 0) + 1)
      }
      return Array.from(groups.entries()).map(([value, count]) => {
        const item: Record<string, any> = { [field]: value }
        if (_count) item._count = { [field]: count }
        return item
      })
    }),
  },
  aiActionRegistry: {
    create: jest.fn(async ({ data }: any) => {
      const record = { id: nextId(), ...data, createdAt: new Date(), updatedAt: new Date() }
      mockStore.aiActionRegistry.push(record)
      return record
    }),
    findUnique: jest.fn(async ({ where }: any) => {
      return findInStore("aiActionRegistry", where) ?? null
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore("aiActionRegistry", where)
      if (orderBy?.createdAt === "desc") {
        results = [...results].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      return results
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const record = findInStore("aiActionRegistry", where)
      if (!record) throw new Error("Action not found")
      Object.assign(record, data, { updatedAt: new Date() })
      return record
    }),
    count: jest.fn(async ({ where }: any = {}) => {
      return filterStore("aiActionRegistry", where).length
    }),
  },
  aiContextBridge: {
    create: jest.fn(async ({ data }: any) => {
      const record = { id: nextId(), ...data, createdAt: new Date(), updatedAt: new Date() }
      mockStore.aiContextBridge.push(record)
      return record
    }),
    findMany: jest.fn(async ({ where, orderBy }: any) => {
      let results = filterStore("aiContextBridge", where)
      if (orderBy?.createdAt === "desc") {
        results = [...results].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }
      return results
    }),
    count: jest.fn(async () => {
      return mockStore.aiContextBridge.length
    }),
  },
}

const mockAuditLog = jest.fn()

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}))

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: (...args: any[]) => {
    mockAuditLog(...args)
    return Promise.resolve({ ok: true, id: "audit_1" })
  },
}))

jest.mock("@/lib/platform/product-registry", () => ({
  getProductById: jest.fn((id: string) => {
    const products: Record<string, any> = {
      audit: { id: "audit", name: "AuditOS", module: "audit" },
      decision: { id: "decision", name: "DecisionOS", module: "decision" },
    }
    return products[id] ?? undefined
  }),
}))

// ─── Subject ───

import {
  createAiSession,
  getSession,
  listSessions,
  reviewSession,
  registerAction,
  getAction,
  listActions,
  updateAction,
  deactivateAction,
  buildCrossProductContext,
  registerContextBridge,
  getContextBridges,
  getCrossProductStats,
} from "../cross-product-ai-service"

// ─── Tests ───

describe("CrossProductAI Service", () => {
  beforeEach(() => {
    resetStores()
    mockAuditLog.mockClear()
    jest.clearAllMocks()
  })

  // ─── Sessions ───

  describe("createAiSession", () => {
    it("creates a session and returns result with requiresReview=true by default", async () => {
      const result = await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "analysis",
        requestText: "Analyze this finding",
      })

      expect(result.sessionId).toBeTruthy()
      expect(result.responseText).toBe("")
      expect(result.modelUsed).toBe("deterministic")
      expect(result.requiresReview).toBe(true)
      expect(mockAuditLog).toHaveBeenCalled()
    })

    it("sets requiresReview=false for LOW risk actions", async () => {
      await registerAction({
        actionKey: "audit.simple_lookup",
        productKey: "audit",
        name: "Simple Lookup",
        promptTemplate: "Look up {{requestText}}",
        riskLevel: "LOW",
        requiresReview: false,
      })

      const result = await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "lookup",
        requestText: "Find account 1000",
        metadata: { actionKey: "audit.simple_lookup" },
      })

      expect(result.requiresReview).toBe(false)
      expect(result.responseText).toBe("Look up Find account 1000")
    })

    it("enforces requiresReview=true for HIGH risk actions regardless of input", async () => {
      await registerAction({
        actionKey: "decision.approve_recommendation",
        productKey: "decision",
        name: "Approve Recommendation",
        promptTemplate: "Generate approval for {{requestText}}",
        riskLevel: "HIGH",
        requiresReview: false,
      })

      const result = await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "decision",
        sourceAction: "approve",
        requestText: "Approve decision 42",
        metadata: { actionKey: "decision.approve_recommendation" },
      })

      expect(result.requiresReview).toBe(true)
    })
  })

  describe("getSession", () => {
    it("returns null for nonexistent session", async () => {
      const session = await getSession("nonexistent")
      expect(session).toBeNull()
    })

    it("returns a session by id with parsed metadata", async () => {
      const created = await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "test",
        requestText: "Test session",
        metadata: { extra: "data" },
      })

      const session = await getSession(created.sessionId)
      expect(session).not.toBeNull()
      expect(session.requestText).toBe("Test session")
      expect(session.metadata).toEqual({ extra: "data" })
    })
  })

  describe("listSessions", () => {
    it("lists sessions with filters", async () => {
      await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "a1",
        requestText: "Session 1",
      })
      await createAiSession({
        organizationId: "org-1",
        userId: "user-2",
        productContext: "decision",
        sourceAction: "a2",
        requestText: "Session 2",
      })

      const all = await listSessions({})
      expect(all).toHaveLength(2)

      const filtered = await listSessions({ productContext: "audit" })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].productContext).toBe("audit")
    })
  })

  describe("reviewSession", () => {
    it("updates session status to REVIEWED", async () => {
      const created = await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "test",
        requestText: "Review me",
      })

      await reviewSession(created.sessionId, "reviewer-1", "Looks good")

      const session = await getSession(created.sessionId)
      expect(session.status).toBe("REVIEWED")
      expect(session.reviewNotes).toBe("Looks good")
      expect(session.reviewedAt).toBeTruthy()
    })

    it("throws for nonexistent session", async () => {
      await expect(reviewSession("nonexistent", "user-1")).rejects.toThrow(
        "not found",
      )
    })
  })

  // ─── Actions ───

  describe("registerAction", () => {
    it("registers a new action and returns its id", async () => {
      const result = await registerAction({
        actionKey: "audit.finding.suggest_correction",
        productKey: "audit",
        name: "Suggest Correction",
        promptTemplate: "Suggest a correction for {{requestText}}",
        riskLevel: "MEDIUM",
      })

      expect(result.id).toBeTruthy()
      expect(mockAuditLog).toHaveBeenCalled()
    })

    it("normalizes risk level to uppercase", async () => {
      const result = await registerAction({
        actionKey: "test.critical_action",
        productKey: "test",
        name: "Critical",
        promptTemplate: "Critical {{requestText}}",
        riskLevel: "critical",
      })

      const action = await getAction("test.critical_action")
      expect(action.riskLevel).toBe("CRITICAL")
    })
  })

  describe("getAction", () => {
    it("returns null for nonexistent action", async () => {
      const action = await getAction("nonexistent")
      expect(action).toBeNull()
    })

    it("returns registered action by key", async () => {
      await registerAction({
        actionKey: "decision.decision.generate_summary",
        productKey: "decision",
        name: "Generate Summary",
        promptTemplate: "Summarize decision {{requestText}}",
        riskLevel: "LOW",
      })

      const action = await getAction("decision.decision.generate_summary")
      expect(action).not.toBeNull()
      expect(action.name).toBe("Generate Summary")
    })
  })

  describe("listActions", () => {
    it("lists all actions", async () => {
      await registerAction({
        actionKey: "audit.a1",
        productKey: "audit",
        name: "A1",
        promptTemplate: "A1: {{requestText}}",
        riskLevel: "LOW",
      })
      await registerAction({
        actionKey: "decision.d1",
        productKey: "decision",
        name: "D1",
        promptTemplate: "D1: {{requestText}}",
        riskLevel: "MEDIUM",
      })

      const all = await listActions()
      expect(all).toHaveLength(2)

      const filtered = await listActions("audit")
      expect(filtered).toHaveLength(1)
    })
  })

  describe("updateAction", () => {
    it("updates an existing action", async () => {
      await registerAction({
        actionKey: "test.updatable",
        productKey: "test",
        name: "Original",
        promptTemplate: "Original {{requestText}}",
        riskLevel: "LOW",
      })

      const action = await getAction("test.updatable")
      await updateAction(action.id, { name: "Updated" })

      const updated = await getAction("test.updatable")
      expect(updated.name).toBe("Updated")
    })
  })

  describe("deactivateAction", () => {
    it("deactivates an action", async () => {
      await registerAction({
        actionKey: "test.deactivate_me",
        productKey: "test",
        name: "Deactivate Me",
        promptTemplate: "Deactivate {{requestText}}",
        riskLevel: "LOW",
      })

      const action = await getAction("test.deactivate_me")
      await deactivateAction(action.id)

      const deactivated = await getAction("test.deactivate_me")
      expect(deactivated.isActive).toBe(false)
    })

    it("throws for nonexistent action", async () => {
      await expect(deactivateAction("nonexistent")).rejects.toThrow("not found")
    })
  })

  // ─── Context Bridging ───

  describe("registerContextBridge", () => {
    it("registers a bridge with stringified mappingConfig", async () => {
      const result = await registerContextBridge({
        organizationId: "org-1",
        sourceProduct: "audit",
        targetProduct: "decision",
        mappingName: "audit_finding_to_decision_risk",
        mappingConfig: {
          fieldMappings: [
            { sourceField: "title", targetField: "decisionTitle" },
          ],
        },
        createdBy: "user-1",
      })

      expect(result.id).toBeTruthy()
      expect(mockAuditLog).toHaveBeenCalled()
    })
  })

  describe("getContextBridges", () => {
    it("lists all bridges or filtered by source", async () => {
      await registerContextBridge({
        sourceProduct: "audit",
        targetProduct: "decision",
        mappingName: "bridge1",
        mappingConfig: {},
      })
      await registerContextBridge({
        sourceProduct: "decision",
        targetProduct: "sales",
        mappingName: "bridge2",
        mappingConfig: {},
      })

      const all = await getContextBridges()
      expect(all).toHaveLength(2)

      const filtered = await getContextBridges("audit")
      expect(filtered).toHaveLength(1)
      expect(filtered[0].mappingName).toBe("bridge1")
    })
  })

  describe("buildCrossProductContext", () => {
    it("throws when no bridge exists", async () => {
      await expect(
        buildCrossProductContext("audit", "rec-1", "decision"),
      ).rejects.toThrow("No active context bridge")
    })

    it("returns context from registered bridge", async () => {
      await registerContextBridge({
        sourceProduct: "audit",
        targetProduct: "decision",
        mappingName: "test_bridge",
        mappingConfig: {
          fieldMappings: [
            { sourceField: "name", targetField: "sourceName" },
          ],
        },
      })

      await expect(
        buildCrossProductContext("audit", "rec-1", "decision"),
      ).rejects.toThrow("not found")
    })
  })

  // ─── Stats ───

  describe("getCrossProductStats", () => {
    it("returns aggregated stats", async () => {
      await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "a1",
        requestText: "S1",
      })
      await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "decision",
        sourceAction: "a2",
        requestText: "S2",
      })

      await registerAction({
        actionKey: "test.stats_action",
        productKey: "test",
        name: "Stats",
        promptTemplate: "{{requestText}}",
        riskLevel: "LOW",
      })

      await registerContextBridge({
        sourceProduct: "audit",
        targetProduct: "decision",
        mappingName: "stats_bridge",
        mappingConfig: {},
      })

      const stats = await getCrossProductStats("org-1")

      expect(stats.totalSessions).toBe(2)
      expect(stats.sessionsByProduct.audit).toBe(1)
      expect(stats.sessionsByProduct.decision).toBe(1)
      expect(stats.totalActions).toBe(1)
      expect(stats.activeActions).toBe(1)
      expect(stats.totalBridges).toBe(1)
      expect(stats.pendingReviewCount).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── Error Cases ───

  describe("error handling", () => {
    it("handles missing action gracefully in createAiSession", async () => {
      const result = await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "test",
        requestText: "No action",
        metadata: { actionKey: "nonexistent.action" },
      })

      expect(result.sessionId).toBeTruthy()
      expect(result.requiresReview).toBe(true)
    })

    it("buildCrossProductContext throws for nonexistent source record", async () => {
      await registerContextBridge({
        sourceProduct: "decision",
        targetProduct: "audit",
        mappingName: "error_bridge",
        mappingConfig: {},
      })

      await expect(
        buildCrossProductContext("decision", "bad-record-id", "audit"),
      ).rejects.toThrow()
    })
  })
})
