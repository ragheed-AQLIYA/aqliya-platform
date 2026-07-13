# Engineering Memory — Decision Log

**Status:** Active — Append-only  
**Owner:** Layer 11 (Engineering Memory)  
**Purpose:** Key technical decisions with rationale. Linked to ADRs.

---

## 2026-07-13 — Engineering OS Cycle 1

### D-001: Skill-based extension over agent-based expansion
- **Context:** Agent freeze prohibits new `.mjs` agents. Need to add engineering capabilities.
- **Decision:** Create reusable Skills (`.skills/aqliya/eng-*.md`) instead of new agents.
- **Rationale:** Skills are lighter, composable, and don't require OpenCode runtime changes.
- **ADR:** ADR-008, ADR-009

### D-002: Four initial engineering skills
- **Context:** Need immediate engineering capabilities for code review, architecture, security, governance.
- **Decision:** Create `eng-code-review`, `eng-architecture-review`, `eng-security-audit`, `eng-governance-compliance`.
- **Rationale:** These cover the highest-frequency engineering tasks.
- **ADR:** ADR-009

### D-003: Engineering Memory as structured markdown
- **Context:** Need persistent knowledge that survives session resets.
- **Decision:** ADR registry, Pattern Library, Decision Log, Anti-pattern Registry stored in `engineering/knowledge/`.
- **Rationale:** Git-tracked, append-only, human-readable. No new dependencies.
- **ADR:** ADR-009

---

## 2026-07-13 — Pilot Hardening Sprint

### D-004: Prompt sanitization before provider dispatch
- **Context:** AI prompts could contain injection or sensitive data.
- **Decision:** `src/lib/security/prompt-sanitization.ts` as Core security layer.
- **Rationale:** Centralized sanitization ensures consistent protection across all AI pipelines.

### D-005: 5-minute TTL for dashboard cache
- **Context:** Dashboard queries hitting DB on every render.
- **Decision:** `getCachedOrFetch` with 5-min TTL, write-through invalidation.
- **Rationale:** 5 minutes balances freshness with performance. Write-through prevents stale reads.

### D-006: Pagination as universal contract
- **Context:** Unbounded arrays in server actions.
- **Decision:** All list actions return `{ items, totalCount, hasMore }`.
- **Rationale:** Prevents memory pressure, enables infinite scroll, standardizes client consumption.

---

## 2026-07-03 — L6 Completion Program

### D-007: 8 L6 engines for AuditOS
- **Context:** AuditOS needed production hardening beyond basic workflow.
- **Decision:** Build ISQM1, Materiality, Client Acceptance, Independence, Working Papers, Review Notes SLA, Sampling Hardening, Knowledge Engine.
- **Rationale:** Each engine addresses a specific audit firm requirement for pilot readiness.

### D-008: IaC code-complete, live apply contract-gated
- **Context:** Terraform for dev.aqliya.com complete, production IaC written.
- **Decision:** Apply production IaC only after penetration test.
- **Rationale:** Contract-gated enterprise item. Code readiness ≠ operational readiness.

---

## 2026-06-17 — AI Quality Re-Run

### D-009: AI output confidence gradient (4 levels)
- **Context:** All suggestions had uniform 50% confidence.
- **Decision:** Re-score to 20%, 50%, 70%, 90% based on evidence grounding.
- **Rationale:** Differentiated confidence gives reviewers better decision context.

---

## 2026-05-28 — Reality Hardening

### D-010: Download security standard (auth → 404 → audit)
- **Context:** Download routes had inconsistent security.
- **Decision:** Three-layer pattern: auth check, tenant-safe 404, audit trail.
- **Rationale:** 404 prevents tenant enumeration attacks while maintaining UX.

### D-011: createdById on 10 models
- **Context:** Records had no creation attribution.
- **Decision:** Add `createdById` to core business models, DecisionEvidence model, platformOrganizationId to SunbulClient.
- **Rationale:** Required for governance and audit trail completeness.
