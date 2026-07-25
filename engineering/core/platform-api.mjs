/**
 * AEOS Platform Core — Platform API
 *
 * THE SINGLE ENTRY POINT for the entire AEOS platform.
 *
 * Before:  memory.save(), registry.register(), workflow.execute()
 * After:   AEOS.memory.store(), AEOS.registry.register(), AEOS.workflow.execute()
 *
 * Everything goes through this API. Nothing bypasses it.
 *
 * Architecture:
 *   Platform API (entry point)
 *       ↓
 *   Container (DI — resolves all services)
 *       ↓
 *   Service Bus (Command + Query + Event)
 *       ↓
 *   Modules (Registry, Memory, Workflow, Governance, etc.)
 *
 * @module core/platform-api
 * @version 1.0.0
 */

import { Container, LIFETIME } from "./container.mjs";
import { sendCommand, sendQuery, emit, on, registerCommand, registerQuery, listCommands, listQueries, EVENTS } from "./service-bus.mjs";
import * as pluginSdk from "./plugin-sdk.mjs";
import * as registry from "./registry.mjs";
import * as workflowEngine from "./workflow-engine.mjs";
import * as memorySystem from "./memory-system.mjs";
import * as governanceEngine from "./governance-engine.mjs";
import * as collaborationProtocol from "./collaboration-protocol.mjs";
import * as capabilitySystem from "./capability-system.mjs";
import * as digitalTwin from "./digital-twin.mjs";
import * as knowledgeGraph from "./knowledge-graph.mjs";
import * as policyEngine from "./policy-engine.mjs";
import * as planner from "./planner.mjs";
import * as ontology from "./ontology.mjs";
import * as supervisor from "./supervisor.mjs";
import * as aiLayer from "./ai-layer.mjs";
import { boot as bootKernel, agentEngine, skillEngine, memoryEngine, governanceEngine as kernelGovernance, registryLoader } from "../kernel/index.mjs";
import { existsSync } from "fs";
import { join } from "path";

// ═══════════════════════════════════════════════════════════
// Platform Context (accessible to all modules)
// ═══════════════════════════════════════════════════════════

let _context = {
  platformVersion: "1.0.0",
  platformName: "AEOS Platform Core",
  startedAt: null,
  cycleCount: 0,
  healthStatus: "booting",
};

/**
 * Get the current platform context.
 * @returns {object}
 */
export function getContext() {
  return { ..._context };
}

// ═══════════════════════════════════════════════════════════
// Container Setup
// ═══════════════════════════════════════════════════════════

const container = new Container();

// Register all core services
container.register({ token: "platform.context", factory: () => getContext, lifetime: LIFETIME.SINGLETON });
container.register({ token: "plugin-sdk",       factory: () => pluginSdk, lifetime: LIFETIME.SINGLETON });
container.register({ token: "registry",         factory: () => registry, lifetime: LIFETIME.SINGLETON });
container.register({ token: "workflow",         factory: () => workflowEngine, lifetime: LIFETIME.SINGLETON });
container.register({ token: "memory",           factory: () => memorySystem, lifetime: LIFETIME.SINGLETON });
container.register({ token: "governance",       factory: () => governanceEngine, lifetime: LIFETIME.SINGLETON });
container.register({ token: "policy",           factory: () => policyEngine, lifetime: LIFETIME.SINGLETON });
container.register({ token: "collaboration",    factory: () => collaborationProtocol, lifetime: LIFETIME.SINGLETON });
container.register({ token: "capability",       factory: () => capabilitySystem, lifetime: LIFETIME.SINGLETON });
container.register({ token: "digital-twin",     factory: () => digitalTwin, lifetime: LIFETIME.SINGLETON });
container.register({ token: "knowledge-graph",  factory: () => knowledgeGraph, lifetime: LIFETIME.SINGLETON });
container.register({ token: "ontology",         factory: () => ontology, lifetime: LIFETIME.SINGLETON });
container.register({ token: "planner",          factory: () => planner, lifetime: LIFETIME.SINGLETON });
container.register({ token: "supervisor",       factory: () => supervisor, lifetime: LIFETIME.SINGLETON });
container.register({ token: "ai",               factory: () => aiLayer, lifetime: LIFETIME.SINGLETON });
// Kernel engines
container.register({ token: "kernel.agent",     factory: () => agentEngine, lifetime: LIFETIME.SINGLETON });
container.register({ token: "kernel.skill",     factory: () => skillEngine, lifetime: LIFETIME.SINGLETON });
container.register({ token: "kernel.memory",    factory: () => memoryEngine, lifetime: LIFETIME.SINGLETON });
container.register({ token: "kernel.governance",factory: () => kernelGovernance, lifetime: LIFETIME.SINGLETON });
container.register({ token: "kernel.loader",    factory: () => registryLoader, lifetime: LIFETIME.SINGLETON });

