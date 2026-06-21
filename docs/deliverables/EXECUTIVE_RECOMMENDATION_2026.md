# Executive Recommendation 2026

**Classification:** Board-level strategic decision brief  
**Date:** 2026-06-21  
**Last updated:** 2026-06-21 — Confirmed Executive Priority Stack ratified  
**Author track:** Independent Strategic Architecture Program (no code changes)  
**Evidence base:** Six deliverables produced 2026-06-21 + repository inspection + AGENTS.md §28.1 validation state  
**Authority:** This document is the **Program Director reference** for post-stabilization sequencing. Implementation agents must not reorder these tiers without explicit executive approval.

---

## Confirmed Executive Priority Stack

**Status:** RATIFIED — aligns with platform hierarchical sequence (Auth → Evidence → Core → Knowledge → Enterprise).

> **مبدأ:** الحوكمة والصلاحيات أولاً، ثم الدليل والسجل، ثم Core المشترك، ثم المعرفة وAI، وأخيراً تشغيل المؤسسة.

### Tier 1 — Next 30 Days (Foundation Layer)

| Priority | Arabic | English | Backlog / Program |
|----------|--------|---------|-------------------|
| 1 | **طبقة التفويض الموحدة** | Unified Authorization Layer | ABAC Phase 0–1 · `ABAC_READINESS_ASSESSMENT.md` |
| 2 | **تطبيق Core Access** | Core Access Enforcement | `IC-P0-03` · `requireServerActionAccess()` on downloads, exports, AI |
| 3 | **سجل الأدلة** | Evidence Registry | `IC-P0-04` · facade over product evidence models |
| 4 | **استعادة محرك الإشارات** | Signal Engine Recovery | `IC-P0-02` · replace deleted `platform/signals/` stubs |
| 5 | **إغلاق تقارب التدقيق** | Audit Convergence Closure | `IC-P0-01` · retire `platform-audit.ts` (9 call sites) |

**Execution note (dependency-safe within Tier 1):** Audit Closure (5) may start in Week 1 in parallel with Auth fixes — it has no dependency on the other four items. Items 1–2 must complete before Evidence (3) enforcement hooks. Signals (4) depend on stable audit writes.

**Tier 1 exit criteria (Day 30):**

- Single canonical audit write path (`writePlatformAuditLog`)
- Unified authorization gate on all sensitive paths
- Evidence lookup API (registry facade)
- Cross-product signals restored in task/activity runtimes
- Authorization denials logged to PlatformAuditLog

---

### Tier 2 — Days 31–90 (Shared Core Layer)

| Priority | Arabic | English | Backlog / Program |
|----------|--------|---------|-------------------|
| 1 | **محرك Workflow مشترك** | Shared Workflow Engine | `IC-P2-02` · extract from WorkflowOS |
| 2 | **رسم Evidence Graph مشترك** | Shared Evidence Graph | Evidence registry → graph linkage · `IC-P1-06` memory |
| 3 | **Knowledge Runtime مشترك** | Shared Knowledge Runtime | `IC-P3-02` · ISA/ISQM loaders · Knowledge K2 |
| 4 | **طبقة RAG** | RAG Layer | `IC-P1-04` · `core/knowledge/` facade |
| 5 | **إطار تقييم AI** | AI Evaluation Framework | Skills eval + model governance runtime wiring · `IC-P3-01` |
| 6 | **حوكمة التكلفة** | Cost Governance | budget-manager / spend-tracker under Core AI gate |

**Tier 2 prerequisite:** Tier 1 complete. `src/lib/core/` namespace (`IC-P1-01`) opens at Day 31.

**Tier 2 exit criteria (Day 90):**

- Core facades for governance, AI, audit, knowledge, workflow
- ABAC shadow mode operational (log-only)
- ISA rules loader wired to knowledge-foundation
- Intelligence workspace MVP at `/intelligence/*`
- Event contract on PlatformAuditLog metadata (design + partial rollout)

