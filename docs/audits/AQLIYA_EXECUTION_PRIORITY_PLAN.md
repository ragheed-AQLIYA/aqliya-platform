# AQLIYA Execution Priority Plan

> **Status:** Code-reconciled | **Date:** 2026-07-10  
> **Purpose:** Hard-nosed execution order from repository reality — what to freeze, harden, refactor, or build next  
> **Audience:** Architecture board, engineering leadership, pilot program owners

---

## Strategic Frame

**Current state:** Multi-product platform at **L4–L5 pilot-ready** with **L6 documentation inflation** and **L6 production gaps** in CI, pentest, and RDS hardening.

**Correct posture:** Run **controlled pilots** on AuditOS + LocalContentOS + DecisionOS while executing a **90-day hardening program** before any commercial production certification.

**Do not:** Start new products (ComplianceOS, GovOS, Studio) or expand Sales v02/vnext until convergence items complete.

---

## Phase 0 — Immediate (Week 1): Truth & Safety

**Goal:** Stop false claims and prevent bad deploys.

| # | Action | Rationale | Dependency | Owner |
|---|--------|-----------|------------|-------|
| 0.1 | **Sync PRODUCT_STATUS_MATRIX** — change L6 rows to L4–L5 with conditions; fix organizations stale note | Doc vs code divergence creates procurement/legal risk | This audit | Docs + Eng |
| 0.2 | **Gate deploy on CI pass** — `deploy.yml` uses `workflow_run` after CI success | Critical blocker P-01; failing code can reach prod today | None | Platform |
| 0.3 | **Declare commercial NO-GO** in READINESS_GATES until pentest + RDS hardening | Honest external posture | Audit complete | Leadership |
| 0.4 | **Fix quick security gaps** — add `/institutional-memory` to middleware matcher; remove dead `/decision` key; fix `/audit/settings` nav | Low effort, reduces exposure | None | Platform |
| 0.5 | **Archive or delete** `infra/terraform/environments/production/` placeholder | Wrong deploy target risk | None | DevOps |

**Exit criteria:** CI-gated deploy merged; PRODUCT_STATUS reflects L4–L5; no Critical doc conflicts on maturity.

---

## Phase 1 — Production Blockers (Weeks 2–4): Operate Safely

**Goal:** Close Critical/High production blockers for pilot-at-scale.

| # | Action | Rationale | Dependency |
|---|--------|-----------|------------|
| 1.1 | **Schedule penetration test** — scope: auth, tenant isolation, download routes, SCIM, file upload | B-01 Critical; contract-gated in docs but must start | Leadership approval |
| 1.2 | **Prod RDS hardening** — apply tfvars targets: Multi-AZ, backup retention 30, deletion protection, instance class upgrade | Evidence: current retention 0 | AWS account upgrade |
| 1.3 | **Consolidate deploy path** — canonical: `deploy.yml` + `environments/prod/`; deprecate promote.yml or restrict to DR | Dual path confusion | 0.2 |
| 1.4 | **ECS task def: RATE_LIMITER=redis, queue.enabled, outbox flags** | Multi-instance safety | Redis live |
| 1.5 | **ClamAV post-deploy smoke** — verify scanner reachable from app task | Upload safety claim | 1.3 deployed |
| 1.6 | **Make backup:verify blocking** or required nightly | Data integrity confidence | CI change |
| 1.7 | **Live RDS restore drill** — run `restore-drill.mjs` against scratch instance; document evidence | I-01 open item | Staging/prod access |

**Exit criteria:** Pentest scheduled (in progress acceptable); RDS tfvars applied; Redis rate limiter in prod; restore drill evidence file in `docs/deployments/`.

---

## Phase 2 — Verification Trust (Weeks 3–6): Prove What We Ship

**Goal:** Tests must prove governed flows, not just mocked units.

| # | Action | Rationale | Dependency |
|---|--------|-----------|------------|
| 2.1 | **Add Postgres integration CI job** — `docker-compose.test.yml` + subset of real tests (tenant isolation, audit write, download gate) | Mock Prisma hides DB failures | CI capacity |
| 2.2 | **Add Cypress smoke to PR** — auth login, audit list, local-content dashboard (3–5 specs) | E2E exists but unwired | 0.2 |
| 2.3 | **Rewrite LocalContact "integration" tests** — use test DB or rename to unit | Honest test labels | 2.1 |
| 2.4 | **Pilot smoke script in deploy** — extend `deploy.yml` curl to match `post-deploy-smoke.mjs` subset | Stronger post-deploy gate | 0.2 |

