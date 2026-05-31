> **Historical — not authoritative.** Aspirational v0.2 expansion program map (2026-05-29). Superseded by `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`.

---

# AQLIYA Eid Expansion Program — v0.2 Execution Map (Agent 0)

**Date:** 2026-05-29  
**Agent:** 0 — Program Coordinator / Reality Lock  
**Branch:** `eid-sprint-stabilization-2026-05-29`  
**HEAD:** `6034950` — `chore(sprint): stabilize Eid sprint readiness`  
**Classification (baseline):** Controlled pilot ready with conditions  
**Trust principle:** AI assists. Humans decide. Evidence governs.

---

## Scope Inspected

### Git (light commands)

| Command | Result |
| ------- | ------ |
| `git status --short` | **Clean** — no modified or untracked paths |
| `git branch --show-current` | `eid-sprint-stabilization-2026-05-29` |
| `git rev-parse --short HEAD` | `6034950` |
| `git log -3 --oneline` | `6034950` stabilize · `c9e9adb` Session 4 gate · `5aad2c9` L3 certification |

**Baseline verification:** Matches user-stated branch, commit (`60349508` full / `6034950` short), and clean working tree. Stabilization commit (`6034950`) includes 41 files (+1491 / −505): sprint code, LocalContentOS pilot doc sync, commercial funnel, platform hardening, stabilization report, and `settings/loading.tsx`.

### Authority & status docs (read)

| Document | Role in this plan |
| -------- | ----------------- |
| `README.md`, `AGENTS.md` | Entry + agent contract; Phase 7–9 baseline |
| `docs/reports/aqliya-post-sprint-stabilization-report.md` | Current gate classification + open conditions |
| `docs/reports/aqliya-eid-sprint-final-readiness-report.md` | Sprint closure risks + agent stream map |
| `docs/reports/localcontentos-v01-gap-analysis.md` | LC P0–P3 backlog |
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Phases 0–9 done; Phase 10 deferred |
| `docs/source-of-truth/READINESS_GATES.md` | Pilot-ready gate; commercial blockers listed |
| `docs/official/AQLIYA_MASTER_REFERENCE.md` | Identity + product maturity truth |
| `docs/official/aqliya-vision-v1.1.md` | Doctrine positioning |
| `docs/official/aqliya-implementation-rules-v1.1.md` | Change discipline |
| `docs/official/aqliya-product-taxonomy-v1.1.md` | Product boundaries |
| `docs/reports/aqliya-eid-sprint-reality-check.md` | Prior Agent 0 sprint plan (superseded for v0.2 roles) |

### Agent sprint reports (indexed, not re-read in full)

- `aqliya-core-platform-hardening-report.md` (Agent 1)
- `auditos-eid-hardening-report.md` (Agent 2)
- `decisionos-workflowos-cleanup-report.md` (Agent 4)
- `aqliya-commercial-funnel-activation-report.md` (Agent 5)
- `aqliya-docs-governance-cleanup-report.md` (Agent 6 sprint pass)

### Not run (per low-load protocol)

- `npm run build`, `npm run lint`, `npm test`, `npm run build:safe`
- Dev server, Docker, browser smoke

---

## Findings

### Baseline reality (post-stabilization)

| Area | Status | Evidence |
| ---- | ------ | -------- |
| **Git hygiene** | **Resolved** | Named branch; sprint committed at `6034950`; clean tree |
| **TypeScript** | **Resolved** (per stabilization) | `review-page.tsx` fix in commit; Agent 5 reported `tsc` pass |
| **Prisma schema** | **Stable** | No sprint schema diff; `prisma validate` pass per stabilization |
| **LocalContentOS pilot docs** | **Mostly resolved** | 8 onboarding/sales-pack files synced in `6034950`; gap analysis P0 doc items addressed |
| **Full validation suite** | **Open** | Lint, jest, build:safe not re-run on integrated `6034950` tree |
| **External org pilot** | **Open** | Session 4 rehearsal PASS; first real external org + host rotation not executed |
| **LocalContentOS pilot closure** | **Open** | ~13 manual smoke mutations pending; P1 workflow wiring gaps remain |
| **DecisionOS B8 gates** | **Accepted backlog** | Review/approval/export gates incomplete; not AuditOS pilot blocker |
| **Commercial outreach** | **Ready with conditions** | Batch-1 plan committed; webhook fail-open requires ops monitoring |

