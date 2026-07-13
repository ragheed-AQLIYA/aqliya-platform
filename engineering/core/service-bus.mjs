/**
 * AEOS Platform Core — Service Bus (CQRS-lite)
 *
 * Separates system communication into three distinct buses:
 *
 *   Command Bus: "Do something"
 *     - Commands have exactly ONE handler
 *     - Commands can be rejected
 *     - Commands are idempotent (same command = same result)
 *     - Example: ExecuteArchitectureReview, RegisterAgent, InvalidateCache
 *
 *   Query Bus: "Get something"
 *     - Queries have exactly ONE handler
 *     - Queries return data
 *     - Queries have NO side effects
 *     - Example: GetAgentState, ListSkills, GetHealthScore
 *
 *   Event Bus: "Something happened"
 *     - Events have ZERO or MANY handlers
 *     - Events are fire-and-forget
 *     - Events are past-tense
 *     - Example: AgentCompleted, SkillUsed, CycleStarted
 *
 * @module core/service-bus
 * @version 1.0.0
 */

import { emit as emitEvent, on as onEvent, EVENTS } from "../../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// Command Bus
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, Function>} commandName → handler */
const commandHandlers = new Map();

/**
 * Register a command handler.
 * Each command type has exactly ONE handler.
 *
 * @param {string} commandName - e.g., "ExecuteArchitectureReview"
 * @param {Function} handler - (command) => Promise<{ success: boolean, output?: any, error?: string }>
 */
export function registerCommand(commandName, handler) {
  if (commandHandlers.has(commandName)) {
    throw new Error(`Command handler already registered: ${commandName}`);
  }
  commandHandlers.set(commandName, handler);
}

/**
 * Send a command for execution.
 * Commands are processed synchronously (await the result).
 *
 * @param {string} commandName
 * @param {object} payload
 * @param {{ agentId?: string, cycleId?: string, idempotencyKey?: string }} [meta]
 * @returns {Promise<{ success: boolean, output?: any, error?: string, commandId: string }>}
 */
export async function sendCommand(commandName, payload, meta = {}) {
  const handler = commandHandlers.get(commandName);
  if (!handler) {
    return { success: false, error: `No handler registered for command: ${commandName}`, commandId: "unknown" };
  }

  const commandId = `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startMs = Date.now();

  emitEvent("command.received", { commandName, commandId, agentId: meta.agentId }, { source: "service-bus" });

  try {
    const result = await handler({ ...payload, _commandId: commandId, _agentId: meta.agentId, _cycleId: meta.cycleId });
    emitEvent("command.completed", { commandName, commandId, durationMs: Date.now() - startMs }, { source: "service-bus" });
    return { success: true, output: result, commandId };
  } catch (err) {
    emitEvent("command.failed", { commandName, commandId, error: err.message, durationMs: Date.now() - startMs }, { source: "service-bus" });
    return { success: false, error: err.message, commandId };
  }
}

/**
 * List all registered commands.
 * @returns {string[]}
 */
export function listCommands() {
  return [...commandHandlers.keys()];
}

// ═══════════════════════════════════════════════════════════
// Query Bus
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, Function>} queryName → handler */
const queryHandlers = new Map();

/**
 * Register a query handler.
 * Queries return data and MUST NOT have side effects.
 *
 * @param {string} queryName - e.g., "GetAgentState", "ListPolicies"
 * @param {Function} handler - (query) => Promise<any>
 */
export function registerQuery(queryName, handler) {
  if (queryHandlers.has(queryName)) {
    throw new Error(`Query handler already registered: ${queryName}`);
  }
  queryHandlers.set(queryName, handler);
}

/**
 * Execute a query.
 * Queries are processed synchronously and return data.
 *
 * @param {string} queryName
 * @param {object} [params]
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function sendQuery(queryName, params = {}) {
  const handler = queryHandlers.get(queryName);
  if (!handler) {
    return { success: false, error: `No handler registered for query: ${queryName}` };
  }

  try {
    const data = await handler(params);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * List all registered queries.
 * @returns {string[]}
 */
export function listQueries() {
  return [...queryHandlers.keys()];
}

// ═══════════════════════════════════════════════════════════
// Event Bus (delegates to kernel event engine)
// ═══════════════════════════════════════════════════════════

export { EVENTS, emitEvent as emit, onEvent as on };

// ═══════════════════════════════════════════════════════════
// Pre-register Standard Commands
// ═══════════════════════════════════════════════════════════

// These are placeholder registrations. Actual handlers are registered
// by the platform bootstrap when modules are wired.

registerCommand("ExecuteArchitectureReview", async (cmd) => {
  return { status: "queued", workflowId: "architecture-review", agentId: cmd._agentId };
});

registerCommand("RunSecurityAudit", async (cmd) => {
  return { status: "queued", workflowId: "security-audit", agentId: cmd._agentId };
});

registerCommand("RunFullAuditCycle", async (cmd) => {
  return { status: "queued", workflowId: "engineering-audit", agentId: cmd._agentId };
});

registerCommand("RunReleaseValidation", async (cmd) => {
  return { status: "queued", workflowId: "release-validation", agentId: cmd._agentId };
});

registerCommand("RegisterAgent", async (cmd) => {
  return { status: "registered", agentId: cmd.agentId || "unknown" };
});

registerCommand("ExtractSkill", async (cmd) => {
  return { status: "extracted", skillName: cmd.skillName || "unknown" };
});

// Standard Queries
registerQuery("GetAgentState", async (params) => {
  return { agentId: params.agentId, state: "idle" };
});

registerQuery("ListAgents", async () => {
  return { agents: [], total: 0 };
});

registerQuery("GetHealthScore", async () => {
  return { overall: 82, components: {} };
});

registerQuery("GetCycleHistory", async (params) => {
  return { cycles: [], total: 0 };
});

registerQuery("ListSkills", async () => {
  return { skills: [], total: 0 };
});

registerQuery("GetDependencyGraph", async (params) => {
  return { nodes: [], edges: [], rootNode: params.rootToken || null };
});

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  registerCommand,
  sendCommand,
  listCommands,
  registerQuery,
  sendQuery,
  listQueries,
  emit,
  on,
  EVENTS,
};
