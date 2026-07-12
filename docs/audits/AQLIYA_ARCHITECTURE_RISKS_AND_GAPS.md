# AQLIYA Architecture Risks and Gaps

> **Status:** Code-reconciled | **Date:** 2026-07-10  
> **Purpose:** Top architectural risks, governance gaps, coupling problems, data risks, and production blockers for architecture board decisions

---

## Executive Risk Posture

| Category | Count Critical | Count High | Count Medium |
|----------|---------------|------------|--------------|
| Production / ops | 2 | 4 | 3 |
| Security / governance | 1 | 4 | 3 |
| Architecture / coupling | 0 | 5 | 4 |
| Data / schema | 0 | 3 | 2 |
| Documentation / commercial truth | 0 | 1 | 2 |

**Overall risk level for commercial production:** **HIGH** — pilot operations acceptable with runbook; commercial launch requires closing Critical and most High items.

---

## Architecture Risk Table

| Risk | Category | Evidence | Consequence | Recommendation |
|------|----------|----------|-------------|----------------|
| **Dual tenant identity graphs** | Architecture | `AuditOrganization`/`AuditUser` vs `Organization`/`User` in `prisma/schema.prisma`; `audit/tenant-guard.ts` separate from `authorization/tenant-guard.ts` | RBAC/isolation implemented twice; cross-product org linking fragile; onboarding complexity | Document bridge rules now; plan phased AuditOS tenant convergence on `Organization` |
| **RB-02 auth engine not primary** | Governance | `authorization/engine/` used in shadow via `FEATURE_AUTHZ_SHADOW` in `auth.ts`; `authorize()` ~15 call sites vs hundreds for `requireUserContext` | Inconsistent permission enforcement; policy drift | Promote engine to primary path; migrate server actions incrementally |
| **Dual role vocabularies** | Governance | `ADMIN/OPERATOR/VIEWER` in auth vs lowercase in download gate | Misauthorization edge cases | Single role enum + mapping layer |
| **Sales v02/vnext parallel stacks** | Architecture | `src/lib/sales/v02/` (62 files), `vnext/` (39 files); ESLint ignores; active imports from components | Unmaintainable intelligence layer; build debt returns | Freeze v02 growth; consolidate to single salesos path |
| **Dual Sales lib patterns** | Architecture | `src/lib/sales/` + `src/lib/salesos/` + `src/products/sales/` | Duplicated domain logic; schema drift (`@ts-nocheck` repository) | Pick canonical DDD path; archive other |
| **Settings route split** | Architecture/UX | `src/app/settings/*` vs `src/app/(dashboard)/settings/*` — same URL prefix | Inconsistent layout, auth context, operator confusion | Merge under single layout group |
| **Office AI dual route trees** | Architecture | `/assistant/*` vs `/office-ai/advanced/*`; stats outside dashboard layout | User/operator confusion; incomplete chrome | Unify under `/assistant` with admin sub-routes |
| **Fragmented audit logging** | Data/Governance | `PlatformAuditLog` + `AuditEvent` + `SalesAuditEvent` + `LocalContentAuditEvent` + `WorkflowAuditEvent` + `DecisionGovEvent` | Incomplete cross-product lineage; SIEM gaps | Define unified query layer; migrate writes to PlatformAuditLog with product namespace |
| **Three storage entrypoints** | Platform | `platform/storage/index.ts` (local default), `storage-factory.ts` (S3), `audit/storage/` | Wrong backend in prod if misconfigured; evidence loss risk | Single factory; env validation fails if prod uses local |
| **CoreEvidence not canonical** | Data | `core/evidence/core-evidence-service.ts` mirrors product tables | Traceability gaps if mirror not registered | Mandatory register on all upload mutations |
| **In-memory output service** | Platform | `core/output/index.ts` — InMemoryOutputService | Approval/output not durable | Persist to platform output records |
| **Intelligence Core partial adoption** | Architecture | Products use legacy lib paths; core barrel exists | Convergence stall; duplicate engines | Product-by-product adapter migration checklist |
| **Content Studio vs LC overlap** | Product boundary | `/content-studio/*` + LC dashboard references | Taxonomy confusion (docs corrected but UX overlap remains) | Clear nav separation; no shared "content" naming in LC |
| **Sunbul deep links persist** | Legacy | `/sunbul/clients/...` parallel to `/workflowos/...` | Bookmark confusion | Keep redirects; remove Sunbul from new docs/links |
| **Dead middleware route key** | Maintenance | `routeMinRoles["/decision"]` — no routes | Misleading config | Remove dead key |
| **Broken audit nav link** | UX | `/audit/settings` in `audit-header.tsx` — no route | 404 for operators | Fix or remove link |
| **Command palette hardcoded IDs** | UX/Demo | `command-palette.tsx` → `acme-2025`, `techstart` | 404 without seed data | Dynamic recent engagements or seed-aware IDs |
| **Institutional memory middleware gap** | Security | `/institutional-memory/*` not in middleware matcher; client-only layout | Unauthenticated page shell exposure | Add to matcher + layout auth |
| **ADMIN cross-tenant access** | Security | `tenant-guard.ts` ADMIN bypass | Data leak if ADMIN compromised | Scope ADMIN; use explicit operator role |
| **Global Prisma mock in tests** | Quality | `jest.config.js` mocks `@prisma/client` | False confidence in data integrity | Postgres integration job in CI |
| **ESLint ignore zones** | Quality | Large ignores for sales vnext, audit UI, integration | Hidden regressions | Incremental un-ignore with fixes |
| **Stale production/ terraform env** | Infra | `environments/production/` placeholder account | Wrong-region deploy mistake | Archive or delete; document prod = `environments/prod/` |
| **Dual deploy workflows** | Infra | `deploy.yml` eu-north-1 vs `promote.yml` me-south-1 | Operator deploys to wrong environment | Single canonical prod workflow |
| **Doc L6 inflation** | Commercial | `PRODUCT_STATUS_MATRIX.md` L6 rows vs open pentest, weak tfvars | False commercial claims; procurement risk | Sync to L4–L5 per this audit |