### Product maturity snapshot (unchanged from matrix)

| System | Level | v0.2 target (if expansion succeeds) |
| ------ | ----- | ------------------------------------- |
| AuditOS | L5 Conditional GO | L5 → external pilot executed (not L6) |
| LocalContentOS | L5 with conditions | L5 pilot-closed (workflow + smoke) |
| DecisionOS | L4 | L4+ (optional B8 subset in v0.2) |
| WorkflowOS | L4 | L4 stable |
| Platform admin | L4 hardened | L4 + optional org parity |
| Commercial funnel | L4 | L4 activated (controlled pilot only) |

### Priority model — current gaps

#### P0 — Blockers (must close before **External pilot ready** or Batch-1 outreach)

| ID | Gap | Owner | Dependency |
| -- | --- | ----- | ---------- |
| P0-1 | **Medium validation on `6034950`** — targeted eslint → jest → `build:safe` | Agent 6 | None (start immediately) |
| P0-2 | **First real external org pilot session** + credential rotation log | Agent 2 + human ops | P0-1 light pass (`tsc` confirm) |
| P0-3 | **LocalContentOS human smoke** — ~13 mutation items on `lc-project-demo-001` | Agent 3 + human | None (parallel with P0-1) |
| P0-4 | **Commercial claim enforcement** in Batch-1 outreach — no L6 / production / external-certified language | Agent 5 | Reads P0-1/P0-2 status only |

#### P1 — Improvements (controlled pilot quality; required for **LocalContentOS pilot-closed**)

| ID | Gap | Owner | Dependency |
| -- | --- | ----- | ---------- |
| P1-1 | LC download route: real review/approval metadata (not hardcoded `"Pending"`) | Agent 3 | P0-3 smoke informs acceptance |
| P1-2 | LC `createReview` → set project `InReview`; return/re-review UI | Agent 3 | P1-1 |
| P1-3 | LC classification UI wired to `classifyLocalContentSpendRecordAction` | Agent 3 | None |
| P1-4 | AuditOS external pilot evidence reports updated post-session | Agent 2 | P0-2 |
| P1-5 | `READINESS_GATES.md` + matrix Phase 10 row sync to validation evidence | Agent 7 | Agent 6 medium pass |
| P1-6 | DecisionOS B8 subset (review gate OR export gate — pick one slice) | Agent 4 | Agent 6 green |
| P1-7 | Optional LC `platformOrganizationId` guard parity | Agent 1 | Explicit approval gate |

#### P2 — Polish (quality; not outreach-blocking)

| ID | Gap | Owner |
| -- | --- | ----- |
| P2-1 | LC dedicated PDF/XLSX builders per report type | Agent 3 |
| P2-2 | Arabic PDF font embedding | Agent 3 |
| P2-3 | Pilot webhook monitoring SOP + CSV fallback verification | Agent 5 |
| P2-4 | Settings shell / prototype banner consistency | Agent 4 |
| P2-5 | Integration test PostgreSQL / `docker-compose.test.yml` CI path | Agent 6 |

#### P3 — Platform parity & future (needs explicit approval)

| ID | Gap | Owner |
| -- | --- | ----- |
| P3-1 | Governance Core actor-lineage adoption across products | Agent 1 |
| P3-2 | Automated backup scheduling (manual only today) | Ops / Agent 7 docs |
| P3-3 | Production malware scanner integration | Ops |

#### Out of scope (v0.2 expansion)