**Exit criteria:** CI runs ≥1 true Postgres test job; Cypress smoke on PR; deploy smoke ≥5 checks.

---

## Phase 3 — Governance Convergence (Weeks 4–10): One Enforcement Stack

**Goal:** Reduce authorization fragmentation from 4 paths to 1 documented stack.

| # | Action | Rationale | Dependency |
|---|--------|-----------|------------|
| 3.1 | **ADR: Authorization convergence** — middleware → authorize() → product guard | Board alignment | Phase 0 |
| 3.2 | **Promote RB-02 engine from shadow to enforce** — feature flag rollout per org | Shadow-only engine is High risk | 3.1 |
| 3.3 | **Unify role vocabulary** — single enum + mappers | Dual vocabulary bug surface | 3.2 |
| 3.4 | **Migrate server actions batch 1** — AuditOS + platform operator actions to `authorize()` | Highest pilot traffic | 3.2 |
| 3.5 | **Migrate server actions batch 2** — LCOS, DecisionOS, Sales | Parallel track | 3.4 |
| 3.6 | **ADMIN cross-tenant restriction** — operator role vs tenant ADMIN | Security gap | 3.2 |
| 3.7 | **Unified audit query API** — read PlatformAuditLog + product namespace filter | Lineage gap | None |

**Exit criteria:** ≥80% of pilot mutations use `authorize()`; shadow mode off in staging; ADR published.

---

## Phase 4 — Platform Hardening (Weeks 6–12): Build on Trustworthy Core

**Goal:** Intelligence Core adoption + storage/audit durability.

| # | Action | Rationale | Dependency |
|---|--------|-----------|------------|
| 4.1 | **Storage factory as sole upload path** — deprecate direct local in prod | 3 storage paths | 1.4 |
| 4.2 | **CoreEvidence mandatory registration** — lint/check on upload actions | Traceability | 4.1 |
| 4.3 | **Persist core/output** — replace InMemoryOutputService | Approval durability | 3.x |
| 4.4 | **Platform file scanner** — wrap audit/file-scanner for all products | Not AuditOS-only | 1.5 |
| 4.5 | **Enable platform.event-outbox in staging → prod** | Async reliability | 1.4 |
| 4.6 | **Settings route unification** — merge app/settings and dashboard/settings layouts | Operator UX | None |

**Exit criteria:** Prod uses S3 factory; CoreEvidence on all upload paths; outbox processing monitored.

---

## Phase 5 — Product Debt (Weeks 8–14): Consolidate, Don't Expand

**Goal:** Pay down highest product-specific debt without destabilizing pilots.

| # | Action | Rationale | Dependency |
|---|--------|-----------|------------|
| 5.1 | **Sales: freeze v02/vnext new features** | 101 files parallel stacks | Leadership |
| 5.2 | **Sales: consolidation plan** — migrate intelligence tab to single `salesos` path | ESLint ignores hide debt | 5.1 |
| 5.3 | **Office AI route unification** — `/assistant` + admin sub-routes | Dual URL confusion | 4.6 pattern |
| 5.4 | **AuditOS: document tenant bridge** — PlatformOrganization ↔ AuditOrganization mapping rules | Cannot rush full merge | ADR |
| 5.5 | **AuditOS tenant convergence spike** — read-only analysis; no prod migration yet | High risk schema change | 5.4 |
| 5.6 | **Command palette: dynamic engagements** | Demo 404 risk | None |

**Exit criteria:** Sales v02 import count trending down; Office AI single nav; AuditOS bridge ADR approved.

---

## Phase 6 — Pilot Program (Parallel from Week 2): Revenue-Aligned Delivery

**Goal:** Run pilots that generate evidence without overclaiming.

### Pilot tier A (GO now)
| Product | Pilot type | Conditions |
|---------|------------|------------|
| AuditOS | Financial audit engagement pilot | Use `/audit/*` only; demo via `/auditos`; pentest in flight |
| LocalContentOS | LC compliance pilot | ERP creds customer-managed; workbook AI with review |
| DecisionOS | Committee decision pilot | Internal/governance use |

### Pilot tier B (GO with caution)
| Product | Conditions |
|---------|------------|
| SalesOS | Disclose pilot status; CRM sync operator setup |
| WorkflowOS | Template workflows; export approval demo |
| Office AI | Assistive only; human review mandatory |

