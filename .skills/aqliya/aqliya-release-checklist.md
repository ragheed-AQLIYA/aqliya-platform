---
name: aqliya-release-checklist
description: Pre-release checklist for AQLIYA. Route verification, security check, docs check, light validation commands, and final report format.
---

# AQLIYA Release Checklist

> **Purpose:** Ensure every release meets minimum quality, security, documentation, and governance standards before being tagged or deployed.

---

## 1. Pre-Release Checklist

### Route Verification

- [ ] All product routes accessible with auth
- [ ] `/auditos` demo route works without auth
- [ ] No 404s on main navigation paths
- [ ] All API routes return correct status codes
- [ ] Download routes require auth + permission
- [ ] No unprotected routes that should be protected

### Security Check

- [ ] Auth middleware covers all workspace routes
- [ ] Demo route uses mock data only
- [ ] No real secrets exposed in client bundle
- [ ] No tenant isolation bypasses
- [ ] RBAC enforced server-side (not just UI)
- [ ] Audit events logged for all mutations
- [ ] No path traversal vulnerabilities in download routes

### Data Integrity

- [ ] Seed data runs successfully
- [ ] No schema drift between Prisma and database
- [ ] Audit events reference valid organization and user IDs
- [ ] No orphaned records

### Docs Check

- [ ] `PRODUCT_STATUS_MATRIX.md` reflects current reality
- [ ] `ROUTE_STRATEGY.md` matches actual routes
- [ ] README does not claim unimplemented features
- [ ] No stale references to deleted files or routes
- [ ] `.skills/aqliya/*.md` is current

### Validation

- [ ] `npx tsc --noEmit` passes (or pre-existing errors documented)
- [ ] No new lint errors in changed files

---

## 2. Release Report Template

Every release must produce a report in this format:

```md
## Release Summary

- Release version:
- Date:
- Products affected:
- Completion levels:

## What Changed

- Route changes:
- Schema changes:
- Feature changes:
- Fixes:

## Security Verification

- Auth coverage: Verified / Not verified
- Demo safety: Verified / Not verified
- Tenant isolation: Verified / Not verified
- Audit trail: Verified / Not verified

## Docs Updated

- Files changed:

## Validation Results

| Command            | Result    |
| ------------------ | --------- |
| `npx tsc --noEmit` | Pass/Fail |
| Seed data          | Pass/Fail |

## Known Issues

- List any pre-existing or new known issues

## Release Decision

- [ ] Go
- [ ] No-Go (list blockers)
```

---

## 3. Go/No-Go Criteria

### Blocking (No-Go) Issues

- Auth middleware broken
- Demo route exposes real data
- Build fails
- Any workspace route inaccessible
- Upload/download routes without permission checks
- Tenant data leak possible
- Seed data broken
- Migration not run

### Non-Blocking (Go with Notes) Issues

- Pre-existing TypeScript errors (documented)
- Non-critical UI issues
- Missing empty states
- Minor docs gaps (not claiming unimplemented features)

---

## 4. Post-Release Steps

1. Update `PRODUCT_STATUS_MATRIX.md` with new levels
2. Update roadmap if release affects milestones
3. Tag release in git (if applicable): `git tag v0.1.x`
4. Archive release report in `docs/reports/`
5. Update `README.md` if public-facing changes occurred

---

## 5. Rollback Triggers

Rollback if any of these are discovered post-release:

- Auth bypass in production
- Demo route accessing real data
- Data corruption or leakage
- Migration causing downtime
- Critical route returning 500 for all users

---

## 6. Light Validation Commands (for pre-release check)

```bash
# Quick type check (fast, incremental)
npx tsc --noEmit

# Prisma check
npx prisma validate

# Check for uncommitted changes
git status

# Check for untracked files
git diff --stat

# Check recent commits
git log --oneline -5
```

Do not run full build or test suite without approval.
