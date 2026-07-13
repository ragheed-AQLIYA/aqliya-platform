/**
 * AEOS Kernel — Event Engine
 *
 * Cross-engine communication bus. All kernel engines communicate
 * through events, never through direct function calls.
 *
 * @module kernel/event-engine
 * @version 1.1
 */

// ─── Event Bus ──────────────────────────────────────────

/** @type {Map<string, Set<Function>>} */
const listeners = new Map();

/** @type {Array<{ event: string, payload: any, timestamp: string }>} */
const eventLog = [];

const MAX_EVENT_LOG = 1000;

// ─── Core API ───────────────────────────────────────────

/**
 * Subscribe to an event.
 * @param {string} event - Event name (e.g., "agent.dispatched")
 * @param {Function} handler - Callback receiving (payload, eventMeta)
 * @returns {Function} Unsubscribe function
 */
export function on(event, handler) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event).add(handler);
  return () => listeners.get(event)?.delete(handler);
}

/**
 * Subscribe to an event once.
 * @param {string} event
 * @param {Function} handler
 */
export function once(event, handler) {
  const wrapper = (payload, meta) => {
    handler(payload, meta);
    off(event, wrapper);
  };
  on(event, wrapper);
}

/**
 * Unsubscribe from an event.
 * @param {string} event
 * @param {Function} handler
 */
export function off(event, handler) {
  listeners.get(event)?.delete(handler);
}

/**
 * Emit an event to all listeners.
 * @param {string} event
 * @param {any} payload
 * @param {{ source?: string, cycleId?: string }} [meta]
 */
export function emit(event, payload, meta = {}) {
  const eventMeta = {
    timestamp: new Date().toISOString(),
    source: meta.source || "kernel",
    cycleId: meta.cycleId || null,
  };

  // Log event
  eventLog.push({ event, payload, timestamp: eventMeta.timestamp });
  if (eventLog.length > MAX_EVENT_LOG) {
    eventLog.shift();
  }

  // Notify listeners
  const handlers = listeners.get(event);
  if (handlers) {
    for (const handler of handlers) {
      try {
        handler(payload, eventMeta);
      } catch (err) {
        console.error(`[EventEngine] Handler error for "${event}":`, err.message);
      }
    }
  }

  // Also notify wildcard listeners
  const wildcardHandlers = listeners.get("*");
  if (wildcardHandlers) {
    for (const handler of wildcardHandlers) {
      try {
        handler({ event, payload }, eventMeta);
      } catch (err) {
        // Wildcard handler errors are non-fatal
      }
    }
  }
}

// ─── Query ──────────────────────────────────────────────

/**
 * Get recent events, optionally filtered.
 * @param {{ event?: string, since?: string, limit?: number }} [filter]
 * @returns {Array}
 */
export function getEventLog(filter = {}) {
  let results = [...eventLog];

  if (filter.event) {
    results = results.filter((e) => e.event === filter.event);
  }
  if (filter.since) {
    results = results.filter((e) => e.timestamp >= filter.since);
  }

  results.reverse(); // newest first

  if (filter.limit) {
    results = results.slice(0, filter.limit);
  }

  return results;
}

/**
 * Count events by type.
 * @returns {Record<string, number>}
 */
export function countByEvent() {
  const counts = {};
  for (const entry of eventLog) {
    counts[entry.event] = (counts[entry.event] || 0) + 1;
  }
  return counts;
}

/**
 * Clear the event log (for testing).
 */
export function clearEventLog() {
  eventLog.length = 0;
}

/**
 * Get the number of active listeners for an event.
 * @param {string} event
 * @returns {number}
 */
export function listenerCount(event) {
  return listeners.get(event)?.size || 0;
}

// ─── Standard Events ────────────────────────────────────

export const EVENTS = {
  // Agent lifecycle
  AGENT_REGISTERED: "agent.registered",
  AGENT_DISPATCHED: "agent.dispatched",
  AGENT_RUNNING: "agent.running",
  AGENT_COMPLETED: "agent.completed",
  AGENT_FAILED: "agent.failed",
  AGENT_ARCHIVED: "agent.archived",

  // Skill lifecycle
  SKILL_REGISTERED: "skill.registered",
  SKILL_USED: "skill.used",
  SKILL_ACTIVATED: "skill.activated",
  SKILL_DEPRECATED: "skill.deprecated",

  // Governance
  GOVERNANCE_CHECKED: "governance.checked",
  GOVERNANCE_VIOLATED: "governance.violated",
  GOVERNANCE_PASSED: "governance.passed",
  GOVERNANCE_BLOCKED: "governance.blocked",

  // Cycle
  CYCLE_STARTED: "cycle.started",
  CYCLE_PHASE_CHANGED: "cycle.phase_changed",
  CYCLE_COMPLETED: "cycle.completed",

  // Memory
  MEMORY_UPDATED: "memory.updated",
  ADR_CREATED: "adr.created",
  PATTERN_ADDED: "pattern.added",
  ANTIPATTERN_FOUND: "antipattern.found",

  // Metrics
  METRIC_RECORDED: "metric.recorded",
  HEALTH_SCORE_CHANGED: "health_score.changed",
  TREND_DETECTED: "trend.detected",

  // Digital Twin
  DIGITAL_TWIN_SYNCED: "digital_twin.synced",
  DIGITAL_TWIN_DRIFT: "digital_twin.drift",

  // Knowledge
  KNOWLEDGE_GRAPH_UPDATED: "knowledge_graph.updated",
  RELATION_DISCOVERED: "relation.discovered",
};

// ─── Exports ────────────────────────────────────────────

export default {
  on,
  once,
  off,
  emit,
  getEventLog,
  countByEvent,
  clearEventLog,
  listenerCount,
  EVENTS,
};
