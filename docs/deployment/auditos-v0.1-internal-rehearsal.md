# AuditOS v0.1 — Internal Rehearsal Guide

**Date:** 2026-05-28  
**Purpose:** First full controlled walkthrough before external pilot  
**Duration:** ~60–90 minutes with one operator

---

## Prerequisites

- Deployment environment running per `docs/deployment/auditos-v0.1-deployment-guide.md`
- `GET /api/health` returns `status: "ok"`
- `npm run audit:health` passes
- Seed data loaded:

```bash
npx prisma db seed
npm run seed:audit
```

### Rehearsal login (seeded — change before any external use)

| Field    | Value                              |
| -------- | ---------------------------------- |
| URL      | `/login`                           |
| Email    | `admin@aqliya.com`                 |
| Password | `admin123` (from `prisma/seed.ts`) |

AuditUser mapping: `admin@aqliya.com` → `usr-admin` in audit org `org-aqliya`.

### Seeded engagement

| Field         | Value                              |
| ------------- | ---------------------------------- |
| Engagement ID | `eng-gulf-2025`                    |
| Client        | Gulf Trading Co.                   |
| Fiscal period | FY2025                             |
| Direct URL    | `/audit/engagements/eng-gulf-2025` |

---

## Rehearsal Script (11 steps)

### 1. Create engagement (optional if using seed)

**Path:** `/audit` → New engagement

**Observe:**

- Form validation and Arabic/RTL layout
- Engagement appears on dashboard with next-action card

**Blocker if:** Cannot create engagement or org scoping error

---

### 2. Upload trial balance

**Path:** `/audit/engagements/eng-gulf-2025/trial-balance`

**Actions:**

- Review seeded TB lines OR upload CSV/XLSX sample
- Confirm balance validation messages

**Observe:**

- Import feedback, Arabic labels
- Gate unlock for mapping after TB complete

**Expected friction:** Trial balance tab lacks dedicated loading/error boundary (P2)

---

### 3. Map accounts

**Path:** `/audit/engagements/eng-gulf-2025/mapping`

**Actions:**

- Confirm canonical account mappings
- Resolve any unmapped lines

**Observe:**

- Workflow gate reasons in Arabic if blocked
- Next-action card updates on overview

---

### 4. Generate statements

**Path:** `/audit/engagements/eng-gulf-2025/statements`

**Actions:**

- Generate or review financial statements
- Verify line traceability to TB

**Observe:**

- Statement status and regeneration flow

---

### 5. Add notes

**Path:** `/audit/engagements/eng-gulf-2025/notes`

**Actions:**

- Review disclosure notes
- Add or edit a note if needed

**Observe:**

- Note linkage to statement areas

---

### 6. Upload evidence

**Path:** `/audit/engagements/eng-gulf-2025/evidence`

**Actions:**

- Upload a test PDF or image
- Verify storage badge shows local provider
- Download evidence file
- Optional: reject evidence and confirm state change

**Observe:**

- Upload success/failure messaging (Wave D)
- Reject dialog clarity
- File remains on disk after reject (known limitation — not a blocker)

**Blocker if:** Upload fails due to unwritable storage directory

---

### 7. Create findings

**Path:** `/audit/engagements/eng-gulf-2025/findings`

**Actions:**

- Review seeded findings
- Create one new finding linked to evidence

**Observe:**

- Findings guidance text (Wave D)
- Evidence linkage requirement for material items

---

### 8. Review

**Path:** `/audit/engagements/eng-gulf-2025/review`

**Actions:**

- Submit review comments
- Confirm human review required messaging

**Observe:**

- Review gate blocks approval until satisfied
- No autonomous AI approval

---

### 9. Approve

**Path:** `/audit/engagements/eng-gulf-2025/approval`

**Actions:**

- Complete approval as partner/admin role
- Read human-decision banner (Wave C)
- Follow prerequisite links if gates block

**Observe:**

- Explicit approval language
- Gate reasons in Arabic

**Blocker if:** Approval bypasses review gates

---

### 10. Export

**Path:** `/audit/engagements/eng-gulf-2025/exports`

**Actions:**

- Download PDF export
- Download XLSX export if available
- Read draft banner if pre-final approval

**Observe:**

- Export error handling (Wave D)
- Draft labeling — not certified final output
- Pre-approval download policy (accepted for internal review)

**Blocker if:** Export fails silently or missing auth on download route

---

### 11. Verify audit trail

**Path:** `/audit/engagements/eng-gulf-2025/audit-trail`

**Actions:**

- Confirm events for upload, review, approval, export
- Note actor names and timestamps

**Observe:**

- Completeness of mutation log
- Creator accountability fields where shown

**Blocker if:** Major mutations missing from audit trail

---

## Expected Friction Points (non-blockers)

| Area            | What to expect                                                                   | Classification       |
| --------------- | -------------------------------------------------------------------------------- | -------------------- |
| Dashboard load  | Per-engagement readiness fetch (N+1)                                             | P2 — acceptable v0.1 |
| Tab resilience  | trial-balance, validation, recommendations, publication lack loading/error files | P2                   |
| Gate copy       | Arabic primary; some English in admin/deep UI                                    | P2                   |
| Evidence reject | State changes; file not deleted from disk                                        | P2 — disclosed       |
| Draft exports   | Downloadable before final approval                                               | Policy accepted      |
| AI review       | Optional; may need API keys for cloud provider                                   | Optional feature     |
| Slow export     | Large engagement PDF may take 30+ seconds                                        | Operational note     |

---

## What to Observe (operator checklist)

- [ ] Next-action cards match actual blocked tab
- [ ] Arabic gate reasons understandable to operators
- [ ] No cross-tenant data visible when switching users (if tested)
- [ ] Upload directory grows under `LOCAL_STORAGE_DIR`
- [ ] Health endpoint stays green during rehearsal
- [ ] No uncaught server errors in logs during core flow
- [ ] Human approval clearly required before treating export as final

---

## What Counts as Blocker

Stop rehearsal and file defect if any occur:

| Blocker           | Example                                                |
| ----------------- | ------------------------------------------------------ |
| Auth bypass       | Access `/audit/*` without login                        |
| Tenant leak       | User A sees User B engagement data                     |
| Governance bypass | Export marked final without approval path              |
| Data loss         | Upload succeeds but file not retrievable               |
| Silent mutation   | State change with no audit event                       |
| Health failure    | `/api/health` degraded with DB up and storage writable |
| Broken core gate  | Can approve without review when gates require review   |

**Not blockers:** P2 UX polish, slow dashboard, missing tab loading skeletons, evidence file retention after reject, draft export policy.

---

## Rehearsal Output

After completing the script, document:

1. **Date / operator / environment URL**
2. **Steps completed** (1–11 checklist)
3. **Friction log** — UX issues with severity (P0/P1/P2)
4. **Blockers found** — if any, link to issue/ticket
5. **Go/No-Go for external pilot prep** — recommend proceed only if zero blockers

See `docs/reports/auditos-v0.1-internal-rehearsal-c5-2026-05-28.md` (Track C.5 final rehearsal — **11/11 PASS**).

---

## References

- Deployment guide: `docs/deployment/auditos-v0.1-deployment-guide.md`
- Go/No-Go review: `docs/reports/auditos-v0.1-go-no-go-review-2026-05-28.md`
- Seeded dataset details: `docs/product/auditos-demo-dataset.md` (if present)
