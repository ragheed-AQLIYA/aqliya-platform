# Human Smoke Checklist

1. `/local-content` — command center
2. Create project + campaign
3. Add source + content item
4. Draft assist (AI)
5. Submit review, approve (ADMIN)
6. Create + export output package

## Agent 14 execution log (2026-06-01)

| # | Step | Status |
|---|------|--------|
| 1 | Command center | **PASS** |
| 2 | Create project + campaign | **PASS** |
| 3 | Source + item | **PASS** |
| 4 | Draft assist | **PASS** |
| 5 | Review + approve | **PASS** (with Glass MCP automation caveat) |
| 6 | Output export | **PASS** |

**Credentials (seed):** `admin@aqliya.com` / `admin123`  
**Details:** `agent-14-smoke-results.md`  
**Step-by-step guide:** `localcontentos-smoke-steps-3-6-manual.md`

## Worker 2 — L6 smoke closure (2026-06-01)

Single-session pass on `:3001` (Worker 2 E2E). Session: in-page credentials `fetch` when Glass login inputs fail; use `?refresh=1` on review/outputs if counts stale.

| # | Step | Status | Worker 2 evidence |
|---|------|--------|-------------------|
| 1 | Command center | **PASS** | Browser `/local-content` — **مركز القيادة** |
| 2 | Project + campaign | **PASS** | Existing `Smoke Campaign 3-6` (`cmpuhodmc0000popq7524zwlc`) |
| 3 | Source + item | **PASS** | `csrc_mpulibib_su7s4gp`, `citem_mpulibpz_eb760wn` (`L6 Smoke Article 280451`) |
| 4 | Draft assist | **PASS** | Body + `aiGenerated=true` on item |
| 5 | Review + approve | **PASS** | Browser dimension checkboxes + **تسجيل مراجعة** → `crev_mpulmiwi_nzagcrh`; ADMIN approve → `cappr_mpulobgg_kmya6z1`, item `approved` |
| 6 | Output export | **PASS** | Browser **L6 Smoke Step 6 Pack** → **مُصدّر** |

**Classification:** Light validated — not production-ready.
