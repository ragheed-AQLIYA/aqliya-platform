# Knowledge Foundation Governance Verification

**Generated:** 2026-06-22  
**Method:** source inspection + `npm test --testPathPatterns=knowledge-foundation` + `npm run platform:bootstrap-tabletop`.

---

## Lifecycle Code Paths

| Step | Module | Auth gate |
|------|--------|-----------|
| PROMOTED | `promotion-service.ts` `promoteCandidates` / `batchPromoteCandidates` | `promotedBy` param; API routes use session |
| BIND | `candidate-bridge.ts` `bindCandidatesToVersion` | Requires DRAFT version; PROMOTED status |
| CREATE+BIND | `kf-service.ts` `createVersion` | `assertOperator()` |
| APPROVE | `kf-service.ts` `approveVersion` | `assertAdmin()` |
| RELEASE | `release-generator.ts` `generateReleasePackage` | `getCurrentUser()` OPERATOR/ADMIN |
| VERIFY | `release-integrity.ts` `verifyReleaseIntegrity` | `actorId` option; no bypass of checks |
| ACTIVATE | `kf-service.ts` `activateVersion` | `assertAdmin()` + **integrity gate** |
| ROLLBACK | `rollback-service.ts` `executeRollback` | ADMIN + reason + **integrity gate** |

### Activate gate (source)

`kf-service.ts` L128–145: `activateVersion` calls `verifyReleaseIntegrity(..., { forActivation: true })` and throws if `!integrity.valid`.

### Rollback gate (source)

`rollback-service.ts` L40–76: ADMIN only; `verifyReleaseIntegrity` with `forActivation: true` before setting ACTIVE.

### Trust chain (source)

`release-generator.ts` uses `resolveChainParentRelease`; migration `20270622140000_knowledge_foundation_release_trust_chain` adds `previousReleaseId` / `previousReleaseHash`.

`release-integrity.ts` validates chain when `previousReleaseId` set.

---

## Middleware RBAC

`src/middleware.ts`:

- `/knowledge-foundation` → minimum role `viewer` (L113)
- `/api/knowledge-mining` → minimum role `viewer` (L112)

Server actions add stricter checks (`assertOperator`, `assertAdmin` in `src/actions/knowledge-foundation/actions.ts`).

**Note:** Edge gate is VIEWER; sensitive mutations require ADMIN/OPERATOR in server layer — by design in code.

---

## Tests Executed

```
npm test -- --testPathPatterns=knowledge-foundation
→ 16 suites, 87 tests, ALL PASS
```

Relevant suites (file names in repo):

- `phase-28-4-activate-gate.test.ts`
- `phase-28-4-integrity.test.ts`
- `phase-28-4-trust-chain.test.ts`
- `knowledge-rollback.test.ts`
- `release-governance.test.ts`
- `candidate-bridge.test.ts`

---

## End-to-End Runtime (local)

```
npm run platform:bootstrap-tabletop
→ TABLETOP_READY = YES
→ v1.0.0 ACTIVE, integrity verified
```

Steps logged: promote → bind → approve → release → verify → activate.

Re-run idempotent: `[SKIP] lifecycle: v1.0.0 already ACTIVE with valid integrity`.

---

## Bypass Analysis

| Risk | Code finding |
|------|--------------|
| Activate without integrity | **Blocked** in `activateVersion` |
| Rollback without integrity | **Blocked** in `executeRollback` |
| Direct Prisma status update | No public API found; services enforce gates |
| Bootstrap script auth | Uses `bootstrap-auth-mock.cjs` for scripts only — not exposed in app routes |

**Production/staging KF lifecycle not executed remotely** — no staging URL.

---

## Verdict

**KF governance logic: VERIFIED in code + unit tests + local bootstrap cycle.**

Remote environment proof: **NOT DONE** (staging DNS dead).
