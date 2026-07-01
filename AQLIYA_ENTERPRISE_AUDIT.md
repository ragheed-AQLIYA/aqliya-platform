# AQLIYA — Independent Enterprise Architecture Audit

**Auditor role:** Independent Enterprise Architecture Auditor (read-only, evidence-based)
**Date:** 2026-06-30
**Method:** Direct source verification. Documentation, comments, and prior audit reports treated as *claims to verify*, not evidence.
**Scope this pass:** Prioritized evidence-grade — deep verification of Security, Architecture, Product maturity, and Marketing-claim-vs-code; remaining domains summarized with explicit confidence flags.

> **Confidence convention:** Each finding carries a confidence level. Anything below 80% is explicitly marked **"Needs manual verification."** No claim in this report is made without a source-level observation behind it.

> **Critical scoping note on repo size:** The working directory holds ~183,000 files on disk, but only **4,831 are git-tracked**. The 178K+ difference is untracked local cruft (`node_modules`, `.local-cleanup` 1.6 GB, `.tmp.driveupload` 34 MB, build caches, backups). All structural conclusions below are based on the **git-tracked repository** unless explicitly stated otherwise. This distinction matters: several "dead code" signals are untracked local artifacts, not committed liabilities.

---

## REPORT 1 — Executive Summary

AQLIYA is a **genuinely substantial, real enterprise platform** — not a demo or a shell. The committed repository is a Next.js + Prisma monorepo of 4,831 tracked files: ~2,159 source files, 1,848 documentation files, a 5,673-line Prisma schema with **240 models**, 62 API routes, 88 server-action modules, 344 test files, and a comprehensive CI gate. Multiple products are implemented to real depth, multi-tenancy discipline is pervasive, and the AI governance layer is more mature than most early-stage platforms.

**Headline verdict:** The engineering core is **strong and defensible**; the liabilities are concentrated in **hygiene, sprawl, and consolidation debt**, not in the foundational architecture or security model.

**Five strongest verified facts (high confidence):**

1. **Security/multi-tenancy is real and enforced.** 81/88 server-action files use a real guard (`requireUserContext`/`enforce`), the remaining 7 use a second legitimate guard path (`getAuditActor`/`requireRole`). `enforce()` is a real 117-line ABAC function over a 933-line authorization module. Org-scoping is pervasive (5,898 `organizationId` references across ~2,038 queries). Evidence-download endpoints do token-verification + ABAC + rate-limit + audit-log.
2. **Layered architecture is clean.** `src/core` imports nothing from `src/app` or `src/lib`; `src/lib` imports nothing from `src/app`. No detected upward layer violations.
3. **AI stack is mature.** `src/lib/core/ai/` contains real provider abstraction (Anthropic, OpenAI, local/Ollama, deterministic), circuit breaker, embeddings, RAG orchestrator, model registry, **plus a governance layer** (budget-manager, cost-governance, spend-tracker, governed-ai-executor, ai-review-gate for human review).
4. **CI is comprehensive.** `ci.yml` enforces doc-lint, `tsc --noEmit`, unit/integration tests, lint, build, license-checker (blocks GPL/AGPL/LGPL-3.0), and `npm audit --audit-level=high`.
5. **Marketing is honest on the highest-risk claim.** The SOC2 page is explicitly titled "SOC2 roadmap — goals, not certificates" with a no-certification disclaimer. No "SOC2 certified" overclaim found.

**Five most material liabilities (verified):**