---

### Tier 3 — After Tier 2 Only (Enterprise Layer)

| Priority | Arabic | English | Notes |
|----------|--------|---------|-------|
| 1 | **تصلية المؤسسة** | Enterprise Hardening | L6 program — load testing, multi-instance validation |
| 2 | **SSO / SCIM** | SSO / SCIM | **Already L4 built** — scope is production hardening, scale, operator runbooks, not greenfield |
| 3 | **DR / HA** | DR / HA | Live RDS restore drill (I-01) · failover validation |
| 4 | **اختبار الاختراق** | Pentest | E-01 — commercial/enterprise blocker |
| 5 | **برنامج الامتثال** | Compliance Program | SOC2 Type II (E-02) · ISO 27001 gap (E-03) |

**Explicitly deferred until Tier 3:** Full Event Bus · AQLIYA Studio · new products (ComplianceOS, LegalOS, GovOS) · On-Prem/Air-Gap packaging · autonomous agent platform.

---

### Platform Hierarchy (Confirmed)

```
Tier 1  Governance + Auth     ← Unified Authorization · Core Access Enforcement
          ↓
        Evidence + Audit      ← Evidence Registry · Audit Convergence · Signals
          ↓
Tier 2  Shared Core           ← Workflow · Evidence Graph · Knowledge · RAG · AI Eval · Cost
          ↓
Tier 3  Enterprise Ops        ← Hardening · SSO/SCIM scale · DR/HA · Pentest · Compliance
```

This sequence matches repository reality: products at L5 must not be destabilized; Core consolidation follows auth and evidence unification.

---

## Context

Repository stabilization is substantially complete:

- TypeScript clean, build passing, tests passing, Prisma valid
- Audit Event Unification, PlatformAuditLog, hash chain, cross-product audit search, chain verification — **done**
- Product portfolio at 8 L5 pilot-ready surfaces
- Intelligence Core Discovery documented

This recommendation addresses **what comes next** — not repeating completed work.

---

## 1. What is the biggest architectural risk?

### **Authorization fragmentation with dormant ABAC**

AQLIYA has three parallel role systems (`User.role`, `AuditUser.role`, DB `Role.slug`), a built ABAC engine with **zero production wiring**, and a unified authorization gate (`CoreAccessControl` / `requireServerActionAccess`) with **zero production adoption**. Meanwhile, ~200+ scattered permission checks across products create inconsistent enforcement — especially on evidence downloads, exports, and AI execution paths.

**Why this is #1:** Every Intelligence Core consolidation, cross-product feature, and enterprise RFP depends on provable access control. Building Core engines on fragmented auth embeds security debt that becomes exponentially expensive to fix. The latent defect in `hasPermission()` (missing org scope) becomes a critical vulnerability the moment DB RBAC is wired.

**Evidence:**
- `src/lib/platform/abac/abac-service.ts` — no production imports
- `src/core/access/server-action-guard.ts` — tested only
- `src/lib/platform/access/rbac-service.ts` — `hasPermission()` uncalled
- Contacts sensitivity gate is the only attribute-like enforcement pattern

**Secondary risk:** Signal engine deletion without replacement — degrades cross-product intelligence surfaces (task center, operator dashboard) and creates visible product regression.

---

## 2. What is the biggest architectural opportunity?

### **Intelligence Core extraction onto a unified platform layer**

The repository already contains a **real, working Intelligence Core** spread across `src/lib/governance/` (608-line retrieval router), `src/lib/ai/` (orchestrator, providers, budget, eval), `src/lib/platform/` (audit, memory, model governance, notifications), and `src/lib/rag/` (governed RAG). This is not a greenfield build — it is an **organizational and interface problem**.

Consolidating into `src/lib/core/` with stable facades would:

- Eliminate 4 parallel AI adapter paths
- Unify memory (graph vs query log)
- Enable ABAC at Core boundary
- Provide the substrate for event contract and future bus
- Reduce per-product implementation cost by an estimated 30–40% for new governed features

