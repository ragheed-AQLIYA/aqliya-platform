/**
 * AEOS Platform Core — Contracts
 *
 * These are the PURE INTERFACES that define the AEOS platform.
 * No implementation. No dependencies on other contracts.
 * Every engine, plugin, and agent depends ONLY on these contracts.
 *
 * Version: 1.0.0
 * Principle: Contract-First — engines implement contracts, never each other.
 */

// ═══════════════════════════════════════════════════════════
// AGENT CONTRACT
// ═══════════════════════════════════════════════════════════

/** Unique agent identifier */
export type AgentId = string;

/** Agent priority level */
export type AgentPriority = "critical" | "high" | "medium" | "low";

/** Agent lifecycle state */
export type AgentState = "idle" | "queued" | "running" | "review" | "completed" | "failed" | "rejected" | "archived";

/** Agent permission for operations */
export type AgentPermission = "read" | "propose" | "approve" | "reject" | "block-release" | "block-execution" | "modify-docs" | "create-pr" | "create-skill" | "create-tests" | "modify-src" | "create-report" | "assign-tasks" | "create-adr";

/** Agent metadata (YAML-serializable) */
export interface AgentMetadata {
  /** Unique agent ID */
  id: AgentId;
  /** Human-readable name */
  name: string;
  /** AEOS architecture layer (1-12) */
  layer: number;
  /** Semantic version */
  version: string;
  /** Owning division/team */
  owner: string;
  /** Execution priority */
  priority: AgentPriority;
  /** Current lifecycle state */
  status: AgentState;
  /** Skills this agent can execute */
  skills: SkillId[];
  /** Agents this agent depends on */
  dependencies: AgentId[];
  /** Allowed operations */
  permissions: AgentPermission[];
  /** What this agent does */
  description: string;
  /** Runtime metrics */
  metrics: AgentMetrics;
}

/** Agent runtime metrics */
export interface AgentMetrics {
  successRate: number;         // 0-100
  tasksCompleted: number;
  avgCompletionTimeMs: number;
  lastActive: string | null;   // ISO timestamp
}

/** Agent execution context passed to every agent invocation */
export interface AgentContext {
  agentId: AgentId;
  cycleId: string;
  taskId: string;
  startedAt: string;
  permissions: AgentPermission[];
  evidenceLinks: string[];
}

// ═══════════════════════════════════════════════════════════
// SKILL CONTRACT
// ═══════════════════════════════════════════════════════════

export type SkillId = string;
export type SkillState = "draft" | "review" | "active" | "deprecated" | "retired" | "rejected";

export interface SkillMetadata {
  id: SkillId;
  name: string;
  version: string;
  status: SkillState;
  layer: number;
  owner: string;
  inputs: string[];
  outputs: string[];
  compatibleAgents: AgentId[];
  dependencies: SkillId[];
  qualityScore: number;       // 0-100
  successRate: number;         // 0-100
  timesUsed: number;
  lastUsed: string | null;
  avgExecutionTimeMs: number | null;
  hasTests: boolean;
  description: string;
}

export interface SkillExecutionInput {
  skillId: SkillId;
  agentId: AgentId;
  context: AgentContext;
  parameters: Record<string, unknown>;
}

export interface SkillExecutionOutput {
  skillId: SkillId;
  success: boolean;
  output: unknown;
  durationMs: number;
  qualityDelta: number;       // How this execution affects quality score
}

// ═══════════════════════════════════════════════════════════
// MEMORY CONTRACT
// ═══════════════════════════════════════════════════════════

/** Six memory types — each stores different kinds of knowledge */
export type MemoryType = "working" | "episodic" | "semantic" | "repository" | "decision" | "skill";

export interface MemoryEntry {
  id: string;
  type: MemoryType;
  cycleId: string;
  timestamp: string;
  ttl: number | null;          // null = permanent
  tags: string[];
  payload: Record<string, unknown>;
  relationships: MemoryRelation[];
}

export interface MemoryRelation {
  targetId: string;
  relationType: "derives_from" | "depends_on" | "contradicts" | "supports" | "references" | "supersedes";
  confidence: number;          // 0-1
}

export interface MemoryQuery {
  type?: MemoryType;
  tags?: string[];
  cycleId?: string;
  since?: string;
  limit?: number;
  relationTo?: string;
}

// ═══════════════════════════════════════════════════════════
// EVENT CONTRACT
// ═══════════════════════════════════════════════════════════

export type EventName = string;

export interface PlatformEvent {
  name: EventName;
  payload: unknown;
  timestamp: string;
  source: string;
  cycleId: string | null;
  idempotencyKey: string;     // Prevent duplicate processing
}

