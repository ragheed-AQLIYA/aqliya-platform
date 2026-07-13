# Active Governance Rules

**Status:** Active — Enforced before execution  
**Owner:** Layer 12 (Governance Engine)  
**Last Updated:** 2026-07-13  
**Enforcement:** This file is loaded by OpenCode before any code change. Rules are checked in order.

---

## Rule Format

```yaml
rule_id: GOV-NN
rule: <rule name>
severity: BLOCK | WARN
check: <description of what to check>
violation_message: <message when violated>
current_score: <percentage compliance>
trend: improving | stable | declining
last_audited: <date>
```

---

## Active Rules

### GOV-01: No Prisma in Client Components
```yaml
rule_id: GOV-01
rule: NO_PRISMA_IN_CLIENT
severity: BLOCK
check: Any file with "use client" must not import from @/lib/prisma or any file that transitively imports prisma.
violation_message: "CRITICAL: Client component imports Prisma. Server-only boundary violated. Move DB access to Server Action."
current_score: 99%
trend: stable
last_audited: 2026-07-11
remaining_violations: 3 (integration page, tender page, outcome page)
```

### GOV-02: Mutations Must Call enforce()
```yaml
rule_id: GOV-02
rule: ACTIONS_USE_ENFORCE
severity: BLOCK (new code) | WARN (existing)
check: Every Server Action that writes data must call enforce() or authorize() before the write.
violation_message: "GOV-02: Mutating action does not call enforce(). Add authorization check before DB write."
current_score: 52%
trend: declining
last_audited: 2026-07-11
remaining_violations: 13 actions
```

### GOV-03: No Auth Bypass
```yaml
rule_id: GOV-03
rule: NO_AUTH_BYPASS
severity: BLOCK
check: No hardcoded admin tokens, no skipped middleware checks, no public APIs for private data.
violation_message: "CRITICAL: Authorization bypass detected. Route/data must be protected."
current_score: 100%
trend: stable
last_audited: 2026-07-11
```

### GOV-04: No Cross-Product Deep Imports
```yaml
rule_id: GOV-04
rule: NO_CROSS_DOMAIN_DEEP_IMPORTS
severity: BLOCK
check: Product A's lib/ must not import from Product B's lib/. Use shared Core or Platform layer instead.
violation_message: "GOV-04: Cross-product import detected. Refactor to use shared Core module or add ADR exception."
current_score: 100%
trend: stable
last_audited: 2026-07-11
```

### GOV-05: Download Routes Tenant-Scoped
```yaml
rule_id: GOV-05
rule: DOWNLOAD_ROUTES_TENANT_SCOPED
severity: BLOCK
check: All /api/*/download and /api/*/export routes must validate organizationId and return 404 (not 403) on tenant mismatch.
violation_message: "GOV-05: Download route missing tenant check. Add organizationId validation. Return 404, not 403."
current_score: 45%
trend: stable
last_audited: 2026-07-11
remaining_violations: 6 routes
```

### GOV-06: Zero `as any` in Production Code
```yaml
rule_id: GOV-06
rule: NO_AS_ANY
severity: BLOCK
check: No `as any` type cast in src/ (excluding test files).
violation_message: "GOV-06: `as any` cast detected. Use proper type narrowing or @ts-expect-error with rationale comment."
current_score: 100%
trend: stable
last_audited: 2026-07-13
```

### GOV-07: Mutations Must Log Audit Events
```yaml
rule_id: GOV-07
rule: AUDIT_TRAIL_REQUIRED
severity: BLOCK (compliance-critical) | WARN (non-critical)
check: All state-changing operations must create an audit event (writePlatformAuditLog or domain-specific).
violation_message: "GOV-07: Mutation without audit trail. Add audit event logging."
current_score: not measured
trend: unknown
last_audited: pending
```

### GOV-08: No AI Autonomous Decisions
```yaml
rule_id: GOV-08
rule: AI_HUMAN_REVIEW_GATE
severity: BLOCK
check: AI-generated output must not directly trigger state changes. Must pass through human review gate.
violation_message: "GOV-08: AI output bypasses human review. Add review/approval step before state change."
current_score: not measured
trend: unknown
last_audited: pending
```

