# SalesOS v0.3 PR-16 — Objection Analysis Agent Stub (Rules, No LLM)

**Workstream:** L6 PR-16 — `salesos/pr16-agent-objection-analysis`  
**Date:** 2026-06-01  
**Validation:** light validated (targeted Jest in `sales-objection-analysis.test.ts`)

---

## Goal

Rules-based objection categorization from deal interaction text or pasted objection copy — **no LLM**, **no Prisma migration**. Persists runs to `deal.metadata.agentRuns.objectionAnalysis[]` with `status: draft_pending_review`, template `suggestedResponse`, and `confidence`. Records `sales.agent.objection_analyzed`.

---

## Changes

### 1. `src/lib/sales/agents/objection-analysis.ts`

| Export | Role |
|--------|------|
| `OBJECTION_CATEGORY_RULES` | Keyword rules (price, timing, authority, need, trust, competition, compliance, integration, ai_replacement, other) |
| `computeObjectionAnalysisStub(text)` | Pure rules → category, template response, confidence |
| `readObjectionAnalysisRuns(metadata)` | Reads `agentRuns.objectionAnalysis[]` |
| `runObjectionAnalysisStub(context, dealId, input)` | Resolves text from `interactionId` or `pastedText`, persists run, audits |

### 2. `src/components/sales/deal-objection-analysis-panel.tsx`

- Deal panel: list prior runs + analyze from pasted text or selected interaction
- OPERATOR+ / `salesos:update` required to analyze

### 3. `src/actions/sales-actions.ts`

- `analyzeDealObjectionAction(dealId, { interactionId?, pastedText? })`
- `listDealObjectionAnalysisAction(dealId)`

### 4. `src/app/sales/deals/[id]/page.tsx`

- **تحليل الاعتراضات (PR-16)** card with `DealObjectionAnalysisPanel`

### 5. `src/lib/sales/audit-events.ts`

- `AGENT_OBJECTION_ANALYZED: "sales.agent.objection_analyzed"`

### 6. `src/lib/sales/__tests__/sales-objection-analysis.test.ts`

- Pure categorization, metadata array persistence, interaction path, validation, audit

---

## Data model (metadata)

```json
{
  "agentRuns": {
    "objectionAnalysis": [
      {
        "id": "uuid",
        "category": "price",
        "categoryLabelAr": "السعر",
        "suggestedResponse": "…",
        "confidence": 72,
        "status": "draft_pending_review",
        "sourceText": "excerpt…",
        "interactionId": "int-id-or-null",
        "matchedKeywords": ["price", "budget"],
        "analyzedAt": "ISO8601",
        "analyzedById": "userId",
        "analyzedByName": "Name"
      }
    ]
  }
}
```

**No migration** — JSON metadata only on `SalesDeal`.

---

## Not changed (per constraints)

- `deal-risk`, follow-up agents, integrator docs
- Prisma schema / migrations
- LLM / external API calls

---

## Validation

| Check | Result |
|-------|--------|
| `jest src/lib/sales/__tests__/sales-objection-analysis.test.ts` | **Run locally** (low-load: executed in agent session) |
| Prisma migration required | **No** |
| Full build / browser | **Not run** (low-load protocol) |

---

## Usage

1. Open `/sales/deals/{id}` as OPERATOR+.
2. In **تحليل الاعتراضات (PR-16)**, paste objection text or pick an interaction.
3. Click **تحليل الاعتراض** — review category + template response before customer use.

---

## Arabic one-liner

**وكيل تحليل اعتراضات قواعدي بدون LLM — يصنّف النص ويقترح رداً قالبياً على الصفقة بانتظار مراجعة بشرية.**
