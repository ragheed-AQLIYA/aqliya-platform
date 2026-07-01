# SalesOS v0.3 — PR-21c Account brief export

**Status:** Implementation in repo  
**Validation classification:** not validated — unit tests added; not executed in this session  
**Product:** SalesOS (AQLIYA platform)  
**Repo:** `C:\Users\PC\Documents\Aqliya`

---

## 1. Purpose

PR-21c delivers a **read-only account brief** per sales account. It aggregates account fields, ICP score, signals, governed research brief, linked deals summary, and evidence count into a single **print-friendly HTML** view—no PDF library, no new schema.

Operators can review or hand off account context from one page and export standalone HTML for browser print / save-as-PDF.

---

## 2. Scope

| In scope | Out of scope |
|----------|--------------|
| Read-only UI at `/sales/accounts/[id]/brief` | New tables or migrations |
| Inline HTML export route (no pdfkit) | LLM generation or editing from brief page |
| Aggregation of existing account metadata, signals, deals, evidence links | Changes under `src/lib/sales/agents/*` |
| Link from account detail page | Email send, scheduled exports |

---

## 3. Routes

| Route | Type | Description |
|-------|------|-------------|
| `/sales/accounts/[id]/brief` | Server page | Primary read-only account brief (print CSS) |
| `/sales/accounts/[id]/brief/export` | Route handler | `text/html` standalone export |

Account detail page (`/sales/accounts/[id]`) links to the brief via PR-21c CTA.

---

## 4. Data sources (no new schema)

| Section | Source |
|---------|--------|
| Account fields | `SalesAccount` row (name, industry, status, dates, isDemo) |
| ICP score | `SalesAccount.metadata.icpScore` (PR-15) |
| Signals | `SalesAccount.metadata.signals[]` (PR-8) |
| Research brief | `SalesAccount.metadata.agentRuns.accountResearch` (PR-14) |
| Linked deals | `SalesDeal` rows for account (via `getSalesAccount`) |
| Evidence count + list | `SalesEvidenceLink` rows for account (PR-4b) |

Loader: `loadAccountBriefPack(accountId, scope)` in `src/lib/sales/account-brief-pack.ts`.

---

## 5. Files touched

| Path | Role |
|------|------|
| `src/lib/sales/account-brief-pack.ts` | Assembly + HTML export |
| `src/lib/sales/__tests__/sales-account-brief-pack.test.ts` | Unit tests |
| `src/components/sales/account-brief-view.tsx` | Read-only print-friendly UI |
| `src/components/sales/account-brief-export-button.tsx` | Print + HTML export actions |
| `src/app/sales/accounts/[id]/brief/page.tsx` | Brief page |
| `src/app/sales/accounts/[id]/brief/export/route.ts` | HTML export handler |
| `src/app/sales/accounts/[id]/page.tsx` | Link to brief |

---

## 6. Validation (honest)

| Check | Status |
|-------|--------|
| Unit tests for pack assembly / export HTML | Added — not executed in this session |
| Browser smoke on `/sales/accounts/[id]/brief` | not validated |
| RBAC (`salesos:read`) on page + export | Implemented via existing guards — not runtime verified |
| Production readiness | **not validated** — PR-21c stub |

---

## 7. Operator notes

- Use **Print** on the brief page or open **تصدير HTML** for a standalone file; save as PDF via browser print if needed (no server-side PDF lib by design).
- Brief is **read-only**; edit account, ICP, signals, research, deals, and evidence from their respective pages.
- Research brief and ICP agent outputs remain governed stubs—human review gates from PR-14 / PR-15 still apply.

---

## 8. Dependencies on prior PRs

- **PR-3** — accounts + deals on account  
- **PR-4b** — evidence links  
- **PR-8** — signals metadata  
- **PR-14** — account research brief metadata  
- **PR-15** — ICP score on account metadata  
- **PR-19** — print/HTML export pattern (pilot handoff)

---

## Arabic one-liner

**موجز حساب قابل للطباعة يجمع الحقول وICP والإشارات وبحث الحساب وملخص الصفقات وعدد الأدلة — HTML فقط بدون مكتبة PDF.**

---

**Report version:** 2026-06-01 — PR-21c account brief export
