// ENG-001C: Graph Builder (Internal)
//
// Builds an internal undirected graph from ExtractedRegistries for statistics.
// All edges represent bidirectional relationships from C01–C21.
//
// Pure function — no I/O, no mutation of input, no side effects.

import type { ExtractedRegistries } from '../types/extracted-registries';

export interface GraphEdge {
  source: string;
  target: string;
  type: string; // e.g. "C04", "C06", "C14"
}

export interface InternalGraph {
  /** All node IDs in the graph */
  nodes: string[];
  /** All edges (undirected — each relationship stored once) */
  edges: GraphEdge[];
  /** Adjacency list: nodeId → neighboring nodeIds (undirected) */
  adjacency: Map<string, Set<string>>;
  /** Edge map: "source|target|type" → GraphEdge for duplicate detection */
  edgeKeySet: Set<string>;
}

/**
 * Build an internal graph from ExtractedRegistries.
 * Extracts edges from relationships C01–C21 where both endpoints exist.
 */
export function buildGraph(registries: ExtractedRegistries): InternalGraph {
  const nodes = new Map<string, boolean>();
  const adjacency = new Map<string, Set<string>>();
  const edges: GraphEdge[] = [];
  const edgeKeySet = new Set<string>();

  // Helper: add a node
  function addNode(id: string): void {
    if (!nodes.has(id)) {
      nodes.set(id, true);
    }
  }

  // Helper: add an undirected edge (stored once)
  function addEdge(source: string, target: string, type: string): void {
    if (source === target) return; // skip self-loops
    const [a, b] = source < target ? [source, target] : [target, source];
    const key = `${a}|${b}|${type}`;
    if (edgeKeySet.has(key)) return; // deduplicate
    edgeKeySet.add(key);
    edges.push({ source, target, type });

    // Build adjacency
    if (!adjacency.has(source)) adjacency.set(source, new Set());
    if (!adjacency.has(target)) adjacency.set(target, new Set());
    adjacency.get(source)!.add(target);
    adjacency.get(target)!.add(source);
  }

  // Collect all nodes
  for (const c of registries.claims) {
    addNode(c.id);
    for (const evId of c.evidence) addNode(evId);
    if (c.product) addNode(c.product);
    if (c.auth) addNode(c.auth);
  }
  for (const p of registries.products) {
    addNode(p.id);
    if (p.authority) addNode(p.authority);
  }
  for (const d of registries.decisions) {
    addNode(d.id);
    if (d.authority) addNode(d.authority);
    for (const aff of d.affected) {
      const clean = aff.trim();
      if (clean && clean !== '—') addNode(clean);
    }
  }
  for (const e of registries.evidence) {
    addNode(e.id);
    for (const cId of e.supports) addNode(cId);
  }
  for (const a of registries.authorities) {
    addNode(a.id);
    for (const ref of a.secondaryRefs) {
      if (ref.startsWith('AUTH-')) addNode(ref);
    }
  }

  // Collect all edges from relationships

  // C04 / C06: Claim → Product / Evidence
  for (const c of registries.claims) {
    for (const evId of c.evidence) {
      addEdge(c.id, evId, 'C06');
    }
    if (c.product) {
      addEdge(c.id, c.product, 'C04');
    }
    if (c.auth) {
      addEdge(c.id, c.auth, 'C07');
    }
  }

  // C05 / C01: Product → KA (via authority) / Authority
  for (const p of registries.products) {
    if (p.authority) {
      addEdge(p.id, p.authority, 'C01');
    }
  }

  // C08: Decision → Claim
  for (const d of registries.decisions) {
    for (const aff of d.affected) {
      const clean = aff.trim();
      if (clean && clean !== '—') {
        addEdge(d.id, clean, 'C08');
      }
    }
    if (d.authority) {
      addEdge(d.id, d.authority, 'C15');
    }
  }

  // C06 (reverse): Evidence → Claim
  for (const e of registries.evidence) {
    for (const cId of e.supports) {
      addEdge(e.id, cId, 'C06');
    }
  }

  // C14: Authority → Authority (supersession)
  for (const a of registries.authorities) {
    for (const ref of a.secondaryRefs) {
      if (ref.startsWith('AUTH-')) {
        addEdge(a.id, ref, 'C14');
      }
    }
  }

  return {
    nodes: Array.from(nodes.keys()),
    edges,
    adjacency,
    edgeKeySet,
  };
}
