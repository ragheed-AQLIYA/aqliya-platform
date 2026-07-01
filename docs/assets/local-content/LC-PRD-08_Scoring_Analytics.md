# LC-PRD-08: Scoring & Analytics

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** PRD — retroactive alignment for Scoring & Analytics subsystem
> **Epic:** LC-EPIC-08

---

## 1. Overview

Scoring & Analytics provides deterministic supplier-level scoring (LC-01 — multi-factor weights: locality 40, ownership 25, workforce 20, declared content 15) and organization-level spend analytics. No AI. All calculations are rule-based.

**In scope:** Per-supplier scoring, full project scoring, org-wide spend analytics, scoring test coverage.

---

## 2. Functional Requirements

| ID | Requirement | Implementation |
|---|---|---|
| FR-01 | Score supplier locality factor | `scoreLocalityFactor()` |
| FR-02 | Score supplier ownership factor | `scoreOwnershipFactor()` |
| FR-03 | Score supplier workforce factor | `scoreWorkforceFactor()` |
| FR-04 | Score supplier declared content | `scoreDeclaredContent()` |
| FR-05 | Compute supplier weighted total | `calculateSupplierScore()` |
| FR-06 | Compute full project score (suppliers + spend + classification + evidence + findings) | `calculateFullScoring()` |
| FR-07 | Build org-wide spend analytics | `buildOrganizationSpendAnalytics()` |
| FR-08 | Top-level dashboard metrics | `getOrganizationSpendAnalytics()` |

---

## 3. Scoring Weights (LC-01)

| Factor | Weight | Key Inputs |
|---|---|---|
| Locality | 40 | localityClassification, localContentPercentage |
| Ownership | 25 | ownershipType |
| Workforce | 20 | workforceLocalPct |
| Declared Content | 15 | localContentPercentage |

**Total: 100**

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ scoring.ts (390 lines), spend-analytics.ts, scoring.test.ts (249+ tests) |
| **Documented** | ✅ This PRD retroactively describes existing implementation |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1
