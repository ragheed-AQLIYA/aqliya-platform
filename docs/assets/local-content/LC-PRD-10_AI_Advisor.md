# LC-PRD-10: AI Advisor

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** PRD — retroactive alignment for AI Advisor subsystem
> **Epic:** LC-EPIC-10

---

## 1. Overview

AI Advisor (Workbook AI) provides governed AI-assisted suggestions for workbook pattern matching, account intelligence, false positive review, and pattern improvement. Every AI output is a **suggestion** requiring human review — never autonomous.

**P0 Rules:**
- Never auto-applied — always requires human review
- Every output carries `reviewRequired: true`
- All AI actions logged with audit trail
- Learning loop updates metrics after human review
- Confidence scoring with 4 levels (20–90%)

---

## 2. Functional Architecture

| Module | File | Purpose |
|---|---|---|
| AI Advisor | `workbook/ai-advisor.ts` (1161 lines) | Main AI orchestration |
| RAG Integration | `workbook/rag-integration.ts` | Grounded AI with context |
| Recommendation Engine | `workbook/recommendation-engine.ts` | Score-based recommendations |
| Learning Loop | `workbook/learning-loop.ts` | Post-review metrics |
| AI Health | `workbook/ai-health.ts` | Quality monitoring |
| AI Auto Review | `workbook/ai-auto-review.ts` | Automated review suggestions |
| Simulation | `workbook/simulation-engine.ts` | What-if analysis |

---

## 3. Functional Requirements

| ID | Requirement | AI Governance |
|---|---|---|
| FR-01 | Suggest workbook pattern matches for accounts | Human review required, confidence scored |
| FR-02 | Explain matched patterns with confidence | Source input references included |
| FR-03 | False positive review (mark/reject) | Audit log + learning loop |
| FR-04 | Batch false positive review | Per-item audit trail |
| FR-05 | Pattern improvement suggestions | Suggestion only, never auto-applied |
| FR-06 | Missing data inference | Evidence-grounded, labeled as estimate |
| FR-07 | Context-aware AI via RAG | External provider routing controls |
| FR-08 | Confidence calibration (20/50/70/90%) | 4-level gradient |
| FR-09 | Learning metrics from human review outcomes | PatternOutcome records |
| FR-10 | AI health monitoring | Acceptance rate tracking |

---

## 4. AI Governance Rules

| Rule | Implementation |
|---|---|
| Every AI output requires human review | `reviewRequired: true` on all AdvisorResult<T> |
| No autonomous final decisions | All decisions require explicit human action |
| Source references required | Inputs documented in suggestions |
| Confidence must be scored | 4-level gradient, never omitted |
| Audit log on every AI action | `logAdvisor()` with event type + metadata |
| Learning loop after human review | `recordPatternOutcome()` updates metrics |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ workbook/ai-advisor.ts (1161 lines), learning loop, health, RAG, tests |
| **Documented** | ✅ This PRD retroactively describes existing implementation |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1
