# AQLIYA Release Report — `v0.1.0-rc`

> **Status:** Evidence report (release readiness). Authority: `docs/source-of-truth/RELEASE_AND_VALIDATION_SYSTEM.md`.
> **Trust principle:** AI assists. Humans decide. Evidence governs.

---

## 1. Release Identity

| Field | Value |
| --- | --- |
| Release type | Platform |
| Platform version | `v0.1.0-rc` |
| Product(s) + level | AuditOS L5, LocalContentOS L6, DecisionOS L5, SalesOS L5, WorkflowOS L5, Office AI L5 |
| Docs versions touched | `docs/official/AQLIYA_MASTER_REFERENCE.md` (v0.2), `docs/source-of-truth/*`, release docs |
| Branch | (not captured) |
| Committed HEAD | `d29f684` |
| Git tag | Not created |
| Date | 2026-05-31 |
| Release owner (human) | (not set) |

---

## 2. Baseline Integrity (P0 firewall — MUST pass first)

| Check | Result |
| --- | --- |
| Working tree committed **before** validation? | **No** |
| `git status --short` clean at validated HEAD? | **Dirty (No-Go)** |
| Validated HEAD == tagged HEAD == released HEAD? | No |
| Attestation: no validation evidence imported from a different tree | Confirmed |

> **No-Go reason:** validation ran on a dirty tree. Commit-or-stash, re-validate, then tag.

---

## 3. Validation Tier Result (`RELEASE_AND_VALIDATION_SYSTEM.md §1`)

| Tier | Commands actually run | Result |
| --- | --- | --- |
| T1 Local Light | `npx tsc --noEmit` · `npm run lint -- --quiet` · `npx prisma validate` | Pass |
| T2 Targeted | Targeted Jest files during fixes | Pass |
| T3 Medium | `npm test -- --no-coverage` | Pass (110 suites, 896 tests) |
| T4 Build-Safe | `npm run build` | Pass |
| T5 Release Candidate | `npm run audit:health` | Pass (AuditOS health) |
| T6 Production Candidate | Not run | Not assertable |

**Highest tier achieved:** T5 evidence exists, but **invalid for release** until rerun on a committed tree.

---

## 4. What Changed

| Area | Summary |
| --- | --- |
| Routes | Auth perimeter migrated to Next.js 16 `proxy` convention (`src/proxy.ts`) |
| Schema (Prisma) | No schema changes in this pass |
| Features | Sentry instrumentation-client aligned; Jest stability fix for `.next/standalone` |
| Fixes | Reduced test-console noise in two suites; docs references updated to `src/proxy.ts` |
| Docs | Release checklist + route/security docs updated to match runtime reality |

---

## 5. Security & Governance Verification

| Item | Result |
| --- | --- |
| Auth/proxy coverage | Verified (`src/proxy.ts`) |
| Tenant isolation | Verified (no changes; tests pass) |
| Audit trail (dual-write) | Verified (no changes; tests pass) |
| RBAC enforced server-side | Verified (no changes) |
| Download Security Standard | Verified (no changes; build + tests pass) |
| Demo safety (`/auditos/*` mock-only) | Not re-verified in this pass |
| Exports carry status/disclaimer | Not re-verified in this pass |
| AI output governed | Verified (no changes; existing governance tests pass) |

---

## 6. Acceptance-Gate Results (`RELEASE_AND_VALIDATION_SYSTEM.md §5`)

| Gate | Result | Notes / evidence |
| --- | --- | --- |
| 5.1 Platform Core (FROZEN, no new primitives) | Pass | No new Core primitives in this pass |
| 5.2 Per-product (readiness checklist attached) | Pass | See `docs/releases/release-checklist.md` |
| 5.3 Docs (matrix/route/readiness current; version-link invariant) | Pass | Proxy rename synced across docs/skills/templates |
| 5.4 Commercial claims | Pass | No new claims; Sentry/On-Prem remain documented as strategic |

---

## 7. Rollback Readiness (`RELEASE_AND_VALIDATION_SYSTEM.md §4`)

- [ ] `db:backup` taken + stored off-host
- [ ] `backup:verify` passed
- [ ] Uploads/evidence volume archived
- [ ] Prior git tag + prior build/image retained
- [ ] `db:restore` rehearsed into disposable DB
- [ ] Rollback triggers + procedure reviewed with operator

---

## 8. Known Issues

| ID | Issue | Severity | New / Pre-existing | Blocking? |
| --- | --- | --- | --- | --- |
| R-0 | Dirty working tree prevents tagging a release candidate | High | New | **Yes** |

---

## 9. Release Decision

| | |
| --- | --- |
| Decision | [ ] Go  [x] **No-Go** |
| Approver (human) | (pending) |
| Blockers (if No-Go) | Commit changes, rerun validation on clean tree, then tag |
| Post-release: matrix update handed to Agent 6? | N/A |
| Post-release monitoring owner | (pending) |