export type EventHandler = (event: PlatformEvent) => void | Promise<void>;

export interface EventSubscription {
  event: EventName;
  handler: EventHandler;
  subscriberId: string;
  priority: number;            // Higher = runs first
}

// ═══════════════════════════════════════════════════════════
// REGISTRY CONTRACT
// ═══════════════════════════════════════════════════════════

/** What can be registered in the universal registry */
export type RegistrableType = "agent" | "skill" | "policy" | "metric" | "plugin" | "workflow" | "product" | "capability";

export interface RegistryEntry<T = unknown> {
  id: string;
  type: RegistrableType;
  version: string;
  registeredAt: string;
  updatedAt: string;
  status: "active" | "inactive" | "deprecated";
  metadata: T;
  dependencies: string[];      // IDs of entries this depends on
  dependents: string[];        // IDs of entries that depend on this
}

export interface RegistryQuery {
  type?: RegistrableType;
  status?: "active" | "inactive" | "deprecated";
  tags?: string[];
  layer?: number;
  dependsOn?: string;
}

// ═══════════════════════════════════════════════════════════
// TASK CONTRACT
// ═══════════════════════════════════════════════════════════

export type TaskId = string;
export type TaskState = "backlog" | "planned" | "in_progress" | "in_review" | "done" | "blocked" | "cancelled";
export type TaskPriority = 1 | 2 | 3 | 4 | 5;  // 5 = highest

export interface Task {
  id: TaskId;
  title: string;
  description: string;
  state: TaskState;
  priority: TaskPriority;
  assignedTo: AgentId | null;
  requiredSkills: SkillId[];
  dependencies: TaskId[];      // Tasks that must complete first
  dependents: TaskId[];        // Tasks blocked by this one
  evidenceLinks: string[];
  estimatedDurationMs: number;
  actualDurationMs: number | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  tags: string[];
}

/** Directed Acyclic Graph of tasks */
export interface TaskGraph {
  tasks: Map<TaskId, Task>;
  edges: Array<{ from: TaskId; to: TaskId }>;
  rootTasks: TaskId[];          // Tasks with no dependencies
}

// ═══════════════════════════════════════════════════════════
// CYCLE CONTRACT
// ═══════════════════════════════════════════════════════════

export type CycleId = string;
export type CyclePhase = "init" | "scanning" | "analyzing" | "planning" | "executing" | "verifying" | "learning" | "completed";

export interface Cycle {
  id: CycleId;
  phase: CyclePhase;
  startedAt: string;
  completedAt: string | null;
  agentsInvolved: AgentId[];
  tasksCompleted: number;
  tasksFailed: number;
  skillsUsed: SkillId[];
  metricsSnapshot: Record<string, number>;
  healthScoreBefore: number;
  healthScoreAfter: number | null;
  findingsCount: number;
  findingsResolved: number;
}

// ═══════════════════════════════════════════════════════════
// GOVERNANCE CONTRACT
// ═══════════════════════════════════════════════════════════

export type PolicyId = string;
export type RuleId = string;
export type RuleSeverity = "BLOCK" | "WARN";

export interface GovernancePolicy {
  id: PolicyId;
  name: string;
  description: string;
  version: string;
  rules: RuleId[];
  scope: "global" | "product" | "module";
  enforcement: "pre-commit" | "pre-merge" | "pre-release" | "continuous";
}

export interface GovernanceRule {
  id: RuleId;
  policyId: PolicyId;
  name: string;
  description: string;
  severity: RuleSeverity;
  check: string;               // Human-readable check description
  currentScore: number;        // 0-100
  trend: "improving" | "declining" | "stable";
  lastAudited: string;
}

export interface GovernanceEvidence {
  id: string;
  ruleId: RuleId;
  cycleId: string;
  finding: string;
  location: string;            // File path or module
  severity: RuleSeverity;
  timestamp: string;
  resolved: boolean;
  resolvedAt: string | null;
}

export interface GovernanceDecision {
  id: string;
  ruleId: RuleId;
  evidenceIds: string[];
  decision: "approve" | "reject" | "waive" | "defer";
  rationale: string;
  decidedBy: AgentId;
  decidedAt: string;
  expiresAt: string | null;    // For temporary waivers
}

// ═══════════════════════════════════════════════════════════
// METRIC CONTRACT
// ═══════════════════════════════════════════════════════════

export type MetricId = string;
export type MetricCategory = "architecture" | "quality" | "security" | "performance" | "testing" | "governance" | "documentation" | "engineering" | "knowledge" | "ai";

export interface MetricDefinition {
  id: MetricId;
  name: string;
  category: MetricCategory;
  unit: string;
  direction: "higher_is_better" | "lower_is_better";
  baseline: number;
  target: number;
  description: string;
}

