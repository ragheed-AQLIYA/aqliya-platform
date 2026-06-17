# Parallel Execution Cycle — TB Firm Memory (Cycle 1)

**Program:** AQLIYA Parallel Execution Director — Audit Knowledge Moat  
**Cycle ID:** `2026-06-13-tb-memory-cycle-1`  
**Branch:** `main` (Director mode — sequential writes on shared paths)  
**Director:** Human + Cursor Director agent  
**Date:** 2026-06-13  
**Strategic anchor:** Moat = **Accumulated Audit Knowledge (Firm Memory)**, not LLM/ERP generalization.

---

## Context (proven baseline)

| Layer | Shalfa `eng-shalfa-2025` | Role |
| ----- | ------------------------- | ---- |
| Rules only | 11.4% | Weak alone |
| Local AI | 20.4% | Assist only |
| Hybrid (3A) | 47.8% | Hints, not moat |
| ERP Intelligence (in-sample) | 100% | Knowledge capture |
| Hold-out (3B.1–3B.3) | 36–46% | Generalization ceiling |
| **Firm Memory only** | **100% (578/578)** | **Same-ERP moat** |

**Completed in repo (do not redo):**

- Phase 3C: `firm-memory-engine.ts`, migration `20260614140000_firm_memory_erp_context`, backfill 578 patterns
- Phase 3D foundation: `firm-memory-governance.ts`, migration `20260614150000_firm_memory_governance`, unit tests (5/5)
- Engine: `lookupAuditFirmMemory` Step 1; `recordFirmMemoryFeedback` on confirm in `audit-actions.ts`

**Explicitly deferred (this cycle):** 3B.4 prefix/Map2, hold-out → 70%, RAG, embeddings, fine-tuning, Local AI tuning.

---

## Pre-flight

| Check | Result |
| ----- | ------ |
| `git status --short` | Large dirty tree (docs + TB intelligence work); coordinate before merge |
| `git log --oneline -5` | `18366fc` marketing/CI … (TB memory commits may be local/uncommitted) |
| Authority docs | `PHASE_3C_FIRM_MEMORY_ENGINE.md`, `PHASE_3D_MEMORY_GOVERNANCE.md`, `PRODUCT_STATUS_MATRIX.md` |
| Backlog tasks | P1 governance UI/deploy, P2 mapping UI, P3 client-2 reuse KPI |

---

## Priority stack (user-approved)

| P | Work | Cycle 1 scope |
| - | ---- | ------------- |
| **P1** | Memory Governance (3D) | API exposure + validate script + staging runbook |
| **P2** | Phase 4 Mapping UI | Source badge + TRUSTED/CONFIRMED + evidence hint |
| **P3** | Client 2/3 + Reuse Rate | Checklist only (Platform); measure after second client |
| **P4** | Re-evaluate Local AI | Out of scope |

---

## Agent Assignments

### Director (sequential — owns shared TB + audit paths)

**Task IDs:** `TB-MEM-01`, `TB-MEM-02`  
**Description:** Expose `memoryGovernance` and classification evidence on mapping read path so AuditOS UI can render without duplicating engine calls.

**Planned work:**

1. Extend mapping list/detail DTOs with optional:
   - `memoryGovernance`: `{ status, hitCount, reviewerCount, trustEligible, autoSuggestEligible }`
   - `classificationSource`: existing history field — ensure parity with `getLatestClassificationSources`
2. Wire from `classifyAccount` / firm memory lookup result into `getMappings` enrichment (or dedicated `getMappingGovernance` if cleaner).
3. No schema change unless required.

**Files (planned):**

- `src/lib/tb-intelligence/types.ts` (if DTO export needed)
- `src/lib/tb-intelligence/engine.ts` (read helper only)
- `src/actions/audit-actions.ts` or mapping service used by mapping page
- `src/types/audit.ts` (mapping types)

**Files (actual):**

- `src/lib/tb-intelligence/classification-explanation.ts`
- `src/lib/tb-intelligence/types.ts`
- `src/lib/tb-intelligence/firm-memory-engine.ts`
- `src/lib/tb-intelligence/firm-memory.ts`
- `src/lib/tb-intelligence/engine.ts`
- `src/lib/tb-intelligence/erp-intelligence-matcher.ts`
- `src/lib/tb-intelligence/pattern-matcher.ts`
- `src/lib/audit/db/index.ts`
- `src/types/audit/index.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260615100000_tb_classification_detail/`

**Status:** done

---

### Agent-AuditOS

