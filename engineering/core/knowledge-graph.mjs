/**
 * AEOS Platform Core — Knowledge Graph
 *
 * A directed graph of nodes and edges representing ALL entities
 * in the AEOS platform and their relationships.
 *
 * Enables queries like:
 *   - "Which agents are affected if this API changes?"
 *   - "What skills depend on this ADR?"
 *   - "Show me the full dependency path from Product to Action"
 *
 * Node Types:
 *   Organization → Product → Domain → Module → Entity → API → Route
 *   Agent → Skill → Capability → Procedure → Action
 *   Policy → Control → Rule → Evidence → Decision
 *   ADR → Pattern → AntiPattern → Finding
 *
 * Edge Types:
 *   depends_on, owns, implements, uses, produces, reviews, approves
 *   contains, references, derives_from, contradicts, supports, supersedes
 *
 * @module core/knowledge-graph
 * @version 1.0.0
 */

import { emit } from "../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// Graph Store
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, { id: string, type: string, label: string, properties: object }>} */
const nodes = new Map();

/** @type {Array<{ id: string, source: string, target: string, type: string, properties: object }>} */
const edges = [];

/** @type {Map<string, string[]>} nodeId → relationship types */
const nodeIndex = new Map();

/** @type {Map<string, string[]>} edgeType → edge ids */
const edgeTypeIndex = new Map();

let edgeCounter = 0;

// ═══════════════════════════════════════════════════════════
// Node Operations
// ═══════════════════════════════════════════════════════════

/**
 * Add a node to the graph.
 * @param {string} id
 * @param {string} type - Node type (e.g., "agent", "skill", "module", "api")
 * @param {string} label - Human-readable label
 * @param {object} [properties]
 * @returns {{ id: string, type: string }}
 */
export function addNode(id, type, label, properties = {}) {
  if (nodes.has(id)) {
    // Update existing node
    const existing = nodes.get(id);
    existing.label = label;
    existing.properties = { ...existing.properties, ...properties };
    return { id, type };
  }

  nodes.set(id, { id, type, label, properties, createdAt: new Date().toISOString() });

  if (!nodeIndex.has(id)) {
    nodeIndex.set(id, []);
  }

  emit("knowledge_graph.node_added", { nodeId: id, type, label }, { source: "knowledge-graph" });

  return { id, type };
}

/**
 * Get a node by ID.
 * @param {string} id
 * @returns {object | null}
 */
export function getNode(id) {
  return nodes.get(id) || null;
}

/**
 * Find nodes by type.
 * @param {string} type
 * @returns {Array}
 */
export function findNodesByType(type) {
  return [...nodes.values()].filter((n) => n.type === type);
}

/**
 * Count nodes by type.
 * @returns {Record<string, number>}
 */
export function countNodesByType() {
  const counts = {};
  for (const node of nodes.values()) {
    counts[node.type] = (counts[node.type] || 0) + 1;
  }
  return counts;
}

// ═══════════════════════════════════════════════════════════
// Edge Operations
// ═══════════════════════════════════════════════════════════

/**
 * Add an edge between two nodes.
 *
 * @param {string} source - Source node ID
 * @param {string} target - Target node ID
 * @param {string} type - Edge type (e.g., "depends_on", "owns", "implements")
 * @param {object} [properties]
 * @returns {{ id: string, source: string, target: string, type: string }}
 */
export function addEdge(source, target, type, properties = {}) {
  if (!nodes.has(source)) throw new Error(`Knowledge Graph: source node not found: ${source}`);
  if (!nodes.has(target)) throw new Error(`Knowledge Graph: target node not found: ${target}`);

  const edgeId = `edge-${++edgeCounter}`;

  const edge = {
    id: edgeId,
    source,
    target,
    type,
    properties,
    createdAt: new Date().toISOString(),
  };

  edges.push(edge);

  // Index
  if (!edgeTypeIndex.has(type)) edgeTypeIndex.set(type, []);
  edgeTypeIndex.get(type).push(edgeId);

  nodeIndex.get(source).push(type);

  emit("knowledge_graph.edge_added", { edgeId, source, target, type }, { source: "knowledge-graph" });

  return edge;
}

