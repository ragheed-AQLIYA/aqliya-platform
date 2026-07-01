# PHASE 28.4 — Integrity & Trust Chain

**Date:** 2026-06-21  
**Status:** COMPLETE  
**Prior phases frozen:** 28.1–28.3 — not reopened  

---

## Summary

Phase 28.4 closes the ACTIVE version trust gap by enforcing cryptographic and chain verification before activation. Database rows are the source of truth; filesystem artifacts are verification evidence only.

| Deliverable | Status |
|-------------|--------|
| `verifyReleaseIntegrity()` — DB-first + FS evidence | ✅ |
| Activation integrity gate in `activateVersion()` | ✅ |
| Explicit trust chain (`previousReleaseId` / `previousReleaseHash`) | ✅ |
| `verifyFoundationRelease()` operator API | ✅ |
| Integrity Status UI on version detail | ✅ |
| Audit events `integrity.verified` / `integrity.failed` | ✅ |
| Acceptance tests (all 5 failure modes + success) | ✅ |

---

## Design Decisions (Director Refinements)

### 1. DB as source of truth

| Canonical (DB) | Verification evidence (FS) |
|----------------|---------------------------|
| `manifestSha256` | `knowledge-foundation.json` → recomputed SHA256 |
| `provenanceSnapshot` | `provenance-manifest.json` → must match DB |
| `artifactStatus === COMPLETE` | `manifest.json` existence |

If FS evidence is missing or mismatched → activation blocked, even when DB row exists.

### 2. Explicit trust chain (not “latest release”)

Stored on each `KnowledgeFoundationRelease`:

- `previousReleaseId` — FK to parent release in chain
- `previousReleaseHash` — copy of parent's `manifestSha256` at write time

Resolution at release write (`resolveChainParentRelease`):

1. If `version.rollbackVersionId` → parent = COMPLETE release of that version
2. Else → parent = COMPLETE release of currently ACTIVE version (if not self)
3. Bootstrap → null

Verification follows the stored pointer — never “latest release globally”.

---

## Acceptance Criteria — Verified

| Scenario | Result |
|----------|--------|
| RELEASED + COMPLETE + hash match | → ACTIVE allowed |
| Hash mismatch | → activation blocked + `integrity.failed` |
| Artifact missing | → activation blocked + `integrity.failed` |
| Manifest missing | → activation blocked + `integrity.failed` |
| Broken chain | → activation blocked + `integrity.failed` |
| All checks pass | → `integrity.verified` + ACTIVE |

---

## Files Changed

### Schema / migration

- `prisma/schema.prisma` — `previousReleaseId`, `previousReleaseHash`, self-relation
- `prisma/migrations/20270622140000_knowledge_foundation_release_trust_chain/`

### Core

| File | Role |
|------|------|
| `release-integrity.ts` | `verifyReleaseIntegrity`, `verifyFoundationRelease` |
| `trust-chain.ts` | `resolveChainParentRelease` at write time |
| `release-generator.ts` | Persist chain fields + manifest evidence copy |
| `kf-service.ts` | `activateVersion` integrity gate |
| `events.ts` / `audit-handler.ts` | Integrity audit events |

### UI / actions

- `integrity-status-card.tsx`, `integrity-section.tsx`
- `actions.ts` — `verifyFoundationReleaseAction`
- `knowledge-foundation/[id]/page.tsx` — integrity display for RELEASED

### Tests

- `phase-28-4-integrity.test.ts`
- `phase-28-4-activate-gate.test.ts`
- `phase-28-4-trust-chain.test.ts`
- Updated legacy activate/release tests with integrity mocks
- `migration-evidence.test.ts` — trust chain migration

---

## Validation

| Command | Result |
|---------|--------|
| `npx prisma generate` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm test -- knowledge-foundation migration-evidence` | Pass (146/146) |
| `npm run build` | Pass |

---

## Governance Impact

- **No auto-release / auto-approval / auto-binding** — unchanged from 28.3
- **RELEASED → ACTIVE** now requires integrity verification (ADMIN only)
- Every verify/activate attempt emits `integrity.verified` or `integrity.failed` to PlatformAuditLog
- Readiness UX (28.3) remains display-only; integrity is a separate gate

---

## Completion Level

**Knowledge Foundation: L4+ → L5 Pilot Ready** (integrity gate + trust chain + E2E test coverage for governed path)

---

## Known Limitations

1. Chain parent resolution at write uses ACTIVE version or `rollbackVersionId` — complex rollback SOPs (e.g. v2.1 patch branches) need operational runbook (Phase 29).
2. FS evidence required for activation — partial backup restore without FS files blocks activate (by design).
3. No digital signatures yet — hash + explicit chain only (ADR-028 “Beyond Phase 28”).

---

## Next Recommended Step (Phase 29 / Enterprise Readiness)

Operational track (not ADR-028):

- Pilot Governance Runbook
- Release Approval SOP
- Rollback SOP
- Evidence Retention Policy

**Verdict:** `PHASE_28_4_COMPLETE` · `KF_L5_PILOT_READY`