export interface MetricReading {
  metricId: MetricId;
  value: number;
  cycleId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface HealthScore {
  overall: number;             // 0-100
  components: Record<MetricCategory, number>;
  trend: "improving" | "declining" | "stable";
  cycleId: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════
// PLUGIN CONTRACT
// ═══════════════════════════════════════════════════════════

export type PluginId = string;

export interface PluginManifest {
  id: PluginId;
  name: string;
  version: string;
  type: RegistrableType;
  description: string;
  author: string;
  dependencies: PluginId[];
  provides: string[];          // What capabilities this plugin provides
  consumes: string[];          // What capabilities this plugin needs
  config: Record<string, unknown>;
}

export interface PluginLifecycle {
  onRegister: () => Promise<void>;
  onActivate: () => Promise<void>;
  onDeactivate: () => Promise<void>;
  onUnregister: () => Promise<void>;
  healthCheck: () => Promise<{ healthy: boolean; details: string }>;
}

// ═══════════════════════════════════════════════════════════
// WORKFLOW CONTRACT
// ═══════════════════════════════════════════════════════════

export type WorkflowId = string;
export type StepId = string;

export interface WorkflowStep {
  id: StepId;
  name: string;
  description: string;
  agentId: AgentId;
  skillIds: SkillId[];
  dependsOn: StepId[];         // Steps that must complete first
  timeoutMs: number;
  retryCount: number;
  onFailure: "abort" | "skip" | "retry" | "fallback";
  fallbackStepId: StepId | null;
}

export interface Workflow {
  id: WorkflowId;
  name: string;
  description: string;
  version: string;
  steps: WorkflowStep[];
  /** Get the DAG of steps for parallel execution planning */
  getDag(): { steps: Map<StepId, WorkflowStep>; edges: Array<{ from: StepId; to: StepId }>; rootSteps: StepId[] };
}

export interface WorkflowExecution {
  workflowId: WorkflowId;
  cycleId: string;
  startedAt: string;
  completedAt: string | null;
  stepResults: Map<StepId, { success: boolean; output: unknown; durationMs: number | null }>;
  overallSuccess: boolean | null;
}

// ═══════════════════════════════════════════════════════════
// DIGITAL TWIN CONTRACT
// ═══════════════════════════════════════════════════════════

/** Each layer of the Digital Twin can be versioned independently */
export interface TwinLayer {
  name: string;
  version: number;             // Incremented on change
  lastScanned: string;
  entities: Record<string, unknown>;
}

export interface DigitalTwin {
  twinId: string;
  cycleId: string;
  generatedAt: string;
  repositorySnapshot: {
    sourceFiles: number;
    testFiles: number;
    docsFiles: number;
    prismaModels: number;
    dependencies: number;
  };
  layers: {
    repository: TwinLayer;
    products: TwinLayer;
    domains: TwinLayer;
    modules: TwinLayer;
    entities: TwinLayer;
    apis: TwinLayer;
    routes: TwinLayer;
    events: TwinLayer;
    dependencies: TwinLayer;
    tests: TwinLayer;
    metrics: TwinLayer;
  };
}

// ═══════════════════════════════════════════════════════════
// COLLABORATION PROTOCOL
// ═══════════════════════════════════════════════════════════

export interface CollaborationRequest {
  id: string;
  fromAgent: AgentId;
  toAgent: AgentId;
  type: "review" | "approve" | "inform" | "delegate";
  context: AgentContext;
  payload: unknown;
  priority: AgentPriority;
  deadline: string | null;
}

export interface CollaborationResponse {
  requestId: string;
  fromAgent: AgentId;
  decision: "approve" | "reject" | "request_changes" | "acknowledge";
  evidence: GovernanceEvidence[];
  recommendation: string;
  rationale: string;
  respondedAt: string;
}

// ═══════════════════════════════════════════════════════════
// CAPABILITY SYSTEM
// ═══════════════════════════════════════════════════════════

export type CapabilityId = string;
export type ProcedureId = string;
export type ActionId = string;

export interface Capability {
  id: CapabilityId;
  name: string;
  description: string;
  skills: SkillId[];
  procedures: ProcedureId[];
  maturityLevel: number;       // 0-6
}

export interface Procedure {
  id: ProcedureId;
  capabilityId: CapabilityId;
  name: string;
  steps: ActionId[];
  estimatedDurationMs: number;
  requiredSkills: SkillId[];
}

export interface Action {
  id: ActionId;
  name: string;
  description: string;
  agentId: AgentId;
  skillId: SkillId;
  parameters: Record<string, unknown>;
  expectedOutput: string;
}
