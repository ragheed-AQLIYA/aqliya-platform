# SPEC-01d: UX Specification — Opportunity Management

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Behavioral UX Specification — defines all UX states, transitions, and consumption patterns for the Deal management interface.
> **Parent:** `SPECIFICATION-01_Opportunity_Management.md` → `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
> **Depends On:** `SPEC-01a_Domain_Specification.md` v1.0 (FROZEN), `SPEC-01b_API_Specification.md` v1.0 (FROZEN), `SPEC-01c_Workflow_Specification.md` v1.0 (FROZEN)
> **Golden Rule:** The UX layer is a **consumer of contracts**. Zero business logic lives in the frontend. All domain rules, workflow guards, and authorization decisions are enforced server-side. The UI reflects state — it does not enforce it.

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | SPEC-01a (Domain types), SPEC-01b (Server Actions, AuthContext, Pagination), SPEC-01c (Stage definitions, Guards, SLA status, Workflow events) |
| **Blocks** | SPEC-01e (Tests), Implementation-01 |
| **Consumer** | Frontend Engineering Team, Design Team |

---

## Inputs

| Input | Source | Section Reference |
|---|---|---|
| Deal aggregate fields | SPEC-01a | §1.2 (Deal Entity) |
| Stage definitions (Arabic + English) | SPEC-01c | §1.2 (Stage Definitions) |
| Transition actions | SPEC-01c | §1.3 (Transition Definitions) |
| Authorization permissions | SPEC-01b | §1.5 (Permission-to-Action Map) |
| Server Action contracts | SPEC-01b | §2 (All Server Actions) |
| ActionResult type | SPEC-01b | §1.1 (Universal Return Type) |
| Error codes | SPEC-01b | §1.2 (Error Mapping) |
| Pagination contract | SPEC-01b | §6 (Pagination Contract) |
| SLA status | SPEC-01c | §4.3 (SLA States) |
| Domain events | SPEC-01a | §3 (7 Domain Events) |
| Evidence gate requirements | SPEC-01c | §3 (Evidence Gates) |
| Actor definitions | PRD-01 | §5 (Actors) |

---

## Outputs

| Output | Description | Consumer |
|---|---|---|
| State map per screen | All possible UX states (loading, empty, error, data, permission-denied, governance-blocked) | Frontend Engineering |
| Component behavior spec | How each component reacts to each state | Frontend Engineering |
| Permission-based UI rules | What UI elements are shown/hidden per role | Frontend Engineering |
| AI state spec | How AI-generated content is displayed with governance disclaimers | Frontend Engineering |
| Evidence state spec | Visual indicators for evidence requirements | Frontend Engineering |

---

## Dependencies

| Dependency | Type | Impact if Missing |
|---|---|---|
| SPEC-01a | Document | No domain types to display |
| SPEC-01b | Document | No Server Actions to call |
| SPEC-01c | Document | No workflow states to render |
| PRD-01 | Document | No actor definitions |
| Design System (AQLIYA UI) | Contract | No reusable components |

---

## Assumptions

| # | Assumption |
|---|---|
| A-01 | All server-side errors return `ActionResult<T>` — the UI never parses exceptions |
| A-02 | Permission checks are enforced server-side. UI is for UX only, not security. |
| A-03 | RTL layout is handled by the design system, not by individual screens |
| A-04 | AI-generated content is always displayed with a governance disclaimer banner |

---

## Open Questions

| # | Question | Impact | Resolution Needed By |
|---|---|---|---|
| OQ-01 | Should the deal list page auto-refresh or require manual refresh? | Affects real-time behavior | UX review |
| OQ-02 | How are concurrent modifications (CONFLICT) surfaced to the user? | Affects error handling UX | UX review |

---

## Non-Goals

This specification does NOT define:
- Visual design, color schemes, typography, or iconography (delegated to Design System)
- Business logic, validation rules, or domain invariants (delegated to SPEC-01a)
- Server Action implementation (delegated to SPEC-01b)
- Workflow engine behavior (delegated to SPEC-01c)
- Testing strategy (delegated to SPEC-01e)

---

# 1. Universal UX State Model

Every screen and component in Opportunity Management follows a universal state model. This ensures consistent behavior across the entire product.

```typescript
type UXState =
  | { type: "loading"; message?: string }
  | { type: "empty"; title: string; description: string; action?: UXAction }
  | { type: "error"; code: string; message: string; recoverable: boolean; retryAction?: UXAction }
  | { type: "permission_denied"; requiredPermission: string }
  | { type: "governance_blocked"; reason: string; details?: Record<string, unknown> }
  | { type: "data"; data: unknown }
  | { type: "ai_pending"; message: string }   // AI generation in progress
  | { type: "ai_ready"; data: unknown; disclaimer: string; confidence: number }
  | { type: "not_found"; resourceType: string }
  | { type: "conflict"; message: string; retryAction?: UXAction };

