# Slice 26 — AuditOS sampling tests + browser smoke doc

**Date:** 2026-06-07  
**Baseline:** `95ca9f0`

## Delivered

| ID | Deliverable |
| -- | ----------- |
| **TEST** | `audit-sampling-action.test.ts` — action + audit event + empty TB guard |
| **OPS** | `audit-sampling-browser-smoke.md` — 5 min manual checklist |
| **OPS** | `demo:smoke` extended for sampling routes + tests |
| **DOC** | `customer-demo-runbook.md` — optional sampling segment |

## Validation

| Command | Result |
| ------- | ------ |
| `npm test -- …sampling-engine…` + `…audit-sampling-action…` | **PASS** (7) |
| `npm run demo:smoke` | **PASS** |
| `npx tsc --noEmit` | **PASS** |

## Not in scope (left unstaged)

| WIP | Reason |
| --- | ------ |
| `auth-config.ts`, `login/page.tsx`, `schema.prisma` SSO | Needs migration + signIn hardening — separate slice |

**Status:** DONE
