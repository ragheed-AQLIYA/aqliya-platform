# English — What SalesOS is now

﻿# SalesOS L6 — Final handoff (executive)

**Date:** 2026-06-01  
**Classification:** Institutional **pilot-ready with conditions** — **NOT production**  
**Audience:** Integrator, product owner, pilot operator  
**Repo:** `C:\Users\PC\Documents\Aqliya`

---

## English — What SalesOS is now

SalesOS is the **commercial CRM slice** on AQLIYA Core: governed accounts, deals, pipeline, evidence links to Core artifacts, interactions, audit trail, metadata-first signals and outreach (draft/review only — **no external send**), conversion memo gates, bounded **agent stubs** (deterministic/metadata — **no LLM auto-send**), institutional memory, commercial-claim rules, account brief export, and pilot handoff HTML per deal.

It is a **pilot-depth product** on shared platform RBAC and evidence doctrine — not a standalone SaaS CRM and not production-hardened multi-tenant operations.

### Maturity (honest)

| Label | Verdict |
|-------|---------|
| Pilot-ready with conditions | **Yes** — Phase 0 DB + seed + Jest done (migrate **with conditions**); browser smoke + integrator sign-off still required |
| Production GA | **No-go** — explicit |

**Conditions:** See human steps below. Do not claim production, full L6 institutional closure, or autonomous outreach/email/LLM without human evidence.

---

## العربية — ما هو SalesOS الآن

SalesOS هو **وحدة CRM تجارية** على منصة AQLIYA: حسابات وصفقات ومسار بيع، ربط أدلة Core، تفاعلات، سجل تدقيق، إشارات وoutreach على مستوى metadata (مسودة ومراجعة فقط — **بدون إرسال خارجي**)، بوابات مذكرة التحويل، **وكلاء محدودون** (قواعد/metadata — **بدون إرسال LLM تلقائي**)، ذاكرة مؤسسية، بوابة مطالبات تجارية، تصدير موجز حساب، وحزمة pilot HTML لكل صفقة.

**ليس** منتج CRM إنتاجي كامل و**ليس** جاهزاً للإنتاج العام.

### النضج

| التصنيف | الحكم |
|---------|--------|
| pilot-ready بشروط | **نعم** — Phase 0 وJest منجزة؛ يبقى smoke وتوقيع المُكامل |
| إنتاج (Production GA) | **لا** — صريح |

---

## Human steps (Phase 0 — operator)

Run from repo root **only with explicit approval** (not in unattended agent sessions):

1. Review (echo): `powershell -ExecutionPolicy Bypass -File scripts/salesos-phase0-apply.ps1`
2. Execute on **pilot DB**: same script with `-Execute` (optional `-SkipSeed`)
3. Steps applied: `prisma validate` → `migrate status` → `migrate deploy` → `prisma generate` → `npx tsx scripts/seed-sales-demo.ts` (unless skipped)
4. Drift: follow `docs/operations/salesos-migration-runbook.md` (legacy migration names may exist in some DBs)
5. Browser smoke: runbook §7/§8 routes; record waivers if empty org
6. Sign: `docs/reports/salesos-l6-integrator-checklist.md`

---

## Routes map (`/sales/*`)

| Route | Purpose |
|-------|---------|
| `/sales` | Sales dashboard |
| `/sales/deals`, `/sales/deals/new`, `/sales/deals/[id]` | Deals CRUD + detail |
| `/sales/deals/[id]/pilot` | Deal pilot pack |
| `/sales/accounts`, `/sales/accounts/new`, `/sales/accounts/[id]` | Accounts |
| `/sales/accounts/[id]/brief` | Account brief export (PR-21c) |
| `/sales/pipeline` | Pipeline view |
| `/sales/evidence` | Org evidence links (read-focused) |
| `/sales/signals` | Read-only signals (metadata) |
| `/sales/outreach` | Outreach queue (drafts) |
| `/sales/review` | Governance review (no auto-send email) |
| `/sales/audit-trail` | Sales audit events |
| `/sales/reports` | Founder snapshot (read-only) |
| `/sales/pilot-handoff/[dealId]` | Pilot handoff HTML export |

