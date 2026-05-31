# Sunbul Product Brief

**Version:** 0.1
**Status:** Real custom workspace implementation with ongoing product-definition cleanup
**Parent:** AQLIYA Ecosystem

---

## Product Definition

Sunbul is a governed operational workspace that enables organizations to run a repeatable, multi-client workflow with full data isolation, role-based access, audit trail, and human-in-the-loop governance.

Implementation reality as of the v0.1 hardening pass:

- Real routes exist under `/sunbul/*`
- Real Prisma models exist with `Sunbul*` prefixes
- Real workflow, storage, review, and PDF export code exists
- Sunbul should be presented as a custom/client-specific workspace module, not automatically as a core AQLIYA product-family product

The platform is designed to be sold to multiple clients simultaneously, where each client's workspace, data, users, documents, configurations, and audit logs remain strictly isolated from all other clients.

**Arabic:** سنبل هي منصة تشغيلية محكومة تتيح للمؤسسات تشغيل مسار عمل متكرر متعدد الجهات مع عزل كامل للبيانات، صلاحيات أدوار، مسار تدقيق، وحوكمة بشرية على كل مخرج.

## Target Clients

| Client Type                        | Example                                                | Fit                                                          |
| ---------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| Professional services firms        | Audit firms, consulting firms, legal practices         | High — they serve multiple clients with repeatable processes |
| Government shared service centers  | Centralized service units serving multiple departments | High — need per-department isolation                         |
| Regulated intermediaries           | Brokers, agents, trustees managing multiple principals | High — need per-principal data protection                    |
| Multi-brand enterprises            | Holding companies managing multiple subsidiaries       | Medium — shared admin with per-brand isolation               |
| BPO / outsourced service providers | Managed service providers serving multiple customers   | High — per-customer governance required                      |

## Problem

Organizations that serve multiple clients face a fundamental challenge:

- **Spreadsheet chaos**: Each client's data in separate files, no standardization
- **No audit trail**: Who did what, when, and based on what evidence is hard to trace
- **No role separation**: The same person may act as operator, reviewer, and approver without clear boundaries
- **Cross-client leaks**: Without strict isolation, client A's data may inadvertently appear in client B's workspace
- **No repeatable workflow**: Each client engagement reinvents the process
- **No governed AI**: AI assistance exists ad-hoc without evidence linkage or human review

## Promise

Sunbul delivers:

1. **One platform, many clients** — each client has their own isolated workspace
2. **Repeatable governed workflow** — draft → submit → review → approve → export → archive
3. **Full audit trail** — every action logged with actor, timestamp, before/after state
4. **Role-based access** — clear separation between operator, reviewer, approver, admin
5. **Evidence linkage** — every output linked to its supporting documents
6. **Human-governed AI** — AI assists with suggestions but never makes final decisions
7. **Export with provenance** — final outputs include audit trail and evidence references

## Core Workflow

```
Draft → Submitted → Under Review → (Returned → Draft) → Approved → Locked → Exported → Archived
```

1. An **Operator** creates a record (draft)
2. Submits it for review (submitted)
3. A **Reviewer** examines and either returns for revision or forwards for approval
4. An **Approver** reviews and approves/rejects
5. Once approved, the record is locked
6. **Export** produces the final deliverable with full provenance
7. **Archive** preserves the record for compliance

## Value Proposition

- **For service firms**: Standardize client delivery with governance. Prove compliance to regulators.
- **For internal shared services**: Demonstrate per-department governance and SLA adherence.
- **For multi-brand enterprises**: Keep brand data separate while using a shared platform.

## Commercial Positioning

Sunbul is positioned as:

- A product **within or alongside** the AQLIYA ecosystem
- **Not** positioned as "AQLIYA for clients" — Sunbul has its own identity
- Suitable for Cloud or Private deployment
- Sold per-client or per-workspace, with a platform fee

## Deployment Assumptions

| Aspect         | MVP Assumption                              | Future                                     |
| -------------- | ------------------------------------------- | ------------------------------------------ |
| Deployment     | Cloud (multi-tenant, per-client isolated)   | Private / On-Prem for sensitive clients    |
| Database       | PostgreSQL per deployment                   | Schema-per-tenant or DB-per-tenant options |
| File Storage   | Centralized with isolation by client folder | Per-client encrypted storage               |
| AI Provider    | Cloud AI (with governance guards)           | Local AI option for Private deployment     |
| Authentication | Email/password + OAuth                      | SSO, SAML, AD/LDAP                         |

## Risks and Constraints

| Risk                              | Impact                     | Mitigation                                              |
| --------------------------------- | -------------------------- | ------------------------------------------------------- |
| Multi-client isolation complexity | Data leak between clients  | Rigorous isolation testing; tenant guard on every query |
| Scope creep beyond MVP            | Delayed delivery           | Strict MVP scope; defer advanced features               |
| Client onboarding complexity      | Slow adoption              | Template-based client setup; minimal required config    |
| AI governance overhead            | User friction              | AI as optional assist; never required for core workflow |
| Deployment model ambiguity        | Wrong architecture choices | Phase 0: resolve deployment assumptions before coding   |
