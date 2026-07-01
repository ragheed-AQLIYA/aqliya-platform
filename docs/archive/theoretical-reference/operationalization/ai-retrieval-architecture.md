# AI Retrieval Architecture

## Purpose

This document defines the retrieval-ready architecture that enables future AI agents to navigate, query, and surface institutional doctrine across the Aqliya knowledge base. It establishes the structural, semantic, and governance constraints under which AI retrieval must operate.

## Core Principle

**AI may retrieve, summarize, compare, and explain doctrine. AI must NOT approve, certify, or replace professional judgment.**

All retrieval operations are subordinate to human review. AI output is informational and preparatory — never determinative. The architecture treats AI as a librarian and research assistant, not an auditor, certifier, or decision-maker.

## Retrieval Goals

AI retrieval agents must serve the following goals:

1. **Answer institutional questions** — Surface authoritative doctrine that addresses a specific query about governance, methodology, evidence, or product boundaries.
2. **Find relevant doctrine** — Locate the set of documents, sections, and principles most relevant to a given topic, product, or workflow.
3. **Connect principles to products** — Trace how abstract doctrinal principles are instantiated in specific product definitions, evidence chains, and governance rules.
4. **Identify governance boundaries** — Determine where rules apply, where discretion exists, and which human gatekeepers are responsible for approval.

## Retrieval Units

The architecture decomposes the knowledge base into the following retrievable units:

| Unit | Definition | Example |
|------|------------|---------|
| **Document** | A complete doctrinal artifact | `financial-intelligence.md`, `governance-rules.md` |
| **Section** | A headed structural block within a document | "Evidence Standards" within a methodology document |
| **Principle** | A single doctrinal statement or rule | "Every draft output shall pass human review before delivery" |
| **Governance Rule** | A binding constraint with an owner and enforcement mechanism | "AuditOS outputs shall not be released without auditor sign-off" |
| **Evidence Chain** | The linked set of sources, transformations, and validations supporting a claim | Trace from raw data through processing to a product output |
| **Product Boundary** | The scope, inputs, outputs, and constraints defining a product | "AuditOS report: inputs = ledger extract; outputs = draft findings" |

## Context Hierarchy

Retrieval must respect the following hierarchy when resolving ambiguity or scoping relevance:

```
Core Principles → Governance → Evidence → Product → Workflow → Human Review
```

- **Core Principles** are the highest authority and set the interpretive frame.
- **Governance** rules inherit from and must not contradict core principles.
- **Evidence** standards derive from governance and apply to all products.
- **Product** definitions constrain what workflows may produce.
- **Workflow** steps are the operational instantiation.
- **Human Review** is the mandatory terminal gate for all outputs.

When retrieval surfaces conflicting doctrine, the higher tier in the hierarchy prevails.

## Query Categories

AI retrieval queries are classified into the following categories, which determine routing, authority sources, and escalation behaviour:

### 1. Identity
Questions about what Aqliya is, its products, its operating domain, and its differentiation.
- *Routing*: Product definitions, commercial claims, mission statements.
- *Authority*: Published doctrine with commercial review.

### 2. Governance
Questions about rules, approvals, responsibilities, and compliance obligations.
- *Routing*: Governance rules, human approval specifications, audit requirements.
- *Authority*: Binding governance documents, signed-off by institutional leadership.

### 3. Evidence
Questions about data sources, traceability, validation, and auditability.
- *Routing*: Evidence chain documentation, methodology standards.
- *Authority*: Evidence standards linked to governance rules.

### 4. Product
Questions about what a product does, its boundary, its inputs/outputs, and its limitations.
- *Routing*: Product definition documents, boundary specifications.
- *Authority*: Product definitions approved by product owners.

### 5. Methodology
Questions about how something is done, which standards apply, and why a method was chosen.
- *Routing*: Methodology documents, workflow specifications.
- *Authority*: Published methodology with technical review.

### 6. Compliance
Questions about regulatory alignment, audit readiness, and legal obligations.
- *Routing*: Compliance frameworks, governance rules referencing regulation.
- *Authority*: Governance documents with legal review where applicable.

### 7. Risk
Questions about limitations, edge cases, failure modes, and mitigation.
- *Routing*: Risk registers, product boundaries, governance constraints.
- *Authority*: Risk documentation reviewed by governance bodies.

## Governance-Aware Retrieval Rules

AI retrieval agents must apply the following rules:

1. **Tier precedence**: When retrieving from multiple tiers of the context hierarchy, surface the highest-tier principle first, then descending.
2. **Source traceability**: Every retrieved item must include a document:section reference so a human can verify the source.
3. **Version awareness**: If multiple versions of a document exist, retrieve only the current authoritative version.
4. **Confidence signalling**: Attach a confidence level to every retrieval (see Query Confidence Levels in `institutional-query-layer.md`).
5. **Conflict flagging**: When two doctrinal sources appear to conflict, flag the conflict and escalate rather than silently choosing one.
6. **Boundary respect**: Never retrieve outside the scope of institutional doctrine (e.g., do not fabricate citations, reference external unvetted sources, or synthesize novel doctrine).
7. **Human-readiness**: Format all retrieval output for human consumption and review, not for automated execution.

## What AI May Retrieve vs What AI Must Not Decide

### AI May Retrieve and Present:
- Definitions of products, principles, and governance rules.
- Summaries of methodology documents.
- Comparisons between doctrinal positions.
- Explanations of how principles connect to products.
- Identification of applicable governance boundaries.
- Traceability paths from evidence to conclusions.

### AI Must Not Decide:
- Whether a specific output is compliant (requires human certification).
- Whether a draft may be released (requires human approval).
- Whether a methodology is adequate for a given engagement (requires professional judgment).
- Whether a risk is acceptable (requires governance body decision).
- Which principle takes priority in a novel conflict (requires institutional adjudication).

## Human Approval Boundary

All AI retrieval output that is used in a client-facing, regulatory, or legally consequential context must pass through the Human Approval Boundary:

```
AI Retrieval Output → Human Reviewer → Approval / Revision / Rejection → Final Use
```

The human reviewer is responsible for:
1. Verifying the accuracy and completeness of retrieved doctrine.
2. Determining whether the retrieved doctrine applies to the specific factual context.
3. Deciding whether the output is fit for the intended use.
4. Approving, revising, or rejecting the AI output.

No AI retrieval output may bypass this boundary. The architecture must be instrumented to enforce this requirement programmatically where feasible.

## Future Metadata Strategy

To enable high-precision AI retrieval, the doctrine corpus should be enriched with structured metadata:

| Metadata Field | Purpose | Status |
|---------------|---------|--------|
| `doctype` | Document class (principle, governance, methodology, product, evidence, risk) | Planned |
| `authority` | Highest institutional tier that has endorsed the document | Planned |
| `version` | Semantic version number with effective date | Planned |
| `supersedes` | Pointer to prior version | Planned |
| `governed-by` | Pointer to parent governance document | Planned |
| `governs` | Pointer to governed sub-documents | Planned |
| `product-scope` | Product(s) to which the document applies | Planned |
| `query-categories` | Query types for which this document is authoritative | Planned |
| `approval-required` | Whether output referencing this document requires human approval | Planned |
| `review-cycle` | Scheduled review frequency | Planned |
| `owner` | Human or body responsible for maintenance | Planned |

Implementation of this metadata strategy is tracked separately and does not block initial retrieval capability.