1. **Documentation sprawl.** 1,848 tracked doc files, 302 in `docs/archive`, **228 docs marked DEPRECATED/SUPERSEDED/OBSOLETE**, plus a committed `DOCUMENTATION_CONFLICT_REPORT.md`. Docs nearly equal source in volume — a navigation and trust hazard.
2. **Consolidation debt / parallel legacy paths.** `src/lib/ai` is a deprecation shim over `src/lib/core/ai`; `src/lib/salesos` (DDD-structured, 36 files) is an **abandoned untracked refactor with 0 importers**; `governance-engine` (138 files) has effectively one integration point. The platform is visibly mid-migration.
3. **Two parallel authorization systems.** AuditOS uses `getAuditActor`/`requireRole`; other products use `enforce()`/ABAC. Functional, but a long-term consistency and audit risk.
4. **Build health unconfirmed.** A 9-day-stale `.salesos-ts-errors.txt` lists 568 TS errors, some in live (non-test) sales components/actions. **Needs a live `tsc --noEmit` run to confirm current state.**
5. **Working-tree pollution.** 1.6 GB `.local-cleanup` quarantine, 34 MB `.tmp.driveupload`, duplicate `gov-extractor-*` dirs, and root scratch files (`_check*.mjs`, `temp_*_inventory.txt`, `kf_*.png`). Untracked, so not in the repo — but a developer-environment and accidental-commit risk.

**Overall readiness (verified, prioritized pass):**

| Dimension | Rating | Confidence |
|---|---|---|
| Engineering / Architecture | **Strong** | High |
| Security & Multi-tenancy | **Strong** | High |
| AI & Governance | **Strong** | High |
| Product depth (top 4 products) | **Mature** | High |
| Product depth (long-tail products) | **Thin/embedded** | High |
| Testing | **Good surface, health unconfirmed** | Medium |
| Documentation | **Sprawling / needs consolidation** | High |
| Pilot readiness | **Plausible for lead products; verify build** | Medium |
| Commercial/Marketing honesty | **Good** | Medium-High |

---

## REPORT 2 — Repository Assessment

**Tracked vs. on-disk (evidence: `git ls-files`, `du`, `git check-ignore`):**

| Metric | Value |
|---|---|
| Git-tracked files | 4,831 |
| Files on disk | ~183,310 |
| Tracked: `src` | 2,159 |
| Tracked: `docs` | 1,848 |
| Tracked: `knowledge-foundation` | 292 |
| Tracked: `scripts` | 202 |
| Tracked: `archive` | 37 |

**Untracked local cruft (NOT in repo, but present on disk):**

- `.local-cleanup/root-quarantine/` — **1.6 GB** (tool caches, agent artifacts, drive-upload temp). Confidence: High.
- `.tmp.driveupload/` — 34 MB. High.
- `gov-extractor-tT6g74/` and `gov-extractor-wDpJX7/` — duplicate ephemeral extractor working dirs, each containing only `docs/`. High.
- Root scratch files: `_check.mjs`, `_check2.mjs`, `_check_db.mjs`, `_check_mig.mjs`, `kf-capture.mjs`, `kf-diag.mjs`, `kf_*.png` (7 screenshots), `temp_docs_inventory.txt` (190 KB), `temp_archive_inventory.txt`, `lint-output.json` (1.5 MB), `lint-check.txt`, `unused-vars-list.txt`, `.salesos-ts-errors.txt` (118 KB). All untracked. High.
- Generated artifacts correctly git-ignored: `.next`, `node_modules`, `tsconfig.tsbuildinfo`, `build`. Confirmed via `git check-ignore`. High.

**Committed-but-questionable:**

- `archive/` is git-tracked (37 files) — obsolete content carried in version control. Medium.
- `backups/*.dump` (3.7 MB, 4 dumps) present on disk; untracked. Database dumps in the working tree are a secrets/PII risk if ever staged. **Recommend confirming `.gitignore` coverage and that no dump was historically committed.** Medium — Needs manual verification of git history.

**Documentation hierarchy:** `docs/` has a deep governance structure (`DOCUMENTATION_AUTHORITY.md`, `DOCUMENTATION_GOVERNANCE_v2.md`, `DOCUMENTATION_CONFLICT_REPORT.md`, validation tooling) — evidence of an *intent* to govern docs, undermined by the sheer volume (see Report 6).

**Recommendation (no action taken):** Purge untracked cruft from working trees; add `gov-extractor-*`, `.local-cleanup`, `*.dump`, root scratch globs to `.gitignore`; move `archive/` out of the live tree or to a separate retention branch.

