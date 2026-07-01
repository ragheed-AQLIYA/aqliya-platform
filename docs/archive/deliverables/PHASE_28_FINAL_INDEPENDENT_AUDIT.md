# PHASE 28 — Independent Final Red Team Audit

**Date:** 2026-06-21  
**Method:** Source-code review only — no trust in implementation reports or test pass counts  
**Scope:** Knowledge Foundation full lifecycle (28.1–28.4)  
**Auditor role:** Break attempt / bypass hunt  

---

## Verdict

```text
PHASE_28_FINAL_ACCEPTED (after hotfix 2026-06-21)
```

See `PHASE_28_FINAL_HOTFIX_REPORT.md` for R-01–R-04 closure.

**Original audit (pre-hotfix):** `PHASE_28_FINAL_BLOCKED`

---

## Post-fix status

| Finding | Status |
|---------|--------|
| R-01 Rollback integrity bypass | ✅ Fixed |
| R-02 Rollback target validation | ✅ Fixed |
| R-03 Release authorization gap | ✅ Fixed |
| R-04 Middleware coverage | ✅ Fixed |
| R-05–R-08 | Deferred → Phase 29 operational track |

---

## Trace Summary (code-verified)

| Path | Expected gate | Code reality |
|------|---------------|--------------|
| bind | DRAFT only | ✅ `assertDraftVersion` |
| approve | ADMIN, DRAFT→APPROVED | ⚠️ Also allows APPROVED→APPROVED (logic bug) |
| release | OPERATOR, APPROVED | ❌ **No role check in action/service** |
| verify | DB truth + FS evidence | ✅ `release-integrity.ts` |
| activate | ADMIN + integrity | ✅ `activateVersion` → `verifyReleaseIntegrity` |
| rollback | ADMIN + reason | ❌ **No integrity, no target status validation** |

---

## P0 — Blockers (must fix before PHASE_28_FINAL_ACCEPTED)

### R-01: Rollback bypasses integrity gate (28.4 nullified)

**File:** `src/lib/knowledge-foundation/rollback-service.ts`

`executeRollback()` sets `targetVersion.status = "ACTIVE"` with **no call** to `verifyReleaseIntegrity()`.

An ADMIN can promote any rollback target to ACTIVE without hash verification, FS evidence, or trust-chain checks — the exact control 28.4 added to `activateVersion`.

```67:75:src/lib/knowledge-foundation/rollback-service.ts
  const updated = await prisma.knowledgeFoundationVersion.update({
    where: { id: targetVersion.id },
    data: {
      status: "ACTIVE",
      activatedAt: new Date(),
      rollbackVersionId: currentVersion?.id ?? null,
    },
  });
```

**Break scenario:** Compromised FS or tampered artifact → forward activate blocked → rollback to older DEPRECATED/RELEASED version → ACTIVE without verification.

---

### R-02: Rollback allows ACTIVE without RELEASED pipeline

**File:** `src/lib/knowledge-foundation/rollback-service.ts`

No validation on `targetVersion.status`. UI filters DRAFT only; **APPROVED** (never released) is a valid rollback target in service layer.

**Break scenario:** Rollback target = APPROVED version → becomes ACTIVE institutional knowledge **without release, manifestSha256, or provenanceSnapshot**.

---

## P1 — High (fix before pilot; block if strict ADR-028 closure)

### R-03: `generateFoundationRelease` missing OPERATOR gate

**File:** `src/actions/knowledge-foundation/actions.ts`

```213:224:src/actions/knowledge-foundation/actions.ts
export async function generateFoundationRelease(input: {
  ...
}) {
  const user = await getCurrentUser();
  return generateReleasePackage({
```

Only `getCurrentUser()` — **no `assertOperator`**. `generateReleasePackage()` has no auth check.

**Break scenario:** Authenticated VIEWER invokes server action directly → APPROVED version → RELEASED (bypasses OPERATOR role separation in ADR-028 D4).

UI hides button (`isOperator`), but server actions are not UI-bound.

---

### R-04: `/knowledge-foundation` absent from middleware RBAC matcher

**File:** `src/middleware.ts`

- Not in `routeMinRoles`
- Not in `config.matcher`

