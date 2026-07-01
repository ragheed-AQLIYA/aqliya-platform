/** @jest-environment node */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";

const mockNodeFindFirst = jest.fn();
const mockNodeFindUnique = jest.fn();
const mockNodeCreate = jest.fn();
const mockNodeFindMany = jest.fn();
const mockNodeUpdate = jest.fn();
const mockNodeDelete = jest.fn();
const mockNodeCount = jest.fn();
const mockNodeGroupBy = jest.fn();
const mockEdgeFindUnique = jest.fn();
const mockEdgeFindMany = jest.fn();
const mockEdgeCreate = jest.fn();
const mockEdgeDelete = jest.fn();
const mockEdgeCount = jest.fn();
const mockEventCreate = jest.fn();
const mockEventFindMany = jest.fn();
const mockEventCount = jest.fn();
const mockCollectionCreate = jest.fn();
const mockCollectionFindUnique = jest.fn();
const mockCollectionFindMany = jest.fn();
const mockCollectionUpdate = jest.fn();
const mockCollectionCount = jest.fn();
const mockQueryCreate = jest.fn();
const mockQueryCount = jest.fn();
const mockBatchCreate = jest.fn();
const mockBatchFindUnique = jest.fn();
const mockBatchUpdate = jest.fn();
const mockDocCreateMany = jest.fn();
const mockWriteAuditLog = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    intelligenceGraphNode: {
      findFirst: (...args) => mockNodeFindFirst(...args),
      findUnique: (...args) => mockNodeFindUnique(...args),
      create: (...args) => mockNodeCreate(...args),
      findMany: (...args) => mockNodeFindMany(...args),
      update: (...args) => mockNodeUpdate(...args),
      delete: (...args) => mockNodeDelete(...args),
      count: (...args) => mockNodeCount(...args),
      groupBy: (...args) => mockNodeGroupBy(...args),
    },
    intelligenceGraphEdge: {
      findUnique: (...args) => mockEdgeFindUnique(...args),
      findMany: (...args) => mockEdgeFindMany(...args),
      create: (...args) => mockEdgeCreate(...args),
      delete: (...args) => mockEdgeDelete(...args),
      count: (...args) => mockEdgeCount(...args),
    },
    institutionalMemoryEvent: {
      create: (...args) => mockEventCreate(...args),
      findMany: (...args) => mockEventFindMany(...args),
      count: (...args) => mockEventCount(...args),
    },
    institutionalMemoryCollection: {
      create: (...args) => mockCollectionCreate(...args),
      findUnique: (...args) => mockCollectionFindUnique(...args),
      findMany: (...args) => mockCollectionFindMany(...args),
      update: (...args) => mockCollectionUpdate(...args),
      count: (...args) => mockCollectionCount(...args),
    },
    intelligenceQuery: {
      create: (...args) => mockQueryCreate(...args),
      count: (...args) => mockQueryCount(...args),
    },
    ingestionBatch: {
      create: (...args) => mockBatchCreate(...args),
      findUnique: (...args) => mockBatchFindUnique(...args),
      update: (...args) => mockBatchUpdate(...args),
    },
    ingestionDocument: {
      createMany: (...args) => mockDocCreateMany(...args),
    },
  },
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: (...args) => mockWriteAuditLog(...args),
}));

import {
  createNode, getNode, updateNode, deleteNode, createEdge,
  searchMemory, createCollection, getMemoryStats, getNodeNeighbors, ingestDocument,
} from "@/lib/core/memory/institutional-memory-service";