### Internal only (not customer pilot)
| Product | Reason |
|---------|--------|
| LocalContactOS | Mock-heavy tests |
| Institutional Memory | Middleware gap (fix in 0.4) |
| ContentStudio | Overlap confusion with LC — clarify scope in contract |

**Pilot runbook references:** `docs/source-of-truth/PILOT_RUNBOOK.md`, `docs/deployment/AUDITOS_PILOT_*`

---

## Phase 7 — Strategic Future (Defer until Phase 3–4 complete)

**Do not execute now:**

| Item | Why defer |
|------|-----------|
| ComplianceOS, LegalOS, GovOS | L0 — no routes |
| AQLIYA Studio | L0 — strategic only |
| On-Prem / Air-Gapped package | Not implemented — AGENTS.md prohibition |
| Full AuditOS tenant merge | High risk — needs spike + ADR |
| Model Governance as product | Registry exists; product not built |
| Kubernetes deployment | Not in repo |
| Local AI as marketed capability | Ollama path pilot-only |

---

## Dependency Graph (Simplified)

```
Phase 0 (truth + CI gate)
    ├── Phase 1 (prod blockers: pentest, RDS, deploy)
    │       └── Phase 2 (verification: Postgres CI, Cypress)
    ├── Phase 3 (auth convergence)
    │       └── Phase 4 (platform hardening)
    └── Phase 6 (pilots — parallel from week 2)
            └── Phase 5 (product debt — after pilot stable)

Phase 7 (strategic) — blocked by Phase 3 + 4
```

---

## Resource Allocation Recommendation

| Stream | % Engineering (90 days) | Rationale |
|--------|-------------------------|-----------|
| Production blockers + CI | 25% | Unblocks trust |
| Governance convergence | 25% | Highest architectural risk |
| Pilot support (AuditOS + LCOS) | 30% | Revenue/evidence |
| Platform hardening (storage, audit, outbox) | 15% | Enables L5→L6 for real |
| Sales consolidation | 5% | Freeze + plan only |
| New products | **0%** | Explicit defer |

---

## Success Metrics (90-Day)

| Metric | Baseline | Target |
|--------|----------|--------|
| Doc L6 products falsely claimed | ~12 | 0 — all L4–L5 labeled |
| Deploy without CI pass | Possible | **Impossible** |
| Pentest | Not scheduled | Complete or in remediation |
| Prod RDS backup retention | 0 days | 30 days |
| Server actions using authorize() | ~15 files | ≥80% pilot actions |
| True Postgres CI tests | 0 | ≥10 integration tests |
| Cypress in CI | No | Smoke on PR |
| Pilot customers on AuditOS/LCOS | — | ≥1 with signed pilot brief |

---

## Freeze List (Do Not Touch During Phase 1–2)

1. AuditOS engagement Prisma models and workflow states
2. LocalContentOS scoring formulas (GP-01, WRK-03, SPN-03)
3. `/auditos` demo isolation architecture
4. NextAuth JWT claim shape
5. Production database destructive migrations

---

## Decision Points for Architecture Board

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Commercial launch date | Wait for pentest vs launch with disclaimer | **Wait** — NO-GO until Phase 1 complete |
| AuditOS tenant model | Keep parallel vs converge | **Keep short-term; ADR for long-term converge** |
| Sales intelligence | v02 vs salesos | **salesos canonical; archive v02** |
| AI in pilot | Deterministic vs real providers | **Deterministic default; real providers opt-in per org with budget** |
| L6 label policy | Marketing vs engineering | **Engineering uses L4–L5; L6 only after Phase 1–4 exit criteria** |

---

## Immediate Next 5 Actions (This Week)

1. Merge CI-gated deploy change
2. Update PRODUCT_STATUS_MATRIX maturity column from this audit
3. Open pentest procurement ticket
4. Apply prod RDS tfvars upgrade (or document blocked on account upgrade with date)
5. Add institutional-memory to middleware matcher

---

**Evidence base:** `AQLIYA_FULL_REALITY_AUDIT.md`, `AQLIYA_ARCHITECTURE_RISKS_AND_GAPS.md`, `AQLIYA_PRODUCT_MATURITY_MATRIX.md`, `AQLIYA_PLATFORM_CAPABILITY_ASSESSMENT.md`, READINESS_GATES, PRODUCTION_BLOCKERS_REGISTER.

**Completion status:** DONE
