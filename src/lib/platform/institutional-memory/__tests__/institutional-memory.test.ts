// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    intelligenceGraphNode: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    intelligenceGraphEdge: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    intelligenceQuery: {
      create: jest.fn(),
      count: jest.fn(),
    },
    ingestionBatch: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    ingestionDocument: {
      createMany: jest.fn(),
    },
    institutionalMemoryCollection: {
      create: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    institutionalMemoryEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true, id: "audit-1" }),
}))

import { describe, expect, it, beforeEach } from "@jest/globals"
import { prisma } from "@/lib/prisma"

const mockPrisma = jest.requireMock("@/lib/prisma").prisma

const {
  createNode,
  getNode,
  updateNode,
  deleteNode,
  createEdge,
  getEdge,
  deleteEdge,
  getNodeNeighbors,
  findPath,
  getSubgraph,
  searchMemory,
  logQuery,
  createCollection,
  addNodeToCollection,
  removeNodeFromCollection,
  getCollectionNodes,
  ingestDocument,
  getIngestionStatus,
  getMemoryStats,
} = require("../institutional-memory-service")

function makeNode(overrides = {}) {
  return {
    id: "node-1",
    organizationId: "org-a",
    name: "Test Concept",
    type: "CONCEPT",
    metadata: null,
    embedding: null,
    embeddingJson: null,
    createdById: "user-1",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
    ...overrides,
  }
}

function makeEdge(overrides = {}) {
  return {
    id: "edge-1",
    organizationId: "org-a",
    sourceId: "node-1",
    targetId: "node-2",
    relationType: "REFERENCES",
    weight: 0.5,
    metadata: null,
    createdById: "user-1",
    createdAt: new Date("2026-06-01"),
    ...overrides,
  }
}

function makeCollection(overrides = {}) {
  return {
    id: "col-1",
    organizationId: "org-a",
    name: "Test Collection",
    description: "A test collection",
    icon: "📚",
    color: "#3B82F6",
    isActive: true,
    createdBy: "user-1",
    updatedBy: null,
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── Node CRUD ───

describe("createNode", () => {
  it("creates a node and returns its id", async () => {
    mockPrisma.intelligenceGraphNode.findFirst.mockResolvedValue(null)
    mockPrisma.intelligenceGraphNode.create.mockResolvedValue({ id: "node-new" })

    const result = await createNode({
      organizationId: "org-a",
      type: "CONCEPT",
      label: "New Concept",
      createdBy: "user-1",
    })

    expect(result.id).toBe("node-new")
    expect(mockPrisma.intelligenceGraphNode.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org-a",
        name: "New Concept",
        type: "CONCEPT",
        createdById: "user-1",
      }),
      select: { id: true },
    })
  })

  it("returns existing node on duplicate (same type + label + org)", async () => {
    mockPrisma.intelligenceGraphNode.findFirst.mockResolvedValue({ id: "existing-id" })

    const result = await createNode({
      organizationId: "org-a",
      type: "DOCUMENT",
      label: "Duplicate Doc",
    })

    expect(result.id).toBe("existing-id")
    expect(mockPrisma.intelligenceGraphNode.create).not.toHaveBeenCalled()
  })

  it("normalizes type to CUSTOM for unknown types", async () => {
    mockPrisma.intelligenceGraphNode.findFirst.mockResolvedValue(null)
    mockPrisma.intelligenceGraphNode.create.mockResolvedValue({ id: "node-cust" })

    await createNode({
      organizationId: "org-a",
      type: "UNKNOWN_TYPE",
      label: "Misc",
    })

    const callData = mockPrisma.intelligenceGraphNode.create.mock.calls[0][0].data
    expect(callData.type).toBe("CUSTOM")
  })

  it("stores tags in metadata", async () => {
    mockPrisma.intelligenceGraphNode.findFirst.mockResolvedValue(null)
    mockPrisma.intelligenceGraphNode.create.mockResolvedValue({ id: "node-tag" })

    await createNode({
      organizationId: "org-a",
      type: "FACT",
      label: "Tagged Fact",
      tags: ["important", "verified"],
    })

    const callData = mockPrisma.intelligenceGraphNode.create.mock.calls[0][0].data
    expect(callData.metadata).toEqual({ tags: ["important", "verified"] })
  })
})

