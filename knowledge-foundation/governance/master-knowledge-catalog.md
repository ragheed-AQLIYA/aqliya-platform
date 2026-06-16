# Master Knowledge Catalog — Human Summary

**Version:** 1.0 | **Session:** 0 | **Entries:** 62  
**Canonical JSON:** [`master-knowledge-catalog.json`](master-knowledge-catalog.json)

---

## Purpose

Operational index — not a link list. Every entry binds domain knowledge to governance policies, storage, licensing, engines, and ingestion priority.

---

## Entry Schema (per catalog row)

| Field | Purpose |
| ----- | ------- |
| `domain` / `subdomain` | Taxonomy placement |
| `authority` | Source body (IFRS Foundation, IAASB, SOCPA, firm-internal) |
| `assetType` | A=Rules, B=Guidance, C=Structures, D=Operational, E=Memory |
| `storageTier` | canonical or operational |
| `lineageRequirements` | Decision → Rule → Authority → Source → Reviewer |
| `versionPolicy` | Mandatory version fields; no destruction |
| `confidencePolicy` | Score ranges; LLM cap 69 |
| `licensingStatus` | Linking, cataloging, embedding, redistribution, commercial use |
| `repositoryPath` | Where admitted assets live |
| `engines` | TB Intelligence, Mapping, Disclosure, Audit Intelligence, … |
| `priority` | 0=highest (governance), 1=ingest first, 2=secondary |

---

## Sessions Covered

| Session | Domain | Count | Examples |
| ------- | ------ | ----- | -------- |
| 0 | Governance | 2 | Master Catalog, Governance Model |
| 1 | Accounting / IFRS | 35 | IFRS 15, 16, 9, IAS 1, 12, CoA, Firm Memory |
| 2 | Audit / ISA / ISQM | 17 | ISA 315, 500, 540, 700, ISQM 1 |
| 3 | SOCPA | 8 | Accounting framework, Zakat, ISA alignment, overlays |

---

## Priority 1 — Ingest First

**Accounting:** IFRS 15, IFRS 16, IFRS 9, IAS 1, IAS 12, IFRS for SMEs, Chart of Accounts, Firm Memory TB Mapping

**Audit:** ISA 315, ISA 330, ISA 500, ISA 540, ISA 700, ISQM 1

**SOCPA:** Framework, IFRS Adoption, Zakat/Tax, Auditing Standards, Jurisdiction Overlay

---

## AuditOS Flow (Charter-Compliant)

```text
TB Upload
↓
TB Intelligence
↓
Firm Memory
↓
Mapping Suggestions
↓
Reviewer Approval
↓
Financial Statements
```

Autonomous FS generation: **prohibited**

---

## Cross-Artifact Review

See [`SESSION_0_CROSS_ARTIFACT_REVIEW.md`](SESSION_0_CROSS_ARTIFACT_REVIEW.md) — all checks **PASS**.

Session 1 blocked until program manager accepts review.
