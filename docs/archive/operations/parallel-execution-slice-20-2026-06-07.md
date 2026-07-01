# Slice 20 — IC ingestion migrations + XL integration scope docs

**Date:** 2026-06-07

## Delivered

| ID | Deliverable |
| -- | ----------- |
| **IC** | Migration `20260608000001` embedding_json fallback column |
| **IC** | Migration `20260608000002` IngestionBatch + IngestionDocument tables |
| **DOC** | S7-03 CRM + LC-08 ERP integration scope (honest XL, not implemented) |

## Validation

| Command | Result |
| ------- | ------ |
| `npm test` ingestion + embedding | 17 passed (on main code) |

**Operator:** `npx prisma migrate deploy` on each environment.

**Status:** DONE_WITH_CONCERNS — schema models already on main; migrations were missing from repo