describe("getNode", () => {
  it("returns node when found", async () => {
    const node = makeNode()
    mockPrisma.intelligenceGraphNode.findUnique.mockResolvedValue(node)

    const result = await getNode("node-1")
    expect(result).toEqual(node)
  })

  it("throws when node not found", async () => {
    mockPrisma.intelligenceGraphNode.findUnique.mockResolvedValue(null)

    await expect(getNode("nonexistent")).rejects.toThrow("Node not found")
  })
})

describe("updateNode", () => {
  it("updates node label and type", async () => {
    mockPrisma.intelligenceGraphNode.findUnique.mockResolvedValue(makeNode())
    mockPrisma.intelligenceGraphNode.update.mockResolvedValue(makeNode())

    await updateNode("node-1", { label: "Updated Label", type: "POLICY" })

    const callData = mockPrisma.intelligenceGraphNode.update.mock.calls[0][0].data
    expect(callData.name).toBe("Updated Label")
    expect(callData.type).toBe("POLICY")
  })

  it("throws when updating nonexistent node", async () => {
    mockPrisma.intelligenceGraphNode.findUnique.mockResolvedValue(null)

    await expect(updateNode("ghost", { label: "X" })).rejects.toThrow("Node not found")
  })
})

describe("deleteNode", () => {
  it("deletes node and logs event", async () => {
    mockPrisma.intelligenceGraphNode.findUnique.mockResolvedValue(makeNode())
    mockPrisma.intelligenceGraphNode.delete.mockResolvedValue(makeNode())

    await deleteNode("node-1")

    expect(mockPrisma.intelligenceGraphNode.delete).toHaveBeenCalledWith({ where: { id: "node-1" } })
  })

  it("throws when deleting nonexistent node", async () => {
    mockPrisma.intelligenceGraphNode.findUnique.mockResolvedValue(null)

    await expect(deleteNode("ghost")).rejects.toThrow("Node not found")
  })
})

// ─── Edge CRUD ───

describe("createEdge", () => {
  it("creates an edge between two existing nodes", async () => {
    mockPrisma.intelligenceGraphNode.findUnique
      .mockResolvedValueOnce({ id: "node-1" })
      .mockResolvedValueOnce({ id: "node-2" })
    mockPrisma.intelligenceGraphEdge.create.mockResolvedValue({ id: "edge-new" })

    const result = await createEdge({
      organizationId: "org-a",
      sourceNodeId: "node-1",
      targetNodeId: "node-2",
      relationship: "REFERENCES",
      createdBy: "user-1",
    })

    expect(result.id).toBe("edge-new")
    const callData = mockPrisma.intelligenceGraphEdge.create.mock.calls[0][0].data
    expect(callData.sourceId).toBe("node-1")
    expect(callData.targetId).toBe("node-2")
    expect(callData.relationType).toBe("REFERENCES")
  })

  it("throws when source node is missing", async () => {
    mockPrisma.intelligenceGraphNode.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "node-2" })

    await expect(createEdge({
      organizationId: "org-a",
      sourceNodeId: "missing",
      targetNodeId: "node-2",
      relationship: "REFERENCES",
    })).rejects.toThrow("Source node not found")
  })

  it("throws on self-referencing edge", async () => {
    mockPrisma.intelligenceGraphNode.findUnique
      .mockResolvedValueOnce({ id: "node-1" })
      .mockResolvedValueOnce({ id: "node-1" })

    await expect(createEdge({
      sourceNodeId: "node-1",
      targetNodeId: "node-1",
      relationship: "REFERENCES",
    })).rejects.toThrow("self-referencing")
  })
})

