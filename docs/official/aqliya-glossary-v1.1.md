# AQLIYA Glossary v1.1

**Version:** 1.1  
**Status:** Official terminology reference aligned to v0.1 operational baseline  
**Last Reviewed:** 2026-06-29  
**Note:** Product/system definitions updated to reflect L5 pilot-ready implementation status for SalesOS, LocalContactOS, RiskOS, Institutional Memory, and Local AI Provider (L4 pilot) per v0.1 operational baseline. ContentStudio and Knowledge Foundation entries added per Knowledge Governance Sprint v1 Wave 3A.

---

## Company and Platform Terms

| Term                         | Definition                                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **AQLIYA**                   | The parent company and platform brand. A Private Governed Institutional Intelligence Platform.                               |
| **AQLIYA Intelligence Core** | Shared platform layer for governance, workflow, AI orchestration, permissions, audit logs, document handling, and reporting. |
| **AQLIYA Cloud**             | Current implemented deployment model.                                                                                        |
| **AQLIYA Private / On-Prem** | Strategic future deployment model. Not implemented as a production package.                                                  |
| **AQLIYA Studio**            | Strategic custom-systems builder layer. Not implemented.                                                                     |

---

## Runtime Surface Terms

| Term                             | Definition                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Product / System**             | A named operational system with route, data model, and workflow purpose.                        |
| **Shared Application**           | A governed application built on AQLIYA Core, real in code, but not a standalone product family. |
| **Custom Workspace**             | A real governed workspace for a client-specific or custom workflow.                             |
| **Demo**                         | Guided, read-only, mock-backed experience.                                                      |
| **Prototype / Internal Preview** | Route or surface that exists but is not a complete v0.1 operational module.                     |
| **Strategic / Future**           | Planned direction with no implemented operational surface.                                      |

---

## Product and System Terms

| Term                    | Definition                                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AuditOS**             | The first proof product under AQLIYA. Real, governed, and pilot-ready candidate.                                                                                                                                                                                                                                                                    |
| **DecisionOS**          | Real active adjacent decision-governance system under AQLIYA.                                                                                                                                                                                                                                                                                       |
| **Office AI Assistant** | Real governed shared application for work-assistant tasks. Not a standalone product and not a generic chatbot.                                                                                                                                                                                                                                      |
| **WorkflowOS**          | Canonical governed custom/client-specific workspace at `/workflowos/*` (L4 usable v0.1). Real CRUD, workflow states, audit trail, PDF export.                                                                                                                                                                                                       |
| **Sunbul**              | Legacy redirect alias to WorkflowOS only. `/sunbul/*` routes are `permanentRedirect(302)` to matching `/workflowos/*` routes. Not a separate product, surface, or workspace.                                                                                                                                                                        |
| **SalesOS**             | Governed commercial intelligence workspace at /sales/* (L5 Pilot-ready). Pipeline, deals, accounts, ICP, intelligence, audit trail, seed data. See PRODUCT_STATUS_MATRIX.md for details.                                                                                                                                                                                                                                                               |
| **LocalContentOS**      | Strategic second product. Pilot-ready with conditions / usable v0.1 (L5). Workspace at `/local-content/*` (12 routes), server actions, seed data, bilingual UI, evidence upload, review/approval, binary PDF/XLSX exports (pdfkit + xlsx), audit trail. Mutation feedback loop verified (2026-05-23). See `AQLIYA_MASTER_REFERENCE.md` for details. |
| **SimulationOS**        | Marketing/category label today; not a standalone implemented product.                                                                                                                                                                                                                                                                               |
| **LocalContactOS**      | Governed relationship workspace at /contacts/* (L5 Pilot-ready). Contact registry, sensitivity levels, interaction history, risk flags, compliance export, audit trail. See PRODUCT_STATUS_MATRIX.md for details.                                                                                                                                                                                                                                                                             |
| **ContentStudio**       | Content workspace subsystem within LocalContentOS. Provides content creation, versioning, templates, and publishing workflow. Routes exist, Prisma models exist, seed data exists. AQLIYA Product Taxonomy status: see PRODUCT_STATUS_MATRIX.md.                                                                                                      |
| **Knowledge Foundation**| Governance capability under AQLIYA Intelligence Core. Provides knowledge versioning, diff tracking, integrity verification (SHA-256), and release management for institutional knowledge assets. Routes exist, Prisma models exist, seed data exists. AQLIYA Product Taxonomy status: see PRODUCT_STATUS_MATRIX.md.                                      |
| **RiskOS**              | AuditOS-adjacent risk workspace at /risk/* (L5 Pilot-ready). Dashboard, assessment detail, procedure tracking, audit trail, JSON export. Not marketed as standalone product. See PRODUCT_STATUS_MATRIX.md for details.                                                                                                                                                                                                                                                                                                   |
| **ComplianceOS**        | Future compliance system. Not implemented.                                                                                                                                                                                                                                                                                                          |
| **LegalOS**             | Future legal intelligence assistant. Not implemented.                                                                                                                                                                                                                                                                                               |
| **GovOS**               | Future government institutional intelligence system. Not implemented.                                                                                                                                                                                                                                                                               |

---

## Governance and AI Terms

| Term                     | Definition                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Evidence Graph**       | Cross-reference idea for linking outputs to sources. Partially real in AuditOS, not yet a full cross-product engine. |
| **Governance Engine**    | Shared runtime for approval, escalation, provenance, and review rules.                                               |
| **Audit Logs**           | Domain and platform logs that capture who did what, when, and in what context.                                       |
| **Model Governance**     | Strategic future model registry and policy layer. Not implemented.                                                   |
| **Institutional Memory** | Cross-product entity linking workspace at /institutional-memory/* (L5 Pilot-ready). Knowledge graph visualization, event linking, collections, export. See PRODUCT_STATUS_MATRIX.md for details.                                                                     |
| **Local AI Provider**    | Local AI pilot runtime (L4 pilot with conditions). Ollama REST + hybrid routing via ADR-001 Cycle 2. Operator Ollama endpoint required. See PRODUCT_STATUS_MATRIX.md for details.                                                               |

---

## Release Terms

| Term                                        | Definition                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| **Included in v0.1**                        | Part of the first complete usable platform release scope.                 |
| **Included as pilot-ready product**         | Usable and suitable for controlled pilot/demo with product framing.       |
| **Included as active adjacent system**      | Real and included, but not the primary proof product.                     |
| **Included as governed shared application** | Real and included, but classified below standalone product level.         |
| **Included as custom/internal workspace**   | Real and included, but custom/internal in positioning.                    |
| **Included as demo only**                   | Visible in release scope as a demo surface only.                          |
| **Do not claim as live**                    | May exist in docs or marketing, but must not be presented as implemented. |