**Confidence: High** for all tracked-file facts; database-dump git-history exposure is **Needs manual verification**.

---

## REPORT 3 — Architecture Assessment

**Layering (evidence: import-direction grep):**

- `src/core` → `src/app`: **0** imports. `src/core` → `src/lib`: **0** imports. `src/lib` → `src/app`: **0** imports.
- Interpretation: dependency direction points inward/downward as intended. No detected upward violations. **Confidence: Medium-High** (grep covers `@/`-aliased imports; relative cross-imports across these boundaries were not exhaustively traced).

**Module map (`src/lib`, file counts):**

| Engine | Files | Importers | Status |
|---|---|---|---|
| `sales` | 271 | 114 | **Active / canonical** |
| `audit` | 147 | — | Active (largest audit engine) |
| `governance-engine` | 138 | ~1 real | **Low-integration / possibly dormant** |
| `local-content` | 114 | — | Active |
| `decision` | 38 | — | Active |
| `salesos` (untracked) | 36 | **0** | **Abandoned refactor (not committed)** |
| `governance` | 25 | 20 | Active (canonical governance path) |
| `workflowos` | 15 | — | Active |
| `office-ai` | 7 | — | Active (small) |
| `local-content-intelligence` | 3 | — | Thin stub |
| `localcontactos` | 3 | — | Thin stub |
| `audit-intelligence` | 2 | — | Thin stub |

**Duplicate / parallel engines (verified):**

1. **`sales` vs `salesos`** — `salesos` is a DDD-structured (api/domain/infrastructure/viewmodel/workflow) parallel implementation that is **not git-tracked and has 0 code importers**. The 49 `salesos` references in tracked code are permission *strings* (`"salesos:read"`), not module imports. Verdict: abandoned local refactor. **Confidence: High.**
2. **`src/lib/ai` vs `src/lib/core/ai`** — `src/lib/ai/index.ts` is a 6-line deprecation shim re-exporting `@/lib/core/ai`. The real implementation lives in `core/ai`. Verdict: migration shim. **Confidence: High.**
3. **`governance` vs `governance-engine`** — `governance` (25 files) has 20 importers; `governance-engine` (138 files) has ~1 real importer (`src/lib/audit/governance/index.ts`) plus self-references and one test. Verdict: large engine, minimal integration — either staged for future use or dormant. **Confidence: Medium** (low-integration is clear; "dead" is not asserted — Needs manual verification of runtime invocation).

**Two authorization systems (verified):** Product actions split between `enforce()`/ABAC (`@/lib/authorization`) and `getAuditActor`/`requireRole` (`@/lib/audit/actor-context`). AuditOS standardizes on the latter. **Confidence: High** that both exist and are used.

**Stub/debt density:** 647 `TODO|FIXME|HACK|stub|placeholder|not implemented` markers in `src`. **Confidence: High** (raw count; severity not individually triaged).

**Barrels:** 121 `index.ts` barrel files in `src/lib` — convenient but a known cyclic-dependency and tree-shaking risk at this scale. **Confidence: High** (count); cycle existence **Needs manual verification** (no madge/dependency-cruiser run performed).

---

## REPORT 4 — Product Assessment

Maturity is measured by verified UI depth (page count, incl. route groups), engine size (`src/lib`), and presence of a dedicated domain library. Pilot-readiness ratings are **Medium confidence** pending a live build/test run.