describe("getEdge", () => {
  it("returns edge when found", async () => {
    const edge = makeEdge()
    mockPrisma.intelligenceGraphEdge.findUnique.mockResolvedValue(edge)

    const result = await getEdge("edge-1")
    expect(result).toEqual(edge)
  })

  it("throws when edge not found", async () => {
    mockPrisma.intelligenceGraphEdge.findUnique.mockResolvedValue(null)
    await expect(getEdge("ghost")).rejects.toThrow("Edge not found")
  })
})

describe("deleteEdge", () => {
  it("deletes edge", async () => {
    mockPrisma.intelligenceGraphEdge.findUnique.mockResolvedValue(makeEdge())
    mockPrisma.intelligenceGraphEdge.delete.mockResolvedValue(makeEdge())

    await deleteEdge("edge-1")
    expect(mockPrisma.intelligenceGraphEdge.delete).toHaveBeenCalledWith({ where: { id: "edge-1" } })
  })

  it("throws when edge not found", async () => {
    mockPrisma.intelligenceGraphEdge.findUnique.mockResolvedValue(null)
    await expect(deleteEdge("ghost")).rejects.toThrow("Edge not found")
  })
})

// ─── Graph Operations ───

describe("getNodeNeighbors", () => {
  it("returns node and its direct neighbors", async () => {
    const node = makeNode()
    const edges = [
      makeEdge({ id: "e1", sourceId: "node-1", targetId: "node-2" }),
      makeEdge({ id: "e2", sourceId: "node-3", targetId: "node-1" }),
    ]

    mockPrisma.intelligenceGraphNode.findUnique.mockResolvedValue(node)
    mockPrisma.intelligenceGraphEdge.findMany.mockResolvedValue(edges)

    const result = await getNodeNeighbors("node-1")

    expect(result.node).toEqual(node)
    expect(result.edges).toEqual(edges)
    expect(mockPrisma.intelligenceGraphEdge.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { sourceId: { in: ["node-1"] } },
          { targetId: { in: ["node-1"] } },
        ],
      },
    })
  })

  it("throws for missing node", async () => {
    mockPrisma.intelligenceGraphNode.findUnique.mockResolvedValue(null)

    await expect(getNodeNeighbors("ghost")).rejects.toThrow("Node not found")
  })
})

describe("findPath", () => {
  it("returns empty array when source equals target", async () => {
    const result = await findPath("node-1", "node-1")
    expect(result).toEqual([])
  })

  it("finds shortest path between two nodes via BFS", async () => {
    mockPrisma.intelligenceGraphNode.findMany.mockResolvedValue([
      makeNode({ id: "node-1", name: "A" }),
      makeNode({ id: "node-2", name: "B" }),
    ])
    mockPrisma.intelligenceGraphEdge.findMany.mockResolvedValue([
      makeEdge({ id: "e1", sourceId: "node-1", targetId: "node-2" }),
    ])
    mockPrisma.intelligenceGraphEdge.findMany.mockResolvedValue([
      makeEdge({ id: "e1", sourceId: "node-1", targetId: "node-2" }),
    ])

    const path = await findPath("node-1", "node-2")

    expect(path.length).toBeGreaterThan(0)
    expect(path[0].node.id).toBe("node-1")
    expect(path[path.length - 1].node.id).toBe("node-2")
  })

  it("returns empty array when no path exists", async () => {
    mockPrisma.intelligenceGraphNode.findUnique
      .mockResolvedValueOnce(makeNode({ id: "node-a" }))
      .mockResolvedValueOnce(makeNode({ id: "node-z" }))
    // No edges → no path
    mockPrisma.intelligenceGraphEdge.findMany.mockResolvedValue([])

    const path = await findPath("node-a", "node-z")
    expect(path).toEqual([])
  })
})

describe("getSubgraph", () => {
  it("returns nodes and edges for given node ids", async () => {
    const nodes = [makeNode({ id: "n1" }), makeNode({ id: "n2" })]
    const edges = [makeEdge({ sourceId: "n1", targetId: "n2" })]

    mockPrisma.intelligenceGraphNode.findMany.mockResolvedValue(nodes)
    mockPrisma.intelligenceGraphEdge.findMany.mockResolvedValue(edges)

    const result = await getSubgraph(["n1", "n2"])

    expect(result.nodes).toEqual(nodes)
    expect(result.edges).toEqual(edges)
  })
})

