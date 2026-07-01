# SalesOS v0.3 PR-21b — Institutional Memory (Account Metadata)

**Workstream:** L6 PR-21b — `salesos_p21b_institutional_memory`  
**Date:** 2026-06-01  
**Validation:** light validated (targeted Jest in `sales-institutional-memory.test.ts`)

---

## Goal

Append-only institutional memory on `SalesAccount.metadata.institutionalMemory[]` — entries: `type`, `summary`, `sourceRef`, `actorId`, `at`. Built from org-scoped audit events, deal review decisions, and ICP human review. Read-only timeline on account detail; sync after governance review or ICP reviewed. **No Prisma migration.**

---

## Storage

| Field | Shape |
|-------|--------|
| `metadata.institutionalMemory[]` | Append-only; max 100 per account; dedupe by `sourceRef` |

| `type` | Source |
|--------|--------|
| `audit` | `SalesAuditEvent` (curated actions on account + account deals) |
| `review_decision` | `SalesDeal.metadata.reviewDecisions[]` |
| `icp_review` | `metadata.icpScore` when `reviewed === true` |

| `sourceRef` examples | |
|---------------------|---|
| `audit:{eventId}` | |
| `review:{dealId}:{decisionId}` | |
| `icp-review:{accountId}:{reviewedAt}` | |

---

## Files

| Path | Role |
|------|------|
| `src/lib/sales/institutional-memory.ts` | read/append, build candidates, `syncInstitutionalMemoryForAccount` |
| `src/components/sales/account-institutional-memory-timeline.tsx` | Read-only RTL timeline |
| `src/app/sales/accounts/[id]/page.tsx` | Sidebar card |
| `src/lib/sales/governance.ts` | Sync hook after `recordReviewDecision` |
| `src/lib/sales/agents/icp-fit.ts` | Sync hook after `setAccountIcpReviewed(reviewed: true)` |
| `src/lib/sales/__tests__/sales-institutional-memory.test.ts` | Unit tests |

---

## Sync hooks (minimal)

1. **`recordReviewDecision`** — after audit write, `syncInstitutionalMemoryForAccount(deal.accountId, scope)` (try/catch, non-blocking).
2. **`setAccountIcpReviewed`** — when `reviewed === true`, same sync for the account.

No sync on account page load (entries appear after governed events).

---

## Not changed

- Prisma schema / migrations
- Deal-level memory store (account-scoped only)
- Full audit trail UI

---

## Validation

| Check | Result |
|-------|--------|
| `jest src/lib/sales/__tests__/sales-institutional-memory.test.ts` | **Run locally** (low-load: not executed in agent session unless approved) |
| Prisma migration | **No** |
| Browser / full build | **Not run** |

---

## Usage

1. Open `/sales/accounts/{id}` — **الذاكرة المؤسسية** card (read-only).
2. Record a deal review decision or mark ICP reviewed — memory syncs on next action.
3. Entries show type badge, Arabic summary, timestamp, and `sourceRef`.

---

## Arabic one-liner

**ذاكرة مؤسسية مُلحقة على الحساب — تجمع قرارات المراجعة ومراجعة ICP وأحداث التدقيق في جدول زمني للقراءة فقط بدون ترحيل قاعدة البيانات.**
