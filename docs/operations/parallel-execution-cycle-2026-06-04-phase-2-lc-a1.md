# Parallel Execution — Phase 2 (LC-01 + LC-03 + A1-02)

**Date:** 2026-06-05  
**Branch:** `main` @ `bbc905e` (D3-01 closed)  
**Mode:** Parallel read/plan; **sequential writes** on main per Director rules

---

## Cycle objective

Deliver three **non-overlapping** product slices in one parallel cycle:

| Agent | Task ID | Product | Priority |
| ----- | ------- | ------- | -------- |
| Agent-LC01 | LC-01 | LocalContentOS weighted supplier scoring | High |
| Agent-LC03 | LC-03 | LocalContentOS multi-reviewer approval routing | High |
| Agent-AuditOS | A1-02 | AuditOS sampling automation engine | Medium |

**Frozen:** Build stabilization, D3-01, IC-05, middleware/Edge, `prisma/schema` (unless Director approves separate migration task).

---

## File ownership (no overlap)

### Agent-LC01 — LC-01

**ALLOWED:**

- `src/lib/local-content/scoring.ts`
- `src/lib/local-content/types.ts` (scoring types only)
- `src/lib/local-content/__tests__/supplier-scoring*.test.ts` (new)
- `src/actions/localcontent-actions.ts` (score-related handlers only)
- `src/components/local-content/*score*` (if exists or new)
- `src/app/local-content/**` (dashboard/score display pages only — not `review/`)

**FORBIDDEN:** `services.ts` review/approval functions, `review/**` routes, `src/lib/audit/**`, `prisma/**`

### Agent-LC03 — LC-03

**ALLOWED:**

- `src/lib/local-content/approval-routing.ts` (new — prefer new module)
- `src/lib/local-content/services.ts` (only `listReviews`, `createReview`, `listApprovals`, `createApproval` and imports they need)
- `src/actions/localcontent-actions.ts` (review/approval handlers only)
- `src/app/local-content/**/review/**`
- `src/components/local-content/*review*`
- `src/lib/local-content/__tests__/approval-routing*.test.ts` (new)

**FORBIDDEN:** `scoring.ts`, `calculateProjectScore` body changes, `src/lib/audit/**`

### Agent-AuditOS — A1-02

**ALLOWED:**

- `src/lib/audit/sampling/**` or `src/lib/audit/sampling-engine.ts` (new)
- `src/lib/audit/services/**` (sampling integration only)
- `src/actions/audit-actions.ts` (sampling actions only)
- `src/app/audit/**` (sampling UI slice only)
- `src/components/audit/*sampling*` (new)
- `src/lib/audit/__tests__/sampling*.test.ts` (new)

**FORBIDDEN:** `src/lib/local-content/**`, `src/lib/ai/**`, `prisma/**`, middleware

### Agent-QA (after merges)

- `src/__tests__/**` targeted runs only
- Cycle report validation section

---

## Dependency check

| Task | Deps | Status |
| ---- | ---- | ------ |
| LC-01 | IC-01 (RAG) optional for scoring | ✅ Not required for rule-based scoring |
| LC-03 | None | ✅ |
| A1-02 | IC-01 optional | ✅ Engine can be deterministic v0.1 |

---

## Merge order (writes)

1. LC-01 (scoring.ts — lowest coupling)
2. LC-03 (approval routing — may touch services.ts)
3. A1-02 (audit — isolated tree)
4. QA validation pass

---

## Validation plan (post-merge)

```bash
npx tsc --noEmit
npm run lint -- --quiet
npx jest --testPathPatterns="supplier-scoring|approval-routing|sampling"
```

Full `npm run build` only with explicit approval.

---

## Status

**DONE_WITH_CONCERNS** — 2026-06-05

| Task | Result | Notes |
| ---- | ------ | ----- |
| LC-01 | ✅ Parent agent | Weighted supplier scoring in `scoring.ts` + tests (18 pass) |
| LC-03 | ✅ Parent agent | `approval-routing.ts`, services gate, review/approval UI |
| A1-02 | ✅ Parent agent | `src/lib/audit/sampling/*`, action, `/sampling` tab |
| Subagents | ❌ Usage limit | All three background agents failed; work completed on main |

**Validation (light):** `npx tsc --noEmit`, targeted jest `scoring`, `approval-routing`, `sampling-engine`.

**Not run:** full `npm run build`, full lint, full test suite.

**Commits:** Not created (user must request isolated commits per task).