- New Prisma models or migrations (unless user explicitly approves a scoped task)
- AI classification, LCGPA / regulator integration
- L6 production certification (SSO, penetration test, automated backup restore)
- On-Prem / Air-Gapped / Local AI runtime packages
- SalesOS, LocalContactOS, AQLIYA Studio implementation
- AuditOS workflow logic redesign (UX/copy fixes only unless bug)
- `/auditos/*` mutations or real data

---

## Agent Boundaries (v0.2 — non-overlapping)

**Overlap prevention rules:**

1. **One file owner** — if two agents need the same path, Agent 0 assigns sequential dependency; no parallel edits.
2. **Agent 6 does not implement features** — only runs validation and reports; may apply minimal fixes only when explicitly tasked as blocker fix with file owner consent.
3. **Agent 7 runs last** — no matrix/readiness reclassification before Agent 6 medium pass.
4. **Doctrine vs product docs** — Agent 7 owns `docs/source-of-truth/*` and closure reports; Agent 5 owns `docs/product/launch/*` and marketing copy; neither edits `docs/official/*` without explicit identity task.
5. **Demo safety** — only Agent 2 touches `/auditos/*` if needed; must stay mock/read-only.

### Agent 0 — Program Coordinator / Reality Lock

| Owns | Does not own |
| ---- | ------------ |
| Execution maps, dependency graphs, classification | Application code, validation runs, product patches |
| Agent boundary disputes | Feature implementation |
| This document + handoff to parent | Matrix row updates (delegates to Agent 7) |

**Deliverable:** `docs/archive/historical-strategy/aqliya-eid-expansion-program-plan.md` (this file).

---

### Agent 1 — Core Platform & Security Perimeter

| Owns | Paths (exclusive) |
| ---- | ------------------- |
| Middleware matchers, JWT public allowlists | `src/middleware.ts` |
| Platform ADMIN gates, tenant scope on admin surfaces | `src/app/(dashboard)/settings/audit-logs/*`, `monitoring/*` |
| Download token org resolution (cross-product) | `src/actions/download-token-actions.ts` |
| Shared governance guards, org parity **when approved** | `src/lib/governance/*`, guard changes in product libs **only when P1-7 approved** |

| Does not own |
| ------------ |
| AuditOS engagement workflow UX (Agent 2) |
| LocalContentOS business workflow (Agent 3) |
| DecisionOS decision lifecycle (Agent 4) |
| Marketing routes, pilot-review API (Agent 5) |
| Validation orchestration (Agent 6) |
| Status matrix / readiness gates (Agent 7) |

**v0.2 scope:** P1-7 (optional), P3-1 (if approved). **Default:** no work unless P1-7 explicitly launched.

---

### Agent 2 — AuditOS Product & External Pilot Execution

| Owns | Paths (exclusive) |
| ---- | ------------------- |
| AuditOS workspace UX, workflow guard, review/approval UI | `src/app/audit/*`, `src/components/audit/*`, `src/lib/audit/*`, `messages/ar.json` (audit keys only) |
| External pilot ops execution & session evidence | `docs/pilot/auditos-*`, `docs/reports/auditos-*` (session/evidence only) |
| AuditOS operator reports post-session | Updates to session reports, not doctrine |

| Does not own |
| ------------ |
| Platform admin RBAC (Agent 1) |
| LocalContentOS (Agent 3) |
| Marketing / contact funnel (Agent 5) |
| `/auditos/*` demo mutations (forbidden) |
| Global validation (Agent 6) |

**v0.2 scope:** P0-2, P1-4. Primary human ops dependency for external org session.

---

### Agent 3 — LocalContentOS Pilot Closure

| Owns | Paths (exclusive) |
| ---- | ------------------- |
| LC workspace routes, actions, services, exports | `src/app/local-content/*`, `src/actions/localcontent-actions.ts`, `src/lib/local-content/*`, LC API download routes |
| LC pilot onboarding / smoke documentation | `docs/product/localcontentos-v0.1/*`, `docs/systems/local-content-os/README.md` |
| LC-specific tests | `src/lib/local-content/__tests__/*`, `src/__tests__/unit/localcontent-*` |

