/** @jest-environment node */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";

const mockQueryCreate = jest.fn();
const mockQueryFindMany = jest.fn();
const mockNodeCreate = jest.fn();
const mockNodeFindMany = jest.fn();
const mockNodeFindFirst = jest.fn();
const mockEdgeCreate = jest.fn();
const mockEdgeFindMany = jest.fn();
const mockWriteAuditLog = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    intelligenceQuery: {
      create: (...args) => mockQueryCreate(...args),
      findMany: (...args) => mockQueryFindMany(...args),
    },
    intelligenceGraphNode: {
      create: (...args) => mockNodeCreate(...args),
      findMany: (...args) => mockNodeFindMany(...args),
      findFirst: (...args) => mockNodeFindFirst(...args),
    },
    intelligenceGraphEdge: {
      create: (...args) => mockEdgeCreate(...args),
      findMany: (...args) => mockEdgeFindMany(...args),
    },
  },
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: (...args) => mockWriteAuditLog(...args),
}));

import {
  storeQuery,
  storeInsight,
  getQueryHistory,
  getRelatedInsights,
  createEntity,
  createRelation,
  findEntitiesByType,
  getEntityRelations,
} from "@/lib/core/memory/ai-memory";

describe("ai-memory", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe("storeQuery", () => {
    it("stores a query and returns its id", async () => {
      mockQueryCreate.mockResolvedValue({ id: "q-1" });
      const result = await storeQuery("test query", [{ chunkId: "c1", documentId: "d1", score: 0.9 }], "user-1", "org-1");
      expect(result).toBe("q-1");
      expect(mockQueryCreate).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ query: "test query", organizationId: "org-1", userId: "user-1" }),
      }));
    });

    it("stores query with metadata", async () => {
      mockQueryCreate.mockResolvedValue({ id: "q-2" });
      await storeQuery("query with meta", [], "user-1", "org-1", { source: "test" });
      expect(mockQueryCreate).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ metadata: { source: "test" } }),
      }));
    });
  });

  describe("storeInsight", () => {
    it("creates insight node and logs audit", async () => {
      mockNodeCreate.mockResolvedValue({ id: "insight-1" });
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      const result = await storeInsight("Key insight from docs", ["c1", "c2"], "user-1", "org-1");
      expect(result).toBe("insight-1");
      expect(mockNodeCreate).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ type: "insight", organizationId: "org-1" }),
      }));
      expect(mockWriteAuditLog).toHaveBeenCalled();
    });
  });

  describe("getQueryHistory", () => {
    it("returns recent queries for organization", async () => {
      mockQueryFindMany.mockResolvedValue([{ id: "q1", query: "test", results: [], resultCount: 0, userId: "u1", metadata: {}, createdAt: new Date() }]);
      const results = await getQueryHistory({ organizationId: "org-1" });
      expect(results).toHaveLength(1);
      expect(results[0].query).toBe("test");
    });

    it("filters by userId when provided", async () => {
      mockQueryFindMany.mockResolvedValue([]);
      await getQueryHistory({ organizationId: "org-1", userId: "u1", limit: 5 });
      expect(mockQueryFindMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ userId: "u1" }),
        take: 5,
      }));
    });

    it("filters by days when provided", async () => {
      mockQueryFindMany.mockResolvedValue([]);
      await getQueryHistory({ organizationId: "org-1", days: 7 });
      const where = mockQueryFindMany.mock.calls[0][0].where;
      expect(where.createdAt).toBeDefined();
      expect(where.createdAt.gte).toBeInstanceOf(Date);
    });
  });

  describe("getRelatedInsights", () => {
    it("returns matching insight nodes", async () => {
      mockNodeFindMany.mockResolvedValue([
        { id: "n1", name: "Test Insight", metadata: { insight: "Deep insight text" }, createdAt: new Date() },
      ]);
      const results = await getRelatedInsights("test topic", "org-1");
      expect(results).toHaveLength(1);
      expect(results[0].insight).toBe("Deep insight text");
    });

    it("returns empty for short queries", async () => {
      const results = await getRelatedInsights("hi", "org-1");
      expect(results).toEqual([]);
      expect(mockNodeFindMany).not.toHaveBeenCalled();
    });
  });

  describe("createEntity", () => {
    it("creates a graph node entity", async () => {
      mockNodeCreate.mockResolvedValue({ id: "entity-1" });
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      const result = await createEntity("ACME Corp", "organization", { industry: "services" }, "org-1", "user-1");
      expect(result).toBe("entity-1");
      expect(mockNodeCreate).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ name: "ACME Corp", type: "organization" }),
      }));
    });
  });

  describe("createRelation", () => {
    it("creates an edge between two entities", async () => {
      mockEdgeCreate.mockResolvedValue({ id: "edge-1" });
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      const result = await createRelation("source-1", "target-1", "partners", "org-1", 0.9, "user-1");
      expect(result).toBe("edge-1");
      expect(mockEdgeCreate).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ sourceId: "source-1", targetId: "target-1", relationType: "partners", weight: 0.9 }),
      }));
    });
  });

  describe("findEntitiesByType", () => {
    it("finds entities filtered by type", async () => {
      mockNodeFindMany.mockResolvedValue([{ id: "n1", name: "Org1", type: "organization", metadata: {}, createdAt: new Date() }]);
      const results = await findEntitiesByType("organization", "org-1");
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("organization");
    });
  });

  describe("getEntityRelations", () => {
    it("returns outgoing and incoming relations", async () => {
      mockNodeFindFirst.mockResolvedValue({ id: "n1" });
      mockEdgeFindMany.mockResolvedValue([
        { id: "e1", sourceId: "n1", targetId: "n2", relationType: "references", weight: 1, source: { id: "n1", name: "Src" }, target: { id: "n2", name: "Tgt" } },
        { id: "e2", sourceId: "n0", targetId: "n1", relationType: "related", weight: 0.5, source: { id: "n0", name: "Outer" }, target: { id: "n1", name: "Inner" } },
      ]);
      const result = await getEntityRelations("n1", "org-1");
      expect(result.outgoing).toHaveLength(1);
      expect(result.incoming).toHaveLength(1);
      expect(result.outgoing[0].targetName).toBe("Tgt");
      expect(result.incoming[0].sourceName).toBe("Outer");
    });

    it("returns empty for missing node", async () => {
      mockNodeFindFirst.mockResolvedValue(null);
      const result = await getEntityRelations("missing", "org-1");
      expect(result.outgoing).toEqual([]);
      expect(result.incoming).toEqual([]);
    });
  });
});
