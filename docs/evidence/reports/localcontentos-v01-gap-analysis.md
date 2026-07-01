# LocalContentOS v0.1 — Gap Analysis (Agent 3 Findings)

**Date:** 2026-05-29  
**Agent:** 3 — LocalContentOS L5 Assessment (read-only)  
**Synthesized by:** Agent 7 — Sprint closure  
**Baseline:** `docs/reports/aqliya-eid-sprint-reality-check.md`, `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`  
**Mode:** Read-only inspection — no code or schema changes in Agent 3 pass

---

## Executive Summary

LocalContentOS is **L5 pilot-ready with conditions** — a real governed workspace, not a shell or marketing-only surface. The minimum v0.1 flow (Project → Records → Analysis → Reports → Review → Export) is **largely implemented**, but **pilot closure is blocked** by documentation contradictions, incomplete workflow status wiring, a missing classification UI, thin report exports for four of six report types, and **13 unchecked manual smoke steps**.

**Not L6.** Arabic PDF font rendering remains P2. No production ops, no regulator certification, no AI classification.

---

## 1. Implementation Level Assessment

| Level | Criterion | Verdict | Evidence |
| ----- | --------- | ------- | -------- |
| **L4** | Usable v0.1 — persistence, guards, mutations, core routes | **Met** | 10 Prisma models, ~25 server actions, 12 workspace routes, seed `lc-project-demo-001` |
| **L5** | Pilot — review, approval, audit trail, exports, tests | **Met with conditions** | Review/approval pages, 2 download APIs (report + evidence), 4+ test suites, governance copy |
| **L6** | Production-hardened | **Not met** | No automated backup/malware, Arabic PDF P2, manual smoke incomplete, conditional claims only |

**Authority:** `PRODUCT_STATUS_MATRIX.md` row LocalContentOS; Agent 0 reality check (B9).

**Status docs:** No `docs/status/` folder. Canonical status is matrix + product pack. `docs/systems/local-content-os/README.md` is **partially stale** (see §5).

---

## 2. Minimum v0.1 Flow — Gap Map

```text
Project → Records → Analysis → Reports → Review → Export
   ✅        ✅         ⚠️         ⚠️        ⚠️        ⚠️
```

| Stage | What works | Gaps (v0.1 usability) |
| ----- | ---------- | ----------------------- |
| **Project** | Dashboard, list, detail, `ProjectCreateForm` on `/local-content/projects` | Review submit does **not** set `InReview`; status machine mostly unused except approval → `Approved`/`Rejected` |
| **Records** | Suppliers, spend, CSV import, evidence metadata + file upload, findings CRUD/delete | `classifyLocalContentSpendRecordAction` exists but **no UI** — classification page is read-only; locality mainly via supplier fields |
| **Analysis** | `calculateProjectScore`, classification/findings views | No separate analysis surface; rule-based only (by design for v0.1) |
| **Reports** | 6 types, `generateLocalContentReportAction`, list + download | Download `switch` only specializes `spend_classification` / `evidence_index`; **supplier_register, gap_risk, final_package** fall back to generic assessment PDF; XLSX is summary rows, not full registers |
| **Review** | Submit + history, governance copy | Form only when `reviews.length === 0` — no re-review/return cycle in UI; no status transition on submit |
| **Approval** | Blocked without review, approve/reject updates project status | Form hidden after first approval record |
| **Export** | `/api/local-content/.../reports/[reportId]/download` + evidence download (auth + audit) | Export input hardcodes `reviewStatus`/`approvalStatus` as `"Pending"` in download route |

---

## 3. Codebase Inventory (Inspected)

| Area | Location | Notes |
| ---- | -------- | ----- |
| Workspace routes | `src/app/local-content/` | 12 routes + loading/error/not-found |
| Marketing | `src/app/(marketing)/products/local-content/page.tsx` | Lists “محاكاة” (excluded from v0.1 scope) |
| API | `src/app/api/local-content/projects/[projectId]/...` | 2 download routes (report + evidence) |
| Services | `src/lib/local-content/` | services, export (pdfkit/xlsx), guards, scoring |
| Actions | `src/actions/localcontent-actions.ts` | ~25 actions |
| Schema | `prisma/schema.prisma` | 10 models (`LocalContentProject` … `LocalContentAuditEvent`) |
| Tests | `src/lib/local-content/__tests__/`, `src/__tests__/unit/localcontent-export-generators.test.ts` | 4 suites + export unit tests |
| Tenant model | `src/lib/local-content/guards.ts` | Legacy `User.organizationId` — no `platformOrganizationId` parity with WorkflowOS |

