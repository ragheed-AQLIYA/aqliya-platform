# Phase 4 — Operationalization Layer

## Purpose

Phase 4 operationalizes the theoretical reference system for AI-assisted retrieval, governance-aware querying, decision provenance, and agent context injection. While Phases 1–3 built the intellectual architecture — what AQLIYA believes and why — Phase 4 makes that architecture queryable, traceable, and injectable into real systems. It bridges doctrine and execution without blurring the line between them.

## File List

| File | Purpose |
|------|---------|
| `README.md` | This document — layer overview and usage guide |
| `ai-retrieval-architecture.md` | How AI agents retrieve and surface doctrine at query time |
| `institutional-query-layer.md` | Structured query patterns for institutional knowledge access |
| `decision-provenance-framework.md` | How decisions trace back to principles, evidence, and approvals |
| `governance-aware-context-injection.md` | How governance rules are injected into AI agent context windows |
| `doctrine-retrieval-patterns.md` | Reusable retrieval templates mapped to doctrine domains |
| `evidence-to-principle-query-map.md` | Mapping from evidence types to the principles they activate |
| `product-doctrine-lookup-map.md` | Which doctrine documents apply to which product behaviors |
| `human-approval-query-map.md` | When and how human approval is required, by scenario |
| `enterprise-governance-readiness.md` | Readiness assessment for enterprise governance deployment |
| `operationalization-risk-register.md` | Risks introduced or amplified by operationalization |
| `phase-4-completion-report.md` | Completion report for the Phase 4 build-out |

## How to Use This Layer

1. **For AI agent context injection** — Use `governance-aware-context-injection.md` and `doctrine-retrieval-patterns.md` to determine what doctrine a given agent should have in its context window before acting.
2. **For governance queries** — Use `institutional-query-layer.md` and `evidence-to-principle-query-map.md` to answer questions like "What principle governs this action?" or "What evidence is required for this decision?"
3. **For decision provenance** — Use `decision-provenance-framework.md` to trace any product or architectural decision back to its governing doctrine, evidence, and approval chain.
4. **For human approval routing** — Use `human-approval-query-map.md` to determine whether a human must approve a given action and at what level.
5. **For enterprise readiness** — Use `enterprise-governance-readiness.md` to assess whether the operationalization layer meets enterprise deployment standards.
6. **For risk awareness** — Consult `operationalization-risk-register.md` before integrating any operationalization component into a production system.

## What This Layer Is NOT

- **Not a replacement** for the 21-part theoretical reference system. Doctrine remains authoritative; this layer references it.
- **Not a migration** of doctrine into a new format. No documents were moved, renamed, or restructured.
- **Not application code.** These are reference documents. Actual implementation of retrieval, injection, or query logic belongs in the product codebase.

## Governance Reminder

> **AI assists. Humans decide. Evidence governs.**

Every retrieval, every context injection, every automated query pattern in this layer operates under this constraint. The operationalization layer accelerates access to doctrine — it does not automate doctrinal compliance.

## Relationship to Phases 1–3

| Phase | What It Built | How Phase 4 Extends It |
|-------|---------------|------------------------|
| Phase 1 | Architecture overview and 21-part mapping | Phase 4 makes the mapping queryable at runtime |
| Phase 2 | Topic gateways and concept indexes | Phase 4 adds retrieval patterns on top of those indexes |
| Phase 3 | Knowledge graphs, traceability chains, institutional memory, system intelligence, discovery, governance boundaries | Phase 4 operationalizes all six Phase 3 layers for AI agent consumption |

Phase 4 is additive. No prior-phase documents were modified.
