# SalesOS v0.3 PR-4 — Evidence Link Stub (`salesos_p1_evidence`)

**Status:** Implementation complete; migrate dev / generate not executed in this session  
**Product level after PR:** L4 partial + P1 evidence reference links  
**Validation classification:** light validated (prisma validate + targeted jest)

---

## 1. Objective

Minimal evidence link stub on SalesOS deal + account detail — references AQLIYA Core evidence patterns (DecisionEvidence, LocalContentEvidence, AuditEvidence via platform org). Not full Evidence product UI.

---

## 2. Core evidence inspection

| Pattern | Model | Org scope | Link style |
|---------|-------|-----------|------------|
| DecisionOS | `DecisionEvidence` | `organizationId` (Platform Organization) | Embedded on Decision |
| AuditOS | `AuditEvidence` + `AuditEvidenceLink` | Audit org → `platformOrganizationId` bridge | Generic `targetType` / `targetId` |
| LocalContentOS | `LocalContentEvidence` | Via `LocalContentProject.organizationId` | Embedded on project entities |

**No generic Platform Evidence API** exists. SalesOS stores join rows in `SalesEvidenceLink` and resolves display metadata from product-specific tables at link/list time.

---

## 3. Schema

New model `SalesEvidenceLink`:

- `organizationId`, `platformOrganizationId`
- `targetType` (`SalesDeal` | `SalesAccount`), `targetId`
- `dealId` / `accountId` (FK for cascade)
- `evidenceId`, `evidenceSource`, cached `label` / `evidenceType`
- Unique `(targetType, targetId, evidenceId)`

Migration file: `prisma/migrations/20260601160000_salesos_p1_evidence/migration.sql`  
**Not applied** in this session (`migrate dev` forbidden without approval).

---

## 4. Services (`src/lib/sales/`)

| Function | Purpose |
|----------|---------|
| `resolveEvidenceForSalesOrg` | Resolve evidence ref from Decision / LocalContent / Audit |
| `assertEvidenceAccessibleInSalesOrg` | Org guard before link |
| `listEvidenceLinksForDeal` | List + enrich for deal detail |
| `listEvidenceLinksForAccount` | List + enrich (read-only UI) |
| `linkEvidenceToDeal` / `unlinkEvidenceFromDeal` | Mutations + audit |
| `linkEvidenceToAccount` / `unlinkEvidenceFromAccount` | Implemented (no account UI form in P1) |
| `countEvidenceLinksForAccount` | Account header count |

Audit actions: `sales.evidence.linked`, `sales.evidence.unlinked` on `SalesAuditEvent`.

---

## 5. Actions (`src/actions/sales-actions.ts`)

- `listDealEvidenceLinksAction`
- `linkDealEvidenceAction`
- `unlinkDealEvidenceAction`
- `listAccountEvidenceLinksAction` (links + count)

Dual-write platform audit on deal link/unlink via `auditLogger`.

---

## 6. UI

| Route | Change |
|-------|--------|
| `/sales/deals/[id]` | Evidence panel: list linked refs (title/id/type), link form (evidence ID + optional source), unlink |
| `/sales/accounts/[id]` | Read-only evidence list + count |

No file upload. No evidence picker/search API (deferred).

---

## 7. Guards

- Deal/account must belong to user's `organizationId` (`assertSalesDealAccess` / service-level assert)
- Evidence must resolve in same org (Decision/LocalContent direct; Audit via `platformOrganizationId`)
- Cross-org link attempts throw before insert

---

## 8. Deferred / limitations

- No unified Evidence Core list/picker API — manual evidence ID entry only
- Account link/unlink UI not exposed (services ready)
- Stale links (evidence deleted) show stored label + unresolved flag
- Migration not applied; runtime requires human `migrate deploy` + optional `prisma generate`
- Not production-ready; stub slice only

---

## 9. Commands run

| Command | Result |
|---------|--------|
| `npx prisma validate` | See validation section |
| `npm test -- src/lib/sales/__tests__/sales-services.test.ts` | See validation section |

**Not run:** `migrate dev`, `generate`, `build`, full lint, full test suite.

---

## 10. Files changed

- `prisma/schema.prisma` — `SalesEvidenceLink` model
- `prisma/migrations/20260601160000_salesos_p1_evidence/migration.sql`
- `src/lib/sales/evidence-resolver.ts`
- `src/lib/sales/evidence-links.ts`
- `src/lib/sales/audit-events.ts`
- `src/actions/sales-actions.ts`
- `src/components/sales/deal-evidence-panel.tsx`
- `src/components/sales/account-evidence-list.tsx`
- `src/app/sales/deals/[id]/page.tsx`
- `src/app/sales/accounts/[id]/page.tsx`
- `src/lib/sales/__tests__/sales-services.test.ts`
- `docs/reports/salesos-v03-pr4-evidence.md`

---

## 11. Next PR suggestion

**`salesos_p1_interactions`**:

- Interaction log model + list on account/deal detail
- Next-action field on deal metadata with audit
- Optional seed demo evidence IDs for link smoke test after migration