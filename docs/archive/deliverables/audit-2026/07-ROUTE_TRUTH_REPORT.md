# ROUTE TRUTH REPORT — AQLIYA
**Date:** 2026-06-20  
**Scope:** `src/app/` route structure vs `ROUTE_STRATEGY.md`, `ROUTE_REGISTRY.md`, and middleware coverage

---

## 1. Route Summary

| Category | Routes | Pages | API | Auth |
|----------|--------|-------|-----|------|
| Public marketing | 40+ | 40+ | 0 | No |
| English marketing | 10 | 10 | 0 | No |
| Public demo | 6 | 6 | 0 | No |
| AuditOS workspace | 25+ | 20+ | 5 API | Yes |
| LocalContentOS | 20+ | 18+ | 2 API | Yes |
| SalesOS | 30+ | 28+ | 1 API | Yes |
| DecisionOS | 20+ | 18+ | 2 API | Yes |
| Contacts | 8+ | 8 | 0 | Yes |
| WorkflowOS | 8+ | 7 | 3 API | Yes |
| Settings | 10+ | 10 | 0 | Yes |
| API only | 0 | 0 | 19 groups | Varied |
| **Total** | **~200** | **~160** | **~40** | |

## 2. Route Registration Status

| Document | Status vs Reality | Notes |
|----------|------------------|-------|
| `ROUTE_STRATEGY.md` | ✅ Matches after hardening | Synced 2026-06-17 |
| `ROUTE_REGISTRY.md` | ⚠️ Partial drift | Some new routes not registered |
| CLAUDE.md route table | ⚠️ Out of sync | Needs update |
| Middleware matcher | ⚠️ Coverage gaps | Sales/notifications API paths missing |

## 3. Middleware Coverage Analysis

### Protected Routes (middleware checks JWT + RBAC)

```
/audit/*           → viewer+    ✅
/decisions/*       → viewer+    ✅
/decision/*        → viewer+    ✅
/local-content/*   → viewer+    ✅
/sales/*           → viewer+    ✅
/contacts/*        → viewer+    ✅
/workflowos/*      → viewer+    ✅
/sunbul/*          → viewer+    ✅
/settings/*        → viewer+    ✅
/assistant/*       → viewer+    ✅
/intelligence/*    → viewer+    ✅
/institutional-memory/* → viewer+ ✅
/office-ai/*       → viewer+    ✅
/risk/*            → viewer+    ✅
/sampling/*        → viewer+    ✅
/print/*           → viewer+    ✅
/content-studio/*  → viewer+    ✅
/organizations/*   → admin       ✅
/monitoring/*      → admin       ✅
/operator/*        → admin       ✅
/api/audit/*       → viewer+    ✅
/api/decisions/*   → viewer+    ✅
/api/agent-memory  → viewer+    ✅
/api/office-ai/*   → viewer+    ✅
/api/local-content/* → viewer+  ✅
/api/sunbul/*      → viewer+    ✅
/api/workflowos/*  → viewer+    ✅
/api/metrics       → viewer+    ✅
/api/monitoring/*  → admin       ✅
/api/ai/*          → viewer+    ✅
/api/scim/*        → admin      ✅
/api/integration/* → viewer+    ✅
/api/platform/*    → admin      ✅
/api/skills/*      → admin      ✅
```

### Coverage Gaps

| Route | Issue | Risk |
|-------|-------|------|
| `/api/sales/*` | In RBAC map but NOT in middleware `matcher` | LOW — handler still checks session |
| `/api/notifications/*` | In RBAC map but NOT in middleware `matcher` | LOW — SSE stream with auth |
| `/api/custom-product-submit` | Public (unauthenticated) | LOW — marketing form |
| `/api/pilot-review` | Public (unauthenticated) | LOW — pilot intake form |
| `/api/auth/saml/[id]/metadata` | Public (exposes config) | LOW — required for SAML |

## 4. Demo Route Safety

| Route | Real Data? | Mutations? | Status |
|-------|-----------|------------|--------|
| `/auditos` | ❌ Mock only | ❌ Read-only | ✅ Safe |
| `/auditos/trial-balance` | ❌ Mock | ❌ Read-only | ✅ Safe |
| `/auditos/mapping` | ❌ Mock | ❌ Read-only | ✅ Safe |
| `/auditos/statements` | ❌ Mock | ❌ Read-only | ✅ Safe |
| `/auditos/evidence` | ❌ Mock | ❌ Read-only | ✅ Safe |
| `/auditos/traceability` | ❌ Mock | ❌ Read-only | ✅ Safe |

## 5. Route Naming Compliance

| Rule | Status | Observations |
|------|--------|--------------|
| Marketing in `(marketing)` | ✅ | Correct group |
| Dashboard in `(dashboard)` | ✅ | Correct group |
| Product routes top-level | ✅ | audit/, sales/, local-content/ |
| No auth on marketing | ✅ | Public routes |
| Auth on workspace routes | ✅ | All protected |
| Demo isolated | ✅ | `/auditos` separate |

## 6. Orphan Routes

| Route | Status | Notes |
|-------|--------|-------|
| `/risk/*` | ⚠️ Exists but RiskOS labeled "do not build" | Routes exist but feature-flagged? |
| `/contacts/*` | ✅ Active LocalContactOS | — |
| `/content-studio/*` | ⚠️ Partially built | May be incomplete |
| `/published/*` | ⚠️ May be unused | Check for traffic |

## 7. Recommendations

1. **Add `/api/sales/*` and `/api/notifications/*` to middleware matcher** — closes coverage gap
2. **Update ROUTE_REGISTRY.md** — register any new routes added since last sync
3. **Sync CLAUDE.md route table** — matches current ROUTE_STRATEGY.md
4. **Audit RiskOS routes** — if "do not build", remove or lock behind feature flag
5. **Review ContentStudio routes** — determine if active or deprecated
6. **Verify `/published/*` usage** — remove if unused
