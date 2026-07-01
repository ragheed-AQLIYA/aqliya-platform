# Release Decision — PR #5 / AuditOS Factory V1

**Original council date:** 2026-06-15  
**Updated:** 2026-06-15 (post-merge closure)

---

## Current Status (authoritative)

| Milestone | Status | Reference |
| --------- | ------ | --------- |
| PR #5 merged to `main` | ✅ Done | `46f805f`+ |
| Release Hardening | ✅ Done | `291adda`, tag `release-hardening-pr5` |
| Staging deploy proof | ⏳ Pending | AWS credentials — see `OPERATOR_DEPLOY_CHECKLIST.md` |
| Cycle 2 (Client #2 measure) | ⏳ Active | `client-2-firm-memory-checklist.md` |

**Program label:** **AuditOS Factory V1 — Released Baseline**

PR #5 is **closed**. The program is **not complete** — commercial validation remains open.

---

## Original Question (2026-06-15)

> Can PR #5 be merged after successful staging validation?

**Original decision:** APPROVE WITH CONDITIONS

**Outcome:** Merged to `main` with local/staging-like validation evidence. Full staging ECS deploy remains an **operator gate**, not a rollback of merge.

---

## Conditions — disposition

| # | Condition | Status |
| --- | --------- | ------ |
| C1 | Staging ECS deploy green | ⏳ Blocked (AWS creds) |
| C2 | RDS migrations applied | ✅ Local; staging RDS pending |
| C3 | Smoke on real URL | ⏳ Pending C1 |
| C4 | Shalfa ≥85% reproduced | ✅ Local evidence (`shalfa-live-validation.json`, 94%) |
| C5 | CI disposition | ⚠️ PR CI had failures; triage deferred |
| C6 | No test-token leak | ⚠️ Confirm `src/app/api/test-token/` never merged |

---

## Post-merge actions (completed)

1. ✅ Merge PR #5 → `main`
2. ✅ Tag `release-hardening-pr5`
3. ✅ Release hardening (R-014 generic policy, R-H01 tests)
4. ✅ R-001 migration order fix (`29751c0`)

---

## Cycle 2 directive (current)

**Do not:** Phase 16, Local AI, RAG, refactor, new features.

**Do:** Prove audit memory **economics**:

```text
Year 2 effort < Year 1 effort
```

KPIs: reuse rate, memory accuracy, TRUSTED growth, **human review hours saved**.

See `docs/operations/client-2-firm-memory-checklist.md`.

---

## Historical record (pre-merge council)

<details>
<summary>Original APPROVE WITH CONDITIONS rationale (2026-06-15)</summary>

Merge justified for Shalfa pilot Factory scope once operational gates pass.

**Not unconditional because (at time of review):**

- GitHub PR CI failing (run `27548070717`)
- Staging deploy never succeeded (AWS credentials)
- LeadSchedule migration ordering gap (later fixed in `29751c0`)
- Generalization claims exceed hold-out evidence (~46%)

**Evidence basis:** Shalfa 578 mappings @ 94% factory accuracy locally; factory code committed and inspectable.

</details>

---

## Sign-off posture (updated)

```text
Engineering substance:     Released Baseline on main
Operational proof:         Staging deploy still pending
Commercial proof:          Not ready — Cycle 2 measurement required
Documentation:             Synced 2026-06-15 (this file + PROGRAM_STATUS + ASSESSMENT)
Next authorization:        Client #2 measurement — not new product scope
```