---

## 4. Security & Governance (Read-Only)

| Control | Status |
| ------- | ------ |
| Middleware JWT on `/local-content/*` | OK |
| `assertProjectAccess()` tenant check | OK (legacy org model) |
| Download routes auth + audit log | OK per Agent 1 matrix |
| Review/approval human-governance copy | OK |
| Forbidden claims in UI | OK (no AI/regulator/production claims) |

**Deferred (needs explicit approval):** `platformOrganizationId` guard parity with WorkflowOS (Agent 1 R4).

---

## 5. Documentation Contradictions (Pilot Risk)

| Document | Stale claim | Code reality |
| -------- | ----------- | ------------ |
| `docs/systems/local-content-os/README.md` | Binary PDF/XLSX deferred; text/CSV only | **Implemented** 2026-05-25 (pdfkit + xlsx) |
| `docs/product/localcontentos-v0.1/pilot-onboarding-pack/limitations-and-safe-claims.md` | Export is text/CSV; forbid binary PDF | **Contradicts** matrix + `export.ts` + download route |
| `docs/product/localcontentos-sales-pack/README.md` | May still say export deferred | Not patched in Agent 6 pass (low priority) |
| `docs/reports/localcontentos-v0.1-final-readiness-review.md` | Pre-L5 snapshot (no project form, no PDF) | **Superseded** by 2026-05-23+ matrix phases |

**Partially fixed in sprint:** Agent 6 aligned `README.md` and `aqliya-v0.1-release-scope.md` for LocalContent exports. **Pilot onboarding pack still stale.**

---

## 6. Manual Smoke Status

Source: `docs/product/localcontentos-v0.1/pilot-smoke-checklist.md`

| Category | Status |
| -------- | ------ |
| Navigation / rendering (items 1–7, 9–10, 14, 16–17, 21–24, 26–28, 31–33, 36–45) | Mostly ✅ browser-verified 2026-05-24 |
| **Mutation path (items 8, 11–13, 15, 20, 25, 29, 34–35)** | **⬜ pending human form fill** (~13 items) |
| Mutation feedback loop | PASS 2026-05-23 (revalidatePath + router.refresh) |

**Pilot closure requires:** human execution of review submit, approval block test, report generate/download on `lc-project-demo-001`.

---

## 7. Recommended Next Batch

### P0 — Documentation truth (safe, no schema)

1. Update `limitations-and-safe-claims.md` — binary PDF/XLSX is live; safe claim wording for pilot demos.
2. Update `docs/systems/local-content-os/README.md` — remove “deferred PDF/XLSX”.
3. Re-run smoke items 8–13, 25–26, 29, 34–35 and record timestamps.

### P1 — Small code (low risk, no schema)

1. Download route: load latest review/approval into export metadata (remove hardcoded `"Pending"`).
2. `createReview`: on `submitted`, call `updateProjectStatus(..., "InReview")`.
3. Review page: allow new submission when status is `Returned` or action is `returned`.
4. Wire classification form to existing `classifyLocalContentSpendRecordAction` (classification or spend page).

### P2 — Export depth (no schema)

1. Dedicated PDF/XLSX builders per report type (supplier rows, findings, combined package).
2. Arabic PDF font embedding.

### P3 — Platform parity (needs approval)

1. Optional `platformOrganizationId` guard alignment with WorkflowOS.
2. Classify untracked `settings/loading.tsx` if shared shell work continues.

### Explicitly out of scope

- New Prisma models/migrations
- AI classification
- LCGPA / authority integration
- L6 production ops (backup automation, penetration test)

---

## 8. Agent 3 Deliverables Status

| Deliverable | Status |
| ----------- | ------ |
| Small safe code improvements | **Not applied** (read-only subagent) |
| This gap analysis | **Created by Agent 7** from Agent 3 inspection |

---

## Sign-off

| Field | Value |
| ----- | ----- |
| **Product level** | L5 pilot-ready with conditions |
| **Pilot-closed** | **No** — docs + workflow wiring + smoke remain |
| **Schema changes recommended** | **None** without explicit approval |

---

*Agent 3 assessed; Agent 7 documented. Evidence governs; humans decide.*
