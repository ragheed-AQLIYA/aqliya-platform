# LocalContentOS — MVP Scope

**Status:** Specification only — not implemented
**Version:** 1.0

---

## MVP Objective

Build a governed workspace where an organization can import vendor and procurement data, classify suppliers and spend by local content criteria with evidence support, review exceptions, document findings, and generate management-ready reports — all with full audit trail and role-based access.

The MVP validates that the LocalContentOS workflow (as proven in analyst-led pilots) can be effectively supported by software on the AQLIYA platform.

---

## Non-Goals

- NOT a regulatory submission platform
- NOT an LCGPA-integrated system
- NOT an AI-only automatic classifier
- NOT a full enterprise procurement analytics system
- NOT an On-Prem or Air-Gapped deployment
- NOT a replacement for formal local content audits
- NOT a multi-language system beyond Arabic/English
- NOT a real-time ERP integration

---

## Target Users

| User                  | Role in System                                                   |
| --------------------- | ---------------------------------------------------------------- |
| Local Content Officer | Day-to-day operator — imports data, classifies, reviews evidence |
| Procurement Analyst   | Provides vendor and spend data, confirms classification          |
| Compliance Manager    | Reviews findings, ensures evidence adequacy                      |
| Procurement Director  | Management review, approves classifications and reports          |
| CFO / Executive       | View reports, make go/no-go decisions                            |
| System Admin          | Configure organization, manage users and roles                   |

---

## MVP Modules (13)

| #   | Module                          | Priority | Description                                                   |
| --- | ------------------------------- | -------- | ------------------------------------------------------------- |
| 1   | Organization / Engagement Setup | P0       | Create and configure LocalContentOS engagement for a customer |
| 2   | Reporting Period Setup          | P0       | Define the period, scope, and parameters                      |
| 3   | Vendor Master Import            | P0       | Upload and validate vendor list with locality attributes      |
| 4   | Procurement Spend Import        | P0       | Upload and validate transaction-level spend data              |
| 5   | Contract Register               | P1       | Upload and link contracts with LC commitments                 |
| 6   | Evidence Register               | P0       | Upload, link, and confidence-rate supporting evidence         |
| 7   | Classification Review           | P0       | Review and approve supplier/transaction classifications       |
| 8   | Exceptions and Findings         | P0       | Identify, document, and track issues                          |
| 9   | Management Review               | P1       | Submit findings for management decision                       |
| 10  | Report Summary                  | P0       | Generate pilot/period summary with metrics                    |
| 11  | Export Package                  | P1       | Export report, data, and evidence index                       |
| 12  | Audit Trail                     | P0       | Immutable log of all actions and decisions                    |
| 13  | User Management                 | P0       | Roles, permissions, and organization setup                    |

---

## Excluded Modules (Explicitly Out of Scope for MVP)

| Module                             | Rationale                                               |
| ---------------------------------- | ------------------------------------------------------- |
| Direct LCGPA/regulatory submission | Requires regulatory agreement — separate initiative     |
| Full AI-powered classification     | Aligned with AQLIYA AI Abstraction phase — post-MVP     |
| Real-time ERP integration          | Each customer has different ERP — integration is custom |
| Multi-company consolidation        | MVP is per-organization; consolidation is Phase 2       |
| Dashboard / analytics suite        | MVP focuses on workflow — analytics is enhancement      |
| Supplier portal / self-service     | Future capability — not in initial scope                |
| Mobile app                         | Web-first — mobile if validated post-MVP                |

---

## Pilot-to-MVP Transition Logic

```
Analyst-led Pilot (current)
        │
        ├── Customer wants software?
        │        YES → MVP Implementation (funded project)
        │        NO  → Continue analyst-led service
        │
        └── Pilot success score ≥ 2.5?
                 YES → Proceed to MVP planning
                 NO  → Address gaps, extend pilot, or stop
```

---

## MVP Success Criteria

| Criterion                        | Target                                                                   |
| -------------------------------- | ------------------------------------------------------------------------ |
| Vendor import acceptance rate    | > 95% of valid records imported correctly                                |
| Spend import acceptance rate     | > 95% of valid records imported correctly                                |
| Classification workflow complete | End-to-end from import → classification → review → approve               |
| Evidence linking                 | Each classification linked to at least one evidence record               |
| Exception identification         | Systematically flags missing evidence, expired docs, classification gaps |
| Report generation                | Produces summary with metrics, evidence coverage, findings               |
| Audit trail completeness         | Every action logged — who, what, when, what changed                      |
| Export package                   | PDF + XLSX + evidence index in one downloadable package                  |

---

## What Must Be Validated Before Coding

| Item                                                | Validation Method                                    |
| --------------------------------------------------- | ---------------------------------------------------- |
| Customer demand for software (not just analyst-led) | At least one paid pilot conversion commitment        |
| Regulatory formula requirements                     | Customer confirms acceptable formula scope           |
| Data import complexity                              | Real customer data sample tested with import logic   |
| Evidence file handling                              | File size, format, and volume requirements confirmed |
| Role/permission model                               | Customer organization structure matches RBAC design  |
| Route and navigation design                         | Wireframes reviewed with potential users             |
