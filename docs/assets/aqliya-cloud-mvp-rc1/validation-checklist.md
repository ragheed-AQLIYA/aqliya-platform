# AQLIYA Cloud MVP RC1 — Validation Checklist

**Release:** RC1
**Last validated:** 2026-05-20
**Purpose:** Confirm all verification scripts pass before demo or pilot

---

## Pre-Checks

| # | Command | Expected | Actual |
|---|---|---|---|
| 1 | `npx prisma validate` | Schema valid | ☐ |
| 2 | `npx tsc --noEmit` | 0 errors | ☐ |
| 3 | `npm run lint` | 0 errors (pre-existing warnings OK) | ☐ |
| 4 | `npm run build` | All pages build | ☐ |

## Platform Foundation Verification

| # | Command | Expected | Actual |
|---|---|---|---|
| 5 | `npm run platform:verify-org-links` | 100% linked | ☐ |
| 6 | `npm run platform:verify-workspace-links` | 100% linked | ☐ |
| 7 | `npm run platform:verify-audit-logs` | All products present | ☐ |

## Dual-Write Verification (Dry-Run Only)

| # | Command | Expected | Actual |
|---|---|---|---|
| 8 | `npm run platform:auditos-dual-write:dry` | Plan shown, no changes | ☐ |
| 9 | `npm run platform:decisionos-dual-write:dry` | Plan shown, no changes | ☐ |

## Office AI Verification (Dry-Run Only)

| # | Command | Expected | Actual |
|---|---|---|---|
| 10 | `npm run office-ai:service:dry` | Plan shown, no changes | ☐ |
| 11 | `npm run office-ai:validate-files:dry` | 4 validation checks pass | ☐ |
| 12 | `npm run office-ai:extraction:dry` | 5 file types listed | ☐ |

---

## Pass Criteria

| Criteria | Requirement |
|---|---|
| **MINIMUM** | Commands 1–6 pass |
| **DEMO READY** | Commands 1–10 pass (dry-runs OK) |
| **PILOT READY** | Commands 1–12 pass (dry-runs OK) |

---

## Full Validation Command

For a complete validation, run the following in sequence:

```bash
# 1. Schema
npx prisma validate

# 2. TypeScript
npx tsc --noEmit

# 3. Lint
npm run lint

# 4. Build
npm run build

# 5. Platform links
npm run platform:verify-org-links
npm run platform:verify-workspace-links
npm run platform:verify-audit-logs

# 6. Dual-write dry-runs
npm run platform:auditos-dual-write:dry
npm run platform:decisionos-dual-write:dry

# 7. Office AI dry-runs
npm run office-ai:service:dry
npm run office-ai:validate-files:dry
npm run office-ai:extraction:dry
```

---

## Apply Scripts (Development Only — NOT for Production)

These scripts create test database records. Use only in development/staging environments:

```bash
# Platform backfill (first time only)
npm run platform:backfill-orgs:apply
npm run platform:backfill-workspaces:apply

# Dual-write verification (creates test events)
npm run platform:auditos-dual-write:apply
npm run platform:decisionos-dual-write:apply

# Office AI verification (creates test tasks/files/outputs)
npm run office-ai:service:apply
npm run office-ai:validate-files:apply
npm run office-ai:extraction:apply
```

> **⚠ Warning:** Apply scripts create database records. Never run on production.
