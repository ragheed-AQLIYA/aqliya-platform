# Knowledge Foundation — Tabletop Smoke Validation

> **Version:** 1.0  
> **Date:** 2026-06-21  
> **When:** Day before [Tabletop Governance Exercise](./TABLETOP_GOVERNANCE_EXERCISE.md)  
> **Owner:** Facilitator + Platform Ops  
> **Prerequisite:** [Tabletop Readiness Checklist](./TABLETOP_READINESS_CHECKLIST.md) gates D1–P6 complete

---

## 1. Purpose

Validate that staging can support the full Tabletop scenario **before** participants arrive. This is a **technical facilitator check** — not the Tabletop exercise itself.

**Pass:** All mandatory smoke paths green.  
**Fail:** Fix or document gap before scheduling Tabletop.

---

## 2. Environment Record (fill in)

| Field | Value |
| ----- | ----- |
| Environment | ☐ Staging ☐ Local dev ☐ Other: ______ |
| Base URL | `https://staging.aqliya.com` or `http://localhost:3000` |
| Date of smoke | |
| Facilitator | |
| Platform Ops | |

### Suggested test accounts (seed reference — adjust per staging)

| Tabletop role | Suggested account | System role | Password (seed) |
| ------------- | ----------------- | ----------- | --------------- |
| Release Approver | `admin@aqliya.com` | ADMIN | `admin123` |
| Release Operator / Mining Reviewer | `sara@aqliya.com` | OPERATOR | `operator123` |
| Governance Auditor | `mohammad@aqliya.com` | VIEWER | `viewer123` |

> Use **separate** ADMIN and OPERATOR sessions during Tabletop for separation-of-duties realism.

---

## 3. Pre-Smoke Infrastructure

| # | Check | How | Pass | Notes |
| - | ----- | --- | ---- | ----- |
| I1 | App health | `GET {BASE_URL}/api/health` → 200 | ☐ | |
| I2 | Auth works | Login as ADMIN + OPERATOR | ☐ | |
| I3 | DB migrated | `npx prisma migrate status` (ops) | ☐ | |
| I4 | FS writable | Confirm `knowledge/releases/` exists and writable | ☐ | |
| I5 | No FAILED releases | SQL below → 0 rows | ☐ | |

```sql
SELECT v."versionNumber", r."artifactStatus", r."createdAt"
FROM "KnowledgeFoundationVersion" v
JOIN "KnowledgeFoundationRelease" r ON r."versionId" = v.id
WHERE r."artifactStatus" IN ('FAILED', 'PENDING')
  AND r."createdAt" < NOW() - INTERVAL '15 minutes';
```

---

## 4. Smoke Path A — Forward Release (facilitator or ops)

**Goal:** Confirm DRAFT → bind → approve → release → verify works on staging.

| Step | Action | Route / doc | Expected | Pass |
| ---- | ------ | ----------- | -------- | ---- |
| A1 | Login as OPERATOR | | Success | ☐ |
| A2 | Open KF dashboard | `/knowledge-foundation` | Loads RTL UI | ☐ |
| A3 | Confirm ≥2 PROMOTED unbound candidates | `/knowledge-foundation/new` or `/knowledge-review` | Pool visible | ☐ |
| A4 | Create test version (use `9.9.9-tabletop-smoke` or agreed number) | `/knowledge-foundation/new` | Status DRAFT | ☐ |
| A5 | Bind 1–2 candidates | Same | `candidate.bound` in history | ☐ |
| A6 | Login as ADMIN; approve | `/knowledge-foundation/[id]` | Status APPROVED | ☐ |
| A7 | Login as OPERATOR; release | Release Approval SOP Step D | Status RELEASED | ☐ |
| A8 | Confirm `artifactStatus = COMPLETE` | Governance report or SQL | COMPLETE | ☐ |
| A9 | Run integrity verification | Integrity card | All green | ☐ |
| A10 | **Do not activate** (reserve for Tabletop) OR activate to `9.9.9` if resetting baseline | Facilitator choice | Document decision | ☐ |

**SQL — release status:**

```sql
SELECT v."versionNumber", v.status, r."artifactStatus", r."manifestSha256"
FROM "KnowledgeFoundationVersion" v
LEFT JOIN "KnowledgeFoundationRelease" r ON r."versionId" = v.id
WHERE v."versionNumber" LIKE '%tabletop%' OR v."versionNumber" = '1.0.0'
ORDER BY v."createdAt" DESC;
```

---

## 5. Smoke Path B — Integrity Gate

**Goal:** Confirm `verifyReleaseIntegrity()` path matches docs.

