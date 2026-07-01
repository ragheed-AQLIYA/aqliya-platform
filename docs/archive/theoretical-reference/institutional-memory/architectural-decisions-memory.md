# Architectural Decisions Memory

## Purpose
Document key architectural positions derived from doctrine — their rationale, effect, and current status. Sources: Part 02 (Decision Infrastructure), Part 07 (Workflow Intelligence), Part 16 (Design Principles).

---

### 1. Decision Object as Architectural Center

| Field | Content |
|---|---|
| **Decision** | The decision object (containing context, evidence, options, recommendation, approval, action, outcome, learning) is the first-class data type around which the entire platform is built. |
| **Rationale** | 02.02 §5: "The unit of infrastructure is the decision object." Just as transaction infrastructure is built around the transaction, decision infrastructure is built around the decision object. Every feature, integration, and governance rule exists to serve the decision object's lifecycle. 02.02 §10(1): "The decision object is the architectural center." |
| **Effect** | The decision object model determines the schema of every subsystem — evidence store, workflow engine, governance evaluator, signal bridge, learning loop. All APIs, storage, and access controls are designed around this model. Domain-specific lifecycles (audit finding, journal entry approval) are derived from the canonical decision object model. |
| **Status** | Active. The decision object model is defined in 20.01 (Decision Model). Domain-specific derivations (audit finding lifecycle, financial approval lifecycle) are in development. The canonical lifecycle (data → evidence → signal → recommendation → review → decision → action → outcome → learning) from 02.01 §6 is the reference process for all domain modules. |

### 2. Evidence Store as Separate Persistence Layer

| Field | Content |
|---|---|
| **Decision** | Evidence is stored in a dedicated persistence layer separate from decision objects — with provenance, integrity hashes, access controls, and independent lifecycle — rather than as embedded attachments. |
| **Rationale** | 02.02 §7: "Evidence Store: A separate persistence layer for evidence — data with provenance, validation metadata, integrity hashes, and access control. Evidence is not stored with the decision; it is referenced by the decision object and resolved through the evidence store." 02.02 §10(2): "The evidence store is a separate storage layer with its own schema, access control, integrity verification, and lifecycle." |
| **Effect** | Evidence objects are first-class entities with their own schema, lifecycle (candidate → verified → accepted → referenced → archived), provenance metadata, and governance rules. Changes in evidence state propagate to all decision references. Enables cross-engagement evidence discovery and reuse. Supports tenant isolation at the evidence level. |
| **Status** | Active. Schema defined by 09.01 §10 and 01.09 §10. The model is built into the platform design. Evidence is always a first-class object, never a file attachment. |

### 3. Workflow Engine as Primary Architectural Component

| Field | Content |
|---|---|
| **Decision** | The workflow engine is the core architectural component. All other capabilities — intelligence, evidence, governance — are built around and organized by the workflow engine, not alongside it. |
| **Rationale** | 07.01 §10: "The workflow engine is the core architectural component. All other capabilities — intelligence, evidence, governance — are built around the workflow engine, not alongside it." 13.04 §10(1): "The workflow engine is the central system component." |
| **Effect** | Capabilities are organized as workflow-native services, not standalone modules. Intelligence produces recommendations within workflow context. Evidence is resolved through the evidence store and associated with workflow steps. Governance rules execute as workflow transition guards. The workflow engine is not a generic BPM engine — it is purpose-built for evidence-aware and governance-aware decision lifecycle orchestration. |
| **Status** | Active. The architecture follows a modular monolith pattern (16.02) with the workflow engine at the center. Domain modules (audit, financial, governance) are layered as plugins over the shared workflow core. |

### 4. Modular Monolith with Strict Domain Boundaries

| Field | Content |
|---|---|
| **Decision** | The platform follows a modular monolith architecture with strict domain boundaries between modules. Cross-module communication occurs through well-defined interfaces, not shared database tables or direct module references. |
| **Rationale** | 16.01 §10(1-3): "The platform follows a modular monolith architecture with strict domain boundaries between modules. Cross-module communication occurs through well-defined interfaces, not shared database tables or direct module references. The data model is the primary carrier of domain logic." |
| **Effect** | Domain modules (audit, financial intelligence, governance) are self-contained subsystems with their own data models, workflows, and governance rules. They interoperate through the shared decision object model, evidence store, and governance engine. New domain modules can be added without rearchitecting the platform. Prevents premature microservice decomposition that obscures domain boundaries. |
| **Status** | Active. The modular monolith pattern avoids both the rigidity of vertical integration and the operational complexity of microservices. Domain boundaries are structural, not just organizational. |

### 5. Governance Rules as Synchronous Transition Guards

