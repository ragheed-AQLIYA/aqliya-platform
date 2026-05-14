# Institutional Query Layer

## Purpose

This document defines the question-answering layer that sits atop the AI retrieval architecture. It specifies the types of queries the system must support, the routing model that directs queries to authoritative sources, the confidence framework that signals retrieval reliability, and the escalation rules for queries that exceed AI capability.

## Supported Query Types

| Query Type | Definition | Example |
|------------|------------|---------|
| **Definitively Answered** | The institutional doctrine contains an explicit, unambiguous answer. | "What is the human approval threshold for AuditOS outputs?" |
| **Derivable** | The answer can be inferred by connecting multiple doctrinal sources, but is not stated verbatim. | "Given the governance rules for AuditOS, what evidence standard applies to a new product?" |
| **Partially Answered** | The doctrine addresses the topic in part, but the answer is incomplete or requires external context. | "How does Aqliya's methodology compare to relevant regulatory frameworks?" |
| **Out of Scope** | The query falls outside the institutional doctrine altogether. | "What is the weather in London?" |
| **Prohibited** | The query asks the AI to perform an action it must not perform (approve, certify, decide). | "Approve this output for release." |

## Example Queries with Answers

### Query 1: Why does AuditOS require human approval?

**Query type**: Definitively Answered
**Query category**: Governance
**Answer**: AuditOS requires human approval because all draft outputs must pass through a professionally qualified reviewer before delivery. This principle is established in the core governance architecture: AI may assist in analysis and drafting, but it must not replace professional judgment. The human approval boundary is the terminal gate for all outputs, ensuring that every deliverable has been assessed for accuracy, appropriateness, and compliance by a qualified human before reaching the client or a regulatory context.

**Source routing**: Governance → Human Review specifications → AuditOS product definition → Core Principles (professional judgment boundary)

**Confidence**: High — explicit doctrine exists across multiple tiers of the context hierarchy.

### Query 2: What doctrine governs draft outputs?

**Query type**: Definitively Answered
**Query category**: Governance → Product
**Answer**: Draft outputs are governed by the human review requirement that applies to all products. The relevant doctrine states that any output in a draft state must be clearly marked as draft, must not be presented as final, and must be reviewed and approved by a qualified human before it transitions to a deliverable state. The specific governance rules vary by product but the universal principle is: no output leaves draft without human approval.

**Source routing**: Governance rules → Human Review specifications → Product-specific output definitions

**Confidence**: High — core governance principle with product-level instantiations.

### Query 3: Which principles govern evidence traceability?

**Query type**: Definitively Answered
**Query category**: Evidence
**Answer**: Evidence traceability is governed by the evidence chain principle, which requires that every claim, finding, or output be traceable back to its originating data sources through a documented, auditable path. This principle mandates: (1) source identification — every data input must be documented with provenance; (2) transformation transparency — every processing step must be recorded; (3) validation linkage — every validation check must be connected to the evidence it verifies; (4) output derivation — every output must reference the evidence that supports it. These principles apply across all products and are enforced through the evidence standards layer of the governance architecture.

**Source routing**: Core Principles → Evidence standards → Evidence chain documentation → Methodology specifications

**Confidence**: High — evidence traceability is a foundational principle with detailed doctrinal elaboration.

### Query 4: What is the boundary between AI assistance and professional judgment?

**Query type**: Definitively Answered
**Query category**: Governance / Identity
**Answer**: The boundary is defined by the core principle: **AI may retrieve, summarize, compare, and explain doctrine. AI must NOT approve, certify, or replace professional judgment.**

Concretely, AI assistance ends and professional judgment begins when:
- A deliverable must be approved for release.
- A compliance determination must be made.
- A methodology must be certified as adequate for a specific engagement.
- A risk must be accepted or rejected.
- A novel doctrinal conflict must be resolved.
- A client-specific interpretation of doctrine must be rendered.

AI output in any of these domains is preparatory information for the human professional — it does not constitute the professional act itself.

**Source routing**: Core Principles → AI Retrieval Architecture → Governance rules (human approval boundary) → Product definitions (per-product approval gates)

**Confidence**: High — the boundary is the foundational constraint of the entire retrieval architecture.

### Query 5: Which documents explain Financial Intelligence?

**Query type**: Definitively Answered
**Query category**: Identity / Product
**Answer**: Financial Intelligence is explained across the following document categories:
1. **Product definition** — The FinIntel product specification defines its scope, methodology, deliverables, and boundaries.
2. **Methodology** — The Financial Intelligence methodology documents describe the analytical framework, data sources, and output formats.
3. **Evidence standards** — The evidence chain requirements applicable to financial analysis products.
4. **Governance rules** — The approval and review requirements specific to financial intelligence outputs.
5. **Commercial trust claims** — The doctrinal support for claims made about FinIntel in commercial contexts.

