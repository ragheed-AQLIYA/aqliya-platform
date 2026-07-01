// Governance Engine — Graph Resolver
// Sprint 2: Dependency graph builder

import { GovernanceRegistries, Claim, Evidence } from '../types/entities';

export interface GraphNode {
  id: string;
  type: string;
  label: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  cardinality: string;
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    nodeCount: number;
    edgeCount: number;
    density: number;
    averageDegree: number;
  };
}

export class GraphResolver {
  private registries: GovernanceRegistries;

  constructor(registries: GovernanceRegistries) {
    this.registries = registries;
  }

  buildFullGraph(): DependencyGraph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeSet = new Set<string>();

    const addNode = (id: string, type: string, label: string) => {
      if (!nodeSet.has(id)) {
        nodeSet.add(id);
        nodes.push({ id, type, label });
      }
    };

    const addEdge = (source: string, target: string, relationship: string, cardinality: string) => {
      edges.push({ source, target, relationship, cardinality });
    };

    // Add product nodes
    for (const product of this.registries.products) {
      addNode(product.id, 'Product', `${product.name} (${product.entityType})`);
    }

    // Add claim nodes
    for (const claim of this.registries.claims) {
      addNode(claim.id, 'Claim', `${claim.id} [${claim.dimension}]`);
      addEdge(claim.product, claim.id, 'has_claim', '1:N');

      // Add evidence edges
      for (const evRef of claim.evidenceRefs) {
        addNode(evRef, 'Evidence', evRef);
        addEdge(claim.id, evRef, 'references', 'N:M');
      }

      // Add authority edges
      for (const authRef of claim.authorities) {
        addNode(authRef, 'Authority', authRef);
        addEdge(claim.id, authRef, 'has_authority', 'N:1');
      }
    }

    // Add evidence → source edges
    for (const ev of this.registries.evidence) {
      addNode(ev.id, 'Evidence', `${ev.id} [T${ev.tier[1]}]`);
      if (ev.sourceRef) {
        addNode(ev.sourceRef, 'Source', ev.sourceRef);
        addEdge(ev.id, ev.sourceRef, 'sourced_from', 'N:1');
      }
    }

    // Add source → document edges (simplified — documents are file paths)
    for (const source of this.registries.sources) {
      for (const doc of source.containedIn) {
        addNode(doc, 'Document', doc.split('/').pop() || doc);
        addEdge(source.id, doc, 'contained_in', 'N:M');
      }
    }

    // Add decision nodes
    for (const decision of this.registries.decisions) {
      addNode(decision.id, 'Decision', `${decision.id} [${decision.type}]`);
      for (const claimRef of decision.affectedClaims) {
        if (nodeSet.has(claimRef)) {
          addEdge(claimRef, decision.id, 'results_in', '1:1');
        }
      }
    }

    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const density = nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;
    const averageDegree = nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0;

    return {
      nodes,
      edges,
      stats: {
        nodeCount,
        edgeCount,
        density: Math.round(density * 10000) / 10000,
        averageDegree: Math.round(averageDegree * 100) / 100,
      },
    };
  }

  buildProductGraph(productId: string): DependencyGraph {
    const fullGraph = this.buildFullGraph();
    const productNodeIds = new Set<string>();

    // Find product node
    const productNode = fullGraph.nodes.find(n => n.id === productId);
    if (!productNode) {
      return { nodes: [], edges: [], stats: { nodeCount: 0, edgeCount: 0, density: 0, averageDegree: 0 } };
    }

    productNodeIds.add(productId);

    // Find all claims for this product
    const productClaims = this.registries.claims.filter(c => c.product === productId);
    for (const claim of productClaims) {
      productNodeIds.add(claim.id);
      for (const evRef of claim.evidenceRefs) productNodeIds.add(evRef);
      for (const authRef of claim.authorities) productNodeIds.add(authRef);
    }

    // Find evidence sources
    for (const ev of this.registries.evidence) {
      if (productNodeIds.has(ev.id)) {
        productNodeIds.add(ev.sourceRef);
      }
    }

    const filteredNodes = fullGraph.nodes.filter(n => productNodeIds.has(n.id));
    const filteredEdges = fullGraph.edges.filter(
      e => productNodeIds.has(e.source) && productNodeIds.has(e.target)
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
      stats: {
        nodeCount: filteredNodes.length,
        edgeCount: filteredEdges.length,
        density: 0,
        averageDegree: 0,
      },
    };
  }

  findCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const path: string[] = [];

    const graph = this.buildFullGraph();
    const adjacency = new Map<string, string[]>();

    for (const edge of graph.edges) {
      const neighbors = adjacency.get(edge.source) || [];
      neighbors.push(edge.target);
      adjacency.set(edge.source, neighbors);
    }

    const dfs = (nodeId: string) => {
      visited.add(nodeId);
      inStack.add(nodeId);
      path.push(nodeId);

      const neighbors = adjacency.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        } else if (inStack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor);
          if (cycleStart >= 0) {
            cycles.push([...path.slice(cycleStart), neighbor]);
          }
        }
      }

      path.pop();
      inStack.delete(nodeId);
    };

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }

    return cycles;
  }
}