**Evidence:** 71 AI files, 25 governance files, institutional memory at 843 lines, model governance service implemented, product-ai-bridge adopted by LocalContentOS/Office AI/Sales — all real, all fragmented.

**Commercial angle:** "Private Governed Institutional Intelligence Platform" becomes demonstrable through `/intelligence/*` workspace consuming unified Core — not marketing copy.

---

## 3. What should be built next?

### **Program: Tier 1 Foundation — 30 days** (see Confirmed Executive Priority Stack)

Sequential, non-overlapping workstreams aligned to ratified priorities:

| Week | Deliverable | Backlog ID | Tier 1 Priority |
|------|-------------|------------|-----------------|
| 1–2 | Unified Authorization Layer — org scope, role casing, ABAC prep | ABAC Phase 0 | #1 |
| 2–3 | Core Access Enforcement — gate on downloads, exports, AI | IC-P0-03 | #2 |
| 3 | Evidence Registry facade (read-only over product models) | IC-P0-04 | #3 |
| 3–4 | Signal Engine Recovery (replace deleted stubs) | IC-P0-02 | #4 |
| 1 + 4 | Audit Convergence Closure — `platform-audit.ts` migration (9 files) | IC-P0-01 | #5 |

**Exit criteria (Day 30):**
- Single audit write path for all products
- All sensitive mutations through unified gate
- Task/activity runtimes return real cross-product signals
- Evidence lookup API exists (facade phase)
- Denial audit events in PlatformAuditLog

This program **directly enables** ABAC shadow mode and Core namespace extraction without destabilizing L5 products.

---

## 4. What should NOT be built yet?

| Program | Readiness | Reason |
|---------|----------:|--------|
| **Full Event Bus** | 4/10 | No event contract, no Core interfaces, signal layer broken |
| **AQLIYA Studio** | 4/10 | No plugin system, no sandbox, Core not extracted |
| **Agent Platform (autonomous)** | 5/10 | No tool registry; conflicts with trust principle |
| **ABAC policy enforcement in production** | 5/10 | Gate not wired; policies without enforcement = false confidence |
| **New products** (ComplianceOS, LegalOS, GovOS) | L0 | 8 L5 products exceed current ops capacity |
| **On-Prem / Air-Gap packaging** | L0 | Do not sell — AGENTS.md §20 commercial truthfulness |
| **RAG vector ingest at scale** | Blocked | Legal sign-off on embedding licences |
| **Prisma schema overhaul** | N/A | Parallel director rule — schema frozen in parallel cycles |

**Do not rebuild:** Audit unification, hash chain, cross-product audit search — these are done.

---

## 5. Recommended 30-Day Plan (Tier 1)

Aligned to **Confirmed Executive Priority Stack** — execution order respects dependencies.

### Days 1–10: Unified Authorization Layer + Audit Closure (parallel tracks)

**Priority #1 — Unified Authorization Layer**

- [ ] Fix `hasPermission()` organizationId filter
- [ ] Fix `can()` role casing (`ADMIN` → `admin`)
- [ ] Document canonical role mapping (User / AuditUser / DB Role)
- [ ] Add denial logging scaffold to authorization gate

**Priority #5 — Audit Convergence Closure** (parallel — no blocker)

- [ ] Migrate 9 `platform-audit.ts` call sites → `writePlatformAuditLog`
- [ ] Verify WorkflowAuditEvent dual-write gap — document or fix

### Days 11–18: Core Access Enforcement

**Priority #2 — Core Access Enforcement**

- [ ] Wire `requireServerActionAccess()` on evidence download routes (audit, decision, LC)
- [ ] Wire gate on export actions (WorkflowOS, DecisionOS, LC, Contacts)
- [ ] Wire gate on `product-ai-bridge` entry
- [ ] AuditOS: adapter pattern preserving `AuditUser.role`

### Days 19–24: Evidence Registry

**Priority #3 — Evidence Registry**