**Nav note:** `sales-nav.tsx` exposes dashboard + deals only; other routes are deep-link / in-page navigation until nav expanded.

---

## Agents (bounded stubs)

| Agent module | Role |
|--------------|------|
| `agents/icp-fit.ts` | ICP fit scoring + review flags |
| `agents/account-research.ts` | Account research stub + ADMIN review |
| `agents/objection-analysis.ts` | Objection analysis (audited metadata) |
| `agents/deal-risk.ts` | Deal risk signals |
| `agents/follow-up.ts` | Follow-up recommendations |

All require human review paths in UI; **no** external LLM auto-send or email send API.

---

## Governance rules (SalesOS)

1. **Evidence:** Deals/accounts link to Core evidence; conversion memo requires deal evidence refs before submit (`conversion-memo.ts`).
2. **Commercial claims (PR-21a):** `validateClaimText` flags risky phrases and `[[claim]]` / `[COMMERCIAL_CLAIM]`; outreach submit blocked until `sales.claim.reviewed`; brief/research gated when rules fire (`commercial-claims.ts`).
3. **Outreach:** Draft + review only; governance on `/sales/review`; **no** production send path.
4. **RBAC:** `sales-actions` + `getSalesPermissions` — VIEWER read-only; OPERATOR vs ADMIN enforced server-side (UI gates partial on some forms).
5. **Audit:** Domain events on `SalesAuditEvent`; `/sales/audit-trail` for inspection.
6. **Platform doctrine:** AI assists; humans decide; evidence governs (see `AGENTS.md`, `docs/DOCUMENTATION_AUTHORITY.md`).

---

## PR program closure (PR-1 → PR-21)

- **PR-1–PR-6, PR-10, PR-13–PR-18, PR-20, PR-21 (all slices):** **done** in repo.
- **Partial (pilot-acceptable gaps):** PR-7, PR-8, PR-9 (docs/RBAC UI coverage), PR-11, PR-12 (metadata vs relational P2), PR-19 (`docs/pilot/` folder missing).
- Detail table: `docs/reports/salesos-l6-progress.md`.

---

## Automated validation (recorded this closure)

Command (repo root):

```text
npx jest src/lib/sales/__tests__ --no-coverage
```

Result **2026-06-01**:

| Metric | Value |
|--------|-------|
| Test suites | 18 passed / 18 total |
| Tests | 153 passed / 153 total |
| Time | ~3 s |
| Coverage | not collected (`--no-coverage`) |

**Classification:** light validated (unit tests + Phase 0 DB retry). **Not** browser validated, **not** build validated. Hybrid DB: see `salesos-l6-closure-executive-pack.md`.

---

## TODO / FIXME scan (`src/lib/sales`, `src/app/sales`)

Recursive scan for `TODO` and `FIXME` in `*.ts` / `*.tsx` on **2026-06-01**: **0 matches**.

No inline TODO/FIXME backlog to rank; tracked gaps are **documented** (nav/evidence link, PRODUCT_STATUS_MATRIX drift, operator migrate/smoke, `docs/pilot/` folder).

---

## Explicit NOT production

- No production GA claim at this gate.
- No validated HA, backup restore drill, or multi-org soak.
- No guarantee of external email delivery or LLM autonomy.
- `npm run build`, full E2E, and operator `migrate deploy` **not** evidenced in L6 closure session.
- Metadata-first signals/outreach lack full relational CRM export/audit parity.

---

## Sign-off pointers

| Artifact | Path |
|----------|------|
| Integrator checklist | `docs/reports/salesos-l6-integrator-checklist.md` |
| Readiness assessment | `docs/reports/salesos-l6-readiness-assessment.md` |
| Progress (PR table) | `docs/reports/salesos-l6-progress.md` |
| Migration runbook | `docs/operations/salesos-migration-runbook.md` |
| Phase 0 script | `scripts/salesos-phase0-apply.ps1` |

---

### Arabic one-liner

**إغلاق L6:** SalesOS جاهز للتجريب المؤسسي بشروط (Phase 0 + smoke + توقيع)، Jest 153/153، والإنتاج: لا.