// ═══════════════════════════════════════════════════════════
// Traversal & Impact Analysis
// ═══════════════════════════════════════════════════════════

/**
 * Get all direct dependencies of a node (outgoing edges).
 * @param {string} nodeId
 * @returns {Array<{ targetId: string, targetType: string, edgeType: string }>}
 */
export function getDependencies(nodeId) {
  return edges
    .filter((e) => e.source === nodeId)
    .map((e) => ({
      targetId: e.target,
      targetType: nodes.get(e.target)?.type || "unknown",
      edgeType: e.type,
    }));
}

/**
 * Get all nodes that depend on this node (incoming edges).
 * @param {string} nodeId
 * @returns {Array<{ sourceId: string, sourceType: string, edgeType: string }>}
 */
export function getDependents(nodeId) {
  return edges
    .filter((e) => e.target === nodeId)
    .map((e) => ({
      sourceId: e.source,
      sourceType: nodes.get(e.source)?.type || "unknown",
      edgeType: e.type,
    }));
}

/**
 * Impact Analysis: if this node changes, what is affected?
 * Traverses the dependency tree BFS from the node.
 *
 * @param {string} nodeId
 * @param {number} [maxDepth=5]
 * @returns {{ directImpact: Array, indirectImpact: Array, totalAffected: number }}
 */
export function impactAnalysis(nodeId, maxDepth = 5) {
  const visited = new Set();
  const directImpact = [];
  const indirectImpact = [];
  const queue = [{ id: nodeId, depth: 0 }];

  visited.add(nodeId);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.depth >= maxDepth) continue;

    const deps = edges.filter((e) => e.target === current.id);
    for (const dep of deps) {
      if (visited.has(dep.source)) continue;
      visited.add(dep.source);

      const node = nodes.get(dep.source);
      const impact = {
        nodeId: dep.source,
        nodeType: node?.type || "unknown",
        nodeLabel: node?.label || dep.source,
        edgeType: dep.type,
        depth: current.depth + 1,
      };

      if (current.depth === 0) {
        directImpact.push(impact);
      } else {
        indirectImpact.push(impact);
      }

      queue.push({ id: dep.source, depth: current.depth + 1 });
    }
  }

  return {
    directImpact,
    indirectImpact,
    totalAffected: directImpact.length + indirectImpact.length,
  };
}

/**
 * Find the shortest path between two nodes.
 * @param {string} fromId
 * @param {string} toId
 * @returns {{ found: boolean, path: string[], length: number }}
 */
export function findPath(fromId, toId) {
  const visited = new Set();
  const parent = new Map();
  const queue = [fromId];
  visited.add(fromId);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === toId) {
      // Reconstruct path
      const path = [];
      let node = toId;
      while (node) {
        path.unshift(node);
        node = parent.get(node);
      }
      return { found: true, path, length: path.length - 1 };
    }

    const outgoing = edges.filter((e) => e.source === current);
    for (const edge of outgoing) {
      if (!visited.has(edge.target)) {
        visited.add(edge.target);
        parent.set(edge.target, current);
        queue.push(edge.target);
      }
    }
  }

  return { found: false, path: [], length: -1 };
}

/**
 * Get the subgraph around a node (N-hop neighborhood).
 * @param {string} nodeId
 * @param {number} [hops=2]
 * @returns {{ nodes: Array, edges: Array }}
 */
