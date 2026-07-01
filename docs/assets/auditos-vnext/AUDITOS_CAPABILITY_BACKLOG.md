# AuditOS vNext — Capability Backlog (CPV-001)

> **Status:** Baseline v1.0 | **Date:** 2026-06-28
> **Template:** SalesOS Capability Backlog (reused)
> **Parent:** `AUDITOS_V2_BLUEPRINT.md` v0.1

---

## Execution Waves

| Wave | Focus | Product Capabilities | Rationale |
|---|---|---|---|
| **Wave 1** | Core Engagement | Engagement Management, Client Management | Build foundational entities and workflows first |
| **Wave 2** | Evidence & Findings | Findings Management, Workpaper Management | Add evidence layer once engagement exists |
| **Wave 3** | Intelligence | Risk & Materiality, Reporting | Intelligence needs data from prior waves |

---

## Epic Backlog

### EPIC-01: Engagement Management

| Field | Value |
|---|---|
| **Product Capability** | Engagement Management |
| **Blueprint Sections** | §4 (Engagement Domain), §6 (Engagement Lifecycle), §5 (auth, workflow, evidence) |
| **Wave** | 1 |
| **Depends On** | Platform Kernel: `platform.auth`, `platform.workflow`, `platform.evidence` |
| **KPIs** | Template Reuse ≥90%, Constitution unchanged, 0 new ADRs |

### EPIC-02: Client Management

| Field | Value |
|---|---|
| **Product Capability** | Client Management |
| **Blueprint Sections** | §4 (Client Domain), §5 (auth) |
| **Wave** | 1 |
| **Depends On** | EPIC-01 |
| **KPIs** | Client profile completeness ≥85% |

### EPIC-03: Findings Management

| Field | Value |
|---|---|
| **Product Capability** | Findings Management |
| **Blueprint Sections** | §4 (Finding Domain), §8 (Evidence Chain) |
| **Wave** | 2 |
| **Depends On** | EPIC-01, EPIC-02 |

### EPIC-04: Workpaper Management

| Field | Value |
|---|---|
| **Product Capability** | Workpaper Management |
| **Blueprint Sections** | §4 (Workpaper Domain), §8 |
| **Wave** | 2 |
| **Depends On** | EPIC-01 |

### EPIC-05: Risk & Materiality

| Field | Value |
|---|---|
| **Product Capability** | Risk & Materiality |
| **Blueprint Sections** | §7 (AI Architecture), §4 (Materiality Domain) |
| **Wave** | 3 |
| **Depends On** | EPIC-01, EPIC-03 |

### EPIC-06: Reporting

| Field | Value |
|---|---|
| **Product Capability** | Reporting |
| **Blueprint Sections** | §7, §6 (final stages) |
| **Wave** | 3 |
| **Depends On** | EPIC-01 through EPIC-05 |

---

## Dependency Map

```
EPIC-02 (Client) ←── EPIC-01 (Engagement) ──→ EPIC-04 (Workpaper)
                                               │
                                               ▼
                                          EPIC-03 (Findings)
                                               │
                                               ▼
                                          EPIC-05 (Risk)
                                               │
                                               ▼
                                          EPIC-06 (Reporting)
```

---

## Traceability

| Epic | Constitution | ADR | SalesOS Equivalent |
|---|---|---|---|
| EPIC-01 | P1, P2, P5 | ADR-001, ADR-015 | Deal → Engagement |
| EPIC-02 | P1 | ADR-001 | Account → Client |
| EPIC-03 | P1, P5 | ADR-001 | — (new) |
| EPIC-04 | P1, P5 | ADR-001 | — (new) |
| EPIC-05 | P12 | ADR-003 | WinProb → Materiality |
| EPIC-06 | P1 | ADR-001 | Report → Engagement output |

---

## Document Metadata

- **Author:** OpenCode | **Program:** CPV-001
- **Version:** 1.0 | **Template:** SalesOS Capability Backlog (reused)
- **Status:** Baseline — ready for PRD-01
