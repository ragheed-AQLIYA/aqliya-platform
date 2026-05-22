# Sunbul — LEGACY CODE (Now WorkflowOS)

**Status:** ⚠️ Legacy naming — preserved code only
**Correction date:** 2026-05-19
**See instead:** `docs/product/workflowos/README.md`

---

## Correction Notice

The code in `src/` under `sunbul/` and the database models prefixed `Sunbul*` were originally built under the name "Sunbul" as a product.

This was a **naming error**.

### Correct definitions

| Concept | Correct Definition | Current Code Name |
|---------|-------------------|-------------------|
| The workflow/case product | **WorkflowOS** | `Sunbul` (legacy prefix) |
| The client organization | **Sunbul** (an AQLIYA client) | Not yet modeled as org |
| Clients within WorkflowOS | **Workflow Clients** | `SunbulClient` (legacy) |

### What this means for this directory

All documents in `docs/product/sunbul/` describe the WorkflowOS product under the old name. The code, tests, and functionality are valid — only the naming is incorrect.

### Migration plan

See `docs/architecture/aqliya-client-organization-model.md` for the full migration strategy.

Phases:
1. ✅ Documentation + UI labels corrected (current phase)
2. ⬜ Route rename: `/sunbul/*` → `/workflowos/*`
3. ⬜ Model rename: Prisma `Sunbul*` → `Workflow*`
4. ⬜ Code symbol rename throughout

---

## What Sunbul (the code) Actually Is

A **governed case/workflow management system** (WorkflowOS) designed to serve multiple internal clients using a repeatable core workflow, with strict data isolation, role-based access, audit trails, and human-in-the-loop governance for every output.

See `docs/product/workflowos/README.md` for the up-to-date product description.