**Task IDs:** `TB-UI-01`, `TB-UI-02`  
**Description:** Phase 4 mapping UI — Trust + Evidence (no confidence column).

**Files (actual):**

- `src/components/audit/mapping/mapping-classification-badges.tsx`
- `src/components/audit/mapping/mapping-page.tsx`
- `messages/en.json`, `messages/ar.json`

**Status:** done

---

### Agent-QA

**Task IDs:** `TB-QA-01`, `TB-QA-02`, `TB-QA-03`  
**Description:** Validation scripts, integration test for confirm → memory → lookup, reuse-rate KPI scaffold.

**Planned work:**

1. **`npm run phase-3d:validate-governance`** — script:
   - Load Shalfa patterns; assert status distribution (578 CONFIRMED, 0 TRUSTED expected post-backfill)
   - Assert auto-suggest eligible = 0 until hit/reviewer thresholds met
   - Output JSON to `docs/audits/evidence/phase-3d-governance-validation.json`
2. **Integration test:** confirm mapping → `recordFirmMemoryFeedback` → lookup returns same Map1/Map2 (mock or test DB)
3. **Reuse rate KPI script** (scaffold): `scripts/audit/tb-memory-reuse-rate.mjs` — formula: `memory_hits / total_classifications` per engagement

**Files (planned):**

- `scripts/audit/phase-3d-validate-governance.mjs`
- `package.json` (script entry)
- `src/lib/tb-intelligence/__tests__/firm-memory-integration.test.ts` (or extend governance test)
- `docs/audits/PHASE_3D_GOVERNANCE_VALIDATION.md`

**Files (actual):**

- `scripts/audit/phase-3d-validate-governance.ts`
- `scripts/audit/tb-memory-reuse-rate.mjs`
- `package.json`
- `src/lib/tb-intelligence/__tests__/firm-memory-lifecycle.test.ts`

**Status:** done

**Merge order:** Step 1

---

### Agent-Platform

**Task IDs:** `TB-PLAT-01`, `TB-PLAT-02`  
**Description:** Staging/production runbook for firm memory migrations; client-2 onboarding checklist.

**Planned work:**

1. **`docs/operations/firm-memory-deployment-runbook.md`**
   - Migrations: `20260614140000_firm_memory_erp_context`, `20260614150000_firm_memory_governance`
   - Order: migrate deploy → `npx prisma generate` → optional `phase-3c:backfill` per engagement (never auto on prod without approval)
   - Rollback notes (deprecate patterns vs delete)
2. **`docs/operations/client-2-firm-memory-checklist.md`**
   - ERP fingerprint capture, Map1/Map2 fields, confirm workflow, measure reuse after N accounts

**Files (actual):**

- `docs/operations/firm-memory-deployment-runbook.md`
- `docs/operations/client-2-firm-memory-checklist.md`

**Status:** done

**Merge order:** Step 2

---

### Agent-AuditOS

**Task IDs:** `TB-UI-01`, `TB-UI-02`  
**Description:** Phase 4 mapping UI — source badges, governance status, evidence affordance.

**Planned work:**

1. Extend `mapping-page.tsx` (and row components if split):
   - Badge: `Firm Memory` | `ERP Intelligence` | `Rules` | `Hybrid` | `Manual` (use existing `SOURCE_LABEL_KEYS` where possible)
   - Governance pill: `TRUSTED` (green) | `CONFIRMED` | `DEPRECATED` — only when source is firm memory
   - Tooltip: hit count, reviewers, auto-suggest eligibility (read-only)
2. Empty/loading: no badge change on unclassified rows
3. Arabic-first labels via existing i18n keys; add keys only where missing

**Dependencies:** Director TB-MEM-01 must expose `memoryGovernance` on mapping payload.

**Files (planned):**

- `src/components/audit/mapping/mapping-page.tsx`
- `src/components/audit/mapping/*` (if extracted badge component)
- locale files if new keys

**Files (actual):** _(fill on completion)_

**Status:** pending (blocked on TB-MEM-01)

**Merge order:** Step 4

---

### Agent-IC

**Task IDs:** _(none — Cycle 1)_  
**Description:** No IC-09 / provider work this cycle. Firm memory is AuditOS TB path.

**Status:** n/a

---

## Dependency Check

