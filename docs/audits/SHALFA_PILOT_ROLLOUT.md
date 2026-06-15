# Shalfa Pilot Rollout Runbook

**Date:** 2026-06-14  
**Engagement ID:** `eng-shalfa-2025`  
**Policy:** `pol-shalfa-pilot-audited-v1`  
**Profile:** `pilot-audited`

---

## Prerequisites

| Step | Command | Notes |
|------|---------|-------|
| Database | `docker compose up -d db` | PostgreSQL on 5432 |
| Migrations | `npx prisma migrate deploy` | Includes presentation profile + policy engine |
| Seed base org | `npm run seed:audit` | Creates `org-aqliya`, `eng-gulf-2025` (generic) |
| TB file | **`TB 31-12-2025 Final.xlsx`** (578 lines) | **Not** repo `TB.xlsx` (214 lines — truncated) |
| Local DB | `DATABASE_URL` → `localhost:5432` | Windows PostgreSQL (not Docker-only) |

---

## One-Command Setup

```bash
npm run shalfa:setup
```

Options:

```bash
# Engagement shell only (no TB upload)
npm run shalfa:setup -- --skip-tb

# Custom TB path (required — use full Shalfa file, not repo TB.xlsx)
TB_FILE="C:/Users/PC/Downloads/TB 31-12-2025 Final.xlsx" npm run shalfa:setup
```

**Evidence output:** [`evidence/shalfa-pilot-setup.json`](./evidence/shalfa-pilot-setup.json)

---

## What the Setup Script Does

1. **Upsert system policies** — `pol-generic-v1`, `pol-shalfa-pilot-audited-v1`
2. **Create Shalfa engagement** — client, workspace, project (if platform org linked)
3. **Set pilot config** — `presentationProfile=pilot-audited`, policy `pol-shalfa-pilot-audited-v1`
4. **Upload TB** (unless `--skip-tb`) — with Map1 hints → `TBClassificationHistory`
5. **Confirm mappings** — auto-confirm suggested mappings
6. **Rebuild FS** — v2 engine with Map1 enrichment (Phase 14 live path)

---

## Manual UI Verification (admin)

1. Login: `admin@aqliya.com` / `admin123`
2. Open: `/audit/engagements/eng-shalfa-2025`
3. Confirm cards:
   - **Profile:** Pilot Audited
   - **Policy:** Shalfa Pilot Audited Presentation Policy
4. Open: `/audit/engagements/eng-shalfa-2025/statements`
5. Verify IS lines vs audited FS (Factory Accuracy ~87%)

---

## Factory Accuracy Validation

**Offline (TB file + policy engine):**

```bash
TB_FILE="C:/Users/PC/Downloads/TB 31-12-2025 Final.xlsx" node -r ./scripts/mock-server-only.cjs --import tsx scripts/p13-2-validation.mjs
```

**Live (DB engagement + Map1 enrichment):**

```bash
npm run shalfa:validate
```

Expected live composite: **≥85** (achieved **94** after cash rollup — see evidence).

Evidence: [`evidence/shalfa-live-validation.json`](./evidence/shalfa-live-validation.json)

### Local DB drift (Windows PG)

If `TBMappingPattern` or `LeadSchedule` tables are missing on your active `DATABASE_URL`:

```bash
node -r ./scripts/mock-server-only.cjs --import tsx scripts/apply-local-tb-intelligence.mjs
npx prisma migrate deploy   # after resolving any failed migrations
```

Note: `localhost:5432` may hit **Windows PostgreSQL**, not Docker — verify with `SELECT version()`.

---

## Architecture Notes

### Map1 Live Path (critical)

Offline scripts attach `erpMap1Label` directly. Live FS rebuild uses:

```text
TB upload hints → TBClassificationHistory.mappingHints
                → enrichMappingsWithErpMap1()
                → statement-builder (Phase 14 Map1 authority)
```

File: `src/lib/audit/presentation/enrich-mapping-map1.ts`

### Engagement Separation

| Engagement | Client | Profile | Purpose |
|------------|--------|---------|---------|
| `eng-gulf-2025` | Gulf Trading | **generic** | Demo / generalization |
| `eng-shalfa-2025` | Shalfa Facilities | **pilot-audited** | Pilot client |

Do not reuse `eng-gulf-2025` for Shalfa TB (per pilot session reports).

---

## Staging Deploy Checklist

- [ ] `npx prisma migrate deploy` on staging DB
- [ ] `npm run shalfa:setup` (or UI upload + policy assign)
- [ ] FS rebuild success banner
- [ ] Factory Accuracy evidence attached
- [ ] Pilot signoff record updated

---

## Rollback

- Set engagement profile to `generic` + `pol-generic-v1`
- Rebuild FS from engagement settings UI

**Verdict:** Shalfa pilot rollout **automated** via `npm run shalfa:setup`.

**Sign-off:** [`SHALFA_PILOT_SIGNOFF.md`](./SHALFA_PILOT_SIGNOFF.md) — live Factory Accuracy **94**.