export function getSubgraph(nodeId, hops = 2) {
  const visitedNodes = new Set();
  const relevantEdges = [];
  const queue = [{ id: nodeId, depth: 0 }];
  visitedNodes.add(nodeId);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.depth >= hops) continue;

    const connected = edges.filter((e) => e.source === current.id || e.target === current.id);
    for (const edge of connected) {
      relevantEdges.push(edge);
      const other = edge.source === current.id ? edge.target : edge.source;
      if (!visitedNodes.has(other)) {
        visitedNodes.add(other);
        queue.push({ id: other, depth: current.depth + 1 });
      }
    }
  }

  return {
    nodes: [...visitedNodes].map((id) => nodes.get(id)).filter(Boolean),
    edges: relevantEdges,
  };
}

// ═══════════════════════════════════════════════════════════
// Graph Stats
// ═══════════════════════════════════════════════════════════

export function nodeCount() { return nodes.size; }
export function edgeCount() { return edges.length; }
export function getStats() {
  return {
    nodes: nodes.size,
    edges: edges.length,
    nodeTypes: countNodesByType(),
    edgeTypes: [...edgeTypeIndex.keys()].map((t) => ({ type: t, count: edgeTypeIndex.get(t).length })),
  };
}

// ═══════════════════════════════════════════════════════════
// Pre-populate with Platform Ontology
// ═══════════════════════════════════════════════════════════

// Agents
addNode("agent:chief-architect", "agent", "Chief Architect", { layer: 1, priority: "critical" });
addNode("agent:repository-intelligence", "agent", "Repository Intelligence", { layer: 2, priority: "critical" });
addNode("agent:code-quality", "agent", "Code Quality", { layer: 3, priority: "high" });
addNode("agent:security-agent", "agent", "Security Agent", { layer: 4, priority: "critical" });
addNode("agent:governance-engine", "agent", "Governance Engine", { layer: 12, priority: "critical" });

// Skills
addNode("skill:eng-code-review", "skill", "Engineering Code Review", { qualityScore: 85 });
addNode("skill:eng-architecture-review", "skill", "Architecture Review", { qualityScore: 90 });
addNode("skill:eng-security-audit", "skill", "Security Audit", { qualityScore: 90 });
addNode("skill:eng-governance-compliance", "skill", "Governance Compliance", { qualityScore: 85 });

// Capabilities
addNode("capability:architecture-review", "capability", "Architecture Review Capability", { maturityLevel: 4 });
addNode("capability:security-audit", "capability", "Security Audit Capability", { maturityLevel: 4 });

// Policies
addNode("policy:platform-security", "policy", "Platform Security Policy", { version: "1.0" });
addNode("policy:architecture-integrity", "policy", "Architecture Integrity Policy", { version: "1.0" });

// Rules
addNode("rule:GOV-01", "rule", "NO_PRISMA_IN_CLIENT", { severity: "BLOCK", score: 99 });
addNode("rule:GOV-02", "rule", "ACTIONS_USE_ENFORCE", { severity: "BLOCK", score: 52 });

// Modules
addNode("module:core", "module", "Platform Core", { files: 11 });
addNode("module:kernel", "module", "AEOS Kernel", { files: 6 });

// Relationships
addEdge("agent:chief-architect", "skill:eng-architecture-review", "uses");
addEdge("agent:code-quality", "skill:eng-code-review", "uses");
addEdge("agent:security-agent", "skill:eng-security-audit", "uses");
addEdge("agent:governance-engine", "skill:eng-governance-compliance", "uses");

addEdge("skill:eng-architecture-review", "capability:architecture-review", "composes");
addEdge("skill:eng-security-audit", "capability:security-audit", "composes");

addEdge("rule:GOV-01", "policy:platform-security", "belongs_to");
addEdge("rule:GOV-02", "policy:platform-security", "belongs_to");

addEdge("agent:chief-architect", "module:core", "owns");
addEdge("module:core", "module:kernel", "contains");

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  addNode,
  getNode,
  findNodesByType,
  countNodesByType,
  addEdge,
  getDependencies,
  getDependents,
  impactAnalysis,
  findPath,
  getSubgraph,
  nodeCount,
  edgeCount,
  getStats,
};
