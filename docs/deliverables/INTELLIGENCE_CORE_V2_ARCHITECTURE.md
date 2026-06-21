# Intelligence Core v2 Architecture

**Version:** 2.0  
**Status:** Architectural target — not yet implemented  
**Based on:** Intelligence Core Map (INTELLIGENCE_CORE_MAP.md) and Duplication Analysis (INTELLIGENCE_DUPLICATION_REPORT.md)

---

## Architecture Principle

```
Products emit events → Core processes → Products consume results
Products never call Core internals directly
Core never depends on any product
```

---

## Module Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AQLIYA INTELLIGENCE CORE v2                      │
│                                                                     │
│  ┌────────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐  │
│  │  Knowledge  │ │ Evidence │ │Governance│ │  Audit   │ │  Policy │  │
│  │   Engine    │ │  Engine  │ │  Engine  │ │  Engine  │ │  Engine │  │
│  └────────────┘ └──────────┘ └─────────┘ └──────────┘ └─────────┘  │
│                                                                     │
│  ┌────────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐  │
│  │  Workflow  │ │ Decision │ │   AI    │ │Instit.   │ │ Signal  │  │
│  │   Engine   │ │  Engine  │ │Execution│ │ Memory   │ │ Engine  │  │
│  └────────────┘ └──────────┘ └─────────┘ └──────────┘ └─────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     EVENT BUS (future)                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              SHARED CONTRACTS & TYPES                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module Definitions

### 1. Knowledge Engine

**Purpose:** Single authority for knowledge ingestion, storage, retrieval, and governance across all products.

**Current State:** Fragmented across RAG pipeline, knowledge-foundation, product-specific knowledge engines.

**Target Location:** `src/lib/core/knowledge/`

**Interfaces:**
```typescript
interface KnowledgeEngine {
  ingest(input: KnowledgeIngestInput): Promise<KnowledgeIngestResult>
  search(query: SearchQuery): Promise<KnowledgeSearchResult[]>
  getDocument(docId: string): Promise<KnowledgeDocument>
  deleteDocument(docId: string): Promise<void>
  getMetrics(): Promise<KnowledgeMetrics>
}

interface KnowledgeIngestInput {
  organizationId: string
  documentId: string
  content: string
  metadata?: Record<string, unknown>
  productKey?: string
  sourceType?: string
  sensitivity?: string
  userId?: string
}

interface SearchQuery {
  text: string
  organizationId: string
  productKeys?: string[]
  limit?: number
  minConfidence?: number
  mode?: "vector" | "hybrid" | "lexical"
}
```

**Inputs:** Documents, embeddings, governance metadata
**Outputs:** Search results, evidence references, confidence scores
**Dependencies:** Evidence Engine (for provenance), Audit Engine (for logging), Policy Engine (for retention)
**Ownership:** `CODEOWNERS: @core-knowledge`

---

### 2. Evidence Engine

**Purpose:** Canonical evidence registry — every piece of evidence across all products is registered here, linked to its source, and traceable through audit.

**Current State:** STUB in `src/lib/platform/evidence/` (5 lines). 9 product-specific evidence models in Prisma.

**Target Location:** `src/lib/core/evidence/`

**Interfaces:**
```typescript
interface EvidenceEngine {
  register(input: RegisterEvidenceInput): Promise<EvidenceRecord>
  get(evidenceId: string): Promise<EvidenceRecord>
  link(sourceId: string, targetId: string, relationship: string): Promise<void>
  getChain(sourceId: string): Promise<EvidenceChain>
  verify(evidenceId: string): Promise<VerificationResult>
}

interface EvidenceRecord {
  id: string
  organizationId: string
  sourceType: string
  sourceId: string
  contentType: string
  contentHash: string
  metadata: Record<string, unknown>
  createdBy: string
  createdAt: Date
  status: "registered" | "verified" | "contested" | "archived"
}
```

**Inputs:** Evidence registration requests from all products
**Outputs:** Verified evidence chains, provenance trails
**Dependencies:** Audit Engine, Knowledge Engine
**Ownership:** `CODEOWNERS: @core-evidence`

**Rationale:** 9 product-specific evidence models → 1 canonical engine with product metadata tags. Same data, same queries, same audit trail.

---

### 3. Governance Engine

**Purpose:** Central governance context, rule evaluation, escalation, approval workflows.

**Current State:** REAL in `src/lib/governance/` — retrieval-router (607 lines), runtime-types, approval-state, escalation, provenance, actor-lineage, prompt-framework.

**Target Location:** `src/lib/core/governance/` (move from current location, extend interfaces)