interface UXAction {
  label: string;
  action: () => Promise<void>;
  primary?: boolean;
}
```

**State transition rules:**
- Every screen starts in `loading` state
- Every screen transitions to exactly one terminal state: `data`, `empty`, `error`, `permission_denied`, or `not_found`
- `governance_blocked` and `conflict` are sub-states of `error` — recoverable with user action
- `ai_pending` and `ai_ready` are sub-states of AI-specific flows

---

# 2. Screen: Deal List

## 2.1 States

| State | Condition | UX Behavior |
|---|---|---|
| **loading** | Initial load | Skeleton list (3 placeholder rows with shimmer animation) |
| **empty** | No deals exist for this organization + no filters active | Illustration: empty pipeline. Text: "No deals yet. Create your first deal to start tracking opportunities." Action button: "Create Deal" |
| **empty (filtered)** | Filters return zero results | Text: "No deals match your filters." Action: "Clear filters" |
| **error** | API returns error | Error banner with message. Retry button. If network error: "Unable to load deals. Check your connection." |
| **data** | Deals loaded successfully | Paginated deal list with sort/filter controls |
| **permission_denied** | User lacks `salesos:deal.create` | Text: "You don't have permission to view deals." Contact admin message. |

## 2.2 Components

| Component | Behavior |
|---|---|
| Filter bar | Stage dropdown, owner dropdown, status toggle (open/closed), date range, search input. All filters are optional. |
| Sort controls | Sort by: updatedAt (default), createdAt, amount, probability. Order: DESC (default), ASC. |
| Deal row | Deal name (linked to detail), account name, stage badge, amount, probability, owner avatar, evidence count badge, review status indicator, SLA status indicator. |
| Stage badge | Colored badge matching stage. Terminal stages (Won/Lost) have distinct styling. |
| Evidence count badge | Shows count. If count < required for current stage, show warning color. |
| SLA status indicator | Green (on_track), yellow (approaching), red (breached). Only shown for stages with SLA. |
| Pagination | Page numbers, page size selector (20/50/100), total count. Has next/previous buttons. |

---

# 3. Screen: Deal Detail

## 3.1 States

| State | Condition | UX Behavior |
|---|---|---|
| **loading** | Initial load | Full-page skeleton |
| **not_found** | Deal ID does not exist or belongs to another org | 404 illustration. Text: "Deal not found." Link: "Back to deals" |
| **error** | API returns error | Error banner with retry |
| **governance_blocked** | User attempted action blocked by guard (e.g., insufficient evidence) | Inline error on the action. Specific message: "This deal needs at least 1 evidence before submitting for review." |
| **conflict** | Version mismatch on write | Warning: "This deal was modified by another user. Please refresh and try again." Option to refresh. |
| **permission_denied** | User lacks permission for a specific action | Action button is hidden OR disabled with tooltip: "You don't have permission to approve deals." |
| **data** | Deal loaded successfully | Full deal detail with all sections |
| **ai_pending** | AI brief generation in progress | "Generating account brief..." with progress indicator |
| **ai_ready** | AI brief generated | Brief displayed with governance disclaimer banner |

## 3.2 Sections

| Section | Content | States |
|---|---|---|
| **Header** | Deal name, stage badge, amount, probability, owner | data, loading |
| **Stage Progress** | Visual stage indicator (7 stages), current stage highlighted | data |
| **Deal Info** | Account name (linked), expected close date, currency, created date | data |
| **Evidence Panel** | Evidence count with progress toward required. Evidence list with link/unlink. | data, empty, loading |
| **Review Panel** | Review status. If "in_review": approve/reject buttons. Decision history timeline. | data, permission_denied, governance_blocked |
| **Activity Log** | Chronological log of stage transitions, evidence links, review decisions. Loading state for initial fetch. | data, empty, loading |
| **AI Brief Panel** | AI-generated brief content. Governance disclaimer banner. Export button (gated by approval). | ai_pending, ai_ready, empty (not generated yet) |
| **SLA Status** | Timer bar showing remaining time. Color changes at thresholds. | data, empty (no SLA for this stage) |
| **Audit Trail** | Last 20 audit events with timestamp, actor, action type. | data, loading |

## 3.3 Stage Progress Component

```
[Draft] ──▶ [Qualified] ──▶ [In Review] ──▶ [Approved] ──▶ [Negotiation] ──▶ [Closed Won]
                                                              │
                                                              └──▶ [Closed Lost]