// ─── Search ───

describe("searchMemory", () => {
  it("searches nodes by query text", async () => {
    const nodes = [makeNode({ name: "Found Concept" })]
    mockPrisma.intelligenceGraphNode.findMany.mockResolvedValue(nodes)
    mockPrisma.intelligenceQuery.create.mockResolvedValue({ id: "q-1" })

    const results = await searchMemory({
      organizationId: "org-a",
      query: "Concept",
      userId: "user-1",
    })

    expect(results).toEqual(nodes)
    expect(mockPrisma.intelligenceQuery.create).toHaveBeenCalled()
  })

  it("filters by node types", async () => {
    mockPrisma.intelligenceGraphNode.findMany.mockResolvedValue([])
    mockPrisma.intelligenceQuery.create.mockResolvedValue({ id: "q-2" })

    await searchMemory({
      organizationId: "org-a",
      query: "test",
      nodeTypes: ["DOCUMENT", "FACT"],
    })

    const callWhere = mockPrisma.intelligenceGraphNode.findMany.mock.calls[0][0].where
    expect(callWhere.type.in).toEqual(["DOCUMENT", "FACT"])
  })
})

// ─── Collections ───

describe("createCollection", () => {
  it("creates a collection", async () => {
    mockPrisma.institutionalMemoryCollection.create.mockResolvedValue({ id: "col-new" })

    const result = await createCollection({
      organizationId: "org-a",
      name: "My Collection",
      description: "Test description",
      icon: "📁",
      color: "#10B981",
      createdBy: "user-1",
    })

    expect(result.id).toBe("col-new")
    const callData = mockPrisma.institutionalMemoryCollection.create.mock.calls[0][0].data
    expect(callData.name).toBe("My Collection")
    expect(callData.icon).toBe("📁")
  })
})

describe("addNodeToCollection", () => {
  it("adds a node to a collection", async () => {
    mockPrisma.institutionalMemoryCollection.findUnique.mockResolvedValue(makeCollection())
    mockPrisma.intelligenceGraphNode.findUnique.mockResolvedValue(makeNode())

    await addNodeToCollection("col-1", "node-1")

    expect(mockPrisma.institutionalMemoryEvent.create).toHaveBeenCalled()
  })

  it("throws when collection not found", async () => {
    mockPrisma.institutionalMemoryCollection.findUnique.mockResolvedValue(null)

    await expect(addNodeToCollection("ghost", "node-1")).rejects.toThrow("Collection not found")
  })
})

describe("removeNodeFromCollection", () => {
  it("removes a node from a collection", async () => {
    mockPrisma.institutionalMemoryCollection.findUnique.mockResolvedValue(makeCollection())

    await removeNodeFromCollection("col-1", "node-1")

    const eventCall = mockPrisma.institutionalMemoryEvent.create.mock.calls[0][0].data
    expect(eventCall.action).toBe("NODE_REMOVED_FROM_COLLECTION")
    expect(eventCall.nodeId).toBe("node-1")
  })
})

describe("getCollectionNodes", () => {
  it("returns nodes in a collection", async () => {
    mockPrisma.institutionalMemoryCollection.findUnique.mockResolvedValue(makeCollection())
    mockPrisma.institutionalMemoryEvent.findMany.mockResolvedValue([
      { nodeId: "node-1", action: "MEMORY_LINKED", metadata: '{"collectionId":"col-1"}' },
    ])
    mockPrisma.intelligenceGraphNode.findMany.mockResolvedValue([makeNode()])

    const nodes = await getCollectionNodes("col-1")
    expect(nodes).toHaveLength(1)
  })

  it("throws when collection not found", async () => {
    mockPrisma.institutionalMemoryCollection.findUnique.mockResolvedValue(null)

    await expect(getCollectionNodes("ghost")).rejects.toThrow("Collection not found")
  })
})

