# Phase 13.1 Validation — Presentation Profile Per Engagement

**Date:** 2026-06-14  
**Scope:** Configuration and governance only — no accounting engine changes  
**Prior:** [`GENERALIZATION_REPORT.md`](./GENERALIZATION_REPORT.md)

---

## Objective

Move Income Statement presentation behavior from global `AUDITOS_IS_PRESENTATION_PROFILE` to **per-engagement** configuration with version persistence.

---

## Implementation Summary

| Task | Deliverable | Status |
|------|-------------|--------|
| Schema extension | `AuditEngagement.presentationProfile`, `presentationProfileVersion` | ✅ |
| Migration | `prisma/migrations/20260614120000_engagement_presentation_profile/` | ✅ |
| Domain enum | `src/lib/audit/presentation/presentation-profile.ts` | ✅ |
| Statement builder wiring | `buildStatementLinesFromMappings(..., { presentationProfile })` | ✅ |
| FS rebuild wiring | `fs-rebuild-service.ts`, `db/index.ts` rebuild path | ✅ |
| Null fallback | `resolvePresentationProfile(null)` → `generic` | ✅ |
| Admin UI | `PresentationProfileSettings` on engagement page (admin only) | ✅ |
| Version persistence | Auto-set `generic-v1` / `pilot-audited-v1` on save | ✅ |
| Tests | `presentation-profile.test.ts` | ✅ |

---

## Validation Checklist

### 1. Shalfa engagement uses `pilot-audited`

| Step | Result |
|------|--------|
| Admin opens engagement settings card | Dropdown visible for `admin` role only |
| Set profile to **Pilot Audited** | Saves `presentationProfile=pilot-audited`, `presentationProfileVersion=pilot-audited-v1` |
| Rebuild FS (mapping confirm / v2 rebuild) | Operating revenue uses Phase 11 pilot rules |
| Audit event logged | `engagement.presentation_profile_updated` |

> **Note:** No Shalfa seed engagement exists in repo. When Shalfa TB is loaded to any engagement, admin sets **Pilot Audited** manually. Simulation evidence: Phase 12 Shalfa control with `PresentationProfile.PILOT_AUDITED` → Factory Accuracy **83** (presentation lines align).

### 2. New engagement uses `generic`

| Step | Result |
|------|--------|
| `createEngagement()` | Sets `presentationProfile=generic`, `presentationProfileVersion=generic-v1` |
| Null DB columns | Resolved to `generic` via `resolvePresentationProfile()` |
| FS rebuild | Map1/GL generic presentation (Phase 10.5) |

Seed engagement `eng-gulf-2025` (Gulf Trading) remains **generic** unless admin changes it.

### 3. Statement builder reads engagement profile

| Call site | Profile source |
|-----------|----------------|
| `rebuildFinancialStatementsV2()` | `loadEngagementPresentationConfig(engagementId)` |
| `rebuildFinancialStatementsForEngagement()` (v1 fallback) | Same |
| Offline scripts | Explicit `{ presentationProfile }` option |

**No `process.env.AUDITOS_IS_PRESENTATION_PROFILE` reads remain** in presentation or statement-builder code paths.

### 4. Env var no longer required

| Check | Result |
|-------|--------|
| `grep AUDITOS_IS_PRESENTATION_PROFILE src/` | **0 matches** (removed from runtime) |
| Test: set env to `pilot-audited`, pass null profile | Still resolves **generic** ✅ |

### 5. Existing outputs unchanged (when profile matches)

| Profile | Net profit | Presentation |
|---------|------------|----------------|
| `generic` | Signed-IS unchanged | Phase 10.5 / Phase 12 Client B **87%** |
| `pilot-audited` | Signed-IS unchanged | Phase 11 Shalfa alignment **83–87%** |

Changing default from env-global `pilot-audited` to engagement-default `generic` is **intentional** (Phase 13.1 business requirement). Engagements that need pilot alignment must set `pilot-audited` explicitly.

---

## Commands

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm test -- presentation-profile.test.ts income-statement-presentation.test.ts
```

---

## Files Changed

| Path | Change |
|------|--------|
| `prisma/schema.prisma` | Added nullable profile fields |
| `prisma/migrations/20260614120000_engagement_presentation_profile/migration.sql` | ALTER TABLE |
| `src/lib/audit/presentation/presentation-profile.ts` | Enum + resolve helpers |
| `src/lib/audit/presentation/engagement-presentation-config.ts` | DB loader |
| `src/lib/audit/db/income-statement-presentation.ts` | Profile parameter (no env) |
| `src/lib/audit/db/statement-builder.ts` | `StatementBuildOptions` |
| `src/lib/audit/fs-engine/fs-rebuild-service.ts` | Engagement profile on rebuild |
| `src/lib/audit/db/index.ts` | create/update + v1 rebuild wiring |
| `src/lib/audit/services.ts` | `updateEngagementPresentationProfile` |
| `src/actions/audit-actions.ts` | Admin server action |
| `src/components/audit/engagement/presentation-profile-settings.tsx` | Admin UI |
| `src/app/audit/engagements/[engagementId]/page.tsx` | Render settings card |
| `src/types/audit/index.ts` | Engagement type fields |
| `scripts/p12-generalization-validation.mjs` | Profile option (no env) |
| `src/lib/audit/presentation/__tests__/presentation-profile.test.ts` | New tests |

---

## Success Criteria

| # | Criterion | Result |
|---|-----------|--------|
| 1 | No global presentation behavior | ✅ |
| 2 | Presentation controlled per engagement | ✅ |
| 3 | Shalfa results preserved when `pilot-audited` set | ✅ |
| 4 | New engagements default to `generic` | ✅ |
| 5 | Backward compatible (nullable migration) | ✅ |
| 6 | Production ready | ✅ (pending deploy migration) |

---

## Next Step

**Stop here — await approval before Phase 13.2** (replace hard-coded pilot GL rules with Map1-driven / engagement-configurable rules).

---

*Phase 13.1 Validation — 2026-06-14*
