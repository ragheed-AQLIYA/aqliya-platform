---
title: "RB-02B — Migration Parity Plan"
status: active
program: "Platform Authorization"
phase: "Implementation — Pre-Migration"
version: "1.0"
date: 2026-06-28
classification: migration-plan
---

# Migration Parity Plan

> **Purpose:** Define the methodology for migrating all ~433 legacy guard points to the new Authorization Engine with zero regressions. Every Wave 4–9 migration follows this plan.

---

## Migration Phases (per Guard Batch)

Each guard batch moves through three phases:

```
W4A ──► W4B ──► W4C
Shadow    Dual     Cutover
```

### Phase W4A — Shadow Mode

```
┌──────────────┐     ┌──────────────┐
│ Legacy Guard  │────►│ Production   │  ← Authoritative
│ (existing)    │     │ Decision     │
└──────────────┘     └──────────────┘
         │
         ▼
┌──────────────┐     ┌──────────────┐
│ New Engine   │────►│ Shadow Log   │  ← Recorded, not used
│ (shadow)     │     │ + Compare    │
└──────────────┘     └──────────────┘
```

**Rules:**
- Legacy guard is ALWAYS authoritative
- Engine result is logged and compared
- No production behavior changes
- Feature flag `FEATURE_AUTHZ_SHADOW` controls this

**Exit criteria:**
- 100+ shadow comparisons with ≥99% parity
- Zero unexpected DENY from engine
- All mismatches analyzed and resolved

---

### Phase W4B — Dual Decision

```
┌──────────────┐     ┌──────────────┐
│ Legacy Guard  │────►│ Production   │
│ (existing)    │     │ Decision     │
└──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐
│ New Engine   │────►│ Alert if     │
│ (live)       │     │ mismatch     │
└──────────────┘     └──────────────┘
```

**Rules:**
- Both systems run live
- Legacy still authoritatively decides
- Engine results compared in real-time
- Mismatches generate alerts (not errors)
- Feature flag `FEATURE_AUTHZ_DUAL` controls this

**Exit criteria:**
- 1,000+ comparisons with ≥99.5% parity
- Zero alert escalations from mismatches
- Engineering team confident in engine decisions

---

### Phase W4C — Cutover

```
┌──────────────┐     ┌──────────────┐
│ New Engine   │────►│ Production   │  ← Authoritative NOW
│ (primary)    │     │ Decision     │
└──────────────┘     └──────────────┘
         │
         ▼
┌──────────────┐     ┌──────────────┐
│ Legacy Guard │────►│ Fallback     │  ← Only if engine fails
│ (fallback)   │     │              │
└──────────────┘     └──────────────┘
```

**Rules:**
- Engine is PRIMARY decision maker
- Legacy guard is FALLBACK (failover)
- Any engine error triggers fallback and alert
- Feature flag `FEATURE_AUTHZ_CUTOVER` controls this

**Exit criteria:**
- 10,000+ comparisons with ≥99.9% parity
- Zero production incidents caused by engine
- Rollback tested and verified

---

## Rollback Strategy

| Phase | Rollback Command | Recovery Time | Data Loss Risk |
|-------|-----------------|:-------------:|:--------------:|
| W4A | Disable `FEATURE_AUTHZ_SHADOW` | < 1 second | None |
| W4B | Disable `FEATURE_AUTHZ_DUAL` | < 1 second | None |
| W4C | Enable `FEATURE_AUTHZ_FALLBACK` | < 1 second | None (dual running) |

**Always:** Rollback by toggling a feature flag — no code revert or deployment needed.

---

## Parity Metrics

| Metric | W4A Target | W4B Target | W4C Target |
|--------|:----------:|:----------:|:----------:|
| **Decision parity** | ≥99% | ≥99.5% | ≥99.9% |
| **Guard points migrated** | 0 | 0 | All batch |
| **Authorization regressions** | 0 | 0 | 0 |
| **Unexpected DENY** | 0 | 0 | 0 |
| **Unexpected ALLOW** | 0 | 0 | 0 |
| **Rollbacks** | N/A | N/A | 0 |

---

## Guard Migration Waves

| Wave | Product | Guard Points | Legacy Functions |
|:----:|---------|:------------:|------------------|
| W4 | DecisionOS | ~40 | `requireDecisionAccess()` |
| W5 | LocalContentOS | ~50 | `requireProjectAccess()`, `requireWorkbookAccess()`, `requireOrganizationAccess()`, `requirePatternSuggestionAccess()`, `requireMatchReviewAccess()`, `assertProjectAccess()` |
| W6 | SalesOS | ~60 | `requireSalesPermission()`, `assertSalesAccountAccess()`, `assertSalesDealAccess()` |
| W7 | AuditOS | ~33 | `assertEngagementAccess()`, `assertClientAccess()`, `assertOrganizationAccess()` |
| W8 | WorkflowOS | ~26 | `requireClientAccess()`, `requireWorkflowAdmin()` |
| W9 | Core Cleanup | ~224 | `requireUserContext()`, `isAdmin()`, `isOperator()`, `isViewer()`, 70 role comparisons, 6 admin bypasses |

---

## Legacy Guard → New Engine Mapping

See `GUARD_MIGRATION_MAP.md` for the complete mapping of every legacy function to its engine equivalent.

---

## Feature Flags

| Flag | Phases | Default | Purpose |
|------|--------|:-------:|---------|
| `FEATURE_AUTHZ_SHADOW` | W4A | Off | Enable engine shadow evaluation |
| `FEATURE_AUTHZ_DUAL` | W4B | Off | Enable dual decision comparison |
| `FEATURE_AUTHZ_CUTOVER` | W4C | Off | Make engine the primary decision maker |
| `FEATURE_AUTHZ_FALLBACK` | All | On | Fall back to legacy if engine fails |

---

## Guard Batch Template

Each guard migration follows this template:

```
─────────────────────────────────────────
Guard: requireDecisionAccess (decisionId)
Product: DecisionOS
Wave: W4A → W4B → W4C
Engine equivalent:
  authorize({
    userId,
    organizationId,
    role: user.role,
    resourceType: "decision",
    resourceId: decisionId,
    action: "decision.access"
  })
Shadow adapter: ✓
Tests: 5 (ALLOW, DENY-role, DENY-org, REQUIRE_APPROVAL, READ_ONLY)
Parity gate: ≥99%
─────────────────────────────────────────
```

---

## Traceability

Every migration commit must include:
- BEFORE.md — legacy guard behavior
- AFTER.md — new engine behavior
- GATE.md — parity check results
- GUARD_MIGRATION_MAP.md — updated with completion date
- Feature flag configuration

---

> *Start with W4A (Shadow Mode) for DecisionOS. Do NOT proceed to W4B until parity ≥99% is sustained across 100+ comparisons.*
