# AQLIYA Knowledge Foundation

**Version:** 1.0  
**Status:** Charter frozen; Sessions 0–3 in scope  
**Charter:** [`charter/AQLIYA_KNOWLEDGE_FOUNDATION_CHARTER_v1.0.md`](charter/AQLIYA_KNOWLEDGE_FOUNDATION_CHARTER_v1.0.md)

---

## What This Is

A governed knowledge operating system — not a document repository — that powers AQLIYA intelligence engines and business products.

```text
Knowledge Foundation
↓
Intelligence Engines
↓
Business Products (AuditOS, LocalContentOS, Accounting Intelligence, …)
```

**Governing statement:** This Foundation shall always privilege authoritative professional judgment over automated inference.

---

## Directory Structure

```text
knowledge-foundation/
├── charter/           # Frozen v1.0 charter and freeze policy
├── authority/         # Authority source registry (per-session expansion)
├── governance/        # Master Prompt Pack, execution program
├── ontology/          # Ontology extensions per domain
├── lineage/           # Lineage templates and decision traces
├── confidence/        # Confidence scoring extensions
├── domains/           # Domain knowledge (IFRS, ISA, ISQM, SOCPA, local-content)
│   ├── ifrs/
│   ├── isa/
│   ├── isqm/
│   ├── socpa/
│   └── local-content/
└── artifacts/         # Seven canonical Foundation deliverables (JSON)
```

---

## Canonical Deliverables

| Artifact | Purpose |
| -------- | ------- |
| [`artifacts/knowledge-authority-matrix.json`](artifacts/knowledge-authority-matrix.json) | Authority levels A–E and source registry |
| [`artifacts/knowledge-storage-matrix.json`](artifacts/knowledge-storage-matrix.json) | Asset type → storage, access, retention |
| [`artifacts/knowledge-domain-map.json`](artifacts/knowledge-domain-map.json) | Domain and subdomain taxonomy |
| [`artifacts/knowledge-confidence-model.json`](artifacts/knowledge-confidence-model.json) | Confidence scoring rules |
| [`artifacts/knowledge-lineage-model.json`](artifacts/knowledge-lineage-model.json) | Lineage chain requirements |
| [`artifacts/knowledge-version-policy.json`](artifacts/knowledge-version-policy.json) | Version lifecycle policy |
| [`artifacts/knowledge-ontology.json`](artifacts/knowledge-ontology.json) | Ontology fields and relationships |
| [`artifacts/knowledge-licensing-matrix.json`](artifacts/knowledge-licensing-matrix.json) | Linking, embedding, redistribution, commercial use per source |

**Session 0 output:** [`governance/master-knowledge-catalog.json`](governance/master-knowledge-catalog.json) (62 operational entries)

**Session 0.5 outputs:**
- [`governance/knowledge-governance-model.json`](governance/knowledge-governance-model.json)
- [`governance/knowledge-admission-workflow.json`](governance/knowledge-admission-workflow.json)
- [`governance/priority-ingestion-backlog.json`](governance/priority-ingestion-backlog.json)

---

## Execution

- **Prompts:** [`governance/MASTER_PROMPT_PACK_v1.md`](governance/MASTER_PROMPT_PACK_v1.md)
- **Program:** [`governance/EXECUTION_PROGRAM.md`](governance/EXECUTION_PROGRAM.md)
- **Freeze policy:** [`charter/FREEZE_NOTICE.md`](charter/FREEZE_NOTICE.md)

All Perplexity and agent outputs for knowledge ingestion must pass through this structure before admission to the Foundation.
