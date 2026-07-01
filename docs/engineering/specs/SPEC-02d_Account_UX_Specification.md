# SPEC-02d: UX Specification — Account Intelligence

> **Status:** Draft v0.1 | **Template:** SPEC-01d | **Reuse:** ~95% | **Cycle:** 2

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | SPEC-02b |
| **Blocks** | SPEC-02e |
| **Consumer** | UX Engineering Team |

---

## Universal UX States

Same 10-state model from SPEC-01d §1: `loading, empty, error, permission_denied, governance_blocked, data, ai_pending, ai_ready, not_found, conflict`.

---

## Screens

| Screen | States |
|---|---|
| **Account List** | loading, empty, data, error, permission_denied |
| **Account Detail** | loading, not_found, data, error, ai_pending, ai_ready |
| **Account Create/Edit** | data, error, permission_denied |
| **AI Brief Panel** | ai_pending, ai_ready, empty |

## Permission-Based UI

| Component | Account Manager | Relationship Mgr | Admin |
|---|---|---|---|
| Create Account | ✅ | ❌ | ✅ |
| Edit Account | ✅ (if owner) | ❌ | ✅ |
| Score ICP | ✅ | ❌ | ✅ |
| Request Brief | ✅ | ✅ | ✅ |
| Link Contact | ✅ | ✅ | ✅ |
| Archive | ❌ | ❌ | ✅ |

---

## AI Governance States

Same pattern as SPEC-01d §7: `ai_pending → ai_ready → review_required → approved → rejected`. Every AI brief carries governance banner with confidence, model, disclaimer (AR+EN).

---

## Arabic-first UX

All labels in Arabic. Stage labels: "محتمل" (Prospect), "نشط" (Active), "خامل" (Dormant), "مؤرشف" (Archived). RTL layout. Date format: هـ.

---

## Traceability

| Element | PRD-02 Reference |
|---|---|
| Screens | §6 (FRs) |
| Permissions | §5 (Actors) |
| AI states | §10 |

---

## Document Metadata

- **Author:** OpenCode | **Template:** SPEC-01d | **Reuse:** ~95%
- **Version:** 0.1 | **Status:** Draft