describe("InstitutionalMemoryService", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe("createNode", () => {
    it("creates a node, returns id, and logs audit event", async () => {
      mockNodeFindFirst.mockResolvedValue(null);
      mockNodeCreate.mockResolvedValue({ id: "node-1" });
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      const result = await createNode({ organizationId: "org-1", type: "DOCUMENT", label: "Test Document", createdBy: "user-1" });
      expect(result).toEqual({ id: "node-1" });
      expect(mockNodeCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ organizationId: "org-1", name: "Test Document", type: "DOCUMENT" }) }));
      expect(mockEventCreate).toHaveBeenCalled();
      expect(mockWriteAuditLog).toHaveBeenCalled();
    });

    it("detects duplicates and returns existing id", async () => {
      mockNodeFindFirst.mockResolvedValue({ id: "existing-1" });
      const result = await createNode({ organizationId: "org-1", type: "DOCUMENT", label: "Existing Doc" });
      expect(result).toEqual({ id: "existing-1" });
      expect(mockNodeCreate).not.toHaveBeenCalled();
    });

    it("normalizes unknown types to CUSTOM", async () => {
      mockNodeFindFirst.mockResolvedValue(null);
      mockNodeCreate.mockResolvedValue({ id: "node-2" });
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      await createNode({ organizationId: "org-1", type: "weird_type", label: "Custom" });
      expect(mockNodeCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ type: "CUSTOM" }) }));
    });

    it("handles event/audit failures gracefully without breaking create", async () => {
      mockNodeFindFirst.mockResolvedValue(null);
      mockNodeCreate.mockResolvedValue({ id: "node-3" });
      mockEventCreate.mockRejectedValue(new Error("Event DB down"));
      mockWriteAuditLog.mockRejectedValue(new Error("Audit DB down"));
      const result = await createNode({ organizationId: "org-1", type: "DOCUMENT", label: "Graceful" });
      expect(result).toEqual({ id: "node-3" });
    });
  });

  describe("getNode", () => {
    it("retrieves a node by id", async () => {
      mockNodeFindUnique.mockResolvedValue({ id: "node-1", name: "Test", type: "DOCUMENT" });
      expect(await getNode("node-1")).toEqual({ id: "node-1", name: "Test", type: "DOCUMENT" });
    });

    it("throws for non-existent node", async () => {
      mockNodeFindUnique.mockResolvedValue(null);
      await expect(getNode("missing")).rejects.toThrow("Node not found");
    });
  });

  describe("updateNode", () => {
    it("updates node label and type with audit", async () => {
      mockNodeFindUnique.mockResolvedValue({ id: "node-1", organizationId: "org-1" });
      mockNodeUpdate.mockResolvedValue({ id: "node-1" });
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      await updateNode("node-1", { label: "Updated", type: "CONCEPT" });
      expect(mockNodeUpdate).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "node-1" }, data: expect.objectContaining({ name: "Updated", type: "CONCEPT" }) }));
    });

    it("throws for missing node", async () => {
      mockNodeFindUnique.mockResolvedValue(null);
      await expect(updateNode("missing", { label: "X" })).rejects.toThrow("Node not found");
    });
  });

  describe("deleteNode", () => {
    it("deletes a node and logs event", async () => {
      mockNodeFindUnique.mockResolvedValue({ id: "node-1", organizationId: "org-1", name: "ToDelete" });
      mockNodeDelete.mockResolvedValue({});
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      await deleteNode("node-1");
      expect(mockNodeDelete).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "node-1" } }));
    });

    it("throws for missing node", async () => {
      mockNodeFindUnique.mockResolvedValue(null);
      await expect(deleteNode("missing")).rejects.toThrow("Node not found");
    });
  });

  describe("createEdge", () => {
    it("creates an edge between two validated nodes", async () => {
      mockNodeFindUnique.mockResolvedValueOnce({ id: "source-1" }).mockResolvedValueOnce({ id: "target-1" });
      mockEdgeCreate.mockResolvedValue({ id: "edge-1" });
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      const result = await createEdge({ organizationId: "org-1", sourceNodeId: "source-1", targetNodeId: "target-1", relationship: "REFERENCES" });
      expect(result).toEqual({ id: "edge-1" });
    });

    it("rejects self-referencing edges", async () => {
      mockNodeFindUnique.mockResolvedValueOnce({ id: "x" }).mockResolvedValueOnce({ id: "x" });
      await expect(createEdge({ organizationId: "org-1", sourceNodeId: "x", targetNodeId: "x", relationship: "REFERENCES" })).rejects.toThrow("self-referencing");
    });
  });

  describe("getNodeNeighbors", () => {
    it("returns node with edges at depth 1", async () => {
      mockNodeFindUnique.mockResolvedValue({ id: "n1", name: "Center" });
      mockEdgeFindMany.mockResolvedValue([{ id: "e1", sourceId: "n1", targetId: "n2", relationType: "REFERENCES" }]);
      const result = await getNodeNeighbors("n1", 1);
      expect(result.node).toBeDefined();
      expect(result.edges).toHaveLength(1);
    });
  });

  describe("searchMemory", () => {
    it("searches by org and query", async () => {
      mockNodeFindMany.mockResolvedValue([{ id: "n1", name: "Match" }]);
      mockQueryCreate.mockResolvedValue({});
      mockEventCreate.mockResolvedValue({});
      expect(await searchMemory({ organizationId: "org-1", query: "Match", maxResults: 10 })).toHaveLength(1);
    });
  });

  describe("createCollection", () => {
    it("creates a collection and returns id", async () => {
      mockCollectionCreate.mockResolvedValue({ id: "col-1" });
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      expect(await createCollection({ organizationId: "org-1", name: "My Collection", description: "Test", createdBy: "user-1" })).toEqual({ id: "col-1" });
    });
  });

  describe("ingestDocument", () => {
    it("creates batch and documents returning batchId", async () => {
      mockBatchCreate.mockResolvedValue({ id: "batch-1" });
      mockDocCreateMany.mockResolvedValue({ count: 2 });
      mockBatchUpdate.mockResolvedValue({});
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      const result = await ingestDocument({ organizationId: "org-1", documents: [{ documentId: "doc-1", title: "Doc 1", createdBy: "user-1" }, { documentId: "doc-2", title: "Doc 2", createdBy: "user-1" }] });
      expect(result).toEqual({ batchId: "batch-1" });
    });
  });

  describe("getMemoryStats", () => {
    it("returns aggregated stats for an org", async () => {
      mockNodeCount.mockResolvedValue(10);
      mockEdgeCount.mockResolvedValue(5);
      mockCollectionCount.mockResolvedValue(3);
      mockQueryCount.mockResolvedValue(20);
      mockNodeGroupBy.mockResolvedValue([{ type: "DOCUMENT", _count: { id: 6 } }, { type: "CONCEPT", _count: { id: 4 } }]);
      mockEventCount.mockResolvedValue(15);
      const stats = await getMemoryStats("org-1");
      expect(stats.totalNodes).toBe(10);
      expect(stats.totalEdges).toBe(5);
      expect(stats.totalCollections).toBe(3);
      expect(stats.totalQueries).toBe(20);
      expect(stats.nodesByType).toEqual({ DOCUMENT: 6, CONCEPT: 4 });
      expect(stats.recentActivity).toBe(15);
    });
  });
});