- [ ] Evidence registry facade over existing product models
- [ ] Unified lookup API (ownership, sensitivity, product linkage)
- [ ] Hook download authorization through registry

### Days 25–30: Signal Engine Recovery

**Priority #4 — Signal Engine Recovery**

- [ ] Define signal taxonomy (platform, decision, sales commercial)
- [ ] Implement signal collection service
- [ ] Restore `unified-task-runtime.ts` and `unified-activity-runtime.ts`
- [ ] Resolve Sales v02 cross-product signal TODOs
- [ ] Light validation: `npx tsc --noEmit`, targeted tests on changed paths

**30-day success metric:** Enterprise Readiness Authorization score 52 → 65; Architecture score 68 → 72.

---

## 6. Recommended 90-Day Plan (Tier 2 + Tier 3 Prep)

### Days 31–45: Core Namespace + Shared Workflow Engine

**Tier 2 #1 — Shared Workflow Engine**

- [ ] Create `src/lib/core/` with backward-compatible re-exports
- [ ] Extract workflow state machine from WorkflowOS → `core/workflow/`
- [ ] Core adoption enforcer — lint rule on product → internal imports

**Supporting (Core P1)**

- [ ] Governance, AI, Audit engine facades

### Days 46–60: Shared Evidence Graph + Knowledge Runtime

**Tier 2 #2 — Shared Evidence Graph**

- [ ] Link evidence registry to institutional memory graph
- [ ] Memory engine consolidation (graph + query log)

**Tier 2 #3 — Shared Knowledge Runtime**

- [ ] ISA rules loader + ISQM Foundation wiring (Knowledge K2)
- [ ] Reconcile LC verification matrices (36 vs 8 items)
- [ ] Add `knowledge-foundation/` to DOCUMENTATION_AUTHORITY.md

### Days 61–75: RAG Layer + AI Evaluation + Cost Governance

**Tier 2 #4 — RAG Layer**

- [ ] Move `src/lib/rag/` under `core/knowledge/` facade
- [ ] Admission-status checks at retrieval boundary

**Tier 2 #5 — AI Evaluation Framework**

- [ ] Unify skills eval + model governance under Core AI
- [ ] Wire model approval before cloud provider calls (production mode)

**Tier 2 #6 — Cost Governance**

- [ ] Budget/spend tracker behind Core AI gate
- [ ] Cost attribution per product/org in audit metadata

**Cross-cutting (Tier 2)**

- [ ] ABAC shadow mode in authorization gate (log-only)
- [ ] Seed default policies: ORG-01, SENS-02, APR-01
- [ ] Intelligence workspace `/intelligence/*` MVP
- [ ] Event contract on PlatformAuditLog metadata

### Days 76–90: Tier 3 Preparation (not full Tier 3 execution)

