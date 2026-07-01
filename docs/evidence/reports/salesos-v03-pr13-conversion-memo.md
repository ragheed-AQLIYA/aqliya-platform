# Summary

﻿# SalesOS v0.3 PR-13 — Conversion Memo / Pilot Handoff Stub

**Status:** light validated (unit tests on lib)  
**Product:** SalesOS on AQLIYA Core  
**Classification:** pilot-ready with conditions — no email, no LLM

---

## Summary

PR-13 adds a **pilot-to-paid conversion memo** stub on deals. The memo lives in `SalesDeal.metadata.conversionMemo` with governed submit rules: at least one **deal evidence link** must be selected before handoff. Audit action `sales.conversion.memo_updated` records upsert and submit operations. **No** SMTP, **no** agent/LLM generation.

---

## Scope delivered

| Area | Path | Notes |
|------|------|-------|
| Lib | `src/lib/sales/conversion-memo.ts` | read, upsert, submit (+ optional decide in one step) |
| Actions | `src/actions/sales-actions.ts` | `upsertConversionMemoAction`, `submitConversionMemoAction` |
| Deal UI | `src/components/sales/deal-conversion-memo-panel.tsx` | Draft form, evidence checkboxes, submit / decide |
| Deal detail | `src/app/sales/deals/[id]/page.tsx` | Conversion memo card (PR-13) |
| Audit | `sales.conversion.memo_updated` | SalesAuditEvent + platform `auditLogger` |
| Tests | `src/lib/sales/__tests__/sales-conversion-memo.test.ts` | Unit coverage |

---

## Data model (metadata)

```json
{
  "conversionMemo": {
    "draft": "string",
    "status": "draft|submitted|decided",
    "pilotCriteria": "string",
    "evidenceRefs": ["SalesEvidenceLink.id"],
    "decidedAt": "ISO8601|null",
    "updatedAt": "ISO8601",
    "submittedAt": "ISO8601|null"
  }
}
```

**No migration** — metadata-only (same pattern as outreach drafts and review decisions).

---

## Workflow

| Step | Status | Gate |
|------|--------|------|
| Save draft | `draft` | OPERATOR+ (`salesos:update`) |
| Submit for handoff | `submitted` | `evidenceRefs.length >= 1` and each ref is a deal `SalesEvidenceLink` |
| Register conversion decision | `decided` | Same evidence gate; sets `decidedAt` (can combine with submit via `markDecided`) |

---

## RBAC

| Action | VIEWER | OPERATOR | ADMIN |
|--------|--------|----------|-------|
| View memo | read | read | read |
| Save / submit / decide | — | update | update |
| Email / LLM | — | — | — |

---

## Audit events

| Action | When |
|--------|------|
| `sales.conversion.memo_updated` | Upsert draft fields or submit / decide handoff |

Dual-write: `recordSalesAuditEvent` in lib + `auditLogger` in server actions.

---

## Explicit non-goals (PR-13)

- No email send or templates
- No LLM / agent draft generation
- No `SalesProposal` / `SalesReview` Prisma tables (deferred; L6 master plan slice C variant)
- No edits to audit-trail page or agent research modules

---

## Validation

```bash
npm test -- src/lib/sales/__tests__/sales-conversion-memo.test.ts
```

**Result:** run locally per low-load protocol.

---

## Known limitations

1. Evidence refs are link row IDs only — operator must link evidence on the deal first.
2. No org-wide conversion memo queue (deal detail only).
3. `submitted` → `decided` as a second step is not exposed in UI; panel uses one-shot `markDecided` or submit-only.

---

## Arabic one-liner

**مذكرة تحويل pilot على الصفقة — مسودة ومعايير وأدلة مربوطة، تسليم محكوم مع سجل `sales.conversion.memo_updated`، بدون بريد أو ذكاء اصطناعي.**