| Step | Action | Expected | Pass |
| ---- | ------ | -------- | ---- |
| B1 | Open RELEASED version with COMPLETE release | Integrity card visible | ☐ |
| B2 | Click **إعادة التحقق من السلامة** | Success state | ☐ |
| B3 | Check audit history | `knowledge.foundation.integrity.verified` | ☐ |
| B4 | Attempt activation without verify on a **different** test RELEASED row (optional) | Blocked if integrity not pass | ☐ |

Reference: [Release Approval SOP §10](./RELEASE_APPROVAL_SOP.md)

---

## 6. Smoke Path C — Rollback

**Goal:** Confirm rollback path for Tabletop Day 7.

**Precondition:** At least one ACTIVE version + one prior RELEASED version (e.g. `v1.0.0` ACTIVE baseline, smoke version activated temporarily).

| Step | Action | Doc | Expected | Pass |
| ---- | ------ | --- | -------- | ---- |
| C1 | Identify current ACTIVE | Dashboard | Document version | ☐ |
| C2 | Identify rollback target (RELEASED or eligible) | Rollback SOP §4 | Not DEPRECATED-only | ☐ |
| C3 | Verify integrity on **target** | Rollback SOP §6 | PASS | ☐ |
| C4 | Login ADMIN; execute rollback with reason `SMOKE-TEST` | Rollback SOP §7 | Target ACTIVE | ☐ |
| C5 | Verify audit | `/knowledge-foundation/history` | `rollback.executed` | ☐ |
| C6 | Restore baseline for Tabletop (re-activate intended ACTIVE if needed) | Facilitator | Document final state | ☐ |

---

## 7. Smoke Path D — Audit Reconstruction

**Goal:** Confirm auditor can reconstruct lifecycle from logs alone.

| Step | Action | Expected events | Pass |
| ---- | ------ | --------------- | ---- |
| D1 | Open `/knowledge-foundation/history` | List loads | ☐ |
| D2 | Locate smoke version events | `version.created`, `bound`, `approved`, `released`, `integrity.verified` | ☐ |
| D3 | If rollback smoke ran | `rollback.executed`, `deprecated` | ☐ |
| D4 | Export or screenshot for Tabletop pack | Evidence attached | ☐ |

Reference: [Tabletop Exercise §5 memo template](./TABLETOP_GOVERNANCE_EXERCISE.md)

---

## 8. Smoke Path E — RBAC Negative Tests

| Step | Actor | Action | Expected | Pass |
| ---- | ----- | ------ | -------- | ---- |
| E1 | VIEWER | Access `/knowledge-foundation/new` | Denied or redirect | ☐ |
| E2 | OPERATOR | Attempt rollback UI | Denied (ADMIN only) | ☐ |
| E3 | Unauthenticated | `/knowledge-foundation` | Redirect login | ☐ |

Reference: [Monitoring doc §2.1](./MONITORING_AND_INCIDENT_RESPONSE.md)

---

## 9. Staging Baseline for Tabletop (facilitator sets)

Document the **starting state** for exercise day:

| Item | Value (fill in) |
| ---- | --------------- |
| Baseline ACTIVE version | e.g. `v1.0.0` |
| Baseline ACTIVE version ID | |
| Exercise target version | e.g. `v1.1.0` (created during exercise) |
| Promoted unbound candidate IDs | |
| Optional FAILED branch | ☐ Yes ☐ No |
| Smoke test version to delete/ignore | e.g. `9.9.9-tabletop-smoke` |

### If no ACTIVE version exists on staging

Facilitator must **bootstrap once** before Tabletop (ops-assisted, not during exercise):

1. Complete Smoke Path A through activation for bootstrap `v1.0.0`
2. Document in [Tabletop Execution Record](./TABLETOP_EXECUTION_RECORD.md)
3. Tabletop exercise starts from stable ACTIVE baseline

---

## 10. Smoke Summary

| Path | Mandatory | Result |
| ---- | --------- | ------ |
| A — Forward release | ✅ | ☐ Pass ☐ Fail |
| B — Integrity | ✅ | ☐ Pass ☐ Fail |
| C — Rollback | ✅ | ☐ Pass ☐ Fail |
| D — Audit | ✅ | ☐ Pass ☐ Fail |
| E — RBAC | ✅ | ☐ Pass ☐ Fail |

**Smoke authorized for Tabletop scheduling:** ☐ Yes ☐ No

| Role | Name | Date |
| ---- | ---- | ---- |
| Facilitator | | |
| Platform Ops | | |

---

## 11. Related Documents

- [Tabletop Readiness Checklist](./TABLETOP_READINESS_CHECKLIST.md) §6
- [Tabletop Execution Record](./TABLETOP_EXECUTION_RECORD.md)
- [Tabletop After Action Report](./TABLETOP_AFTER_ACTION_REPORT.md)
