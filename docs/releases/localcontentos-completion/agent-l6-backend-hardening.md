# Agent L6 — Backend Hardening (Worker 3)

**Date:** 2026-06-01  
**Program:** LocalContentOS L6 — Institutional Pilot-Ready  
**Scope:** Content Studio backend (`src/lib/local-content/content/*`, `src/actions/local-content-workspace-actions.ts`)  
**Production claim:** **NO**  
**Validation:** `npm test -- content-studio.test.ts` (light); no migrate, no full build

---

## Summary

Backend hardening for Content Studio L6 institutional pilot readiness: repository backend resolution with safe fallbacks, workflow transition guards, tenant org isolation, governed AI wrappers, review/approval audit metadata, evidence coverage, export chain enforcement, and RBAC + platform audit on all workspace mutations.

---

## Changes by area

### 1. Repository instance (`repository-instance.ts`)

- `resolveContentRepositoryBackend()` / `describeContentRepositoryBackend()` — explicit resolution with reason string.
- Priority: `LOCALCONTENT_CONTENT_BACKEND` env → test override → `DATABASE_URL` → file fallback.
- **Prisma without `DATABASE_URL` falls back to file** (no migrate required for dev/test).
- Singleton re-instantiates when resolved backend changes; `reloadContentRepositoryInstance()` for tests.

### 2. Workflow transitions (`workflow.ts`)

- `allowsTransition()` — same-status transitions allowed (idempotent updates).
- `assertSourceTransition()` / `assertOutputTransition()` — explicit guards for source and output packages.
- Existing campaign/content-item assert helpers unchanged.

### 3. Tenant isolation (`tenant-scope.ts`)

- `assertTenantOrganizationId()` — rejects empty org id.
- `assertContentItemInOrganization()`, `assertCampaignInOrganization()`, `assertSourceInOrganization()` — cross-tenant reads return "not found" semantics.
- Used by review, outputs, evidence, and AI layers before mutations.

### 4. Review & approval (`review.ts`)

- Pre-flight: tenant scope, archived/published block, `changes_requested` requires draft or in_review.
- `ContentGovernanceAudit` metadata on review dimensions (`productId`, `action`, `recordedAt`, actor).
- Approval response enriched with `governance` audit block (returned to caller; platform audit in actions).

### 5. Output export chain (`outputs.ts`) — verified

- `markOutputExported`: rejects already-exported; draft/ready → approved → exported via `assertOutputTransition`.
- Export metadata merges caller fields + `productId: localcontentos` + `exportedAt`.
- `createOutputPackage` / `getOutputReadiness` / `listOutputPackages` enforce tenant scope.
- `buildOutputPackagePayload` validates `organizationId`.

### 6. Evidence / source verification (`evidence.ts`)

- Tenant guards on verify, reject, list, update.
- `verifySource` enriches `evidenceMetadata` with `productId` and `verificationAction`.
- `getSourceCoverage()` returns `total`, `verified`, `proposed`, `rejected`, `expired`, `coverageRatio`.
- `listSourcesForContentItem` scopes via campaign + `sourceRefIds`.

### 7. Governed AI (`ai.ts`)

- No external LLM — deterministic template via `buildCommercialClaimReviewPrompt`.
- Always `reviewRequired: true`, `productId: "localcontentos"`.
- Blocks archived/published items; structured `logGovernedAI()` (suppressed in test).
- `draftAssistMetadata` includes `promptHash`, `generatedAt`, actor lineage.

### 8. Server actions (`local-content-workspace-actions.ts`)

- Every mutation: `requireUserContext` + `assertLocalContentPermission`.
- `requireMutationId()` on id parameters.
- `logContentStudioAudit()` dual-write to platform audit logger (non-blocking).
- Fixed approval audit `targetId` to use `approval.id` (was incorrectly `record.id`).

### 9. Types (`types.ts`)

- `ContentGovernanceAudit` interface for review/approval/export/AI audit shapes.
- Optional `governance` on `ContentApprovalRecord`; `governance` dimension on review records.

---

## RBAC matrix (Content Studio)

| Role | read | create | update | review | approve | export |
|------|------|--------|--------|--------|---------|--------|
| VIEWER | ✓ | | | | | |
| OPERATOR | ✓ | ✓ | ✓ | ✓ | | |
| ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Test results

```
npm test -- content-studio.test.ts
Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
Time:        ~8s
```

Coverage highlights:

- Project → campaign → source → item flow
- Governed AI `reviewRequired` + `draftAssistMetadata`
- Review dimensions + org-scoped review queue
- Output readiness blockers (unapproved content, unverified sources)
- Persistence boundary (org scoping, reload, export metadata)
- Workflow edge cases (invalid transitions, approval rejection)
- Permission gates (VIEWER/OPERATOR/ADMIN)

---

## Known limitations (honest)

| Item | Status |
|------|--------|
| Prisma pilot DB / migration drift | **Not addressed** — separate Worker 3 persistence track |
| Production LLM routing | **Deferred** — deterministic assist only |
| Full repo `tsc --noEmit` | **Not run** — low-load; unrelated SalesOS TS issues may exist |
| Browser smoke / dimension form | **Not validated** — Worker 8 scope |
| Institutional pilot sign-off | **Not validated** — documentation + unit tests only |

**Validation classification:** light validated (unit tests on file backend; no browser, no Prisma integration test in this pass).

---

## Files touched (Worker 3 backend hardening)

| File | Change |
|------|--------|
| `src/lib/local-content/content/repository-instance.ts` | Backend resolution + describe API |
| `src/lib/local-content/content/workflow.ts` | Source/output assert + same-status |
| `src/lib/local-content/content/tenant-scope.ts` | **New** — org isolation guards |
| `src/lib/local-content/content/review.ts` | Governance audit + pre-flight |
| `src/lib/local-content/content/outputs.ts` | Export chain + tenant scope |
| `src/lib/local-content/content/evidence.ts` | Coverage + verification metadata |
| `src/lib/local-content/content/ai.ts` | Logging + status guards + metadata |
| `src/lib/local-content/content/types.ts` | `ContentGovernanceAudit` |
| `src/lib/local-content/content/index.ts` | Public exports |
| `src/actions/local-content-workspace-actions.ts` | RBAC, audit, id validation |

---

## Operator note

Content Studio uses **file store by default in tests** (`resetContentRepositoryForTests` forces file backend). Pilot environments with `DATABASE_URL` resolve to **Prisma** unless `LOCALCONTENT_CONTENT_BACKEND=file` is set explicitly.
