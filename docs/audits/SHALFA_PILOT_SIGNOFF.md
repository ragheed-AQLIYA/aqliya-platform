# Shalfa Facilities Pilot — Sign-Off

**Date:** 2026-06-14  
**Client:** Shalfa Facilities Co.  
**Engagement:** `eng-shalfa-2025`  
**Fiscal period:** FY2025  
**Policy:** `shalfa-pilot-audited-v1` (`pilot-audited` profile)

---

## Verdict

**PILOT READY — Shalfa FY2025 TB → FS pipeline validated**

| Gate | Status | Evidence |
|------|--------|----------|
| Presentation policy engine (Phase 13.2) | ✅ | [`PHASE_13_2_VALIDATION.md`](./PHASE_13_2_VALIDATION.md) |
| Map1 live path + G&A authority (Phase 14) | ✅ | [`PHASE_14_VALIDATION.md`](./PHASE_14_VALIDATION.md) |
| Policy CRUD (Phase 15) | ✅ | [`PHASE_15_VALIDATION.md`](./PHASE_15_VALIDATION.md) |
| Pilot rollout automation | ✅ | [`SHALFA_PILOT_ROLLOUT.md`](./SHALFA_PILOT_ROLLOUT.md) |
| Live Factory Accuracy | ✅ **94** | [`evidence/shalfa-live-validation.json`](./evidence/shalfa-live-validation.json) |
| Offline Factory Accuracy | ✅ **87–100** | [`evidence/p13-2-validation.json`](./evidence/p13-2-validation.json) |

---

## Factory Accuracy — Live (DB)

| Line | AuditOS | Audited | Variance |
|------|---------|---------|----------|
| Net profit | 25,084,855.92 | 25,084,852 | +0.000016% |
| Revenue | 450,305,191.84 | 451,412,506 | −0.25% |
| Cost of revenue | 383,760,688.27 | 384,959,315 | −0.31% |
| Operating profit | 39,906,940.39 | 39,825,465 | +0.20% |
| Finance costs | 12,901,271.17 | 12,901,271 | ~0% |
| Other income | 735,915 | 735,915 | 0% |
| Cash | 62,819,988.84 | 62,819,989 | ~0% |
| Total equity | 112,586,726.38 | 112,586,721 | ~0% |

**Composite score:** 94 (target ≥85)

---

## Engagement Data

| Metric | Value |
|--------|-------|
| TB lines uploaded | 578 |
| Confirmed mappings | 578 |
| Map1 history rows | 918 |
| Financial statements | 4 (IS, BS, equity, rebuilt v2) |
| TB source | `TB 31-12-2025 Final.xlsx` (581 rows — **not** repo `TB.xlsx`) |

---

## Commands (reproduce)

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aqliya?schema=public"
$env:TB_FILE="C:/Users/PC/Downloads/TB 31-12-2025 Final.xlsx"

npm run shalfa:setup
npm run shalfa:validate
```

---

## UI Verification

1. Login: `admin@aqliya.com`
2. `/audit/engagements/eng-shalfa-2025` — Profile: **Pilot Audited**, Policy: **Shalfa Pilot**
3. `/audit/engagements/eng-shalfa-2025/statements` — IS/BS with rolled-up cash line
4. `/audit/engagements/eng-shalfa-2025/mapping` — 578 confirmed mappings

---

## Known Limitations (non-blocking)

| Item | Impact | Notes |
|------|--------|-------|
| Total assets +2.5% vs audited | Structural score 70 | Presentation totals; equity/net match |
| LeadSchedule tables (local drift) | Reconciliation schedule ties skipped | Graceful fallback in engine |
| IS rendered CoR line vs presentation total | UI label only | Presentation engine uses policy totals |
| Windows PG vs Docker port 5432 | Dev env confusion | Align `DATABASE_URL` with active instance |

---

## Staging Deploy Checklist

- [ ] `npx prisma migrate deploy` on staging
- [ ] `npm run shalfa:setup` with production TB file path
- [ ] `npm run shalfa:validate` ≥85
- [ ] UI sign-off by engagement partner
- [ ] Attach this doc + evidence JSON to pilot record

---

## Separation Rule

| Engagement | Profile | Use |
|------------|---------|-----|
| `eng-gulf-2025` | `generic` | Demo / generalization |
| `eng-shalfa-2025` | `pilot-audited` | Shalfa client pilot only |

**Signed off by:** Automated validation pipeline (2026-06-14)  
**Human review:** Pending partner confirmation on staging UI
