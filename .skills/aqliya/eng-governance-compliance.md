---
name: eng-governance-compliance
description: Cross-cutting governance compliance check — architecture rules, product boundaries, coding standards, documentation authority, release gates
version: 1.0
date: 2026-07-13
status: active
owner: Layer 12 — Governance Engine
inputs: Change scope (files, routes, schema changes)
outputs: Governance pass/fail with specific rule violations and remediation
dependencies: engineering/os/COMPLIANCE.md, engineering/os/ADR_VALIDATION.md, AGENTS.md
---

# Governance Compliance Check

> **Purpose:** Validate that any change respects ALL governance rules. This is the **gate** that prevents violations before they reach production.

---

## Pre-Execution Rules (MUST PASS)

These rules are checked BEFORE a change is committed. Failure = BLOCK.

### GOV-01: No Prisma in Client Components

```
Check: Does any changed file import prisma AND contain "use client"?
Enforce: BLOCK if found.
Current score: 99% (3 violations remaining)
```

### GOV-02: Mutations Must Call enforce()/authorize()

```
Check: Does any new/changed Server Action write data without calling enforce()?
Enforce: BLOCK if no authorization check.
Current score: 52% (13 known violations — improvement area)
```

### GOV-03: No Auth Bypass

```
Check: Any pattern that could bypass auth? (hardcoded admin, skipped middleware, public API for private data)
Enforce: BLOCK if found.
Current score: 100%
```

### GOV-06: No `as any` in Production Code

```
Check: Any new `as any` cast? (grep for it)
Enforce: BLOCK if found.
Current score: 100% (0 casts)
```

### GOV-07: All Mutations Must Have Audit Trail

```
Check: Does every new/changed mutation create an audit event?
Enforce: WARN if missing, BLOCK for compliance-critical operations.
```

---

## Pre-Release Rules (MUST PASS before merge)

### GOV-04: No Cross-Product Domain Deep Imports

```
Check: Does this change add imports from another product's lib/ into another?
Example violation: src/lib/audit/ → imports from src/lib/decision/
Enforce: BLOCK if found.
Current score: 100%
```

### GOV-05: Download Routes Must Tenant-Scope

```
Check: Do download/export routes validate organizationId + return 404 on mismatch?
Enforce: BLOCK if tenant check absent.
Current score: 45% (6 violations)
```

### GOV-08: No AI Autonomous Decisions

```
Check: Can AI output directly trigger a state change without human review?
Enforce: BLOCK if AI output bypasses review gate.
```

---

## Pre-Release Rules (WARN — may ship with documented exception)

### GOV-09: Product Boundary Integrity

```
Check: Does this change respect product taxonomy?
Enforce: WARN if ambiguous product classification.
```

### GOV-10: Documentation Authority

```
Check: Do doc changes respect the hierarchy? (DOCUMENTATION_AUTHORITY.md)
Enforce: WARN if hierarchy violated.
```

---

## Architecture Rules (ADR Validation)

### Check Active ADRs

```
□ Is there an ADR that covers this change?
□ Does the change violate any active ADR?
□ If an ADR needs updating: is it documented?
```

**Reference:** `engineering/os/ADR_VALIDATION.md`

---

## Coding Standards

### Quick Checks

```
□ Files use TypeScript (no plain .js in src/)
□ No console.log in production paths (use structured logger)
□ Error messages are actionable (not "Error occurred")
□ Loading states exist for async pages
□ Empty states explain next action
□ Arabic-first copy for primary workflows
```

---

## Output Format

```md
## Governance Compliance: <change_description>

### BLOCKING Violations (must fix)
| Rule | Violation | File | Remediation |
|------|-----------|------|-------------|

### WARNINGS (should fix or document)
| Rule | Violation | File | Remediation |
|------|-----------|------|-------------|

### Compliance Score: X/100
### Gate Status: PASS / CONDITIONAL PASS / BLOCKED

### Required Approvals
- [ ] Architecture review
- [ ] Security review
- [ ] Product governance
```

---

## Integration

This skill is the **final gate** before:
- Any commit to `main`
- Any release deployment
- Any schema migration
- Any new route creation

Load it automatically when:
- `engineering/os/COMPLIANCE.md` detects a violation
- A change touches `src/middleware.ts`, `src/lib/auth/`, or `src/lib/security/`
- A change adds a new route or API endpoint
- A change modifies the Prisma schema
