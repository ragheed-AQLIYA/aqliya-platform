# AuditOS MVP — Engineering Implementation Plan

**Document ID:** PLAN.001  
**Status:** Draft  
**Version:** 0.1  
**Last Updated:** 2026-05-08  
**Supersedes:** PRD.001, ARCH.001  

---

## 1. Folder Structure Plan

The AuditOS MVP lives alongside the existing Aqliya application. All new code is contained under `src/app/audit/`, `src/components/audit/`, `src/lib/audit/`, and `src/types/audit/`.

```
src/
  app/
    audit/                          # New AuditOS routes
      page.tsx                      # AuditOS Dashboard (engagement list)
      layout.tsx                    # AuditOS-specific layout (sidebar + header)
      engagements/
        [engagementId]/
          page.tsx                  # Engagement detail / workflow hub
          trial-balance/
            page.tsx                # Trial balance upload + review
          mapping/
            page.tsx                # Account mapping interface
          validation/
            page.tsx                # Validation results + anomaly flags
          statements/
            page.tsx                # Draft financial statements
          notes/
            page.tsx                # Disclosure notes checklist
          evidence/
            page.tsx                # Evidence management
          findings/
            page.tsx                # Findings list
            [findingId]/
              page.tsx              # Finding detail
          recommendations/
            page.tsx                # Recommendations list
            [recommendationId]/
              page.tsx              # Recommendation detail
          review/
            page.tsx                # Review queue
          approval/
            page.tsx                # Approval dashboard
          publication/
            page.tsx                # Published output view
          audit-trail/
            page.tsx                # Audit event log
      review-queue/
        page.tsx                    # Cross-engagement review queue
    (dashboard)/                    # Keep existing routes
    api/
      audit/                        # New AuditOS API routes
        engagements/
          route.ts
          [engagementId]/
            trial-balance/
              route.ts
            mapping/
              route.ts
            validation/
              route.ts
            evidence/
              route.ts
            findings/
              route.ts
            recommendations/
              route.ts
            review/
              route.ts
            approval/
              route.ts
            publication/
              route.ts
            events/
              route.ts
            trace/
              route.ts
    (existing)                      # Keep existing routes

  components/
    audit/                          # New AuditOS components
      layout/
        audit-sidebar.tsx           # Engagement-specific sidebar
        audit-header.tsx            # Engagement context header
        workflow-progress.tsx       # Workflow state indicator
      dashboard/
        engagement-card.tsx         # Card in dashboard grid
        engagement-list.tsx         # Engagement list view
        stats-overview.tsx          # Key metrics (optional)
      engagement/
        engagement-form.tsx         # Create/edit engagement dialog
        team-assignment.tsx         # Team member assignment
        engagement-detail-header.tsx # Header with client info
        workflow-status-badge.tsx   # Badge showing current state
      trial-balance/
        tb-upload-dropzone.tsx      # File upload area
        tb-preview-table.tsx        # Parsed trial balance grid
        tb-parse-result.tsx         # Parse success/error display
        trust-state-indicator.tsx   # Trust state badge
        column-mapping-dialog.tsx   # Column header mapping
      mapping/
        mapping-table.tsx           # Account mapping list
        mapping-row.tsx             # Single row with suggestion
        mapping-suggestion.tsx      # AI suggestion dropdown
        mapping-progress-bar.tsx    # Progress: X of Y mapped
        mapping-stats.tsx           # Summary stats
      validation/
        validation-runner.tsx       # Trigger validation button + status
        validation-results.tsx      # Summary of validation checks
        validation-detail-row.tsx   # Individual check result
        anomaly-flag-list.tsx       # Anomaly flags with disposition
        anomaly-flag-dialog.tsx     # Disposition dialog
      statements/
        statement-viewer.tsx        # Draft financial statement display
        statement-line-item.tsx     # Single line in statement
        statement-mapping-detail.tsx # Account drill-down for line
      notes/
        notes-checklist.tsx         # Disclosure notes checklist
        notes-item.tsx              # Single note with status
        notes-missing-indicator.tsx # Missing info warning
      evidence/
        evidence-upload-dropzone.tsx # Evidence file upload
        evidence-list.tsx            # Evidence list with filtering
        evidence-row.tsx             # Single evidence item
        evidence-viewer.tsx          # Inline document viewer
        evidence-link-dialog.tsx     # Link evidence to target
        evidence-state-badge.tsx     # State indicator
        evidence-verify-controls.tsx # Verify/reject buttons
      findings/
        finding-list.tsx            # Findings list with filters
        finding-row.tsx             # Single finding row
        finding-detail.tsx          # Full finding view
        finding-form.tsx            # Create/edit finding form
        finding-state-badge.tsx     # State indicator
        finding-type-selector.tsx   # Type + risk + materiality
        signal-to-finding-dialog.tsx # Convert signal to finding
        ai-finding-badge.tsx        # AI-contribution indicator
      recommendations/
        recommendation-list.tsx     # Recommendations list
        recommendation-row.tsx      # Single recommendation row
        recommendation-detail.tsx   # Full recommendation view
        recommendation-form.tsx     # Create/edit recommendation
        recommendation-state-badge.tsx # State indicator
        ai-draft-badge.tsx          # AI draft indicator (UX4)
        ai-suggestion-panel.tsx     # AI suggestion with accept/edit/reject
        evidence-trace-chain.tsx    # Visual evidence trace
      review/
        review-queue.tsx            # Queue list with sorting
        review-item-card.tsx        # Item in queue
        review-panel.tsx            # Full review interface
        review-verdict-controls.tsx # Accept/Modify/Reject (UX9)
        comment-input.tsx           # Rationale input
        inline-evidence-viewer.tsx  # Evidence inline (UX2)
        ai-vs-human-indicator.tsx   # Distinction marker (UX4)
        keyboard-shortcuts.tsx      # High-throughput review (UX8)
      approval/
        approval-queue.tsx          # Approver queue
        approval-item-card.tsx      # Item in approval queue
        approval-panel.tsx          # Full approval interface
        approval-action-buttons.tsx # Accept/Modify/Reject
        approval-authority-check.tsx # Authority indicator
        governance-status-badge.tsx # Governance visible (UX5)
      publication/
        publication-list.tsx        # Published items
        publication-view.tsx        # Client-facing published view (P1)
        publication-immutable-badge.tsx # Immutable marker
        evidence-trace-report.tsx   # Full evidence trace for publication
      audit-trail/
        event-list.tsx              # Chronological event log
        event-row.tsx               # Single event
        event-detail-dialog.tsx     # Event detail
        trace-graph.tsx             # Bidirectional trace visualization
      ai/
        ai-suggestion-card.tsx      # Generic AI suggestion display
        ai-governance-badge.tsx     # Model version, confidence
        ai-disclosure-panel.tsx     # Full AI metadata disclosure
      traceability/
        trace-graph-view.tsx        # Interactive trace graph
        trace-node.tsx              # Single node in graph
        trace-edge.tsx              # Relationship in graph
        forward-trace-panel.tsx     # Source → Output
        backward-trace-panel.tsx    # Output → Source

    ui/                             # Keep existing UI components
      badge.tsx
      button.tsx
      card.tsx
      dialog.tsx
      input.tsx
      label.tsx
      select.tsx
      table.tsx
      tabs.tsx
      textarea.tsx

  lib/
    audit/                          # New AuditOS services
      workflow.ts                   # WorkflowService
      validation.ts                 # ValidationService
      account-mapping.ts            # AccountMappingService
      evidence.ts                   # EvidenceService
      findings.ts                   # FindingsService
      recommendations.ts            # RecommendationService
      review.ts                     # ReviewService
      approval.ts                   # ApprovalService
      publication.ts                # PublicationService
      audit-events.ts               # AuditEventService
      ai-service.ts                 # AIService
      workflow-state.ts             # State machine definitions
      guards.ts                     # Guard evaluation logic
      traceability.ts               # Traceability queries
      seed.ts                       # Seed data for development
      canonical-model.ts            # Canonical financial model data
    (existing)                      # Keep existing lib

  types/
    audit/                          # New AuditOS types
      engagement.ts                 # Engagement types
      trial-balance.ts              # Trial balance types
      mapping.ts                    # Account mapping types
      validation.ts                 # Validation types
      evidence.ts                   # Evidence types
      findings.ts                   # Finding types
      recommendations.ts            # Recommendation types
      review.ts                     # Review types
      approval.ts                   # Approval types
      publication.ts                # Publication types
      audit-events.ts               # Event types
      ai.ts                         # AI suggestion types
      workflow.ts                   # Workflow state types
      traceability.ts               # Traceability types
      index.ts                      # Barrel exports
```