- [ ] ABAC enforce mode on pilot org (feature-flagged)
- [ ] Staging environment restored
- [ ] Redis rate limiter verified in staging
- [ ] Extend retention policies to product audit tables
- [ ] Schedule penetration test (E-01) — Tier 3 #4 kickoff
- [ ] Run live RDS restore drill (I-01) — Tier 3 #3 kickoff
- [ ] SOC2 readiness gap assessment initiated (E-02) — Tier 3 #5 kickoff
- [ ] SSO/SCIM production hardening runbook (Tier 3 #2 — scale, not build)

**90-day success metric:** Enterprise Readiness overall 62 → 72. Tier 3 (Enterprise Hardening, full DR/HA, Pentest execution, Compliance Program) begins Day 91+.

> **Tier 3 full execution** requires Tier 2 exit criteria met. Do not start Enterprise Hardening or Compliance Program before Shared Core Layer is stable.

---

## 7. Enterprise Readiness Score

| Metric | Score | Classification |
|--------|------:|----------------|
| **Overall Enterprise Readiness** | **62/100** | Pilot Ready ✅ · Commercial Conditional ⚠️ · Enterprise No ❌ |
| Pilot Ready threshold | 75 | **Met (82)** |
| Commercial Ready threshold | 70 | **Not met (58)** |
| Enterprise Ready threshold | 85 | **Not met (42)** |

**Trajectory:** +4 points since 2026-06-19 assessment, driven by audit unification and product L5 portfolio. Next +10 points require authorization unification + Core extraction + ops validation — achievable in 90 days with focused execution.

---

## 8. Top 10 Strategic Priorities (Ratified Stack)

Reflects **Confirmed Executive Priority Stack** — Tier 1 items occupy ranks 1–5.

| Rank | Priority | Tier | Backlog |
|------|----------|------|---------|
| 1 | **Unified Authorization Layer** | 1 | ABAC Phase 0–1 |
| 2 | **Core Access Enforcement** | 1 | IC-P0-03 |
| 3 | **Evidence Registry** | 1 | IC-P0-04 |
| 4 | **Signal Engine Recovery** | 1 | IC-P0-02 |
| 5 | **Audit Convergence Closure** | 1 | IC-P0-01 |
| 6 | **Shared Workflow Engine** | 2 | IC-P2-02 |
| 7 | **Shared Knowledge Runtime + RAG Layer** | 2 | IC-P1-04, IC-P3-02 |
| 8 | **AI Evaluation + Cost Governance** | 2 | IC-P3-01, budget-manager |
| 9 | **Shared Evidence Graph** | 2 | IC-P1-06 + evidence registry |
| 10 | **Enterprise Hardening prep** (staging, DR drill schedule) | 3 prep | I-01, I-03 |

**Tier 3 (after rank 10):** Full Enterprise Hardening · SSO/SCIM scale · DR/HA · Pentest · Compliance Program.

**Explicitly excluded:** Event Bus implementation, AQLIYA Studio, new products, on-prem packaging, autonomous agents.

---

## Decision Summary

| Question | Answer |
|----------|--------|
| Biggest risk? | Authorization fragmentation — ABAC built but unwired; gate designed but unused |
| Biggest opportunity? | Intelligence Core extraction — real engines exist, need unified namespace |
| Build next? | **Tier 1:** Auth → Core Access → Evidence → Signals → Audit (30 days) |
| Do not build yet? | Tier 3 before Tier 2 complete; Event Bus; Studio; new products; on-prem |
| 30-day focus? | Unified Authorization · Core Access · Evidence Registry · Signals · Audit |
| 90-day focus? | Shared Workflow · Evidence Graph · Knowledge · RAG · AI Eval · Cost |
| After 90 days? | Enterprise Hardening · SSO/SCIM scale · DR/HA · Pentest · Compliance |
| Enterprise score? | **62/100** — Pilot yes, Commercial conditional, Enterprise no |

---

## Supporting Deliverables

| Document | Path |
|----------|------|
| Intelligence Core Backlog | `docs/deliverables/INTELLIGENCE_CORE_EXECUTION_BACKLOG.md` |
| ABAC Readiness | `docs/deliverables/ABAC_READINESS_ASSESSMENT.md` |
| Knowledge Governance V2 | `docs/deliverables/KNOWLEDGE_GOVERNANCE_AUDIT_V2.md` |
| Event Bus Discovery | `docs/deliverables/EVENT_BUS_DISCOVERY_REPORT.md` |
| Enterprise Readiness V2 | `docs/deliverables/AQLIYA_ENTERPRISE_READINESS_V2.md` |

---

## Governance Note

This track produced **documentation only** — no code, schema, migration, route, middleware, or test modifications. All recommendations defer implementation to scoped agent programs with explicit file ownership per parallel director rules.

**Trust principle preserved:** AI assists. Humans decide. Evidence governs. No autonomous authorization. No unvalidated enterprise claims.

**Document status:** DONE — Executive Recommendation 2026 ratified with Confirmed Executive Priority Stack (2026-06-21). Program Director authoritative sequencing reference.