```

| Visual Property | Behavior |
|---|---|
| Current stage | Filled/highlighted |
| Completed stages | Checkmark + muted fill |
| Future stages | Grey/outlined |
| Terminal stages (Won/Lost) | Distinct color (green/red) |
| Stage name | Arabic label (from SPEC-01c stage definition) + English tooltip |
| Click to transition | Only if user has permission AND current stage is clickable. Disabled stages show reason in tooltip. |

---

# 4. Screen: Deal Create/Edit

## 4.1 States

| State | Condition | UX Behavior |
|---|---|---|
| **loading** | Form initial load (if editing) | Skeleton form |
| **error** | Submit failed | Inline error per field + top error banner |
| **permission_denied** | User lacks `salesos:deal.create` | Button hidden. Message: "Contact your admin to create deals." |
| **data** | Form ready | Editable form with all fields |

## 4.2 Form Fields

| Field | Type | Required | Validation (Client-side) | Source |
|---|---|---|---|---|
| Account | Autocomplete search | ✅ Yes | Must select existing account | SPEC-01a |
| Name | Text input | ✅ Yes | Max 200 chars | SPEC-01a |
| Amount | Number input | ✅ Yes | >= 0 (DI-01) | SPEC-01a |
| Currency | Dropdown (SAR/USD/AED) | Default SAR | ISO 4217 (3-letter) | SPEC-01a |
| Probability | Slider (0-100) | Default 0 | Integer 0-100 (DI-02) | SPEC-01a |
| Expected Close Date | Date picker | Optional | Future date recommended | SPEC-01a |
| Owner | User search | ✅ Yes | Must select valid user | SPEC-01a |

**Note:** Client-side validation is for UX only. All invariants are enforced server-side by the Domain layer (SPEC-01a).

---

# 5. Permission-Based UI

The UI reacts to the user's role and permissions. No UI element assumes a permission that hasn't been verified server-side.

| Component | Sales Rep | Sales Manager | Sales Admin |
|---|---|---|---|
| Create Deal button | ✅ Visible | ✅ Visible | ✅ Visible |
| Edit Deal fields | ✅ (if owner) | ✅ (any deal) | ✅ (any deal) |
| Delete Deal | ❌ Hidden | ❌ Hidden | ✅ Visible |
| Submit for Review | ✅ (if owner) | ❌ Hidden | ❌ Hidden |
| Approve/Reject | ❌ Hidden | ✅ Visible | ✅ Visible |
| Link Evidence | ✅ (if owner) | ✅ (any deal) | ✅ (any deal) |
| View Audit Trail | ✅ Visible | ✅ Visible | ✅ Visible |
| Export Brief | ✅ (if approved) | ✅ (if approved) | ✅ (any status) |
| Admin Override | ❌ Hidden | ❌ Hidden | ✅ Visible (governance-blocked actions only) |

**Implementation pattern:**

```typescript
// The UI does NOT check permissions. It asks the server.
// Server returns ActionResult<DealResponse> with appropriate error code.
// The UI maps error codes to UX states.

