# Sprint v2 Wave 2 — Execution Plan

> **Part of:** Sprint v2 (Evidence Authority)  
> **Date:** 2026-06-29  
> **Prerequisite:** Freeze v2 (enforced)  
> **Methodology:** Identical to Wave 1 — P1 through P7

---

## 1. Product Order

```
Phase 1                  Phase 2
────────                  ────────
Intelligence Core         Office AI Assistant
WorkflowOS               ContentStudio
```

### Rationale

| Product | Why This Order |
|---------|----------------|
| **Intelligence Core** | Shared engine — documenting it first enables evidence reuse for all downstream products |
| **WorkflowOS** | Governed workspace — tests the same methodology as AuditOS/DecisionOS |
| **Office AI Assistant** | Depends on Intelligence Core — evaluation is more accurate after IC is documented |
| **ContentStudio** | Historical contradictions (L3 vs L4) — better addressed after shared layer is stable |

---

## 2. GR-008: Shared Evidence Reuse Map

| Shared Capability | Wave 1 EV | Wave 2 Reuse |
|-------------------|-----------|--------------|
| Build passing | EV-0034 (SRC-OPERATION-0002) | **Reuse** — same build serves all products |
| Intelligence Core engine | — (new) | New canonical EV — reused by WorkflowOS, Office AI |
| AuditEvent model | EV-0007 (SRC-SCHEMA-0002) | **Reuse** — same audit model serves all products |
| Export engine | EV-0009 (SRC-CODE-0006) | **Reuse** — shared export utility |
| M2 Knowledge Data Model | EV-0035 (SRC-DOC-0005) | **Reuse** — same governance framework |
| Freshness report | Already exists | **Reuse** — update expiry only |

---

## 3. Estimated Scope

| Metric | Per Product | Wave 2 Total |
|--------|-------------|--------------|
| Claims per product | 3–5 | 12–20 |
| Evidence items per product | 5–10 | 20–40 (many reused) |
| Manifests | 1 | 4 |
| Dossiers | 1 | 4 |
| New DEC-IDs (Sprint v3) | 2–3 | 8–12 |

---

## 4. Execution Phases (Per Product)

Same as Wave 1:

| Phase | Output | Status |
|-------|--------|--------|
| P1 | Product Registry entries | ⬜ |
| P2 | Normalized Claims | ⬜ |
| P3 | Evidence (EV) with Strength + Reusable | ⬜ |
| P4 | Coverage Matrix + Gap Report | ⬜ |
| P5 | Manifest (Integrity Score + Dependency Graph) | ⬜ |
| P6 | Dossier (Executive Decision File) | ⬜ |
| P7 | Governance Review Brief | ⬜ |
| Sprint v3 | Independent Review + DEC-IDs | ⬜ |

---

## 5. Start Conditions

- ✅ Freeze v2 enforced — governance rules are stable
- ✅ Wave 1 methodology proven (100% completeness, 0 gaps)
- ✅ GR-008 adopted — shared evidence reuse will be enforced
- ✅ Product Registry exists — Intelligence Core is already registered as PROD-INTELLIGENCE-CORE

**Ready to start: P1 — Intelligence Core**
