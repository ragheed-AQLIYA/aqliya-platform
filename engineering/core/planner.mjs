/**
 * AEOS Platform Core — Planner
 *
 * Transforms strategic goals into executable plans:
 *   Goal → Objective → Epic → Capability → Story → Task → Execution
 *
 * This enables AEOS to autonomously plan engineering work, not just execute
 * pre-defined workflows. The planner decomposes high-level goals into
 * concrete, executable tasks with dependencies.
 *
 * @module core/planner
 * @version 1.0.0
 */

import { emit } from "../../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// Planning Hierarchy
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, object>} */
const goals = new Map();

/** @type {Map<string, object>} */
const objectives = new Map();

/** @type {Map<string, object>} */
const epics = new Map();

/** @type {Map<string, object>} */
const stories = new Map();

/** @type {Map<string, object>} */
const tasks = new Map();

// ═══════════════════════════════════════════════════════════
// Goal
// ═══════════════════════════════════════════════════════════

/**
 * Define a strategic goal.
 * A goal is a high-level business or engineering outcome.
 *
 * @param {object} goal
 * @param {string} goal.id
 * @param {string} goal.title
 * @param {string} goal.description
 * @param {string} goal.owner
 * @param {"engineering"|"architecture"|"security"|"product"|"quality"|"operational"} goal.category
 * @param {number} goal.priority - 1-5
 * @returns {object}
 */
export function defineGoal({ id, title, description, owner, category, priority = 3 }) {
  const goal = { id, title, description, owner, category, priority, status: "active", objectiveIds: [], createdAt: new Date().toISOString() };
  goals.set(id, goal);
  emit("planner.goal_defined", { goalId: id, title }, { source: "planner" });
  return goal;
}

export function getGoal(id) { return goals.get(id) || null; }
export function listGoals(filter = {}) {
  let results = [...goals.values()];
  if (filter.category) results = results.filter((g) => g.category === filter.category);
  if (filter.status) results = results.filter((g) => g.status === filter.status);
  return results;
}

// ═══════════════════════════════════════════════════════════
// Objective (under a Goal)
// ═══════════════════════════════════════════════════════════

export function defineObjective({ id, goalId, title, description, successCriteria = [], priority = 3 }) {
  if (!goals.has(goalId)) throw new Error(`Goal not found: ${goalId}`);
  const obj = { id, goalId, title, description, successCriteria, priority, status: "active", epicIds: [], createdAt: new Date().toISOString() };
  objectives.set(id, obj);
  goals.get(goalId).objectiveIds.push(id);
  emit("planner.objective_defined", { objectiveId: id, goalId, title }, { source: "planner" });
  return obj;
}

export function getObjective(id) { return objectives.get(id) || null; }
export function listObjectives(goalId) {
  return [...objectives.values()].filter((o) => o.goalId === goalId);
}

// ═══════════════════════════════════════════════════════════
// Epic (under an Objective)
// ═══════════════════════════════════════════════════════════

export function defineEpic({ id, objectiveId, title, description, capabilityId = null, estimatedWeeks = 1, priority = 3 }) {
  if (!objectives.has(objectiveId)) throw new Error(`Objective not found: ${objectiveId}`);
  const epic = { id, objectiveId, title, description, capabilityId, estimatedWeeks, priority, status: "planned", storyIds: [], createdAt: new Date().toISOString() };
  epics.set(id, epic);
  objectives.get(objectiveId).epicIds.push(id);
  emit("planner.epic_defined", { epicId: id, objectiveId, title }, { source: "planner" });
  return epic;
}

export function getEpic(id) { return epics.get(id) || null; }

// ═══════════════════════════════════════════════════════════
// Story (under an Epic — maps to Capability)
// ═══════════════════════════════════════════════════════════

export function defineStory({ id, epicId, title, description, capabilityId, acceptanceCriteria = [], priority = 3 }) {
  if (!epics.has(epicId)) throw new Error(`Epic not found: ${epicId}`);
  const story = { id, epicId, title, description, capabilityId, acceptanceCriteria, priority, status: "backlog", taskIds: [], createdAt: new Date().toISOString() };
  stories.set(id, story);
  epics.get(epicId).storyIds.push(id);
  emit("planner.story_defined", { storyId: id, epicId, title }, { source: "planner" });
  return story;
}

export function getStory(id) { return stories.get(id) || null; }

// ═══════════════════════════════════════════════════════════
// Task (executable unit under a Story)
// ═══════════════════════════════════════════════════════════