| Does not own |
| ------------ |
| Platform middleware / shared download tokens (Agent 1) |
| AuditOS (Agent 2) |
| DecisionOS (Agent 4) |
| Product marketing page copy beyond LC claims (Agent 5) |
| Matrix phase rows (Agent 7) |

**v0.2 scope:** P0-3, P1-1, P1-2, P1-3, P2-1, P2-2.

---

### Agent 4 — DecisionOS & WorkflowOS Adjacent Systems

| Owns | Paths (exclusive) |
| ---- | ------------------- |
| DecisionOS workspace, evidence UI, decision actions | `src/app/decisions/*`, `src/actions/decision-*`, `src/components/decisions/*` |
| WorkflowOS workspace, Sunbul redirect surfaces (naming only) | `src/app/workflowos/*`, `src/app/sunbul/*`, workflow client actions |
| Cross-product platform nav labels (DecisionOS / WorkflowOS entries) | `src/components/platform/command-palette.tsx`, `platform-sidebar.tsx`, `platform-header.tsx`, `src/lib/platform/navigation.ts` **only for D/W entries** |

| Does not own |
| ------------ |
| AuditOS components (Agent 2) |
| LocalContentOS (Agent 3) |
| Platform security admin pages (Agent 1) |
| Marketing (Agent 5) |
| B8 scope beyond one chosen slice without Agent 0 re-prioritization |

**v0.2 scope:** P1-6 (one B8 slice), P2-4. **Conflict rule:** Agent 4 must not edit `command-palette.tsx` in same pass as Agent 2 or Agent 5.

---

### Agent 5 — Commercial Funnel & Pilot Outreach Ops

| Owns | Paths (exclusive) |
| ---- | ------------------- |
| Marketing pages, contact intake, pilot CTAs | `src/app/(marketing)/*` |
| Pilot review API (intake only) | `src/app/api/pilot-review/*` |
| Launch ops docs | `docs/product/launch/*`, `docs/api/pilot-review-webhook-scenario.md` |

| Does not own |
| ------------ |
| Governed workspace code (Agents 1–4) |
| `docs/official/*`, `docs/source-of-truth/*` (Agent 7) |
| Pilot session execution (Agent 2) |
| Validation (Agent 6) |

**v0.2 scope:** P0-4, P2-3. **Constraint:** no production/L6/On-Prem claims; pilot-fit-review language only.

---

### Agent 6 — Validation & Build Gate

| Owns | Actions |
| ---- | ------- |
| Validation command execution & reporting | `tsc`, `prisma validate`, targeted eslint, jest, `build:safe` |
| Validation evidence tables in agent report | `docs/reports/aqliya-v02-validation-gate-report.md` (to create) |

| Does not own |
| ------------ |
| Feature implementation (except minimal blocker fix when Agent 0 explicitly pairs with file owner) |
| Product docs, matrix, readiness gates |
| Pilot ops execution |

**v0.2 scope:** P0-1, P2-5. **Blocks Agent 7** until medium pass documented.

**Approved command sequence (medium pass):**

```text
1. npx tsc --noEmit
2. npx prisma validate
3. npx eslint <changed-paths> --quiet   # or npm run lint -- --quiet if approved
4. npm test                              # or scoped jest if approved
5. npm run build:safe                    # if approved
```

---

### Agent 7 — Release Readiness & Documentation Sync (last)

| Owns | Paths (exclusive) |
| ---- | ------------------- |
| Closure / expansion reports | `docs/reports/aqliya-v02-expansion-closure-*.md` |
| Status matrix phase rows | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` (Phase 10+) |
| Readiness gates sync | `docs/source-of-truth/READINESS_GATES.md` |
| Executive Go/No-Go classification | Narrative only — evidence from Agents 2, 3, 6 |

| Does not own |
| ------------ |
| Application code |
| Marketing copy (Agent 5) |
| Pilot session facilitation (Agent 2 + human) |
| Validation runs (Agent 6) |

**v0.2 scope:** P1-5, final classification: `External pilot ready with conditions` OR remain `Controlled pilot ready with conditions`.

---

## Execution Order & Dependencies

### Phase map

```text
Phase 0 — Reality lock (DONE)
  Agent 0: verify git + read authority docs + publish this plan