| Product | UI pages | Dedicated engine | Maturity | Notes |
|---|---|---|---|---|
| **AuditOS** | 42 | `lib/audit` (147) | **Highest** | Deepest product; own authz path; ISQM1, sampling, evidence, engagements, exports. |
| **SalesOS** | 32 | `lib/sales` (271) | **High** | Largest engine; deals, ICP, signals, conversion memos. Legacy `salesos` refactor abandoned. |
| **LocalContentOS** | 30 | `lib/local-content` (114) | **High** | Projects, evidence, reports, quality, pilot-readiness, review/export. Active tenant-leakage hardening in recent commits. |
| **DecisionOS** | 25 | `lib/decision` (38) | **High** | Intake→framework→scenarios→risks→recommendation→simulation→sector→signals→outcome. Backend + deep UI. *(Corrected from an initial false "0 pages" — routes live under `(dashboard)/decisions`.)* |
| **WorkflowOS** | 8 | `lib/workflowos` (15) | **Moderate** | Clients/records/documents, exports, escalation-check. Functional but smaller. |
| **ContentStudio** | 5 | embedded in `lib/local-content/content` | **Embedded/Moderate** | Not a standalone engine; a module of LocalContentOS. |
| **Office AI** | 5 | `lib/office-ai` (7) | **Thin-Moderate** | Conversation, file-extraction, deterministic generators, download. |
| **RiskOS** | 5 | none dedicated (logic in `decision/risk-analysis`, `platform/audit-risk`) | **Thin/embedded** | No standalone risk engine; risk logic is distributed. |
| **Institutional Memory** | 5 | `lib/core/memory/institutional-memory-service` | **Thin-Moderate** | Service-backed, limited UI. |
| **LocalContactOS** | 7 (`contacts`) | `lib/localcontactos` (3 stub) | **Thin** | UI exists; backing engine is a 3-file stub. Contact logic largely in `sales`/actions. |

**Per-product readiness summary:**

- **Pilot-ready candidates (highest confidence of depth):** AuditOS, LocalContentOS, DecisionOS, SalesOS. All four have real engines, deep UI, server-action guards, and org-scoped data access. **Pilot readiness: Medium** (gated on live build/test confirmation).
- **Not yet standalone-pilotable:** RiskOS (no dedicated engine), LocalContactOS (stub engine), ContentStudio (sub-module). These are features more than products. **Confidence: High** on the structural observation.
- **Website-vs-product consistency:** Each product has a marketing page under `(marketing)/products/*`. Whether each page's feature claims match the implemented depth was **not exhaustively diffed this pass** — spot-check only (see Report 7). **Needs manual verification per product.**

---

## REPORT 5 — Security Assessment

**Edge middleware (`src/middleware.ts`, 353 lines — read in full):**

- Pipeline: rate-limit → public-path bypass → JWT auth (`getToken`) → MFA gate → coarse RBAC route-min-role. Unauthenticated API calls get `401`; pages redirect to `/login` with `callbackUrl`. **Confidence: High.**
- RBAC hierarchy: `viewer < operator < manager < admin`, applied via `routeMinRoles` prefix map. Coarse but intentional — the file comments correctly state detailed checks happen server-side. **Confidence: High.**
- **Matcher risk:** `config.matcher` is an explicit allowlist with **no catch-all `/api/:path*`**. Current coverage of existing API namespaces is good (audit, ai, decisions, local-content, office-ai, sales, sunbul, workflowos, platform, scim, skills, knowledge-mining, integration, metrics, monitoring, notifications all enumerated). **Risk:** any *future* API namespace added without a matcher entry silently bypasses edge auth. **Confidence: High** on mechanism; this is a maintenance hazard, not a current hole.

**Server-action authorization (88 files):**

- 81/88 use `requireUserContext`/`getCurrentUser`/`requireDecisionAccess`/`enforce()`.
- The other 7 (`audit-admin`, `audit-isqm1`, `audit-client-acceptance`, `audit-sampling-hardening`, `audit-independence`, `mfa`, `sso-login`) use `getAuditActor()`+`requireRole()` or are pre-auth flows. **Net: effectively full coverage.** **Confidence: High.**
- `enforce()` = real 117-line ABAC function; authorization module = 933 lines (`abac-bridge`, `authorize`, `permission-resolver`, `product-guards`, `tenant-guard`, `types`). Not a stub. **Confidence: High.**

**Tenant / organization isolation:**

