import "server-only"
import { prisma } from "@/lib/prisma"

// ─── Graph Operations ───

export async function getNodeNeighbors(
  nodeId: string,
  depth: number = 1,
): Promise<{ node: unknown; edges: unknown[] }> {
  const node = await prisma.intelligenceGraphNode.findUnique({
    where: { id: nodeId },
  })
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`)
  }

  if (depth < 1) {
    return { node, edges: [] }
  }

  const visited = new Set<string>()
  const edges: unknown[] = []
  let currentLevel = [nodeId]
  visited.add(nodeId)

  for (let d = 0; d < depth; d++) {
    if (currentLevel.length === 0) break

    const foundEdges = await prisma.intelligenceGraphEdge.findMany({
      where: {
        OR: [
          { sourceId: { in: currentLevel } },
          { targetId: { in: currentLevel } },
        ],
      },
    })

    const nextLevel: string[] = []
    for (const e of foundEdges) {
      edges.push(e)
      if (!visited.has(e.sourceId)) {
        visited.add(e.sourceId)
        nextLevel.push(e.sourceId)
      }
      if (!visited.has(e.targetId)) {
        visited.add(e.targetId)
        nextLevel.push(e.targetId)
      }
    }

    currentLevel = nextLevel
  }

  return { node, edges }
}

export async function findPath(
  sourceId: string,
  targetId: string,
): Promise<unknown[]> {
  if (sourceId === targetId) {
    return []
  }

  const visited = new Set<string>()
  const parent = new Map<string, { node: string; edge: string }>()
  let queue: string[] = [sourceId]
  visited.add(sourceId)

  while (queue.length > 0) {
    const batch = [...queue]
    queue = []

    const outgoingEdges = await prisma.intelligenceGraphEdge.findMany({
      where: { sourceId: { in: batch } },
    })

    for (const e of outgoingEdges) {
      if (!visited.has(e.targetId)) {
        visited.add(e.targetId)
        parent.set(e.targetId, { node: e.sourceId, edge: e.id })
        queue.push(e.targetId)

        if (e.targetId === targetId) {
          const path: { nodeId: string; edgeId?: string }[] = []
          let step: string | undefined = targetId
          while (step && step !== sourceId) {
            const stepData: { node: string; edge: string } = parent.get(step)!
            path.unshift({ nodeId: step, edgeId: stepData.edge })
            step = stepData.node
          }
          path.unshift({ nodeId: sourceId })

          const nodeIds = path.map((x: { nodeId: string }) => x.nodeId)
          const edgeIds = path.filter((x: { edgeId?: string }): x is { nodeId: string; edgeId: string } => !!x.edgeId).map((x) => x.edgeId)
          const [nodes, pathEdges] = await Promise.all([
            prisma.intelligenceGraphNode.findMany({
              where: { id: { in: nodeIds } },
            }),
            prisma.intelligenceGraphEdge.findMany({
              where: { id: { in: edgeIds } },
            }),
          ])
          const nodeMap = new Map(nodes.map(n => [n.id, n]))
          const edgeMap = new Map(pathEdges.map(e => [e.id, e]))

          return path.map(p => ({
            node: nodeMap.get(p.nodeId) ?? null,
            edge: p.edgeId ? (edgeMap.get(p.edgeId) ?? null) : null,
          }))
        }
      }
    }
  }

  return []
}

export async function getSubgraph(nodeIds: string[]): Promise<{ nodes: unknown[]; edges: unknown[] }> {
  const [nodes, edges] = await Promise.all([
    prisma.intelligenceGraphNode.findMany({
      where: { id: { in: nodeIds } },
    }),
    prisma.intelligenceGraphEdge.findMany({
      where: {
        OR: [
          { sourceId: { in: nodeIds } },
          { targetId: { in: nodeIds } },
        ],
      },
    }),
  ])
  return { nodes, edges }
}