Phase 1 — Parallel launch (no cross-file conflicts)
  ┌─────────────────┬─────────────────┬─────────────────┐
  │ Agent 6         │ Agent 3         │ Agent 5         │
  │ Light validate  │ Human smoke     │ Outreach claim  │
  │ tsc + prisma    │ checklist P0-3  │ audit P0-4      │
  └────────┬────────┴────────┬────────┴────────┬────────┘
           │                 │                 │
           ▼                 │                 │
Phase 2 — Product streams (after Agent 6 light PASS)
  ┌────────┴────────┬────────────────┬────────────────┐
  │ Agent 2         │ Agent 3        │ Agent 4        │
  │ External pilot  │ LC P1 code     │ B8 one slice   │
  │ P0-2 + P1-4     │ P1-1..P1-3     │ P1-6           │
  └────────┬────────┴────────┬───────┴────────┬───────┘
           │                 │                │
           │    Optional parallel if approved:  │
           │         Agent 1 — P1-7 only      │
           ▼                 ▼                ▼
Phase 3 — Medium validation gate
  Agent 6: eslint → jest → build:safe → validation report

Phase 4 — Closure (sequential, last)
  Agent 7: matrix Phase 10, READINESS_GATES, Go/No-Go report

Phase 5 — Polish (optional, post-closure)
  Agents 3, 4, 5: P2-* items without re-opening P0