- 5,898 `organizationId` references across ~2,038 Prisma operations in `actions`+`lib`. Canonical pattern observed: `where: { organizationId: user.organizationId }`. **Confidence: High** that org-scoping is the dominant pattern.
- Recent commits (`P0-B2A-*`, "Zero Tenant Leakage — PASS", "scope 37 Prisma queries with orgId") show **active, recent isolation hardening** for LocalContentOS. **Confidence: High.**
- **Residual risk:** ratio of org-refs to queries (>1) indicates norm, not proof of universality. 110 of 240 models lack an `organizationId` field (see Report — DB). Whether each unscoped model is legitimately global vs. a leakage path was **not individually classified.** **Needs manual verification.**

**Download / export endpoints (highest-risk — evidence: `audit/evidence/[id]/download` read in full):**

- Layered defense: signed download-token verification (with type+file binding) OR live actor + `enforce()` ABAC check; rate-limit; `assertEvidenceDownloadAccess`; audit logging. **This is mature.** Other export routes (`sales/export`, `workflowos/.../export/pdf`, `local-content/.../download`, `office-ai/download`) follow the same family. **Confidence: High** for the sampled endpoint; **Medium** as a generalization across all 12 download/export routes (only one read in full).

**Security verdict:** Strong, defensible, actively hardened. Primary recommendations: (1) add a catch-all API matcher or a CI check that every `/api` namespace is in the matcher; (2) classify the 110 unscoped models; (3) converge the two authz systems.

---

## REPORT 6 — Documentation Assessment

**Volume (evidence: `git ls-files`, grep):**

- 1,848 tracked doc files — **86% of the size of `src`**.
- `docs/archive/` — 302 tracked files across ~40 subfolders (`deprecated`, `legacy`, `legacy-numbered`, `old-brand`, `old-reports`, `historical-strategy`, `execution-stale`, `root-planning-scratch`, `sunbul-product-legacy`, `decision-os`, etc.).
- **228 docs** contain `DEPRECATED|SUPERSEDED|OBSOLETE`.
- A committed `docs/DOCUMENTATION_CONFLICT_REPORT.md` and dual governance docs (`DOCUMENTATION_GOVERNANCE.md` + `_v2.md`) — the team is **aware** of conflicts and has built tooling (`docs:validate`, `docs:consistency`, `docs:orphans`, `docs:health`).

**Assessment:** The documentation *governance intent* is strong (authority matrix, single-entry protocol via `docs/AI_ENTRYPOINT.md`, validation scripts in CI). The *execution* is buried under volume: deprecated, archived, and conflicting material lives alongside authoritative docs, and the root directory itself holds 10+ large audit/strategy `.md`/`.docx`/`.pptx`/`.xlsx` files. A buyer or new engineer cannot quickly find the source of truth.

**Contradiction risk:** With 228 deprecated-marked docs still tracked and a self-reported conflict report, contradictions are near-certain. Specific contradiction pairs were **not enumerated this pass.** **Needs manual verification** for a contradiction register.

**Recommendation:** Enforce the existing authority matrix as a hard gate; relocate `archive/` and root strategy artifacts out of the working tree; reduce tracked docs to the authoritative set.

**Confidence: High** on volume/sprawl; **Medium** on contradiction specifics.

---

## REPORT 7 — Website Assessment

**Structure (evidence: `(marketing)` route group):** Full marketing site — `products`, `proof`, `proof-library`, `pilot-proof`, `pilot-outcomes`, `case-studies`, `security`, `soc2-roadmap`, `governance`, `engagement-models`, `procurement-pack`, `executive-brief`, `industries`, `use-cases`, plus EN mirror (`/en/*`) and Arabic content. **Confidence: High** the site is real and multi-page.

**Claim verification (spot-check):**

- **SOC2 (highest-risk claim):** `soc2-roadmap/page.tsx` is explicitly framed "SOC2 roadmap — goals, not certificates," Arabic disclaimer "بدون ادعاء شهادة" (no certification claim), milestone-based. **This is honest, defensible positioning.** **Confidence: High.**
- **`proof/page.tsx`** (227 lines): no `lorem`/`TODO`/`placeholder`/`example.com`/`[insert]` markers detected. **Confidence: Medium-High** (marker-scan, not content-truth audit).
- **No detected overclaims** of "bank-grade," "ISO 27001 certified," "HIPAA," "99.9% uptime," or "zero-tenant" in marketing TSX. **Confidence: Medium** (keyword scan of `(marketing)` only).

