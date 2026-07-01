# TABLETOP CODE VERIFICATION — Phase B: Source Code Audit

**Audit ID:** KF-TTX-CODE-2026-06-23  
**Auditor role:** Independent Governance Facilitator / Red Team  
**Date:** 2026-06-23  
**Method:** Direct file inspection, import tracing, execution path analysis  
**Files traced:** `src/lib/knowledge-foundation/*`, `src/actions/knowledge-foundation/actions.ts`, `src/middleware.ts`, `prisma/schema.prisma`

---

## Summary Verdict

| Requirement | Verdict | Confidence |
|-------------|---------|-----------|
| 1. Explicit candidate binding | **PASS** | HIGH |
| 2. Version-scoped release generation | **PASS** | HIGH |
| 3. Version-scoped diff engine | **PASS** | HIGH |
| 4. Provenance persistence | **PASS** | HIGH |
| 5. Integrity verification | **PASS** | HIGH |
| 6. Trust chain | **PASS** | HIGH |
| 7. Rollback integrity enforcement | **PASS** | HIGH |
| 8. RBAC enforcement | **PARTIAL** | MEDIUM |
| 9. Middleware enforcement | **PARTIAL** | HIGH |
| 10. Audit events | **PASS** | HIGH |

---

## 1. Explicit Candidate Binding — PASS

**Files:** `src/lib/knowledge-foundation/candidate-bridge.ts`, `prisma/schema.prisma`

**Verified implementation:**

- Junction table `KnowledgeFoundationVersionCandidate` exists in schema with `@@unique([candidateId])` — enforces one-version-per-candidate at DB level
- `bindCandidatesToVersion()` enforces:
  - `assertDraftVersion()` — binding blocked on non-DRAFT versions
  - `status === "PROMOTED"` check — only PROMOTED candidates may be bound
  - Cross-version conflict check — rejects candidates already bound to another version
  - Audit event emitted per binding: `knowledge.foundation.candidate.bound`
- `listEligiblePromotedCandidates()` correctly excludes already-bound candidates
- `markVersionBindingsReleased()` marks all bindings `includedInRelease: true` at release time

**Pre-Phase-28 gap (binding only on status=PROMOTED globally) is confirmed CLOSED.** The junction table approach enforces version-scoped, explicit binding.

---

## 2. Version-Scoped Release Generation — PASS

**File:** `src/lib/knowledge-foundation/release-generator.ts`

**Verified implementation:**

- `generateReleasePackage()` calls `loadVersionBoundCandidates(versionId)` — pulls only candidates from `KnowledgeFoundationVersionCandidate WHERE versionId = ?`
- Old global `status = "PROMOTED"` query pattern is confirmed NOT used
- `releaseVersion()` in `kf-service.ts` explicitly `throws Error("deprecated after Phase 28.2...")` — dead code is guarded
- `releaseFoundationVersion()` in actions similarly deprecated with throw
- Phase A (DB transaction) atomically: marks bindings released, updates version to RELEASED, creates release row with `artifactStatus: PENDING`
- Phase B (filesystem): writes 6 artifact files; on success → `COMPLETE`; on failure → `FAILED`
- SHA-256 computed from `foundationContent` (the canonical rule payload), stored as `manifestSha256`
- `candidateIds[]` included in release row for audit reconstruction

**Pre-Phase-28 gap (global PROMOTED snapshot) is confirmed CLOSED.**

**⚠️ Finding RG-01 (LOW):** The deprecated `releaseFoundationVersion` action and `releaseVersion` service function both still exist in source (they throw). They are dead code protected by throws, not deleted. This is low risk but creates maintenance confusion.

---

## 3. Version-Scoped Diff Engine — PASS

**File:** `src/lib/knowledge-foundation/diff-engine.ts`

**Verified implementation:**

