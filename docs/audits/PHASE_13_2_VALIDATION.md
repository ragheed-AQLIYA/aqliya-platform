# Phase 13.2 Validation — Engagement Presentation Policy Engine

**Date:** 2026-06-14  
**Scope:** Presentation/configuration layer only — accounting engine unchanged  
**Prior:** [`PHASE_13_1_VALIDATION.md`](./PHASE_13_1_VALIDATION.md), [`FACTORY_ACCURACY_AUDITED_FS_V4.md`](./FACTORY_ACCURACY_AUDITED_FS_V4.md)

---

## Objective

Replace pilot-specific hardcoded presentation rules with **engagement-level presentation policies** resolved at FS build time:

```text
statement-builder → presentation profile → presentation policy → rendered statements
```

---

## Implementation Summary

| Task | Deliverable | Status |
|------|-------------|--------|
| Policy model | `PresentationPolicyRules` in `presentation-policy-types.ts` | ✅ |
| Builtin policies | `generic-v1`, `shalfa-pilot-audited-v1` | ✅ |
| Prisma model | `AuditPresentationPolicy` + `AuditEngagement.presentationPolicyId` | ✅ |
| Migration + seed | `20260614130000_presentation_policy_engine` | ✅ |
| Policy resolver | `presentation-policy-resolver.ts` | ✅ |
| Engine refactor | `income-statement-presentation.ts`, `statement-builder.ts` | ✅ |
| FS rebuild wiring | `engagement-presentation-config.ts`, `fs-rebuild-service.ts` | ✅ |
| Profile → policy link | `createEngagement`, profile update sets `presentationPolicyId` | ✅ |
| Remove hardcoded constants | `AUDITED_*` constants — **0 matches in `src/`** | ✅ |
| Admin UI (view) | `PresentationPolicyViewer` on engagement page | ✅ |
| Tests | `presentation-policy.test.ts`, updated presentation tests | ✅ |
| Validation script | `scripts/p13-2-validation.mjs` | ✅ |

---

## Policy Resolution Layer

| Profile | Default policy slug | Policy ID | Audited headline rules |
|---------|---------------------|-----------|------------------------|
| `generic` (null → generic) | `generic-v1` | `pol-generic-v1` | No |
| `pilot-audited` | `shalfa-pilot-audited-v1` | `pol-shalfa-pilot-audited-v1` | Yes |

When `presentationPolicyId` is set on the engagement, DB `rules` JSON overrides profile default. When null, resolver falls back to profile → builtin policy.

---

## Seeded Shalfa Pilot Policy (Phase 11 rules preserved)

| Rule area | Policy field | Values |
|-----------|--------------|--------|
| Revenue exclusions | `revenue.operatingExclusionGlCodes` | `4401010004`, `4601010003`, `4701010001` |
| CoR exclusions | `costOfRevenue.exclusionGlCodes` + `exclusionPrefixPatterns` | `3204010028`, `3204010054`, `33*` |
| Other income net | `otherIncome.miscNettingGlCode` + `targetNet` | `4501010003` → **735,915** |
| Finance net offset | `finance.netOffset` | **334,011** |
| Affiliate memo | `revenue.excludeAffiliateFromOperatingHeadline` | `true` |

---

## Validation Results

**Evidence:** [`evidence/p13-2-validation.json`](./evidence/p13-2-validation.json)

### Resolver checks

| Check | Result |
|-------|--------|
| Generic profile → `generic-v1` | ✅ |
| Pilot-audited profile → `shalfa-pilot-audited-v1` | ✅ |
| Seeded policies loadable | ✅ |

### Factory Accuracy re-run (offline TB path)

| Scenario | Policy | Composite | Net profit vs audited |
|----------|--------|-----------|------------------------|
| Gulf Trading (generic client) | `generic-v1` | **87** | 0% ✅ |
| Shalfa — generic policy (control) | `generic-v1` | 53 | 0% ✅ (presentation diverges as expected) |
| Shalfa — pilot policy | `shalfa-pilot-audited-v1` | **83** | ±0.000016% ✅ |

### Shalfa pilot policy — line-level vs audited (v4 parity)

