/**
 * AEOS Platform Core — Workflow Engine (DAG-based)
 *
 * Defines and executes workflows as Directed Acyclic Graphs.
 * Steps can run in parallel when their dependencies are met.
 * This is NOT a simple queue — it's a DAG executor.
 *
 * Predefined workflows:
 *   - Engineering Audit Pipeline
 *   - Architecture Review Pipeline
 *   - Release Validation Pipeline
 *
 * @module core/workflow-engine
 * @version 1.0.0
 */

import { emit, EVENTS } from "../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// DAG Builder
// ═══════════════════════════════════════════════════════════

/**
 * Build a DAG from workflow steps.
 *
 * @param {Array<{ id: string, dependsOn: string[] }>} steps
 * @returns {{ steps: Map<string, object>, edges: Array<{ from: string, to: string }>, rootSteps: string[] }}
 */
export function buildDag(steps) {
  const stepMap = new Map();
  const edges = [];
  const inDegree = new Map();
  const dependents = new Map();

  // Initialize
  for (const step of steps) {
    stepMap.set(step.id, step);
    inDegree.set(step.id, step.dependsOn?.length || 0);
    dependents.set(step.id, []);
  }

  // Build edges and dependents
  for (const step of steps) {
    if (step.dependsOn) {
      for (const depId of step.dependsOn) {
        if (!stepMap.has(depId)) {
          throw new Error(`Workflow DAG error: step "${step.id}" depends on unknown step "${depId}"`);
        }
        edges.push({ from: depId, to: step.id });
        dependents.get(depId).push(step.id);
      }
    }
  }

  // Detect cycles (topological sort)
  const sorted = [];
  const queue = [];
  const tempInDegree = new Map(inDegree);

  for (const [id, degree] of tempInDegree) {
    if (degree === 0) queue.push(id);
  }

  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);
    for (const dep of dependents.get(current)) {
      tempInDegree.set(dep, tempInDegree.get(dep) - 1);
      if (tempInDegree.get(dep) === 0) queue.push(dep);
    }
  }

  if (sorted.length !== steps.length) {
    throw new Error("Workflow DAG error: cycle detected in step dependencies");
  }

  // Root steps = steps with no dependencies
  const rootSteps = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) rootSteps.push(id);
  }

  return { steps: stepMap, edges, rootSteps };
}

// ═══════════════════════════════════════════════════════════
// DAG Executor — Parallel where possible
// ═══════════════════════════════════════════════════════════

/**
 * Execute a DAG of steps, running independent branches in parallel.
 *
 * @param {object} dag - From buildDag()
 * @param {Function} executeStep - (stepId, step) => Promise<{ success: boolean, output: unknown }>
 * @returns {Promise<Map<string, { success: boolean, output: unknown, durationMs: number }>>}
 */
export async function executeDag(dag, executeStep) {
  const results = new Map();
  const completed = new Set();
  const inDegree = new Map();
  const dependents = new Map();

  // Initialize tracking
  for (const [id] of dag.steps) {
    const step = dag.steps.get(id);
    inDegree.set(id, step.dependsOn?.length || 0);
    dependents.set(id, []);
  }

  for (const edge of dag.edges) {
    dependents.get(edge.from).push(edge.to);
  }

  /**
   * Execute a single step and then check if its dependents can now run.
   */
  async function runStep(stepId) {
    const step = dag.steps.get(stepId);
    const startMs = Date.now();

    try {
      const output = await executeStep(stepId, step);
      results.set(stepId, { success: true, output, durationMs: Date.now() - startMs });
    } catch (err) {
      results.set(stepId, { success: false, output: err.message, durationMs: Date.now() - startMs });

      // Handle failure based on step policy
      if (step.onFailure === "abort") {
        throw err; // Propagate to abort entire workflow
      }
      // "skip" and "retry" and "fallback" are handled by the caller
    }

    completed.add(stepId);

    // Check which dependents can now run
    const runnable = [];
    for (const depId of dependents.get(stepId)) {
      const newDegree = inDegree.get(depId) - 1;
      inDegree.set(depId, newDegree);
      if (newDegree === 0) {
        runnable.push(depId);
      }
    }

    // Run all newly-runnable steps in parallel
    if (runnable.length > 0) {
      await Promise.all(runnable.map(runStep));
    }
  }

  // Start with root steps — run in parallel
  if (dag.rootSteps.length > 0) {
    await Promise.all(dag.rootSteps.map(runStep));
  }

  return results;
}

