# Summary

﻿# SalesOS v0.3 PR-14 — Governed Account Research Agent Stub

**Status:** light validated (unit tests on lib)  
**Product:** SalesOS on AQLIYA Core  
**Classification:** pilot-ready with conditions — no external LLM

---

## Summary

PR-14 adds a **governed account research brief stub** on the account detail panel. Briefs are **template-generated** from account fields, ICP metadata, signals, and linked deal count. There is **no OpenAI or external LLM call**. Humans generate (OPERATOR+) and mark reviewed (ADMIN only). All actions are audited.

---

## Scope delivered

| Area | Path | Notes |
|------|------|-------|
| Lib | `src/lib/sales/agents/account-research.ts` | `runAccountResearchStub`, `markAccountResearchReviewed`, metadata readers |
| Actions | `src/actions/sales-actions.ts` | `generateAccountResearchAction`, `markAccountResearchReviewedAction`, `getAccountResearchAction` |
| UI | `src/components/sales/account-research-panel.tsx` | Generate + ADMIN review |
| Account detail | `src/app/sales/accounts/[id]/page.tsx` | “Research brief” sidebar card |
| Audit | `sales.agent.research_generated`, `sales.agent.research_reviewed` | SalesAuditEvent + platform logger |
| Tests | `src/lib/sales/__tests__/sales-account-research.test.ts` | Unit coverage |

**Not in scope:** conversion memo, audit-trail edits, external AI APIs.

---

## Data model (metadata)

```json
{
  "agentRuns": {
    "accountResearch": {
      "brief": "string (Arabic template markdown)",
      "sources": [
        {
          "type": "account_field|signal|icp|deal_count",
          "label": "string",
          "ref": "string|null",
          "value": "string|number|null"
        }
      ],
      "confidence": 0,
      "status": "draft_pending_review|reviewed",
      "generatedAt": "ISO8601",
      "generatedById": "userId",
      "generatedByName": "string|null",
      "reviewedAt": "ISO8601|null",
      "reviewedById": "userId|null",
      "reviewedByName": "string|null"
    }
  }
}
```

**No migration** — metadata-only stub (same pattern as signals / outreach).

---

## RBAC matrix

| Action | VIEWER | OPERATOR | ADMIN |
|--------|--------|----------|-------|
| View brief | ✓ | ✓ | ✓ |
| Generate / regenerate | | ✓ | ✓ |
| Mark reviewed | | | ✓ |

---

## Template logic (no LLM)

- **Brief sections:** overview (name, industry, status, deal count), ICP line, top signals, static recommendation bullets, stub disclaimer.
- **Sources:** account fields, up to 5 signals, ICP score when configured, deal count when > 0.
- **Confidence:** heuristic 0–85 from industry, ICP, signal count, deals (capped — never claims full certainty without human review).

---

## Audit events

| Action key | When |
|------------|------|
| `sales.agent.research_generated` | OPERATOR+ runs generate |
| `sales.agent.research_reviewed` | ADMIN marks reviewed |

Both write to `SalesAuditEvent` (lib) and platform audit logger (server actions).

---

## Validation

| Check | Result |
|-------|--------|
| Unit tests | `sales-account-research.test.ts` — generate, read, ADMIN gate, audit calls |
| External LLM | **Not used** |
| Browser smoke | **Not run** (not validated) |

---

## Arabic one-liner

**موجز بحث الحساب — قالب محكوم من حقول الحساب والإشارات، بانتظار مراجعة ADMIN، دون أي استدعاء LLM خارجي.**

---

## Known limitations

- Regenerating overwrites the prior brief (no version history).
- Brief quality is template-only; not a substitute for human research.
- Confidence is a stub heuristic, not probabilistic inference.