---

## Production Blocker Table

| Blocker | Severity | Affected Product/Platform | Evidence | Recommended Fix |
|---------|----------|---------------------------|----------|-----------------|
| Deploy not CI-gated | **Critical** | Platform | `.github/workflows/deploy.yml` triggers on `main` push independently of `ci.yml` | Add `workflow_run` with `workflows: ["CI"]` + success filter |
| No penetration test | **Critical** | All | `docs/audits/AQLIYA_PRODUCTION_BLOCKERS_REGISTER.md` B-01 | Schedule scoped external pentest |
| Prod RDS free-tier config | **High** | Platform | `infra/terraform/environments/prod/terraform.tfvars`: backup retention 0, Multi-AZ false, deletion protection false | Account upgrade + terraform apply targets |
| Dual production deploy paths | **High** | Platform | deploy.yml vs promote.yml regions/domains/clusters | Deprecate promote or merge; document single path |
| Mock integration tests in CI | **High** | QA | `jest.config.js` global Prisma mock; no `test:integration` in CI | Add Postgres service job with real integration subset |
| Rate limiter memory default | **High** | Platform (multi-instance) | Default `RATE_LIMITER=memory` | Set `redis` in ECS task definition |
| Authorization fragmentation | **High** | All products | Shadow RB-02 engine | Convergence program (see execution plan) |
| AuditOS parallel tenant | **High** | AuditOS + Platform | Separate org models | Long-horizon reconciliation; short-term document bridge |
| backup:verify non-blocking | **Medium** | Data integrity | `ci.yml` `continue-on-error: true` | Make blocking or nightly required check |
| Cypress not in CI | **Medium** | Regression | 11 specs, zero workflow refs | Add smoke E2E on PR |
| Pentest-adjacent: SCIM key rotation | **Medium** | Identity | API key auth without documented rotation | Add runbook rotation step |
| ClamAV runtime unverified | **Medium** | File uploads | IaC sidecar + code; no live probe this audit | Post-deploy smoke for scanner |
| Queue no-op without flag | **Medium** | Async jobs | `queue.enabled` off → fake task IDs | Enable in staging; monitor |
| AI real providers off | **Medium** | AI claims | `ai.real-providers` default off | Honest marketing; flag policy doc |
| Organizations doc stale | **Low** | Docs | Matrix line 95 "mock-only" vs Prisma page | Delete stale note |

---

## Authorization Fragmentation Assessment

### Systems observed (count: 4+)

