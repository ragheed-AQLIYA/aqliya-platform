/**
 * AEOS Platform Core — Repository Ontology
 *
 * Semantic understanding of the repository — not just structural scanning.
 * The ontology defines the TYPES of things that exist in the AQLIYA repository
 * and their relationships, enabling semantic queries.
 *
 * Ontology Layers:
 *   Organization
 *     ↓ contains
 *   Product (AuditOS, DecisionOS, SalesOS...)
 *     ↓ implements
 *   Domain (bounded context)
 *     ↓ contains
 *   Capability (what the domain can do)
 *     ↓ uses
 *   Module (src/lib/*)
 *     ↓ contains
 *   Aggregate (DDD aggregate root)
 *     ↓ composed of
 *   Entity (Prisma model)
 *     ↓ exposes
 *   API (route handler, server action)
 *     ↓ routed through
 *   Route (page, API endpoint)
 *     ↓ validated by
 *   Agent (engineering agent)
 *     ↓ uses
 *   Skill (reusable procedure)
 *     ↓ governed by
 *   Rule (governance rule)
 *
 * @module core/ontology
 * @version 1.0.0
 */

import { addNode, addEdge, getStats } from "./knowledge-graph.mjs";

// ═══════════════════════════════════════════════════════════
// Ontology Types
// ═══════════════════════════════════════════════════════════

export const ONTOLOGY_TYPES = {
  ORGANIZATION: "organization",
  PRODUCT: "product",
  DOMAIN: "domain",
  CAPABILITY: "capability",
  MODULE: "module",
  AGGREGATE: "aggregate",
  ENTITY: "entity",
  API: "api",
  ROUTE: "route",
  AGENT: "agent",
  SKILL: "skill",
  RULE: "rule",
  POLICY: "policy",
  CONTROL: "control",
  WORKFLOW: "workflow",
  ADR: "adr",
  PATTERN: "pattern",
  ANTIPATTERN: "antipattern",
};

export const RELATIONSHIP_TYPES = {
  CONTAINS: "contains",
  IMPLEMENTS: "implements",
  EXPOSES: "exposes",
  USES: "uses",
  DEPENDS_ON: "depends_on",
  VALIDATES: "validates",
  GOVERNS: "governs",
  COMPOSES: "composes",
  REFERENCES: "references",
  SUPERSEDES: "supersedes",
  DERIVES_FROM: "derives_from",
  ROUTES_THROUGH: "routes_through",
  BELONGS_TO: "belongs_to",
};

// ═══════════════════════════════════════════════════════════
// Ontology Builder
// ═══════════════════════════════════════════════════════════

/**
 * Register a repository entity in the ontology.
 *
 * @param {string} type - ONTOLOGY_TYPES value
 * @param {string} id - Unique identifier
 * @param {string} label - Human-readable label
 * @param {object} [properties]
 * @returns {{ id: string, type: string }}
 */
export function define(type, id, label, properties = {}) {
  return addNode(`${type}:${id}`, type, label, properties);
}

/**
 * Relate two ontology entities.
 *
 * @param {string} sourceType
 * @param {string} sourceId
 * @param {string} targetType
 * @param {string} targetId
 * @param {string} relationship - RELATIONSHIP_TYPES value
 * @param {object} [properties]
 */
export function relate(sourceType, sourceId, targetType, targetId, relationship, properties = {}) {
  return addEdge(`${sourceType}:${sourceId}`, `${targetType}:${targetId}`, relationship, properties);
}

// ═══════════════════════════════════════════════════════════
// Ontology Queries (Semantic)
// ═══════════════════════════════════════════════════════════

/**
 * "What APIs does product X expose?"
 * @param {string} productId
 * @returns {Array}
 */
export function getProductApis(productId) {
  const { getDependencies } = require("./knowledge-graph.mjs");
  const allDeps = getDependencies(`product:${productId}`);
  // In a full implementation, this would traverse the ontology tree
  return allDeps.filter((d) => d.targetType === ONTOLOGY_TYPES.API);
}