// ═══════════════════════════════════════════════════════════
// Platform API — The Single Entry Point
// ═══════════════════════════════════════════════════════════

export const AEOS = {
  // ─── Metadata ──────────────────────────────────────
  get version() { return _context.platformVersion; },
  get name() { return _context.platformName; },
  get context() { return getContext(); },

  // ─── Container (DI) ────────────────────────────────
  container: {
    /** Resolve a service by token. Usage: AEOS.container.get("registry") */
    get: (token) => container.resolve(token),
    /** Check if a service is registered */
    has: (token) => container.has(token),
    /** List all registered services with state */
    list: () => container.list(),
    /** Create a scoped context */
    scope: (scopeId) => container.createScope(scopeId),
  },

  // ─── Service Bus ───────────────────────────────────
  bus: {
    /** Send a command. Usage: AEOS.bus.command("RunFullAuditCycle", { ... }) */
    command: (name, payload, meta) => sendCommand(name, payload, meta),
    /** Register a command handler */
    registerCommand: (name, handler) => registerCommand(name, handler),
    /** Execute a query. Usage: AEOS.bus.query("GetHealthScore", { ... }) */
    query: (name, params) => sendQuery(name, params),
    /** Register a query handler */
    registerQuery: (name, handler) => registerQuery(name, handler),
    /** Emit an event */
    event: (name, payload, meta) => emit(name, payload, meta),
    /** Subscribe to events */
    onEvent: (name, handler) => on(name, handler),
    /** Standard event names */
    EVENTS,
    /** List registered commands */
    commands: () => registerCommand ? listCommands() : [],
    /** List registered queries */
    queries: () => registerQuery ? listQueries() : [],
  },

  // ─── Registry ──────────────────────────────────────
  registry: {
    register: (entry) => registry.register(entry),
    update: (id, updates) => registry.update(id, updates),
    get: (id) => registry.get(id),
    query: (filter) => registry.query(filter),
    getByType: (type) => registry.getByType(type),
    getByTag: (tag) => registry.getByTag(tag),
    getDependencyTree: (id) => registry.getDependencyTree(id),
    getDependents: (id) => registry.getDependents(id),
    countByType: () => registry.countByType(),
    total: () => registry.totalCount(),
    types: () => registry.listTypes(),
    tags: () => registry.listTags(),
  },

  // ─── Workflow ──────────────────────────────────────
  workflow: {
    register: (wf) => workflowEngine.registerWorkflow(wf),
    execute: (id, executor) => workflowEngine.executeWorkflow(id, executor),
    buildDag: (steps) => workflowEngine.buildDag(steps),
    executeDag: (dag, executor) => workflowEngine.executeDag(dag, executor),
    /** Predefined workflows */
    AUDIT: workflowEngine.AUDIT_WORKFLOW,
    ARCHITECTURE_REVIEW: workflowEngine.ARCHITECTURE_REVIEW_WORKFLOW,
    RELEASE_VALIDATION: workflowEngine.RELEASE_VALIDATION_WORKFLOW,
  },

  // ─── Memory ────────────────────────────────────────
  memory: {
    store: (entry) => memorySystem.store(entry),
    recall: (id, type) => memorySystem.recall(id, type),
    query: (q) => memorySystem.query(q),
    forget: (id, type) => memorySystem.forget(id, type),
    countByType: () => memorySystem.countByType(),
    total: () => memorySystem.totalEntries(),
    mostAccessed: (limit) => memorySystem.mostAccessed(limit),
    /** Memory type constants */
    TYPES: memorySystem.TYPES,
  },

  // ─── Governance ────────────────────────────────────
  governance: {
    registerPolicy: (p) => governanceEngine.registerPolicy(p),
    registerRule: (r) => governanceEngine.registerRule(r),
    validate: (ruleId, state) => governanceEngine.validate(ruleId, state),
    validateAll: (state) => governanceEngine.validateAll(state),
    decide: (d) => governanceEngine.decide(d),
    getEvidence: (ruleId) => governanceEngine.getEvidence(ruleId),
    getDecisions: (ruleId) => governanceEngine.getDecisions(ruleId),
    getUnresolved: () => governanceEngine.getUnresolvedEvidence(),
    listPolicies: () => governanceEngine.listPolicies(),
    listRules: () => governanceEngine.listRules(),
  },

  // ─── Collaboration ─────────────────────────────────
  collaboration: {
    request: (r) => collaborationProtocol.request(r),
    respond: (r) => collaborationProtocol.respond(r),
    canExecute: (requestId) => collaborationProtocol.canExecute(requestId),
    pendingFor: (agentId) => collaborationProtocol.getPendingFor(agentId),
    completed: (filter) => collaborationProtocol.getCompleted(filter),
  },

  // ─── Capability ────────────────────────────────────
  capability: {
    define: (c) => capabilitySystem.defineCapability(c),
    get: (id) => capabilitySystem.getCapability(id),
    list: () => capabilitySystem.listCapabilities(),
    defineProcedure: (p) => capabilitySystem.defineProcedure(p),
    executeProcedure: (id, executor) => capabilitySystem.executeProcedure(id, executor),
    defineAction: (a) => capabilitySystem.defineAction(a),
  },

  // ─── Digital Twin ──────────────────────────────────
  twin: {
    updateLayer: (name, entities) => digitalTwin.updateLayer(name, entities),
    getLayer: (name) => digitalTwin.getLayer(name),
    getAllLayers: () => digitalTwin.getAllLayers(),
    getSnapshot: (cycleId) => digitalTwin.getSnapshot(cycleId),
    detectDrift: (before, after) => digitalTwin.detectDrift(before, after),
    determineRescan: (files) => digitalTwin.determineRescanScope(files),
    /** Layer name constants */
    LAYERS: digitalTwin.LAYERS,
  },

  // ─── Plugins ───────────────────────────────────────
  plugins: {
    register: (manifest, lifecycle) => pluginSdk.registerPlugin(manifest, lifecycle),
    activate: (id) => pluginSdk.activatePlugin(id),
    deactivate: (id) => pluginSdk.deactivatePlugin(id),
    healthCheck: () => pluginSdk.healthCheckAll(),
    list: () => pluginSdk.listPlugins(),
  },

  // ─── Knowledge Graph ───────────────────────────────
  graph: {
    addNode: (id, type, label, props) => knowledgeGraph.addNode(id, type, label, props),
    addEdge: (src, tgt, type, props) => knowledgeGraph.addEdge(src, tgt, type, props),
    getNode: (id) => knowledgeGraph.getNode(id),
    findNodesByType: (type) => knowledgeGraph.findNodesByType(type),
    getDependencies: (id) => knowledgeGraph.getDependencies(id),
    getDependents: (id) => knowledgeGraph.getDependents(id),
    impactAnalysis: (id, depth) => knowledgeGraph.impactAnalysis(id, depth),
    findPath: (from, to) => knowledgeGraph.findPath(from, to),
    getSubgraph: (id, hops) => knowledgeGraph.getSubgraph(id, hops),
    stats: () => knowledgeGraph.getStats(),
  },

  // ─── Policy Engine ─────────────────────────────────
  policy: {
    define: (p) => policyEngine.definePolicy(p),
    get: (id) => policyEngine.getPolicy(id),
    list: () => policyEngine.listPolicies(),
    defineControl: (c) => policyEngine.defineControl(c),
    defineRule: (r) => policyEngine.defineRule(r),
    getRule: (id) => policyEngine.getRule(id),
    listRules: () => policyEngine.listRules(),
    recordEvidence: (ruleId, finding, location, meta) => policyEngine.recordEvidence(ruleId, finding, location, meta),
    getEvidence: (ruleId) => policyEngine.getEvidence(ruleId),
    decide: (d) => policyEngine.makeDecision(d),
    auditPolicy: (id) => policyEngine.auditPolicy(id),
  },

  // ─── Planner ───────────────────────────────────────
  planner: {
    defineGoal: (g) => planner.defineGoal(g),
    getGoal: (id) => planner.getGoal(id),
    listGoals: (f) => planner.listGoals(f),
    defineObjective: (o) => planner.defineObjective(o),
    defineEpic: (e) => planner.defineEpic(e),
    defineStory: (s) => planner.defineStory(s),
    defineTask: (t) => planner.defineTask(t),
    getExecutionPlan: (id) => planner.getExecutionPlan(id),
    getTaskDag: () => planner.getTaskDag(),
  },

  // ─── Ontology ──────────────────────────────────────
  ontology: {
    define: (type, id, label, props) => ontology.define(type, id, label, props),
    relate: (st, si, tt, ti, rel, props) => ontology.relate(st, si, tt, ti, rel, props),
    getProductApis: (id) => ontology.getProductApis(id),
    getAffectedAgents: (id) => ontology.getAffectedAgents(id),
    stats: () => ontology.getStats(),
    TYPES: ontology.ONTOLOGY_TYPES,
    RELATIONS: ontology.RELATIONSHIP_TYPES,
  },

  // ─── Supervisor ────────────────────────────────────
  supervisor: {
    monitorAgent: (id) => supervisor.monitorAgent(id),
    reportExecution: (id, success, ms) => supervisor.reportExecution(id, success, ms),
    reportAction: (action, agentId) => supervisor.reportAction(action, agentId),
    checkHealth: () => supervisor.checkAgentHealth(),
    getSkillCandidates: () => supervisor.getSkillCandidates(),
    shouldStartCycle: () => supervisor.shouldStartCycle(),
    suggestAgent: (agents) => supervisor.suggestAgent(agents),
    getReport: () => supervisor.getReport(),
  },

  // ─── AI Layer ──────────────────────────────────────
  ai: {
    registerProvider: (id, cfg) => aiLayer.registerProvider(id, cfg),
    getProvider: (id) => aiLayer.getProvider(id),
    listProviders: () => aiLayer.listProviders(),
    registerModel: (id, pid, cfg) => aiLayer.registerModel(id, pid, cfg),
    getModel: (id) => aiLayer.getModel(id),
    registerPrompt: (id, cfg) => aiLayer.registerPrompt(id, cfg),
    renderPrompt: (id, vars) => aiLayer.renderPrompt(id, vars),
    recordEvaluation: (e) => aiLayer.recordEvaluation(e),
    getModelPerformance: () => aiLayer.getModelPerformance(),
    trackCost: (usd) => aiLayer.trackCost(usd),
    getTotalCost: () => aiLayer.getTotalCost(),
    governanceRules: () => aiLayer.getAiGovernanceRules(),
    checkCompliance: (c) => aiLayer.checkCompliance(c),
  },

  // ─── Kernel ─────────────────────────────────────────
  kernel: {
    agent: {
      register: (id, meta) => agentEngine.registerAgent(id, meta),
      get: (id) => agentEngine.getAgent(id),
      all: () => agentEngine.getAllAgents(),
      countByState: () => agentEngine.countByState(),
      count: () => agentEngine.agentCount(),
    },
    skill: {
      register: (id, meta) => skillEngine.registerSkill(id, meta),
      get: (id) => skillEngine.getSkill(id),
      all: () => skillEngine.getAllSkills(),
      recordUsage: (id, success, ms) => skillEngine.recordUsage(id, success, ms),
      count: () => skillEngine.skillCount(),
    },
    memory: {
      store: (e) => memoryEngine.store(e),
      recall: (id, type) => memoryEngine.recall(id, type),
      query: (q) => memoryEngine.query(q),
      countByType: () => memoryEngine.countByType(),
      total: () => memoryEngine.total(),
    },
    governance: {
      registerEnforcer: (id, rule, sev, fn) => kernelGovernance.registerEnforcer(id, rule, sev, fn),
      enforce: (ctx) => kernelGovernance.enforce(ctx),
      list: () => kernelGovernance.listEnforcers(),
    },
    loader: {
      loadAgents: (dir) => registryLoader.loadAgents(dir),
      loadSkills: (dir) => registryLoader.loadSkills(dir),
      bootstrapAll: (dir) => registryLoader.bootstrapAll(dir),
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Bootstrap
// ═══════════════════════════════════════════════════════════

/**
 * Bootstrap the entire AEOS Platform.
 * This is THE single entry function.
 *
 * Usage:
 *   import { bootstrap } from "./core/platform-api.mjs";
 *   const platform = await bootstrap();
 *
 * @returns {Promise<typeof AEOS>}
 */
export async function bootstrap() {
  _context.startedAt = new Date().toISOString();
  _context.healthStatus = "booting";
  _context.platformVersion = "2.0.0";
  _context.platformName = "AQLIYA Autonomous Engineering Platform";

  // 1. Boot kernel
  const kernel = bootKernel();
  console.log(`[AEOS] Kernel v${kernel.version} — ${kernel.engines.length} engines`);

  // 2. Bootstrap container (resolve all services)
  const instances = container.bootstrap();
  console.log(`[AEOS] Container — ${instances.size} services resolved`);

  // 3. Load registries from YAML files
  const engineeringDir = join(process.cwd(), "engineering");
  if (existsSync(engineeringDir)) {
    const loaded = registryLoader.bootstrapAll(engineeringDir);
    console.log(`[AEOS] Registries loaded — ${loaded.agents} agents, ${loaded.skills} skills`);

    // Register all loaded agents into the registry + kernel agent engine
    for (const agent of loaded.agentList) {
      try { registry.register(agent); } catch (e) { /* Already registered */ }
      try { agentEngine.registerAgent(agent.id, agent.metadata); } catch (e) { /* Already registered */ }
      supervisor.monitorAgent(agent.id);
    }

    // Register all loaded skills
    for (const skill of loaded.skillList) {
      try { registry.register(skill); } catch (e) { /* Already registered */ }
      try { skillEngine.registerSkill(skill.id, skill.metadata); } catch (e) { /* Already registered */ }
    }
  }

  // 4. Populate Knowledge Graph with all agents + their dependency edges
  const allAgents = agentEngine.getAllAgents();
  const allSkills = skillEngine.getAllSkills();

  // First, add all skill nodes
  for (const skill of allSkills) {
    knowledgeGraph.addNode(`skill:${skill.id}`, "skill", skill.metadata?.name || skill.id, { layer: skill.metadata?.layer });
  }

  // Then add agents and their edges
  for (const agent of allAgents) {
    knowledgeGraph.addNode(`agent:${agent.id}`, "agent", agent.metadata?.name || agent.id, { layer: agent.metadata?.layer });
    // Add dependency edges
    const deps = agent.metadata?.dependencies || [];
    for (const dep of deps) {
      if (!deps.includes("") && dep) {
        try { knowledgeGraph.addEdge(`agent:${agent.id}`, `agent:${dep}`, "depends_on"); } catch {}
      }
    }
    // Add skill edges
    const skills = agent.metadata?.skills || [];
    for (const skillId of skills) {
      if (skillId) {
        try { knowledgeGraph.addEdge(`agent:${agent.id}`, `skill:${skillId}`, "uses"); } catch {}
      }
    }
  }

  // 5. Wire Supervisor
  const supervisorReport = supervisor.getReport();
  console.log(`[AEOS] Supervisor — ${supervisorReport.supervisor.agentsMonitored} agents monitored, ${supervisorReport.qualityAlerts.length} alerts`);

  // 6. Run kernel governance
  const kernelGovResult = kernelGovernance.enforce({ agentCount: agentEngine.agentCount() });
  console.log(`[AEOS] Kernel governance — ${kernelGovResult.passed ? "PASSED" : "VIOLATIONS: " + kernelGovResult.violations.length}`);

  // 7. Emit platform started
  emit("platform.started", {
    version: _context.platformVersion,
    agents: agentEngine.agentCount(),
    skills: skillEngine.skillCount(),
    services: instances.size,
  }, { source: "platform-api" });

  // 8. Register command handlers (skip if already registered)
  try { registerCommand("RunFullAuditCycle", async () => ({ status: "queued" })); } catch {}
  try { registerCommand("GetHealthReport", async () => ({
    agents: { total: agentEngine.agentCount(), byState: agentEngine.countByState() },
    skills: { total: skillEngine.skillCount() },
    governance: governanceEngine.validateAll({ cycleId: "bootstrap" }),
    memory: memoryEngine.countByType(),
    graph: knowledgeGraph.getStats(),
  })); } catch {}

  _context.healthStatus = "healthy";
  _context.cycleCount = 0;

  console.log(`[AEOS] ✅ ${_context.platformName} v${_context.platformVersion} ready`);
  console.log(`[AEOS]    ${agentEngine.agentCount()} agents · ${skillEngine.skillCount()} skills · ${instances.size} services`);

  return AEOS;
}

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export { Container, LIFETIME, container, EVENTS };
export default { AEOS, bootstrap, getContext };
