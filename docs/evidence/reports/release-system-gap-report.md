# AQLIYA Release System — Gap Report (Agent 12)

**Date:** 2026-05-29
**Agent:** 12 — QA, Release, and Versioning System
**Branch:** `eid-sprint-stabilization-2026-05-29`
**Committed HEAD:** `6034950` — `chore(sprint): stabilize Eid sprint readiness`
**Trust principle:** AI assists. Humans decide. Evidence governs.
**Classification (unchanged, not upgraded):** Controlled pilot ready with conditions
**Deliverables:** `docs/source-of-truth/RELEASE_AND_VALIDATION_SYSTEM.md`, `docs/templates/release-report-template.md`, this report.

> **Top finding (read first):** The release-blocking gap is **G1 — the working tree is dirty** (~54 uncommitted paths, including real code) with **no validation evidence on the working tree**. No release wave may start until this is committed-or-stashed and re-validated on the committed tree. Everything else is secondary.

---

## 1. Scope Inspected

### 1.1 Git (light commands only — actually run by Agent 12)

| Command | Result |
| ------- | ------ |
| `git rev-parse --abbrev-ref HEAD` | `eid-sprint-stabilization-2026-05-29` |
| `git rev-parse --short HEAD` | `6034950` |
| `git status --short` | **NOT clean** — 40 modified tracked files + 14 untracked paths (54 total) |
| `git diff --stat` | 40 files changed, **943 insertions(+), 209 deletions(−)** (tracked only; excludes 14 untracked) |
| `git log --oneline -8` | `6034950` stabilize · `c9e9adb` Session 4 gate · `5aad2c9` L3 cert · `f273235` session 3 · `bdb8cef` session 2 · … |

**Dirty-tree composition (material for release risk):** the uncommitted set is **not docs-only**. It mixes documentation with **real application code**, including:
- `src/lib/local-content/export.ts` (**+273/−** lines — large export-logic change)
- new Server Actions: `src/actions/decision-export.ts` (+43), `download-token-actions.ts` (+21), `localcontent-actions.ts` (+22)
- new tests: `src/__tests__/unit/localcontent-export-generators.test.ts` (+87), modified `workflow-gating.test.ts`
- route/page changes across `local-content/*`, `decisions/*`, `settings/*`, `marketing/*`, `api/metrics`, `api/.../download`
- untracked source: `src/lib/platform/require-platform-admin.ts`, `admin-metrics-scope.ts`, `src/components/local-content/classification-form.tsx`
- untracked source-of-truth docs created by sibling agents: `DEPLOYMENT_MODELS.md`, `GOVERNANCE_FRAMEWORK.md`, `PRODUCT_FACTORY.md`, `docs/templates/`

This is **active v0.2 work with logic and tests that have never been validated as a committed unit.**

### 1.2 Docs / config read (read-only)

- `docs/reports/aqliya-full-platform-build-program-plan.md` (Agent 0 master plan; risk P0-1)
- `docs/source-of-truth/READINESS_GATES.md` (Internal / Demo / Pilot / Commercial gates + current status)
- `package.json` scripts (build/build:safe, lint, test/test:unit/test:integration/test:i18n, db:backup/restore, backup:verify, seed, verify-* dry/apply, e2e/cypress)
- `.github/workflows/ci.yml` (quality job) + `preview.yml` (Vercel preview)
- `.skills/aqliya/aqliya-release-checklist.md` (existing checklist + report format)
- `docs/templates/product-readiness-checklist.md` (Agent 3, L0–L6 evidence)
- `docs/releases/*` (9 existing release/known-limitations/notes docs; read `auditos-v0.1-release-package-2026-05-28.md` in full)
- `docs/source-of-truth/*` index (16 docs)

### 1.3 Not run (Low-Load Execution Protocol)

`npx tsc --noEmit`, `npx prisma validate`, `npm run lint`, `npm test` / `test:unit` / `test:integration`, `npm run build` / `build:safe`, `prisma generate`, Cypress/e2e, Docker, seed/verify scripts, dependency installs, broad scans. **Documented as the tier ladder; not executed.**

---

## 2. Current Reality — Release/Validation System Layer-by-Layer

Legend: **IMPLEMENTED** · **PARTIAL** · **DOCUMENTATION-ONLY** · **MISSING**.