```

### Recommended parallel launch order (parent agent)

**Wave A — launch immediately in parallel:**

| Order | Agent | Task | Blocks |
| ----- | ----- | ---- | ------ |
| 1 | **Agent 6** | P0-1 light (`tsc`, `prisma validate`) | Agent 7 |
| 2 | **Agent 3** | P0-3 human smoke execution + record timestamps | LC pilot-closed narrative |
| 3 | **Agent 5** | P0-4 Batch-1 claim audit (docs-only until validation green) | Outreach send |

**Wave B — after Agent 6 light PASS:**

| Order | Agent | Task |
| ----- | ----- | ---- |
| 4 | **Agent 2** | P0-2 external org pilot + rotation log |
| 5 | **Agent 3** | P1-1 → P1-3 LC workflow wiring |
| 6 | **Agent 4** | P1-6 one DecisionOS B8 slice (scope locked at kickoff) |

**Wave C — gate:**

| Order | Agent | Task |
| ----- | ----- | ---- |
| 7 | **Agent 6** | Medium validation full pass |
| 8 | **Agent 7** | P1-5 docs sync + expansion closure Go/No-Go |

**Do not launch in parallel:** Agent 2 + Agent 5 on same marketing/audit copy files; Agent 3 + Agent 1 on LC guards without P1-7 approval; Agent 4 + Agent 2 on `command-palette.tsx`.

### Target classifications after v0.2

| Milestone | Classification | Required evidence |
| --------- | -------------- | ----------------- |
| Minimum success | Controlled pilot ready with conditions | Phase 3 medium validation pass; smoke recorded |
| Stretch success | External pilot ready with conditions | P0-2 executed + P0-1 pass + outreach claim audit |
| LC stretch | LocalContentOS pilot-closed | P0-3 + P1-1..P1-3 + smoke re-run |
| Not in v0.2 scope | Production ready / L6 | Explicitly forbidden claim |

---

## Files Changed

| File | Change |
| ---- | ------ |
| `docs/archive/historical-strategy/aqliya-eid-expansion-program-plan.md` | **Created** — v0.2 execution map, agent boundaries, priority model |

No application code or schema changes (Agent 0 scope).

---

## Commands Run

```text
git -C "C:/Users/PC/Documents/Aqliya" status --short
git -C "C:/Users/PC/Documents/Aqliya" log -3 --oneline
git -C "C:/Users/PC/Documents/Aqliya" branch --show-current
git -C "C:/Users/PC/Documents/Aqliya" rev-parse --short HEAD
git -C "C:/Users/PC/Documents/Aqliya" show 6034950 --stat --oneline -1
```

Plus: read-only file reads of authority docs and sprint reports listed in Scope Inspected.

---

## Validation

| Command | Result |
| ------- | ------ |
| `git status` / `git log` / `git branch` | **Run — Pass** |
| `npx tsc --noEmit` | **Not run** (delegated to Agent 6 P0-1) |
| `npx prisma validate` | **Not run** (delegated to Agent 6 P0-1) |
| `npm run lint` / `npm test` / `build:safe` | **Not run** (delegated to Agent 6 Phase 3) |

**Interpretation:** Baseline claims `tsc` / `prisma validate` / targeted checks passed per prior stabilization on `6034950`; **not re-verified by Agent 0 this run**.

---

## Risks

| Risk | Severity | Mitigation |
| ---- | -------- | ---------- |
| Validation drift — stabilization `tsc` pass not re-run today | Medium | Agent 6 Wave A first action |
| External pilot blocked on human ops availability | High | Agent 2 reports BLOCKED explicitly; do not upgrade classification |
| Parallel agents edit shared platform nav files | Medium | Boundaries above; Agent 0 resolves conflicts |
| LC smoke requires human form interaction | Medium | Agent 3 records evidence; AI cannot substitute |
| Webhook fail-open on pilot intake | Medium | Agent 5 CSV fallback SOP before Batch-1 send |
| DecisionOS B8 scope creep | Medium | One slice only in P1-6; defer remainder |
| Over-claiming external pilot in outreach | High | Agent 5 P0-4 + Agent 7 final classification |
| Integration tests without PostgreSQL | Low | P2-5; not Wave A blocker |

---

## Remaining Work

1. **Agent 6** — Execute P0-1 light then Phase 3 medium validation on `6034950`.
2. **Agent 2** — Execute P0-2 real external org pilot session; update evidence reports.
3. **Agent 3** — Complete P0-3 smoke + P1 LC workflow wiring.
4. **Agent 5** — P0-4 outreach claim audit; hold Batch-1 send until Wave C gate.
5. **Agent 4** — Optional P1-6 B8 slice after validation green.
6. **Agent 1** — Idle unless P1-7 `platformOrganizationId` parity explicitly approved.
7. **Agent 7** — Phase 10 matrix row + expansion closure after Agent 6 medium pass.

---

## Recommendation

**Proceed with v0.2 expansion using Wave A parallel launch:**

1. **Agent 6** — Confirm engineering gate on `6034950` (light then medium).
2. **Agent 3** — Run LocalContentOS human smoke checklist (unblocks LC pilot-closed path).
3. **Agent 5** — Audit Batch-1 outreach claims (docs-only; no send until Wave C).

**Do not upgrade public classification** beyond *Controlled pilot ready with conditions* until Agent 6 medium pass **and** Agent 2 external pilot evidence exist.

**Parent handoff — P0 blockers summary:**

| P0 | Blocker |
| -- | ------- |
| P0-1 | Medium validation not re-run on committed stabilization tree |
| P0-2 | First real external org pilot session not executed |
| P0-3 | LocalContentOS ~13 mutation smoke items pending |
| P0-4 | Batch-1 outreach claim enforcement before send |

---

## Agent 0 Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE** |
| **Code changed** | No |
| **Schema changed** | No |
| **Classification** | Controlled pilot ready with conditions (unchanged) |
| **Deliverable** | `docs/archive/historical-strategy/aqliya-eid-expansion-program-plan.md` |

---

*Agent 0 — Eid Expansion Program v0.2. Reality locked at `6034950`; implementation delegated to Agents 1–7 per boundaries above.*
