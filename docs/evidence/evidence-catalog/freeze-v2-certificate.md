# Documentation Freeze v2 Certificate

> **Issued:** 2026-06-29  
> **Status:** ✅ **ENFORCED**  
> **Authority:** Project Owner (via Sprint v3 Governance Decisions)  
> **Governing Ref:** DEC-2026-0007 to DEC-2026-0011

---

## 1. Previous Freeze Status

| Freeze | Date | Status |
|--------|------|--------|
| Architecture Freeze (M2 Phase A) | 2026-06-29 | ✅ **Superseded by Freeze v2** |
| **Documentation Freeze v2** | **2026-06-29** | ✅ **ACTIVE** |

---

## 2. Frozen Artifacts

The following artifacts are **frozen** as of 2026-06-29. No modifications without a Governance Decision (DEC-YYYY-NNNN) or Architecture Decision Record (ADR):

### Governance Infrastructure

| Artifact | Version | Status |
|----------|---------|--------|
| M2 Knowledge Data Model (entities, relationships, IDs) | v1.2 | 🔒 Frozen |
| Immutable IDs Rule | M2 §4 | 🔒 Frozen |
| Derived Artifacts Rule | M2 §5 | 🔒 Frozen |
| Evidence Manifest Rule | M1 | 🔒 Frozen |
| Glossary Precision Rule | DOC_AUTHORITY §12a | 🔒 Frozen |
| Three-tier Review Separation | M1 | 🔒 Frozen |
| Decision Preconditions Rule | Sprint v3 §5 | 🔒 Frozen |
| Evidence Independence Check | Sprint v3 §5 | 🔒 Frozen |

### Canonical Registries

| Artifact | Claims/Items | Status |
|----------|-------------|--------|
| Canonical Product Registry | 14 products | 🔒 Frozen |
| Claim Registry (CLAIM_REGISTRY.md) | 14+ active claims | 🔒 Frozen |
| Decision Registry | 11 decisions | 🔒 Active — new DEC-IDs may be added |
| Governance Findings Log | 2 findings (resolved) | 🔒 Frozen |

### Wave 1 Evidence

| Artifact | Products | Status |
|----------|----------|--------|
| Evidence Items (EV-0001 to EV-0037) | AuditOS, DecisionOS, LocalContentOS | 🔒 Frozen until freshness expiry (2026-09-27) |
| Manifests (3) | AuditOS, DecisionOS, LocalContentOS | 🔒 Frozen |
| Dossiers (3) | AuditOS, DecisionOS, LocalContentOS | 🔒 Frozen |
| Governance Review Brief | Wave 1 | 🔒 Frozen |

---

## 3. Governance Decisions Enforced

| DEC-ID | Product | Decision | Effective |
|--------|---------|----------|-----------|
| DEC-2026-0007 | AuditOS | L5 Confirmed | 🔒 Active |
| DEC-2026-0008 | DecisionOS | L5 Pilot-ready | 🔒 Active |
| DEC-2026-0009 | LocalContentOS | L5 Governance Approved | 🔒 Active |
| DEC-2026-0010 | Wave 1 | Strategic Intent Approved (unfrozen) | 🔒 Active |
| DEC-2026-0011 | Wave 3B | Limited documentation update authorized | ✅ Executed |

---

## 4. Exceptions (Not Frozen)

The following may continue to evolve without a Governance Decision:

| Activity | Rationale |
|----------|-----------|
| Sprint v2 Waves 2+3 (new products) | Not yet reviewed — will follow same methodology |
| Evidence freshness updates | Re-verification within 90-day window does not change evidence substance |
| New DEC-IDs for future decisions | Decision Registry is designed to accept new entries |
| Wave 3B documentation updates | Authorized by DEC-2026-0011 — limited scope only |

---

## 5. Certificate

```text
╔══════════════════════════════════════════════════════════════╗
║           DOCUMENTATION FREEZE v2 CERTIFICATE                ║
║           AQLIYA Knowledge Governance Program                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Freeze Date:      2026-06-29                                ║
║  Previous Freeze:  2026-06-29 (Architecture Freeze)          ║
║  Governing Refs:   DEC-2026-0007 to DEC-2026-0011            ║
║  Issued By:        Governance Team                           ║
║  Authority:        Project Owner                             ║
║                                                              ║
║  Frozen:                                                      ║
║    - M2 Knowledge Data Model v1.2                            ║
║    - All governance rules (7)                                ║
║    - Canonical Product Registry (14 products)                ║
║    - Claim Registry (14+ claims)                             ║
║    - Decision Registry (11 decisions)                        ║
║    - Wave 1 Evidence (37 EV)                                 ║
║    - Wave 1 Manifests + Dossiers (3 each)                    ║
║    - Governance Review Brief                                 ║
║                                                              ║
║  Not Frozen:                                                  ║
║    - Sprint v2 Waves 2+3 (new products)                      ║
║    - Evidence freshness updates                               ║
║    - New DEC-IDs                                              ║
║    - Wave 3B documentation updates (limited scope)            ║
║                                                              ║
║  Status: ENFORCED — 2026-06-29                                ║
║  Next Review: 2026-09-27 (freshness expiry)                  ║
╚══════════════════════════════════════════════════════════════╝
```

---

## References

- Architecture Freeze Certificate: `docs/governance/aqliya-knowledge-governance-charter-m2.md` §3
- Governance Decisions: `evidence-catalog/decision-registry.md`
- Governance Review Brief: `evidence-catalog/governance-review-brief.md`
