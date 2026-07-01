# Phase 28.2 — Version-Scoped Release & Diff Implementation Report

**Date:** 2026-06-21  
**Status:** READY_FOR_REVIEW  
**ADR:** ADR-028 (Accepted, MODEL_B)  
**Depends on:** Phase 28.1 (verified)

---

## Summary

Phase 28.2 replaces global `PROMOTED` snapshots with **version-scoped candidate sets** sourced from `KnowledgeFoundationVersionCandidate`. Release artifacts, provenance persistence, and diffs now reflect explicit bindings only.

| Objective | Result |
|-----------|--------|
| Release generator uses version bindings | ✅ |
| Diff engine uses version bindings | ✅ |
| `includedInRelease` + `releasedAt` activated | ✅ |
| Provenance persisted on release | ✅ |
| Global PROMOTED removed from release/diff paths | ✅ |
| `createdAt` proxy removed from diff path | ✅ |
| activate hash verification (28.4) | ⏸ Not in scope |

---

## Architecture Changes

### Before (Phase 28.1 gap)

```
release-generator → prisma.knowledgeCandidate.findMany({ status: PROMOTED })
diff-engine       → getPromotedCandidatesBefore(version.createdAt)
```

### After (Phase 28.2)

```
release-generator → loadVersionBoundCandidates(versionId)
                 → buildVersionProvenanceManifest(versionId)
                 → markVersionBindingsReleased(versionId)

diff-engine       → loadVersionBoundCandidates(fromVersionId)
                 vs loadVersionBoundCandidates(toVersionId)
```

### Execution Trace

```
PROMOTED candidate (mining)
        ↓ bind (28.1)
KnowledgeFoundationVersionCandidate
        ↓ approve version
        ↓ generateReleasePackage (28.2)
   • artifacts from bindings only
   • manifest + provenance-manifest.json
   • includedInRelease=true, releasedAt=now
   • KnowledgeFoundationRelease.provenanceSnapshot
        ↓ generateDiff (28.2)
   • compare bound sets A vs B
        ↓ activate (unchanged — hash gate in 28.4)
```

---

## Schema Changes

### `KnowledgeFoundationVersionCandidate`

| Field | Change |
|-------|--------|
| `releasedAt` | Added `DateTime?` — set when included in a release |

### `KnowledgeFoundationRelease`

| Field | Change |
|-------|--------|
| `manifestPath` | Added `String?` — relative path to release manifest |
| `manifestSha256` | Added `String?` — SHA-256 of `knowledge-foundation.json` |
| `provenanceSnapshot` | Added `Json?` — frozen provenance at release time |

### Migration

**`20270622120000_knowledge_foundation_release_provenance`**

- Additive only — `ALTER TABLE ... ADD COLUMN`
- No `DROP` / `RENAME`
- No data loss

---

## Files Changed

| File | Change |
|------|--------|
| `prisma/schema.prisma` | `releasedAt`, release provenance fields |
| `prisma/migrations/20270622120000_knowledge_foundation_release_provenance/migration.sql` | Additive migration |
| `src/lib/knowledge-foundation/version-candidate-snapshot.ts` | **New** — `loadVersionBoundCandidates()` |
| `src/lib/knowledge-foundation/release-generator.ts` | Version-scoped release + manifest + provenance |
| `src/lib/knowledge-foundation/diff-engine.ts` | Version-scoped diff; removed `getPromotedCandidatesBefore` |
| `src/lib/knowledge-foundation/candidate-bridge.ts` | `markVersionBindingsReleased()`, export `syncVersionCandidateCount` |
| `src/lib/knowledge-foundation/types.ts` | Updated `ReleasePackage` manifest shape |
| `src/__tests__/unit/knowledge-foundation/phase-28-2-version-scoped.test.ts` | **New** — release + diff scoped tests |
| `src/__tests__/unit/knowledge-foundation/knowledge-diff-engine.test.ts` | Rewritten for binding-based diff |
| `src/__tests__/migration-evidence.test.ts` | Latest migration → 28.2 |
| `src/__mocks__/prisma-mock.js` | `updateMany` on junction delegate |

**Not modified (per scope):** `activateVersion`, `rollback-service`, tenant policy, mining workflow, approval workflow.

---

## Release Manifest Shape

```json
{
  "versionId": "kfv-...",
  "versionNumber": "1.0.0",
  "candidateIds": ["kc-bound-1", "kc-bound-2"],
  "candidateCount": 2,
  "sha256": "<hex>",
  "generatedAt": "2026-06-21T...",
  "provenance": { "...VersionProvenanceManifest" },
  "artifactPath": "<abs path>"
}
```