**Gap:** A full claim-by-claim diff of each product marketing page against its implemented feature set was **out of scope for this prioritized pass.** The structural honesty signals are positive, but per-product claim reconciliation is **Needs manual verification.**

---

## REPORT 8 — Technical Debt Register

| # | Debt | Priority | Suggested Owner | Impact | Est. Effort | Risk if ignored | Confidence |
|---|---|---|---|---|---|---|---|
| D1 | Build health unconfirmed — 568 stale TS errors incl. live sales components | **Critical** | Eng Lead | Blocks reliable releases | 0.5d to verify (`tsc --noEmit`), unknown to fix | Broken `main`, failed pilots | Med (stale artifact) |
| D2 | Documentation sprawl (1,848 docs, 302 archived, 228 deprecated) | High | Docs/Platform | Buyer + onboarding friction; contradiction risk | 3–5d | Trust erosion, conflicting guidance | High |
| D3 | Consolidation debt — `ai` shim, untracked `salesos`, dormant `governance-engine` | High | Architecture | Confusing surface, dead-weight | 2–4d | New code on wrong path | High |
| D4 | Two parallel authz systems (ABAC vs actor-context) | High | Security | Inconsistent enforcement model | 5–8d | Audit gaps, drift | High |
| D5 | Edge matcher allowlist with no `/api` catch-all | Medium | Security | Future route may bypass edge auth | 0.5d (add CI check) | Silent unauth route | High |
| D6 | 110/240 models lack `organizationId` — unclassified | Medium | Security/Data | Possible tenant-leak surface | 1–2d to classify | Cross-tenant exposure | Med — verify |
| D7 | Working-tree pollution (1.6 GB cleanup dir, scratch files, dumps) | Medium | DevEx | Dev friction, accidental-commit/secret risk | 0.5d | Leaked dump, bloated checkout | High |
| D8 | 647 TODO/FIXME/stub markers in `src` | Medium | All teams | Hidden incomplete paths | Ongoing | Latent bugs | High |
| D9 | 121 barrel files — cycle/tree-shaking risk | Low-Med | Architecture | Build perf, cycles | 2–3d | Slow builds, cycles | Med — verify |
| D10 | `archive/` + DB dumps tracked/present in tree | Low-Med | Platform | Repo bloat, possible PII | 0.5d | Compliance exposure | Med — verify git history |

---

## REPORT 9 — Company Readiness

| Function | Readiness | Evidence basis | Confidence |
|---|---|---|---|
| **Engineering** | **Strong** | 4,831-file monorepo, 240-model schema, 55 migrations, comprehensive CI gate | High |
| **Architecture** | **Strong (mid-consolidation)** | Clean layering, real DDD intent, but legacy parallel paths remain | High |
| **Security** | **Strong** | Real ABAC, pervasive org-scoping, hardened downloads, MFA, SCIM, SAML | High |
| **AI/Governance** | **Strong** | Provider abstraction + budget/cost/spend/review governance | High |
| **Documentation** | **Weak (sprawl)** | Governance intent strong, execution buried under volume | High |
| **Commercial** | **Plausible** | Procurement pack, engagement models, exec briefs present | Medium |
| **Marketing** | **Honest, structurally complete** | SOC2 framed as roadmap; no detected overclaims | Medium-High |
| **Sales (GTM)** | **Partially evidenced** | SalesOS internal tooling is mature; external GTM assets exist | Medium |
| **Operations/Deploy** | **Evidenced** | Docker, staging compose, Terraform-adjacent `infra/`, backup/health scripts, 7 CI workflows | Medium |
| **Compliance** | **Roadmap stage** | SOC2 roadmap, retention/holds/SIEM endpoints, audit logging | Medium |
| **Pilot** | **Ready for lead products, pending build verify** | `pilot-readiness` pages/actions exist for LocalContent + Decisions | Medium |
| **Support** | **Not assessed this pass** | — | Needs manual verification |