**Interfaces:**
```typescript
interface GovernanceEngine {
  getContext(taskType: GovernanceTaskType): GovernanceContext
  evaluateApproval(input: ApprovalInput): ApprovalResult
  evaluateEscalation(input: EscalationInput): EscalationResult
  checkPolicy(input: PolicyCheckInput): PolicyCheckResult
  recordProvenance(input: ProvenanceInput): void
}

interface GovernanceTaskType =
  | "trial_balance_upload" | "account_mapping" | "statement_drafting"
  | "notes_generation" | "evidence_review" | "audit_findings"
  | "commercial_claim_review" | "pilot_decision" | "approval_review"
  | "disclosure_enrichment" | "skill_execution" | "pattern_improvement"
  | "signal_processing" | "memory_link" | "cross_product_query"
```

**Inputs:** Task type, user context, organization context
**Outputs:** Governance context, approval state, escalation decision
**Dependencies:** Audit Engine, Policy Engine
**Ownership:** `CODEOWNERS: @core-governance`

---

### 4. Audit Engine

**Purpose:** Single authority for audit event writing, hash chain verification, and audit search across all products.

**Current State:** 4 overlapping implementations (audit-log.ts canonical, audit-logger.ts wrapper, audit-event-service.ts dupe, platform-audit.ts legacy). Hash chain in platform/audit/.

**Target Location:** `src/lib/core/audit/`

**Interfaces:**
```typescript
interface AuditEngine {
  write(event: AuditEvent): Promise<AuditResult>
  writeMany(events: AuditEvent[]): Promise<AuditResult[]>
  search(query: AuditSearchQuery): Promise<AuditSearchResult[]>
  getChain(auditLogId: string): Promise<HashChainProof>
  verifyChain(fromDate?: Date): Promise<ChainVerificationResult>
  getMetrics(): Promise<AuditMetrics>
}

// Single canonical event type — replaces all current input types
interface AuditEvent {
  productKey: string
  action: string
  organizationId?: string
  workspaceId?: string
  actorId: string
  actorName?: string
  targetType?: string
  targetId?: string
  severity?: string
  metadata?: Record<string, unknown>
  // AI-specific fields optional
  aiProvider?: string
  aiModel?: string
  // Evidence links
  evidenceRefs?: string[]
}
```

**Inputs:** Audit events from all products and core modules
**Outputs:** Written records, hash proofs, search results, verification
**Dependencies:** None (writes to Prisma independently)
**Ownership:** `CODEOWNERS: @core-audit`

---

### 5. Policy Engine

**Purpose:** Central policy evaluation for retention, access control, data governance, and compliance.

**Current State:** Fragmented across ABAC (policies + conditions), retention (per-model policies), and governance (doctrine references).

**Target Location:** `src/lib/core/policy/`

**Interfaces:**
```typescript
interface PolicyEngine {
  evaluateRetention(modelName: string): RetentionPolicy
  evaluateAccess(subject: Principal, resource: Resource): AccessDecision
  evaluateCompliance(orgId: string, domain: string): ComplianceResult
  getPolicies(type: PolicyType): Policy[]
}

interface Policy {
  id: string
  name: string
  type: "retention" | "access" | "governance" | "compliance"
  effect: "allow" | "deny" | "require" | "audit"
  conditions: PolicyCondition[]
  priority: number
}
```

**Inputs:** Policy evaluation requests
**Outputs:** Policy decisions with audit trail
**Dependencies:** Audit Engine
**Ownership:** `CODEOWNERS: @core-policy`

---

### 6. Workflow Engine

**Purpose:** Cross-product workflow execution — not tied to WorkflowOS templates, but a general workflow evaluation and state machine.

**Current State:** WorkflowOS has its own template-based workflow. Platform has a 5-line stub.

**Target Location:** `src/lib/core/workflow/`

**Interfaces:**
```typescript
interface WorkflowEngine {
  evaluateTransition(current: State, event: Event): State
  getAvailableActions(state: State): Action[]
  validateWorkflow(workflow: WorkflowDefinition): ValidationResult
  getWorkflowMetrics(orgId: string): WorkflowMetrics
}
```

**Inputs:** Workflow definitions, state transitions
**Outputs:** Next state, available actions, validation
**Dependencies:** Policy Engine, Audit Engine
**Ownership:** `CODEOWNERS: @core-workflow`

---

### 7. Decision Engine

**Purpose:** Central decision evaluation framework — not DecisionOS-specific, but a reusable multi-criteria decision engine.

**Current State:** REAL inside DecisionOS (`src/lib/decision/`). Currently product-specific but well-designed.

