# AQLIYA Product Status Matrix

| System | Type | Route(s) | Current Maturity | Has Workspace | Has DB Models | Has Server Actions | Has Audit Trail | Intended Status |
|---|---|---|---|---|---|---|---|---|
| **AQLIYA Company** | Company | `/`, `/about`, `/contact`, `/how-we-work` | Active | — | — | — | — | Active |
| **AuditOS** | System + Workspace | `/audit` (workspace), `/auditos` (demo) | Implemented with gaps | Yes | Yes — `Audit*` models | Yes — `audit-actions.ts`, `audit-read-actions.ts` | Yes — `AuditEvent` | Active primary product |
| **DecisionOS** | System + Workspace | `/decisions`, `/organizations`, `/intelligence/sectors` | Implemented | Yes | Yes — non-prefixed models | Yes — `decisions.ts`, `approval.ts`, etc. | Yes — `AuditLog` | Active adjacent system |
| **SalesOS** | Prototype | `/sales` | Static dashboard | Shell only | No | No | No | Adjacent system (future) |
| **SimulationOS** | Marketing-only | `/products/simulation` | Marketing page only | No | No | No | No | Future |
| **Local Content OS** | Marketing-only (strategic second product) | `/products/local-content` | Marketing page only | No | No | No | No | Strategic second product (future) |
| **Custom Product Inquiry** | Company funnel | `/custom-product`, `/api/custom-product-submit` | Implemented | — | — | Yes — API route | No | Active |
| **AQLIYA Intelligence Core** | Platform layer | — | Phase 3B deterministic wiring complete | — | — | — | — | Active platform foundation |
| **AQLIYA Studio** | Custom systems layer | — | Future | — | — | — | — | Strategic (future) |

## AuditOS Known Gaps

All P0 items are closed (Phases 1-4). Known gaps limited to:

- Jest integration tests require PostgreSQL (Docker Compose setup available)
- Pre-existing ESLint warnings/errors in pre-existing DecisionOS/shared code (count varies by lint run; documented in `PRODUCT_STATUS_MATRIX.md`)
- Backup not automated (manual only)
- Production file scanner not integrated