- `generateDiff()` calls `loadVersionBoundCandidates(fromVersionId)` and `loadVersionBoundCandidates(toVersionId)` — both version-scoped
- Diff computes added/removed/modified by canonical code comparison between bound candidate sets
- Pre-Phase-28 temporal proxy (`updatedAt <= version.createdAt`) is confirmed NOT present
- Results persisted to `KnowledgeFoundationDiff` (upsert) with `fromVersionId`, `toVersionId`
- Audit event `knowledge.foundation.diff.generated` emitted
- Risk score and `breakingChange` flag computed

**Pre-Phase-28 gap (temporal diff proxy) is confirmed CLOSED.**

---

## 4. Provenance Persistence — PASS

**Files:** `src/lib/knowledge-foundation/provenance-manifest.ts`, `src/lib/knowledge-foundation/version-candidate-snapshot.ts`, `prisma/schema.prisma`

**Verified implementation:**

- `buildVersionProvenanceManifest()` builds per-candidate provenance including: `candidateId`, `canonicalCode`, `category`, `supportCount`, `organizationCount`, `confidence`, `promotionDate`, `boundAt`, `boundById`, `evidenceSummary` (counts + evidence types + contributing org count)
- No raw `clientAccountCode`, client names, or `TBMappingFeedback` data included — only canonical fields and aggregate counts
- `provenanceSnapshot` stored in `KnowledgeFoundationRelease` DB row (JSON)
- `provenance-manifest.json` written to filesystem as verification evidence
- Provenance integrity checked in `verifyReleaseIntegrity()` — FS file vs DB `provenanceSnapshot` compared with `JSON.stringify` equivalence

**ADR-028 provenance requirements verified satisfied.**

---

## 5. Integrity Verification — PASS

**File:** `src/lib/knowledge-foundation/release-integrity.ts`

**Verified implementation — full verification chain:**

1. **DB source of truth check:** `KnowledgeFoundationRelease` with `artifactStatus = COMPLETE`, `manifestSha256` non-null, `provenanceSnapshot` non-null
2. **Filesystem artifact check:** `knowledge-foundation.json`, `manifest.json`, `provenance-manifest.json` all verified present
3. **Hash match:** SHA-256 of `knowledge-foundation.json` computed at verification time and compared against DB `manifestSha256`
4. **Provenance match:** FS `provenance-manifest.json` parsed and compared against DB `provenanceSnapshot` via `jsonEquivalent()`
5. **Trust chain check:** `previousReleaseHash` cross-checked against parent release's `manifestSha256`
6. **Audit events:** `integrity.verified` or `integrity.failed` always emitted (unless `emitAudit: false`)
7. **`forActivation` flag:** When set, allows `RELEASED` or `ACTIVE` status (needed for rollback integrity check)

**`buildResult()` returns `valid: true` only when ALL conditions pass:** `blockers.length === 0 && releaseRowValid && artifactFound && manifestFound && provenanceFound && hashMatch && chainValid`

**This is a robust integrity gate.**

---

## 6. Trust Chain — PASS

**File:** `src/lib/knowledge-foundation/trust-chain.ts`

**Verified implementation:**

- `resolveChainParentRelease()` determines parent at release write time:
  1. If `rollbackVersionId` set → parent = that version's COMPLETE release
  2. Else → parent = currently ACTIVE version's COMPLETE release
  3. Bootstrap (no ACTIVE) → `null`
- Parent `manifestSha256` and `id` stored on new release row (`previousReleaseHash`, `previousReleaseId`)
- `verifyReleaseIntegrity()` validates chain: parent release must exist, be COMPLETE, and its hash must match stored `previousReleaseHash`
- Trust chain breaks detected and reported as blockers

**Trust chain is implemented correctly and verified at each integrity check.**

---

## 7. Rollback Integrity Enforcement — PASS

**File:** `src/lib/knowledge-foundation/rollback-service.ts`

**Verified implementation:**

