# SPEC-02d: UX Specification — Engagement Management

> **Status:** Draft v0.1 | **Date:** 2026-06-28
> **Program:** CPV-001 | **Template:** SPEC-01d (inherited)
> **Focus:** AuditOS-specific UX pressure points — 4-level review UI, revision cycles, evidence chain display

---

## Inherited Without Change (Engineering Standard)

| Element | Source | Status |
|---|---|---|
| Universal UX State Model (10 states) | SPEC-01d §1 | ✅ Inherited |
| ViewModel Layer (pure functions, zero Domain types) | SPEC-01d §10 | ✅ Inherited |
| Permission-based UI (server-driven) | SPEC-01d §11 | ✅ Inherited |
| AI State Model (pending/ready/approved/rejected) | SPEC-01d §7 | ✅ Inherited |
| Accessibility Contract | SPEC-01d §13 | ✅ Inherited |
| Navigation State Model | SPEC-01d §15 | ✅ Inherited |
| Design Tokens Boundary | SPEC-01d §14 | ✅ Inherited |
| Loading/Error/Empty states | SPEC-01d §9 | ✅ Inherited |
| Arabic-first UX | SPEC-01d §16 | ✅ Inherited |

---

## 5 UX Hypothesis Tests (AuditOS)

| # | Hypothesis | Test |
|---|---|---|
| UX-01 | ViewModel stays Domain-independent despite complex review screens | ViewModel outputs are primitives, not Domain types |
| UX-02 | Server-driven permissions support 4-level review without UI logic | UI never checks review authority — server returns allowed actions |
| UX-03 | Timeline renders revision cycles without business logic | Timeline is a chronological display — no workflow rules in UI |
| UX-04 | Evidence chain is read-only — UI never mutates evidence | No evidence edit/delete buttons in evidence panels |
| UX-05 | Workflow loop reflects visually without UI enforcing rules | Stage progress shows current revision — transition buttons call server, never enforce domain rules |

---

## Screens

| Screen | States | New for AuditOS |
|---|---|---|
| **Engagement List** | loading, empty, data, error, permission_denied | — |
| **Engagement Detail** | loading, not_found, data, error | **Revision cycle timeline** |
| **Review Panel** | data, permission_denied, governance_blocked | **4-level review hierarchy** |
| **Workpaper Evidence** | loading, empty, data, error | **Read-only chain (UX-04)** |
| **Findings Panel** | loading, empty, data | Linked to revision cycles |
| **Sign-off Panel** | data, governance_blocked | Quality review gate |

---

## UX-01: ViewModel Independence

Engagement ViewModels follow the same pattern — no Domain types in UI:

```typescript
interface EngagementRowViewModel {
  id: string;
  clientName: string;
  period: string;
  status: string;        // primitive, not enum
  currentStage: StageProgressViewModel;
  reviewLevel: string;   // current review level, primitive
  slaStatus: SLAStatusViewModel | null;
  allowedActions: string[];
}

interface StageProgressViewModel {
  stages: StageProgressItem[];
  currentStageIndex: number;
  currentRevision: number;  // AuditOS-specific
  revisionCycle: "first" | "revision_n";  // visual indicator
}
```

**Assertion:** ViewModel has zero references to Engagement aggregate types.

---

## UX-02: Server-Driven Permissions (4 levels)

```typescript
// getAllowedActionsAction — same pattern as SPEC-01d §11
const allowedActions = await getAllowedEngagementActions(engagementId);
// Returns: ["view", "edit", "review_senior", "review_manager", "review_partner", "sign_off"]
// UI renders buttons based on list — never checks review hierarchy
```

| UI Element | Sales Rep (SalesOS) | Auditor | Manager | Partner | Quality |
|---|---|---|---|---|---|
| View Engagement | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Fields | ❌ | ✅ | ✅ | ✅ | ❌ |
| Submit for Review | ❌ | ✅ | ❌ | ❌ | ❌ |
| Return to Fieldwork | ❌ | ❌ | ✅ | ✅ | ❌ |
| Approve Review | ❌ | ❌ | ✅ (manager) | ✅ (partner) | ❌ |
| Sign Off | ❌ | ❌ | ❌ | ✅ | ❌ |
| Quality Review | ❌ | ❌ | ❌ | ❌ | ✅ (recommend) |

**Rule:** The UI receives `allowedActions` from the server. It never checks role permissions itself.

---

## UX-03: Revision Cycle Timeline

The engagement timeline must render revision cycles visually without any workflow logic:

```typescript
interface TimelineViewModel {
  items: TimelineItem[];
}

interface TimelineItem {
  type: "stage_change" | "revision_start" | "review_decision" | "evidence_linked";
  labelAr: string;
  labelEn: string;
  timestamp: string;
  actorName: string;
  revisionNumber?: number;  // which revision cycle this belongs to
}
```

**Rules:**
- Timeline groups items by `revisionNumber`
- Each revision cycle is visually distinct
- Timeline is a chronological display only — no workflow rules in UI
- UI receives timeline as ViewModel — no raw Domain Events

---

## UX-04: Evidence Chain (Read-Only)

AuditOS evidence chain is displayed as a hierarchical read-only view:

```typescript
interface EvidenceChainViewModel {
  chain: EvidenceNodeViewModel[];
}

interface EvidenceNodeViewModel {
  id: string;
  label: string;
  type: string;
  linkedAt: string;
  linkedBy: string;
  children?: EvidenceNodeViewModel[];  // chain hierarchy
}
```

**Rules:**
| What UI CAN do | What UI CANNOT do |
|---|---|
| View evidence chain | Edit evidence content |
| Expand/collapse chain nodes | Delete evidence |
| Open evidence source (read-only) | Change chain-of-custody metadata |
| See evidence type and date | Move evidence between chains |
| Show evidence required indicator | Set retention flags |

**Assertion:** UI has zero evidence mutation capabilities.

---

## UX-05: Workflow Loop Visual

The stage progress component shows revision cycles:

| Visual Element | Behavior |
|---|---|
| Current revision | "Fieldwork (Revision #2)" label |
| Loop indicator | Arrow from InReview → Fieldwork shows return path |
| Review decision markers | Each review cycle shows its decision: approved / revision_required |
| SLA per revision | Each revision has its own SLA progress bar |
| Stage navigation | Only forward transitions callable — loop transitions go through server |

**Rule:** The UI does NOT enforce loop rules. It only displays the current state. The server validates all transitions.

---

## Arabic-First UX

| Term | Arabic |
|---|---|
| Engagement | مهمة تدقيق |
| Revision | مراجعة تصحيحية |
| Review | مراجعة فنية |
| Fieldwork | العمل الميداني |
| Findings | نتائج المراجعة |
| Sign-off | اعتماد نهائي |
| Quality Review | مراجعة الجودة |

---

## Traceability

| SPEC-02d Element | Template (SPEC-01d) | AuditOS-specific |
|---|---|---|
| ViewModel Layer | ✅ §10 — inherited | revisionNumber in StageProgressVM |
| Permission UI | ✅ §11 — inherited | 4-level review matrix |
| AI States | ✅ §7 — inherited | — |
| Timeline | ❌ New | Revision cycle grouping |
| Evidence Chain | ❌ New | Read-only hierarchical chain |
| RTL / Arabic | ✅ §16 — inherited | AuditOS glossary |

---

## Document Metadata

- **Author:** OpenCode | **Program:** CPV-001
- **Version:** 0.1 | **Template:** SPEC-01d
- **Template Reuse:** ~90% (10% new: timeline + evidence chain)
- **Status:** Draft — ready for review
