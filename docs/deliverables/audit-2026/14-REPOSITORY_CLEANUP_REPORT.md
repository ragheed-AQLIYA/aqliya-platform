# REPOSITORY CLEANUP REPORT — AQLIYA
**Date:** 2026-06-20  
**Scope:** All findings requiring cleanup across the repository

---

## 1. Priority Cleanup Items

| ID | Issue | Location | Severity | Effort |
|----|-------|----------|----------|--------|
| CL-01 | Duplicate root documents (8 pairs) | `docs/` root + `docs/archive/` | LOW | 30 min |
| CL-02 | Empty directories (3) | `tests/`, `docs/brand/`, `docs/templates/` | LOW | 15 min |
| CL-03 | Authority hierarchy conflict | `.skills/aqliya/aqliya-parallel-director.md §2` | **HIGH** | 30 min |
| CL-04 | Roadmap v1.1 vs v1.2 | `docs/official/` | MEDIUM | 30 min |
| CL-05 | CSP discrepancy | `next.config.mjs` vs `middleware-security.ts` | MEDIUM | 1 hour |
| CL-06 | Missing middleware matcher entries | `/api/sales/*`, `/api/notifications/*` | LOW | 1 hour |
| CL-07 | Binary assets in root | `.pptx`, `.docx`, `.xlsx`, `.pdf` in root | LOW | 30 min |
| CL-08 | Duplicate knowledge | Materiality, risk, IFRS across multiple locations | LOW | 2 hours |
| CL-09 | Stale CLAUDE.md route table | `CLAUDE.md` taxonomy vs current routes | MEDIUM | 1 hour |
| CL-10 | `.env` has dev-only values | `SCIM_API_KEY` weak test value | LOW | 15 min |
| CL-11 | Section numbering issue | AGENTS.md jumps §35 → §37 → §36 | LOW | 15 min |
| CL-12 | RiskOS route status unresolved | Routes exist despite "do not build" | MEDIUM | 1 hour |

## 2. Documentation Cleanup

| Action | Files | Reason |
|--------|-------|--------|
| Remove exact duplicates from root | 8 files | Archive copies already exist |
| Archive `aqliya-roadmap-v1.1.md` | 1 file | Superseded by v1.2 |
| Remove or fill `docs/brand/` | Empty | Remove or add content |
| Remove or fill `docs/templates/` | Empty | Remove or add content |
| Tag 307 archive files with classification | 307 files | Add clear archive markers |
| Merge duplicate `EXECUTIVE_SUMMARY.md` | 4 files | Consolidate to one |
| Merge duplicate `pilot-success-criteria.md` | 4 files | Consolidate to one |

## 3. Code Cleanup

| Action | Files | Effort |
|--------|-------|--------|
| Fix SalesOS schema drift (R-04) | `lib/sales/prisma-repository.ts` | **HIGH** — 35 `as any` |
| Fix AuditDB schema drift (R-03) | `lib/audit/db/index.ts` | MEDIUM — 12 `as any` |
| Fix DecisionOS `as any` casts (C3) | `actions/decisions.ts` | MEDIUM |
| Fix RAG layer `as any` | `lib/ai/` | LOW — feature-flagged |
| Fix Office AI `as unknown as` | OfficeAI layer | LOW |
| Add `/api/sales/*` to middleware matcher | `middleware.ts` | LOW |
| Add `/api/notifications/*` to middleware matcher | `middleware.ts` | LOW |

## 4. Knowledge Cleanup

| Action | Files | Reason |
|--------|-------|--------|
| Create knowledge index | All knowledge | Missing central index |
| Merge duplicate standards knowledge | 3+ locations | Materiality, risk, IFRS |
| Tag knowledge with code references | 364 files | Add model/service references |
| Review stale knowledge | 364 files | Check freshness |

## 5. Security Cleanup

| Action | Files | Reason |
|--------|-------|--------|
| Fix CSP Sentry connect-src | `middleware-security.ts` | Sentry reporting broken |
| Add HEALTHCHECK to Dockerfile | `Dockerfile` | Missing health check |
| Add non-root user to Dockerfile | `Dockerfile` | Security best practice |
| Set production `MFA_REQUIRED_ROLES` | `.env.example` | Clarify production config |

## 6. Configuration Cleanup

| Action | Files | Reason |
|--------|-------|--------|
| Fix parallel-director authority hierarchy | `.skills/aqliya/aqliya-parallel-director.md` | **HIGH** — must align with AGENTS.md |
| Fix AGENTS.md section ordering | `AGENTS.md` | §35→§37→§36 |
| Update CLAUDE.md route table | `CLAUDE.md` | Stale taxonomy |
| Sync CLAUDE.md product status | `CLAUDE.md` | Out of sync with PRODUCT_STATUS_MATRIX |

## 7. Deferred Cleanup (Strategic)

| Item | Reason | Target |
|------|--------|--------|
| Consolidate 3 audit log implementations | Refactor, not urgent | Post-v0.1 |
| Merge product-specific audit events into PlatformAuditLog | Architecture decision | Post-v0.1 |
| Complete ABAC policy enforcement | Model exists, not used | Post-v0.1 |
| Unify Intelligence Core cross-product engine | Strategic | Post-v0.1 |
| ContentStudio documentation | Product taxonomy addition | Post-v0.1 |

## 8. Cleanup Summary

| Category | Items | Priority | Est. Effort |
|----------|-------|----------|-------------|
| Documentation duplicates | 8+ | LOW | 2 hours |
| Empty directories | 3 | LOW | 30 min |
| Authority hierarchy fix | 1 | **HIGH** | 30 min |
| Roadmap version conflict | 1 | MEDIUM | 30 min |
| Code quality fixes | 6 | MEDIUM-HIGH | 4 hours |
| Security fixes | 4 | MEDIUM | 2 hours |
| Knowledge cleanup | 4 | LOW | 4 hours |
| Config fixes | 4 | MEDIUM | 2 hours |
| **Total** | **31 items** | **Mix** | **~16 hours** |