// ═══════════════════════════════════════════════════════════
// Predefined Workflows
// ═══════════════════════════════════════════════════════════

/**
 * Standard Engineering Audit Pipeline.
 *
 * Repository Scan → Architecture Scan → Security Scan → Quality Scan → Testing Scan → Health Dashboard
 *                                      ↘ Performance Scan ↗
 */
export const AUDIT_WORKFLOW = {
  id: "engineering-audit",
  name: "Engineering Audit Pipeline",
  description: "Full repository audit — runs architecture, security, quality, performance, and testing scans in parallel where possible.",
  steps: [
    { id: "repository-scan",       name: "Repository Scan",       agentId: "repository-intelligence", skillIds: [], dependsOn: [], timeoutMs: 120000, retryCount: 2, onFailure: "abort", fallbackStepId: null },
    { id: "architecture-scan",     name: "Architecture Scan",     agentId: "repository-intelligence", skillIds: ["eng-architecture-review"], dependsOn: ["repository-scan"], timeoutMs: 60000, retryCount: 2, onFailure: "abort", fallbackStepId: null },
    { id: "security-scan",         name: "Security Scan",         agentId: "security-agent",          skillIds: ["eng-security-audit"],       dependsOn: ["repository-scan"], timeoutMs: 90000, retryCount: 2, onFailure: "abort", fallbackStepId: null },
    { id: "quality-scan",          name: "Quality Scan",          agentId: "code-quality",            skillIds: ["eng-code-review"],          dependsOn: ["architecture-scan"], timeoutMs: 120000, retryCount: 2, onFailure: "skip", fallbackStepId: null },
    { id: "performance-scan",      name: "Performance Scan",      agentId: "performance-agent",       skillIds: [],                           dependsOn: ["repository-scan"], timeoutMs: 60000, retryCount: 1, onFailure: "skip", fallbackStepId: null },
    { id: "testing-scan",          name: "Testing Scan",          agentId: "testing-agent",           skillIds: [],                           dependsOn: ["quality-scan"], timeoutMs: 90000, retryCount: 2, onFailure: "skip", fallbackStepId: null },
    { id: "governance-check",      name: "Governance Check",      agentId: "governance-engine",       skillIds: ["eng-governance-compliance"], dependsOn: ["security-scan", "quality-scan"], timeoutMs: 60000, retryCount: 0, onFailure: "abort", fallbackStepId: null },
    { id: "health-dashboard",      name: "Health Dashboard",      agentId: "repository-intelligence", skillIds: [],                           dependsOn: ["governance-check", "testing-scan", "performance-scan"], timeoutMs: 30000, retryCount: 1, onFailure: "skip", fallbackStepId: null },
  ],
};

/**
 * Architecture Review Pipeline.
 */
