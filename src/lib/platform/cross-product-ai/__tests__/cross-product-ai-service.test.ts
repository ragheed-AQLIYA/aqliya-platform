import { describe, expect, it, jest, beforeEach } from "@jest/globals"

// ─── In-Memory Mock Store ───

const mockStore: Record<string, any[]> = {
  aiCrossProductSession: [],
  aiActionRegistry: [],
  aiContextBridge: [],
}

let idCounter = 1

function nextId(): string {
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

function resetStores(): void {
  for (const key of Object.keys(mockStore)) {
    mockStore[key] = []
  }
  idCounter = 1
}

// ─── Prisma Mock ───

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

// ─── Subject Under Test ───

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

describe("CrossProductAI Service (refactored)", () => {
  beforeEach(() => {
    resetStores()
    idCounter = 1
    mockAuditLog.mockClear()
    jest.clearAllMocks()
  })

  // ─────── Sessions ───────

  describe("createAiSession", () => {
    it("creates a session with requiresReview=true by default", async () => {
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
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "ai_session_created",
          targetType: "ai_cross_product_session",
        }),
      )
    })

    it("creates session without organizationId", async () => {
      const result = await createAiSession({
        userId: "user-1",
        productContext: "audit",
        sourceAction: "test",
        requestText: "No org",
      })

      expect(result.sessionId).toBeTruthy()
      expect(result.requiresReview).toBe(true)

      const session = await getSession(result.sessionId)
      expect(session.organizationId).toBeNull()
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

    it("uses pre-set responseText from metadata", async () => {
      await registerAction({
        actionKey: "audit.predefined_response",
        productKey: "audit",
        name: "Predefined",
        promptTemplate: "Template {{requestText}}",
        riskLevel: "LOW",
        requiresReview: false,
      })

      const result = await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "predefined",
        requestText: "Input text",
        metadata: {
          actionKey: "audit.predefined_response",
          responseText: "Custom override response",
        },
      })

      expect(result.responseText).toBe("Custom override response")
    })

    it("handles metadata with relatedProducts", async () => {
      const result = await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "cross_ref",
        requestText: "Cross-ref analysis",
        metadata: { relatedProducts: ["decision", "risk"] },
      })

      const session = await getSession(result.sessionId)
      expect(session.relatedProducts).toBe(
        JSON.stringify(["decision", "risk"]),
      )
    })
  })

  describe("getSession", () => {
    it("returns null for nonexistent session", async () => {
      const session = await getSession("nonexistent")
      expect(session).toBeNull()
    })

    it("returns a session with parsed metadata", async () => {
      const result = await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "test",
        requestText: "Test session",
        metadata: { extra: "data", nested: { key: "val" } },
      })

      const session = await getSession(result.sessionId)
      expect(session).not.toBeNull()
      expect(session.requestText).toBe("Test session")
      expect(session.status).toBe("PENDING_REVIEW")
      expect(session.metadata).toEqual({ extra: "data", nested: { key: "val" } })
    })
  })

  describe("listSessions", () => {
    it("filters sessions by productContext and status", async () => {
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

      const auditOnly = await listSessions({ productContext: "audit" })
      expect(auditOnly).toHaveLength(1)
      expect(auditOnly[0].productContext).toBe("audit")

      const user2Only = await listSessions({ userId: "user-2" })
      expect(user2Only).toHaveLength(1)
      expect(user2Only[0].userId).toBe("user-2")
    })

    it("supports pagination with limit and offset", async () => {
      for (let i = 0; i < 10; i++) {
        await createAiSession({
          organizationId: "org-1",
          userId: "user-1",
          productContext: "audit",
          sourceAction: `action-${i}`,
          requestText: `Session ${i}`,
        })
      }

      // Default limit=50 gives all 10
      const all = await listSessions({})
      expect(all).toHaveLength(10)

      // limit=3
      const limited = await listSessions({ limit: 3 })
      expect(limited).toHaveLength(3)

      // offset=5, limit=3
      const paginated = await listSessions({ limit: 3, offset: 5 })
      expect(paginated).toHaveLength(3)
      // Sessions are ordered by createdAt desc, so offset 5 should skip the first 5
      expect(paginated[0].requestText).toBe("Session 5")
    })
  })

  describe("reviewSession", () => {
    it("updates session to REVIEWED status", async () => {
      const result = await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "test",
        requestText: "Review this",
      })

      await reviewSession(result.sessionId, "reviewer-1", "Approved after checking")

      const session = await getSession(result.sessionId)
      expect(session.status).toBe("REVIEWED")
      expect(session.reviewNotes).toBe("Approved after checking")
      expect(session.reviewedAt).toBeTruthy()
    })

    it("reviews session without notes", async () => {
      const result = await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "test",
        requestText: "Quick review",
      })

      await reviewSession(result.sessionId, "reviewer-1")

      const session = await getSession(result.sessionId)
      expect(session.status).toBe("REVIEWED")
      expect(session.reviewNotes).toBeNull()
    })

    it("throws for nonexistent session", async () => {
      await expect(reviewSession("nonexistent", "user-1")).rejects.toThrow(
        "not found",
      )
    })
  })

  // ─────── Actions ───────

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
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "ai_action_registered",
          targetType: "ai_action_registry",
        }),
      )
    })

    it("normalizes risk level to uppercase", async () => {
      await registerAction({
        actionKey: "test.critical_action",
        productKey: "test",
        name: "Critical",
        promptTemplate: "Critical {{requestText}}",
        riskLevel: "critical",
      })

      const action = await getAction("test.critical_action")
      expect(action.riskLevel).toBe("CRITICAL")
    })

    it("defaults invalid risk level to LOW", async () => {
      await registerAction({
        actionKey: "test.invalid_risk",
        productKey: "test",
        name: "Invalid Risk",
        promptTemplate: "{{requestText}}",
        riskLevel: "EXTREME",
      })

      const action = await getAction("test.invalid_risk")
      expect(action.riskLevel).toBe("LOW")
      // LOW risk does NOT require review by default
      expect(action.requiresReview).toBe(false)
    })

    it("assigns requiresReview=true for MEDIUM risk by default", async () => {
      await registerAction({
        actionKey: "test.medium_risk_default",
        productKey: "test",
        name: "Medium Risk",
        promptTemplate: "Medium {{requestText}}",
        riskLevel: "MEDIUM",
      })

      const action = await getAction("test.medium_risk_default")
      expect(action.riskLevel).toBe("MEDIUM")
      expect(action.requiresReview).toBe(true)
    })

    it("registers action with all optional fields", async () => {
      await registerAction({
        actionKey: "test.full_action",
        productKey: "test",
        name: "Full Action",
        description: "A full action with all fields",
        promptTemplate: "Full {{requestText}}",
        inputSchema: '{"type":"object"}',
        outputSchema: '{"type":"string"}',
        requiredContext: "organizationId",
        riskLevel: "HIGH",
        requiresReview: true,
        requiresApproval: true,
        createdBy: "user-admin",
      })

      const action = await getAction("test.full_action")
      expect(action.name).toBe("Full Action")
      expect(action.description).toBe("A full action with all fields")
      expect(action.inputSchema).toBe('{"type":"object"}')
      expect(action.outputSchema).toBe('{"type":"string"}')
      expect(action.requiredContext).toBe("organizationId")
      expect(action.riskLevel).toBe("HIGH")
      expect(action.requiresReview).toBe(true)
      expect(action.requiresApproval).toBe(true)
      expect(action.isActive).toBe(true)
      expect(action.createdBy).toBe("user-admin")
    })
  })

  describe("getAction", () => {
    it("returns null for nonexistent action key", async () => {
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
      expect(action.productKey).toBe("decision")
    })
  })

  describe("listActions", () => {
    it("lists all actions filtered by productKey", async () => {
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
      await registerAction({
        actionKey: "audit.a2",
        productKey: "audit",
        name: "A2",
        promptTemplate: "A2: {{requestText}}",
        riskLevel: "HIGH",
      })

      const all = await listActions()
      expect(all).toHaveLength(3)

      const auditActions = await listActions("audit")
      expect(auditActions).toHaveLength(2)
      expect(auditActions[0].productKey).toBe("audit")

      const decisionActions = await listActions("decision")
      expect(decisionActions).toHaveLength(1)
    })
  })

  describe("updateAction", () => {
    it("updates action name and description", async () => {
      await registerAction({
        actionKey: "test.update_me",
        productKey: "test",
        name: "Original Name",
        promptTemplate: "Original {{requestText}}",
        riskLevel: "LOW",
      })

      const action = await getAction("test.update_me")
      await updateAction(action.id, {
        name: "Updated Name",
        description: "Updated description",
      })

      const updated = await getAction("test.update_me")
      expect(updated.name).toBe("Updated Name")
      expect(updated.description).toBe("Updated description")
    })

    it("updates riskLevel and recalculates requiresReview", async () => {
      await registerAction({
        actionKey: "test.risk_update",
        productKey: "test",
        name: "Risk Update",
        promptTemplate: "{{requestText}}",
        riskLevel: "LOW",
      })

      const action = await getAction("test.risk_update")
      expect(action.riskLevel).toBe("LOW")
      expect(action.requiresReview).toBe(false)

      // Update to HIGH risk
      await updateAction(action.id, { riskLevel: "HIGH" })

      const updated = await getAction("test.risk_update")
      expect(updated.riskLevel).toBe("HIGH")
      expect(updated.requiresReview).toBe(true)
    })

    it("throws for nonexistent action", async () => {
      await expect(
        updateAction("nonexistent", { name: "New Name" }),
      ).rejects.toThrow("not found")
    })
  })

  describe("deactivateAction", () => {
    it("sets isActive to false", async () => {
      await registerAction({
        actionKey: "test.deactivate_me",
        productKey: "test",
        name: "Deactivate Me",
        promptTemplate: "Deactivate {{requestText}}",
        riskLevel: "LOW",
      })

      const action = await getAction("test.deactivate_me")
      expect(action.isActive).toBe(true)

      await deactivateAction(action.id)

      const deactivated = await getAction("test.deactivate_me")
      expect(deactivated.isActive).toBe(false)
    })

    it("throws for nonexistent action id", async () => {
      await expect(deactivateAction("nonexistent")).rejects.toThrow("not found")
    })
  })

  // ─────── Stats ───────

  describe("getCrossProductStats", () => {
    it("returns zero counts for empty data", async () => {
      const stats = await getCrossProductStats()

      expect(stats.totalSessions).toBe(0)
      expect(stats.sessionsByProduct).toEqual({})
      expect(stats.sessionsByStatus).toEqual({})
      expect(stats.pendingReviewCount).toBe(0)
      expect(stats.totalActions).toBe(0)
      expect(stats.activeActions).toBe(0)
      expect(stats.totalBridges).toBe(0)
    })

    it("returns aggregated stats with sessions, actions and bridges", async () => {
      await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "a1",
        requestText: "S1",
      })
      await createAiSession({
        organizationId: "org-1",
        userId: "user-2",
        productContext: "decision",
        sourceAction: "a2",
        requestText: "S2",
      })
      await createAiSession({
        organizationId: "org-2",
        userId: "user-3",
        productContext: "audit",
        sourceAction: "a3",
        requestText: "S3",
      })

      await registerAction({
        actionKey: "test.stats_action",
        productKey: "test",
        name: "Stats Action",
        promptTemplate: "{{requestText}}",
        riskLevel: "LOW",
      })

      await registerContextBridge({
        sourceProduct: "audit",
        targetProduct: "decision",
        mappingName: "stats_bridge",
        mappingConfig: {},
      })

      const stats = await getCrossProductStats()

      expect(stats.totalSessions).toBe(3)
      expect(stats.sessionsByProduct.audit).toBe(2)
      expect(stats.sessionsByProduct.decision).toBe(1)
      expect(stats.sessionsByStatus.PENDING_REVIEW).toBe(3)
      expect(stats.totalActions).toBe(1)
      expect(stats.activeActions).toBe(1)
      expect(stats.totalBridges).toBe(1)
    })

    it("filters stats by organizationId", async () => {
      await createAiSession({
        organizationId: "org-1",
        userId: "user-1",
        productContext: "audit",
        sourceAction: "a1",
        requestText: "Org1 Session",
      })
      await createAiSession({
        organizationId: "org-2",
        userId: "user-2",
        productContext: "decision",
        sourceAction: "a2",
        requestText: "Org2 Session",
      })

      const org1Stats = await getCrossProductStats("org-1")
      expect(org1Stats.totalSessions).toBe(1)
      expect(org1Stats.sessionsByProduct.audit).toBe(1)

      // org-2 sessions not counted
      expect(org1Stats.sessionsByProduct.decision).toBeUndefined()
    })
  })

  // ─────── Context Bridges ───────

  describe("registerContextBridge", () => {
    it("registers a bridge with description and returns id", async () => {
      const result = await registerContextBridge({
        organizationId: "org-1",
        sourceProduct: "audit",
        targetProduct: "decision",
        mappingName: "audit_finding_to_decision_risk",
        mappingConfig: {
          fieldMappings: [
            { sourceField: "title", targetField: "decisionTitle" },
            { sourceField: "riskScore", targetField: "riskLevel", default: "MEDIUM" },
          ],
        },
        description: "Maps audit findings to decision risk assessment",
        createdBy: "user-1",
      })

      expect(result.id).toBeTruthy()
      expect(mockAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "ai_context_bridge_registered",
        }),
      )
    })
  })

  describe("getContextBridges", () => {
    it("returns bridges with parsed mappingConfig", async () => {
      await registerContextBridge({
        sourceProduct: "audit",
        targetProduct: "decision",
        mappingName: "bridge1",
        mappingConfig: { fieldMappings: [{ sourceField: "id", targetField: "refId" }] },
      })
      await registerContextBridge({
        sourceProduct: "decision",
        targetProduct: "sales",
        mappingName: "bridge2",
        mappingConfig: { fieldMappings: [{ sourceField: "name", targetField: "dealName" }] },
      })

      const all = await getContextBridges()
      expect(all).toHaveLength(2)
      expect(typeof all[0].mappingConfig).toBe("object")
      expect(Array.isArray(all[0].mappingConfig.fieldMappings)).toBe(true)

      const auditBridges = await getContextBridges("audit")
      expect(auditBridges).toHaveLength(1)
      expect(auditBridges[0].mappingName).toBe("bridge1")
    })
  })

  describe("buildCrossProductContext", () => {
    it("throws when no active bridge exists", async () => {
      await expect(
        buildCrossProductContext("audit", "rec-1", "decision"),
      ).rejects.toThrow("No active context bridge")
    })

    it("throws when source record not found", async () => {
      await registerContextBridge({
        sourceProduct: "audit",
        targetProduct: "decision",
        mappingName: "test_bridge",
        mappingConfig: {
          fieldMappings: [{ sourceField: "name", targetField: "sourceName" }],
        },
      })

      await expect(
        buildCrossProductContext("audit", "nonexistent-record", "decision"),
      ).rejects.toThrow("not found")
    })
  })
})