---

## 2. Component Inventory

### Phase 1 — Prototype Foundation

| Component | Props/Inputs | Data Dependencies | State It Manages | Key Behaviors |
|-----------|-------------|-------------------|------------------|---------------|
| `audit-sidebar.tsx` | `engagementId?`, `currentRoute` | Engagement title from route | Active nav item | Navigation between audit modules; highlights current step |
| `audit-header.tsx` | `engagementId` | Engagement name, client, workflow state via Server Action | None (reads from parent) | Displays engagement context; breadcrumbs |
| `workflow-progress.tsx` | `currentState`, `states[]`, `transitionErrors[]` | Workflow state machine definition | None (pure display) | Visual stepper; highlights current, blocked, completed states; shows error on blocked |
| `engagement-card.tsx` | `engagement` | Engagement summary from `getEngagements()` | None | Links to engagement detail; shows key metrics |
| `engagement-list.tsx` | `engagements[]`, `loading` | `getEngagements()` | Sorting, filtering | Lists engagements; link to detail; search/filter |
| `engagement-form.tsx` | `onSubmit`, `existingData?` | Clients list, team members | Form fields for name, client, type, period | Create/edit engagement dialog |
| `team-assignment.tsx` | `engagementId`, `members[]`, `editable` | Available users from org | Selected team | Add/remove team members with role scoping |
| `engagement-detail-header.tsx` | `engagement` | Full engagement + client data | None | Shows client name, fiscal period, engagement type, status |
| `workflow-status-badge.tsx` | `state` | Workflow state enum | None | Color-coded badge for current workflow state |

### Phase 2 — Engagement and Trial Balance

| Component | Props/Inputs | Data Dependencies | State It Manages | Key Behaviors |
|-----------|-------------|-------------------|------------------|---------------|
| `tb-upload-dropzone.tsx` | `engagementId`, `onUploadComplete` | File parsing route | File selected, uploading, error, success | Drag-and-drop; file type validation (CSV/XLSX); upload progress |
| `tb-preview-table.tsx` | `accounts[]`, `mappingStatus` | `getTrialBalance()` | Sort column, page | Display parsed accounts in scrollable grid |
| `tb-parse-result.tsx` | `result` | Parse result from server | None | Shows success count, error list, trust state |
| `trust-state-indicator.tsx` | `trustState` | Trust state enum | None | Visual indicator (green/yellow/red) for trust level |
| `column-mapping-dialog.tsx` | `headers[]`, `onConfirm` | Detected headers from uploaded file | Selected column mappings | UI for mapping file columns to expected fields |
| `mapping-table.tsx` | `mappings[]` | `getMappings()` | Sort, filter | List of accounts with mapping status |
| `mapping-row.tsx` | `account`, `suggestions`, `onMap` | Suggestions from `suggestMappings()` | Expanded/collapsed | Shows account + current mapping + ability to change |
| `mapping-suggestion.tsx` | `suggestions[]`, `onAccept`, `onReject` | AI suggestions | Selected suggestion | Dropdown showing ranked AI suggestions with confidence |
| `mapping-progress-bar.tsx` | `mapped`, `total` | Mapping counts | None | Visual progress toward 100% |
| `mapping-stats.tsx` | `stats` | Mapping statistics | None | Summary: auto, manual, unmapped, ambiguous |

### Phase 3 — Mapping and Validation

| Component | Props/Inputs | Data Dependencies | State It Manages | Key Behaviors |
|-----------|-------------|-------------------|------------------|---------------|
| `validation-runner.tsx` | `engagementId`, `onRun` | Validation trigger action | Running, completed, error | Button to trigger validation; shows status |
| `validation-results.tsx` | `results[]` | `getValidationResults()` | Expanded sections | Grouped by type (structural, balance, trust); pass/fail/warning |
| `validation-detail-row.tsx` | `detail` | Single check result | None | Shows check name, expected vs actual, severity |
| `anomaly-flag-list.tsx` | `flags[]` | Anomaly flags | Disposition state | List of flags with assign/disposition controls |
| `anomaly-flag-dialog.tsx` | `flag`, `onDispose` | Flag detail | Rationale text, disposition | Dialog for reviewed/investigated/dismissed + rationale |
| `statement-viewer.tsx` | `accounts[]`, `canonicalModelVersion` | `getFinancialStatements()` | None | Renders draft balance sheet / P&L from mapped accounts |
| `statement-line-item.tsx` | `label`, `value`, `accounts[]` | Aggregated balances | None | Single line; click to drill into underlying accounts |
| `statement-mapping-detail.tsx` | `accounts[]` | Account details | None | Shows which accounts roll up to a statement line |
| `notes-checklist.tsx` | `engagement` | Canonical model + account types | Checked items | Lists required disclosures; marks as draftable/missing |
| `notes-item.tsx` | `note`, `status` | Note status | None | Individual disclosure note with draft/missing indicator |
| `notes-missing-indicator.tsx` | `missingItems[]` | Missing info list | None | Warning list of disclosures needing manual input |

### Phase 4 — Statements and Notes

