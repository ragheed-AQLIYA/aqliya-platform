# AQLIYA Roadmap v1.1

**Version:** 1.3 (updated to reflect P0 fixes + pilot launch tooling — 2026-07-28)  
**Status:** Active — status-aligned  
**Note:** All 12 active products now at L5 Pilot-ready (conditional) per P0 governance freeze ADR-109. P0 production blockers fixed (CRM tenant isolation, health endpoint, CSP). Pilot launch tooling complete. Remaining enterprise gates: pentest, IaC apply — contract-gated. Audit log consolidation (8→1 PlatformAuditLog) completed 2026-07-25. GO/NO-GO: CONDITIONAL GO (21/23 BLOCKING).

---

## Phase Summary

| Phase | Name                      | Status               | Reality Note                                                                                                                                                                                                                         |
| ----- | ------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | AQLIYA Core Stabilization | Completed            | L5 Pilot-ready (conditional). All Tier 2/3 gaps closed.                                                                                                              |
| 2     | AuditOS                   | L5 Pilot-ready (conditional) | 8 engines (ISQM1, Materiality, Client Acceptance, Independence, Working Papers, Review Notes SLA, Sampling Hardening, Knowledge Engine). Full error boundaries.  |
| 3     | DecisionOS                | **L6 Production-hardened** | Signal automation, sector intelligence, cross-decision pattern analysis, outcome correlation. 22 route segments with full boundaries. 151 tests. |
| 4     | Office AI Assistant       | L5 Pilot-ready (conditional) | 248 tests, 6 task types, full boundaries. |
| 5     | Reality Hardening         | Completed            | Sensitive APIs protected, prototypes labeled, test stack repaired. |
| 5b    | Audit Log Consolidation   | Completed (2026-07-25) | All 8 legacy product audit models consolidated into single PlatformAuditLog with productKey field. |
| 6     | v0.1 Scope Lock           | Completed            | All products at L5 code-level (L6 suspended per ADR-109 except DecisionOS). |
| 7     | LocalContentOS            | L5 Pilot-ready (conditional) | All 9 LC gaps closed. 27 routes with full boundaries. 265+ tests. AI quality: 100% readiness (7/7 GREEN), 95% acceptance, 88% confidence gradient. Arabic PDF font fidelity (Noto Naskh Arabic). ERP integration (SAP/Oracle/CSV). |
| 8     | Private / On-Prem Package | Strategic            | Not implemented. Contract-gated. |
| 9     | AQLIYA Studio             | Strategic            | Not implemented. |
| 10    | SalesOS                   | L5 Pilot-ready (conditional) | All 8 S7 gaps closed. 32 routes with full boundaries. Intelligence hub (12 sub-engines), forecasting, CRM sync (HubSpot/Salesforce), funnel analytics. 45 test files PASS. |
| 10a   | LocalContactOS            | L5 Pilot-ready (conditional) | Full contact registry, risk flags, compliance export, audit trail. 9 routes with full boundaries. 15 integration tests PASS. |
| 11    | RiskOS                    | L5 Pilot-ready (conditional) | Dashboard, assessment detail, procedure tracking, audit trail, JSON export. 4 routes with full boundaries. Not standalone product. |
| 12    | ContentStudio             | L5 Pilot-ready (conditional) | Content lifecycle, versioning, evidence linking, bilingual PDF export. 5 routes with full boundaries. ~125 tests. |
| 13    | Knowledge Foundation      | L5 Pilot-ready (conditional) | Version governance pipeline, SHA-256 release packages, diff engine, rollback, bilingual export. 87 tests PASS. |
| 14    | Institutional Memory      | L5 Pilot-ready (conditional) | Cross-product entity linking, D3.js graph, collections, JSON export. 4 routes with full boundaries. |
| 6     | Production Launch         | Target: Oct 2026     | Penetration test (external), Redis rate-limit + ClamAV verification, production IaC apply (code complete), SOC2 readiness program, ISO 27001 gap assessment, commercial pilot launch with AuditOS XO LocalContentOS wedge. |
| 15    | LegalOS + GovOS           | Future               | Not implemented. |

---

## Current v0.1 Scope Priorities

1. Audit log consolidation complete (2026-07-25). Single PlatformAuditLog with productKey scoping across all products.
2. Schedule external penetration test (last critical enterprise gate).
3. Apply Terraform IaC on live AWS (code complete, needs credentials).
4. Prepare for commercial pilot launch (Phase 6: target Oct 2026).

---

## Included in Current v0.1 Scope

- AQLIYA platform/company and public site
- AuditOS
- DecisionOS
- Office AI Assistant
- WorkflowOS as canonical governed workspace
- Sunbul as legacy redirect alias to WorkflowOS
- Platform audit logs (unified PlatformAuditLog — 8→1 model consolidation complete)
- Custom product inquiry funnel
- auditos guided demo as demo-only surface

---

## Not Included as Implemented Product Releases

- standalone SimulationOS
- ComplianceOS
- LegalOS
- GovOS
- AQLIYA Studio
- Private / On-Prem package
- Air-Gapped deployment
- Local AI runtime as L6 production package (L4 pilot connectivity exists)
- Model Governance registry (schema partial only)

---

## Next Execution Step After Scope Lock

**Phase 6 prep: pentest (schedule external), IaC apply (needs AWS credentials), production readiness audit. See Phase 6 target: Oct 2026 commercial pilot launch.**

---

## What to Avoid

- Overclaiming L6 as regulator-certified (products are L5 Pilot-ready conditional per ADR-109 governance freeze)
- Presenting workflowos as a distinct product without separate domain evidence
- Claiming On-Prem, Air-Gapped, Local AI, Studio, or Model Governance as live