1. **Edge middleware RBAC** — `routeMinRoles` in `middleware.ts` (viewer/admin per prefix)
2. **Session role enum** — `getCurrentUser()` / `requireUserContext("ADMIN")` 
3. **RB-02 policy engine** — 6-stage pipeline, pol-01 through pol-09 — **shadow only**
4. **Product guards** — `audit/tenant-guard`, `local-content/guards`, `sales/guards`, `workflowos/tenant-guard`
5. **ABAC** — `core/policy/access/` — env-gated enforce
6. **Legacy permissions** — `platform/access/permissions.ts`

### Fragmentation score: **7/10 (high)**

**Impact:** New features may pick any of 4 patterns. Security review burden high. Policy changes require multi-file updates.

**Target state:** Middleware (coarse) → `authorize()` engine (fine) → product resource guard (scope) — single documented stack.

---

## Governance Integrity Assessment

| Control | Coverage | Gap |
|---------|----------|-----|
| Auth on workspace routes | ~95% | institutional-memory edge gap |
| Tenant scoping on writes | ~90% | ADMIN bypass; AuditOS separate checks |
| Audit on mutations | ~85% | Not all read/export paths logged uniformly |
| Human review on AI outputs | ~70% | Product-varying; deterministic default masks review need |
| Export approval | ~60% | WorkflowOS/AuditOS strong; others partial |
| Evidence linkage | ~65% | CoreEvidence mirror incomplete |
| SoD / maker-checker | ~30% | Models exist; under-adopted |
| Demo isolation | **100%** for `/auditos` | Strong pattern to replicate |

**Governance integrity score: 6/10 (medium)** — suitable for pilot with human oversight; not for unsupervised commercial multi-tenant without hardening.

---

## Data Architecture Risks

| Risk | Details | Severity |
|------|---------|----------|
| Schema size (243 models) | High coupling surface; migration risk | Medium |
| Cross-product IntelligenceGraph | Nodes reference multiple products — orphan risk on delete | Medium |
| Soft-delete inconsistency | Products use different archive patterns | Medium |
| Sales schema drift | `@ts-nocheck` prisma repository documented R-04 | High |
| Missing FK governance on some JSON metadata fields | Risk flags in contacts stored in metadata JSON | Low |
| Seed coupling | Pilot demos depend on seed scripts — not migration-safe for prod | Medium |

---

## Coupling Heat Map

```
High coupling (reduce):
  AuditOS ←→ PlatformOrganization bridge
  Sales v02 ←→ Sales vnext ←→ components/sales
  LocalContent ←→ ContentStudio (conceptual)
  All products ←→ PlatformAuditLog (good coupling)

Low coupling (preserve):
  /auditos demo isolation
  Knowledge Foundation ←→ core release pipeline
  Download gate ←→ API routes
```

---

## Security-Specific Risks

| Risk | Evidence | Mitigation |
|------|----------|------------|
| Ungated deploy | deploy.yml | CI gate |
| MFA not uniform | mfa-gate exists; not all routes | Expand MFA requirement for admin |
| Download routes | Protected per recent hardening pass | Maintain; audit new routes |
| `/api/skills/evaluate` | ADMIN gated | Good — keep |
| SCIM API keys | Real provisioning | Rotation runbook |
| CSP hardening | Prior pass removed unsafe-inline | Verify on prod headers |
| Secrets in docs | None found in audit | Continue prohibition |

---

## What Must Not Be Refactored During Pilot (Freeze List)

1. **AuditOS engagement workflow** — stabilize only; no schema breaks
2. **LocalContentOS scoring engine** — pilot depends on it
3. **NextAuth session shape** — downstream JWT assumptions
4. **`/auditos` demo isolation** — commercial demo dependency
5. **Prisma migration history** — no destructive resets on prod

---

## Architecture Decision Records Needed

| ADR topic | Urgency |
|-----------|---------|
| Single production deploy path | Immediate |
| AuditOS tenant convergence strategy | High |
| Authorization stack convergence | High |
| Sales intelligence consolidation | Medium |
| Unified audit ledger migration | Medium |
| Storage factory as sole entrypoint | Medium |

---

**Cross-references:**
- Full audit: `AQLIYA_FULL_REALITY_AUDIT.md`
- Execution order: `AQLIYA_EXECUTION_PRIORITY_PLAN.md`
- Product levels: `AQLIYA_PRODUCT_MATURITY_MATRIX.md`

**Status:** DONE
