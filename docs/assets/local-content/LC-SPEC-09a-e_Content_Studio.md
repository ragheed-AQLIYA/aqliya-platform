# LC-SPEC-09a-e: Content Studio — All Specs

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Parent:** `LC-PRD-09_Content_Studio.md`
> **Template:** LC-SPEC-01a–01e (Golden Reference)
> **Epic:** LC-EPIC-09

---

## Domain Specification (LC-SPEC-09a)

### Entities (7 domain types)
| Entity | Key Fields | Statuses |
|---|---|---|
| ContentProject | id, title, objective, audience, language | draft, active, archived |
| Campaign | id, contentProjectId, name, channels | draft, active, in_review, approved, completed, archived |
| ContentSource | id, campaignId, title, type, credibility | proposed, verified, rejected, expired |
| ContentItem | id, campaignId, title, format, body | idea→draft→in_review→approved→ready_to_publish→published |
| ContentReviewRecord | id, contentItemId, dimensions (5), status | pending, approved, changes_requested, rejected |
| ContentApprovalRecord | id, contentItemId, approved, notes | boolean decision |
| OutputPackage | id, campaignId, title, includes | draft, ready, approved, exported |

### Store
Interim: file-based store (`file-repository.ts`) + Prisma adapter (`prisma-repository.ts`). Interface: `ContentStudioStore`.

### Domain Rules
| Rule | Enforcement |
|---|---|
| State transitions enforced by workflow.ts | `canTransitionCampaign()` etc. |
| AI output requires reviewRequired=true | `ai.ts` |
| Review dimensions evaluated independently | `ContentGovernanceAudit` per dimension |

---

## API Specification (LC-SPEC-09b)

| Action | Permission |
|---|---|
| `createContentStudioProjectAction` | Project admin |
| `createContentStudioCampaignAction` | Campaign create |
| `createContentStudioItemAction` | Item create |
| `createContentStudioSourceAction` | Source create |
| `submitContentStudioReviewAction` | Review |
| `completeContentStudioReviewFormAction` | Complete review |
| `approveContentStudioItemFormAction` | Approve |
| `createContentStudioOutputAction` | Output create |
| `listContentStudioProjectsAction` | View |
| `listContentStudioCampaignsAction` | View |

---

## Workflow Specification (LC-SPEC-09c)

### Content Item Lifecycle
```
1. User creates content project → creates campaign
2. User adds sources (url/file/note) → credibility assessed
3. User creates content item with format
4. (Optional) AI draft assist → generates draft suggestion
5. Content item submitted for review (→ in_review)
6. Reviewer evaluates 5 dimensions (source, brand, compliance, factual, language)
7. If changes_requested → back to draft for revision
8. If approved → ready_to_publish → published
```

### Review Dimensions
| Dimension | Purpose |
|---|---|
| sourceGrounding | Is content grounded in verified sources? |
| brand | Does it match brand guidelines? |
| compliance | Does it meet regulatory requirements? |
| factualClaims | Are factual claims accurate? |
| languageQuality | Is language quality acceptable? |

---

## UX Specification (LC-SPEC-09d)

### Screens
| Route | Purpose |
|---|---|
| `/local-content/studio` | Content projects list |
| `/local-content/studio/[id]` | Project detail + campaigns |
| `/local-content/studio/[id]/campaigns/[id]` | Campaign items + sources |
| `/local-content/review` | Review queue (all pending items) |

### Key Components
- `ContentStudioNav` — Navigation with studio, review, rules links
- `create-campaign-form.tsx` / `create-content-item-form.tsx` — Creation forms
- `content-review-queue.tsx` — 5-dimension review interface
- `content-item-studio-actions.tsx` — Submit/approve actions
- `create-content-output-form.tsx` — Output package builder

---

## Test Specification (LC-SPEC-09e)

| File | What It Tests |
|---|---|
| `content-studio.test.ts` | Store CRUD, state transitions, AI draft assist |
| `content-studio-prisma-repository.test.ts` | Prisma repository adapter |

### Scenarios
```
✓ Creates project, campaign, content item
✓ Valid state transitions for all entity types
✓ Invalid transitions rejected
✓ AI draft assist creates reviewRequired=true output
✓ 5-dimension review records correctly
✓ Output package lifecycle
```

---

## Freeze Checklist — LC-EPIC-09

| Check | Status |
|---|---|
| All 5 Specs Frozen | ✅ LC-PRD-09 + LC-SPEC-09a–09e |
| Code Evidence Verified | ✅ 20+ content studio files, tests, UI components |
| Architecture Drift | None |
