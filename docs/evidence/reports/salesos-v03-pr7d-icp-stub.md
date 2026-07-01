# SalesOS v0.3 PR-7D — Account ICP Stub (Parallel D)

**Workstream:** Parallel D — `salesos_p7d_icp_stub`  
**Date:** 2026-06-01  
**Validation:** light validated (tsx smoke on `readAccountIcpScore`)

---

## Goal

Phase 2 read-only ICP fit stub on account detail: placeholder types, UI panel, metadata-only storage — **no AI**, **no Prisma migration**.

---

## Changes

### 1. `src/lib/sales/icp-types.ts`

| Export | Role |
|--------|------|
| `IcpFitBand` | `strong` \| `moderate` \| `weak` \| `unknown` |
| `AccountIcpScore` | Fit score (0–100), band, segment, confidence, dimensions, source, notes |
| `AccountIcpAssessment` | `{ configured, score }` result shape |
| `readAccountIcpScore(metadata)` | Parses `SalesAccount.metadata.icpScore`; returns unconfigured when missing/invalid |
| `icpBandLabelAr(band)` | Arabic band labels for UI |

### 2. `src/components/sales/account-icp-panel.tsx`

- Read-only server component.
- **Unconfigured:** shows `ICP assessment not configured` + Arabic stub notice.
- **Configured:** fit score %, band, segment badge, confidence, BANT-style dimensions, notes, source, assessed-at.

### 3. `src/app/sales/accounts/[id]/page.tsx`

- Sidebar card **ملاءمة ICP** with `<AccountIcpPanel metadata={account.metadata} />`.
- Uses existing `getSalesAccountAction` (already selects `metadata`).

### 4. `scripts/seed-sales-demo.ts` (optional demo metadata)

- Adds `icpScore` in `metadata` for 3 demo accounts (strong / moderate / weak).
- Backfills `icpScore` on re-seed when existing demo row lacks it.
- Tag: `salesos-v03-pr7d` inside `icpScore.seed`.

---

## Not changed (per constraints)

- `src/app/sales/pipeline/` (pipeline page)
- `src/lib/sales/permissions.ts` (permissions registry)
- `src/lib/sales/interactions.ts`
- Prisma schema / migrations (`SalesAccount.metadata` already exists)

---

## Validation

| Check | Result |
|-------|--------|
| `readAccountIcpScore` smoke (configured + unconfigured + band inference) | **Passed** |
| Prisma migration required | **No** — JSON metadata only |
| Full build / browser | **Not run** (low-load protocol) |

---

## Usage

1. Seed demo accounts: `tsx scripts/seed-sales-demo.ts`
2. Open `/sales/accounts/{id}` for a demo account with `icpScore` in metadata.
3. Accounts without `metadata.icpScore` show the unconfigured stub message.

---

## Arabic one-liner

**لوحة ICP للقراءة فقط على صفحة الحساب — بيانات من metadata بدون جداول أو ذكاء اصطناعي.**