Artifacts written per release:

- `manifest.json`
- `provenance-manifest.json`
- `candidate-list.json`
- `knowledge-foundation.json`
- `change-summary.json`
- `release-notes.md`

---

## Governance Verification

| Check | Status |
|-------|--------|
| RBAC | Unchanged — release via OPERATOR, existing action gates |
| Tenant isolation | MODEL_B — platform-wide versions preserved |
| Evidence | Provenance canonical only — no raw TB/client data in artifacts |
| Audit trail | `knowledge.foundation.version.released` + diff events unchanged |
| Human approval | Required before release (`APPROVED` status gate) |
| Autonomous release | Not introduced |
| R5 delete protection | Preserved — bound candidates cannot be deleted |

---

## Test Results

| Suite | Result |
|-------|--------|
| `phase-28-2-version-scoped.test.ts` | 7/7 Pass |
| `knowledge-diff-engine.test.ts` | 6/6 Pass |
| All `knowledge-foundation/*` + R5 + migration-evidence | **120/120 Pass** |
| `npx tsc --noEmit` | Pass |
| `npm run build` | Pass |

### Test Coverage (Phase 28.2 requirements)

| # | Requirement | Test |
|---|-------------|------|
| 1 | Bound-only release after approve path | `releases only bound candidates` |
| 2 | `includedInRelease` set on release | `sets includedInRelease on bindings` |
| 3 | Diff uses version bindings | `compares version bindings` |
| 4 | added/removed/modified overlap | `detects added, removed, and modified` |
| 5 | Manifest fields | `manifest contains versionId...sha256` |
| 6 | Global PROMOTED excluded | `not global PROMOTED pool` |

---

## Validation

| Command | Result |
|---------|--------|
| `npx prisma generate` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm test -- knowledge-foundation knowledge-mining/delete-candidate-binding migration-evidence` | 120/120 Pass |
| `npm run build` | Pass |
| `npm run lint` | Not run |
| Full `npm test` suite | Not run |

---

## Known Limitations

1. **Hash verification at activate** — deferred to Phase 28.4 per ADR-028.
2. **`kf-service.releaseVersion()`** — lightweight status transition only; full artifact generation is via `generateFoundationRelease` → `generateReleasePackage`. UI must call the correct action for artifact-backed releases.
3. **Empty binding release** — allowed (0 candidates); operators should bind before release in production workflows.
4. **Diff identity key** — comparison uses `canonicalCode`; two candidates with same code on one version would collapse (pre-existing design).
5. **E2E browser test** — unit/integration mocks only; no Playwright/Cypress E2E in this pass.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Legacy releases used global PROMOTED | New releases are version-scoped; old artifacts remain historical |
| `releaseVersion` vs `generateReleasePackage` split | Documented; recommend UI always uses `generateFoundationRelease` |
| Manifest schema change (`hash` → `sha256`) | `hash` retained as deprecated alias in manifest |

---

## Final Status Table

| Area | Status |
|------|--------|
| Release Generator | ✅ Version-scoped bindings only |
| Diff Engine | ✅ Version binding comparison |
| Provenance Persistence | ✅ DB + artifact files |
| IncludedInRelease | ✅ `includedInRelease` + `releasedAt` on release |
| Tests | ✅ 120 passing (KF + R5 + migration) |

---

## Final Verdict

```text
PHASE_28_2_ACCEPTED
READY_FOR_PHASE_28_3
```

Phase 28.2 exit criteria met. Phase 28.2 hardening (R3 + shadow path) completed 2026-06-21.

### Hardening addendum (post Red Team)

| Item | Implementation |
|------|----------------|
| R3 atomicity | Phase A: `prisma.$transaction` (bindings + version RELEASED + release row `PENDING`); Phase B: FS writes → `artifactStatus: COMPLETE` + audit |
| FS failure | `artifactStatus: FAILED`; no audit event emitted |
| Shadow path | `releaseVersion` / `releaseFoundationVersion` throw deprecated error |
| Schema | `KnowledgeFoundationReleaseArtifactStatus` enum + `artifactStatus` column |
| Migration | `20270622130000_knowledge_foundation_release_artifact_status` |

Ready for Phase 28.4 (activate hash verification) when scheduled.

---

## Next Recommended Step

**Phase 28.4:** Implement `activateVersion` hash verification against `KnowledgeFoundationRelease.manifestSha256` per ADR-028 exit gate.