**Target Location:** `src/lib/core/decision/` (extract from DecisionOS, generalize)

**Interfaces:**
```typescript
interface DecisionEngine {
  evaluateIntake(input: DecisionIntake): DecisionIntakeResult
  evaluateFramework(framework: DecisionFramework): FrameworkResult
  evaluateScenarios(scenarios: Scenario[]): ScenarioResult[]
  evaluateRisk(risks: Risk[]): RiskResult
  generateRecommendation(input: RecommendationInput): Recommendation
  getDecisionMetrics(): DecisionMetrics
}
```

**Inputs:** Decision parameters, criteria, options
**Outputs:** Evaluated decisions, recommendations, risk assessments
**Dependencies:** Evidence Engine, Governance Engine, AI Execution Engine
**Ownership:** `CODEOWNERS: @core-decision`

---

### 8. AI Execution Engine

**Purpose:** Single point of AI execution with governance injection, provider selection, cost control, and audit.

**Current State:** REAL in `src/lib/ai/` — AIOrchestrator (383 lines), governedAIExecute (117 lines), provider system.

**Target Location:** `src/lib/core/ai/` (move from current location)

**Interfaces:**
```typescript
interface AIExecutionEngine {
  generate(request: AIExecutionRequest): Promise<AIExecutionResult>
  getCapabilities(): AICapability[]
  getMetrics(orgId?: string): AIMetrics
  isAvailable(providerId: string): boolean
}

interface AIExecutionRequest {
  taskType: GovernanceTaskType
  prompt: string
  organizationId: string
  userId: string
  productKey: string
  evidenceComplete: boolean
  preferProvider?: string
}

interface AIExecutionResult {
  output: string
  providerId: string
  modelVersion: string
  confidence: number
  requiresReview: boolean
  cost?: CostBreakdown
  auditId: string
  warnings: string[]
}
```

**Inputs:** AI execution requests with governance context
**Outputs:** AI-generated output with audit trail, provenance, cost tracking
**Dependencies:** Governance Engine, Audit Engine, Knowledge Engine (for RAG)
**Ownership:** `CODEOWNERS: @core-ai`

---

### 9. Institutional Memory Engine

**Purpose:** Cross-product entity graph — links people, decisions, documents, workflows, audit events into a queryable knowledge graph.

**Current State:** EXISTS in `src/lib/platform/institutional-memory/` (842 lines). Also `src/lib/ai/memory/institutional-memory.ts` (272 lines) overlapping.

**Target Location:** `src/lib/core/memory/`

**Interfaces:**
```typescript
interface InstitutionalMemoryEngine {
  createNode(input: NodeInput): Promise<Node>
  createEdge(input: EdgeInput): Promise<Edge>
  search(input: MemorySearchInput): Promise<SearchResult[]>
  getGraph(orgId: string, filters?: GraphFilters): Promise<GraphData>
  getHistory(entityId: string): Promise<HistoryEntry[]>
  getStats(orgId: string): Promise<MemoryStats>
  ingestDocument(input: IngestDocumentInput): Promise<IngestResult>
}
```

**Inputs:** Entity relationships, memory queries, document ingestion
**Outputs:** Graph data, search results, history chains
**Dependencies:** Knowledge Engine, Evidence Engine, Audit Engine
**Ownership:** `CODEOWNERS: @core-memory`

---

### 10. Signal Engine

**Purpose:** Unified cross-product signal collection, classification, alerting, and routing.

**Current State:** FRAGMENTED — platform/stubs, decision-specific signals, product-specific producers.

**Target Location:** `src/lib/core/signals/`

**Interfaces:**
```typescript
interface SignalEngine {
  produce(input: ProduceSignalInput): Promise<Signal>
  acknowledge(signalId: string, userId: string): Promise<void>
  getSignals(orgId: string, filters?: SignalFilters): Promise<Signal[]>
  getMetrics(orgId: string): Promise<SignalMetrics>
}

interface Signal {
  id: string
  organizationId: string
  productKey: string
  type: "risk" | "opportunity" | "alert" | "milestone" | "anomaly" | "reminder"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  sourceId: string
  sourceType: string
  status: "active" | "acknowledged" | "resolved"
  createdAt: Date
}
```

**Inputs:** Signal events from products
**Outputs:** Classified, routed signals
**Dependencies:** Governance Engine (for escalation), Audit Engine
**Ownership:** `CODEOWNERS: @core-signals`

---

## Module Dependency Matrix