---

## REPORT 10 — Ranked Findings

> **Honesty note:** A literal "Top 100" would require padding beyond what this prioritized single pass verified. Below are the **verified findings ranked by severity**. Reaching a defensible 100 requires the additional waves (full per-route security trace, per-model tenant classification, per-doc contradiction diff, live build/test, dependency-cycle scan) — these are listed as the path to completeness, not fabricated as findings.

**CRITICAL**
1. Build health unconfirmed; 568 stale TS errors include live sales components/actions — run `tsc --noEmit` to confirm `main` compiles. *(D1, Med confidence — stale artifact.)*

**HIGH**
2. Documentation sprawl: 1,848 docs / 302 archived / 228 deprecated, self-reported conflicts. *(D2, High.)*
3. Abandoned untracked `salesos` DDD refactor (0 importers) alongside live 271-file `sales`. *(D3, High.)*
4. `src/lib/ai` is a shim over `src/lib/core/ai` — legacy path still importable. *(D3, High.)*
5. `governance-engine` (138 files) has ~1 real integration point — dormant or unfinished. *(D3, Medium.)*
6. Two parallel authorization systems (ABAC vs actor-context/requireRole). *(D4, High.)*

**MEDIUM**
7. Edge `matcher` allowlist has no `/api/:path*` catch-all — future-route bypass risk. *(D5, High.)*
8. 110/240 Prisma models lack `organizationId`; unclassified for tenant-leak risk. *(D6, Needs verification.)*
9. 1.6 GB `.local-cleanup` + 34 MB `.tmp.driveupload` + duplicate `gov-extractor-*` dirs + root scratch files pollute the working tree. *(D7, High.)*
10. 647 TODO/FIXME/stub markers in `src`. *(D8, High.)*
11. DB dumps (`backups/*.dump`) present in working tree — confirm never committed; PII risk. *(D10, Needs verification.)*
12. `archive/` (37 files) tracked in live repo. *(D10, High.)*

**LOW**
13. 121 barrel `index.ts` files — potential cycles / tree-shaking cost. *(D9, Needs verification.)*
14. Thin/embedded "products" (RiskOS, LocalContactOS, ContentStudio) presented at product parity with mature ones — set expectations in GTM. *(High.)*
15. Dual governance docs (`DOCUMENTATION_GOVERNANCE.md` + `_v2.md`) coexist. *(High.)*

**POSITIVE FINDINGS (verified — counterbalance):**
- P1. Clean layered architecture (no upward `core`/`lib`→`app` imports). *(Med-High.)*
- P2. Real ABAC + pervasive org-scoping + hardened evidence downloads. *(High.)*
- P3. Mature AI provider abstraction + governance (budget/cost/review). *(High.)*
- P4. Comprehensive CI (typecheck, tests, lint, build, license + audit gates). *(High.)*
- P5. Honest SOC2 marketing (roadmap, not certified). *(High.)*
- P6. 344 tests + 11 Cypress E2E + active tenant-leakage hardening commits. *(High.)*

---

## Verification Method & Limits (transparency)

**Verified directly from source:** middleware (full read), evidence-download route (full read), server-action guard pattern (multiple files), `enforce()` and authorization module sizing, AI provider directory, Prisma model/field counts, git-tracked vs on-disk file accounting, import-direction greps, product page/engine counts, CI workflow contents, marketing SOC2/proof wording.

**NOT done this pass (the honest gaps — all "Needs manual verification"):**
- Live `tsc --noEmit` / `npm run build` / `npm test` execution (sandbox time limits; node_modules + prisma generate required).
- Per-route security trace for all 62 API routes (1 download route read in full; others inferred by pattern).
- Per-model tenant classification for the 110 unscoped models.
- Per-doc contradiction diff and per-product marketing-claim diff.
- Dependency-cycle analysis (no `madge`/`dependency-cruiser` run).
- Git-history scan for historically-committed secrets/dumps.

**No files were modified. This was a read-only audit.**