// For UI element visibility, a helper action returns allowed actions:
const allowedActions = await getAllowedActionsAction(dealId);
// Returns ["edit", "submit_for_review", "link_evidence"]
// UI hides buttons for actions not in the list.
```

---

# 6. Governance States (UX)

These are UX-specific governance states that the UI must handle. They differ from server-side governance — the UI reflects what the server tells it.

| Governance State | Visual Indicator | UX Behavior |
|---|---|---|
| **Evidence required** | Warning badge on stage progress. "Evidence required" text near evidence panel. | User cannot submit for review until evidence count >= 1. Button is disabled with tooltip. |
| **Under review** | "In Review" stage highlighted. Pending approval badge. | No edit allowed during review (read-only fields). Show "Under review by [reviewer name]". |
| **Approved** | Green checkmark. "Approved by [name] on [date]". | Deal can proceed to Negotiation. |
| **Rejected** | Red X. "Rejected by [name]. Reason: [reason]". | Deal moves to Closed Lost. Show rejection reason prominently. |
| **SLA breached** | Red timer icon. "SLA breached — [stage] overdue by [X days]". | Display prominently at top of deal detail. Escalation info. |
| **Concurrent edit** | Warning banner. "This deal was modified by another user." | Refresh button. Form becomes read-only until refreshed. |

---

# 7. AI States (UX)

AI-generated content has specific UX requirements per Constitution Principle (Governed AI).

| AI State | Visual | User Action |
|---|---|---|
| **Generating** | Skeleton text with shimmer. Label: "AI is generating the brief..." | None — wait for completion. |
| **Ready** | Full content with governance banner. | Review. Edit. Submit for approval. |
| **Review required** | Governance banner at top: "AI-generated draft — human review required before use." Confidence score displayed. Disclaimer in Arabic + English. | Must review and either approve, reject, or request regeneration. |
| **Approved** | "Reviewed and approved by [name] on [date]." | Can export (if deal is in appropriate stage). |
| **Rejected** | "AI draft rejected by [name]. Reason: [reason]." | Can request new generation with feedback. |

### Governance Banner Component

```typescript
interface AIGovernanceBanner {
  confidence: number;           // 0.0 - 1.0
  modelUsed: string;
  disclaimerAr: string;         // "مسودة تم إنشاؤها بواسطة الذكاء الاصطناعي — يجب مراجعتها من قبل الإنسان."
  disclaimerEn: string;         // "AI-generated draft — human review required before use."
  reviewStatus: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
}
```

---

# 8. Evidence States (UX)

| Evidence State | Visual | Behavior |
|---|---|---|
| **No evidence** | Empty evidence panel. "No evidence linked yet." Action: "Link evidence" button. | Evidence gate indicator shows "0 / N required". |
| **Linked** | Evidence card with title, type, linked date, linked by. Actions: View, Unlink. | Count updates. Gate indicator updates. |
| **Gate met** | Green checkmark on evidence gate indicator. "Evidence requirement met (N / N)." | User can submit for review. |
| **Gate not met** | Warning icon on evidence gate indicator. "Evidence required: N more needed." | Submit button is disabled with explanation. |
| **Evidence list loading** | Skeleton cards (3 placeholder). | — |
| **Evidence list error** | "Unable to load evidence." Retry button. | — |

---

# 9. Loading, Error, and Empty States

## 9.1 Loading States

| Component | Loading Treatment |
|---|---|
| Deal list | 3-5 skeleton rows with shimmer |
| Deal detail | Full-page skeleton with section outlines |
| Evidence panel | 2-3 skeleton evidence cards |
| Activity log | 3 skeleton timeline items |
| AI brief | Animated skeleton text with "Generating..." label |
| Stage progress | Static (stages known from API response) |
| Review panel | Skeleton decision timeline |

## 9.2 Error States

| Error Code | User-Facing Message | Action |
|---|---|---|
| `NOT_FOUND` | "Deal not found. It may have been deleted or you may not have access." | "Back to deals" link |
| `FORBIDDEN` | "You don't have permission to perform this action." | Contact admin message |
| `VALIDATION_ERROR` | Field-level error message from server | Highlight field + show message |
| `BUSINESS_RULE_FAILED` | Specific business rule message (e.g., "Deal owner cannot approve their own deal.") | Dismiss |
| `GOVERNANCE_BLOCKED` | Specific governance message (e.g., "This deal needs at least 1 evidence before submitting for review.") | Action button to resolve (e.g., "Link evidence") |
| `CONFLICT` | "Someone else modified this deal. Please refresh." | "Refresh" button |
| Network error (no response) | "Unable to connect. Check your internet connection." | "Retry" button |

## 9.3 Empty States

| Screen | Empty State Content |
|---|---|
| Deal list (no deals exist) | Illustration + "No deals yet. Create your first deal." + "Create Deal" button |
| Deal list (filters result in zero) | "No deals match your filters." + "Clear filters" link |
| Evidence panel (no evidence linked) | "No evidence linked to this deal." + "Link evidence" button |
| Activity log (no activities) | "No activity recorded for this deal yet." |
| AI Brief (not generated) | "No AI brief generated yet." + "Generate brief" button |

---

# 10. UX ViewModel Layer

Between Server Actions and React Components, a formal **ViewModel** layer translates API responses into UI-specific shapes. This prevents React components from containing data transformation logic.

## 10.1 ViewModel Pattern

```text
Server Action (returns ActionResult<T>)
        ↓