```
                Know  Evid  Gov   Audit Pol   Wf    Dec   AI    Mem   Sig
Knowledge        -    Need  Need  Need  Need  -     -     Need  Need  -
Evidence        Need   -    Need  Need  Need  -     Need  Need  Need  -
Governance       -    Need   -    Need  Need  Need  Need  Need  -     Need
Audit            -     -     -     -     -     -     -     -     -     -
Policy           -     -    Need  Need   -    Need  Need  Need  -     Need
Workflow         -    Need  Need  Need  Need   -    Need  Need  Need  -
Decision         -    Need  Need  Need  Need   -     -    Need  Need  -
AI              Need  Need  Need  Need  Need   -     -     -    Need  -
Memory          Need  Need   -    Need   -     -    Need   -     -    -
Signal           -     -    Need  Need  Need   -     -     -     -     -
```

**Legend:** "Need" = module requires the column module. "-" = no direct dependency.

---

## Directory Structure (Target)

```
src/lib/core/
├── index.ts                    # Core module registry
├── contracts/                  # Shared contracts & types
│   ├── intelligence.ts         # Intelligence contracts (move from platform/)
│   ├── runtime-types.ts        # Runtime types (move from governance/)
│   └── index.ts
├── knowledge/                  # Knowledge Engine
│   ├── engine.ts
│   ├── ingestion.ts
│   ├── search.ts
│   └── index.ts
├── evidence/                   # Evidence Engine
│   ├── engine.ts
│   ├── registry.ts
│   ├── chain.ts
│   └── index.ts
├── governance/                 # Governance Engine
│   ├── engine.ts
│   ├── approval.ts
│   ├── escalation.ts
│   ├── provenance.ts
│   ├── prompt-framework.ts
│   └── index.ts
├── audit/                      # Audit Engine
│   ├── engine.ts               # Single write path
│   ├── hash-chain.ts
│   ├── search.ts
│   └── index.ts
├── policy/                     # Policy Engine
│   ├── engine.ts
│   ├── retention.ts
│   ├── access.ts
│   └── index.ts
├── workflow/                   # Workflow Engine
│   ├── engine.ts
│   ├── state-machine.ts
│   └── index.ts
├── decision/                   # Decision Engine (shared)
│   ├── engine.ts
│   ├── evaluation.ts
│   ├── recommendation.ts
│   └── index.ts
├── ai/                         # AI Execution Engine
│   ├── engine.ts               # Unified orchestrator
│   ├── providers/
│   ├── handlers/
│   ├── governance.ts
│   └── index.ts
├── memory/                     # Institutional Memory Engine
│   ├── engine.ts
│   ├── graph.ts
│   ├── collections.ts
│   └── index.ts
└── signals/                    # Signal Engine
    ├── engine.ts
    ├── producers/
    ├── routing.ts
    └── index.ts
```

---

## Product → Core Transition

| Current Module | Core Engine | Transition |
|---------------|-------------|------------|
| `src/lib/ai/` | AI Execution | MOVE to core/ai/, extend interfaces |
| `src/lib/governance/` | Governance | MOVE to core/governance/, extend task types |
| `src/lib/platform/audit-log.ts` | Audit | Extract to core/audit/, remove dupes |
| `src/lib/platform/audit/` | Audit (hash chain) | MOVE to core/audit/ |
| `src/lib/platform/intelligence.ts` | Contracts | MOVE to core/contracts/ |
| `src/lib/platform/institutional-memory/` | Memory | MOVE to core/memory/, merge AI query memory |
| `src/lib/rag/` | Knowledge | MOVE to core/knowledge/, extract interfaces |
| `src/lib/decision/` | Decision | EXTRACT core/decision/ from DecisionOS |
| `src/lib/platform/signals/` | Signals | Consolidate into core/signals/ |
| `src/lib/platform/notification/` | Notifications | KEEP as shared service (not core engine) |
| `src/lib/platform/access/` | Authorization | KEEP as shared service (wraps Policy Engine) |
| `src/lib/platform/abac/` | Policy | MOVE to core/policy/ |

---

## Architectural Rules

1. **Core modules cannot import product modules** — strict one-way dependency
2. **Products import Core interfaces, not implementations** — dependency injection
3. **All audit writes go through Audit Engine** — single canonical write path
4. **All AI execution goes through AI Execution Engine** — governance injection mandatory
5. **All evidence registration goes through Evidence Engine** — canonical evidence registry
6. **All signals go through Signal Engine** — unified collection and routing
7. **Memory queries go through Institutional Memory Engine** — single knowledge graph
8. **Governance evaluation goes through Governance Engine** — consistent doctrine application
9. **Policy checks go through Policy Engine** — unified policy framework
10. **Workflow transitions go through Workflow Engine** — state machine authority
