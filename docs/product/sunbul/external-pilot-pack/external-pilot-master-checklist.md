# Sunbul — External Pilot Master Checklist

**Version:** 1.0
**Date:** 2026-05-18
**Classification:** Internal — Sunbul Team

---

## Master Checklist

All steps required for a successful external pilot.

### Phase 1: Pre-Pilot (T-2 Weeks)

- [ ] **Pilot offer** — Share `pilot-offer.md` with client
- [ ] **Pilot scope** — Share `pilot-scope.md` with client
- [ ] **Client requirements** — Complete `client-requirements-checklist.md` with client
- [ ] **Pilot start/end dates** — Agreed with client
- [ ] **Legal/terms** — Any required documents signed

### Phase 2: Setup (T-1 Week)

- [ ] **Instance ready** — Cloud deployment running latest Sunbul code
- [ ] **Seed data** — Run `npx tsx scripts/seed-sunbul-pilot.ts`
- [ ] **Client user accounts** — Created with correct roles
- [ ] **Internal validation** — Run:
  ```bash
  npx tsx scripts/validate-sunbul-e2e.ts     # 54/54
  npx tsx scripts/sunbul-internal-pilot.ts   # 40/40
  ```
- [ ] **URLs tested** — Login, dashboard, case creation, upload, review, export
- [ ] **Operator manual sent** — `sunbul-operator-manual.md`
- [ ] **Smoke test checklist printed** — `sunbul-pilot-smoke-test-checklist.md`
- [ ] **Feedback form ready** — `post-pilot-feedback-form.md`

### Phase 3: Demo (Week 1, Day 1)

- [ ] **Demo agenda followed** — See `demo-agenda.md`
- [ ] **Client operator creates first case** — Hands-on
- [ ] **Client uploads first document** — Hands-on
- [ ] **Client submits for review** — Hands-on
- [ ] **Client reviewer returns/approves** — Hands-on
- [ ] **Client exports PDF** — Hands-on
- [ ] **Questions answered**
- [ ] **Observer notes recorded**

### Phase 4: Live Test (Weeks 1–4)

- [ ] **Week 1 check-in** — Day 3 or 4
- [ ] **Week 2 check-in** — Independent use observed
- [ ] **Week 3 check-in** — Mid-pilot review
- [ ] **Issues logged** — All observations recorded per runbook
- [ ] **Support requests tracked**
- [ ] **No blocking issues unresolved** for more than 1 week

### Phase 5: Feedback (Week 4)

- [ ] **Client completes feedback form** — `post-pilot-feedback-form.md`
- [ ] **Success criteria scored** — `pilot-success-criteria.md`
- [ ] **Closeout meeting held**
- [ ] **Client decision maker attended** closeout
- [ ] **Pilot data disposition agreed** (keep / export / delete)

### Phase 6: Closeout & Conversion (Week 4+)

- [ ] **Conversion decision made** — See `pilot-to-paid-conversion.md`
- [ ] **If GO**:
  - [ ] Commercial proposal presented
  - [ ] Terms agreed
  - [ ] Payment method agreed
  - [ ] Client onboarded as paid
- [ ] **If NO-GO**:
  - [ ] Learnings documented
  - [ ] Client data handled per agreement
  - [ ] Pilot retrospective written
- [ ] **Pilot log archived**

---

## Reference Documents

| Document | File |
|---|---|
| Pilot offer | `pilot-offer.md` |
| Pilot scope | `pilot-scope.md` |
| Client requirements | `client-requirements-checklist.md` |
| Demo agenda | `demo-agenda.md` |
| Pilot runbook | `pilot-runbook.md` |
| Success criteria | `pilot-success-criteria.md` |
| Feedback form | `post-pilot-feedback-form.md` |
| Conversion guide | `pilot-to-paid-conversion.md` |
| Communication templates | `whatsapp-email-templates.md` |
| Operator manual | `../sunbul-operator-manual.md` |
| Smoke test checklist | `../sunbul-pilot-smoke-test-checklist.md` |

## Validation Scripts

| Script | Command | Expected |
|---|---|---|
| E2E validation | `npx tsx scripts/validate-sunbul-e2e.ts` | 54/54 |
| Internal pilot | `npx tsx scripts/sunbul-internal-pilot.ts` | 40/40 |
| Pilot seed | `npx tsx scripts/seed-sunbul-pilot.ts` | Client created |
| Migration status | `npx prisma migrate status` | Up to date |
| TypeScript | `npx tsc --noEmit` | 0 errors |
| Lint | `npm run lint` | 0 errors |
| Build | `npm run build` | Compiled |