| Field | Content |
|---|---|
| **Decision** | Governance rules execute synchronously during workflow state transitions, not as external policy services consulted after the fact. |
| **Rationale** | 02.02 §10(3): "The governance evaluator is embedded in the lifecycle engine, not a separate service. Governance rules execute synchronously during lifecycle transitions." 07.01 §11: "Governance is structural, not procedural. The workflow enforces governance by requiring evidence at gates and human authority at joints." |
| **Effect** | Governance is not a bolt-on module that can be bypassed — it is compiled into the workflow execution path. A transition that requires partner approval cannot proceed without it. A transition that requires evidence verification will not execute without it. Governance compliance is a structural guarantee, not a policy suggestion. |
| **Status** | Active. This is a non-negotiable architectural constraint. The governance evaluator is part of the workflow engine, not a separate service. |

### 6. Evidence-Gated Transitions

| Field | Content |
|---|---|
| **Decision** | No workflow state transition occurs without meeting evidentiary gates. The workflow enforces evidence requirements at each step. |
| **Rationale** | 07.01 §6(3): "Evidence-Gated Transitions: No workflow transition occurs without meeting evidentiary gates. The workflow enforces evidence, not the other way around." 01.09 §10(6): "The workflow engine evaluates evidence state at each step: is the required evidence present? Is it verified? Does it meet the evidence standard? Workflow progression depends on evidence sufficiency." |
| **Effect** | Workflow definitions include evidence requirements per step. The workflow engine checks evidence completeness before allowing progression. Evidence gaps block transitions and must be resolved or escalated through governed exception paths. Reviewers are guided to gather missing evidence rather than bypass the gate. |
| **Status** | Active. Evidence gates are a defined property of workflow definitions. Escalation paths exist for legitimate exceptions. |

### 7. Human Decision Joints Are Architecturally Unskippable

| Field | Content |
|---|---|
| **Decision** | Human authority at decision joints (review, approval, escalation) is structurally required. The system must not allow automation to bypass a required human checkpoint. |
| **Rationale** | 07.01 §10(4): "Human decision joints must be architecturally unskippable. The system must not allow automation to bypass a required human checkpoint." 10.01 §2: "The workflow engine must enforce human decision joints. AI outputs are structurally scoped as recommendations, never decisions." |
| **Effect** | Workflow definitions include mandatory human decision joints. No automated path exists that can approve, sign, finalize, or issue conclusions. AI recommendations flow through review gates. The architecture enforces "AI assists. Humans decide." |
| **Status** | Active. This is a hard architectural constraint. The anti-pattern 18.08 (Over-Automation) reinforces this position — automation follows trust, never replaces human authority. |

### 8. Event Sourcing for All Governed State Transitions

| Field | Content |
|---|---|
| **Decision** | Every state transition in governed workflows is written to an append-only, immutable event log with evidence references and actor attribution. Event sourcing is the mechanism that makes audit a read operation. |
| **Rationale** | 07.01 §10(5): "Event sourcing captures every state transition for traceability. Event sourcing is not optional — it is the mechanism that makes audit a read operation." 02.02 §10: "Every state transition is written to an immutable governance trace. This trace is append-only and cannot be modified or deleted by any actor." |
| **Effect** | The complete history of every workflow step, decision, and governance event is preserved. Audit is performed by querying the event log — no forensic reconstruction required. Every state transition is attributable to a specific authenticated actor. |
| **Status** | Active. Event sourcing is mandatory for all governed workflows. The event log is the system of record for audit trails. |

### 9. Intelligence Layer Operates Through Signal Bridge

| Field | Content |
|---|---|
| **Decision** | The intelligence layer produces signals and recommendations through a defined interface (signal bridge) that enters the decision lifecycle. The intelligence layer does not have direct access to the lifecycle engine. |
| **Rationale** | 02.02 §7: "Signal Bridge: The interface between the intelligence layer (which produces signals from data) and the decision lifecycle (which consumes signals as inputs to recommendations)." 02.02 §12(1): "AI operates through the signal bridge — a defined interface that produces structured signals and recommendations with evidence traces. The intelligence layer does not have direct access to the lifecycle engine." |
| **Effect** | AI outputs are governed inputs to the decision lifecycle, not direct actions. Model outputs enter as recommendations requiring human review. The lifecycle engine is not directly accessible from the inference layer. This enforces the architectural separation between intelligence and decision execution. |
| **Status** | Active. The signal bridge is a unidirectional interface — intelligence outputs enter the lifecycle, but the lifecycle does not leak state back to the intelligence layer through this interface per 02.02 §10(6). |

### 10. Tenant Isolation at Governance Level

| Field | Content |
|---|---|
| **Decision** | Each tenant's decision objects, evidence stores, lifecycle rules, and governance configurations are fully isolated at the storage and execution level — not just the application level. |
| **Rationale** | 01.07 §10(6): "Tenant isolation is enforced at the governance level, not just the data level. Each tenant's governance rules, configurations, and traces are isolated from all other tenants." 16.01 §6(8): "Tenant isolation is a structural guarantee, not a configuration option." |
| **Effect** | Multi-tenancy is infrastructural, not logical. One tenant's data, governance rules, and AI configuration cannot affect another's. Governance isolation extends to access controls, approval chains, evidence provenance, and audit trails. |
| **Status** | Active. Tenant isolation is a structural guarantee enforced at the data layer and governance layer. |