*(Same components as Phase 3's statements/notes — these are built alongside validation)*

### Phase 5 — Evidence, Findings, Recommendations

| Component | Props/Inputs | Data Dependencies | State It Manages | Key Behaviors |
|-----------|-------------|-------------------|------------------|---------------|
| `evidence-upload-dropzone.tsx` | `engagementId`, `accountId?`, `targetType?` | Upload route | Files, progress, errors | Multi-file upload with progress; file type + size validation |
| `evidence-list.tsx` | `evidence[]` | `getEvidenceList()` | Filters, sort | Filterable/sortable list with state badges |
| `evidence-row.tsx` | `evidenceItem` | Single evidence | None | Shows filename, state, uploader, date, links |
| `evidence-viewer.tsx` | `evidenceId` | File content / presigned URL | Loading, zoom, page | Inline document viewer (PDF, image); thumbnail grid |
| `evidence-link-dialog.tsx` | `evidenceId`, `targetTypes[]` | Available targets (accounts, findings) | Link type, target selection | Create typed evidence link |
| `evidence-state-badge.tsx` | `state` | Evidence state enum | None | Color-coded badge |
| `evidence-verify-controls.tsx` | `evidenceId`, `onVerify`, `onReject` | Current state | None | Verify / mark insufficient / reject buttons |
| `finding-list.tsx` | `findings[]` | `getFindings()` | Filters, sort | Filtered by state, type, risk |
| `finding-row.tsx` | `finding` | Single finding | None | Summary row with state, type, risk, evidence count |
| `finding-detail.tsx` | `findingId` | `getFinding()` | None | Full view: description, evidence links, audit trail |
| `finding-form.tsx` | `finding?`, `signal?`, `onSubmit` | Evidence list, signal data | Form fields | Create/edit with type, risk, materiality, evidence refs |
| `finding-state-badge.tsx` | `state` | Finding state enum | None | Color-coded badge |
| `finding-type-selector.tsx` | `onChange` | None | Selected type, risk, materiality | Dropdowns for type/risk/materiality |
| `signal-to-finding-dialog.tsx` | `signal`, `onCreate` | Signal detail + evidence | Edited finding fields | Pre-fills finding from signal; allows editing before create |
| `ai-finding-badge.tsx` | `aiContributed`, `modelVersion`, `confidence` | AI metadata | None | Visual marker: AI-drafted with model info (UX4) |
| `recommendation-list.tsx` | `recommendations[]` | `getRecommendations()` | Filters, sort | List with state, finding link, AI flag |
| `recommendation-row.tsx` | `rec` | Single rec | None | Summary with state, finding, AI badge |
| `recommendation-detail.tsx` | `recId` | `getRecommendation()` | None | Full view with evidence chain |
| `recommendation-form.tsx` | `findingId`, `aiSuggestion?`, `onSubmit` | Finding detail, AI draft | Form fields | Create/edit; shows AI draft for acceptance/modification |
| `recommendation-state-badge.tsx` | `state` | Rec state enum | None | Color-coded badge |
| `ai-draft-badge.tsx` | `suggestion` | AI suggestion metadata | None | "AI-drafted" badge with model, confidence | 
| `ai-suggestion-panel.tsx` | `suggestion`, `currentContent`, `onAccept`, `onEdit`, `onReject` | Full AI suggestion | Selected action | Side-by-side comparison of AI vs current; accept/edit/reject (UX9) |
| `evidence-trace-chain.tsx` | `targetType`, `targetId` | Traceability data | None | Visual chain: evidence → account → finding → rec |

### Phase 6 — Review, Approval, Publication

| Component | Props/Inputs | Data Dependencies | State It Manages | Key Behaviors |
|-----------|-------------|-------------------|------------------|---------------|
| `review-queue.tsx` | `items[]` | `getReviewQueue()` | Sort order, filters | Prioritized list; sort by risk, materiality, deadline, age |
| `review-item-card.tsx` | `item` | Single review item | None | Card showing type, target, risk, evidence count |
| `review-panel.tsx` | `itemId`, `itemType` | Full item detail | Active tab | Unified review: evidence, finding, recommendation |
| `review-verdict-controls.tsx` | `onVerdict` | None | Selected verdict | Accept / Modify / Reject buttons equally prominent (UX9) |
| `comment-input.tsx` | `onComment`, `required` | None | Text, character count | Rationale input; enforces minimum length for rejection |
| `inline-evidence-viewer.tsx` | `evidenceId` | Evidence file | Zoom, page | Embedded viewer within review panel (UX2) |
| `ai-vs-human-indicator.tsx` | `item`, `aiMetadata` | AI contribution data | None | Visual distinction: AI vs human content (UX4) |
| `keyboard-shortcuts.tsx` | `actions` | Available actions | None | Register keyboard shortcuts (UX8) |
| `approval-queue.tsx` | `items[]` | `getApprovalStatus()` | Sort, filters | Pending approvals sorted by risk |
| `approval-item-card.tsx` | `item` | Approval item | None | Card showing recommendation + risk tier |
| `approval-panel.tsx` | `itemId` | Full recommendation detail | Active view | Complete review + approve/modify/reject |
| `approval-action-buttons.tsx` | `onAccept`, `onModify`, `onReject` | None | None | Three equally prominent actions (UX9) |
| `approval-authority-check.tsx` | `requiredTier`, `userRole` | User role + governance rules | None | Shows whether user has authority for this risk tier |
| `governance-status-badge.tsx` | `item`, `checks[]` | Governance rules | None | Shows governance check results: passed/blocked (UX5) |
| `publication-list.tsx` | `publications[]` | `getPublications()` | None | List of published recommendations |
| `publication-view.tsx` | `publicationId` | Full publication data | None | Client-facing immutable view |
| `publication-immutable-badge.tsx` | `publishedAt` | Publish timestamp | None | "Published — Immutable" badge |
| `evidence-trace-report.tsx` | `publicationId` | Full traceability data | None | Complete evidence trace for client view |
| `event-list.tsx` | `events[]` | `getAuditEvents()` | Filter by type | Chronological event log |
| `event-row.tsx` | `event` | Single event | None | Event summary: actor, action, target, timestamp |
| `event-detail-dialog.tsx` | `event` | Full event data | None | Detailed event view with metadata |
| `trace-graph.tsx` | `engagementId` | Full trace data | Selected node | Interactive forward/backward trace |
| `ai-suggestion-card.tsx` | `suggestion` | AI suggestion data | None | Reusable card for any AI suggestion display |
| `ai-governance-badge.tsx` | `modelVersion`, `confidence`, `inputHash` | AI metadata | None | Governance disclosure badge |
| `ai-disclosure-panel.tsx` | `suggestion` | Full AI suggestion | None | Complete AI disclosure: model, method, limitations |
| `trace-graph-view.tsx` | `engagementId`, `nodeType?`, `entityId?` | Full traceability data | Selected path, zoom | Interactive graph visualization |
| `trace-node.tsx` | `node`, `isSelected` | Node data | None | Clickable node with type icon |
| `trace-edge.tsx` | `edge` | Edge data | None | Relationship label |
| `forward-trace-panel.tsx` | `sourceId`, `sourceType` | Traceability forward | Expanded nodes | Source → Output traversal |
| `backward-trace-panel.tsx` | `targetId`, `targetType` | Traceability backward | Expanded nodes | Output → Source traversal |

---

## 3. Service Layer

### WorkflowService

```
File: src/lib/audit/workflow.ts
```

```typescript
interface WorkflowService {
  // State machine definitions
  getStateMachine(entityType: EntityType): StateMachineDefinition

  // State transitions
  transition(entityType: EntityType, entityId: string, toState: string, actor: CurrentUser, context?: TransitionContext): Promise<TransitionResult>
  getAvailableTransitions(entityType: EntityType, entityId: string, actor: CurrentUser): Promise<Transition[]>

  // Guard evaluation
  evaluateGuards(definition: StateMachineDefinition, from: string, to: string, entity: any, actor: CurrentUser): Promise<GuardResult[]>
  canTransition(entityType: EntityType, entityId: string, toState: string, actor: CurrentUser): Promise<{ allowed: boolean; failures: GuardFailure[] }>

  // Workflow state for engagement
  getEngagementWorkflowState(engagementId: string): Promise<EngagementWorkflowState>
  getEngagementBlockers(engagementId: string): Promise<Blocker[]>

  // Event emission
  onTransition(entityType: string, entityId: string, fromState: string, toState: string, actor: CurrentUser, context: TransitionContext): Promise<void>
}
```

**Key behaviors:**
- Evaluates guards synchronously in order: actor authorization → tenant scope → evidence check → governance rules → dependency check → AI check
- Returns structured `GuardFailure` with guard name, reason, and severity
- Emits audit event on every successful transition via `AuditEventService`
- Manages entity state machines: Engagement, Evidence, Finding, Recommendation, Approval, Publication

### ValidationService

```
File: src/lib/audit/validation.ts
```

```typescript
interface ValidationService {
  runValidation(engagementId: string, types: ValidationType[], actor: CurrentUser): Promise<ValidationResult>
  getValidationResults(engagementId: string, types?: ValidationType[]): Promise<ValidationResult[]>

  // Individual checks
  checkBalanceEquality(engagementId: string): Promise<ValidationDetail>
  checkAccountRelationships(engagementId: string): Promise<ValidationDetail>
  checkPeriodConsistency(engagementId: string): Promise<ValidationDetail>
  checkClassification(engagementId: string): Promise<ValidationDetail>
  checkRatioAnomalies(engagementId: string): Promise<ValidationDetail>

  // Trust assessment
  computeTrustState(engagementId: string): Promise<TrustState>
  getTrustState(engagementId: string): Promise<TrustState>

  // Anomaly flags
  getAnomalyFlags(engagementId: string): Promise<AnomalyFlag[]>
  disposeAnomalyFlag(flagId: string, disposition: Disposition, rationale: string, actor: CurrentUser): Promise<void>

  // Evidence sufficiency
  checkEvidenceSufficiency(engagementId: string): Promise<ValidationDetail>
}
```

**Key behaviors:**
- Runs checks against trial balance + mapped accounts
- Produces structured `ValidationDetail` per check with expected vs actual
- Computes trust state from aggregate check results
- Anomaly disposition requires human action with rationale

### AccountMappingService

```
File: src/lib/audit/account-mapping.ts
```

```typescript
interface AccountMappingService {
  getMappings(engagementId: string): Promise<AccountMapping[]>
  getUnmappedAccounts(engagementId: string): Promise<Account[]>

  // AI suggestions
  suggestMappings(engagementId: string, aiService: AIService): Promise<MappingSuggestion[]>
  getSuggestions(engagementId: string, accountId: string): Promise<MappingSuggestion[]>

  // Confirmation
  confirmMapping(mappingId: string, suggestionId: string | null, actor: CurrentUser): Promise<AccountMapping>
  manualMapping(accountId: string, canonicalAccountId: string, actor: CurrentUser): Promise<AccountMapping>
  confirmAllMapped(engagementId: string, actor: CurrentUser): Promise<void>

  // Validation
  validateMappingCompleteness(engagementId: string): Promise<{ allMapped: boolean; unmappedCount: number; ambiguousCount: number }>
}
```

**Key behaviors:**
- Delegates AI suggestion generation to `AIService`
- Records `mapping_type` as `ai_suggested` or `human_mapped`
- Preserves `ai_suggestion_id` for governance trace
- Blocks workflow advancement if `unmappedCount > 0`

### EvidenceService

```
File: src/lib/audit/evidence.ts
```

```typescript
interface EvidenceService {
  uploadFile(engagementId: string, file: File, actor: CurrentUser, targetContext?: EvidenceTargetContext): Promise<Evidence>
  getEvidenceList(engagementId: string, filters?: EvidenceFilters): Promise<Evidence[]>
  getEvidence(evidenceId: string): Promise<Evidence>
  getPresignedUrl(evidenceId: string): Promise<string>

  // State transitions
  verifyEvidence(evidenceId: string, actor: CurrentUser): Promise<Evidence>
  markInsufficient(evidenceId: string, rationale: string, actor: CurrentUser): Promise<Evidence>
  rejectEvidence(evidenceId: string, rationale: string, actor: CurrentUser): Promise<Evidence>

  // Evidence linking
  createEvidenceLink(evidenceId: string, targetType: LinkTargetType, targetId: string, linkType: LinkType, context: string, actor: CurrentUser): Promise<EvidenceLink>
  removeEvidenceLink(linkId: string, actor: CurrentUser): Promise<void>
  getEvidenceLinks(evidenceId: string): Promise<EvidenceLink[]>
  getEvidenceForTarget(targetType: string, targetId: string): Promise<Evidence[]>

  // Integrity
  verifyFileHash(evidenceId: string): Promise<boolean>
  computeFileHash(file: Buffer): string
}
```

**Key behaviors:**
- Computes SHA-256 hash server-side on upload
- Stores file to S3-compatible storage with key pattern `{orgId}/{engagementId}/{uuid}`
- Evidence state machine: Candidate → Verified → Accepted → Referenced (with Rejected/Insufficient paths)
- Only Verified evidence can support findings
- File metadata immutable after `Verified` state

### FindingsService

```
File: src/lib/audit/findings.ts
```

```typescript
interface FindingsService {
  // CRUD
  getFindings(engagementId: string, filters?: FindingFilters): Promise<Finding[]>
  getFinding(findingId: string): Promise<Finding>
  createFinding(data: CreateFindingInput, actor: CurrentUser, aiSuggestionId?: string): Promise<Finding>
  updateFinding(findingId: string, data: UpdateFindingInput, actor: CurrentUser): Promise<Finding>

  // State transitions
  submitForReview(findingId: string, actor: CurrentUser): Promise<Finding>       // Draft → ReviewReady
  startReview(findingId: string, actor: CurrentUser): Promise<Finding>           // ReviewReady → InReview
  approveFinding(findingId: string, actor: CurrentUser): Promise<Finding>        // InReview → Approved
  escalateFinding(findingId: string, rationale: string, actor: CurrentUser): Promise<Finding> // Any → Escalated
  withdrawFinding(findingId: string, rationale: string, actor: CurrentUser): Promise<Finding> // Any → Withdrawn

  // Evidence enforcement
  validateEvidenceRequirement(findingId: string): Promise<{ hasVerifiedEvidence: boolean; evidenceCount: number }>
}
```

**Key behaviors:**
- Manages finding state machine: Draft → ReviewReady → InReview → Approved → Published → Escalated → Withdrawn
- Enforces ≥1 verified evidence link on Draft → ReviewReady transition
- AI-generated findings start as Draft (cannot bypass)
- Records `ai_contributed` flag and optional `ai_suggestion_id`

### RecommendationService

```
File: src/lib/audit/recommendations.ts
```

```typescript
interface RecommendationService {
  // CRUD
  getRecommendations(engagementId: string, filters?: RecFilters): Promise<Recommendation[]>
  getRecommendation(recId: string): Promise<Recommendation>
  createRecommendation(findingId: string, data: CreateRecInput, actor: CurrentUser, aiSuggestionId?: string): Promise<Recommendation>
  updateRecommendation(recId: string, data: UpdateRecInput, actor: CurrentUser): Promise<Recommendation>

  // State transitions
  submitForApproval(recId: string, actor: CurrentUser): Promise<Recommendation>  // Draft → PendingApproval
  approve(recId: string, actor: CurrentUser): Promise<Recommendation>            // PendingApproval → Approved
  reject(recId: string, rationale: string, actor: CurrentUser): Promise<Recommendation> // PendingApproval → Rejected
  modifyAndApprove(recId: string, modifications: Partial<RecContent>, actor: CurrentUser): Promise<Recommendation>

  // AI integration
  aiDraftRecommendation(findingId: string, aiService: AIService): Promise<AiRecommendationSuggestion>
}
```

**Key behaviors:**
- Manages recommendation state machine: Draft → PendingApproval → Approved → Rejected → Published
- AI suggestions are candidates, never auto-applied
- Records `ai_contributed`, `ai_suggestion_id`, `model_version`, `human_edited`, `human_finalized`
- `Reject` requires rationale > 20 chars

### ReviewService

```
File: src/lib/audit/review.ts
```

```typescript
interface ReviewService {
  // Queue management
  getReviewQueue(userId: string, filters?: QueueFilters): Promise<ReviewItem[]>
  getEngagementReviewQueue(engagementId: string, filters?: QueueFilters): Promise<ReviewItem[]>
  sortQueue(items: ReviewItem[], strategy: SortStrategy): ReviewItem[]

  // Review actions
  submitReviewComment(targetType: ReviewTargetType, targetId: string, verdict: ReviewVerdict, rationale: string, actor: CurrentUser): Promise<ReviewRecord>
  getReviewHistory(targetType: string, targetId: string): Promise<ReviewRecord[]>
}
```

**Key behaviors:**
- Aggregates reviewable items (evidence, findings, recommendations)
- Sorts by risk (critical first), materiality, deadline, age
- All verdicts recorded with actor identity and timestamp
- Rejection rationale enforced as mandatory

### ApprovalService

```
File: src/lib/audit/approval.ts
```

```typescript
interface ApprovalService {
  // Authority
  checkApprovalAuthority(user: CurrentUser, riskTier: RiskTier): Promise<{ authorized: boolean; requiredTier: string }>

  // CRUD
  getApprovalStatus(recId: string): Promise<ApprovalStatus>
  getPendingApprovals(userId: string): Promise<ApprovalItem[]>

  // Actions
  approveRecommendation(recId: string, actor: CurrentUser): Promise<Approval>
  modifyAndApprove(recId: string, modifications: Partial<RecContent>, actor: CurrentUser): Promise<Approval>
  rejectRecommendation(recId: string, rationale: string, actor: CurrentUser): Promise<Approval>

  // Governance
  validateApprovalGovernance(recId: string, actor: CurrentUser): Promise<GovernanceCheckResult>
  recordApprovalEvent(approval: Approval): Promise<void>
}
```

**Key behaviors:**
- Enforces approval authority tier matching recommendation risk rating
- No auto-approve — every approval requires explicit human action
- Override paths (Modify/Reject) equally accessible as Accept (UX9)
- Records approver identity, action, rationale, timestamp

### PublicationService

```
File: src/lib/audit/publication.ts
```

```typescript
interface PublicationService {
  publishPackage(recId: string, actor: CurrentUser): Promise<PublishedRecommendation>
  getPublications(engagementId: string): Promise<PublishedRecommendation[]>
  getPublished(publicationId: string): Promise<PublishedRecommendation>

  // Evidence trace
  materializeEvidenceTrace(publicationId: string): Promise<EvidenceTraceReport>
  freezeEvidenceRefs(recId: string): Promise<void>
}
```

**Key behaviors:**
- Generates immutable published record from approved recommendation
- Freezes evidence references at publish time
- Published content is immutable; only status may transition
- Supersession creates new record linked to previous

### AuditEventService

```
File: src/lib/audit/audit-events.ts
```

```typescript
interface AuditEventService {
  recordEvent(event: CreateAuditEventInput): Promise<AuditEvent>
  getEvents(engagementId: string, filters?: EventFilters): Promise<AuditEvent[]>
  getEventsForTarget(targetType: string, targetId: string): Promise<AuditEvent[]>

  // Traceability
  getTraceability(engagementId: string): Promise<TraceabilityGraph>
  getForwardTrace(sourceType: string, sourceId: string): Promise<TraceabilityPath[]>
  getBackwardTrace(targetType: string, targetId: string): Promise<TraceabilityPath[]>

  // Integrity
  verifyEventChain(engagementId: string): Promise<{ valid: boolean; brokenLinks: string[] }>
  computeEventHash(event: AuditEvent): string
}
```

**Key behaviors:**
- Append-only writes to event store
- Event schema: event_type, actor_id, tenant_id, target_type, target_id, previous_state, new_state, evidence_refs, metadata, timestamp, sequence
- Event hash chain for integrity verification (SHA-256 of all fields + previous hash)
- Traceability computed from event store + foreign key relationships + evidence_links

### AIService

```
File: src/lib/audit/ai-service.ts
```

```typescript
interface AIService {
  // Account mapping
  suggestMappings(accounts: Account[], canonicalAccounts: CanonicalAccount[], engagementContext: EngagementContext): Promise<AiMappingSuggestion[]>

  // Signal generation
  generateSignals(accounts: Account[], validationResults: ValidationResult[], evidenceStatus: EvidenceStatus[]): Promise<AiSignal[]>

  // Drafting
  draftFindingLanguage(signal: Signal, evidenceRefs: Evidence[], accountContext: Account): Promise<AiFindingDraft>
  draftRecommendation(finding: Finding, evidenceRefs: Evidence[], accountContext: Account): Promise<AiRecommendationSuggestion>

  // Summarization
  summarizeEvidence(evidence: Evidence[]): Promise<AiEvidenceSummary>

  // Queue ranking
  rankReviewQueue(items: ReviewItem[], context: RankingContext): Promise<RankedReviewItem[]>

  // Governance wrapper
  validateSuggestion(suggestion: AiSuggestion): Promise<GovernanceValidationResult>
  recordSuggestion(suggestion: AiSuggestion): Promise<void>
}
```

**Key behaviors:**
- All AI output flows through governance wrapper before surfacing
- Governance wrapper enforces: no decision content, evidence trace required, model version recorded, confidence threshold, input context captured
- AI has no write access to workflow state — output is suggestion only
- Every suggestion recorded to `ai_suggestions` table with full metadata
- Three-zone model enforced: Governed Automation, Assisted Decision, Human Authority

---

## 4. Implementation Phases

### Phase 1: Prototype Foundation

**Goal:** App shell, navigation, layout, design system, seed data, engagement dashboard.

| Item | Details |
|------|---------|
| **Components** | audit-sidebar, audit-header, workflow-progress, engagement-card, engagement-list, engagement-form, team-assignment, engagement-detail-header, workflow-status-badge |
| **Services** | WorkflowService (state machine definitions only) |
| **Routes** | `/audit` (dashboard), `/audit/engagements/[engagementId]` (detail shell) |
| **Data seeding** | 2-3 sample engagements with clients, team assignments, initialized workflow states |
| **Build order** | 1. AuditOS layout + sidebar + header → 2. Engagement dashboard page → 3. Workflow state machine definitions → 4. Workflow-progress component → 5. Engagement creation form → 6. Engagement detail shell → 7. Seed data script → 8. Route wiring |

**Estimated effort:** 3-4 days  
**Validation:** Dashboard shows seeded engagements. Clickthrough to detail page works. Workflow stepper renders correct state.

---

### Phase 2: Engagement and Trial Balance

**Goal:** Trial balance upload, parsing, preview.

| Item | Details |
|------|---------|
| **Components** | tb-upload-dropzone, tb-preview-table, tb-parse-result, trust-state-indicator, column-mapping-dialog |
| **Services** | WorkflowService (DataIntake transitions) |
| **Routes** | `/audit/engagements/[engagementId]/trial-balance` |
| **Data seeding** | Sample CSV/XLSX trial balance files (10-20 accounts) |
| **Build order** | 1. Upload dropzone → 2. CSV/XLSX parser service → 3. Preview table → 4. Column mapping dialog → 5. Parse result display → 6. Trust state indicator → 7. Workflow transition (Initialized → DataIntake) |

**Estimated effort:** 4-5 days  
**Validation:** Upload CSV → parsed accounts displayed → trust state shown → engagement advances to DataIntake.

---

### Phase 3: Mapping and Validation

**Goal:** Account mapping, validation engine, anomaly flags.

| Item | Details |
|------|---------|
| **Components** | mapping-table, mapping-row, mapping-suggestion, mapping-progress-bar, mapping-stats, validation-runner, validation-results, validation-detail-row, anomaly-flag-list, anomaly-flag-dialog, statement-viewer, statement-line-item, statement-mapping-detail, notes-checklist, notes-item, notes-missing-indicator |
| **Services** | AccountMappingService, ValidationService, AIService (suggestMappings), CanonicalModelService |
| **Routes** | `/audit/engagements/[engagementId]/mapping`, `/audit/engagements/[engagementId]/validation`, `/audit/engagements/[engagementId]/statements`, `/audit/engagements/[engagementId]/notes` |
| **Data seeding** | Canonical financial model seed data (50-80 standard accounts across IFRS); historical mapping data for AI suggestions |
| **Build order** | 1. Canonical model seed data → 2. Mapping table + row components → 3. AI suggestion integration (mock initially) → 4. Mapping confirmation flow → 5. Mapping progress bar → 6. Validation engine (balance, trust) → 7. Validation UI → 8. Anomaly flags → 9. Statement viewer (draft) → 10. Notes checklist → 11. Workflow transition (DataIntake → EvidenceCollection) |

**Estimated effort:** 6-8 days  
**Validation:** All accounts mapped → validation runs → anomalies flagged → statements display draft → engagement advances.

---

### Phase 4: Statements and Notes

**Goal:** Draft financial statements and disclosure notes checklist.

*(Built concurrently with Phase 3 — components listed above)*

| Item | Details |
|------|---------|
| **Components** | *(already listed in Phase 3)* statement-viewer, statement-line-item, statement-mapping-detail, notes-checklist, notes-item, notes-missing-indicator |
| **Services** | CanonicalModelService (statement generation from mapped accounts) |
| **Routes** | `/audit/engagements/[engagementId]/statements`, `/audit/engagements/[engagementId]/notes` |

**Estimated effort:** 3-4 days (parallel with Phase 3)  
**Validation:** Draft balance sheet + P&L rendered. Notes checklist shows draftable vs missing items.

---

### Phase 5: Evidence, Findings, Recommendations

**Goal:** Evidence upload, linking, lifecycle; findings CRUD; recommendation drafting with AI.

| Item | Details |
|------|---------|
| **Components** | evidence-upload-dropzone, evidence-list, evidence-row, evidence-viewer, evidence-link-dialog, evidence-state-badge, evidence-verify-controls, finding-list, finding-row, finding-detail, finding-form, finding-state-badge, finding-type-selector, signal-to-finding-dialog, ai-finding-badge, recommendation-list, recommendation-row, recommendation-detail, recommendation-form, recommendation-state-badge, ai-draft-badge, ai-suggestion-panel, evidence-trace-chain |
| **Services** | EvidenceService, FindingsService, RecommendationService, AIService (generateSignals, draftFindingLanguage, draftRecommendation, summarizeEvidence), AuditEventService |
| **Routes** | `/audit/engagements/[engagementId]/evidence`, `/audit/engagements/[engagementId]/findings`, `/audit/engagements/[engagementId]/findings/[findingId]`, `/audit/engagements/[engagementId]/recommendations`, `/audit/engagements/[engagementId]/recommendations/[recommendationId]` |
| **Data seeding** | Sample PDF/XLSX evidence files; sample signals for demo |
| **Build order** | 1. Evidence upload + list → 2. Evidence viewer (inline) → 3. Evidence state transitions → 4. Evidence linking → 5. Signal generation (AI) → 6. Signal-to-finding conversion → 7. Finding CRUD → 8. Finding state machine → 9. AI finding draft → 10. Recommendation CRUD → 11. AI recommendation draft → 12. AI suggestion panel → 13. Evidence trace chain → 14. Workflow transitions (EvidenceCollection → Review → FindingsDrafting) |

**Estimated effort:** 8-10 days  
**Validation:** Upload evidence → verify → link to account → create finding from signal → draft recommendation with AI → workflow advances through Review.

---

### Phase 6: Review, Approval, Publication

**Goal:** Review queues, approval engine, immutable publication, event store.

| Item | Details |
|------|---------|
| **Components** | review-queue, review-item-card, review-panel, review-verdict-controls, comment-input, inline-evidence-viewer, ai-vs-human-indicator, keyboard-shortcuts, approval-queue, approval-item-card, approval-panel, approval-action-buttons, approval-authority-check, governance-status-badge, publication-list, publication-view, publication-immutable-badge, evidence-trace-report, event-list, event-row, event-detail-dialog, trace-graph, ai-suggestion-card, ai-governance-badge, ai-disclosure-panel, trace-graph-view, trace-node, trace-edge, forward-trace-panel, backward-trace-panel |
| **Services** | ReviewService, ApprovalService, PublicationService, AuditEventService (full), TraceabilityService, AIService (rankReviewQueue) |
| **Routes** | `/audit/review-queue`, `/audit/engagements/[engagementId]/review`, `/audit/engagements/[engagementId]/approval`, `/audit/engagements/[engagementId]/publication`, `/audit/engagements/[engagementId]/audit-trail`, `/published/[publicationId]` |
| **Data seeding** | Review-ready seeded recommendations with varying risk tiers |
| **Build order** | 1. Review queue service → 2. Review queue UI → 3. Review panel (inline evidence) → 4. AI vs human indicators → 5. Keyboard shortcuts → 6. Approval queue → 7. Approval panel → 8. Authority checks → 9. Governance status badges → 10. Publication service (immutable) → 11. Publication view → 12. Client-facing view → 13. Event store (append-only) → 14. Audit event log UI → 15. Traceability graph → 16. Forward/backward trace panels → 17. Workflow transitions (FindingsDrafting → Approval → Publication → Completed) |

**Estimated effort:** 8-10 days  
**Validation:** Full end-to-end flow: review → approve → publish → view published → trace from published back to evidence.

---

### Phase 7: Polish and Demo Readiness

**Goal:** Error states, loading states, responsive design, AI governance audit, demo script validation.

| Item | Details |
|------|---------|
| **Components** | Error boundary wrappers, loading skeleton components, empty state components, responsive layout refinements |
| **Services** | AI governance audit pass; tenant isolation audit; performance optimization |
| **Routes** | Route guard enforcement; permission checks on all routes |
| **Build order** | 1. Error boundary pass → 2. Loading states and skeletons → 3. Empty states → 4. Responsive design → 5. AI governance audit → 6. Tenant isolation audit → 7. Keyboard shortcuts finalization → 8. Demo seed data refinement → 9. Demo script walkthrough → 10. Bug fixes |

**Estimated effort:** 4-5 days  
**Validation:** Full demo walkthrough in <10 minutes. No console errors. All AI outputs marked. All state transitions logged. Tenant isolation verified.

---

## 5. API / Server Action Contracts

All server actions are implemented as Next.js Server Actions under `src/app/audit/_actions/` or as inline actions. Each follows the pattern:

```typescript
"use server"
import { requireUserContext } from "@/lib/auth"
// ... implementation
```

### Engagement Actions

#### `getEngagements`
```typescript
async function getEngagements(filters?: { status?: EngagementStatus; clientId?: string; query?: string }): Promise<EngagementSummary[]>
```
- **Auth:** `requireUserContext("VIEWER")`
- **Data:** Select engagements for user's org where user is on team (or all for admin/partner)
- **Returns:** `{ id, clientName, clientId, fiscalPeriod, engagementType, workflowState, teamCount, evidenceCount, findingCount }`

#### `getEngagementDetail`
```typescript
async function getEngagementDetail(engagementId: string): Promise<EngagementDetail>
```
- **Auth:** `requireOrgAccess(engagement.organizationId, "VIEWER")`
- **Data:** Full engagement + client + team + workflow state + blockers
- **Returns:** `{ engagement, client, team, workflowState, availableTransitions, blockers, stats }`

#### `createEngagement`
```typescript
async function createEngagement(data: CreateEngagementInput): Promise<Engagement>
```
- **Auth:** `requireUserContext("MANAGER")` (or equivalent)
- **Data:** Creates engagement with Initialized state, assigns team
- **Returns:** Created engagement

### Trial Balance Actions

#### `uploadTrialBalance`
```typescript
async function uploadTrialBalance(engagementId: string, formData: FormData): Promise<UploadResult>
```
- **Auth:** `requireDecisionAccess(engagementId, "OPERATOR")`
- **Data:** Parses CSV/XLSX, extracts accounts, runs structural validation, computes trust state
- **Returns:** `{ trialBalanceId, accountsCount, trustState, errors: ParseError[], warnings: ParseWarning[] }`

#### `getTrialBalance`
```typescript
async function getTrialBalance(engagementId: string): Promise<TrialBalanceData>
```
- **Auth:** `requireDecisionAccess(engagementId, "VIEWER")`
- **Data:** Current trial balance + accounts + trust state
- **Returns:** `{ trialBalance, accounts: Account[], trustState }`

### Mapping Actions

#### `suggestMappings`
```typescript
async function suggestMappings(engagementId: string): Promise<MappingSuggestion[]>
```
- **Auth:** `requireDecisionAccess(engagementId, "OPERATOR")`
- **Data:** For each unmapped account, AI suggests top 3-5 canonical accounts
- **Returns:** `{ accountId, suggestions: [{ canonicalAccountId, accountName, confidence, matchType }] }[]`

#### `confirmMapping`
```typescript
async function confirmMapping(accountId: string, canonicalAccountId: string, suggestionId?: string): Promise<AccountMapping>
```
- **Auth:** `requireDecisionAccess(engagementId, "OPERATOR")`
- **Data:** Creates AccountMapping record, records mapping_type and ai_suggestion_id if applicable
- **Returns:** Created mapping

### Validation Actions

#### `runValidation`
```typescript
async function runValidation(engagementId: string, validationTypes?: ValidationType[]): Promise<ValidationRunResult>
```
- **Auth:** `requireDecisionAccess(engagementId, "OPERATOR")`
- **Data:** Runs selected validation checks, produces results and anomaly flags
- **Returns:** `{ runId, results: ValidationResult[], anomalyFlags: AnomalyFlag[], trustState }`

#### `getValidationResults`
```typescript
async function getValidationResults(engagementId: string): Promise<ValidationRunResult>
```
- **Auth:** `requireDecisionAccess(engagementId, "VIEWER")`
- **Data:** Latest validation results
- **Returns:** Latest validation run result

### Statement Actions

#### `getFinancialStatements`
```typescript
async function getFinancialStatements(engagementId: string): Promise<FinancialStatements>
```
- **Auth:** `requireDecisionAccess(engagementId, "VIEWER")`
- **Data:** Generates draft financial statements from mapped accounts + canonical model
- **Returns:** `{ balanceSheet: StatementSection[], incomeStatement: StatementSection[], notesChecklist: NoteItem[] }`

### Evidence Actions

#### `getEvidenceList`
```typescript
async function getEvidenceList(engagementId: string, filters?: EvidenceFilters): Promise<EvidenceWithLinks[]>
```
- **Auth:** `requireDecisionAccess(engagementId, "VIEWER")`
- **Data:** Evidence items with their links
- **Returns:** `{ evidence, links: EvidenceLink[] }[]`

#### `uploadEvidence`
```typescript
async function uploadEvidence(engagementId: string, formData: FormData): Promise<EvidenceUploadResult>
```
- **Auth:** `requireDecisionAccess(engagementId, "OPERATOR")`
- **Data:** Uploads file to S3, computes hash, creates evidence record
- **Returns:** `{ evidence, presignedUrl }`

#### `verifyEvidence`
```typescript
async function verifyEvidence(evidenceId: string): Promise<Evidence>
```
- **Auth:** `requireDecisionAccess(engagementId, "REVIEWER")`
- **Data:** Transitions evidence state Candidate → Verified

#### `linkEvidence`
```typescript
async function linkEvidence(evidenceId: string, targetType: LinkTargetType, targetId: string, linkType: LinkType, context: string): Promise<EvidenceLink>
```
- **Auth:** `requireDecisionAccess(engagementId, "OPERATOR")`
- **Data:** Creates evidence link
- **Returns:** Created link

### Finding Actions

#### `getFindings`
```typescript
async function getFindings(engagementId: string, filters?: FindingFilters): Promise<FindingWithEvidence[]>
```
- **Auth:** `requireDecisionAccess(engagementId, "VIEWER")`
- **Returns:** Findings with linked evidence and current state

#### `createFinding`
```typescript
async function createFinding(data: CreateFindingInput, signalId?: string, aiSuggestionId?: string): Promise<Finding>
```
- **Auth:** `requireDecisionAccess(engagementId, "REVIEWER")`
- **Data:** Creates finding, links to signal if provided, links evidence
- **Returns:** Created finding

#### `updateFinding`
```typescript
async function updateFinding(findingId: string, data: UpdateFindingInput): Promise<Finding>
```
- **Auth:** `requireDecisionAccess(engagementId, "REVIEWER")`
- **Data:** Updates finding fields
- **Returns:** Updated finding

#### `submitFindingForReview`
```typescript
async function submitFindingForReview(findingId: string): Promise<Finding>
```
- **Auth:** `requireDecisionAccess(engagementId, "REVIEWER")`
- **Data:** Validates evidence requirement, transitions Draft → ReviewReady
- **Guard:** Requires ≥1 verified evidence link

### Recommendation Actions

#### `getRecommendations`
```typescript
async function getRecommendations(engagementId: string, filters?: RecFilters): Promise<RecommendationWithDetails[]>
```
- **Auth:** `requireDecisionAccess(engagementId, "VIEWER")`
- **Returns:** Recommendations with finding, evidence chain, AI metadata

#### `createRecommendation`
```typescript
async function createRecommendation(findingId: string, data: CreateRecInput, aiSuggestionId?: string): Promise<Recommendation>
```
- **Auth:** `requireDecisionAccess(engagementId, "REVIEWER")`
- **Data:** Creates recommendation from finding
- **Returns:** Created recommendation

#### `submitRecommendationForApproval`
```typescript
async function submitRecommendationForApproval(recId: string): Promise<Recommendation>
```
- **Auth:** `requireDecisionAccess(engagementId, "REVIEWER")`
- **Data:** Transitions Draft → PendingApproval
- **Returns:** Updated recommendation

### Review Actions

#### `getReviewQueue`
```typescript
async function getReviewQueue(filters?: QueueFilters): Promise<ReviewItem[]>
```
- **Auth:** `requireUserContext("REVIEWER")`
- **Data:** Aggregates items pending review for current user, sorted by risk/materiality/deadline
- **Returns:** `{ id, targetType, targetId, summary, riskRating, materiality, deadline, createdAt, aiContributed }[]`

#### `submitReviewComment`
```typescript
async function submitReviewComment(targetType: ReviewTargetType, targetId: string, verdict: ReviewVerdict, rationale: string): Promise<ReviewRecord>
```
- **Auth:** `requireDecisionAccess(engagementId, "REVIEWER")`
- **Data:** Records review verdict with rationale
- **Returns:** Created review record

### Approval Actions

#### `getApprovalStatus`
```typescript
async function getApprovalStatus(recId: string): Promise<ApprovalStatusDetail>
```
- **Auth:** `requireDecisionAccess(engagementId, "VIEWER")`
- **Returns:** `{ status, requiredAuthority, currentApprover, approvalHistory }`

#### `approveRecommendation`
```typescript
async function approveRecommendation(recId: string): Promise<Approval>
```
- **Auth:** `requireDecisionAccess(engagementId, "MANAGER")` (authority check: risk tier matched)
- **Data:** Transitions PendingApproval → Approved, records approval
- **Guard:** Authority check against risk tier

#### `rejectRecommendation`
```typescript
async function rejectRecommendation(recId: string, rationale: string): Promise<Approval>
```
- **Auth:** `requireDecisionAccess(engagementId, "MANAGER")`
- **Data:** Transitions PendingApproval → Rejected, records rejection
- **Guard:** rationale.length > 20

### Publication Actions

#### `publishPackage`
```typescript
async function publishPackage(recId: string): Promise<PublishedRecommendation>
```
- **Auth:** `requireDecisionAccess(engagementId, "MANAGER")`
- **Data:** Freezes recommendation + evidence trace, generates immutable record
- **Guard:** Recommendation must be Approved
- **Returns:** Published record with access URL

#### `getPublished`
```typescript
async function getPublished(publicationId: string): Promise<PublishedDetail>
```
- **Auth:** None (public) or limited (access token)
- **Returns:** Client-facing published view

### Audit / Traceability Actions

#### `getAuditEvents`
```typescript
async function getAuditEvents(engagementId: string, filters?: EventFilters): Promise<AuditEvent[]>
```
- **Auth:** `requireDecisionAccess(engagementId, "REVIEWER")`
- **Returns:** Chronological event list with filters

#### `getTraceability`
```typescript
async function getTraceability(engagementId: string): Promise<TraceabilityGraph>
```
- **Auth:** `requireDecisionAccess(engagementId, "VIEWER")`
- **Returns:** Full traceability graph nodes + edges

#### `getForwardTrace`
```typescript
async function getForwardTrace(sourceType: string, sourceId: string): Promise<TraceabilityPath[]>
```
- **Auth:** `requireDecisionAccess(engagementId, "VIEWER")`
- **Returns:** Forward traversal paths

#### `getBackwardTrace`
```typescript
async function getBackwardTrace(targetType: string, targetId: string): Promise<TraceabilityPath[]>
```
- **Auth:** `requireDecisionAccess(engagementId, "VIEWER")`
- **Returns:** Backward traversal paths

### AI Assistance Actions

#### `aiDraftFinding`
```typescript
async function aiDraftFinding(signalId: string): Promise<AiFindingDraft>
```
- **Auth:** `requireDecisionAccess(engagementId, "REVIEWER")`
- **Data:** AI generates draft finding language from signal + evidence context
- **Returns:** AiFindingDraft with evidence citations

#### `aiDraftRecommendation`
```typescript
async function aiDraftRecommendation(findingId: string): Promise<AiRecommendationSuggestion>
```
- **Auth:** `requireDecisionAccess(engagementId, "REVIEWER")`
- **Data:** AI generates draft recommendation from finding + evidence chain
- **Returns:** AiRecommendationSuggestion with evidence trace

---

## Appendix: Database Schema Additions (Prisma)

The following models need to be added to `schema.prisma` alongside the existing Aqliya models:

```prisma
// AuditOS domain models — add to existing schema.prisma

model AuditClient {
  id                  String    @id @default(cuid())
  organizationId      String
  name                String
  industry            String?
  reportingFramework  String?   // IFRS, GAAP
  fiscalPeriodEnd     DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

model AuditEngagement {
  id                  String    @id @default(cuid())
  organizationId      String
  clientId            String
  client              AuditClient @relation(fields: [clientId], references: [id])
  fiscalPeriod        String    // e.g., "FY2025"
  engagementType      String    // full_audit, review, agreed_upon_procedures
  status              String    // Initialized, DataIntake, EvidenceCollection, etc.
  team                Json?     // Team assignments [{userId, role}]
  governanceRules     Json?     // Engagement-specific governance overrides
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  trialBalances       TrialBalance[]
  accounts            AuditAccount[]
  evidence            AuditEvidence[]
  findings            AuditFinding[]
  recommendations     AuditRecommendation[]
  auditEvents         AuditEvent[]
}

model TrialBalance {
  id              String    @id @default(cuid())
  engagementId    String
  engagement      AuditEngagement @relation(fields: [engagementId], references: [id])
  importTimestamp  DateTime  @default(now())
  sourceFile      String
  fileHash        String
  trustState      String    // trusted, conditionally_trusted, blocked
  parsedData      Json?
  createdAt       DateTime  @default(now())

  accounts        AuditAccount[]
}

model AuditAccount {
  id              String    @id @default(cuid())
  trialBalanceId  String
  trialBalance    TrialBalance @relation(fields: [trialBalanceId], references: [id])
  code            String
  name            String
  debitBalance    Float?
  creditBalance   Float?
  accountType     String?
  currency        String    @default("SAR")
  createdAt       DateTime  @default(now())

  mapping         AccountMapping?
  evidenceLinks   EvidenceLink[]
  signals         AuditSignal[]
}

model CanonicalAccount {
  id                String   @id @default(cuid())
  code              String
  name              String
  category          String   // asset, liability, equity, revenue, expense
  statementType     String   // balance_sheet, income_statement
  reportingFramework String  // IFRS, GAAP
  version           String   // e.g., "1.0.0"
  parentId          String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model AccountMapping {
  id                String   @id @default(cuid())
  accountId         String   @unique
  account           AuditAccount @relation(fields: [accountId], references: [id])
  canonicalAccountId String
  canonicalAccount  CanonicalAccount @relation(fields: [canonicalAccountId], references: [id])
  mappingType       String   // ai_suggested, human_mapped
  mappedById        String
  mappedAt          DateTime @default(now())
  aiSuggestionId    String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model ValidationResult {
  id              String   @id @default(cuid())
  engagementId    String
  validationType  String   // structural, balance, classification, period, ratio
  status          String   // passed, failed, warning
  summary         String
  details         Json     // ValidationDetail[]
  validatedById   String
  validatedAt     DateTime @default(now())
  createdAt       DateTime @default(now())
}

model AnomalyFlag {
  id              String   @id @default(cuid())
  engagementId    String
  accountId       String?
  account         AuditAccount? @relation(fields: [accountId], references: [id])
  flagType        String
  description     String
  severity        String   // info, warning, error
  disposition     String?  // accepted, investigated, dismissed
  disposedById    String?
  disposedAt      DateTime?
  createdAt       DateTime @default(now())
}

model AuditEvidence {
  id              String   @id @default(cuid())
  engagementId    String
  engagement      AuditEngagement @relation(fields: [engagementId], references: [id])
  filename        String
  fileHash        String
  fileType        String
  storageKey      String
  fileSize        Int
  uploadTimestamp DateTime @default(now())
  uploaderId      String
  evidenceState   String   @default("candidate") // candidate, verified, insufficient, rejected, accepted, referenced
  verifiedById    String?
  verifiedAt      DateTime?
  version         Int      @default(1)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  links           EvidenceLink[]
}

model EvidenceLink {
  id          String   @id @default(cuid())
  evidenceId  String
  evidence    AuditEvidence @relation(fields: [evidenceId], references: [id])
  targetType  String   // account, finding
  targetId    String
  linkType    String   // supports, contradicts, context
  context     String?
  createdById String
  createdAt   DateTime @default(now())
}

model AuditSignal {
  id              String   @id @default(cuid())
  engagementId    String
  accountId       String?
  account         AuditAccount? @relation(fields: [accountId], references: [id])
  signalType      String
  description     String
  confidence      Float
  aiSuggestionId  String?
  status          String   @default("open") // open, triaged, converted
  createdAt       DateTime @default(now())
}

model AuditFinding {
  id              String   @id @default(cuid())
  engagementId    String
  engagement      AuditEngagement @relation(fields: [engagementId], references: [id])
  findingType     String   // material_misstatement, control_deficiency, disclosure_gap, observation
  description     String
  materialityLevel String  // immaterial, material, pervasive
  riskRating      String   // low, medium, high, critical
  state           String   @default("draft") // draft, review_ready, in_review, approved, published, escalated, withdrawn
  signalId        String?
  createdById     String
  version         Int      @default(1)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  recommendations AuditRecommendation[]
}

model AuditRecommendation {
  id                String   @id @default(cuid())
  findingId         String
  finding           AuditFinding @relation(fields: [findingId], references: [id])
  description       String
  recommendedAction String
  impactAssessment  String?
  deadline          DateTime?
  responsibleParty  String?
  aiContributed     Boolean  @default(false)
  aiSuggestionId    String?
  state             String   @default("draft") // draft, pending_approval, approved, rejected, published
  createdById       String
  version           Int      @default(1)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  approvals         AuditApproval[]
  publications      PublishedRecommendation[]
}

model AuditApproval {
  id                String   @id @default(cuid())
  recommendationId  String
  recommendation    AuditRecommendation @relation(fields: [recommendationId], references: [id])
  approverId        String
  action            String   // accepted, modified, rejected
  rationale         String?
  createdAt         DateTime @default(now())
}

model PublishedRecommendation {
  id                String   @id @default(cuid())
  recommendationId  String   @unique
  recommendation    AuditRecommendation @relation(fields: [recommendationId], references: [id])
  publishedAt       DateTime @default(now())
  publishedById     String
  accessUrl         String?
  status            String   @default("published") // published, superseded
  clientVisible     Boolean  @default(true)
  createdAt         DateTime @default(now())
}

model AuditEvent {
  id              String   @id @default(cuid())
  eventType       String
  actorId         String
  tenantId        String
  targetType      String
  targetId        String
  previousState   String?
  newState        String
  evidenceRefs    String[] // UUID array
  metadata        Json?
  sequence        Int
  eventHash       String
  previousEventHash String?
  timestamp       DateTime @default(now())
  createdAt       DateTime @default(now())

  @@index([tenantId, eventType, timestamp])
  @@index([targetType, targetId])
}

model AiSuggestion {
  id              String   @id @default(cuid())
  suggestionType  String   // mapping, signal, finding, recommendation
  targetType      String
  targetId        String
  content         Json
  modelVersion    String
  inputHash       String
  confidence      Float
  acceptedById    String?
  acceptedAt      DateTime?
  rejectedById    String?
  rejectedAt      DateTime?
  createdAt       DateTime @default(now())
}
```
