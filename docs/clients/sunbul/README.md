# Sunbul — Client Organization

**Status:** Defined as organization/client (correction from product misclassification)
**Date:** 2026-05-19
**Parent Ecosystem:** AQLIYA

---

## Definition

Sunbul is a **client organization** that uses AQLIYA products.

Previously, the name "Sunbul" was incorrectly used for the WorkflowOS product. This document corrects that: Sunbul is the company/client, not the product.

---

## Products Enabled

| Product | Status | Notes |
|---------|--------|-------|
| WorkflowOS | ✅ Active | Internal pilot active — route: `/workflowos` |
| AuditOS | ⬜ Planned | Not yet enabled |
| DecisionOS | ⬜ Planned | Not yet enabled |
| SalesOS | ⬜ Planned | Product not yet implemented |
| Other products | ❌ Disabled | Future |

---

## Employees

| Name | Email | Role |
|------|-------|------|
| Ahmed Al-Mansouri | admin@aqliya.com | Platform Admin (ADMIN) |
| Sara Al-Otaibi | sara@aqliya.com | Operator (OPERATOR) |
| Mohammad Al-Harbi | mohammad@aqliya.com | Viewer (VIEWER) |

---

## WorkflowOS Access

Within WorkflowOS, Sunbul operates through product-level clients (SunbulClient records). Each client represents an internal unit or case type with isolated data.

Pilot clients:
- `sunbul-pilot-client` — created by `scripts/seed-sunbul-pilot.ts`

---

## Technical Notes

- Sunbul is not yet modeled as a dedicated `Organization` record in the database
- Users are currently assigned to the default AQLIYA Demo Organization
- Multi-organization support is a future capability
- See `docs/architecture/aqliya-client-organization-model.md` for the full model

---

## Seed

```bash
# Prerequisites
npx tsx prisma/seed.ts

# Seed Sunbul as organization reference
npx tsx scripts/seed-sunbul-organization.ts
```
