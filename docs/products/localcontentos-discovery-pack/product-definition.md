# LocalContentOS — Product Definition

**Status:** Discovery / Planned (not implemented)
**Version:** 1.0 — Discovery Pack
**Belongs to:** AQLIYA product family
**Depends on:** AQLIYA Intelligence Core (shared platform layer)

---

## Product Name

**English:** LocalContentOS
**Arabic:** نظام المحتوى المحلي (نظام إدارة وقياس المحتوى المحلي)

---

## One-Liner

A governed local content measurement, evidence, workflow, and reporting system built on the AQLIYA platform.

**Arabic:** نظام حوكمة وقياس المحتوى المحلي يعمل على منصة عقلية.

---

## What It Is

LocalContentOS is the **second strategic product** under AQLIYA. It helps organizations:

- Measure and track local content in procurement and supply chains
- Classify suppliers and spend by locality (local vs. non-local)
- Attach evidence to support local content claims
- Run review and approval workflows on local content calculations
- Generate local content reports for internal management, compliance, or tender readiness
- Maintain an auditable trail of local content decisions and evidence

It follows the AQLIYA trust principle:

> AI assists. Humans decide. Evidence governs.

---

## What It Is NOT

- NOT a regulatory submission system (e.g. direct LCGPA integration)
- NOT an official local content calculation engine with binding legal formulas
- NOT a replacement for statutory reporting to government entities
- NOT a procurement ERP or contract management system
- NOT a generic AI chatbot
- NOT implemented — this is a product discovery and pilot preparation document

---

## Target Customers

- Large Saudi private companies with local content obligations
- Government and semi-government suppliers
- Procurement-heavy organizations
- Companies working under Saudi Vision 2030 local content requirements
- CFOs, procurement directors, compliance officers, local content officers

---

## Core Problem

Organizations that operate in Saudi Arabia need to measure, report, and improve their local content contribution. Currently they rely on:

- **Excel** — error-prone, no audit trail, no workflow, no governance
- **Generic ERP filters** — limited to basic spend classification without local content logic
- **Manual reviews** — slow, inconsistent, no evidence linking
- **Scattered files** — invoices, contracts, supplier data, certificates stored across different systems with no unified view

There is no governed workflow system that connects supplier data, procurement spend, evidence, review, approval, and reporting in one place.

---

## Product Promise

LocalContentOS gives organizations a single governed workspace to:

1. Upload procurement and supplier data
2. Classify spend and suppliers by local content criteria
3. Attach and manage supporting evidence
4. Run structured review and approval workflows
5. Export local content reports with full audit trail
6. Track local content performance across reporting periods

---

## Why Now

- Saudi Vision 2030 drives increasing local content requirements across all sectors
- Government and semi-government entities increasingly demand local content reporting from suppliers
- Organizations are looking for structured, governed tools — not spreadsheets
- The Saudi local content ecosystem is maturing, and companies need to prepare for more formal measurement and reporting
- AQLIYA already has the governance, workflow, evidence, and audit engines needed to build this product

---

## Why AQLIYA Can Build It

- **Existing platform engines:** governance, workflow, evidence linking, audit logs, RBAC, reporting/export
- **Existing product experience:** AuditOS proves the platform can deliver governed institutional intelligence
- **Arabic-first bilingual platform:** natural fit for the Saudi market
- **Cloud + Private dual deployment:** serves both commercial and sensitive sectors
- **Trust principle:** AI assists, humans decide, evidence governs — directly applicable to local content governance

The product does not need to be built from scratch. It reuses the AQLIYA Intelligence Core and adds LocalContentOS-specific domain logic.

---

## Relationship to AQLIYA Core

LocalContentOS is built **on top of** the AQLIYA Intelligence Core:

| Core Engine           | Role in LocalContentOS                                                |
| --------------------- | --------------------------------------------------------------------- |
| Governance Engine     | Review stages, approval workflow, escalation policies                 |
| Workflow Engine       | State machine (Draft → Review → Approval → Locked → Export)           |
| Evidence Graph        | Link every classification, exception, and override to source evidence |
| RBAC                  | Organization-level roles, workspace permissions                       |
| Audit Logs            | Immutable trail of all actions, reviews, approvals, and exports       |
| Reporting Engine      | PDF/XLSX export of local content reports                              |
| Document Intelligence | Supplier certificate parsing, invoice OCR (partial)                   |

---

## Relationship to AuditOS

| Dimension         | AuditOS                                               | LocalContentOS                                            |
| ----------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| Priority          | Primary (pilot-ready)                                 | Second strategic product                                  |
| Status            | Active workspace with code                            | Discovery / planned — no code                             |
| Domain            | Financial audit & assurance                           | Local content measurement & governance                    |
| Data              | Trial balances, accounts, statements                  | Vendor lists, procurement spend, supplier classification  |
| Workflow          | Engagement → Mapping → Statements → Review → Approval | Upload → Classify → Evidence → Review → Approval → Export |
| Independence      | Fully independent product                             | Fully independent product                                 |
| Shared foundation | AQLIYA Intelligence Core                              | AQLIYA Intelligence Core                                  |

Both products are independent. They share the platform layer but do not depend on each other.

---

## Current Status

- **Implementation:** None
- **Workspace route:** None
- **Database models:** None
- **Server actions:** None
- **UI components:** None
- **Demo:** None
- **Pilot:** None

LocalContentOS is in **discovery and pilot preparation** phase. This document is part of the product discovery track and does not represent an implemented system.
