# Retrieval Context Runtime Framework

## Runtime Retrieval Goals

The Retrieval Context Runtime exists to ensure that every agent action within the Aqliya system is informed by the correct doctrinal, evidentiary, and governance context. Its goals are:

1. **Context Completeness** — no agent decision is made in an information vacuum; every retrieval must pull the minimum viable context for the task class.
2. **Context Relevance** — avoid injecting doctrine that does not bear on the current task; retrieval is scoped, not exhaustive.
3. **Governance Binding** — every retrieval must respect governance rules, approval gates, and escalation paths.
4. **Traceability** — every injected context block carries a provenance reference so downstream reasoning can be audited.
5. **Overload Prevention** — the system must never inject so much context that the agent loses signal in noise.
6. **Future-Readiness** — the framework must support governance-aware agent retrieval where agents themselves request and validate context at runtime.

---

## Context Injection Hierarchy

Context is injected in a strict priority order. Higher tiers preempt lower tiers when conflicts arise.

```
┌─────────────────────────────────────┐
│  Tier 1 — Core Principles           │  Immutable; overrides all else
├─────────────────────────────────────┤
│  Tier 2 — Governance Rules          │  Approval gates, escalation paths, roles
├─────────────────────────────────────┤
│  Tier 3 — Evidence                  │  Facts, data, citations, provenance metadata
├─────────────────────────────────────┤
│  Tier 4 — Product Knowledge         │  Domain rules, product behaviour, constraints
├─────────────────────────────────────┤
│  Tier 5 — Workflow Context          │  Task type, stage, dependencies, prior outputs
├─────────────────────────────────────┤
│  Tier 6 — Human Review              │  Reviewer notes, override flags, audit trail
└─────────────────────────────────────┘
```

### Tier 1: Core Principles

- **Integrity**: No statement may be drafted, published, or asserted without verifiable grounding.
- **Transparency**: Every output must be traceable to its source context.
- **Accountability**: Human review is mandatory for all outputs that carry legal, financial, or reputational weight.
- **Proportionality**: The depth of retrieval must match the gravity of the decision.

Core Principles are always injected first and cannot be suppressed by any lower-tier rule.

### Tier 2: Governance Rules

Governance rules define the *permissions boundary* of the agent. They specify:
- Which actions require explicit human approval.
- Which actions are prohibited entirely.
- Escalation paths when the agent encounters ambiguity.
- Mandatory review triggers (e.g., "if confidence < 0.85, escalate").

### Tier 3: Evidence

Evidence context includes:
- Source documents and their provenance metadata.
- Previous findings and their review status.
- Data citations with chain-of-custody markers.
- Contradictory evidence flags (when two sources conflict).

### Tier 4: Product Knowledge

Product context includes:
- Domain-specific rules and definitions.
- Business logic constraints.
- Regulatory requirements that shape product behaviour.
- Known limitations and edge cases.

### Tier 5: Workflow Context

Workflow context captures:
- The current task type (drafting, review, audit, mapping).
- The stage within the pipeline.
- Dependencies on prior agent or human outputs.
- State machine position and transition rules.

### Tier 6: Human Review

Human review context carries:
- Reviewer identity and role.
- Override decisions and their rationale.
- Flagged items and resolution status.
- Full audit trail for downstream accountability.

---

## Governance-Aware Retrieval Rules

1. **Approval Gate Check** — before executing any action, the retrieval runtime must check whether the action class requires approval. If yes, the context must include the approval status.
2. **Escalation Injection** — if the agent's confidence falls below the governance threshold, the escalation path is automatically injected.
3. **Role-Bound Scoping** — retrieved context is filtered by the agent's assigned role; agents must not see context outside their clearance.
4. **Mandatory Retention** — governance rules are never pruned for brevity. They persist in the context window for the full session.
5. **Conflict Resolution** — when retrieved evidence conflicts with a governance rule, the governance rule prevails and the conflict is flagged for human review.

---

## Product-Aware Retrieval

Product-aware retrieval ensures that agents operating on specific product domains receive the correct domain model:

- **Domain Glossary** — key terms and their authoritative definitions are injected when the task touches those terms.
- **Constraint Injection** — product-specific business rules (e.g., "Claim X can only be asserted when Condition Y is met") are injected automatically.
- **Version Awareness** — if the product definition has changed, the retrieval runtime must surface the version applicable to the current task, not the latest.
- **Cross-Product Isolation** — context from Product A must not leak into a task scoped to Product B unless explicitly cross-referenced.

---

## Evidence-Aware Retrieval

Evidence-aware retrieval enforces rigour in fact-handling:

- **Provenance Requirement** — no evidence block may be injected without its source, date, and chain-of-custody metadata.
- **Confidence Tagging** — each evidence item carries a confidence score; low-confidence evidence is flagged on injection.
- **Contradiction Detection** — when two evidence items conflict, both are injected with a contradiction marker and the conflict is escalated.
- **Staleness Check** — evidence older than its domain's freshness threshold is injected with a staleness warning.
- **Selective Depth** — for high-stakes tasks (audit findings, commercial claims), full evidence chains are injected. For low-stakes tasks, summaries suffice.

---

## Approval-Aware Retrieval

Approval-aware retrieval ensures the agent never acts beyond its authority:

