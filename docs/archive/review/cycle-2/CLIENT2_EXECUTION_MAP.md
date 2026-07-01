# Client #2 — Execution Map (Simulation)

**Audit date:** 2026-06-15  
**Mode:** Read-only simulation from existing code and docs  
**Assumption:** Same organization, same ERP chart as Shalfa (Cycle 2 economics path)

---

## Scenario

**Goal:** Year 2 simulation — measure hours saved vs Year 1 while firm memory from prior confirms is warm.

**Two valid interpretations:**

| Model | Year 1 | Year 2 |
| ----- | ------ | ------ |
| **A — New engagement, same chart** | New `eng-client2-y1` — first pass builds/extends memory | New `eng-client2-y2` or re-run classify on Y1 engagement |
| **B — Shalfa as Year 1 baseline** | Existing `eng-shalfa-2025` (578 patterns, no time log) | New period TB on new engagement same org |

**Gap:** Shalfa has **technical** baseline only — **no recorded review hours**. Model A requires logging Year 1 from scratch.

---

## Operator Steps (Exact)

### Phase 0 — Preconditions

| Step | Action | Source |
| ---- | ------ | ------ |
| 0.1 | `cp .env.example .env` — set `DATABASE_URL` | Standard |
| 0.2 | `docker compose up -d db` (or RDS) | Ops |
| 0.3 | `npx prisma migrate deploy` | `firm-memory-deployment-runbook.md` |
| 0.4 | `npm run seed:audit` | Shalfa setup prerequisite |
| 0.5 | Open spreadsheet — time log + exception log | `client-2-firm-memory-checklist.md` |

### Phase 1 — Year 1 pass (baseline)

| Step | Action | Code path |
| ---- | ------ | --------- |
| 1.1 | **Start timer** — Upload TB activity | Spreadsheet |
| 1.2 | Create client + engagement via UI `/audit` → engagement form | `engagement-form.tsx` → `createEngagementAction` → `db.createEngagement` (default `presentationProfile: generic`, `db/index.ts:2716`) |
| 1.3 | Upload TB file | `uploadTrialBalanceAction` → `svcUploadTrialBalance` → classification via `classifyTrialBalanceRows` |
| 1.4 | Review suggested mappings in UI | Manual |
| 1.5 | Confirm each mapping (or bulk confirm) | `confirmMappingAction` / `confirmAllSuggestedMappings` → `recordFirmMemoryFeedback` (`audit-actions.ts:224`) |
| 1.6 | Log exception counts: auto-accept vs corrected vs new | Spreadsheet |
| 1.7 | **Stop timer** — mapping review | Spreadsheet by reviewer level |
| 1.8 | FS rebuild (automatic on confirm or manual v2) | `rebuildFinancialStatementsForEngagement` / `rebuildFinancialStatementsV2Action` |
| 1.9 | FS validation + governance review — **timed** | Spreadsheet |
| 1.10 | Close Year 1 totals | Spreadsheet |

**Optional backfill (Shalfa only — NOT for Client #2):** `npm run phase-3c:backfill` — checklist forbids on Client #2 data.

### Phase 2 — Year 2 pass (measurement)

| Step | Action | Code path |
| ---- | ------ | --------- |
| 2.1 | New TB period upload OR re-classify same accounts | Same upload/classify path; memory should hit via `lookupFirmMemory` |
| 2.2 | Review mappings — **timed**; log auto-accept vs corrections | Spreadsheet |
| 2.3 | Confirm mappings (2nd reviewer where possible for TRUSTED) | Same confirm path; increments `hitCount`, merges `confirmedReviewerIds` |
| 2.4 | FS + governance review — **timed** | Spreadsheet |
| 2.5 | Run KPI scripts: | |
| | `ENGAGEMENT_ID=<id> npm run phase-3c:validate` | Memory-only accuracy |
| | `npm run tb:memory-reuse-rate -- --engagement <id>` | Reuse % → `docs/audits/evidence/tb-memory-reuse-rate.json` |
| | `ENGAGEMENT_ID=<id> npm run phase-3d:validate-governance` | TRUSTED counts → `phase-3d-governance-validation.json` |
| 2.6 | Compute Hours Saved % = `(Y1−Y2)/Y1` | Spreadsheet |
| 2.7 | Compile **Client #2 Economics Report** (4 headline metrics) | Manual |

---

## Required Manual Work

| Item | Why manual |
| ---- | ---------- |
| Time logging | No product feature |
| Reviewer level (Senior/Manager/Partner) | Spreadsheet discipline |
| Exception / correction counts | No export API |
| Client selection & TB file | Business input |
| Economics report narrative | Human synthesis |

---

## Required Reviewer Actions

| Role | Actions |
| ---- | ------- |
| Operator | TB upload, initial mapping review |
| Reviewer 1 | Confirm mappings (writes memory) |
| Reviewer 2 | Second confirm cycle on Year 2 (TRUSTED path) |
| Partner (optional) | Governance sign-off — log separately for ROI weighting |

**RBAC:** `confirmMappingAction` requires `admin` or `operator` (`audit-actions.ts:206`).

---

## Required Data Inputs

| Input | Format |
| ----- | ------ |
| Trial balance XLSX | Same ERP chart as Shalfa for economics path |
| `DATABASE_URL` | PostgreSQL with migrations applied |
| Authenticated audit users | `seed:audit` |
| `ENGAGEMENT_ID` | For validation scripts |
| Hourly cost rates (optional) | Spreadsheet for Cycle 3 ROI |

---

## Expected Outputs

| Output | Location |
| ------ | -------- |
| `tb-memory-reuse-rate.json` | `docs/audits/evidence/` |
| `phase-3c-firm-memory-validation.json` | (on run) `docs/audits/evidence/` |
| `phase-3d-governance-validation.json` | `docs/audits/evidence/` |
| Time study spreadsheet | Operator-owned |
| **Client #2 Economics Report** | Operator-owned |

---

## Missing Operational Steps (Gaps)

| Gap | Severity | Mitigation |
| --- | -------- | ---------- |
| No `client-2:setup.mjs` | Low | UI + checklist sufficient |
| No Shalfa Year 1 **time** baseline | **High** | Log from first Client #2 Y1 pass; cannot retro-fit |
| No automated correction export | Medium | Manual exception log |
| No in-app timer | Medium | Spreadsheet wall-clock |
| Partner hours not in checklist table | Low | Add column in spreadsheet |
| AWS staging not validated | Medium | Local DB OK for measurement; staging for ops proof |
| Bulk confirm may use single reviewer | Medium | Require 2nd reviewer on Year 2 for TRUSTED |

---

## Go / No-Go (from checklist)

```text
SUCCESS = Hours Saved > 25%  AND  Accuracy ≥ Year 1
```

Supporting only: Reuse > 80%, TRUSTED > 0, corrections ↓