export function defineTask({ id, storyId, title, description, agentId, skillIds = [], estimatedMinutes = 30, dependencies = [], priority = 3 }) {
  if (!stories.has(storyId)) throw new Error(`Story not found: ${storyId}`);
  const task = { id, storyId, title, description, agentId, skillIds, estimatedMinutes, dependencies, dependents: [], priority, status: "backlog", createdAt: new Date().toISOString() };

  // Update dependency relationships
  for (const depId of dependencies) {
    const dep = tasks.get(depId);
    if (dep) dep.dependents.push(id);
  }

  tasks.set(id, task);
  stories.get(storyId).taskIds.push(id);
  emit("planner.task_defined", { taskId: id, storyId, title, agentId }, { source: "planner" });
  return task;
}

export function getTask(id) { return tasks.get(id) || null; }

// ═══════════════════════════════════════════════════════════
// Planning — Decompose Goal → Execution Plan
// ═══════════════════════════════════════════════════════════

/**
 * Decompose a goal into a full execution plan.
 * Traverses: Goal → Objectives → Epics → Stories → Tasks
 *
 * @param {string} goalId
 * @returns {{ goal: object, objectives: Array, epics: Array, stories: Array, tasks: Array, totalTasks: number, totalEstimatedHours: number }}
 */
export function getExecutionPlan(goalId) {
  const goal = goals.get(goalId);
  if (!goal) throw new Error(`Goal not found: ${goalId}`);

  const planObjectives = (goal.objectiveIds || []).map((oid) => objectives.get(oid)).filter(Boolean);

  const planEpics = [];
  const planStories = [];
  const planTasks = [];

  for (const obj of planObjectives) {
    for (const eid of obj.epicIds || []) {
      const epic = epics.get(eid);
      if (!epic) continue;
      planEpics.push(epic);

      for (const sid of epic.storyIds || []) {
        const story = stories.get(sid);
        if (!story) continue;
        planStories.push(story);

        for (const tid of story.taskIds || []) {
          const task = tasks.get(tid);
          if (task) planTasks.push(task);
        }
      }
    }
  }

  const totalMinutes = planTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

  return {
    goal: { id: goal.id, title: goal.title, category: goal.category, priority: goal.priority },
    objectives: planObjectives.map((o) => ({ id: o.id, title: o.title, epicCount: o.epicIds?.length || 0 })),
    epics: planEpics.map((e) => ({ id: e.id, title: e.title, storyCount: e.storyIds?.length || 0 })),
    stories: planStories.map((s) => ({ id: s.id, title: s.title, taskCount: s.taskIds?.length || 0 })),
    tasks: planTasks.map((t) => ({ id: t.id, title: t.title, agentId: t.agentId, skillIds: t.skillIds, estimatedMinutes: t.estimatedMinutes })),
    totalTasks: planTasks.length,
    totalEstimatedHours: Math.round((totalMinutes / 60) * 10) / 10,
  };
}

/**
 * Generate a Task DAG from all tasks (respecting dependencies).
 * @returns {{ nodes: Map, edges: Array }}
 */
export function getTaskDag() {
  const nodes = new Map(tasks);
  const edges = [];

  for (const task of tasks.values()) {
    for (const depId of task.dependencies || []) {
      edges.push({ from: depId, to: task.id });
    }
  }

  return { nodes, edges };
}

// ═══════════════════════════════════════════════════════════
// Pre-defined Goals
// ═══════════════════════════════════════════════════════════

defineGoal({
  id: "goal-platform-completion",
  title: "AEOS Platform Completion",
  description: "Complete all AEOS platform modules to reach full autonomous capability.",
  owner: "Architecture Division",
  category: "engineering",
  priority: 5,
});

defineObjective({
  id: "obj-contract-first",
  goalId: "goal-platform-completion",
  title: "Establish Contract-First Architecture",
  description: "Define all platform contracts before building engines.",
  successCriteria: ["All 12 contracts defined", "No circular dependencies", "Contracts are pure interfaces"],
  priority: 5,
});

defineObjective({
  id: "obj-self-improving",
  goalId: "goal-platform-completion",
  title: "Enable Self-Improving Cycles",
  description: "Every cycle must produce reusable knowledge and skills.",
  successCriteria: ["Skills auto-extracted", "Memory updated each cycle", "Health score trending up"],
  priority: 4,
});

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  defineGoal, getGoal, listGoals,
  defineObjective, getObjective, listObjectives,
  defineEpic, getEpic,
  defineStory, getStory,
  defineTask, getTask,
  getExecutionPlan,
  getTaskDag,
};