// ─── Ingestion ───

describe("ingestDocument", () => {
  it("creates batch and documents", async () => {
    mockPrisma.ingestionBatch.create.mockResolvedValue({ id: "batch-1" })
    mockPrisma.ingestionDocument.createMany.mockResolvedValue({ count: 2 })
    mockPrisma.ingestionBatch.update.mockResolvedValue({ id: "batch-1", status: "completed" })

    const result = await ingestDocument({
      organizationId: "org-a",
      source: "manual_upload",
      documents: [
        { documentId: "doc-1", title: "Report 1", sourceType: "pdf" },
        { documentId: "doc-2", title: "Report 2", sourceType: "pdf" },
      ],
    })

    expect(result.batchId).toBe("batch-1")
    expect(mockPrisma.ingestionDocument.createMany).toHaveBeenCalled()
  })
})

describe("getIngestionStatus", () => {
  it("returns batch with documents", async () => {
    const batch = {
      id: "batch-1",
      organizationId: "org-a",
      status: "completed",
      totalDocuments: 2,
      documents: [{ id: "d1", documentId: "doc-1", title: "Report 1", status: "completed" }],
    }
    mockPrisma.ingestionBatch.findUnique.mockResolvedValue(batch)

    const result = await getIngestionStatus("batch-1")
    expect(result.id).toBe("batch-1")
    expect(result.documents).toHaveLength(1)
  })

  it("throws when batch not found", async () => {
    mockPrisma.ingestionBatch.findUnique.mockResolvedValue(null)
    await expect(getIngestionStatus("ghost")).rejects.toThrow("Ingestion batch not found")
  })
})

// ─── Dashboard Stats ───

describe("getMemoryStats", () => {
  it("returns aggregated memory statistics", async () => {
    mockPrisma.intelligenceGraphNode.count.mockResolvedValue(10)
    mockPrisma.intelligenceGraphEdge.count.mockResolvedValue(15)
    mockPrisma.institutionalMemoryCollection.count.mockResolvedValue(3)
    mockPrisma.intelligenceQuery.count.mockResolvedValue(25)
    mockPrisma.intelligenceGraphNode.groupBy.mockResolvedValue([
      { type: "CONCEPT", _count: { id: 4 } },
      { type: "DOCUMENT", _count: { id: 6 } },
    ])
    mockPrisma.institutionalMemoryEvent.count.mockResolvedValue(8)

    const stats = await getMemoryStats("org-a")

    expect(stats.totalNodes).toBe(10)
    expect(stats.totalEdges).toBe(15)
    expect(stats.totalCollections).toBe(3)
    expect(stats.totalQueries).toBe(25)
    expect(stats.nodesByType).toEqual({ CONCEPT: 4, DOCUMENT: 6 })
    expect(stats.recentActivity).toBe(8)
  })
})

// ─── Log Query ───

describe("logQuery", () => {
  it("creates an intelligence query record", async () => {
    mockPrisma.intelligenceQuery.create.mockResolvedValue({ id: "q-log" })

    await logQuery("test search", 5, "user-1", "org-a")

    const callData = mockPrisma.intelligenceQuery.create.mock.calls[0][0].data
    expect(callData.query).toBe("test search")
    expect(callData.resultCount).toBe(5)
  })
})

// ─── Non-blocking behavior ───

describe("writeEvent is non-blocking", () => {
  it("does not fail when writeEvent throws", async () => {
    mockPrisma.intelligenceGraphNode.findFirst.mockResolvedValue(null)
    mockPrisma.intelligenceGraphNode.create.mockResolvedValue({ id: "node-ok" })
    mockPrisma.institutionalMemoryEvent.create.mockRejectedValue(new Error("DB error"))

    const result = await createNode({
      organizationId: "org-a",
      type: "FACT",
      label: "Resilient Node",
    })

    expect(result.id).toBe("node-ok")
  })
})