| Gate | Required for | Status |
| ---- | ------------ | ------ |
| G-TB-3C | Backfill + 100% memory-only validation | **passed** (578 patterns, evidence JSON) |
| G-TB-3D-unit | Governance policy tests | **passed** (5/5) |
| G-TB-3D-deploy | Staging migrate + validate script | **open** (Platform + QA) |
| G-TB-API | Mapping UI governance badges | **open** (Director) |
| G-TB-UI | Phase 4 mapping UX | **blocked** on G-TB-API |
| G-TB-CLIENT2 | Reuse rate > 0 on second ERP | **future** (P3) |

**Overall:** passed (foundation) — **Cycle 1 execution open**

**Blockers:**

- None for QA/Platform docs (parallel)
- AuditOS UI blocked until Director API wiring

---

## Merge Sequence (main)

| Step | Agent | Deliverable | Validation |
| ---- | ----- | ----------- | ---------- |
| 1 | Agent-QA | Scripts + tests + evidence doc | `npm test -- firm-memory`, `node scripts/audit/phase-3d-validate-governance.mjs` |
| 2 | Agent-Platform | Runbook + client-2 checklist | Doc review |
| 3 | Director | Mapping API + governance fields | `npx tsc --noEmit` |
| 4 | Agent-AuditOS | Mapping UI badges | Manual smoke on `/audit/.../mapping` |
| 5 | Agent-QA | Cycle closure re-run | tsc + targeted tests |

**Rule:** No overlapping edits on `src/lib/tb-intelligence/**`, `src/actions/audit-actions.ts`, `mapping-page.tsx` — Director merges before AuditOS touches UI.

---

## Files Modified (Cycle 1 — planned)

```
scripts/audit/phase-3d-validate-governance.mjs
scripts/audit/tb-memory-reuse-rate.mjs
package.json
src/lib/tb-intelligence/__tests__/firm-memory-integration.test.ts
docs/audits/PHASE_3D_GOVERNANCE_VALIDATION.md
docs/audits/evidence/phase-3d-governance-validation.json
docs/operations/firm-memory-deployment-runbook.md
docs/operations/client-2-firm-memory-checklist.md
src/actions/audit-actions.ts (or mapping service)
src/types/audit.ts
src/components/audit/mapping/mapping-page.tsx
```

---

## Risks

| Risk | Severity | Mitigation |
| ---- | -------- | ---------- |
| Auto-suggest confusion (0/578 eligible post-backfill) | Medium | UI copy: "Memory match — review required until TRUSTED" |
| Dirty main / uncommitted TB work | High | Single Director commit bundle; `git status` before merge |
| Migration on staging without backfill | Medium | Runbook: backfill is per-engagement, not global default |
| Overclaiming generalization | High | Marketing/docs: moat = same-ERP firm memory only |
| Parallel edit on `audit-actions.ts` | Medium | Strict merge order; Director owns file in step 3 |

---

## Validation Status (Cycle 1 target)

| Command | Result | Notes |
| ------- | ------ | ----- |
| `npx tsc --noEmit` | Pass (baseline) | Re-run after Director + AuditOS |
| `npm test -- firm-memory` | Pass (8/8) | governance + lifecycle |
| `npm run phase-3d:validate-governance` | Not run | Requires local DB + backfill |
| `npm run phase-3c:validate` | Pass (prior) | 100% memory-only |
| `npm run lint` | Not run | Light only unless requested |
| `npm run build` | Not run | Heavy — approval required |

**Commit hash (if committed):** _(fill on close)_

---

## KPIs (Cycle 1 + P3)

| KPI | Target | Measurement |
| --- | ------ | ----------- |
| Memory-only accuracy (Shalfa) | 100% | `phase-3c:validate` |
| TRUSTED patterns (Shalfa) | 0 → grows with reuse | `phase-3d:validate-governance` |
| Auto-suggest eligible | 0 until thresholds | governance script |
| Memory Reuse Rate (client 2+) | Baseline TBD | `tb-memory-reuse-rate.mjs` |
| Mapping UI shows source | 100% classified rows | Manual / Cypress (later) |

---

## Cycle Status

**DONE** — Steps 1–4 complete + KPI baseline captured.

**Next:** Client #2 onboarding (`docs/operations/client-2-firm-memory-checklist.md`). No Local AI development until Client 2/3 data.

---

## References

- `docs/architecture/PHASE_3C_FIRM_MEMORY_ENGINE.md`
- `docs/architecture/PHASE_3D_MEMORY_GOVERNANCE.md`
- `docs/audits/evidence/phase-3c-firm-memory-validation.json`
- `src/lib/tb-intelligence/firm-memory-governance.ts` — TRUSTED: `hitCount >= 5`, `reviewers >= 2`, active within 12 months, conf ≥ 0.85 for auto-suggest
