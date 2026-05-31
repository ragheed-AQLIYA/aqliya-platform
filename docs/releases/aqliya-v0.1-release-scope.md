# AQLIYA v0.1 Release Scope

## 1. Release Definition

AQLIYA v0.1 is the **first complete usable platform release scope** for the repository as it exists today. It is not a production-hardened enterprise release. It is a governed, usable, validated scope that includes real implemented systems, shared applications, custom workspaces, and a public demo surface, while explicitly excluding future-only and prototype-only claims.

## 2. Included in v0.1

| System                           | Inclusion Status                        | Maturity       | Customer Demo Status          | Evidence                                                              | Notes                                       |
| -------------------------------- | --------------------------------------- | -------------- | ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| AQLIYA Platform                  | Included in v0.1                        | L4 Usable v0.1 | Safe to show with explanation | Platform routes, auth, governance, docs, validation                   | Platform scope, not one product             |
| AuditOS                          | Included as pilot-ready product         | L5 Pilot-ready | Safe to show                  | `/audit/*`, `Audit*` schema, actions, exports, audit trail            | First proof product                         |
| DecisionOS                       | Included as active adjacent system      | L4 Usable v0.1 | Safe to show with explanation | `/decisions/*`, decision schema/actions, approvals, reports, signals  | Real active adjacent system                 |
| Office AI Assistant              | Included as governed shared application | L4 Usable v0.1 | Safe to show with explanation | `/assistant/*`, `OfficeAi*` models, actions, platform audit logs      | Not a standalone product                    |
| WorkflowOS                       | Included as governed workspace          | L4 Usable v0.1 | Safe to show with explanation | `/workflowos/*`, `Sunbul*` Prisma models, export/storage/review flows | Canonical governed workflow workspace       |
| Sunbul                           | Legacy redirect alias over WorkflowOS   | Redirect alias | Internal only                 | `/sunbul/*` → `permanentRedirect(302)` to `/workflowos/*`             | Not a separate product or workspace         |
| Platform audit logs / governance | Included in v0.1                        | L4 Usable v0.1 | Internal only                 | `PlatformAuditLog`, governance runtime, diagnostics routes            | Internal operator-facing foundation         |
| Public marketing site            | Included in v0.1                        | L4 Usable v0.1 | Safe to show                  | `/`, `/products/*`, company pages                                     | Marketing only, not proof of implementation |
| Custom product inquiry           | Included in v0.1                        | L4 Usable v0.1 | Safe to show                  | `/custom-product`, `/api/custom-product-submit`                       | Commercial funnel                           |
| auditos guided demo              | Included as demo only                   | L1 Marketing   | Demo only                     | `/auditos/*`, explicit mock/demo data                                 | Must stay labeled demo                      |
| LocalContentOS                   | Included as pilot-ready with conditions | L5 Pilot-ready | Safe to show with explanation | `/local-content/*`, `LocalContent*` schema, server actions, seed data | Not L6; binary PDF/XLSX implemented (2026-05-25) |

## 3. Not Included as Implemented Products

| System                  | Current Status     | Why Not Included                                                | Allowed Claim                                | Forbidden Claim                           |
| ----------------------- | ------------------ | --------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| LocalContentOS L6 scope | L5 with conditions | Workspace and binary PDF/XLSX export exist; L6 hardening not complete | L5 pilot-ready with conditions / usable v0.1 | L6 production-ready; regulator-certified compliance export |
| SalesOS                 | L3 Prototype       | Static/prototype surface only, no backend workflow              | Prototype / internal preview                 | SalesOS product is implemented            |
| SimulationOS standalone | L1 Marketing       | No standalone product runtime; only category/marketing presence | DecisionOS contains simulation capability    | SimulationOS is a live product            |
| LocalContactOS          | L0 Concept         | No runtime implementation                                       | Future product                               | LocalContactOS is implemented             |
| RiskOS                  | L0 Concept         | No runtime implementation                                       | Future product                               | RiskOS is implemented                     |
| ComplianceOS            | L0 Concept         | No runtime implementation                                       | Future product                               | ComplianceOS is implemented               |
| LegalOS                 | L0 Concept         | No runtime implementation                                       | Future product                               | LegalOS is implemented                    |
| GovOS                   | L0 Concept         | No runtime implementation                                       | Future product                               | GovOS is implemented                      |
| AQLIYA Studio           | L0 Concept         | No builder/runtime implementation                               | Strategic layer                              | Studio is live                            |
| On-Prem                 | L0 Concept         | No production deployment package                                | Strategic deployment direction               | AQLIYA supports production On-Prem now    |
| Air-Gapped              | L0 Concept         | No air-gapped runtime/package                                   | Strategic deployment direction               | Air-Gapped is available                   |
| Local AI                | L0 Concept         | Local provider/runtime not implemented                          | Strategic future capability                  | Local AI runtime is available             |
| Model Governance        | L0 Concept         | No live registry/policy layer                                   | Strategic future capability                  | Model Governance is implemented           |
| Institutional Memory    | L0 Concept         | No implemented memory engine                                    | Strategic future capability                  | Institutional Memory is implemented       |

## 4. v0.1 Product Boundaries

- AQLIYA is the platform.
- AuditOS is the first proof product.
- DecisionOS is an active adjacent system.
- Office AI Assistant is a governed shared application.
- WorkflowOS is the canonical governed workflow workspace.
- Sunbul is a legacy redirect alias to WorkflowOS (`/sunbul/*` → `/workflowos/*`).
- SalesOS is prototype only and must not be sold as an implemented product.
- LocalContentOS is included as L5 pilot-ready with conditions (usable v0.1 workspace). Binary PDF/XLSX export is implemented (2026-05-25). Do not claim L6 production-hardened or regulator-certified export.

## 5. v0.1 Readiness Level

**Needs final QA**

Why:

- Validation is passing.
- Official docs and source-of-truth are now aligned to repository reality.
- Remaining work is release-readiness follow-through, not product expansion: operator visibility policy, warning review, commercial/demo discipline, and final release decision.

## 6. Commercial Truth Rules

Can say:

- AuditOS is real and pilot-ready.
- DecisionOS is real and active.
- Office AI Assistant is a governed shared application.
- WorkflowOS is a real governed workflow workspace (L4 Usable v0.1).
- LocalContentOS is a real L5 pilot-ready workspace (usable v0.1 with conditions; text/CSV and binary PDF/XLSX export).
- AQLIYA Cloud is active.

Cannot say:

- LocalContentOS is L6 production-hardened or regulator-certified.
- SalesOS is an implemented product.
- Sunbul is a separate product or workspace (it is a redirect alias only).
- On-Prem, Air-Gapped, or Local AI are live.
- AQLIYA Studio, Model Governance, or Institutional Memory are implemented.

## 7. Next Step

Run the final release-readiness review against the new checklist, then make a go/no-go decision for v0.1 release tagging.
