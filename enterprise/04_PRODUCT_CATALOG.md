# AQLIYA Product Guide

**適用對象:** Product Managers, Product Team  
**Status:** Active | Version 1.0 | 2026-06-30

## Product Taxonomy

AQLIYA uses "Specialized Operating Systems" / "نظام تشغيل" language publicly. Internally, we use "product" for code classification.

`
AQLIYA Platform Company
├── AQLIYA Intelligence Core (shared layer)
├── Specialized Operating Systems
│   ├── AuditOS (L5)
│   ├── LocalContentOS (L5)
│   ├── DecisionOS (L5)
│   ├── WorkflowOS (L5)
│   ├── SalesOS (L5)
│   ├── LocalContactOS (L5)
│   ├── Office AI Assistant (L5 - shared app)
│   ├── RiskOS (L5 - AuditOS-adjacent)
│   ├── Institutional Memory (L5)
│   └── ContentStudio (L4)
└── Future: ComplianceOS, LegalOS, GovOS, AQLIYA Studio
`

## Product Maturity Model (L0-L6)

| Level | Name | Meaning |
|-------|------|---------|
| L0 | Concept | Docs or idea only |
| L1 | Marketing | Public page/copy only |
| L2 | Shell | Route exists, no workflow |
| L3 | Prototype | UI + mock data |
| L4 | Usable v0.1 | Real workflow, persistence |
| L5 | Pilot-ready | Evidence, review, approval, exports, audit trail |
| L6 | Production-hardened | Security, monitoring, backups, scale |

## Current Product Statuses

[See docs/assets/AUDITOS.md, LOCALCONTENTOS.md, etc. for detailed product references]

## Product Dependencies

`
Products (P01-P10)
  └── depend on → Intelligence Core (C01-C12)
                    └── depends on → Infrastructure (I01-I05)
`

## Release Cycle
- v0.1: Current baseline (L4-L5 for active products)
- Each product upgrades independently
- Release notes in docs/releases/

## Cross-Product Dependencies
- RiskOS uses AuditOS risk models
- DecisionOS uses Institutional Memory for entity linking
- WorkflowOS powers Sunbul (redirect alias)
- SalesOS uses signals from all products
- LocalContactOS integrates with SalesOS contacts