export const ARCHITECTURE_REVIEW_WORKFLOW = {
  id: "architecture-review",
  name: "Architecture Review Pipeline",
  description: "Validates architecture compliance — layer discipline, product boundaries, Core reuse, DDD alignment.",
  steps: [
    { id: "load-knowledge-graph",  name: "Load Knowledge Graph",  agentId: "repository-intelligence", skillIds: [], dependsOn: [], timeoutMs: 30000, retryCount: 2, onFailure: "abort", fallbackStepId: null },
    { id: "check-layer-discipline",name: "Layer Discipline",      agentId: "chief-architect",         skillIds: ["eng-architecture-review"], dependsOn: ["load-knowledge-graph"], timeoutMs: 60000, retryCount: 1, onFailure: "abort", fallbackStepId: null },
    { id: "check-boundaries",      name: "Product Boundaries",    agentId: "chief-architect",         skillIds: ["eng-architecture-review"], dependsOn: ["load-knowledge-graph"], timeoutMs: 60000, retryCount: 1, onFailure: "skip", fallbackStepId: null },
    { id: "check-dependencies",    name: "Dependency Analysis",   agentId: "repository-intelligence", skillIds: [],                           dependsOn: ["load-knowledge-graph"], timeoutMs: 45000, retryCount: 1, onFailure: "skip", fallbackStepId: null },
    { id: "generate-report",       name: "Generate Report",       agentId: "chief-architect",         skillIds: ["eng-architecture-review"], dependsOn: ["check-layer-discipline", "check-boundaries", "check-dependencies"], timeoutMs: 30000, retryCount: 0, onFailure: "abort", fallbackStepId: null },
  ],
};

/**
 * Release Validation Pipeline.
 */
export const RELEASE_VALIDATION_WORKFLOW = {
  id: "release-validation",
  name: "Release Validation Pipeline",
  description: "Pre-release gate — validates all governance rules, runs security audit, checks compliance.",
  steps: [
    { id: "governance-gate",       name: "Governance Gate",       agentId: "governance-engine",       skillIds: ["eng-governance-compliance"], dependsOn: [], timeoutMs: 30000, retryCount: 0, onFailure: "abort", fallbackStepId: null },
    { id: "security-audit",        name: "Security Audit",        agentId: "security-agent",          skillIds: ["eng-security-audit"],       dependsOn: [], timeoutMs: 90000, retryCount: 1, onFailure: "abort", fallbackStepId: null },
    { id: "typecheck",             name: "TypeScript Check",      agentId: "code-quality",            skillIds: [],                           dependsOn: [], timeoutMs: 120000, retryCount: 0, onFailure: "abort", fallbackStepId: null },
    { id: "test-suite",            name: "Test Suite",            agentId: "testing-agent",           skillIds: [],                           dependsOn: ["typecheck"], timeoutMs: 300000, retryCount: 1, onFailure: "abort", fallbackStepId: null },
    { id: "release-decision",      name: "Release Decision",      agentId: "chief-architect",         skillIds: [],                           dependsOn: ["governance-gate", "security-audit", "test-suite"], timeoutMs: 10000, retryCount: 0, onFailure: "abort", fallbackStepId: null },
  ],
};

// ═══════════════════════════════════════════════════════════
// Workflow Registry
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, object>} */
const workflows = new Map();

/**
 * Register a workflow definition.
 * @param {object} workflow
 */
export function registerWorkflow(workflow) {
  buildDag(workflow.steps); // Validate DAG on registration
  workflows.set(workflow.id, workflow);

  emit("workflow.registered", { workflowId: workflow.id }, { source: "workflow-engine" });
}

/**
 * Execute a registered workflow.
 * @param {string} workflowId
 * @param {Function} executeStep
 * @returns {Promise<Map>}
 */
export async function executeWorkflow(workflowId, executeStep) {
  const workflow = workflows.get(workflowId);
  if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);

  emit("workflow.execution_started", { workflowId }, { source: "workflow-engine" });

  const dag = buildDag(workflow.steps);
  const results = await executeDag(dag, executeStep);

  emit("workflow.execution_completed", { workflowId, stepCount: results.size }, { source: "workflow-engine" });

  return results;
}

// Register standard workflows
registerWorkflow(AUDIT_WORKFLOW);
registerWorkflow(ARCHITECTURE_REVIEW_WORKFLOW);
registerWorkflow(RELEASE_VALIDATION_WORKFLOW);

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  buildDag,
  executeDag,
  registerWorkflow,
  executeWorkflow,
  AUDIT_WORKFLOW,
  ARCHITECTURE_REVIEW_WORKFLOW,
  RELEASE_VALIDATION_WORKFLOW,
};