ViewModel Mapper (pure function, no side effects)
        ↓
UX ViewModel (UI-specific shape, no domain types)
        ↓
React Components (renders ViewModel, zero logic)
```

## 10.2 ViewModel Definitions

```typescript
// ─── Deal List ViewModel ───

interface DealListViewModel {
  items: DealRowViewModel[];
  pagination: PaginationViewModel;
  filters: FilterStateViewModel;
}

interface DealRowViewModel {
  id: string;
  name: string;
  accountName: string;
  stage: { name: string; labelAr: string; color: string; isTerminal: boolean };
  amount: string;              // formatted, e.g., "500,000 SAR"
  probability: number;
  ownerName: string;
  evidenceCount: number;
  evidenceRequired: number;
  evidenceGateMet: boolean;
  reviewStatus: string;
  slaStatus: { status: "on_track" | "approaching" | "breached"; remainingHours?: number };
  updatedAt: string;           // relative, e.g., "2 hours ago"
  allowedActions: string[];    // from getAllowedActionsAction
}

interface PaginationViewModel {
  page: number;
  pageSize: number;
  hasNext: boolean;
  totalCount?: number;
}

interface FilterStateViewModel {
  stage?: string;
  ownerId?: string;
  status?: "open" | "closed";
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// ─── Deal Detail ViewModel ───

interface DealDetailViewModel {
  header: DealHeaderViewModel;
  stageProgress: StageProgressViewModel;
  evidence: EvidencePanelViewModel;
  review: ReviewPanelViewModel;
  sla: SLAStatusViewModel;
  aiBrief: AIBriefViewModel;
  audit: AuditTrailViewModel;
}

interface DealHeaderViewModel {
  name: string;
  stage: { name: string; labelAr: string; color: string };
  amount: string;
  probability: number;
  ownerName: string;
  accountName: string;
  allowedActions: string[];
}

interface StageProgressViewModel {
  stages: StageProgressItem[];
  currentStageIndex: number;
}

interface StageProgressItem {
  name: string;
  labelAr: string;
  sortOrder: number;
  state: "completed" | "current" | "future" | "terminal_won" | "terminal_lost";
}
```

## 10.3 ViewModel Mapping Rules

| Rule | Implementation |
|---|---|
| ViewModels are created by pure mapper functions | No side effects, no API calls, no async |
| ViewModels contain NO domain types | Amount → formatted string, Stage → { name, labelAr, color } |
| ViewModels contain NO server types | ActionResult<DealResponse> → DealDetailViewModel |
| Mapper functions are co-located with components | One mapper per screen or section |
| Mapper functions are unit-testable | Pure functions, easy to test |

---

# 11. Optimistic UI Policy

Optimistic updates improve perceived performance but carry risk when server-side governance rejects the change. This policy defines when optimistic updates are permitted.

## 11.1 Decision Matrix

| Operation | Optimistic? | Risk | Rollback Strategy |
|---|---|---|---|
| **Create Deal** | ❌ No | Needs server-generated ID and version | Never optimistically created |
| **Update Deal field** (name, amount) | ✅ Yes | Server may reject due to concurrency | On CONFLICT: revert to previous value, show warning |
| **Stage Transition** | ❌ No | Governance gates may block | Never optimistically transitioned. Wait for server response. |
| **Link Evidence** | ⏸️ Pending state only | Evidence gate check is server-side | Show optimistic "linking..." state. On success: confirm. On failure: revert with error. |
| **Unlink Evidence** | ⏸️ Pending state only | Same as link | Show optimistic "removing..." state. On failure: revert. |
| **Delete Deal** | ❌ No | Irreversible action | Confirmation dialog required before server call |
| **AI Generation** | ❌ No | Async by nature | Show AI pending state. Replace with result on completion. |

## 11.2 Optimistic Update Implementation

```typescript
// Example: Update deal name (optimistic)
async function handleUpdateDealName(dealId: string, newName: string, version: number) {
  // 1. Capture current value for rollback
  const previousName = currentDeal.value.name;

  // 2. Optimistically update UI
  currentDeal.value.name = newName;

  // 3. Send server request
  const result = await updateDealAction(dealId, { name: newName, version });

  // 4. Handle response
  if (!result.ok) {
    if (result.code === "CONFLICT") {
      // Rollback to previous value
      currentDeal.value.name = previousName;
      showWarning("This deal was modified by another user. Your change was not saved.");
    } else {
      // Rollback and show error
      currentDeal.value.name = previousName;
      showError(result.error);
    }
  }
}
```

---

# 12. Offline / Retry UX

Even in SaaS mode, network interruptions occur. This section defines the UX contract for offline and retry scenarios.

## 12.1 Offline States

```typescript
type OfflineState =
  | { type: "online" }
  | { type: "queued"; action: string; timestamp: string }
  | { type: "retrying"; attempt: number; maxAttempts: number }
  | { type: "failed"; action: string; error: string; canRetry: boolean }
  | { type: "recovered"; action: string; timestamp: string };
```

## 12.2 UX Per State

| State | UX Behavior | Duration |
|---|---|---|
| **online** | Normal operation | Default |
| **queued** | Subtle indicator: "Saving..." — no blocking overlay | < 30 seconds |
| **retrying** | Inline indicator: "Retrying (attempt 2/3)..." — no blocking overlay | < 60 seconds (3 retries with backoff) |
| **failed** | Warning banner: "Unable to save. [Retry] [Dismiss]" — does not block navigation | Until user action |
| **recovered** | Success toast: "Changes saved." — auto-dismiss | 5 seconds |

## 12.3 Retry Policy

| Scenario | Max Retries | Backoff | Final State |
|---|---|---|---|
| Network error (no response) | 3 | 1s, 4s, 9s | failed (recoverable) |
| Server error (5xx) | 3 | 1s, 4s, 9s | failed (recoverable) |
| CONFLICT (409) | 0 | — | failed (user must refresh) |
| GOVERNANCE_BLOCKED (422) | 0 | — | failed (user must resolve) |
| FORBIDDEN (403) | 0 | — | failed (not recoverable) |

---

# 13. Accessibility Contract

Every Opportunity Management screen must meet these accessibility standards. This is a minimum — not a target.

## 13.1 Keyboard Navigation

| Element | Keyboard Behavior |
|---|---|
| All interactive elements | Must be reachable via Tab key in logical order |
| Deal list rows | Enter or Space to navigate to detail |
| Stage transitions | Tab to action button, Enter to confirm |
| Evidence linking | Tab to search, Enter to select, Tab to confirm |
| Pagination | Tab to next/previous/page number |
| Modal dialogs | Trap focus within modal. Escape to close. Tab within modal. |
| Form submission | Enter to submit from any field |

## 13.2 Focus Order

| Screen | Focus Order |
|---|---|
| Deal list | Search → Filter → Sort → Deal list → Pagination |
| Deal detail | Header → Stage progress → Sections (top to bottom) → Actions |
| Deal create/edit | Fields in form order → Submit → Cancel |
| Modal dialogs | Header → Body → Actions → Close button |

## 13.3 Screen Reader Support

| Element | ARIA Attribute | Value |
|---|---|---|
| Loading skeleton | `aria-busy` | `true` |
| Error banner | `role` | `alert` |
| Stage progress | `role` | `progressbar` |
| Stage progress current | `aria-valuenow` | Stage index (1-7) |
| Stage progress max | `aria-valuemax` | `7` |
| Evidence badge | `aria-label` | "N evidence linked, M required" |
| SLA timer | `aria-label` | "SLA on track, X hours remaining" |
| Stage transition button | `aria-label` | "Transition deal from [stage] to [stage]" |
| Sort controls | `aria-sort` | `ascending` / `descending` |
| Pagination | `aria-label` | "Page N of M" |
| AI governance banner | `role` | `note` |
| AI governance banner | `aria-label` | "AI-generated content — human review required" |
| Empty state | `role` | `status` |
| Modal dialog | `role` | `dialog` |
| Modal dialog | `aria-modal` | `true` |

## 13.4 Color and Contrast

| Requirement | Standard |
|---|---|
| Minimum contrast ratio (normal text) | 4.5:1 (WCAG AA) |
| Minimum contrast ratio (large text) | 3:1 (WCAG AA) |
| Color not sole indicator of state | Stage indicators use shape + color + text, not color alone |
| Error states | Use icon + color + text, not color alone |
| Focus indicator | Visible focus ring (3px, high contrast) on all interactive elements |

---

# 14. Design Tokens Boundary

The UX Specification defines **semantic intent**. The Design System provides **concrete values**. This boundary prevents the UX spec from hardcoding visual properties.

## 14.1 Semantic → Concrete Mapping

```text
UX Specification                      Design System
(Semantic Intent)                     (Concrete Values)
        │                                      │
        ▼                                      ▼
"Primary action button"              --▶  token: color.primary.500
                                                radius: 8px
                                                padding: 12px 24px
                                                font: typography.button

"Stage badge — approved"             --▶  token: color.success.500
                                                icon: icon.check_circle
                                                background: color.success.50

"Warning banner"                     --▶  token: color.warning.500
                                                icon: icon.warning
                                                background: color.warning.50

"SLA breached indicator"             --▶  token: color.danger.500
                                                icon: icon.alert
                                                animation: pulse
```

## 14.2 Rules

| Rule | Implication |
|---|---|
| UX Specification uses semantic intent only | "Danger color" not "#DC2626" |
| Design System provides all concrete values | Colors, spacing, typography, radii, shadows |
| Components consume Design Tokens | No hardcoded color values in component code |
| RTL is handled by Design System | Layout primitives (start/end) not (left/right) |

---

# 15. Navigation State Model

As the product grows, navigation behavior must be predictable. This model defines how users move between screens and what state is preserved.

## 15.1 Screen Map

```text
┌──────────────────────────────────────────────────┐
│                   Opportunity Management          │
│                                                    │
│  Deal List                                         │
│    │                                               │
│    ├──▶ Deal Detail                                │
│    │       │                                       │
│    │       ├──▶ Review Panel (inline)              │
│    │       ├──▶ Evidence Linking (modal)            │
│    │       └──▶ AI Brief (inline section)           │
│    │                                               │
│    ├──▶ Deal Create (new page / modal)            │
│    │                                               │
│    └──▶ Deal Edit (inline in detail or modal)     │
└──────────────────────────────────────────────────┘
```

## 15.2 Navigation State Preservation

| Navigation Action | State Preserved? | What Is Restored |
|---|---|---|
| List → Detail → Back | ✅ Yes | Scroll position, filters, sort, pagination page |
| List → Create → Success → Detail | ✅ Yes | (Create pushes new detail, back returns to list with preserved state) |
| Detail → Refresh page | ❌ No | Default state — deal detail re-fetched |
| List → Filter → Refresh page | ❌ No | Default state — filters cleared |
| Browser back button | ✅ Yes | Previous scroll position and filters (using history state API) |

## 15.3 Navigation Rules

| Rule | Implementation |
|---|---|
| All list views preserve filter state in URL query params | Enables sharing and bookmarking filtered views |
| Detail views do NOT preserve history stack (replace, not push) | Prevents infinite back-button scenarios |
| Modal dialogs close on Escape or outside click | Never block navigation unexpectedly |
| Unsaved changes prompt before navigation | `beforeunload` for forms with changes |
| Optimistic updates do NOT prevent navigation | User can navigate away while save is in progress |

---

# 16. RTL Layout Requirements

| Element | RTL Behavior |
|---|---|
| Page direction | `dir="rtl"` on all pages |
| Text alignment | Arabic labels: right-aligned. English terms: left-aligned within RTL flow. |
| Stage progress | Left-to-right (stage order is fixed, not mirrored) |
| Timeline | Right-to-left (older events on right, newer on left) |
| Pagination | Previous button on right, next button on left |
| Form labels | Right-aligned, inputs after labels |
| Table columns | Right-aligned headers and content |
| Date format | Arabic (هـ) for primary display, Gregorian as secondary |

---

# 17. Permission-Based UI Implementation

```typescript
// Server Action that returns allowed actions for the current user + deal
export async function getAllowedActionsAction(
  dealId: string,
): Promise<ActionResult<string[]>> {
  return safe(async () => {
    const ctx = await requireSalesOrgAccess();
    const actions: string[] = [];

    // Check each permission
    if (await hasPermission(ctx, "salesos:deal.update")) actions.push("edit");
    if (await hasPermission(ctx, "salesos:deal.approve")) actions.push("approve");
    if (await hasPermission(ctx, "salesos:evidence.link")) actions.push("link_evidence");
    if (await hasPermission(ctx, "salesos:deal.admin")) actions.push("delete");

    // Workflow-specific checks
    const deal = await getSalesDeal(dealId, ctx.organizationId);
    if (deal && deal.ownerId === ctx.user.id) {
      if (deal.stage === "Qualified") actions.push("submit_for_review");
    }

    return actions;
  });
}
```

**Important:** This action is for UX convenience only. All real authorization is enforced server-side in each individual Server Action (SPEC-01b §1.5).

---

# 18. Traceability

| SPEC-01d Element | PRD-01 Reference | SPEC-01a Reference | SPEC-01b Reference | SPEC-01c Reference |
|---|---|---|---|---|
| Universal UX state model | §13 (ACs) | — | §1.1 (ActionResult) | — |
| Deal list screen | §6 (FR-05) | — | §2.7 (listDealsAction) | — |
| Deal detail screen | §6 (FR-06) | §1.2 (Deal fields) | §2.8 (getDealAction) | §1.2 (Stage Definitions) |
| Deal create/edit form | §6 (FR-01) | §2 (Value Objects) | §2.1 (createDealAction) | — |
| Stage progress component | §8 (Workflow) | §2 (Stage VO) | — | §1.2 (Stage Definitions) |
| Permission-based UI | §5 (Actors) | — | §1.5 (Authorization Map) | — |
| Governance states | §9 (Evidence) | §1.3 (Invariants) | — | §2 (Transition Guards) |
| AI states | §8 (AI Journeys) | — | — | — |
| Evidence states | §9 (Evidence) | §5 (EvidenceGateService) | §2.6 (linkEvidenceAction) | §3 (Evidence Gates) |
| Error states | §12 (Error Codes) | §4 (Domain Error Model) | §1.2 (Error Mapping) | §2.1 (Guard Pipeline) |
| Empty states | §6 (FR-05, FR-06) | — | — | — |
| RTL layout | — | — | — | — |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Behavioral UX Specification
- **Date:** 2026-06-28
- **Version:** 0.2 (Draft)
- **Parent:** `SPECIFICATION-01_Opportunity_Management.md` → `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
- **Depends On:** `SPEC-01a_Domain_Specification.md` v1.0, `SPEC-01b_API_Specification.md` v1.0, `SPEC-01c_Workflow_Specification.md` v1.0
- **Next:** SPEC-01e (Test Specification)
- **Changes from v0.1:** Added UX ViewModel Layer (§10 with ViewModel types and mapping rules), Optimistic UI Policy (§11 with 7-operation matrix and implementation), Offline/Retry UX (§12 with 5-state model and retry policy), Accessibility Contract (§13 with keyboard, focus, ARIA, contrast standards), Design Tokens Boundary (§14 with semantic-to-concrete mapping), Navigation State Model (§15 with screen map, state preservation, 5 navigation rules). Sections renumbered (RTL → §16, Permission UI → §17, Traceability → §18).
- **Status:** **FROZEN (v1.0)** — approved by Architecture Review Board. Serves as Reference UX Specification for all future AQLIYA product specifications.
- **Next:** SPEC-01e (Test Specification).