| Capability | Classification | Evidence |
| ---------- | -------------- | -------- |
| Pre-release checklist (routes/security/docs/validation) | IMPLEMENTED (doctrine) | `.skills/aqliya/aqliya-release-checklist.md` |
| Readiness gates (Internal/Demo/Pilot/Commercial) | IMPLEMENTED (doctrine) | `READINESS_GATES.md` |
| Product readiness / L0–L6 evidence checklist | IMPLEMENTED (doctrine) | `docs/templates/product-readiness-checklist.md` (Agent 3) |
| Validation tier ladder (light→PC, mapped to commands) | **IMPLEMENTED (NEW, this report)** | `RELEASE_AND_VALIDATION_SYSTEM.md §1` |
| Release report format | PARTIAL → **IMPLEMENTED (NEW)** | skill had a short format; full template now `docs/templates/release-report-template.md` |
| Versioning model (platform/product/docs) | DOCUMENTATION-ONLY → **IMPLEMENTED (NEW)** | scattered (`package.json 0.1.0`, `-v1.1` docs, matrix levels) → unified in §2 |
| CI automated gate | PARTIAL | `ci.yml` runs `npm ci → prisma generate → tsc → lint → build` **only on `main`**; no integration/e2e; PR branches like this one not gated |
| Rollback / backup procedure | PARTIAL | scripts exist (`db-backup`, `db-restore`, `backup-verify`); **not scheduled/automated**; manual rollback only |
| Per-release report archive | IMPLEMENTED | `docs/releases/*` (e.g. auditos v0.1 package with rollback §11) |
| Baseline-integrity / commit-before-validate gate | **MISSING → CLOSED (NEW)** | was the open hole; now `RELEASE_AND_VALIDATION_SYSTEM.md §0/§6` + template §2 |
| Tagging discipline (platform/product tags) | PARTIAL | recommended in auditos package (`auditos-v0.1-pilot-baseline`) but no enforced scheme until §2 |

---

## 3. Gaps

**G1 — Working tree dirty, unvalidated (P0, release-blocking, TOP GAP).** 40 modified + 14 untracked paths sit on `6034950`, including a large `export.ts` change, new server actions, and new tests. Prior green validation (Phases 7–10) was on the *committed* tree; **none of it covers this working tree.** Any release cut now would ship unvalidated, irreproducible code. **This is the single gap that blocks every release wave.**

**G2 — No commit-before-validate gate existed.** Until this deliverable, no document made "commit-or-stash → re-validate on committed tree → release" a hard precondition. The release checklist validated *changes* but did not forbid releasing from a dirty tree. **Closed** by `RELEASE_AND_VALIDATION_SYSTEM.md §0/§6` + template §2.

**G3 — Validation tiers were implicit, not mapped to commands.** "Light validation" existed as guidance, but there was no explicit light→targeted→medium→build-safe→RC→PC ladder mapped to actual `package.json` scripts and load classes. **Closed** by §1.

**G4 — Versioning unspecified across three axes.** `package.json` says `0.1.0`; docs use `-v1.1`; products carry L0–L6 in the matrix; no document tied platform ↔ product ↔ docs ↔ tag ↔ matrix together. **Closed** by §2 (incl. the version-link invariant §2.4).

**G5 — CI does not gate this branch.** `ci.yml` triggers only on push/PR to `main`. The active stabilization branch and feature branches get no automated tsc/lint/build gate; integration and e2e are never automated (no Postgres/Docker in CI). Validation remains a manual discipline. *(Documentation gap flagged; CI config is not edited by Agent 12.)*

**G6 — Rollback/backup is manual and unscheduled.** Scripts exist and a procedure is documented, but automated scheduled backups + tested automated restore do not exist. Blocks any T6 / Commercial / L6 claim.

**G7 — Release report format was thin.** The skill's format omitted baseline integrity, the tier ladder, acceptance gates, and rollback readiness. **Closed** by the new template.

**G8 — Commercial-claims firewall was distributed, not gated.** Forbidden claims (Production/L6/On-Prem/Local AI/executed pilot) were called out in `AGENTS.md`/master plan but not encoded as a release acceptance gate. **Closed** by §5.4.

---

## 4. Proposed Architecture — The Release & Validation System

### 4.1 The non-negotiable invariant

```text
DIRTY TREE  ──▶  commit-or-stash  ──▶  COMMITTED TREE  ──▶  re-validate (T1→T5)  ──▶  gates  ──▶  tag  ──▶  release
     ▲                                                                                                        │
     └──────────────────────────  rollback (manual) on trigger  ◀───────────────────────────────────────────┘
```

### 4.2 Tier ladder (full detail in `RELEASE_AND_VALIDATION_SYSTEM.md §1`)

`T1 Local Light → T2 Targeted → T3 Medium → T4 Build-Safe → T5 Release Candidate → T6 Production Candidate`, each mapped to real commands, each including the lighter tiers, each tagged with a Low-Load class (light = no approval; medium/heavy = approval).

### 4.3 Versioning model

Platform `vX.Y` (tag `platform-vX.Y`) ↔ Product `<product>-vX.Y @ Ln` (tag `<product>-vX.Y-<stage>`, level set by Agent 6) ↔ Docs (`-vX.Y` official, dated source-of-truth). Coherent only when all agree on one committed HEAD (version-link invariant).

### 4.4 Acceptance gates

Platform Core (FROZEN) · Per-product (readiness checklist) · Docs (matrix/route/readiness current) · Commercial-claims firewall. All four must be green on a committed tree with attached evidence.

### 4.5 Ownership boundaries (no single-owner files touched)

