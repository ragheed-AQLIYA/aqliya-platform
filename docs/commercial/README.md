# AQLIYA Commercial Documentation

**Status:** Active | **Last Reviewed:** 2026-07-25
**Authority:** Must not contradict `WHAT_WE_DO_NOT_CLAIM.md`, ADR-108, ADR-109.

> **Positioning:** AQLIYA is an **institutional operating platform**. AuditOS and LocalContentOS are Specialized Operating Systems on the platform. Commercial materials must reflect: AQLIYA platform → Specialized Operating Systems → capabilities. See `docs/official/AQLIYA_MASTER_REFERENCE.md`.

## Commercial wedges (pilot)

| Sold in pilot | Not sold in pilot |
|---------------|-------------------|
| **AuditOS** XOR **LocalContentOS** (Cloud) | SalesOS (internal only) |
| Starter / Professional / Enterprise tiers | On-Prem / Air-Gapped / private-cloud SKU |
| | RiskOS / SimulationOS / AQLIYA Studio as live products |

## Recommended reading (current paths)

### Core commercial documents

| Resource | Path | Description |
|----------|------|-------------|
| Pricing model | `docs/commercial/PRICING_MODEL.md` | 3-tier: Starter SAR 2,999 / Professional SAR 9,999 / Enterprise custom |
| SLA template | `docs/commercial/SLA_TEMPLATE.md` | 99.5% uptime, response/resolution times, credit schedule (bilingual AR/EN) |
| Client onboarding | `docs/commercial/CLIENT_ONBOARDING.md` | 5-phase: Discovery → Setup → Training → Go-Live → Support (bilingual AR/EN) |
| Pilot SOW template | `docs/commercial/PILOT_SOW_TEMPLATE.md` | Statement of Work template with scope, deliverables, legal terms |
| What we do not claim | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | Platform-wide and product-specific exclusions (bilingual AR/EN) |

### Pilot preparation

| Resource | Path |
|----------|------|
| Demo storyline (modular) | `docs/commercial/demo-storyline/` |
| Pilot commercial pack (Arabic-first) | `docs/commercial-pack/` |
| Pricing / ROI (AuditOS pack) | `docs/commercial-pack/12-pricing-model.md` |
| Product status | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` |
| Pilot user guide | `docs/pilot/PILOT_USER_GUIDE.md` |
| Demo flow | `docs/pilot/DEMO_FLOW.md` |

### Security & compliance

| Resource | Path | Description |
|----------|------|-------------|
| Security whitepaper | `docs/security/SECURITY_WHITEPAPER.md` | Architecture, auth, encryption, tenant isolation, audit trail, AI governance, compliance roadmap |
| Penetration test scope | `docs/security/PENETRATION_TEST_SCOPE.md` | Scope, rules of engagement, test methodology |
| SOC2 roadmap | `docs/commercial/SOC2_ROADMAP.md` | SOC2 Type II readiness program |

### Archived / do not use as primary

| Resource | Location |
|----------|----------|
| Old single-file demo storyline | `docs/archive/commercial-legacy/` |
| Old pilot-pack | `docs/archive/commercial-legacy/pilot-pack/` |
| Former `docs/products/auditos-*` kits | **Deleted 2026-07-01** — see `docs/products/README.md` |

Do **not** link to `docs/commercial/auditos-*` paths that were never migrated; those directories do not exist.

## Explicit exclusions (P0 — 2026-07-19)

- No On-Prem or Air-Gapped package pricing
- No "L6 production-hardened" unrestricted marketing claims
- No SalesOS customer CRM sale language
- No RiskOS standalone product marketing
- No SOC2/ISO 27001 certification claims (roadmap only)

## Change log

| Date | Change |
|------|--------|
| 2026-06-09 | Institutional OS positioning note |
| 2026-07-19 | P0: removed broken auditos-* links; wedges + exclusions aligned with ADR-109 |
| 2026-07-25 | Added SLA template, onboarding guide; updated pricing to v2.0; added security whitepaper reference |