- `executeRollback()` enforces `actor.role !== "ADMIN"` → throws ("Access denied: ADMIN role required for rollback")
- `input.reason` empty → throws ("Rollback reason is required")
- `assertRollbackTargetStatus()` enforces target must be `RELEASED` or `ACTIVE` — `DEPRECATED`, `APPROVED`, `DRAFT` are rejected with explicit error
- `verifyReleaseIntegrity(targetVersionId, { forActivation: true })` called BEFORE any DB mutations — rollback blocked if integrity fails
- Post-integrity-pass: current ACTIVE deprecated, target set to ACTIVE with `rollbackVersionId` set
- Audit events emitted: `version.deprecated` (former ACTIVE), `rollback.executed` (includes `reason`, `fromVersionId`, `integrityVerified: true`)

**Phase 28.4 invariant confirmed: "No path reaches ACTIVE without verifyReleaseIntegrity()" — rollback path included.**

**`ROLLBACK_ALLOWED_TARGET_STATUSES = ["RELEASED", "ACTIVE"]` is a named constant (Phase 28 final hotfix R-02).**

---

## 8. RBAC Enforcement — PARTIAL

**Files:** `src/actions/knowledge-foundation/actions.ts`, `src/lib/knowledge-foundation/kf-service.ts`, `src/lib/knowledge-foundation/rollback-service.ts`, `src/lib/knowledge-foundation/release-generator.ts`

**PASS elements:**

| Action | Enforced at | Verdict |
|--------|------------|---------|
| `bindCandidatesToVersion` | `assertOperator()` in actions.ts + `assertDraftVersion()` in service | ✅ PASS |
| `generateReleasePackage` | Inline `getCurrentUser() + role check` in release-generator.ts | ✅ PASS |
| `approveVersion` | `assertAdmin()` in kf-service.ts | ✅ PASS |
| `activateVersion` | `assertAdmin()` in kf-service.ts | ✅ PASS |
| `executeRollback` | Inline `actor.role !== "ADMIN"` in rollback-service.ts | ✅ PASS |
| `createVersion` | `assertOperator()` in kf-service.ts | ✅ PASS |
| `approveFoundationVersion` action | Calls `kf-service.approveVersion()` → `assertAdmin()` | ✅ PASS |
| `rollbackFoundationVersion` action | Calls `executeRollback()` → ADMIN check | ✅ PASS |
| `activateFoundationVersion` action | Calls `activateVersion()` → assertAdmin() | ✅ PASS |

**⚠️ PARTIAL — Finding RBAC-01 (MEDIUM):**

`/knowledge-review` route is **NOT** in `src/middleware.ts` matcher. This means:

- The middleware does NOT apply session and RBAC checks to `/knowledge-review` at the edge
- The page-level server component (`knowledge-review/page.tsx`) **does** call `getCurrentUser()` and enforces `role === ADMIN || OPERATOR`, with redirect to `/access-denied`
- The `(dashboard)` layout also calls `getCurrentUser()` with redirect to `/login`

**Assessment:** The `/knowledge-review` route is functionally protected (two layers: layout + page) but lacks middleware-level protection. This creates a defense-in-depth gap — if a request bypasses layout rendering (e.g., direct API call pattern), the edge check is missing. For the purposes of the tabletop, this is an operational risk but not a blocking issue for exercise readiness.

---

## 9. Middleware Enforcement — PARTIAL

**File:** `src/middleware.ts`

**Verified in matcher:**
- `/knowledge-foundation` ✅
- `/knowledge-foundation/:path*` ✅
- `/api/knowledge-mining` ✅
- `/api/knowledge-mining/:path*` ✅

**Route-to-role mapping (line 113):** `/knowledge-foundation: "viewer"` — confirms VIEWER minimum for KF dashboard access.

**⚠️ Finding MIDDLEWARE-01 (MEDIUM — same as RBAC-01):**

`/knowledge-review` and `/knowledge-review/:path*` are **absent from middleware matcher**. The mining promotion workflow depends on this route. It is operationally protected at the application layer (layout + page RBAC) but not at the middleware/edge layer.