### GOV-09: Product Boundary Integrity
```yaml
rule_id: GOV-09
rule: PRODUCT_BOUNDARY
severity: WARN
check: New code must align with product taxonomy. No ambiguous product classification.
violation_message: "GOV-09: Code does not clearly belong to a defined product. Tag with product or document exception."
current_score: not measured
trend: unknown
last_audited: pending
```

### GOV-10: Documentation Authority Compliance
```yaml
rule_id: GOV-10
rule: DOCS_AUTHORITY
severity: WARN
check: Documentation changes must respect the hierarchy in docs/DOCUMENTATION_AUTHORITY.md.
violation_message: "GOV-10: Documentation change violates authority hierarchy. Adjust or document exception."
current_score: not measured
trend: unknown
last_audited: pending
```

### GOV-11: No Actions Import from app/
```yaml
rule_id: GOV-11
rule: NO_ACTIONS_IMPORT_APP
severity: BLOCK
check: Server Actions in src/actions/ must not import from src/app/.
violation_message: "GOV-11: Action imports from app/ route. Actions must be independent of route layer."
current_score: 100%
trend: stable
last_audited: 2026-07-11
```

### GOV-12: Error/Empty/Loading Boundaries on Workspace Routes
```yaml
rule_id: GOV-12
rule: ROUTE_BOUNDARIES
severity: WARN (existing) | BLOCK (new workspace routes)
check: All authenticated workspace routes must have error.tsx, loading.tsx, not-found.tsx.
violation_message: "GOV-12: Workspace route missing boundary file. Add error.tsx, loading.tsx, and/or not-found.tsx."
current_score: ~50-60% (167/284 error, 170/284 loading, 140/284 not-found)
trend: improving
last_audited: 2026-07-13
```

---

## Enforcement Pipeline

```
Change Proposed
    │
    ▼
┌───────────────────────────┐
│ GOV-01: Prisma in Client? │─── BLOCK if yes
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│ GOV-06: as any?          │─── BLOCK if yes
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│ GOV-02: enforce() call?  │─── BLOCK if new mutation without
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│ GOV-11: Actions→app?     │─── BLOCK if yes
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│ GOV-04: Cross-product?   │─── BLOCK if yes
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│ GOV-12: Route boundaries?│─── WARN if missing
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│ GOV-07: Audit trail?     │─── BLOCK/WARN based on criticality
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│ GOV-08: AI review gate?  │─── BLOCK if AI bypasses review
└───────────┬───────────────┘
            ▼
       APPROVED or REJECTED
```

---

## Score Card

| Rule | Score | Status |
|------|-------|--------|
| GOV-01 (NO_PRISMA_IN_CLIENT) | 99% | 🟢 Good |
| GOV-02 (ACTIONS_USE_ENFORCE) | 52% | 🔴 Needs work |
| GOV-03 (NO_AUTH_BYPASS) | 100% | 🟢 Excellent |
| GOV-04 (NO_CROSS_DOMAIN) | 100% | 🟢 Excellent |
| GOV-05 (DOWNLOAD_TENANT) | 45% | 🔴 Needs work |
| GOV-06 (NO_AS_ANY) | 100% | 🟢 Excellent |
| GOV-07 (AUDIT_TRAIL) | N/M | 🟡 Needs audit |
| GOV-08 (AI_REVIEW_GATE) | N/M | 🟡 Needs audit |
| GOV-09 (PRODUCT_BOUNDARY) | N/M | 🟡 Needs audit |
| GOV-10 (DOCS_AUTHORITY) | N/M | 🟡 Needs audit |
| GOV-11 (NO_ACTIONS_IMPORT_APP) | 100% | 🟢 Excellent |
| GOV-12 (ROUTE_BOUNDARIES) | ~55% | 🟡 Needs work |

**Overall Governance Score: 82%** (8 measured rules)
