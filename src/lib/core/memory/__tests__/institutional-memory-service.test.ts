/** @jest-environment node */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ─── Mocks ──────────────────────────────────────────────────────────────────

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

// ─── Imports ────────────────────────────────────────────────────────────────

import {
  normalizeType,
  normalizeRelationship,
  normalizeWeight,
  buildMetadata,
} from "@/lib/core/memory/institutional-memory-service/common";

import {
  createNode,
  getNode,
  updateNode,
  deleteNode,
} from "@/lib/core/memory/institutional-memory-service/nodes";

import {
  createEdge,
  getEdge,
  deleteEdge,
} from "@/lib/core/memory/institutional-memory-service/edges";

import {
  searchMemory,
} from "@/lib/core/memory/institutional-memory-service/search";

import {
  createCollection,
  addNodeToCollection,
  removeNodeFromCollection,
  getCollectionNodes,
} from "@/lib/core/memory/institutional-memory-service/collections";

import {
  getMemoryStats,
} from "@/lib/core/memory/institutional-memory-service/dashboard";

import {
  getNodeNeighbors,
  findPath,
  getSubgraph,
} from "@/lib/core/memory/institutional-memory-service/graph";

import {
  ingestDocument,
  getIngestionStatus,
} from "@/lib/core/memory/institutional-memory-service/ingestion";

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("InstitutionalMemoryService (modular)", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  // ─── Helpers ────────────────────────────────────────────────────────────

  describe("normalizeType", () => {
    it("passes through valid known types unchanged", () => {
      expect(normalizeType("DOCUMENT")).toBe("DOCUMENT");
      expect(normalizeType("CONCEPT")).toBe("CONCEPT");
      expect(normalizeType("DECISION")).toBe("DECISION");
      expect(normalizeType("FACT")).toBe("FACT");
      expect(normalizeType("ENTITY")).toBe("ENTITY");
    });

    it("normalizes to uppercase", () => {
      expect(normalizeType("document")).toBe("DOCUMENT");
      expect(normalizeType("Concept")).toBe("CONCEPT");
      expect(normalizeType("decision")).toBe("DECISION");
    });

    it("returns CUSTOM for unknown types", () => {
      expect(normalizeType("UNKNOWN_TYPE")).toBe("CUSTOM");
      expect(normalizeType("")).toBe("CUSTOM");
      expect(normalizeType("weird_input")).toBe("CUSTOM");
    });
  });

  describe("normalizeRelationship", () => {
    it("passes through valid known relationships", () => {
      expect(normalizeRelationship("REFERENCES")).toBe("REFERENCES");
      expect(normalizeRelationship("CAUSES")).toBe("CAUSES");
      expect(normalizeRelationship("DEPENDS_ON")).toBe("DEPENDS_ON");
      expect(normalizeRelationship("PART_OF")).toBe("PART_OF");
    });

    it("normalizes to uppercase", () => {
      expect(normalizeRelationship("references")).toBe("REFERENCES");
      expect(normalizeRelationship("Depends_On")).toBe("DEPENDS_ON");
    });

    it("returns CUSTOM for unknown relationships", () => {
      expect(normalizeRelationship("random")).toBe("CUSTOM");
      expect(normalizeRelationship("")).toBe("CUSTOM");
    });
  });

  describe("normalizeWeight", () => {
    it("returns 0.5 for undefined or null", () => {
      expect(normalizeWeight(undefined)).toBe(0.5);
      expect(normalizeWeight(null)).toBe(0.5);
    });

    it("clamps values below 0 to 0", () => {
      expect(normalizeWeight(-0.5)).toBe(0);
      expect(normalizeWeight(-100)).toBe(0);
    });

    it("clamps values above 1 to 1", () => {
      expect(normalizeWeight(1.5)).toBe(1);
      expect(normalizeWeight(100)).toBe(1);
    });

    it("preserves valid weights in [0,1]", () => {
      expect(normalizeWeight(0)).toBe(0);
      expect(normalizeWeight(0.5)).toBe(0.5);
      expect(normalizeWeight(1)).toBe(1);
    });
  });

  describe("buildMetadata", () => {
    it("returns undefined for empty input without extras", () => {
      expect(buildMetadata(undefined)).toBeUndefined();
      expect(buildMetadata({})).toBeUndefined();
    });

    it("merges input with extras", () => {
      const result = buildMetadata({ key: "value" }, { extra: true });
      expect(result).toEqual({ key: "value", extra: true });
    });

    it("returns input when no extras provided", () => {
      const result = buildMetadata({ alpha: 1 });
      expect(result).toEqual({ alpha: 1 });
    });

    it("creates metadata from extras alone when input is empty", () => {
      const result = buildMetadata(undefined, { tags: ["a", "b"] });
      expect(result).toEqual({ tags: ["a", "b"] });
    });

    it("extras override input keys", () => {
      const result = buildMetadata({ a: 1, b: 2 }, { b: 99, c: 3 });
      expect(result).toEqual({ a: 1, b: 99, c: 3 });
    });
  });

  // ─── Node CRUD ──────────────────────────────────────────────────────────

  describe("createNode", () => {
    it("creates a node with valid input and returns id", async () => {
      mockNodeFindFirst.mockResolvedValue(null);
      mockNodeCreate.mockResolvedValue({ id: "n1" });
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });

      const result = await createNode({
        organizationId: "org-1",
        type: "DOCUMENT",
        label: "Annual Report",
        createdBy: "user-1",
      });

      expect(result).toEqual({ id: "n1" });
      expect(mockNodeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: "org-1",
            name: "Annual Report",
            type: "DOCUMENT",
            createdById: "user-1",
          }),
        }),
      );
    });

    it("creates node with tags in metadata", async () => {
      mockNodeFindFirst.mockResolvedValue(null);
      mockNodeCreate.mockResolvedValue({ id: "n2" });
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });

      await createNode({ type: "CONCEPT", label: "Risk", tags: ["finance", "compliance"], createdBy: "user-1" });

      const callData = mockNodeCreate.mock.calls[0][0].data;
      expect(callData.type).toBe("CONCEPT");
      expect(callData.metadata).toEqual({ tags: ["finance", "compliance"] });
    });

    it("deduplicates existing node by org+type+name", async () => {
      mockNodeFindFirst.mockResolvedValue({ id: "existing-1" });

      const result = await createNode({
        organizationId: "org-1",
        type: "DOCUMENT",
        label: "Duplicate",
      });

      expect(result).toEqual({ id: "existing-1" });
      expect(mockNodeCreate).not.toHaveBeenCalled();
    });
  });

  describe("getNode", () => {
    it("returns the node when found", async () => {
      mockNodeFindUnique.mockResolvedValue({ id: "n1", name: "Test", type: "DOCUMENT" });
      const node = await getNode("n1");
      expect(node).toEqual({ id: "n1", name: "Test", type: "DOCUMENT" });
    });

    it("throws descriptive error for missing node", async () => {
      mockNodeFindUnique.mockResolvedValue(null);
      await expect(getNode("missing")).rejects.toThrow("Node not found: missing");
    });
  });

  describe("updateNode", () => {
    it("updates label and type", async () => {
      mockNodeFindUnique.mockResolvedValue({ id: "n1", organizationId: "org-1" });
      mockNodeUpdate.mockResolvedValue({});
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });

      await updateNode("n1", { label: "Updated", type: "CONCEPT" });
      expect(mockNodeUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "n1" },
          data: expect.objectContaining({ name: "Updated", type: "CONCEPT" }),
        }),
      );
    });

    it("throws for missing node", async () => {
      mockNodeFindUnique.mockResolvedValue(null);
      await expect(updateNode("missing", { label: "X" })).rejects.toThrow("Node not found: missing");
    });
  });

  describe("deleteNode", () => {
    it("deletes node and logs event", async () => {
      mockNodeFindUnique.mockResolvedValue({ id: "n1", organizationId: "org-1", name: "ToDelete" });
      mockNodeDelete.mockResolvedValue({});
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });

      await deleteNode("n1");
      expect(mockNodeDelete).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "n1" } }));
    });

    it("throws for missing node", async () => {
      mockNodeFindUnique.mockResolvedValue(null);
      await expect(deleteNode("missing")).rejects.toThrow("Node not found: missing");
    });
  });

  // ─── Edge CRUD ──────────────────────────────────────────────────────────

  describe("createEdge", () => {
    it("creates edge between validated nodes", async () => {
      mockNodeFindUnique
        .mockResolvedValueOnce({ id: "src" })
        .mockResolvedValueOnce({ id: "tgt" });
      mockEdgeCreate.mockResolvedValue({ id: "e1" });
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });

      const result = await createEdge({
        organizationId: "org-1",
        sourceNodeId: "src",
        targetNodeId: "tgt",
        relationship: "REFERENCES",
        weight: 0.8,
      });

      expect(result).toEqual({ id: "e1" });
      expect(mockEdgeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sourceId: "src",
            targetId: "tgt",
            relationType: "REFERENCES",
            weight: 0.8,
          }),
        }),
      );
    });

    it("rejects self-referencing edges", async () => {
      mockNodeFindUnique
        .mockResolvedValueOnce({ id: "x" })
        .mockResolvedValueOnce({ id: "x" });

      await expect(
        createEdge({
          sourceNodeId: "x",
          targetNodeId: "x",
          relationship: "REFERENCES",
        }),
      ).rejects.toThrow("self-referencing");
    });

    it("throws for missing source node", async () => {
      mockNodeFindUnique.mockResolvedValueOnce(null);
      await expect(
        createEdge({
          sourceNodeId: "missing",
          targetNodeId: "tgt",
          relationship: "REFERENCES",
        }),
      ).rejects.toThrow("Source node not found");
    });
  });

  describe("getEdge", () => {
    it("returns edge when found", async () => {
      mockEdgeFindUnique.mockResolvedValue({ id: "e1", sourceId: "s1", targetId: "t1", relationType: "REFERENCES" });
      const edge = await getEdge("e1");
      expect(edge).toEqual({ id: "e1", sourceId: "s1", targetId: "t1", relationType: "REFERENCES" });
    });

    it("throws for missing edge", async () => {
      mockEdgeFindUnique.mockResolvedValue(null);
      await expect(getEdge("missing")).rejects.toThrow("Edge not found: missing");
    });
  });

  describe("deleteEdge", () => {
    it("deletes edge and logs", async () => {
      mockEdgeFindUnique.mockResolvedValue({ id: "e1", organizationId: "org-1", sourceId: "s1", targetId: "t1", relationType: "REFERENCES" });
      mockEdgeDelete.mockResolvedValue({});
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });

      await deleteEdge("e1");
      expect(mockEdgeDelete).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "e1" } }));
    });

    it("throws for missing edge", async () => {
      mockEdgeFindUnique.mockResolvedValue(null);
      await expect(deleteEdge("missing")).rejects.toThrow("Edge not found: missing");
    });
  });

  // ─── Search ─────────────────────────────────────────────────────────────

  describe("searchMemory", () => {
    it("returns results for a basic query", async () => {
      mockNodeFindMany.mockResolvedValue([{ id: "n1", name: "Result", type: "DOCUMENT" }]);
      mockQueryCreate.mockResolvedValue({});
      mockEventCreate.mockResolvedValue({});

      const results = await searchMemory({
        organizationId: "org-1",
        query: "Result",
        maxResults: 10,
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Result");
    });

    it("filters by node types", async () => {
      mockNodeFindMany.mockResolvedValue([]);
      mockQueryCreate.mockResolvedValue({});
      mockEventCreate.mockResolvedValue({});

      await searchMemory({
        organizationId: "org-1",
        query: "test",
        nodeTypes: ["DOCUMENT", "CONCEPT"],
      });

      const where = mockNodeFindMany.mock.calls[0][0].where;
      expect(where.type).toEqual({ in: ["DOCUMENT", "CONCEPT"] });
    });

    it("uses default maxResults of 20 when not specified", async () => {
      mockNodeFindMany.mockResolvedValue([]);
      mockQueryCreate.mockResolvedValue({});
      mockEventCreate.mockResolvedValue({});

      await searchMemory({ organizationId: "org-1", query: "test" });

      expect(mockNodeFindMany.mock.calls[0][0].take).toBe(20);
    });

    it("returns empty array when no matches found", async () => {
      mockNodeFindMany.mockResolvedValue([]);
      mockQueryCreate.mockResolvedValue({});
      mockEventCreate.mockResolvedValue({});

      const results = await searchMemory({ organizationId: "org-1", query: "nonexistent" });
      expect(results).toEqual([]);
    });
  });

  // ─── Collections ────────────────────────────────────────────────────────

  describe("createCollection", () => {
    it("creates collection with all optional fields", async () => {
      mockCollectionCreate.mockResolvedValue({ id: "col-1" });
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });

      const result = await createCollection({
        organizationId: "org-1",
        name: "Key Documents",
        description: "Important compliance docs",
        icon: "folder",
        color: "blue",
        createdBy: "user-1",
      });

      expect(result).toEqual({ id: "col-1" });
      expect(mockCollectionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "Key Documents",
            description: "Important compliance docs",
            icon: "folder",
            color: "blue",
            isActive: true,
          }),
        }),
      );
    });
  });

  describe("addNodeToCollection", () => {
    it("adds node to existing collection", async () => {
      mockCollectionFindUnique.mockResolvedValue({ id: "col-1", organizationId: "org-1" });
      mockNodeFindUnique.mockResolvedValue({ id: "n1" });
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });

      await addNodeToCollection("col-1", "n1");
      expect(mockEventCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: "MEMORY_LINKED" }),
        }),
      );
    });

    it("throws for missing collection", async () => {
      mockCollectionFindUnique.mockResolvedValue(null);
      await expect(addNodeToCollection("missing", "n1")).rejects.toThrow("Collection not found: missing");
    });
  });

  describe("removeNodeFromCollection", () => {
    it("throws for missing collection", async () => {
      mockCollectionFindUnique.mockResolvedValue(null);
      await expect(removeNodeFromCollection("missing", "n1")).rejects.toThrow("Collection not found: missing");
    });
  });

  // ─── Dashboard ──────────────────────────────────────────────────────────

  describe("getMemoryStats", () => {
    it("returns aggregated stats for an organization", async () => {
      mockNodeCount.mockResolvedValue(10);
      mockEdgeCount.mockResolvedValue(5);
      mockCollectionCount.mockResolvedValue(3);
      mockQueryCount.mockResolvedValue(20);
      mockNodeGroupBy.mockResolvedValue([
        { type: "DOCUMENT", _count: { id: 6 } },
        { type: "CONCEPT", _count: { id: 4 } },
      ]);
      mockEventCount.mockResolvedValue(15);

      const stats = await getMemoryStats("org-1");

      expect(stats.totalNodes).toBe(10);
      expect(stats.totalEdges).toBe(5);
      expect(stats.totalCollections).toBe(3);
      expect(stats.totalQueries).toBe(20);
      expect(stats.nodesByType).toEqual({ DOCUMENT: 6, CONCEPT: 4 });
      expect(stats.recentActivity).toBe(15);
    });

    it("returns zeros when no data exists", async () => {
      mockNodeCount.mockResolvedValue(0);
      mockEdgeCount.mockResolvedValue(0);
      mockCollectionCount.mockResolvedValue(0);
      mockQueryCount.mockResolvedValue(0);
      mockNodeGroupBy.mockResolvedValue([]);
      mockEventCount.mockResolvedValue(0);

      const stats = await getMemoryStats("empty-org");

      expect(stats.totalNodes).toBe(0);
      expect(stats.totalEdges).toBe(0);
      expect(stats.totalCollections).toBe(0);
      expect(stats.totalQueries).toBe(0);
      expect(stats.nodesByType).toEqual({});
      expect(stats.recentActivity).toBe(0);
    });
  });

  // ─── Graph Operations ───────────────────────────────────────────────────

  describe("getNodeNeighbors", () => {
    it("returns node with empty edges at depth 0", async () => {
      mockNodeFindUnique.mockResolvedValue({ id: "n1", name: "Center" });

      const result = await getNodeNeighbors("n1", 0);
      expect(result.node).toBeDefined();
      expect(result.edges).toEqual([]);
    });

    it("throws for missing node", async () => {
      mockNodeFindUnique.mockResolvedValue(null);
      await expect(getNodeNeighbors("missing")).rejects.toThrow("Node not found: missing");
    });
  });

  describe("findPath", () => {
    it("returns empty for same source and target", async () => {
      const path = await findPath("n1", "n1");
      expect(path).toEqual([]);
    });
  });

  describe("getSubgraph", () => {
    it("returns nodes and edges for given ids", async () => {
      mockNodeFindMany.mockResolvedValue([{ id: "n1", name: "A" }, { id: "n2", name: "B" }]);
      mockEdgeFindMany.mockResolvedValue([{ id: "e1", sourceId: "n1", targetId: "n2" }]);

      const result = await getSubgraph(["n1", "n2"]);
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
    });
  });

  // ─── Ingestion ──────────────────────────────────────────────────────────

  describe("ingestDocument", () => {
    it("ingests documents and returns batchId", async () => {
      mockBatchCreate.mockResolvedValue({ id: "batch-1" });
      mockDocCreateMany.mockResolvedValue({ count: 1 });
      mockBatchUpdate.mockResolvedValue({});
      mockEventCreate.mockResolvedValue({});
      mockWriteAuditLog.mockResolvedValue({ ok: true });

      const result = await ingestDocument({
        organizationId: "org-1",
        source: "email_import",
        documents: [{
          documentId: "doc-1",
          title: "Q4 Report",
          sourceType: "pdf",
          metadata: { pages: 12 },
          createdBy: "user-1",
        }],
      });

      expect(result).toEqual({ batchId: "batch-1" });
      expect(mockBatchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "completed" }),
        }),
      );
    });
  });

  describe("getIngestionStatus", () => {
    it("returns batch with documents", async () => {
      mockBatchFindUnique.mockResolvedValue({
        id: "batch-1",
        status: "completed",
        documents: [{ id: "d1", documentId: "doc-1", status: "completed" }],
      });

      const result = await getIngestionStatus("batch-1");
      expect(result.id).toBe("batch-1");
      expect(result.documents).toHaveLength(1);
    });

    it("throws for missing batch", async () => {
      mockBatchFindUnique.mockResolvedValue(null);
      await expect(getIngestionStatus("missing")).rejects.toThrow("Ingestion batch not found: missing");
    });
  });
});