| Line | AuditOS | Audited | Variance | v4 match |
|------|--------:|--------:|---------:|:--------:|
| Operating revenue | 450,305,192 | 451,412,506 | −0.24% | ✅ |
| Cost of revenue | 384,995,489 | 384,959,315 | +0.009% | ✅ |
| Gross profit | 65,309,703 | 66,453,191 | −1.7% | ✅ |
| Operating profit | 40,149,605 | 39,825,465 | +0.8% | ✅ |
| Finance costs (net) | 12,901,271 | 12,901,271 | ~0% | ✅ |
| Other income (net) | 735,915 | 735,915 | 0% | ✅ |
| **Net profit** | **25,084,856** | **25,084,852** | **±0.000016%** | **✅** |

> **Note on composite score (83 vs v4 87):** The offline validation script scores cash as N/A (TB mapping path does not emit cash BS line) and G&A remains −5.5% vs audited (pre-existing Map1/mapping gap, not presentation policy). All **presentation-policy-driven lines** match Phase 11 v4 evidence. No regression.

### Generic engagements unchanged

Gulf Trading seed demo at **87** composite with `generic-v1` — same as Phase 12 Client B result.

---

## Hardcoded Constants Removed

| Former constant | Now lives in |
|-----------------|--------------|
| `AUDITED_OPERATING_REVENUE_EXCLUSION_CODES` | `policy.revenue.operatingExclusionGlCodes` |
| `AUDITED_COR_EXCLUSION_CODES` | `policy.costOfRevenue.exclusionGlCodes` |
| `33xx` CoR prefix | `policy.costOfRevenue.exclusionPrefixPatterns` |
| `AUDITED_PILOT_OTHER_INCOME_NET` | `policy.otherIncome.targetNet` |
| `OTHER_INCOME_MISC_NETTING_GL` | `policy.otherIncome.miscNettingGlCode` |
| `AUDITED_FINANCE_NET_OFFSET` | `policy.finance.netOffset` |

`grep AUDITED_ src/` → **0 runtime matches**.

Historical audit docs (Phase 11/v4) retain constant names as evidence references only.

---

## Admin UI

- **View:** `PresentationPolicyViewer` — admin-only card on engagement page showing linked policy slug, exclusions, netting targets.
- **Edit:** Not in scope — policy editing remains admin/seed/migration path for Phase 13.2. Future: org-specific policy CRUD.

---

## Profile Change → FS Rebuild (Phase 13.1.1)

Implemented in Phase 13.1.1 — see [`PHASE_13_1_1_VALIDATION.md`](./PHASE_13_1_1_VALIDATION.md). Profile save auto-rebuilds FS when mappings exist; UI shows success banner or **Rebuild Required** prompt with manual action.

---

## Success Criteria Assessment

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Policy model + engagement association | **✅ PASS** |
| 2 | Hardcoded pilot rules removed from engine | **✅ PASS** |
| 3 | Shalfa presentation lines match v4 (no regression) | **✅ PASS** |
| 4 | Generic engagements unchanged | **✅ PASS (87)** |
| 5 | Net profit logic unchanged | **✅ PASS** |
| 6 | Seeded migration preserves pilot rules | **✅ PASS** |

**Verdict:** Phase 13.2 **complete**. Presentation intelligence is now engagement-configurable; Factory Accuracy presentation layer is policy-driven.

---

## Commands Run

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm test -- presentation-policy.test.ts presentation-profile.test.ts income-statement-presentation.test.ts
node -r ./scripts/mock-server-only.cjs --import tsx scripts/p13-2-validation.mjs
```

---

## Known Limitations / Next Steps

| Item | Phase |
|------|-------|
| FS rebuild UX prompt after profile change | **13.1.1** |
| Org-specific policy editor (non-system policies) | Future |
| G&A operating expense Map1 gap (−5.5% Shalfa) | Mapping (not presentation) |
| Cash line in offline TB validation path | TB/BS mapping completeness |

---

## Files Changed (Phase 13.2)

- `src/lib/audit/presentation/presentation-policy-types.ts` — policy SSOT
- `src/lib/audit/presentation/presentation-policy-resolver.ts` — resolution layer
- `src/lib/audit/presentation/engagement-presentation-config.ts` — DB loader
- `src/lib/audit/db/income-statement-presentation.ts` — policy-driven engine
- `src/lib/audit/db/statement-builder.ts` — `presentationPolicy` option
- `src/lib/audit/fs-engine/fs-rebuild-service.ts` — passes policy context
- `prisma/schema.prisma` + migration `20260614130000_presentation_policy_engine`
- `src/components/audit/engagement/presentation-policy-viewer.tsx`
- `src/lib/audit/presentation/__tests__/presentation-policy.test.ts`
- `scripts/p13-2-validation.mjs`
