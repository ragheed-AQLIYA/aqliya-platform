# Phase 13.1.1 Validation — FS Rebuild After Profile Change

**Date:** 2026-06-14  
**Scope:** UX + orchestration only — no accounting engine changes  
**Prior:** [`PHASE_13_1_VALIDATION.md`](./PHASE_13_1_VALIDATION.md), [`PHASE_13_2_VALIDATION.md`](./PHASE_13_2_VALIDATION.md)

---

## Objective

After changing `presentationProfile` / linked policy, the admin must **see clear rebuild feedback** — not assume the profile change failed when FS lines are stale.

```text
Profile change → save → auto rebuild (if mappings exist) → user feedback
                     ↘ skip/fail → "Rebuild Required" prompt + manual action
```

---

## Implementation Summary

| Task | Deliverable | Status |
|------|-------------|--------|
| Structured rebuild result | `PresentationProfileRebuildResult` | ✅ |
| Rebuild orchestrator | `presentation-profile-rebuild.ts` | ✅ |
| v1 + v2 fallback | Uses exported `rebuildFinancialStatementsForEngagement` | ✅ |
| Service wiring | `updateEngagementPresentationProfile` returns `fsRebuild` | ✅ |
| Audit event on success | `engagement.presentation_profile_fs_rebuilt` | ✅ |
| Admin UX banner | Success (green) / Rebuild required (amber) | ✅ |
| Manual rebuild button | Calls `rebuildFinancialStatementsV2Action` | ✅ |
| Link to statements | `/audit/engagements/[id]/statements` | ✅ |
| Tests | `presentation-profile-rebuild.test.ts` | ✅ |

---

## Rebuild Status Flow

| Condition | Status | User message |
|-----------|--------|--------------|
| Mappings exist, rebuild OK | `rebuilt` | ✅ تم إعادة بناء القوائم المالية |
| No confirmed mappings | `skipped_no_mappings` | ⚠️ مطلوب: إعادة بناء — بعد إتمام الربط |
| Rebuild throws | `failed` | ⚠️ فشل التلقائي + زر إعادة بناء يدوي |

---

## UX (Admin — Engagement Settings)

1. Admin changes profile (e.g. `generic` → `pilot-audited`).
2. Clicks **حفظ سياسة العرض** (label now implies rebuild attempt).
3. **If rebuilt:** green banner with statement count + link to FS page.
4. **If skipped/failed:** amber **Rebuild Required** banner with manual rebuild button (disabled when no mappings).

---

## Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| `npm test -- presentation-profile-rebuild.test.ts` | **3 passed** |

---

## Files Changed

- `src/lib/audit/presentation/presentation-profile-rebuild-types.ts` — shared result types
- `src/lib/audit/presentation/presentation-profile-rebuild.ts` — rebuild orchestrator
- `src/lib/audit/presentation/__tests__/presentation-profile-rebuild.test.ts`
- `src/lib/audit/db/index.ts` — export `rebuildFinancialStatementsForEngagement`
- `src/lib/audit/services.ts` — structured rebuild + audit event
- `src/actions/audit-actions.ts` — return `fsRebuild` to client
- `src/components/audit/engagement/presentation-profile-settings.tsx` — rebuild banners

---

## Known Limitations

- Manual rebuild button uses v2 action only (requires `audit.fs-v2` flag); v1 engagements get auto-rebuild via service path on save.
- No persistent "stale FS" flag across page reloads — banner shows immediately after save only.

**Verdict:** Phase 13.1.1 **complete**.
