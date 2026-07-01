# LC-PRD-09: Content Studio

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** PRD — retroactive alignment for Content Studio subsystem
> **Epic:** LC-EPIC-09

---

## 1. Overview

Content Studio is a governed content production workspace within LocalContentOS. It manages content projects, campaigns, items, sources, reviews, approvals, and output packages — each with its own state machine. Uses an interim file-based store (JSON → Prisma repository adapter pattern).

**In scope:** Content project management, campaign lifecycle, content item creation with AI draft assist, source evidence management, multi-dimensional review (brand, compliance, factual claims, language), approval workflow, output package generation.

---

## 2. State Machines

### Campaign
```
draft → active → in_review → approved → completed → archived
                      ↓
                  draft
```

### Content Item (8 states)
```
idea → draft → in_review → changes_requested → draft
                        ↓
                   approved → ready_to_publish → published
                        ↓
                    archived
```

### Source
```
proposed → verified → expired
        → rejected
```

### Output Package
```
draft → ready → approved → exported
```

---

## 3. Functional Requirements

| ID | Requirement | Implementation |
|---|---|---|
| FR-01 | Create content project | `createContentStudioProjectAction` |
| FR-02 | Create campaign within project | `createContentStudioCampaignAction` |
| FR-03 | Create content item with format | `createContentStudioItemAction` |
| FR-04 | AI draft assist for content items | `ai.ts` — governed suggestions |
| FR-05 | Link sources to content items | `createContentStudioSourceAction` |
| FR-06 | Multi-dimension review (source/brand/compliance/factual/language) | `content-review-queue.tsx` |
| FR-07 | Approval workflow | `approveContentStudioItemFormAction` |
| FR-08 | Create output package | `createContentStudioOutputAction` |
| FR-09 | Export output | Output package export |
| FR-10 | Governance audit trail | `ContentGovernanceAudit` |

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ 20+ files in content/, content-studio.test.ts, 5+ UI components |
| **Documented** | ✅ This PRD retroactively describes existing implementation |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1