Pages rely on `(dashboard)/layout.tsx` auth only. Edge RBAC first gate does not apply. Defense-in-depth gap vs other workspaces.

---

## P2 — Medium (operational / recovery; document in Phase 29 if deferred)

### R-05: Silent trust-chain fork

**File:** `src/lib/knowledge-foundation/trust-chain.ts`

If ACTIVE version has no COMPLETE release, `resolveChainParentRelease()` returns `null`. Release proceeds with `previousReleaseId = null` — verification passes (bootstrap) while semantically breaking chain continuity.

---

### R-06: RELEASED + artifactStatus FAILED orphan

**File:** `src/lib/knowledge-foundation/release-generator.ts`

Phase A sets version `RELEASED`; Phase B FS failure → `artifactStatus: FAILED`. No automated recovery to APPROVED. Operator must manual intervention (undocumented in code).

---

### R-07: activate / rollback not transactional

**Files:** `kf-service.ts`, `rollback-service.ts`

`updateMany(DEPRECATED)` + `update(ACTIVE)` are separate calls. Concurrent activate/rollback could briefly yield dual ACTIVE (low probability, real race).

---

### R-08: `executeRollback` ignores `input.versionId`

Rollback action passes current version id; service never validates it against ACTIVE. Wrong target selection is unconstrained at service layer.

---

## P3 — Low

| ID | Finding |
|----|---------|
| R-09 | `approveVersion` accepts `APPROVED` status re-approval (`!== DRAFT && !== APPROVED` allows APPROVED) |
| R-10 | Provenance FS compare uses `JSON.stringify` equality — key-order sensitive (fragile, not currently exploited) |

---

## What held up (positive findings)

| Control | Status |
|---------|--------|
| Shadow release paths deprecated | ✅ `releaseVersion` / `releaseFoundationVersion` throw |
| Version-scoped release content | ✅ `loadVersionBoundCandidates` only |
| Bind/unbind DRAFT-only | ✅ |
| Delete candidate when bound | ✅ R5 guard intact |
| Forward activate integrity | ✅ DB truth + FS evidence + chain pointer |
| Integrity audit events | ✅ `integrity.verified` / `integrity.failed` on verify |
| No auto-release / auto-bind in readiness | ✅ 28.3 display-only confirmed |
| Junction `@@unique([candidateId])` | ✅ one binding per candidate |

---

## ADR-028 Compliance Checklist (independent)

| Item | Pass? |
|------|-------|
| Candidate–version binding enforced | ✅ |
| Release packages include provenance | ✅ |
| Canonical-only published rules | ✅ |
| No autonomous PROMOTED→ACTIVE | ❌ **Rollback path** |
| Diff/rollback use version-bound data | ✅ diff; ⚠️ rollback skips integrity |
| Tests prove bind→release→activate | ⚠️ Tests mock integrity on activate; rollback untested for gate |
| Hash verification on activate | ✅ forward path only |

---

## Required fixes for PHASE_28_FINAL_ACCEPTED

Minimum patch set (estimated human: ~0.5d):

1. **Rollback integrity gate** — `executeRollback` must call `verifyReleaseIntegrity(targetVersionId)` when target was RELEASED, or require target was previously ACTIVE with valid COMPLETE release row + optional FS re-verify policy for rollback SOP.
2. **Rollback target policy** — Reject targets not in `{ RELEASED, ACTIVE, DEPRECATED }` with at least one COMPLETE release row (never APPROVED).
3. **`assertOperator` on `generateFoundationRelease`** (+ optional check inside `generateReleasePackage`).
4. **Middleware** — Add `/knowledge-foundation` to matcher + `routeMinRoles` (operator minimum for mutations enforced server-side anyway).

Recommended before pilot (Phase 29 overlap):

5. Rollback SOP documenting integrity re-check rules  
6. RELEASED+FAILED recovery runbook  
7. Integration test: rollback blocked when integrity fails  

---

## Post-fix state

After R-01–R-04 resolved and re-audited:

```text
PHASE_28_FINAL_ACCEPTED  →  Phase 29 Enterprise Readiness Track
```

Until then, treat Knowledge Foundation as **L5 conditional — integrity gate incomplete**.

---

**Audit completion:** Independent source review performed. Tests and deliverables were not used as evidence.