/**
 * "What agents are affected if module X changes?"
 * @param {string} moduleId
 * @returns {Array}
 */
export function getAffectedAgents(moduleId) {
  const { impactAnalysis } = require("./knowledge-graph.mjs");
  const impact = impactAnalysis(`module:${moduleId}`, 3);
  return [...impact.directImpact, ...impact.indirectImpact].filter((i) => i.nodeType === ONTOLOGY_TYPES.AGENT);
}

// ═══════════════════════════════════════════════════════════
// Pre-populate AQLIYA Ontology
// ═══════════════════════════════════════════════════════════

// Organization
define(ONTOLOGY_TYPES.ORGANIZATION, "aqliya", "AQLIYA Platform Company", { founded: "2025" });

// Products
define(ONTOLOGY_TYPES.PRODUCT, "auditos", "AuditOS", { maturity: "L6", routes: 18 });
define(ONTOLOGY_TYPES.PRODUCT, "decisionos", "DecisionOS", { maturity: "L6", routes: 22 });
define(ONTOLOGY_TYPES.PRODUCT, "localcontentos", "LocalContentOS", { maturity: "L6", routes: 27 });
define(ONTOLOGY_TYPES.PRODUCT, "salesos", "SalesOS", { maturity: "L6", routes: 32 });
define(ONTOLOGY_TYPES.PRODUCT, "riskos", "RiskOS", { maturity: "L6", routes: 4 });

relate(ONTOLOGY_TYPES.ORGANIZATION, "aqliya", ONTOLOGY_TYPES.PRODUCT, "auditos", RELATIONSHIP_TYPES.CONTAINS);
relate(ONTOLOGY_TYPES.ORGANIZATION, "aqliya", ONTOLOGY_TYPES.PRODUCT, "decisionos", RELATIONSHIP_TYPES.CONTAINS);
relate(ONTOLOGY_TYPES.ORGANIZATION, "aqliya", ONTOLOGY_TYPES.PRODUCT, "localcontentos", RELATIONSHIP_TYPES.CONTAINS);
relate(ONTOLOGY_TYPES.ORGANIZATION, "aqliya", ONTOLOGY_TYPES.PRODUCT, "salesos", RELATIONSHIP_TYPES.CONTAINS);
relate(ONTOLOGY_TYPES.ORGANIZATION, "aqliya", ONTOLOGY_TYPES.PRODUCT, "riskos", RELATIONSHIP_TYPES.CONTAINS);

// Core Module
define(ONTOLOGY_TYPES.MODULE, "platform-core", "AEOS Platform Core", { files: 11, version: "1.0.0" });
define(ONTOLOGY_TYPES.MODULE, "kernel", "AEOS Kernel", { files: 6, version: "1.1.0" });
relate(ONTOLOGY_TYPES.MODULE, "platform-core", ONTOLOGY_TYPES.MODULE, "kernel", RELATIONSHIP_TYPES.CONTAINS);

// ADRs
define(ONTOLOGY_TYPES.ADR, "ADR-001", "Platform Core as Shared Kernel", { status: "accepted", date: "2026-05-28" });
define(ONTOLOGY_TYPES.ADR, "ADR-009", "Engineering OS Foundation", { status: "accepted", date: "2026-07-13" });
relate(ONTOLOGY_TYPES.ADR, "ADR-001", ONTOLOGY_TYPES.MODULE, "platform-core", RELATIONSHIP_TYPES.GOVERNS);
relate(ONTOLOGY_TYPES.ADR, "ADR-009", ONTOLOGY_TYPES.MODULE, "platform-core", RELATIONSHIP_TYPES.GOVERNS);

// Ontology stats
console.log(`[Ontology] Initialized — ${getStats().nodes} nodes, ${getStats().edges} edges`);

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  ONTOLOGY_TYPES,
  RELATIONSHIP_TYPES,
  define,
  relate,
  getProductApis,
  getAffectedAgents,
  getStats,
};