- **Pre-Action Gate** — before any action that modifies state (write, publish, assert), the retrieval runtime checks approval status. Unapproved actions are blocked at the retrieval layer.
- **Conditional Approval Injection** — when an action is conditionally approved (e.g., "approved pending legal review"), the conditions are injected alongside the approval.
- **Delegation Chain** — if approval was delegated, the full delegation chain is injected so the agent understands the authority behind the approval.
- **Expiry Awareness** — approvals with time limits carry an expiry timestamp; expired approvals are treated as unapproved.

---

## Retrieval Boundaries

The following context must **never** be omitted, regardless of token budget or latency constraints:

| Boundary | Rationale |
|---|---|
| Core Principles | Immutable ethical and operational foundation |
| Governance rules applicable to the task class | Permissions boundary enforcement |
| Escalation paths | Required for degraded-mode safety |
| Evidence provenance metadata | Auditability and traceability |
| Approval status for the current action | Prevents unauthorised execution |
| Human review flags on prior outputs | Prevents compounding unreviewed errors |
| Contradiction markers on conflicting evidence | Prevents silent suppression of dissent |

These boundaries form the **minimum viable context**. The runtime may trim anything else, but never these.

---

## Context Overload Prevention

To prevent the agent from drowning in irrelevant context, the runtime applies:

1. **Tiered Trimming** — context is trimmed from the bottom of the hierarchy upward (Workflow first, Human Review notes next, etc.), never from the top.
2. **Relevance Scoring** — each context block is scored against the current task. Blocks below the relevance threshold are pruned (subject to retrieval boundaries).
3. **Summarisation Fallback** — when full context would exceed the token budget, lower-tier blocks are summarised rather than omitted.
4. **Chunked Injection** — for very large evidence sets, evidence is injected in relevance-ordered chunks with the agent able to request the next chunk.
5. **Session Reset Hygiene** — between unrelated tasks, the context window is cleared to prevent cross-task contamination, retaining only Core Principles and Governance.
6. **Maximum Context Budget** — a hard token ceiling is enforced per retrieval cycle; the runtime must fit within it or escalate for a larger window.

---

## Context Injection Examples

### Example 1: Statement Drafting

**Task**: Draft a public-facing statement about a product claim.

| Tier | Injected Context |
|---|---|
| Core Principles | Integrity, Transparency, Accountability |
| Governance | Approval required before publication; escalation if claim is novel |
| Evidence | Supporting data, source citations, confidence scores |
| Product | Product domain glossary, constraint rules for the claim type |
| Workflow | Drafting stage, prior draft versions, reviewer assignments |
| Human Review | Reviewer identity, previous review comments |

### Example 2: Audit Findings

**Task**: Produce audit findings for a regulatory compliance check.

| Tier | Injected Context |
|---|---|
| Core Principles | Integrity, Proportionality |
| Governance | Mandatory escalation for non-compliance findings; approval gate for final report |
| Evidence | Full evidence chain with provenance, contradiction markers, staleness checks |
| Product | Regulatory rulebook, compliance criteria, versioned requirements |
| Workflow | Audit stage, dependency on prior evidence collection |
| Human Review | Auditor identity, sign-off status, flagged items |

### Example 3: Commercial Claims

**Task**: Assess whether a commercial claim can be asserted.

| Tier | Injected Context |
|---|---|
| Core Principles | Integrity, Transparency |
| Governance | Claim assertion requires explicit approval; novel claims escalated |
| Evidence | Supporting data, market comparison data, disclaimers |
| Product | Claim type constraints, regulatory advertising rules |
| Workflow | Claim assessment stage, prior claim history |
| Human Review | Legal review status, marketing sign-off |

### Example 4: Evidence Review

**Task**: Review a batch of evidence items for quality and consistency.

| Tier | Injected Context |
|---|---|
| Core Principles | Integrity, Transparency |
| Governance | Evidence quality thresholds; escalation for sub-threshold items |
| Evidence | Full provenance for each item, contradiction detection results, staleness flags |
| Product | Domain definitions to validate evidence relevance |
| Workflow | Review batch metadata, prior review outcomes |
| Human Review | Reviewer qualifications, previous flags on related evidence |

### Example 5: Mapping Ambiguity

**Task**: Resolve ambiguity where a claim maps to multiple possible product definitions.

| Tier | Injected Context |
|---|---|
| Core Principles | Integrity, Proportionality |
| Governance | Ambiguity triggers mandatory escalation; agent must not resolve unilaterally |
| Evidence | All candidate mappings with confidence scores, historical resolution patterns |
| Product | Full definitions of all candidate products, boundary rules |
| Workflow | Mapping stage, dependency on upstream classification |
| Human Review | Prior ambiguity resolutions, domain expert assignment |

---

## Goal: Future Governance-Aware Agent Retrieval

This framework is designed to evolve into a runtime where agents themselves are retrieval-aware — meaning they:

1. **Request context proactively** — before acting, the agent queries the retrieval runtime for the context tier it needs, rather than passively receiving a pre-assembled bundle.
2. **Validate context completeness** — the agent checks that mandatory boundaries are satisfied and escalates if they are not.
3. **Negotiate context budget** — the agent and runtime negotiate the depth of retrieval based on task gravity and available token budget.
4. **Learn from retrieval gaps** — when an agent encounters a situation where missing context caused an error, it feeds back to improve future retrieval rules.
5. **Self-audit** — agents log what context was retrieved and why, forming an auditable trail of retrieval decisions.

The ultimate goal is a **closed-loop governance system** where retrieval, action, review, and learning form a continuous cycle, with the Retrieval Context Runtime as the central nervous system of agent governance.