- This system **supplies evidence**; **Agent 6** sets levels in `PRODUCT_STATUS_MATRIX.md`.
- **Agent 10** owns `AGENTS.md`; taxonomy is single-owner. Agent 12 edits none of these.
- Agent 12 created only its own new deliverables.

---

## 5. Files Changed

| File | Change |
| ---- | ------ |
| `docs/source-of-truth/RELEASE_AND_VALIDATION_SYSTEM.md` | **Created** — tiers, versioning, report format, rollback, acceptance gates |
| `docs/templates/release-report-template.md` | **Created** — fillable per-release report with P0 baseline-integrity firewall |
| `docs/reports/release-system-gap-report.md` | **Created** — this report |

No application code, schema, route, config, or single-owner doc changed (Agent 12 scope = documentation only).

---

## 6. Commands Run

```text
git rev-parse --abbrev-ref HEAD
git rev-parse --short HEAD
git status --short
git diff --stat
git log --oneline -8
```

Plus read-only Read/Glob of: master plan, `READINESS_GATES.md`, `package.json`, `.github/workflows/{ci,preview}.yml`, `aqliya-release-checklist.md` skill, `product-readiness-checklist.md`, `docs/releases/*` (incl. full read of auditos v0.1 package), and the `docs/source-of-truth/*` index. **No heavy commands.**

---

## 7. Validation Result

| Command | Result |
| ------- | ------ |
| `git status` / `git diff --stat` / `git log` | **Run — Pass** (state captured; tree confirmed dirty) |
| `npx tsc --noEmit` | **Not run** (heavy/Low-Load; delegated to QA execution on a committed tree) |
| `npx prisma validate` | **Not run** (Low-Load) |
| `npm run lint` / `npm test` / `npm run build` / `build:safe` | **Not run** (heavy; approval-gated) |
| Integration / e2e / seed / verify scripts | **Not run** (heavy; require DB/Docker + approval) |

**Interpretation:** The release **system** is now defined, but the repository is **not** in a releasable state: the working tree is dirty and unvalidated. The first executable validation step (after commit-or-stash) is a T1 light pass (`tsc --noEmit` + `prisma validate`), then approval-gated T3/T4, then T5 — all on the committed tree.

---

## 8. Risks

| ID | Risk | Severity | Mitigation |
| -- | ---- | -------- | ---------- |
| **G1/P0** | **Dirty, unvalidated working tree** (code + tests uncommitted on `6034950`). Releasing now ships irreproducible, unverified logic. | **P0 / High** | **No release wave until commit-or-stash + re-validate on committed tree** (`RELEASE_AND_VALIDATION_SYSTEM.md §0/§6`; template §2). |
| R2 | Validation claimed but not run | High | "Not run" is mandatory-honest in the report; never mark a tier green you didn't run |
| R3 | CI does not gate feature/stabilization branches | Medium | Documented (G5); treat manual T3/T4 as required pre-merge; CI change is a separate approved task |
| R4 | Manual, unscheduled backup; no tested automated restore | High | Blocks T6/Commercial/L6; §4 rehearsal required before any release; automation is a future ops task |
| R5 | Over-claiming (Production/L6/On-Prem/Local AI/executed pilot) | High | Commercial-claims gate §5.4 + held classification "controlled pilot ready with conditions" |
| R6 | Version drift across platform/product/docs/tag/matrix | Medium | Version-link invariant §2.4 enforced at the docs gate |
| R7 | Core silently expanded during a product release | High | Platform Core gate §5.1 — Core FROZEN; new primitives approval-gated only |
| R8 | Level promotion without evidence / by wrong owner | Medium | Per-product gate requires attached readiness checklist; only Agent 6 sets matrix level |

---

## 9. Next Lowest-Load Step

**Resolve G1/P0 with the cheapest possible action first:** the program owner decides whether the ~54 uncommitted paths are (a) intended v0.2 work to **commit** on `eid-sprint-stabilization-2026-05-29`, or (b) scratch to **stash**. Until that decision, run **`git diff` review only** — no build, no further edits. **After** the tree is committed (single known baseline), the lowest-load follow-up is a **T1 light pass** (`npx tsc --noEmit` + `npx prisma validate` + `npm run validate:env`) by the QA execution agent, then approval-gated **T3 → T4 → T5** before any release is tagged. No release artifact, tag, or matrix level change may be produced from the current dirty tree.

---

## Agent 12 Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE_WITH_CONCERNS** (G1/P0 dirty-tree release blocker stands) |
| **Code changed** | No |
| **Schema changed** | No |
| **Single-owner files touched** | No (matrix/AGENTS/taxonomy untouched) |
| **Classification** | Controlled pilot ready with conditions (unchanged — not upgraded) |
| **Deliverables** | `RELEASE_AND_VALIDATION_SYSTEM.md`, `release-report-template.md`, this gap report |

*Agent 12 — QA, Release, and Versioning System. Release discipline defined; the repository is not releasable until the dirty tree is committed-or-stashed and re-validated. AI assists. Humans decide. Evidence governs.*