A retrieval agent should surface the product definition first, then methodology, then governance constraints.

**Source routing**: Product definitions → Methodology documents → Evidence standards → Governance rules (FinIntel-specific) → Commercial claims

**Confidence**: High — with the caveat that retrieval completeness depends on the current state of product documentation.

### Query 6: Which doctrine supports commercial trust claims?

**Query type**: Derivable
**Query category**: Compliance / Risk
**Answer**: Commercial trust claims (statements about Aqliya's capabilities, standards, and reliability made to clients, partners, or the market) must be supported by verifiable doctrine. The supporting doctrine includes:
1. **Product definitions** — The authoritative scope of what a product does and does not do.
2. **Governance rules** — The institutional controls that validate that product claims are accurate.
3. **Evidence standards** — The traceability framework that demonstrates the basis for any claim.
4. **Human approval specifications** — The requirement that claims be reviewed before publication.
5. **Methodology documentation** — The documented processes that substantiate capability claims.

Any commercial trust claim that cannot be traced to at least one of these doctrinal sources must be flagged as unsupported and escalated for institutional review.

**Source routing**: Product definitions → Governance rules → Evidence standards → Commercial claims validation framework

**Confidence**: Medium — the principle is clear but the specific doctrinal sources depend on the claim being made; a one-to-many mapping may require human interpretation.

## Query Routing Model

Queries are routed to authoritative sources based on their query category and the requested retrieval unit:

```
Query Input
    │
    ▼
Category Classification (Identity / Governance / Evidence / Product / Methodology / Compliance / Risk)
    │
    ▼
Authority Source Mapping (per Query Categories table in ai-retrieval-architecture.md)
    │
    ▼
Tier Descent (Core Principles → Governance → Evidence → Product → Workflow)
    │
    ▼
Retrieval Unit Selection (Document / Section / Principle / Governance Rule / Evidence Chain / Product Boundary)
    │
    ▼
Response Assembly (answer + source references + confidence level + escalation if needed)
```

### Routing Decision Rules

1. If the query matches a single category, route to the primary authority source for that category.
2. If the query spans multiple categories, route to the highest-tier category first (Identity before Governance, Governance before Evidence, etc.) and cross-reference.
3. If the query is ambiguous, retrieve from Identity (mission, principles) first to establish context, then descend.
4. If the query is Out of Scope, escalate immediately without retrieval.
5. If the query is Prohibited, refuse retrieval and escalate to a human gatekeeper.

## Query Confidence Levels

Every retrieval response must carry a confidence level:

| Level | Definition | Criteria |
|-------|------------|----------|
| **High** | Doctrinally certain | Answer is explicitly stated in authoritative documents; sources are unambiguous and consistent across tiers. |
| **Medium** | Doctrinally derivable | Answer can be constructed from multiple sources but requires inference; minor gaps or interpretive choices exist. |
| **Low** | Doctrinally incomplete | Relevant doctrine exists but is partial, dated, or ambiguous; answer should be treated as indicative only. |
| **None** | No doctrinal basis | No relevant doctrine exists; the query is out of scope or the domain is not yet documented. |
| **Refused** | Retrieval prohibited | The query asks the AI to perform a prohibited action; escalated to human gatekeeper. |

Confidence levels must be determined programmatically based on:
- The number of corroborating doctrinal sources.
- The tier of the highest authority source addressing the query.
- Whether the sources are current (not superseded).
- Whether any conflicting doctrinal statements exist.
- Whether the query requires inference or the answer is explicit.

## Escalation Rules

Escalation is triggered when the AI retrieval agent cannot deliver a complete or reliable answer. Escalation routes the query to a human gatekeeper with relevant context.

### Automatic Escalation Triggers

| Trigger | Action |
|---------|--------|
| Confidence = **Low** or **None** | Package query with partial results (if any) and escalate. |
| Confidence = **Refused** (Prohibited query) | Package query with refusal reason and escalate. |
| Doctrinal conflict detected | Package both conflicting sources, flag the conflict, and escalate. |
| Query spans >3 categories | Escalate with a structured summary of what can and cannot be answered. |
| Missing authoritative source | Escalate with identification of the doctrinal gap. |
| Version ambiguity (current version unclear) | Escalate with the version candidates and request clarification. |

### Escalation Packet

Every escalation must include:
1. The original query text.
2. The query type and category classification.
3. Partial results retrieved (if any), with source references.
4. The reason for escalation.
5. The specific gap, conflict, or ambiguity preventing a complete answer.
6. A recommended human action (resolve, document, clarify, or reject).

### Post-Escalation

After human resolution, the resolution must be:
1. Documented in the appropriate doctrinal file (principle, governance rule, or product definition).
2. Linked back to the escalation record for auditability.
3. Tested by re-running the original query to confirm the gap is closed.