**All other KF-related routes verified covered.**

---

## 10. Audit Events — PASS

**Files:** `src/lib/knowledge-foundation/audit-handler.ts`, `src/lib/knowledge-foundation/events.ts`

**Verified implementation:**

- `registerFoundationAuditHandler()` is idempotent (guarded by `let registered = false`)
- Called at import time in both `kf-service.ts` and `rollback-service.ts`
- All 13 event types handled: created, approved, released, activated, deprecated, rollback.executed, diff.generated, candidate.bound, candidate.unbound, readiness.generated, report.generated, integrity.verified, integrity.failed
- Each event writes to `PlatformAuditLog` with `productKey: "knowledge-foundation"`, action, severity, status, actorId, targetType/Id, targetLabel, and full metadata
- Severity mapping: `deprecated`, `rollback.executed`, `candidate.unbound`, `integrity.failed` → "warning"; lifecycle events → "info"
- Status mapping: `integrity.failed` → "failure"; others → "success" or "recorded"

**Complete audit trail coverage confirmed for all lifecycle events.**

---

## 11. Additional Findings (Red Team)

| ID | Severity | Finding | Location |
|----|----------|---------|---------|
| RG-01 | LOW | Dead deprecated functions (`releaseVersion`, `releaseFoundationVersion`) still exist — they throw but are not deleted. Risk: future dev accidentally calls wrong path | kf-service.ts:115, actions.ts:207 |
| RBAC-01 | MEDIUM | `/knowledge-review` absent from middleware matcher | src/middleware.ts |
| MIDDLEWARE-01 | MEDIUM | Same as RBAC-01 — edge-level protection missing for mining promotion route | src/middleware.ts |
| SCHEMA-01 | INFO | `@@unique([candidateId])` on `KnowledgeFoundationVersionCandidate` enforces 1-candidate-per-version globally at DB level — this is correct and intentional (ADR-028 D1) | prisma/schema.prisma |
| INTEGRITY-01 | INFO | `forActivation: true` flag allows `ACTIVE` status through integrity gate — correctly needed for rollback scenario where target may be `ACTIVE` | release-integrity.ts |
| CHAIN-01 | INFO | Bootstrap releases (no prior ACTIVE) correctly produce `previousReleaseId: null` — trust chain handles this case | trust-chain.ts |

---

## 12. Hidden Bypass Search

| Bypass Type | Search Result |
|-------------|--------------|
| Direct DB status mutation to ACTIVE bypassing service | Not found in any route handler or action |
| `generateReleasePackage` callable without OPERATOR check | No — inline role check present |
| Activation without integrity check | Not found — `verifyReleaseIntegrity()` in `activateVersion()` before any mutation |
| Rollback without reason | Not found — empty reason throws immediately |
| Deprecated release path still callable without throw | Not found — both deprecated functions throw unconditionally |
| Shadow API routes for KF mutations | Not found — all mutations go through server actions in `actions/knowledge-foundation/actions.ts` |

---

## 13. Phase B Overall Verdict

**PASS with 2 MEDIUM findings (RBAC-01, MIDDLEWARE-01)**

The Knowledge Foundation implementation is functionally sound. All critical governance invariants are implemented in code and verified:

- Explicit binding enforced at DB and service layer
- Release uses only version-bound candidates
- Integrity gate cannot be bypassed for activation or rollback
- ADMIN-only rollback enforced
- Trust chain tracked and verified
- Audit events cover all lifecycle transitions

The `/knowledge-review` middleware gap is a defense-in-depth concern but does not prevent the tabletop exercise. The deprecated release function stubs should be cleaned up.

---

## 14. Document Control

| Auditor | Date | Verdict |
|---------|------|---------|
| Independent Governance Facilitator | 2026-06-23 | PHASE B COMPLETE — PASS WITH MEDIUM FINDINGS |
