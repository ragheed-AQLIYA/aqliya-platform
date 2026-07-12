# Architecture Drift Report

**Agent:** architecture-drift  
**Generated:** 2026-07-11T02:08:06.847Z  
**Score:** 73/100  
**Findings:** 5 (critical 3, high 1, medium 1, low 0, info 0)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 3 |
| high | 1 |
| medium | 1 |
| low | 0 |
| info | 0 |

## Mandate

This agent **monitors drift** from approved architecture.
It does **not** redesign architecture, migrate authorization, or change product boundaries.
OpenCode remains implementation authority for any remediation.

## Checks

- Client/server boundary violations
- Cross-product domain imports
- Unexpected src/ layers
- ADR path conflicts vs code
- Pattern drift (components → Prisma)
- Disallowed dependency direction (actions → app)
- Standard layers: src/app, src/actions, src/components, src/lib, src/core, prisma

## CRITICAL Findings

### F-0819 — Client module imports Prisma

- **Category:** layer-violation
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** import '@prisma/client'

### F-0821 — Client module imports Prisma

- **Category:** layer-violation
- **Files:** `src/app/(dashboard)/decisions/[id]/tender/page.tsx`
- **Evidence:** import '@prisma/client'

### F-0822 — Client module imports Prisma

- **Category:** layer-violation
- **Files:** `src/app/(dashboard)/decisions/[id]/outcome/page.tsx`
- **Evidence:** import '@prisma/client'

## HIGH Findings

### F-0820 — Client module imports server-only boundary

- **Category:** layer-violation
- **Files:** `src/app/(dashboard)/settings/sso/page.tsx`
- **Evidence:** import '@/lib/auth/sso-service' in use client module
- **Suggestion:** Route through Server Actions; keep Prisma/auth server-side.

## MEDIUM Findings

### F-0823 — Cross-product import: sales → workflowos

- **Category:** domain-boundary
- **Files:** `src/lib/sales/__tests__/workflowos-expansion.test.ts`
- **Evidence:** src/lib/sales/__tests__/workflowos-expansion.test.ts imports @/actions/workflowos-actions
- **Suggestion:** Prefer Core shared APIs over deep product-to-product imports.

---

_AQLIYA Engineering Excellence · architecture-drift_
