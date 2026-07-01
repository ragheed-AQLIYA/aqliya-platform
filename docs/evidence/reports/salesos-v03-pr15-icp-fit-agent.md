# SalesOS v0.3 PR-15 — ICP Fit Agent Stub (Rules, No LLM)

**Workstream:** L6 PR-15 — `salesos_p15_icp_fit_agent`  
**Date:** 2026-06-01  
**Validation:** light validated (targeted Jest in `sales-icp-fit-agent.test.ts`)

---

## Goal

Rules-based ICP fit scoring from `icp-types` segment rules + account `industry` / `metadata.segment` — **no LLM**, **no Prisma migration**. Persists to `metadata.icpScore` with `agentGenerated: true`, `reviewed: false`, and records `sales.agent.icp_scored`.

---

## Changes

### 1. `src/lib/sales/icp-types.ts`

| Export | Role |
|--------|------|
| `ICP_SEGMENT_RULES` | Keyword-based segment rules (ICP-1 … ICP-5) |
| `readAccountSegmentHint(metadata)` | Reads `metadata.segment` or `metadata.icpScore.segment` |
| `AccountIcpScore` extensions | `agentGenerated`, `reviewed`, `reasoning`, review audit fields |

### 2. `src/lib/sales/agents/icp-fit.ts`

| Export | Role |
|--------|------|
| `computeIcpFitStub(account)` | Pure rules → `{ score, reasoning[], confidence }` |
| `recalculateAccountIcpFit(accountId, scope, actor)` | Writes `metadata.icpScore`, audits `sales.agent.icp_scored` |
| `setAccountIcpReviewed(...)` | Toggles `reviewed` on existing agent score |

### 3. `src/components/sales/account-icp-panel.tsx`

- **Recalculate (rules)** button (OPERATOR+ / `salesos:update`)
- Review checkbox for agent-generated scores
- Reasoning list + agent-generated badge

### 4. `src/actions/sales-actions.ts`

- `recalculateAccountIcpFitAction`
- `setAccountIcpReviewedAction`

### 5. `src/lib/sales/audit-events.ts`

- `AGENT_ICP_SCORED: "sales.agent.icp_scored"`

### 6. `src/lib/sales/__tests__/sales-icp-fit-agent.test.ts`

- Rules scoring, persistence, audit, review toggle

---

## Not changed (per constraints)

- `src/lib/sales/agents/account-research.ts` (PR-14 parallel workstream)
- Prisma schema / migrations
- LLM / external API calls

---

## Validation

| Check | Result |
|-------|--------|
| `jest src/lib/sales/__tests__/sales-icp-fit-agent.test.ts` | **Run locally** (low-load: not executed in agent session unless approved) |
| Prisma migration required | **No** — JSON metadata only |
| Full build / browser | **Not run** (low-load protocol) |

---

## Usage

1. Open `/sales/accounts/{id}` as OPERATOR+.
2. Click **Recalculate (rules)** to score from industry + segment hints.
3. Check **Mark reviewed** after human validation of the rules output.

---

## Arabic one-liner

**وكيل ICP قواعدي بدون LLM — يحسب الملاءمة من القطاع والشريحة ويخزّنها في metadata مع مراجعة بشرية.**
